const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer')
const path=require('path')
const app = express();


// File Storage Setup
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fullPath = path.join(__dirname, 'images');
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const safeFilename = new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname;
        cb(null, safeFilename);
    }
});


const filterType = (req, file, cb) => {
    if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const invoiceRoutes = require('./routes/invoiceRoutes');
app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}))

app.use(multer({ storage: fileStorage, fileFilter: filterType }).single('image'));

app.use('/invoice', invoiceRoutes);

mongoose.connect(`mongodb+srv://hadi:jimmychoo@cluster0.t1v4y.mongodb.net/invoice`)
    .then(response => {
        console.log(`App Listening to port 8081`)
        app.listen(8081)
    })
    .catch(err => {
        console.log(err)
    });