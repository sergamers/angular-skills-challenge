'use strict'

var api = require("simple-api");
var nodeStatic = require('node-static');

var file = new nodeStatic.Server('./public');

var v0 = new api({
    prefix: ["api", "v0"],
    port: 8080,
    host: "localhost",
    logLevel: 2,
    fallback: function(req, res) {
        file.serve(req, res);
    }
});


var ctrl = v0.Controller('todos',require('./controllers/todosCtrl.js'));
console.log(ctrl);
console.log(v0);
