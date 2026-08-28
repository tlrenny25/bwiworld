var express = require("express");
var app = express();
var http = require("http").createServer(app);

app.use(express.static("joelschallenge1998"));

http.listen(5500, function(){
    let a = http.address().port;
    console.log(`Joels challenge listening at port ${a}`);
});