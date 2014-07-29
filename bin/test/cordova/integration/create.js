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
    tempFolder = '.tmp'+Date.now(),
    appFolder = path.join(tempFolder, 'tempCordovaApp'),
    wrench = require('wrench'),
    utils = require('../../../templates/project/cordova/lib/utils'),
    fs = require('fs'),
    shell = require("shelljs"),
    _output = "",
    CREATE_COMMAND = path.normalize(path.join(__dirname, "..", "..", "..", "create")) + (utils.isWindows() ? ".bat" : "");

function executeScript(shellCommand, args, shouldError) {
    var strCommand = "\"" + shellCommand + "\" " + args.join(" "),
        result;

    //console.log("CREATE About to execute ", strCommand, (new Date()), "\n\n\n");
    result = shell.exec(strCommand, {silent: true, async: false});
    //console.log(result.output, "\n\n\n");
    //console.log("Finished executing  with code ", result.code, " at ", (new Date()), "\n\n\n");
    _output = result.output;
}

function clearTempFolder(args) {
    if (fs.existsSync(tempFolder)) {
        wrench.rmdirSyncRecursive(tempFolder);
    }
}

describe("create tests", function () {
    beforeEach(function () {
        clearTempFolder();
    });
    afterEach(function () {
        clearTempFolder();
    });
    it("creates project", function () {
        var appIdRegExp = /id="default\.app\.id"/g;
        executeScript(CREATE_COMMAND, [appFolder]);
        expect(appIdRegExp.test(fs.readFileSync(path.join(appFolder, "www", "config.xml"), "utf-8"))).toEqual(true);
        expect(fs.existsSync(appFolder)).toEqual(true);
        expect(fs.existsSync(path.join(appFolder, "cordova"))).toEqual(true);
        expect(fs.existsSync(path.join(appFolder, "cordova", "node_modules"))).toEqual(true);
        expect(fs.existsSync(path.join(appFolder, "cordova", "lib"))).toEqual(true);
        expect(fs.existsSync(path.join(appFolder, "cordova", "third_party"))).toEqual(true);
        expect(fs.existsSync(path.join(appFolder, "www"))).toEqual(true);
        expect(fs.existsSync("./build")).toEqual(false);
    });

    it("sets appId", function () {
        var configEt,
            appIdRegExp = /id="com\.example\.bb10app"/g;

        executeScript(CREATE_COMMAND, [appFolder, "com.example.bb10app"]);
        expect(appIdRegExp.test(fs.readFileSync(path.join(appFolder, "www", "config.xml"), "utf-8"))).toEqual(true);
    });

    it("sets appId and barName", function () {
        var appIdRegExp = /id="com\.example\.bb10app"/g;
        executeScript(CREATE_COMMAND, [appFolder, "com.example.bb10app", "bb10appV1"]);
        expect(appIdRegExp.test(fs.readFileSync(path.join(appFolder, "www", "config.xml"), "utf-8"))).toEqual(true);
    });

    it("No args", function () {
        executeScript(CREATE_COMMAND, [], true);
        expect(_output).toContain("You must give a project PATH");
    });

    it("Empty dir error", function () {
        wrench.mkdirSyncRecursive(tempFolder);
        executeScript(CREATE_COMMAND, [tempFolder], true);
        expect(_output).toContain("The project path must be an empty directory");
    });

    it("Invalid appId error", function () {
        executeScript(CREATE_COMMAND, [appFolder, "23.21#$"], true);
        expect(_output).toContain("App ID must be sequence of alpha-numeric (optionally separated by '.') characters, no longer than 50 characters");
    });

});
