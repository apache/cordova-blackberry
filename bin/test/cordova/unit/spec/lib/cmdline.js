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

var srcPath = __dirname + "/../../../../../templates/project/cordova/lib/",
    localize = require(srcPath + "localize"),
    cmdline = require(srcPath + "cmdline"),
    cmd;

describe("Command line", function () {
    beforeEach(function () {
        cmd = cmdline
                .parse([])
                .commander;
    });

    it("accepts -o with argument", function () {
        cmd.parseOptions(["-o", "outdir"]);
        expect(cmd.output).toEqual("outdir");
    });

    it("arg following -o is required", function () {
        spyOn(process, "exit");
        spyOn(console, "error");
        cmd.parseOptions(["-o"]);
        expect(console.error).toHaveBeenCalled();
        expect(process.exit).toHaveBeenCalled();
    });

    it("accepts -s without argument", function () {
        cmd.parseOptions(["-s"]);
        expect(cmd.source).toBeTruthy();
    });

    it("accepts -s with argument", function () {
        cmd.parseOptions(["-s", "mySourceDir"]);
        expect(cmd.source).toEqual("mySourceDir");
    });

    it("accepts -d", function () {
        cmd.parseOptions(["-d"]);
        expect(cmd.debug).toBeTruthy();
    });

    it("accepts --loglevel with argument", function () {
        cmd.parseOptions(["--loglevel", "warn"]);
        expect(cmd.loglevel).toBe("warn");
    });

    it("accepts -l", function () {
        cmd.parseOptions(["-l", "error"]);
        expect(cmd.loglevel).toBe("error");
    });

    it("accepts -g with argument", function () {
        cmd.parseOptions(["-g", "myPassword"]);
        expect(cmd.password).toEqual("myPassword");
    });

    it("accepts --buildId with argument", function () {
        cmd.parseOptions(["--buildId", "100"]);
        expect(cmd.buildId).toEqual("100");
    });

    it("accepts -buildId with argument", function () {
        cmd.parseOptions(["-buildId", "100"]);
        expect(cmd.buildId).toEqual("100");
    });

    it("accepts --appdesc with argument", function () {
        cmd.parseOptions(["--appdesc", "bardescriptor"]);
        expect(cmd.appdesc).toEqual("bardescriptor");
    });

    it("throws an error for invalid multi-word arguments", function () {
        expect(function () {
            require(srcPath + "cmdline").parse(["--src"]);
        }).toThrow(localize.translate("EXCEPTION_CMDLINE_ARG_INVALID", "--src"));
    });

});
