const Invoice = require('../models/invoiceModel');
const SeriesNumber = require('../models/seriesnumber');
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit');

exports.getInvoiceNumber = async (req, res) => {

    try {
        const data = await SeriesNumber.findOne({ seriesName: 'invoiceNumber' })

        if (!data) {
            return res.status(200).json({ error: "Data not Found!!!!" })
        }

        res.status(200).json({ status: "Success", data: data })
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error })
    }


};

exports.saveInvoice = async (req, res) => {

    try {
        const { customer, billingAddress, phoneNo, invoiceNumber, invoiceDate, paymentType, roundOff, items, grandTotal, balance } = req.body;

        let imagePath = '';
        if (req.file) {
            imagePath = "images/" + req.file.filename;
        }


        const saveInvoice = await Invoice.create({ customerName: customer, billingAddress, phoneNo, invoiceNo: invoiceNumber, invoiceDate, paymentType, roundOff: 0, items: JSON.parse(items), grandTotal, balanceAmount: balance })
        const updateSeries = await SeriesNumber.findOneAndUpdate(
            { seriesName: "invoiceNumber" },
            { $inc: { seriesValue: 1 } },
            { new: true, upsert: true }
        );

        if (saveInvoice && updateSeries) {
            //Creating and Saving Pdf

            const invoiceName = `Invoice-${invoiceNumber}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const docInvoice = new PDFDocument({ size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline;filename="${invoiceName}"`);

            docInvoice.pipe(fs.createWriteStream(invoicePath))

            docInvoice.rect(12, 26, 570, 770).stroke("#000000")
            docInvoice.font('Helvetica-Bold').fontSize(20).text('Tax Invoice', 26, 5, { align: 'center' });


            let spaceFromTop = 32;

            docInvoice.font('Helvetica-Bold').fontSize(27).text('My Company', 50, spaceFromTop, { align: 'right' });

            spaceFromTop += 30;

            let invoiceDatePdf = invoiceDate.split('-');
          
            //2 Rectangles for  Bill To and Invoice Details
            docInvoice.rect(12, spaceFromTop, 270, 100).stroke("#000000");
            docInvoice.rect(282, spaceFromTop, 300, 100).stroke("#000000");
            spaceFromTop += 4

            //Heading Sections
            docInvoice.font('Helvetica-Bold').fontSize(12).text('Bill-To', 20, spaceFromTop, { align: 'left' });
            docInvoice.font('Helvetica-Bold').fontSize(12).text('Invoice Details', 410, spaceFromTop);

            spaceFromTop += 20
            docInvoice.font('Helvetica-Bold').fontSize(10).text(customer, 17, spaceFromTop, { width: 150 });

            //On the right side
            docInvoice.font('Helvetica').fontSize(10).text(`Invoice No.:  ${invoiceNumber}`, 285, spaceFromTop, { width: 150 });

            spaceFromTop += 16
            docInvoice.font('Helvetica').fontSize(10).text(billingAddress, 17, spaceFromTop, { width: 100 });

            //On the right side
            docInvoice.font('Helvetica').fontSize(10).text(`Invoice Date.:  ${invoiceDatePdf[2] + '-' + invoiceDatePdf[1] + '-' + invoiceDatePdf[0]}`, 285, spaceFromTop, { width: 150 });

            spaceFromTop += 47
            docInvoice.font('Helvetica').fontSize(10).text(`Contact No.:  ${phoneNo}`, 17, spaceFromTop);

            spaceFromTop += 13;

            //Table

            //Table Header

            //Table Columns Seperations Lines
            docInvoice.rect(12, spaceFromTop, 30, 200).stroke("#000000")//sr No
            docInvoice.rect(42, spaceFromTop, 100, 200).stroke("#000000")//Item
            docInvoice.rect(142, spaceFromTop, 55, 200).stroke("#000000")//hsn
            docInvoice.rect(197, spaceFromTop, 55, 200).stroke("#000000")//qty
            docInvoice.rect(252, spaceFromTop, 45, 200).stroke("#000000")//unit
            docInvoice.rect(297, spaceFromTop, 45, 200).stroke("#000000")//Price
            docInvoice.rect(342, spaceFromTop, 55, 200).stroke("#000000")//Discount
            docInvoice.rect(397, spaceFromTop, 55, 200).stroke("#000000")//CGST+SGST
            docInvoice.rect(452, spaceFromTop, 55, 200).stroke("#000000")//IGST
            docInvoice.rect(507, spaceFromTop, 75, 200).stroke("#000000")//Amount

            //horizontal Rectange
            docInvoice.rect(12, spaceFromTop, 570, 24).stroke("#000000")//Amount

            //Text
            spaceFromTop += 5
            docInvoice
                .font('Helvetica-Bold')
                .fontSize(9.5)
                .text('#', 14, spaceFromTop)
                .text('Item Name', 50, spaceFromTop)
                .text('HSN/SAC', 147, spaceFromTop)
                .text('Quantity', 200, spaceFromTop)
                .text('Unit', 257, spaceFromTop)
                .text('Price', 300, spaceFromTop)
                .text('Discount', 347, spaceFromTop)
                .text('CGST+SGST', 400, spaceFromTop, { width: 36 })
                .text('IGST', 456, spaceFromTop)
                .text('Amount', 510, spaceFromTop, { width: 60 })

            let index = 1
            let tableHeight = spaceFromTop;
            for (const data of JSON.parse(items)) {

                tableHeight += 27
                docInvoice
                    .font('Helvetica-Bold')
                    .fontSize(9.5)
                    .text(index, 14, tableHeight)
                    .text(data.itemName, 50, tableHeight)
                    .text(520832, 147, tableHeight)
                    .text(data.quantity, 200, tableHeight)
                    .text(data.unit, 257, tableHeight)
                    .text(data.pricePerUnit, 300, tableHeight)
                    .text(`$${data.discountAmount}`, 347, tableHeight, { width: 42 })
                    .text(`$${data.taxAmount}`, 400, tableHeight, { width: 42 })
                    .text(0, 456, tableHeight)
                    .text(`$${data.finalAmount}`, 510, tableHeight, { width: 70 })
                index += 1
            }

            spaceFromTop += 195;

            docInvoice.rect(12, spaceFromTop, 570, 20).stroke("#000000")//Amount
            spaceFromTop += 6;

            docInvoice
                .font('Helvetica-Bold')
                .fontSize(9.5)
                .text("Total", 470, spaceFromTop)
                .text(grandTotal, 514, spaceFromTop, { width: 70 })

            spaceFromTop += 14

            //SIgnature PArt
            docInvoice.rect(12, spaceFromTop, 328, 80).stroke("#000000")//Amount
            docInvoice.rect(340, spaceFromTop, 242, 80).stroke("#000000")//Amount

            spaceFromTop += 7
            docInvoice
                .font('Helvetica-Bold')
                .fontSize(10.5)
                .text("For Company Name", 415, spaceFromTop)
                .font('Helvetica')
                .fontSize(9.5)
                .text("Authorised Signatory", 420, spaceFromTop + 55)

            docInvoice.end();

            docInvoice.on('finish', () => {
                console.log('PDF generated successfully');
        
            });

            //Pdf End 

            // After Creating Pdf  Sending Response here of Invoice Creation here

            res.status(201).json({ message: 'Invoice Created Succesfully', invoiceNo: invoiceNumber, })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error });
    }
};


exports.sendInvoicePdf = (req, res) => {

    const { invoiceNumber } = req.params;
    try {

        const invoicePath = path.join('data', 'invoices', `invoice-${invoiceNumber}.pdf`)
        fs.readFile(invoicePath, (err, data) => {
            if (err) {
                console.log(err)
                return
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline;filename="invoice-${invoiceNumber}.pdf"`);
            res.send(data);
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error });

    }

}