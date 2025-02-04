/** Constants */
export const SUCCESS_MESSAGE = "All files uploaded successfully!";
export const ERROR_MESSAGE_FETCH = 'An error occurred while fetching the file information. Please try again later.';
export const ERROR_MESSAGE_DELETE = 'An error occurred while deleting the file(s). Please try again later.';
export const ERROR_MESSAGE_REMOVE = 'An error occurred while removing the file. Please try again later.';

export const VIEW_URL = '/lightning/r/ContentDocument/';
export const DELETE_LABEL = 'DELETE'
export const VIEW_LABEL = 'VIEW';
export const EDIT_LABEL = 'EDIT';
export const REMOVE_FROM_RECORD = 'REMOVE_FROM_RECORD'
export const COMMUNITY_COLUMNS = [
        { label: 'File Name', fieldName: 'fileName' }
    ]
export const RECORD_PAGE_COLUMNS = [
            {
                label: 'File Name',
                type: 'navigateFilePreview',
                fieldName: "fileName",
                typeAttributes: {
                    label: { fieldName: 'fileName' },
                    fileId: { fieldName: 'contentDocumentId'}
                }
            }
        ]