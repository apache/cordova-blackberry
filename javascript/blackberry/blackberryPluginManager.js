
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * Copyright (c) 2011, Research In Motion Limited.
 */

window.cordova.PluginManager = (function (webworksPluginManager) {
    "use strict";

    var retInvalidAction = { "status" : Cordova.callbackStatus.INVALID_ACTION, "message" : "Action not found" },

        loggerAPI = {
            execute: function (webWorksResult, action, args, win, fail) {
                switch (action) {
                case 'log':
                    org.apache.cordova.Logger.log(args);
                    return {"status" : Cordova.callbackStatus.OK,
                            "message" : 'Message logged to console: ' + args};
                }
                return retInvalidAction;
            }
        },
        plugins = {'Logger': loggerAPI};

    cordova.BlackBerryPluginManager = function () {
    };

    cordova.BlackBerryPluginManager.prototype.exec = function (win, fail, clazz, action, args) {
        var result = webworksPluginManager.exec(win, fail, clazz, action, args);

        //We got a sync result or a not found from WW that we can pass on to get a native mixin
        //For async calls there's nothing to do
        if (result.status === Cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION  ||
                result.status === Cordova.callbackStatus.INVALID_ACTION ||
                result.status === Cordova.callbackStatus.OK) {
            if (plugins[clazz]) {
                return plugins[clazz].execute(result.message, action, args, win, fail);
            } else {
                result = this.subExec(win, fail, clazz, action, args);
            }
        }

        return result;
    };

    cordova.BlackBerryPluginManager.prototype.subExec = function (win, fail, clazz, action, args) {
        var callbackId = clazz + Cordova.callbackId++,
            origResult,
            evalResult,
            execResult;

        try {

            if (win || fail) {
                Cordova.callbacks[callbackId] = {success: win, fail: fail};
            }

            // Note: Device returns string, but for some reason emulator returns object - so convert to string.
            origResult = "" + org.apache.cordova.JavaPluginManager.exec(clazz, action, callbackId, JSON.stringify(args), true);

            // If a result was returned
            if (origResult.length > 0) {
                eval("evalResult = " + origResult + ";");

                // If status is OK, then return evalResultalue back to caller
                if (evalResult.status === Cordova.callbackStatus.OK) {

                    // If there is a success callback, then call it now with returned evalResultalue
                    if (win) {
                        // Clear callback if not expecting any more results
                        if (!evalResult.keepCallback) {
                            delete Cordova.callbacks[callbackId];
                        }
                    }
                } else if (evalResult.status === Cordova.callbackStatus.NO_RESULT) {

                    // Clear callback if not expecting any more results
                    if (!evalResult.keepCallback) {
                        delete Cordova.callbacks[callbackId];
                    }
                } else {
                    console.log("Error: Status=" + evalResult.status + " Message=" + evalResult.message);

                    // If there is a fail callback, then call it now with returned evalResultalue
                    if (fail) {

                        // Clear callback if not expecting any more results
                        if (!evalResult.keepCallback) {
                            delete Cordova.callbacks[callbackId];
                        }
                    }
                }
                execResult = evalResult;
            } else {
                // Asynchronous calls return an empty string. Return a NO_RESULT
                // status for those executions.
                execResult = {"status" : Cordova.callbackStatus.NO_RESULT,
                        "message" : ""};
            }
        } catch (e) {
            console.log("BlackBerryPluginManager Error: " + e);
            execResult = {"status" : Cordova.callbackStatus.ERROR,
                          "message" : e.message};
        }

        return execResult;
    };

    cordova.BlackBerryPluginManager.prototype.resume = org.apache.cordova.JavaPluginManager.resume;
    cordova.BlackBerryPluginManager.prototype.pause = org.apache.cordova.JavaPluginManager.pause;
    cordova.BlackBerryPluginManager.prototype.destroy = org.apache.cordova.JavaPluginManager.destroy;

    //Instantiate it
    return new cordova.BlackBerryPluginManager();
}(new cordova.WebWorksPluginManager()));
