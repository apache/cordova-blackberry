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

describe("Device", function () {

    var _apiDir = __dirname + "./../../../../plugins/Device/src/blackberry10/",
        index,
        result = {
            ok: jasmine.createSpy()
        },
        mockedDevice;

    describe("getDeviceInfo", function () {
        beforeEach(function () {
            mockedDevice = {
                scmBundle: "1.0.0.0",
                modelName: "q10",
                devicePin: (new Date()).getTime()
            };

            GLOBAL.window = {
                qnx: {
                    webplatform: {
                        device: mockedDevice
                    }
                }
            };
            index = require(_apiDir + "index");
        });

        afterEach(function () {
            delete GLOBAL.window;
            delete require.cache[require.resolve(_apiDir + "index")];
        });

        it("calls ok with the Device info", function () {

            result.ok.andCallFake(function (deviceInfo) {
                expect(deviceInfo.platform).toEqual("blackberry10");
                expect(deviceInfo.version).toEqual(mockedDevice.scmBundle);
                expect(deviceInfo.model).toEqual(mockedDevice.modelName);
                expect(deviceInfo.uuid).toEqual(mockedDevice.devicePin);
                expect(deviceInfo.cordova).toBeDefined();
            });

            index.getDeviceInfo(result);
            expect(result.ok).toHaveBeenCalled();
        });

        it("returns Z10 for 1280x768", function () {
            mockedDevice.modelName = undefined;
            GLOBAL.window.screen = {
                height: 1280,
                width: 768
            };

            result.ok.andCallFake(function (deviceInfo) {
                expect(deviceInfo.model).toEqual("Z10");
            });

            index.getDeviceInfo(result);
            expect(result.ok).toHaveBeenCalled();
        });

        it("returns Z10 for 768x1280", function () {
            mockedDevice.modelName = undefined;
            GLOBAL.window.screen = {
                height: 768,
                width: 1280
            };

            result.ok.andCallFake(function (deviceInfo) {
                expect(deviceInfo.model).toEqual("Z10");
            });

            index.getDeviceInfo(result);
            expect(result.ok).toHaveBeenCalled();
        });

        it("returns Q10 for 720x720 and OLED", function () {
            mockedDevice.modelName = undefined;
            GLOBAL.window.screen = {
                height: 720,
                width: 720
            };
            GLOBAL.window.matchMedia = jasmine.createSpy().andReturn({matches: true});

            result.ok.andCallFake(function (deviceInfo) {
                expect(deviceInfo.model).toEqual("Q10");
            });

            index.getDeviceInfo(result);
            expect(result.ok).toHaveBeenCalled();
            expect(GLOBAL.window.matchMedia).toHaveBeenCalledWith("(-blackberry-display-technology: -blackberry-display-oled)");
        });

        it("returns Q5 for 720x720 and no OLED", function () {
            mockedDevice.modelName = undefined;
            GLOBAL.window.screen = {
                height: 720,
                width: 720
            };
            GLOBAL.window.matchMedia = jasmine.createSpy().andReturn({matches: false});

            result.ok.andCallFake(function (deviceInfo) {
                expect(deviceInfo.model).toEqual("Q5");
            });

            index.getDeviceInfo(result);
            expect(result.ok).toHaveBeenCalled();
            expect(GLOBAL.window.matchMedia).toHaveBeenCalledWith("(-blackberry-display-technology: -blackberry-display-oled)");
        });
    });
});
