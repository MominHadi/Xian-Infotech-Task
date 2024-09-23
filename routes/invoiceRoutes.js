const Router=require('express').Router();
const invoiceController=require('../controllers/invoiceController');

Router.get('/invoiceNumber',invoiceController.getInvoiceNumber);
Router.get('/:invoiceNumber',invoiceController.sendInvoicePdf);
Router.post('/save',invoiceController.saveInvoice);

module.exports=Router;