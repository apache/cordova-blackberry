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
    barconf = require(srcPath + "bar-conf.js"),
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    packager_utils = require(srcPath + "packager-utils"),
    localize = require(srcPath + "localize"),
    wrench = require("wrench"),
    logger = require(srcPath + "logger"),
    conf = require(srcPath + "conf"),
    fileMgr = require(srcPath + "file-manager"),
    testData = require("./test-data"),
    testUtilities = require("./test-utilities"),
    session = testData.session,
    extManager = {
        getAllExtensionsToCopy: function (accessList) {
            return ["app"];
        },
        getFeatureIdByExtensionBasename: function (extBasename) {
            return "blackberry." + extBasename;
        }
    };

describe("File manager", function () {

    beforeEach(function () {
        wrench.mkdirSyncRecursive(testData.session.outputDir);
    });

    afterEach(function () {
        //cleanup packager-tests temp folder
        wrench.rmdirSyncRecursive(testData.session.outputDir);
    });

    it("unzip() should extract 'from' zip file to 'to' directory", function () {
        var from = session.archivePath,
            to = session.sourceDir;

        fileMgr.unzip(from, to);

        expect(fs.statSync(session.sourceDir + "/a").isDirectory()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/a/dummy.txt").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/a/b").isDirectory()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/a/b/dummy2.txt").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/startPage.html").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/config.xml").isFile()).toBeTruthy();
        expect(fs.statSync(session.sourceDir + "/test.png").isFile()).toBeTruthy();
    });

    it("cleanSource() should delete source folder", function () {
        //Create packager-tests source folder
        wrench.mkdirSyncRecursive(session.sourceDir);

        fileMgr.cleanSource(session);
        expect(fs.existsSync(session.sourceDir)).toBeFalsy();
    });

    it("prepareOutputFiles() should throw an error if the archive path doesn't exist", function () {
        spyOn(wrench, "copyDirSyncRecursive");
        var tempSession = testUtilities.cloneObj(session);
        tempSession.archivePath = path.resolve("test/non-existant.zip");
        expect(function () {
            fileMgr.prepareOutputFiles(tempSession);
        }).toThrow(localize.translate("EXCEPTION_INVALID_ARCHIVE_PATH", tempSession.archivePath));
    });

});
