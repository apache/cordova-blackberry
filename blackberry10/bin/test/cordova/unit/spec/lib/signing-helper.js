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
