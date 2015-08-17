#!/usr/bin/env node

var express = require('express');
var fs = require('fs');
var serveIndex = require('serve-index');
var program = require('commander');
var app = express();

program
    .version('0.3.0')
    .option('-p, --port <n>', 'port', parseInt)
    .parse(process.argv);

var port = program.port || 3000;

var isRootSwagger = false;

try {
    isRootSwagger = fs.statSync(process.cwd() + '/swagger.json').isFile();
} catch (e) {

}


app.get('/', function (req, res) {
    if (isRootSwagger) {
        res.redirect('/swagger?url=../raw/swagger.json');
    } else {
        res.redirect('/list');
    }
});

app.use('/swagger', express.static(__dirname + '/swagger'));
app.use('/raw', express.static(process.cwd() + '/'));
app.use('/list', function (req, res, next) {
    var filepath = process.cwd() + '/' + req.path;

    fs.stat(filepath, function (err, stats) {
        if (err) return next();

        if (stats.isFile()) {
            res.redirect('/swagger?url=../raw/' + req.path);
            return;
        }
        next();
    });
});

app.use('/list', serveIndex(process.cwd() + '/', {'icons': true}))

app.listen(port);

console.log('Running on port ' + port);
