var express = require('express');
var router = express.Router();

var keyFileStorage = require("key-file-storage");
var kfs = keyFileStorage('./db');

router.post('/getAll', function (req, res, next) {
    var userName = req.body.userName;
    kfs.get('/users/' + userName).then(function (userData) {
        if (userData === null) {
            return res.status(200).send({
                status: 'failed',
                errorMessage: 'userName does not exists'
            }).end();
        }
        kfs.get('/notes/' + userName).then(function (notes) {
            res.status(200)
                .send({
                    status: 'success',
                    notes: notes || []
                })
                .end();
        }, function (err) {
            res.status(500).send(err).end();
        });

    }, function (err) {
        res.status(500).send(err).end();
    });
});

router.post('/storeAll', function (req, res, next) {
    var userName = req.body.userName;
    var notes = req.body.notes;
    kfs.get('/users/' + userName).then(function (userData) {
        if (userData === null) {
            return res.status(200).send({
                status: 'failed',
                errorMessage: 'userName does not exists'
            }).end();
        }
        kfs.set('/notes/' + userName, notes).then(function () {
            res.status(200)
                .send({status: 'success'})
                .end();
        }, function (err) {
            res.status(500).send(err).end();
        });

    }, function (err) {
        res.status(500).send(err).end();
    });


});

module.exports = router;