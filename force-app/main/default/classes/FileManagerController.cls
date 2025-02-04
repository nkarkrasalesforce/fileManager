/**
 * @File Name       : FileManagerController.cls
 * @Description     : This class retrieves file information associated with a Salesforce record, including file type, size, owner, 
 *                    and last modified date, and formats it into a list of FileInfo objects for use in Lightning components. 
 *                    It ensures only the latest file versions are included and also provides functionality to delete selected files.
 * @Author          : 
 * @Last Modified By: 
 * @Last Modified On: December 16, 2024
 * @Modification Log:
 * ==============================================================================
 * Ver | Date           | Author       | Modification
 * ==============================================================================
 * 1.0 | December 16, 2024 |           | Initial Version
 */

 public with sharing class FileManagerController {

    // Static constants for error messages to ensure consistency and maintainability.
    public static final String ERROR_BLANK_RECORD_ID = 'Record ID cannot be null or blank.';
    public static final String ERROR_NO_FILES_SELECTED = 'No files selected for deletion.';
    public static final String ERROR_FETCH_FILE_DETAILS = 'An error occurred while fetching file details. Please try again later.';
    public static final String ERROR_UNEXPECTED = 'An unexpected error occurred. Please contact support.';
    public static final String ERROR_DELETE_FILES = 'An error occurred while deleting the selected files. Please try again later.';
   public static final String ERROR_REMOVE_FILE = 'An error occurred while removing the file from the record. Please try again later.';

    /**
     * @description Inner class to represent file details for use in Lightning components.
     */
    public class FileInfo {
        @AuraEnabled public Id fileId; // The ID of the file (ContentVersion ID).
        @AuraEnabled public String fileName; // The name of the file.
        @AuraEnabled public Id contentDocumentId; // The ID of the associated ContentDocument.
        @AuraEnabled public String fileType; // The type of the file (e.g., PDF, PNG).
        @AuraEnabled public Decimal contentSize; // The size of the file in bytes.
        @AuraEnabled public String ownerName; // The name of the file owner.
        @AuraEnabled public Id ownerId; // The name of the file owner.
        @AuraEnabled public DateTime lastModifiedDate; // The last modified date of the file.

        /**
         * Constructor to initialize the FileInfo object.
         *
         * @param fileId             ID of the file (ContentVersion ID).
         * @param fileName           Name of the file.
         * @param contentDocumentId  ID of the associated ContentDocument.
         * @param fileType           Type of the file.
         * @param contentSize        Size of the file in bytes.
         * @param ownerName          Name of the file owner.
         * @param lastModifiedDate   Last modified date of the file.
         */
        public FileInfo(Id fileId, String fileName, Id contentDocumentId, String fileType, Decimal contentSize, String ownerName,Id ownerId, DateTime lastModifiedDate) {
            this.fileId = fileId;
            this.fileName = fileName;
            this.contentDocumentId = contentDocumentId;
            this.fileType = fileType;
            this.contentSize = contentSize;
            this.ownerName = ownerName;
            this.ownerId = ownerId;
            this.lastModifiedDate = lastModifiedDate;
        }
    }

    /**
     * Retrieves file information associated with the given record ID.
     *
     * @param recordId ID of the record for which file information is to be retrieved.
     * @return A list of FileInfo objects representing the files linked to the record.
     * @throws AuraHandledException if the recordId is blank or an error occurs during execution.
     */
    @AuraEnabled
    public static List<FileInfo> getFileInfos(String recordId) {
        List<FileInfo> fileInfos = new List<FileInfo>(); // List to store file details.

        // Validate input to ensure recordId is not blank.
        if (String.isBlank(recordId)) {
            System.debug('Record ID is null or blank');
            AuraHandledException ae = new AuraHandledException(ERROR_BLANK_RECORD_ID);
            ae.setMessage(ERROR_BLANK_RECORD_ID);
            throw ae;
        }

        try {
            // Fetch ContentDocumentLink records linked to the given record ID.
            List<ContentDocumentLink> contentLinks = [
                SELECT ContentDocumentId, ContentDocument.Title
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :recordId
            ];

            // Collect ContentDocument IDs from the ContentDocumentLink records.
            Set<Id> contentDocumentIds = new Set<Id>();
            for (ContentDocumentLink cdl : contentLinks) {
                contentDocumentIds.add(cdl.ContentDocumentId);
            }

            // Fetch latest ContentVersion details for the collected ContentDocument IDs.
            if (!contentDocumentIds.isEmpty()) {
                for (ContentVersion cv : [
                    SELECT Id, Title, ContentDocumentId, FileType, ContentSize, ContentDocument.Owner.Name, ContentDocument.Owner.Id, LastModifiedDate
                    FROM ContentVersion
                    WHERE isLatest = true AND ContentDocumentId IN :contentDocumentIds ORDER BY LastModifiedDate DESC
                ]) {
                    // Add the retrieved details to the FileInfo list.
                    fileInfos.add(new FileInfo(
                        cv.Id,
                        cv.Title,
                        cv.ContentDocumentId,
                        cv.FileType,
                        cv.ContentSize,
                        cv.ContentDocument.Owner.Name,
                        cv.ContentDocument.Owner.Id,
                        cv.LastModifiedDate
                    ));
                }
            } else {
                System.debug('No ContentDocumentIds found for the given record.');
            }
        } catch (QueryException qe) {
            // Handle query-specific exceptions and log the error.
            System.debug('QueryException: ' + qe.getMessage());
            throw new AuraHandledException(ERROR_FETCH_FILE_DETAILS);
        } catch (Exception e) {
            // Handle unexpected exceptions and log the error.
            System.debug('Exception: ' + e.getMessage());
            throw new AuraHandledException(ERROR_UNEXPECTED);
        }

        return fileInfos; // Return the list of FileInfo objects.
    }

    /**
     * Deletes the selected files based on the provided file IDs.
     *
     * @param fileIds List of file IDs to delete.
     * @throws AuraHandledException if the fileIds list is null/empty or an error occurs during deletion.
     */
    @AuraEnabled
    public static void deleteSelectedFiles(List<Id> fileIds) {
        // Validate input to ensure fileIds is not null or empty.
        if (fileIds == null || fileIds.isEmpty()) {
            AuraHandledException ae = new AuraHandledException(ERROR_NO_FILES_SELECTED);
            ae.setMessage(ERROR_NO_FILES_SELECTED);
            throw ae;
        }

        try {
            // Delete ContentDocument records for the provided file IDs.
            delete [SELECT Id FROM ContentDocument WHERE Id IN :fileIds];
        } catch (DmlException dmlEx) {
            // Handle DML-specific exceptions and log the error.
            System.debug('DmlException: ' + dmlEx.getMessage());
            throw new AuraHandledException(ERROR_DELETE_FILES);
        } catch (Exception e) {
            // Handle unexpected exceptions and log the error.
            System.debug('Exception: ' + e.getMessage());
            throw new AuraHandledException(ERROR_UNEXPECTED);
        }
    }
    @AuraEnabled
    public static void removeFileFromRecord(Id fileId, Id recordId) {
        // Validate input to ensure fileId and recordId are not blank.
        if (String.isBlank(fileId) || String.isBlank(recordId)) {
            AuraHandledException ae = new AuraHandledException(ERROR_BLANK_RECORD_ID);
            ae.setMessage('File ID and Record ID cannot be null or blank.');
            throw ae;
        }

        try {
            // Query the ContentDocumentLink for the specified file and record.
            ContentDocumentLink linkToRemove = [
                SELECT Id
                FROM ContentDocumentLink
                WHERE ContentDocumentId = :fileId AND LinkedEntityId = :recordId
                LIMIT 1
            ];

            // Delete the ContentDocumentLink to remove the association.
            delete linkToRemove;
        } catch (QueryException qe) {
            // Handle query-specific exceptions.
            System.debug('QueryException: ' + qe.getMessage());
            throw new AuraHandledException(ERROR_REMOVE_FILE);
        } catch (Exception e) {
            // Handle unexpected exceptions.
            System.debug('Exception: ' + e.getMessage());
            throw new AuraHandledException(ERROR_UNEXPECTED);
        }
    }
}