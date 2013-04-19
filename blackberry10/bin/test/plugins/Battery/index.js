/*
* Copyright 2013 Research In Motion Limited.
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

describe("Battery", function () {

    var _apiDir = __dirname + "./../../../templates/project/plugins/Battery/",
        index,
        callback,
        result = {
            ok: jasmine.createSpy(),
            error: jasmine.createSpy(),
            noResult: jasmine.createSpy(),
            callbackOk: jasmine.createSpy()
        };

    beforeEach(function () {
        index = require(_apiDir + "index");
        GLOBAL.window = {
            qnx: {
                webplatform: {
                    device: {
                        addEventListener: jasmine.createSpy().andCallFake(function (evt, cb) {
                            callback = cb;
                        }),
                        removeEventListener: jasmine.createSpy()
                    }
                }
            }
        };
        GLOBAL.PluginResult = function () {
            return result;
        };
    });

    afterEach(function () {
        index = null;
        delete GLOBAL.window;
        delete GLOBAL.PluginResult;
    });

    describe("start", function () {

        it("calls noResult and keeps callbacks", function () {
            index.start();
            expect(window.qnx.webplatform.device.addEventListener).toHaveBeenCalled();
            expect(result.noResult).toHaveBeenCalledWith(true);
        });

        it("callback calls ok and keeps callbacks", function () {
            callback("OK");
            expect(result.callbackOk).toHaveBeenCalledWith("OK", true);
        });

        it("calls error if already started", function () {
            index.start();
            expect(window.qnx.webplatform.device.addEventListener).not.toHaveBeenCalled();
            expect(result.error).toHaveBeenCalled();
        });


    });

    describe("stop", function () {

        it("calls noResult and does not keep callbacks", function () {
            index.stop();
            expect(window.qnx.webplatform.device.removeEventListener).toHaveBeenCalled();
            expect(result.noResult).toHaveBeenCalledWith(false);
        });

    });
});
