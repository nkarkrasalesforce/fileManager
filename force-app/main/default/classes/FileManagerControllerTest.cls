@isTest
private class FileManagerControllerTest {

    @TestSetup
    static void setupTestData() {
        // Create a test Account to link files to
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Create test content versions
        List<ContentVersion> contentVersions = new List<ContentVersion>();

        // Create multiple test files
        for (Integer i = 0; i < 3; i++) {
            ContentVersion cv = new ContentVersion(
                Title = 'Test File ' + i,
                PathOnClient = 'TestFile' + i + '.txt',
                VersionData = Blob.valueOf('Test Content ' + i),
                IsMajorVersion = true
            );
            contentVersions.add(cv);
        }
        insert contentVersions;

        // Retrieve the content documents for the inserted versions
        List<ContentVersion> insertedVersions = [
            SELECT Id, ContentDocumentId 
            FROM ContentVersion 
            WHERE Id IN :contentVersions
        ];

        // Create content document links
        List<ContentDocumentLink> contentLinks = new List<ContentDocumentLink>();
        for (ContentVersion cv : insertedVersions) {
            ContentDocumentLink cdl = new ContentDocumentLink(
                LinkedEntityId = testAccount.Id,
                ContentDocumentId = cv.ContentDocumentId,
                ShareType = 'V'
            );
            contentLinks.add(cdl);
        }
        insert contentLinks;
    }

    @isTest
    static void testGetFileInfos_Positive() {
        // Retrieve the test account
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];

        // Test method execution
        Test.startTest();
        List<FileManagerController.FileInfo> fileInfos = FileManagerController.getFileInfos(testAccount.Id);
        Test.stopTest();

        // Assertions
        System.assertNotEquals(0, fileInfos.size(), 'Should return file information');
        System.assertEquals(3, fileInfos.size(), 'Should return 3 files');

        // Validate file info properties
        for (FileManagerController.FileInfo fileInfo : fileInfos) {
            System.assert(fileInfo.fileId != null, 'File ID should not be null');
            System.assert(fileInfo.fileName != null, 'File name should not be null');
            System.assert(fileInfo.contentDocumentId != null, 'Content Document ID should not be null');
        }
    }

   @isTest
static void testGetFileInfos_NullRecordId() {
    // Test null record ID scenario
    Test.startTest();
    try {
        FileManagerController.getFileInfos(null);
        System.assert(false, 'Should have thrown an AuraHandledException');
    } catch (AuraHandledException e) {
        // Ensure the exception message matches exactly
        System.assert(e.getMessage().contains('Record ID cannot be null or blank.'), 
            'Error message should indicate null or blank record ID');
    }
    Test.stopTest();
}

    @isTest
    static void testDeleteSelectedFiles_Positive() {
        // Retrieve the content document IDs to delete
        List<ContentDocument> docsToDelete = [
            SELECT Id 
            FROM ContentDocument 
            LIMIT 2
        ];
        List<Id> docIds = new List<Id>();
        for (ContentDocument doc : docsToDelete) {
            docIds.add(doc.Id);
        }

        // Test method execution
        Test.startTest();
        FileManagerController.deleteSelectedFiles(docIds);
        Test.stopTest();

        // Verify deletion by ensuring ContentDocumentLink records are deleted
        List<ContentDocumentLink> remainingLinks = [
            SELECT Id 
            FROM ContentDocumentLink 
            WHERE ContentDocumentId IN :docIds
        ];
        System.assertEquals(0, remainingLinks.size(), 'Selected documents should be unlinked');
    }

    @IsTest
    static void testDeleteSelectedFilesEmptyList() {
        List<Id> emptyList = new List<Id>();
            Test.startTest();
            try {
                FileManagerController.deleteSelectedFiles(emptyList);
                System.assert(false, 'Expected an exception for empty list');
            } catch (AuraHandledException ex) {
                Assert.areEqual('No files selected for deletion.', ex.getMessage());
            }
            Test.stopTest();
    }

   @isTest
static void testDeleteSelectedFiles_NullList() {
    // Test null file list scenario
    Test.startTest();
    try {
        // Passing a null list should throw an AuraHandledException
        FileManagerController.deleteSelectedFiles(null);
        
        // If no exception is thrown, fail the test
        System.assert(false, 'Should have thrown an AuraHandledException');
    } catch (AuraHandledException e) {
        // Ensure the exception message contains the correct error text
        System.assert(e.getMessage().contains('No files selected for deletion.'), 
            'Error message should indicate no files selected');
    }
    Test.stopTest();
}
}