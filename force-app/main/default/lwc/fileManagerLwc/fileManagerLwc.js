import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadStyle } from 'lightning/platformResourceLoader';
import getFileInfos from '@salesforce/apex/FileManagerController.getFileInfos';
import deleteSelectedFiles from '@salesforce/apex/FileManagerController.deleteSelectedFiles';
import removeFileFromRecord from '@salesforce/apex/FileManagerController.removeFileFromRecord';
import fileManagerStyle from '@salesforce/resourceUrl/fileManagerStyle';
import {VIEW_LABEL, SUCCESS_MESSAGE, ERROR_MESSAGE_FETCH, ERROR_MESSAGE_DELETE, ERROR_MESSAGE_REMOVE, VIEW_URL, EDIT_LABEL, REMOVE_FROM_RECORD, COMMUNITY_COLUMNS, RECORD_PAGE_COLUMNS} from './constants.js'
import {formatContentSize, formatDate} from './utils.js'

export default class FileManagerLwc extends NavigationMixin(LightningElement) {
    /** Local Properties */
    _title = 'Files';
    showFileModal = false;
    showDeleteModal = false
    showRemoveFileModal = false
    files = [];             // Holds file information for display in the datatable
    selectedFileIds = [];   // Stores selected file IDs for download
    selectedContentDocumentIds = [] // Stores selected contentDocument IDs for deletion
    selectedRowId = ''
    error = '';             // Error message to display if the fetch operation fails
    filesLoaded = false;    // Flag indicating whether files have been successfully loaded
    showSpinner = true;  
    acceptedFormats = ['.pdf', '.png']

    /** Global Properties */
    @api allowDelete = false;
    @api allowDownload = false;
    @api allowUpload = false;
    @api recordId;    
    @api objectApiName;          
    @api showRefreshIcon = false;
    @api multiple = false;
    @api allowPreview = false;
    @api isCommunity = false;
    @api showOwnerName = false;
    @api showFileType = false;
    @api showFileSize = false;
    @api showLastModified = false;
    @api allowFileEditDetail = false;
    @api allowRemove = false;
    @api showNumberOfRecords = 5
    @api 
    set title(data) {
        this._title = data;
    }
    
    get title() {
        return this.files?.length > 0 ? `${this._title} (${this.files?.length})` : this._title;
    }

    get titleUrl(){
        return this.isCommunity ? 'javascript:void(0);' : `/lightning/r/${this.objectApiName}/${this.recordId}/related/AttachedContentDocuments/view`
    }

    @api 
    set format(data) {
        this.acceptedFormats = data?.split(',')?.map(type => `.${type}`);
    }

    get format() {
        return this.acceptedFormats;
    }

    get downloadLinkClass(){
        return `slds-button slds-m-right_x-small slds-button_neutral ${!this.isDownloadEnabled ? 'disabled':''} `
    }

    get isDeleteDisabled(){
        return !this.isDeleteEnabled
    }

    get showViewAll(){
        return !this.isCommunity && this.files?.length > 0
    }

    /** Datatable columns configuration */
    @track columns = [];

    /** Lifecycle hook to fetch files when the component is initialized */
    connectedCallback() {
        loadStyle(this, fileManagerStyle)
       
        if(this.isCommunity){
             this.columns =  COMMUNITY_COLUMNS
        } else {
             this.columns =  this.allowPreview ? RECORD_PAGE_COLUMNS : COMMUNITY_COLUMNS
        }
       
     
        this.generateColumns()
        this.fetchFileInfos();  // Calls the method to fetch files on component load
    }

    generateColumns(){
        if(this.showOwnerName){
            if(this.isCommunity){
                this.columns.push({ label: 'Owner Name', fieldName: 'ownerName', initialWidth: 180})
            } else {
                this.columns.push({ label: 'Owner Name', fieldName: 'ownerUrl', type: 'url',initialWidth: 180, typeAttributes: {label: { fieldName: 'ownerName' }}})
            }
            
        }
        if(this.showFileType){
            this.columns.push({ label: 'File Type', fieldName: 'fileType', initialWidth: 120 })
        }
        if(this.showFileSize){
            this.columns.push({ label: 'File Size', fieldName: 'fileSize', initialWidth: 120 })
        }
        if(this.showLastModified){
            this.columns.push({ label: 'Last Modified', fieldName: 'formattedLastModifiedDate', initialWidth: 180 })
        }
        const ACTIONS = [];
        if(this.allowPreview){
            ACTIONS.push({ label: 'View', name: VIEW_LABEL})
        }
        if(this.allowFileEditDetail){
            ACTIONS.push({ label: 'Edit File Details', name: EDIT_LABEL})
        }
        if(this.allowRemove){
            ACTIONS.push({ label: 'Remove from Record', name: REMOVE_FROM_RECORD})

        }
        if(ACTIONS.length){
            this.columns.push({
                type: 'action',
                typeAttributes: {
                    rowActions: ACTIONS,
                    menuAlignment: 'auto'
                },
                initialWidth: 80
            })
        }
    }
    handleAnchorClick(event) {
        // Prevent the default anchor behavior if on a community page
        if (this.isCommunity) {
            event.preventDefault();
        }
    }
    /** Fetches file information associated with the recordId */
    fetchFileInfos() {
        this.showSpinner = true; // Show the spinner while data is being fetched
        getFileInfos({ recordId: this.recordId }) // Apex call to fetch file information
            .then(result => {
                this.files = result.map(file => ({
                    ...file,
                    viewLabel: VIEW_LABEL,
                    viewUrl: `${VIEW_URL}${file.contentDocumentId}/view`, // Generate view URL for the file
                    fileSize: formatContentSize(file.contentSize), // Format file size for display
                    formattedLastModifiedDate: formatDate(file.lastModifiedDate),
                    ownerUrl: this.isCommunity ? '' : `/lightning/r/${file.ownerId}/view`
                }));
                this.selectedFileIds = []
                this.selectedContentDocumentIds = []
                this.error = undefined; // Clear any previous error message if data is successfully fetched
            })
            .catch(error => {
                console.error("Error ==>", error)
                this.error = ERROR_MESSAGE_FETCH;  // Set a user-friendly error message
            })
            .finally(() => {
                this.filesLoaded = true; // Set the filesLoaded flag to true when the data is fetched
                this.showSpinner = false; // Hide the spinner once the data has finished loading
            });
    }

    /** Handles row selection in the datatable and updates selected file IDs */
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedFileIds = selectedRows.map(row => row.fileId);  // Extract file IDs from selected rows
        this.selectedContentDocumentIds = selectedRows.map(row => row.contentDocumentId);  // Extract CD IDs from selected rows
    }

    /** Getter to determine if the download button should be enabled */
    get isDownloadEnabled() {
        return this.allowDownload && this.selectedFileIds.length > 0;  // Enable download if there are selected files
    }

    get isDeleteEnabled() {
        return this.allowDelete && this.selectedFileIds.length > 0;
    }

    get isFileUploadEnabled() {
        return this.allowUpload;
    }

    /** Getter to generate the download link for selected files */
    get downloadLink() {
        const concatenatedIds = this.selectedFileIds.join('/');
        return `/sfc/servlet.shepherd/version/download/${concatenatedIds}`;  // Generate the download URL
    }
    
    /** Getter to show the datatable checkbox */
    get showTableCheckbox(){
        return this.allowDownload || this.allowDelete;
    }

    /** Handles row action events (e.g., "View" action) from the datatable */
    callRowAction(event) {
        console.log("event.detail.row", event.detail.row)
        this.selectedRowId = event.detail.row.contentDocumentId;  // Get the ContentDocumentId of the clicked row
        const actionName = event.detail.action.name;  // Get the action name (in this case, 'View')
        if (actionName === VIEW_LABEL) {
            this.previewHandler(this.selectedRowId);  
        }
        if (actionName === EDIT_LABEL) {
            this.editFileDetailsHandler();  
        }
        if (actionName === REMOVE_FROM_RECORD) {
            this.showRemoveFileModal = true  
        }
    }

   
   
    removeFromRecordHandler(){
        removeFileFromRecord({fileId:this.selectedRowId, recordId:this.recordId}).then(result => {
                this.error = undefined; // Clear any previous error message\
            })
            .catch(error => {
                console.error("Error Remove From Record --> ", error)
                this.error = ERROR_MESSAGE_REMOVE;  // Set a user-friendly error message
            })
            .finally(() => {
                this.filesLoaded = true; // Set the filesLoaded flag to true when the data is fetched
                this.showSpinner = false; // Hide the spinner once the data has finished loading
                
            });
    }

    /** Navigates to the file preview page using the NavigationMixin */
    previewHandler(contentDocumentId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'  // Navigates to the file preview page
            },
            state: {
                selectedRecordId: contentDocumentId  // Pass the ContentDocumentId to preview the selected file
            }
        });
    }

    editFileDetailsHandler() {
        // View a custom object record.
        this[NavigationMixin.Navigate]({
        type: "standard__recordPage",
        attributes: {
            recordId:this.selectedRowId,
            actionName: "view",
        },
        });
    }

    

    /** Handles file upload finish event */
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files
        console.log("uploadedFiles", uploadedFiles)
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Success!",
                message: SUCCESS_MESSAGE,
                variant: "success"
            })
        );
        this.showFileModal = false;
        this.fetchFileInfos();
    }

    /** Opens the modal for adding files */
    handleAddFiles() {
        this.showFileModal = true;
    }

    /** Closes the modal for adding files */
    closeFileModal() {
        this.showFileModal = false;
    }

    showDeleteModalHandler(){
        this.showDeleteModal = true
    }
    closeDeleteModal(){
        this.showDeleteModal = false
    }

     closeRemoveModal(){
        this.selectedRowId = ''
        this.showRemoveFileModal = false
    }

    /** Deletes selected files */
    deleteHandler() {
        this.showSpinner = true; // Show the spinner while data is being fetched
        let fileIds = this.selectedContentDocumentIds
        this.deleteFileHandler(fileIds)
    }

    deleteFileHandler(fileIds){
         deleteSelectedFiles({ fileIds: fileIds }) // Apex call to delete file information
            .then(result => {
                this.error = undefined; // Clear any previous error message
                this.fetchFileInfos();
            })
            .catch(error => {
                console.error("Error ==>", error)
                this.error = ERROR_MESSAGE_DELETE;  // Set a user-friendly error message
            })
            .finally(() => {
                this.filesLoaded = true; // Set the filesLoaded flag to true when the data is fetched
                this.showSpinner = false; // Hide the spinner once the data has finished loading
                this.showDeleteModal = false
            });
    }

    
}