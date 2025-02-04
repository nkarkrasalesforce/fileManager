import { LightningElement, api } from 'lwc';

export default class FileManagerModal extends LightningElement {
    @api modalId;

    closeModal(event){
        this.dispatchEvent(new CustomEvent('closemodal'))
    }
}