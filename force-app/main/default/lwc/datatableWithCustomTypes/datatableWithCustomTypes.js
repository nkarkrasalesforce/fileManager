import LightningDatatable from "lightning/datatable";
import navigateToFilePreviewTemplate from "./navigateToFilePreviewTemplate.html";
export default class DatatableWithCustomTypes extends LightningDatatable {
  static customTypes = {
        navigateFilePreview: {
            template: navigateToFilePreviewTemplate,
            typeAttributes: ['label', 'fileId']
        }
    };
}