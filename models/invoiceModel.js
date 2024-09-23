const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    invoiceNo: {
        type: String,
        required: true,
        unique: true
    },
    invoiceDate: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
    },
    billingAddress: {
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    image:{
        type: String,
    },
    paymentType: {
        type: String,
        require: true
    },
    items: [
        {
            itemName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true
            },
            pricePerUnit: {
                type: Number,
                required: true
            },
            discountPercent: {
                type: Number,
                required: true
            },
            taxPercent: {
                type: Number,
                required: true
            },
            finalAmount: {
                type: Number,
                required: true
            },

        }
    ],
    roundOff:{
        type: Number,
        required: true   
    },
    grandTotal:{
        type: Number,
        required: true   
    },
    balanceAmount:{
        type: Number,
        required: true   
    }
},{timestamps:true});


module.exports=mongoose.model(`Invoice`,invoiceSchema);