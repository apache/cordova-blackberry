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
    path = require("path"),
    wrench = require("wrench"),
    barBuilder = require(srcPath + "bar-builder"),
    fileMgr = require(srcPath + "file-manager"),
    nativePkgr = require(srcPath + "native-packager"),
    logger = require(srcPath + "logger"),
    testData = require("./test-data"),
    extManager = null;

describe("BAR builder", function () {
    it("build() create BAR for specified session", function () {
        var callback = jasmine.createSpy(),
            session = testData.session,
            config = testData.config,
            target = session.targets[0];

        wrench.mkdirSyncRecursive(path.join(session.sourcePaths.LIB, "config"));

        spyOn(wrench, "mkdirSyncRecursive");
        spyOn(fileMgr, "copyWebworks");
        spyOn(fileMgr, "generateFrameworkModulesJS");
        spyOn(nativePkgr, "exec").andCallFake(function (session, target, config, callback) {
            callback(0);
        });

        barBuilder.build(session, testData.config, callback);

        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(session.outputDir + "/" + target);
        expect(fileMgr.generateFrameworkModulesJS).toHaveBeenCalledWith(session);
        expect(nativePkgr.exec).toHaveBeenCalledWith(session, target, config, jasmine.any(Function));
        expect(callback).toHaveBeenCalledWith(0);
    });
});
