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
    path = require('path'),
    exec = require('child_process').exec,
    tool_dir = path.join(__dirname),
    build_dir = path.join(tool_dir,'..','..','build');
    bb10_utils = require('./utils'),
    blackberryProperties = require(path.join(bb10_utils.getCordovaDir(), '/', bb10_utils.getPropertiesFileName()));

_self = {
    getTargetList : function (type) {
        var targList = [],
            targets = blackberryProperties['targets'];
        if (targets) {
            for (t in targets) {
                if (targets[t]['type'] == type) {
                    targets[t]['name'] = t;
                    targList.push(targets[t]);
                }
            }
        }
        return targList;
    },

    listTargets : function(type) {
        var targets = _self.getTargetList(type),
            outstr = null;
        if (targets) {
            for (i in targets) {
                var t = targets[i];
                outstr = t.name + " ip: " + t.ip + " status: ";
                exec('blackberry-deploy -test ' + t.ip, function(error, stdout, stderr) {
                    // error code 3 corresponds to a connected device
                    if (error.code == 3) {
                        outstr = outstr + "connected";
                    } else {
                        outstr = "disconnected";
                    }
                    console.log(outstr);
                });
            }
        }
    }

};

module.exports = _self;
