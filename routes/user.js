var express = require('express');
var router = express.Router();

var keyFileStorage = require("key-file-storage");
var kfs = keyFileStorage('./db');

router.post('/login', function (req, res, next) {
    var data = req.body;
    kfs.get('/users/' + data.userName).then(function (userData) {
        if (userData === null) {
            return res.status(200).send({
                status: 'failed',
                errorMessage: 'userName does not exists'
            }).end();
        }
        if (data.passWord !== userData.passWord) {
            return res.status(200).send({
                status: 'failed',
                errorMessage: 'passWord is wrong!!!'
            }).end();
        }
        res.status(200).send({
            status: 'success',
            userData: {
                userName: userData.userName,
                fullName: userData.fullName
            }
        }).end();
    }, function (err) {
        res.status(500).send(err).end();
    });
})
;

router.post('/register', function (req, res, next) {
    var data = req.body;
    kfs.get('/users/' + data.userName).then(function (userData) {
        if (userData !== null) {
            return res.status(200).send({
                status: 'failed',
                errorMessage: 'This user exists'
            }).end();
        }
        kfs.set('/users/' + data.userName, data).then(function () {
            res.status(200).send({
                status: 'success'
            }).end();
        }, function (err) {
            res.status(500).send(err).end();
        });
    }, function (err) {
        res.status(500).send(err).end();
    });
});

module.exports = router;
