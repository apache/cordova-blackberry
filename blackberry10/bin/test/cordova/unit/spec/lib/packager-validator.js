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
    testData = require("./test-data"),
    testUtilities = require("./test-utilities"),
    localize = require(srcPath + "localize"),
    logger = require(srcPath + "logger"),
    packagerValidator = require(srcPath + "packager-validator"),
    signingUtils = require(srcPath + "signing-utils"),
    fs = require("fs"),
    cmd,
    extManager = {
        getExtensionBasenameByFeatureId: function (featureId) {
            if (featureId && featureId.indexOf("blackberry.") >= 0) {
                return featureId.substring(featureId.indexOf(".") + 1);
            } else {
                return null;
            }
        }
    };

describe("Packager Validator", function () {
    it("throws an exception when -g set and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = undefined;
        session.storepass = "myPassword";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "author.p12"));
    });

    it("throws an exception when --buildId set and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = undefined;
        session.buildId = "100";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "author.p12"));
    });

    it("throws an exception when -g set and bbidtoken.csk or barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = undefined;
        session.storepass = "myPassword";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "bbidtoken.csk"));
    });

    it("does not throw an exception when -g set and barsigner.csk was found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = "barsigner.csk";
        session.keystoreDb = "barsigner.db";
        session.storepass = "myPassword";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).not.toThrow();
    });

    it("throws an exception when --buildId set and bbbidtoken.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = undefined;
        session.buildId = "100";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "bbidtoken.csk"));
    });

    it("throws an exception when -g set and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = undefined;
        session.storepass = "myPassword";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.db"));
    });

    it("throws an exception when --buildId set and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = undefined;
        session.buildId = "100";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.db"));
    });

    it("generated a warning when Build ID is set in config and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //Mock the logger
        spyOn(logger, "warn");

        //setup signing parameters
        session.keystore = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";

        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "author.p12"));
    });

    it("generated a warning when Build ID is set in config and bbidtoken.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //Mock the logger
        spyOn(logger, "warn");

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";

        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "bbidtoken.csk"));
    });

    it("generated a warning when Build ID is set in config and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //Mock the logger
        spyOn(logger, "warn");

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";

        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "barsigner.db"));
    });

    it("throws an exception when appdesc was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup appdesc which is not existing
        session.buildId = undefined;
        configObj.buildId = undefined;
        session.appdesc = "c:/bardescriptor.xml";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_APPDESC_NOT_FOUND", "c:/bardescriptor.xml"));
    });

    it("throws an exception when --buildId was set with no password [-g]", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = signingUtils.getDefaultPath("author.p12");
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = "c:/barsigner.db";
        session.storepass = undefined;
        session.buildId = "100";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_PASSWORD"));
    });
});

describe("Packager Validator: validateConfig", function () {
    it("does not remove APIs that do exist from features whitelist", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = {
                accessList: [{
                    features: [{
                        id: "blackberry.identity",
                        required: true,
                        version: "1.0.0.0"
                    }, {
                        version: "1.0.0.0",
                        required: true,
                        id: "blackberry.event"
                    }],
                    uri: "WIDGET_LOCAL",
                    allowSubDomain: true
                }]
            };

        spyOn(fs, "existsSync").andCallFake(function () {
            //since both of these APIs exist, existsSync would return true
            return true;
        });

        packagerValidator.validateConfig(session, configObj, extManager);
        expect(configObj.accessList[0].features.length).toEqual(2);


    });

    it("does not crash if user whitelists a feature with no id", function () {
        var session = testUtilities.cloneObj(testData.session),
        configObj = {
            accessList: [{
                features: [{
                    id: "blackberry.identity",
                    required: true,
                    version: "1.0.0.0"
                }, {
                    version: "1.0.0.0",
                    required: true,
                }],
                uri: "WIDGET_LOCAL",
                allowSubDomain: true
            }]
        };
        spyOn(logger, "warn");

        spyOn(fs, "existsSync").andCallFake(function () {
            //since both of these APIs exist, existsSync would return true
            return true;
        });

        expect(function () {
            packagerValidator.validateConfig(session, configObj, extManager);
        }).not.toThrow();
    });

});
