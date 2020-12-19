const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000','http://localhost:3440' , 'https://localhost:3443/'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    console.log('reqheader = ')
    console.log(req.header('Origin'))

    /* if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    }
    else {
        corsOptions = { origin: false };
    } */

    corsOptions = { origin: true }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);