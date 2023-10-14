const path = require('path');
const express = require("express");
const app = express();

let server = app.listen(3030);

app.use(express.static(__dirname + '/renderer'))

app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname, '/renderer/index.html'));

});