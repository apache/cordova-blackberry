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

            spyOn(session, "getParams").andReturn(null);
            signingHelper.execSigner(session, "device", callback);
            expect(childProcess.exec.mostRecentCall.args[0]).toMatch(RegExp([cmd, "-keystore", session.keystore, "-storepass", session.storepass, path.resolve("c:/device/Demo.bar")].join(" ")));
            expect(childProcess.exec.mostRecentCall.args[2]).toBe(callback);
            expect(stdoutOn).toHaveBeenCalledWith("data", pkgrUtils.handleProcessOutput);
            expect(stderrOn).toHaveBeenCalledWith("data", pkgrUtils.handleProcessOutput);
        });

        it("exec blackberry-signer with extra params", function () {
            var callback = jasmine.createSpy("callback"),
                cmd = "blackberry-signer";

            spyOn(session, "getParams").andReturn({
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
