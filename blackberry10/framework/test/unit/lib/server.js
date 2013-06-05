/*
 * Copyright 2010-2011 Research In Motion Limited.
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
var ROOT = "../../../";

describe("server", function () {

    var server,
        plugin,
        PluginResult,
        applicationAPIServer,
        utils,
        DEFAULT_SERVICE = "default",
        DEFAULT_ACTION = "exec",
        config = {};

    beforeEach(function () {
        applicationAPIServer = {
            getReadOnlyFields: function () {}
        };

        utils = require("../../../lib/utils");

        spyOn(utils, "loadModule").andCallFake(function (module) {
            if (module.indexOf("plugin/") >= 0) {
                // on device, "plugin/blackberry.app/index.js" would exist
                return applicationAPIServer;
            } else {
                return require("../../../lib/" + module);
            }
        });

        plugin = require(ROOT + "lib/plugins/default");
        server = require(ROOT + "lib/server");
    });

    afterEach(function () {
        delete require.cache[require.resolve(ROOT + "lib/utils")];
        delete require.cache[require.resolve(ROOT + "lib/plugins/default")];
        delete require.cache[require.resolve(ROOT + "lib/server")];
    });

    describe("when handling requests", function () {
        var req,
            res;

        beforeEach(function () {
            req = {
                params: {
                    service: "",
                    action: "",
                    args: ""
                },
                body: JSON.stringify({callbackId: 42}),
                origin: ""
            };
            res = {
                send: jasmine.createSpy()
            };
            GLOBAL.frameworkModules = ['plugin/blackberry.app/index.js', 'lib/plugins/default.js'];
        });

        afterEach(function () {
            delete GLOBAL.frameworkModules;
        });

        it("calls the default plugin if the service doesn't exist", function () {
            var rebuiltRequest = {
                    params: {
                        service: DEFAULT_SERVICE,
                        action: DEFAULT_ACTION,
                        ext: "not",
                        method: "here",
                        args: {
                            callbackId: 42
                        }
                    },
                    body: req.body,
                    origin: ""
                },
                webview = {
                    id: 42
                };

            spyOn(plugin, DEFAULT_ACTION);
            req.params.service = "not";
            req.params.action = "here";

            server.handle(req, res, webview, config);

            expect(plugin[DEFAULT_ACTION]).toHaveBeenCalledWith(
                rebuiltRequest,
                jasmine.any(Object),
                rebuiltRequest.params.args,
                {
                    request: rebuiltRequest,
                    response: res,
                    webview: webview,
                    config: config
                }
            );
        });

        it("returns 404 if the action doesn't exist", function () {
            req.params.service = "default";
            req.params.action = "ThisActionDoesNotExist";

            spyOn(console, "error");

            server.handle(req, res);
            expect(res.send).toHaveBeenCalledWith(404, jasmine.any(String));
            expect(console.error).toHaveBeenCalled();
        });

        it("calls the action method on the plugin", function () {
            var webview = {
                    id: 42
                };

            spyOn(plugin, "exec");

            req.params.service = "default";
            req.params.action = "exec";

            expect(function () {
                return server.handle(req, res, webview, config);
            }).not.toThrow();
            expect(plugin.exec).toHaveBeenCalledWith(
                req,
                jasmine.any(Object),
                req.params.args,
                {
                    request: req,
                    response: res,
                    webview: webview,
                    config: config
                });
        });

        it("parses url encoded args", function () {
            var webview = {
                    id: 42
                };

            spyOn(plugin, "exec");

            expect(function () {
                req.params.service = "default";
                req.params.action = "exec";
                req.params.args = "a=1&b=2&c=3&callbackId=42";

                return server.handle(req, res, webview);
            }).not.toThrow();
            expect(plugin.exec).toHaveBeenCalledWith(
                jasmine.any(Object),
                jasmine.any(Object),
                {
                    a: '1',
                    b: '2',
                    c: '3',
                    callbackId: '42'
                },
                jasmine.any(Object)
            );
        });
    });

    describe("when handling feature requests", function () {
        var req, res;

        beforeEach(function () {
            req = {
                params: {
                    service: "default",
                    action: "exec",
                    ext: "blackberry.app",
                    method: "getReadOnlyFields",
                    args: null
                },
                headers: {
                    host: ""
                },
                url: "",
                body: JSON.stringify({callbackId: 42}),
                origin: ""
            };
            res = {
                send: jasmine.createSpy()
            };
            GLOBAL.frameworkModules = ['plugin/blackberry.app/index.js', 'lib/plugins/default.js'];
        });

        afterEach(function () {
            delete GLOBAL.frameworkModules;
        });

        it("calls the action method on the feature", function () {
            var webview = {
                    id: 42
                };
            spyOn(applicationAPIServer, "getReadOnlyFields");
            server.handle(req, res, webview, config);
            expect(applicationAPIServer.getReadOnlyFields).toHaveBeenCalledWith(
                jasmine.any(Object),
                req.params.args,
                {
                    request: req,
                    response: res,
                    webview: webview,
                    config: config
                }
            );
        });
    });
});
