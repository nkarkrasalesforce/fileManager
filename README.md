# Salesforce File Manager Lightning Web Component

## Overview

The File Manager is a flexible and feature-rich Lightning Web Component designed to enhance file management within Salesforce record pages and community pages. This component provides a comprehensive solution for viewing, uploading, downloading, and managing files associated with Salesforce records.

## Features

- 📂 File Listing
  - Display files associated with a specific record
  - Configurable columns (Owner Name, File Type, File Size, Last Modified)
  - Supports both Salesforce record pages and community pages

- 🔍 File Actions
  - File Preview
  - Download selected files
  - Delete files
  - Remove files from a record
  - Edit file details

- 📤 File Upload
  - Multiple file upload support
  - Configurable file format restrictions

## Installation

### Prerequisites
- Salesforce Lightning Experience
- API version 62.0 or higher

### Steps
1. Deploy the following components to your Salesforce org:
   - `FileManagerLwc` Lightning Web Component
   - `FileManagerController` Apex Class
   - `FileManagerStyle` Static Resource
   - Corresponding JavaScript modules (`constants.js`, `utils.js`)

2. Add the component to your desired page layouts or community pages

## Configuration

The File Manager component offers extensive configuration options through its component properties:

### General Settings
- `title`: Custom title for the file manager card (Default: "Files")
- `isCommunity`: Toggle between record page and community page modes
- `multiple`: Allow multiple file uploads
- `format`: Specify accepted file formats (e.g., "pdf,png,jpg")

### Action Permissions
- `allowPreview`: Enable/disable file preview
- `allowUpload`: Enable/disable file upload
- `allowDownload`: Enable/disable file download
- `allowRemove`: Enable/disable removing files from a record
- `allowDelete`: Enable/disable permanent file deletion
- `allowFileEditDetail`: Enable/disable editing file details

### Display Options
- `showRefreshIcon`: Display a refresh button
- `showOwnerName`: Show file owner in the datatable
- `showFileType`: Show file type in the datatable
- `showFileSize`: Show file size in the datatable
- `showLastModified`: Show last modified date in the datatable

## Usage Example

```xml
<!-- On a Record Page -->
<lightning-tab-content>
    <c-file-manager-lwc
        record-id="{!recordId}"
        title="Project Documents"
        allow-upload="true"
        allow-download="true"
        allow-preview="true"
        format="pdf,docx,xlsx"
        show-owner-name="true">
    </c-file-manager-lwc>
</lightning-tab-content>
```

## Permissions and Security

- The component uses Salesforce's sharing rules and user permissions
- File actions are subject to the user's access level
- Apex methods include security checks to prevent unauthorized operations

## Limitations

- Maximum file upload size depends on Salesforce's standard limits
- Supported in Lightning Experience and Community Pages
- Requires appropriate object and file sharing permissions

## Troubleshooting

- Ensure the `FileManagerController` has the necessary sharing and visibility settings
- Check that static resources and Apex classes are properly deployed
- Verify user permissions for file-related operations

## Support

For issues, feature requests, or implementation support, please contact [Your Support Contact].

## License

[Include your licensing information]

## Version History

- 1.0.0 - Initial Release
  - Basic file management features
  - Support for record and community pages

## Contributing

Contributions are welcome! Please submit pull requests or open issues in the repository.
