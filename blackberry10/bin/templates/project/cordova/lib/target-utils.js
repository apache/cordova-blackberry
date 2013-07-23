/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _self,
    os = require("os"),
    exec = require('child_process').exec,
    path = require('path'),
    bb10_utils = require('./utils'),
    blackberryProperties = bb10_utils.getProperties();

_self = {
    getTargetList : function (type, pruneDisconnected, callback) {
        var targList = [],
            count = 0,
            targets = blackberryProperties.targets,
            addItem = function (t) {
                targets[t].name = t;
                targList.push(targets[t]);
            },
            checkConnection = function (name) {
                _self.checkConnection(targets[name].ip, type, function (connected) {
                    count++;
                    if (connected) {
                        addItem(name);
                    }
                    complete();
                });
            },
            complete = function () {
                if (count === Object.keys(targets).length) {
                    callback(targList);
                }
            },
            t;

        if (targets) {
            for (t in targets) {
                if (targets.hasOwnProperty(t) && targets[t].type === type) {
                    if (pruneDisconnected) {
                        checkConnection(t);
                    }
                    else {
                        addItem(t);
                        count++;
                    }
                } else {
                    count++;
                }
            }
        }
        complete();
    },

    getDeviceInfo: function(ip, password, callback) {
        var cmd = path.join(process.env.CORDOVA_BBTOOLS, 'blackberry-deploy') + ' -listDeviceInfo ' + ip;
        if (password) {
            cmd += ' -password ' + password;
        }
        exec(cmd, function(error, stdout, stderr) {
            var result = {},
                name = /modelname::(.*?)\n/.exec(stdout),
                pin = /devicepin::0x(.*?)\n/.exec(stdout);
            if (name && name.length > 0) {
                result.name = name[1];
            }
            if (pin && pin.length > 0) {
                result.pin = pin[1];
            }
            callback(result);
        });
    },

    findConnectedDevice: function(callback) {
        var defaultIp = '169.254.0.1';
        _self.discoverUsb(function (result) {
           if (result) {
                _self.checkConnection(result, 'device', function (connection) {
                    if (connection)  {
                        callback(result);
                    } else {
                        callback();
                    }
                });
            } else {
                _self.checkConnection(defaultIp, 'device', function (connection) {
                    if (connection) {
                        callback(defaultIp);
                    } else {
                        callback();
                    }
                });
            }
        });
    },

    discoverUsb: function(callback) {
        var IPV4_TYPE = "IPv4",
            IP_SPLIT_REGEXP = /(169\.254\.\d{1,3}\.)(\d{1,3})/,
            networkInterfaces = os.networkInterfaces(),
            result,
            ni,
            i;

        for (ni in networkInterfaces) {
            if (networkInterfaces.hasOwnProperty(ni)) {
                for (i=0; i< networkInterfaces[ni].length; i++) {
                    if (networkInterfaces[ni][i].family === IPV4_TYPE) {
                        result = IP_SPLIT_REGEXP.exec(networkInterfaces[ni][i].address);
                        if (result && result[1] && result[2]) {
                            callback(result[1] + (result[2] -1));
                            return;
                        }
                    }
                }

            }
        }
        //If we haven't found anything callback in defeat
        callback();
    },

    checkConnection: function(ip, type, callback) {
        var script = bb10_utils.inQuotes(path.join(process.env.CORDOVA_BBTOOLS, 'blackberry-deploy'));
        exec(script + ' -test ' + ip, function(error, stdout, stderr) {
            // error code 3 corresponds to a connected device, null corresponds to connected sim
            callback((type === 'simulator' && error === null) || (type == 'device' && error.code === 3));
        });
    },

    listTargets : function(type, pruneDisconnected) {
        _self.getTargetList(type, pruneDisconnected, function (targets) {
            for (var t in targets) {
                console.log(targets[t].name + ' ip: ' + targets[t].ip);
            }
        });
    }

};

module.exports = _self;
