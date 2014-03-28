/*
 * Copyright 2010-2012 Research In Motion Limited.
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

var Whitelist = require("../policy/whitelist").Whitelist,
    _clientWebView = require("lib/webview"),
    _loadedPlugins = [],
    _listening = false,
    whitelist = new Whitelist();

function registerToReset() {
    if (_clientWebView && !_listening) {
        _clientWebView.addEventListener("DocumentLoadCommitted", function () {
            _loadedPlugins = _loadedPlugins.filter(function (path) {
                require(path).reset();
                return false;
            });
        });
        _listening = true;
    }
}

module.exports = {

    exec: function (request, succ, fail, args, env) {
        var extPath = "plugin/" + request.params.ext + "/index",
            requestObj = {
                extension: null,
                method: null,
                getExtension: function () {
                    if (frameworkModules.indexOf(extPath + ".js") !== -1) {
                        this.extension = require("../utils").loadModule("../" + extPath);
                        if (requestObj.extension && typeof requestObj.extension.reset === 'function') {
                            if (_loadedPlugins.indexOf(extPath) === -1) {
                                _loadedPlugins.push(extPath);
                            }
                        }
                        return requestObj;
                    } else {
                        throw {code: 404, msg: "Extension " + request.params.ext + " not found"};
                    }
                },
                getMethod: function () {
                    var methodParts = request.params.method ? request.params.method.split('/') : [request.params.method],
                        extMethod;

                    try {
                        extMethod = this.extension[methodParts.shift()];
                        extMethod = methodParts.reduce(function (previous, current) {
                            if (previous[current]) {
                                return previous[current];
                            } else {
                                throw {code: 404, msg: "Method " + request.params.method + " for " + request.params.ext + " not found"};
                            }
                        }, extMethod);

                        if (extMethod && typeof extMethod === "function") {
                            this.method = extMethod;
                            return requestObj;
                        } else {
                            throw {code: 404, msg: "Method " + request.params.method + " for " + request.params.ext + " not found"};
                        }
                    } catch (e) {
                        throw {code: 404, msg: "Method " + request.params.method + " for " + request.params.ext + " not found"};
                    }
                },
                exec: function () {
                    this.method(succ, fail, args, env);
                }
            };

        try {
            requestObj.getExtension().getMethod().exec();
            registerToReset();
        } catch (e) {
            console.warn(e.msg);
            fail(-1, e.msg, e.code);
        }
    }
};
