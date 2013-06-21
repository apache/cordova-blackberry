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
    path = require('path'),
    fs = require('fs'),
    shell = require("shelljs"),
    _output = "",
    CREATE_COMMAND = path.normalize(__dirname + "/../../../create") + (utils.isWindows() ? ".bat" : "");

function executeScript(shellCommand, args, shouldError) {
    var strCommand = "\"" + shellCommand + "\" " + args.join(" "),
        result;

    //console.log("CREATE About to execute ", strCommand, (new Date()), "\n\n\n");
    result = shell.exec(strCommand, {silent: true, async: false});
    //console.log(result.output, "\n\n\n");
    //console.log("Finished executing  with code ", result.code, " at ", (new Date()), "\n\n\n");
    _output = result.output;
}

describe("create tests", function () {
    it("creates project", function () {
        var project,
            appIdRegExp = /id="default\.app\.id"/g;
        executeScript(CREATE_COMMAND, [appFolder]);
        project = JSON.parse(fs.readFileSync(appFolder + projectFile, "utf-8"));
        expect(appIdRegExp.test(fs.readFileSync(appFolder + "www/config.xml", "utf-8"))).toEqual(true);
        expect(fs.existsSync(appFolder)).toEqual(true);
        expect(fs.existsSync(appFolder + "/plugins")).toEqual(true);
        expect(fs.existsSync(appFolder + "/cordova")).toEqual(true);
        expect(fs.existsSync(appFolder + "/cordova/node_modules")).toEqual(true);
        expect(fs.existsSync(appFolder + "/cordova/lib")).toEqual(true);
        expect(fs.existsSync(appFolder + "/cordova/third_party")).toEqual(true);
        expect(fs.existsSync(appFolder + "/www")).toEqual(true);
        expect(project.barName).toEqual("cordova-BB10-app");
        expect(project.defaultTarget).toEqual("");
        expect(project.targets).toEqual({});
        expect(fs.existsSync("./build")).toEqual(false);
        this.after(function () {
            wrench.rmdirSyncRecursive(tempFolder);
        });
    });

    it("sets appId", function () {
        var configEt,
            appIdRegExp = /id="com\.example\.bb10app"/g;

        executeScript(CREATE_COMMAND, [appFolder, "com.example.bb10app"]);
        expect(appIdRegExp.test(fs.readFileSync(appFolder + "www/config.xml", "utf-8"))).toEqual(true); 
        this.after(function () {
            wrench.rmdirSyncRecursive(tempFolder);
        });
    });

    it("sets appId and barName", function () {
        var project,
            appIdRegExp = /id="com\.example\.bb10app"/g;
        executeScript(CREATE_COMMAND, [appFolder, "com.example.bb10app", "bb10appV1"]);
        project = JSON.parse(fs.readFileSync(appFolder + projectFile, "utf-8"));
        expect(appIdRegExp.test(fs.readFileSync(appFolder + "www/config.xml", "utf-8"))).toEqual(true);
        expect(project.barName).toEqual("bb10appV1");
        this.after(function () {
            wrench.rmdirSyncRecursive(tempFolder);
        });
    });

    it("No args", function () {
        executeScript(CREATE_COMMAND, [], true);
        expect(_output).toContain("You must give a project PATH");  
    });

    it("Empty dir error", function () {
        executeScript(CREATE_COMMAND, ["./"], true);
        expect(_output).toContain("The project path must be an empty directory");   
    });

    it("Invalid appId error", function () {
        executeScript(CREATE_COMMAND, [appFolder, "23.21#$"], true);
        expect(_output).toContain("App ID must be sequence of alpha-numeric (optionally seperated by '.') characters, no longer than 50 characters");
    });

    it("Invalid barName error", function () {
        executeScript(CREATE_COMMAND, [appFolder, "com.example.app", "%bad@bar^name"], true);
        expect(_output).toContain("BAR filename can only contain alpha-numeric, '.', '-' and '_' characters");
    });
});
