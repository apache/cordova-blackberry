/*jshint sub:true*/

var testData = require("./test-data"),
    fs = require("fs"),
    path = require("path"),
    extManager = require(testData.libPath + "/extension-manager"),
    packagerUtils = require(testData.libPath + "/packager-utils"),
    configParser = require(testData.libPath + "/config-parser"),
    logger = require(testData.libPath + "/logger"),
    configPath = path.resolve("test/config.xml"),
    testUtilities = require("./test-utilities"),
    session = testData.session,
    mockParsing = testUtilities.mockParsing,
    result;

function loadModule(module) {
    var isGlobal = false,
        namespace,
        dependencies = [];

    module = module.split(path.sep);

    if (module.indexOf("app") >= 0) {
        namespace = "blackberry.app";
    } else if (module.indexOf("event") >= 0) {
        namespace = "blackberry.event";
        isGlobal = true;
    } else if (module.indexOf("identity") >= 0) {
        namespace = "blackberry.identity";
    } else if (module.indexOf("system") >= 0) {
        namespace = "blackberry.system";
    } else if (module.indexOf("complex") >= 0) {
        namespace = "abc.xyz";
        dependencies = ["app", "system"];
    }

    return {
        "global": isGlobal,
        "namespace": namespace,
        "dependencies": dependencies
    };
}

describe("Extension manager", function () {

    beforeEach(function () {
        spyOn(fs, "existsSync").andReturn(true);
        spyOn(fs, "readdirSync").andReturn(["app", "event", "system", "identity", "complex"]);
        spyOn(packagerUtils, "loadModule").andCallFake(loadModule);

    });

    it("initialize returns the actual extension manager object", function () {
        result = extManager.initialize(session);
        expect(result.getGlobalFeatures).toBeDefined();
        expect(result.getAllExtensionsToCopy).toBeDefined();
        expect(result.getExtensionBasenameByFeatureId).toBeDefined();
        expect(result.getFeatureIdByExtensionBasename).toBeDefined();
    });

    it("getGlobalFeatures returns array of all global features", function () {
        expect(result.getGlobalFeatures().length).toBe(1);
        expect(result.getGlobalFeatures()).toContain({
            id: "blackberry.event"
        });
    });

    it("getAllExtensionsToCopy returns array of all extensions that need to be copied (including dependencies)", function () {
        var data = testUtilities.cloneObj(testData.xml2jsConfig);

        data["access"] = {
            "@": {
                uri: "http://rim.net",
                subdomains: "true"
            },
            feature: [{
                "@": { id: "abc.xyz" }
            }, {
                "@": { id: "blackberry.system"}
            }]
        };

        mockParsing(data);

        spyOn(fs, "readFileSync");
        spyOn(fs, "writeFileSync");

        configParser.parse(configPath, session, result, function (config) {
            var allExt = result.getAllExtensionsToCopy(config.accessList);
            expect(allExt).toContain("complex");
            expect(allExt).toContain("app");
            expect(allExt).toContain("system");
            expect(allExt).toContain("event");
            expect(allExt.length).toBe(4);
        });
    });

    it("getAllExtensionsToCopy does not throw error when access list contains non-existent feature", function () {
        var data = testUtilities.cloneObj(testData.xml2jsConfig);

        data["access"] = {
            "@": {
                uri: "http://blah.com",
                subdomains: "true"
            },
            feature: [{
                "@": { id: "i.am.bad" }
            }, {
                "@": { id: "i.am.bad.too"}
            }]
        };

        mockParsing(data);

        spyOn(fs, "readFileSync");
        spyOn(fs, "writeFileSync");
        spyOn(logger, "warn");

        expect(function () {
            configParser.parse(configPath, session, result, function (config) {
                var allExt = result.getAllExtensionsToCopy(config.accessList);

                expect(logger.warn).toHaveBeenCalled();
                expect(allExt).toContain("event");
                expect(allExt.length).toBe(1);
            });
        }).not.toThrow();
    });

    it("getExtensionBasenameByFeatureId returns extension basename given feature id", function () {
        expect(result.getExtensionBasenameByFeatureId("abc.xyz")).toBe("complex");
        expect(result.getExtensionBasenameByFeatureId("blackberry.event")).toBe("event");
        expect(result.getExtensionBasenameByFeatureId("not.exists")).not.toBeDefined();
    });

    it("getFeatureIdByExtensionBasename returns feature id given extension basename", function () {
        expect(result.getFeatureIdByExtensionBasename("system")).toBe("blackberry.system");
        expect(result.getFeatureIdByExtensionBasename("app")).toBe("blackberry.app");
    });
});
