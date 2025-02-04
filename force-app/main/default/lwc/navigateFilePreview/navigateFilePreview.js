import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class NavigateFilePreview extends NavigationMixin(LightningElement) {
    @api recordId;
    @api label;

    navigate(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'  // Navigates to the file preview page
            },
            state: {
                selectedRecordId: this.recordId  // Pass the ContentDocumentId to preview the selected file
            }
        });
    }
}