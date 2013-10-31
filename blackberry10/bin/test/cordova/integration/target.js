/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var childProcess = require('child_process'),
    tempFolder = '.tmp/',
    appFolder = tempFolder + 'tempCordovaApp/',
    projectFile = 'project.json',
    wrench = require('wrench'),
    utils = require('../../../lib/utils'),
    fs = require('fs'),
    path = require('path'),
    shell = require("shelljs"),
    configPath = utils.getPropertiesFilePath(),
    testAppCreated = false,
    _output = "",
    _code,
    CREATE_COMMAND = path.normalize(__dirname + "/../../../create") + (utils.isWindows() ? ".bat" : ""),
    TARGET_COMMAND = path.normalize(appFolder + "cordova/target") + (utils.isWindows() ? ".bat" : "");

function executeScript(shellCommand, args, shouldFail) {
    var strCommand = "\"" + shellCommand + "\" " + args.join(" "),
        result;

    //console.log("CREATE About to execute ", strCommand, (new Date()), "\n\n\n");
    result = shell.exec(strCommand, {silent: true, async: false});
    //console.log(result.output, "\n\n\n");
    //console.log("Finished executing  with code ", result.code, " at ", (new Date()), "\n\n\n");
    _output = result.output;
    _code = result.code;
}

describe("cordova/target tests", function () {
    beforeEach(function () {
        utils.copyFile(configPath, path.join(utils.getCordovaDir(), "bb10bak"));
        fs.unlinkSync(configPath);
        if (!testAppCreated) {
            executeScript(CREATE_COMMAND , [appFolder]);
            testAppCreated = true;
        }
    });

    afterEach(function () {
        utils.copyFile(path.join(utils.getCordovaDir(), "bb10bak", utils.getPropertiesFileName()), path.join(utils.getCordovaDir()));
        wrench.rmdirSyncRecursive(path.join(utils.getCordovaDir(), "bb10bak"));
    });

    it("should add a target", function () {
        var project,
            target;

        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "-p", "pass", "--pin", "DEADBEEF"]);
        project = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(project.defaultTarget).toEqual("z10");
        expect(Object.keys(project.targets).length).toEqual(1);
        target = project.targets.z10;
        expect(target.ip).toEqual("169.254.0.1");
        expect(target.type).toEqual("device");
        expect(target.password).toEqual("pass");
        expect(target.pin).toEqual("DEADBEEF");
        expect(_code).toEqual(0);
    });

    it("should remove a target", function () {
        var project;

        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "-p", "pass", "--pin", "DEADBEEF"]);
        executeScript(TARGET_COMMAND , ["remove", "z10"]);
        project = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(project.defaultTarget).toEqual("");
        expect(Object.keys(project.targets).length).toEqual(0);
        expect(_output).toContain("Deleting default target, please set a new default target");
    });

    it("should set default target", function () {
        var project;

        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "-p", "pass", "--pin", "DEADBEEF"]);
        executeScript(TARGET_COMMAND, ["add", "q10", "169.254.0.2", "-t", "device", "-p", "p455w02D", "--pin", "FACEFACE"]);
        executeScript(TARGET_COMMAND, ["default", "q10"]);
        project = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(project.defaultTarget).toEqual("q10");
    });

    it("should list targets", function () {
        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "-p", "pass", "--pin", "DEADBEEF"]);
        executeScript(TARGET_COMMAND, ["add", "q10", "169.254.0.2", "-t", "device", "-p", "p455w02D", "--pin", "FACEFACE"]);
        executeScript(TARGET_COMMAND, []);
        expect(_output).toContain("* z10\n  q10");
    });

    it("should require name for add/remove", function () {
        executeScript(TARGET_COMMAND, ["add"], true);
        expect(_output).toContain("Target details not specified");
    });

    it("should require ip for add", function () {
        executeScript(TARGET_COMMAND, ["add", "z10"], true);
        expect(_output).toContain("IP is required");
    });

    it("should warn unregonized command", function () {
        executeScript(TARGET_COMMAND, ["bleh"], true);
        expect(_output).toContain("Unrecognized command");
    });

    it("should warn invalid ip", function () {
        executeScript(TARGET_COMMAND, ["add", "z10", "256.254.0.1"], true);
        expect(_output).toContain("Invalid IP: 256.254.0.1");
    });

    it("should warn invalid type", function () {
        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "bleh"], true);
        expect(_output).toContain("Invalid target type: bleh");
    });

    it("should warn invalid pin", function () {

        //keep this in last test to remove test app
        this.after(function() {
            wrench.rmdirSyncRecursive(tempFolder);
        });

        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "--pin", "NOTAPIN!"], true);
        expect(_output).toContain("Invalid PIN: NOTAPIN!");
    });
});
