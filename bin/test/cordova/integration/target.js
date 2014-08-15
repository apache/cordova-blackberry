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
    path = require('path'),
    utils = require('../../../templates/project/cordova/lib/utils'),
    fs = require('fs'),
    shell = require("shelljs"),
    homevar = (process.platform === 'win32') ? 'USERPROFILE' : 'HOME',
    envhome = process.env[homevar],
    extension = utils.isWindows() ? ".bat" : "",
    CREATE_COMMAND = path.normalize(path.join(__dirname, "..", "..", "..", "create")) + extension,
    TARGET_COMMAND,
    _output,
    _code,
    tempFolder,
    appFolder,
    configPath;

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
        tempFolder = path.resolve('.tmp'+Date.now());
        appFolder = path.join(tempFolder, 'tempCordovaApp');
        TARGET_COMMAND = path.normalize(path.join(appFolder, "cordova", "target")) + extension;
        process.env[homevar] = tempFolder;
        shell.mkdir('-p', tempFolder);
        configPath = utils.getPropertiesFilePath();
        executeScript(CREATE_COMMAND, [appFolder]);
        _output = "";
    });
    afterEach(function () {
        shell.rm('-rf', tempFolder);
        process.env[homevar] = envhome;
    });

    it("should add a target", function () {
        var project,
            target;

        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "-p", "pass", "--pin", "DEADBEEF"]);
        project = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
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
        executeScript(TARGET_COMMAND, ["remove", "z10"]);
        project = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(Object.keys(project.targets).length).toEqual(0);
    });

    it("should list targets", function () {
        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "-p", "pass", "--pin", "DEADBEEF"]);
        executeScript(TARGET_COMMAND, ["add", "q10", "169.254.0.2", "-t", "device", "-p", "p455w02D", "--pin", "FACEFACE"]);
        executeScript(TARGET_COMMAND, []);
        expect(_output).toContain("z10\nq10");
    });

    it("should require name for add/remove", function () {
        executeScript(TARGET_COMMAND, ["add"], true);
        expect(_output).toContain("Target details not specified");
    });

    it("should require host for add", function () {
        executeScript(TARGET_COMMAND, ["add", "z10"], true);
        expect(_output).toContain("host is required");
    });

    it("should warn unrecognized command", function () {
        executeScript(TARGET_COMMAND, ["bleh"], true);
        expect(_output).toContain("Unrecognized command");
    });

    it("should warn invalid type", function () {
        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "bleh"], true);
        expect(_output).toContain("Invalid target type: bleh");
    });

    it("should warn invalid pin", function () {
        executeScript(TARGET_COMMAND, ["add", "z10", "169.254.0.1", "-t", "device", "--pin", "NOTAPIN!"], true);
        expect(_output).toContain("Invalid PIN: NOTAPIN!");
    });
});
