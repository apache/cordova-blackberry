/**
* LICENSE MIT
* (C) Daniel Zelisko
* http://github.com/danielzzz/node-portchecker
*
* a simple tcp port checker
* Use it for checking if a service is up or to find available ports on a machine
*/

var net = require('net');
var timeout = 400; //miliseconds



// start port, last port, host, callback
exports.getFirstAvailable = function (startPort, endPort, host, callback) {
    if (startPort>endPort) {
        throw new Error('portchecker: startPort must be lower than endPort');
    }
    //console.log('looking for an available port in ' + startPort + '-' + endPort + ' on ' + host);
    var notFree = false;
    var currentPort = startPort;

    var onCheckPort = function(isOpen){
        isOpen && check();
        !isOpen && callback((currentPort-1), host);
    }

    var check = function() {
        //---- return -1 if we checked all ports from the range already
        if (currentPort>endPort) {callback(-1, host); return; };

        //console.log('checking :' + currentPort);
        exports.isOpen(currentPort, host, onCheckPort);
        currentPort++;
    }

    //----- start checking ----------
    check();


}

exports.getAllOpen = function (startPort, endPort, host, callback) {
    if (startPort>endPort) {
        throw new Error('portchecker: startPort must be lower than endPort');
    }
    //console.log('looking for open ports between ' + startPort + '-' + endPort + ' on ' + host);
    var notFree = false,
        openPorts = [];
    var currentPort = startPort;

    var onCheckPort = function(isOpen){
        if (isOpen) {
            openPorts.push((currentPort-1))
        }
        check();
    }

    var check = function() {
        //---- return -1 if we checked all ports from the range already
        if (currentPort>endPort) {callback(openPorts, host); return; };

        //console.log('checking :' + currentPort);
        exports.isOpen(currentPort, host, onCheckPort);
        currentPort++;
    }

    //----- start checking ----------
    check();


}

exports.isOpen = function (port, host, callback) {
    var isOpen = false;
    var executed = false;
    var onClose = function() {
        if (executed) {return;}
        exectued = true;
        clearTimeout(timeoutId);

        delete conn;

        callback(isOpen, port, host);
    };

    var onOpen = function() {
        isOpen = true;
        //console.log(host+":"+p+" is taken");
        conn.end();
    };

    var timeoutId = setTimeout(function() {conn.destroy();}, timeout);

    var conn = net.createConnection(port, host, onOpen);
    conn.on('close', function() {if(!executed){onClose();}});
    conn.on('error', function() {conn.end();});
    conn.on('connect', onOpen);
}

exports.setTimeout = function(t) {
    timeout = t;
}
