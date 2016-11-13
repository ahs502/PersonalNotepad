var express = require('express');
var router = express.Router();

var fs = require("fs");
var path = require("path");

var formidable = require('formidable');


router.post('/', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        err && console.log('Upload error : ', err);
    });
    form.on('fileBegin', function (name, file) {
        file.path = __dirname + '/../uploadedfiles/' + file.name ; //TODO: specify storage path
    });
    form.on('file', function (name, file) {
        console.log('Uploading : ', file.name);
    });
    form.on('end', function () {
        console.log('Uploaded successfully.');
        res.status(200).end();
    });
});


module.exports = router;
