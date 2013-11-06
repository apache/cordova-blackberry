/*
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
var testData = require('./test-data'),
    signingUtils = require(testData.libPath + '/signing-utils'),
    localize = require(testData.libPath + '/localize'),
    pkgrUtils = require(testData.libPath + "/packager-utils"),
    conf = require(testData.libPath + "/conf"),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    childProcess = require("child_process"),
    properties = {
        homepath: "",
        homedrive: ""
    },
    session;

describe("signing-utils", function () {

    describe("on windows", function () {

        beforeEach(function () {

            /* Preserve the value of the HOMEPATH and HOMEDRIVE environment
             * variables if they are defined. If they are not defined, mark
             * variable for deletion after the test.*/
            if (typeof process.env.HOMEPATH === 'undefined') {
                properties.homepath = "delete";
            } else {
                properties.homepath = process.env.HOMEPATH;
            }

            if (typeof process.env.HOMEDRIVE === 'undefined') {
                properties.homedrive = "delete";
            } else {
                properties.homedrive = process.env.HOMEDRIVE;
            }

            spyOn(os, "type").andReturn("windows");
        });

        afterEach(function () {

            /* Restore the value of the HOMEPATH and HOMEDRIVE environment
             * variables if they are defined. If they are not defined, delete
             * the property if it was defined in the test.*/
            if (typeof process.env.HOMEPATH === 'string') {
                if (properties.homepath === 'delete') {
                    delete process.env.HOMEPATH;
                } else {
                    process.env.HOMEPATH = properties.homepath;
                }
            }

            if (typeof process.env.HOMEDRIVE === 'string') {
                if (properties.homedrive === 'delete') {
                    delete process.env.HOMEDRIVE;
                } else {
                    process.env.HOMEDRIVE = properties.homedrive;
                }
            }
        });

        it("can find keys in Local Settings", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("\\Local Settings");
        });

        it("can find bbidtoken.csk in Local Settings", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getKeyStorePathBBID();
            expect(result).toContain("\\Local Settings");
        });

        it("can find barsigner.csk in Local Settings", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getCskPath();
            expect(result).toContain("\\Local Settings");
        });

        it("can find barsigner.db in Local Settings", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getDbPath();
            expect(result).toContain("\\Local Settings");
        });

        it("can find keys in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("\\AppData");
        });

        it("can find bbidtoken.csk in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getKeyStorePathBBID();
            expect(result).toContain("\\AppData");
        });

        it("can find barsigner.csk in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getCskPath();
            expect(result).toContain("\\AppData");
        });

        it("can find barsigner.db in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getDbPath();
            expect(result).toContain("\\AppData");
        });

        it("can find keys in home path", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (p) {
                return p.indexOf("\\Users\\user") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("\\Users\\user");
        });

        it("can find keys on C drive", function () {

            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (p) {
                return p.indexOf("C:") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("C:");
        });

        it("can find keys on a drive other than C", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("D:");
        });

        it("can find bbidtoken.csk on a drive other than C", function() {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingUtils.getKeyStorePathBBID();
            expect(result).toContain("D:");
        });

        it("can find barsigner.csk on a drive other than C", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingUtils.getCskPath();
            expect(result).toContain("D:");
        });

        it("can find barsigner.db on a drive other than C", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingUtils.getDbPath();
            expect(result).toContain("D:");
        });

        it("can find keys in Local Settings on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("C:") !== -1 &&
                        path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("C:");
            expect(result).toContain("\\Local Settings");
        });

        it("can find bbidtoken.csk in Local Settings on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("C:") !== -1 &&
                        path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getKeyStorePathBBID();
            expect(result).toContain("C:");
            expect(result).toContain("\\Local Settings");
        });

        it("can find barsigner.csk in Local Settings on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1 &&
                        path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getCskPath();
            expect(result).toContain("D:");
            expect(result).toContain("\\Local Settings");
        });

        it("can find barsigner.db in Local Settings on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1 &&
                        path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingUtils.getDbPath();
            expect(result).toContain("D:");
            expect(result).toContain("\\Local Settings");
        });

        it("can find keys in AppData on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("C:") !== -1 &&
                        path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("C:");
            expect(result).toContain("\\AppData");
        });

        it("can find bbidtoken.csk in AppData on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("C:") !== -1 &&
                        path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getKeyStorePathBBID();
            expect(result).toContain("C:");
            expect(result).toContain("\\AppData");
        });

        it("can find barsigner.csk in AppData on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1 &&
                        path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getCskPath();
            expect(result).toContain("D:");
            expect(result).toContain("\\AppData");
        });

        it("can find barsigner.db in AppData on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1 &&
                        path.indexOf("\\AppData") !== -1;
            });

            var result = signingUtils.getDbPath();
            expect(result).toContain("D:");
            expect(result).toContain("\\AppData");
        });

        it("returns undefined when keys cannot be found", function () {
            spyOn(fs, "existsSync").andReturn(false);

            var result = signingUtils.getKeyStorePath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.csk cannot be found", function () {
            spyOn(fs, "existsSync").andReturn(false);

            var result = signingUtils.getCskPath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.db cannot be found", function () {
            spyOn(fs, "existsSync").andReturn(false);

            var result = signingUtils.getDbPath();
            expect(result).toBeUndefined();
        });
    });

    describe("on mac", function () {

        beforeEach(function () {
            spyOn(os, "type").andReturn("darwin");
        });

        it("can find keys in the Library folder", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });

            var result = signingUtils.getKeyStorePath();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("can find bbidtoken.csk in the Library folder", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });

            var result = signingUtils.getKeyStorePathBBID();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("can find barsigner.csk in the Library folder", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });

            var result = signingUtils.getCskPath();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("can find barsigner.db in the Library folder", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });

            var result = signingUtils.getDbPath();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("returns undefined when keys cannot be found", function () {

            spyOn(fs, "existsSync").andReturn(false);

            var result = signingUtils.getKeyStorePath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.csk cannot be found", function () {

            spyOn(fs, "existsSync").andReturn(false);

            var result = signingUtils.getCskPath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.db cannot be found", function () {

            spyOn(fs, "existsSync").andReturn(false);

            var result = signingUtils.getDbPath();
            expect(result).toBeUndefined();
        });
    });
});
