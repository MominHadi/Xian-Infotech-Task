const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const seriesNumberSchema = new Schema({
    seriesName: {
        type: String,
        default: 'invoiceNumber',
        unique:true
    },
    seriesValue: {
        type: Number,
        required: true,
        default: 1,
        unique: true

    },
    description: {
        type: String,
        default: 'Invoice Number Value'
    }
});


module.exports = mongoose.model(`seriesNumber`, seriesNumberSchema);