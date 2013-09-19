/*
 *
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
 *
*/

var testData = require('./test-data'),
    signingHelper = require(testData.libPath + '/signing-helper'),
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

describe("signing-helper", function () {

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

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("\\Local Settings");
        });

        it("can find barsigner.csk in Local Settings", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingHelper.getCskPath();
            expect(result).toContain("\\Local Settings");
        });

        it("can find barsigner.db in Local Settings", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingHelper.getDbPath();
            expect(result).toContain("\\Local Settings");
        });

        it("can find keys in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("\\AppData");
        });

        it("can find barsigner.csk in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingHelper.getCskPath();
            expect(result).toContain("\\AppData");
        });

        it("can find barsigner.db in AppData", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("\\AppData") !== -1;
            });

            var result = signingHelper.getDbPath();
            expect(result).toContain("\\AppData");
        });

        it("can find keys in home path", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (p) {
                return p.indexOf("\\Users\\user") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("\\Users\\user");
        });

        it("can find keys on C drive", function () {

            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (p) {
                return p.indexOf("C:") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("C:");
        });

        it("can find keys on a drive other than C", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("D:");
        });

        it("can find barsigner.csk on a drive other than C", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingHelper.getCskPath();
            expect(result).toContain("D:");
        });

        it("can find barsigner.db on a drive other than C", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "D:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("D:") !== -1;
            });

            var result = signingHelper.getDbPath();
            expect(result).toContain("D:");
        });

        it("can find keys in Local Settings on the correct drive", function () {
            process.env.HOMEPATH = "\\Users\\user";
            process.env.HOMEDRIVE = "C:";

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("C:") !== -1 &&
                        path.indexOf("\\Local Settings") !== -1;
            });

            var result = signingHelper.getKeyStorePath();
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

            var result = signingHelper.getCskPath();
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

            var result = signingHelper.getDbPath();
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

            var result = signingHelper.getKeyStorePath();
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

            var result = signingHelper.getCskPath();
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

            var result = signingHelper.getDbPath();
            expect(result).toContain("D:");
            expect(result).toContain("\\AppData");
        });

        it("returns undefined when keys cannot be found", function () {
            spyOn(fs, "existsSync").andReturn(false);

            var result = signingHelper.getKeyStorePath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.csk cannot be found", function () {
            spyOn(fs, "existsSync").andReturn(false);

            var result = signingHelper.getCskPath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.db cannot be found", function () {
            spyOn(fs, "existsSync").andReturn(false);

            var result = signingHelper.getDbPath();
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

            var result = signingHelper.getKeyStorePath();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("can find barsigner.csk in the Library folder", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });

            var result = signingHelper.getCskPath();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("can find barsigner.db in the Library folder", function () {

            spyOn(fs, "existsSync").andCallFake(function (path) {
                return path.indexOf("/Library/Research In Motion/") !== -1;
            });

            var result = signingHelper.getDbPath();
            expect(result).toContain("/Library/Research In Motion/");
        });

        it("returns undefined when keys cannot be found", function () {

            spyOn(fs, "existsSync").andReturn(false);

            var result = signingHelper.getKeyStorePath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.csk cannot be found", function () {

            spyOn(fs, "existsSync").andReturn(false);

            var result = signingHelper.getCskPath();
            expect(result).toBeUndefined();
        });

        it("returns undefined when barsigner.db cannot be found", function () {

            spyOn(fs, "existsSync").andReturn(false);

            var result = signingHelper.getDbPath();
            expect(result).toBeUndefined();
        });
    });

    describe("Exec blackberry-signer", function () {
        var stdoutOn = jasmine.createSpy("stdout on"),
            stderrOn = jasmine.createSpy("stderr on");

        beforeEach(function () {
            session = testData.session;
            session.keystore = "/blah/author.p12";
            session.storepass = "123";
            session.barPath = path.normalize("c:/%s/" + "Demo.bar");

            spyOn(childProcess, "exec").andReturn({
                stdout: {
                    on: stdoutOn
                },
                stderr: {
                    on: stderrOn
                },
                on: jasmine.createSpy("on").andCallFake(function (event, callback) {
                    if (callback && typeof callback === "function") {
                        callback(0);
                    }
                })
            });
        });

        it("exec blackberry-signer without extra params", function () {
            var callback = jasmine.createSpy("callback"),
                cmd = "blackberry-signer";

            session.getParams = jasmine.createSpy("session getParams").andReturn(null);
            signingHelper.execSigner(session, "device", callback);
            expect(childProcess.exec).toHaveBeenCalledWith([cmd, "-keystore", session.keystore, "-storepass", session.storepass, path.resolve("c:/device/Demo.bar")].join(" "), jasmine.any(Object), callback);
            expect(stdoutOn).toHaveBeenCalledWith("data", pkgrUtils.handleProcessOutput);
            expect(stderrOn).toHaveBeenCalledWith("data", pkgrUtils.handleProcessOutput);
        });

        it("exec blackberry-signer with extra params", function () {
            var callback = jasmine.createSpy("callback"),
                cmd = "blackberry-signer";

            session.getParams = jasmine.createSpy("session getParams").andReturn({
                "-proxyhost": "abc.com",
                "-proxyport": "80"
            });
            signingHelper.execSigner(session, "device", callback);
            expect(childProcess.exec.mostRecentCall.args[0]).toContain(cmd);
            expect(childProcess.exec.mostRecentCall.args[0]).toContain("-keystore");
            expect(childProcess.exec.mostRecentCall.args[0]).toContain(session.keystore);
            expect(childProcess.exec.mostRecentCall.args[0]).toContain("-storepass");
            expect(childProcess.exec.mostRecentCall.args[0]).toContain(session.storepass);
            expect(childProcess.exec.mostRecentCall.args[0]).toContain("-proxyport");
            expect(childProcess.exec.mostRecentCall.args[0]).toContain("80");
            expect(childProcess.exec.mostRecentCall.args[0]).toContain("-proxyhost");
            expect(childProcess.exec.mostRecentCall.args[0]).toContain("abc.com");
            expect(childProcess.exec.mostRecentCall.args[0]).toContain(path.resolve("c:/device/Demo.bar"));
            expect(stdoutOn).toHaveBeenCalledWith("data", pkgrUtils.handleProcessOutput);
            expect(stderrOn).toHaveBeenCalledWith("data", pkgrUtils.handleProcessOutput);
        });
    });
});
