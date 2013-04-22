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

var _libDir = __dirname + "./../../../../lib/",
    appEventPrefix = "application.",
    appEvents,
    mockedApplication;

describe("lib/events/applicationEvents", function () {
    beforeEach(function () {
        mockedApplication = {
            on: jasmine.createSpy("application addEventListener"),
            un: jasmine.createSpy("application removeEventListener")
        };
        GLOBAL.window = {
            wp: {
                getApplication: function () {
                    return mockedApplication;
                }
            }
        };
        appEvents = require(_libDir + "events/applicationEvents");
    });

    afterEach(function () {
        mockedApplication = null;
        delete GLOBAL.window;
        appEvents = null;
        delete require.cache[require.resolve(_libDir + "events/applicationEvents")];
    });

    describe("addEventListener", function () {
        it("adds event name with application prepended", function () {
            var eventName = "MostAwesomeEventEver",
                trigger = function () {};
            appEvents.addEventListener(eventName, trigger);
            expect(mockedApplication.on).toHaveBeenCalledWith(appEventPrefix + eventName, trigger);
        });

        it("warns in the console if the eventName is falsey", function () {
            var eventName = false,
                trigger = function () {};
            spyOn(console, "warn");
            appEvents.addEventListener(eventName, trigger);
            expect(mockedApplication.on).not.toHaveBeenCalledWith(appEventPrefix + eventName, trigger);
            expect(console.warn).toHaveBeenCalledWith(jasmine.any(String));
        });
    });

    describe("removeEventListener", function () {
        it("adds event name with application prepended", function () {
            var eventName = "MostAwesomeEventEver",
                trigger = function () {};
            appEvents.removeEventListener(eventName, trigger);
            expect(mockedApplication.un).toHaveBeenCalledWith(appEventPrefix + eventName, trigger);
        });

        it("warns in the console if the eventName is falsey", function () {
            var eventName = false,
                trigger = function () {};
            spyOn(console, "warn");
            appEvents.removeEventListener(eventName, trigger);
            expect(mockedApplication.un).not.toHaveBeenCalledWith(appEventPrefix + eventName, trigger);
            expect(console.warn).toHaveBeenCalledWith(jasmine.any(String));
        });
    });
});
