var srcPath = __dirname + "/../../../lib/",
    testData = require("./test-data"),
    testUtilities = require("./test-utilities"),
    localize = require(srcPath + "localize"),
    logger = require(srcPath + "logger"),
    packagerValidator = require(srcPath + "packager-validator"),
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

    it("throws an exception when -g set and barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = undefined;
        session.storepass = "myPassword";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.csk"));
    });

    it("throws an exception when --buildId set and barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = undefined;
        session.buildId = "100";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.csk"));
    });

    it("throws an exception when -g set and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = "c:/author.p12";
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
        session.keystore = "c:/author.p12";
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

    it("generated a warning when Build ID is set in config and barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //Mock the logger
        spyOn(logger, "warn");

        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";

        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "barsigner.csk"));
    });

    it("generated a warning when Build ID is set in config and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //Mock the logger
        spyOn(logger, "warn");

        //setup signing parameters
        session.keystore = "c:/author.p12";
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

    it("throws an exception when a password [-g] was set with no buildId", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = "c:/barsigner.db";
        session.storepass = "myPassword";
        configObj.buildId = undefined;

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_BUILDID"));
    });

    it("throws an exception when --buildId was set with no password [-g]", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = "c:/barsigner.db";
        session.storepass = undefined;
        session.buildId = "100";

        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_PASSWORD"));
    });

    it("generates a warning when the config contains a build id and no password was provided[-g]", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);

        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.storepass = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";

        //Mock the logger
        spyOn(logger, "warn");

        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_SIGNING_PASSWORD_EXPECTED"));
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

    it("removes non-existing APIs from features whitelist", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = {
                accessList: [{
                    features: [{
                        version: "1.0.0.0",
                        required: true,
                        id: "abc.def.ijk"
                    }, {
                        id: "blackberry.identity",
                        required: true,
                        version: "1.0.0.0"
                    }, {
                        version: "1.0.0.0",
                        required: true,
                        id: "abc.def.mno"
                    }, {
                        version: "1.0.0.0",
                        required: true,
                        id: "abc.def.qrp"
                    }, {
                        version: "1.0.0.0",
                        required: true,
                        id: "blackberry.event"
                    }],
                    uri: "WIDGET_LOCAL",
                    allowSubDomain: true
                }]
            };


        spyOn(fs, "existsSync").andCallFake(function (dir) {
            return dir.indexOf("abc") !== -1 ? false : true;
        });

        spyOn(logger, "warn");

        packagerValidator.validateConfig(session, configObj, extManager);
        //expecting the features list to have shortened by 3, since 3 of these APIs does not exist
        expect(configObj.accessList[0].features.length).toEqual(2);
        //expecting warning to be logged to console because API "abc.def.ijk", "abc.def.mno", and "abc.def.qrp" do not exist"
        expect(logger.warn.calls.length).toBe(3);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", "abc.def.ijk"));
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", "abc.def.mno"));
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", "abc.def.qrp"));
    });

    it("removes non-existing APIs from accessList with multiple features lists", function () {
        var session = testUtilities.cloneObj(testData.session),
        configObj = {
            accessList: [{
                features: [{
                    id: "blackberry.identity",
                    required: true,
                    version: "1.0.0.0"
                }, {
                    version: "blackberry.app",
                    required: true,
                    id: "blackberry.app"
                }],
                uri: "WIDGET_LOCAL",
                allowSubDomain: true
            }, {
                features: [{
                    id: "blackberry.identity",
                    required: true,
                    version: "1.0.0.0"
                }, {
                    id: "abc.def.ijk",
                    required: true,
                    version: "1.0.0.0"
                }],
                uri: "www.cnn.com",
                allowSubDomain: true
            }]
        };
        spyOn(logger, "warn");

        spyOn(fs, "existsSync").andCallFake(function (dir) {
            return dir.indexOf("abc") !== -1 ? false : true;
        });

        packagerValidator.validateConfig(session, configObj, extManager);
        expect(configObj.accessList[0].features.length).toEqual(2);
        expect(configObj.accessList[1].features.length).toEqual(1);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", "abc.def.ijk"));
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
