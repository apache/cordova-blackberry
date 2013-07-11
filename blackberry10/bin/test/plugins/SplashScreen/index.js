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
describe("SplashScreen", function () {
    var _apiDir = __dirname + "./../../../../plugins/SplashScreen/src/blackberry10/",
        index,
        MockPluginResult,
        mockedEnv = {
            response: {
                send: jasmine.createSpy()
            }
        },
        mockedApplication = {
            windowVisible: undefined
        };

    beforeEach(function () {
        index = require(_apiDir + "index");
        mockedEnv.response.send.reset();
    });

    afterEach(function () {
        require.cache = {};
    });

    describe("show", function () {
        beforeEach(function () {
            MockPluginResult = function (args, env) {};
            MockPluginResult.prototype.error = jasmine.createSpy();
        });

        it("calls PluginResult.error if show is called", function () {
            index.show(new MockPluginResult());

            expect(MockPluginResult.prototype.error).toHaveBeenCalledWith("Not supported on platform", false);
        });
    });

    describe("hide", function () {
        beforeEach(function () {
            GLOBAL.window = {
                qnx: {
                    webplatform: {
                        getApplication: function () {
                            return mockedApplication;
                        }
                    }
                }
            };

            MockPluginResult = function (args, env) {};
            MockPluginResult.prototype.ok = jasmine.createSpy();
        });

        afterEach(function () {
            delete GLOBAL.window;
        });

        it("calls PluginResult.ok if hide is called", function () {
            index.hide(new MockPluginResult());

            expect(mockedApplication.windowVisible).toBeTruthy();
            expect(MockPluginResult.prototype.ok).toHaveBeenCalledWith(undefined, false);
        });
    });
});
