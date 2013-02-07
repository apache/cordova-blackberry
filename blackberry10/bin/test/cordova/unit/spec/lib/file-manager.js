var srcPath = __dirname + "/../../../lib/",
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

    it("prepareOutputFiles() should copy files and unzip archive", function () {
        spyOn(wrench, "copyDirSyncRecursive");
        fileMgr.prepareOutputFiles(session);

        expect(fs.existsSync(session.sourcePaths.CHROME)).toBeTruthy();
        expect(wrench.copyDirSyncRecursive).toHaveBeenCalledWith(session.conf.DEPENDENCIES_BOOTSTRAP, session.sourcePaths.CHROME);
        expect(fs.existsSync(session.sourcePaths.LIB)).toBeTruthy();
    });


    it("copyWWE() should copy wwe of the specified target", function () {
        spyOn(packager_utils, "copyFile");
        fileMgr.copyWWE(session, "simulator");

        expect(packager_utils.copyFile).toHaveBeenCalledWith(path.normalize(session.conf.DEPENDENCIES_BOOTSTRAP + "/wwe"), path.normalize(session.sourceDir));
    });

    it("copyExtensions() should copy all .js files required by features listed in config.xml", function () {
        var session = testData.session,
            featureId = "blackberry.app",
            extBasename = "app",
            toDir = path.join(session.sourcePaths.EXT, featureId),
            apiDir = path.resolve(session.conf.EXT, extBasename),

            //extension javascript files
            indexJS = path.join(apiDir, "index.js"),
            clientJS = path.join(apiDir, "client.js"),
            manifestJSON = path.join(apiDir, "manifest.json"),
            subfolderJS = path.join(apiDir, "/subfolder/myjs.js");//Sub folder js file


        spyOn(fs, "existsSync").andReturn(true);
        spyOn(wrench, "mkdirSyncRecursive");
        spyOn(packager_utils, "copyFile");

        //Mock the extension directory
        spyOn(wrench, "readdirSyncRecursive").andCallFake(function (directory) {
            return [
                indexJS,
                clientJS,
                manifestJSON,
                subfolderJS,
            ];
        });

        fileMgr.copyExtensions(testData.accessList, session, session.targets[0], extManager);

        //Extension directory is created
        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(toDir, "0755");

        //Javascript files are copied
        expect(packager_utils.copyFile).toHaveBeenCalledWith(indexJS, toDir, apiDir);
        expect(packager_utils.copyFile).toHaveBeenCalledWith(clientJS, toDir, apiDir);
        expect(packager_utils.copyFile).toHaveBeenCalledWith(manifestJSON, toDir, apiDir);
        expect(packager_utils.copyFile).toHaveBeenCalledWith(subfolderJS, toDir, apiDir);
    });

    it("copyExtensions() should copy .so files required by features listed in config.xml", function () {
        var session = testData.session,
            extBasename = "app",
            apiDir = path.resolve(session.conf.EXT, extBasename),
            soDest = session.sourcePaths.JNEXT_PLUGINS,

            //extension .so files
            simulatorSO = path.join(apiDir, "/simulator/myso.so"),//simulator so file
            deviceSO = path.join(apiDir, "/device/myso.so");//device so file


        spyOn(fs, "existsSync").andReturn(true);
        spyOn(wrench, "mkdirSyncRecursive");
        spyOn(packager_utils, "copyFile");

        //Mock the extension directory
        spyOn(wrench, "readdirSyncRecursive").andCallFake(function (directory) {
            return [
                simulatorSO,
                deviceSO
            ];
        });

        fileMgr.copyExtensions(testData.accessList, session, session.targets[0], extManager);

        //plugins/jnext output directory is created
        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(session.sourcePaths.JNEXT_PLUGINS, "0755");

        //The .so files are copied
        expect(packager_utils.copyFile).toHaveBeenCalledWith(simulatorSO, soDest);
        expect(packager_utils.copyFile).toHaveBeenCalledWith(deviceSO, soDest);
    });

    it("throws an error when the client.js file does not exist in ext folder", function () {
        var session = testData.session,
            accessList = testData.accessList;

        //When checking if client.js exists, return false
        spyOn(fs, "existsSync").andCallFake(function (mPath) {
            return mPath.indexOf("client.js") === -1;
        });

        //Return a dummy path
        spyOn(path, "resolve").andReturn("/I/DO/NOT/EXIST");

        expect(function () {
            fileMgr.copyExtensions(accessList, session, session.targets[0], extManager);
        }).toThrow(new Error(path.normalize(localize.translate("EXCEPTION_MISSING_FILE_IN_API_DIR", "client.js", "/I/DO/NOT/EXIST"))));
    });

    it("throws an error when the index.js file does not exist in ext folder", function () {
        var session = testData.session,
            accessList = testData.accessList;

        //When checking if client.js exists, return false
        spyOn(fs, "existsSync").andCallFake(function (mPath) {
            return mPath.indexOf("index.js") === -1;
        });

        //Return a dummy path
        spyOn(path, "resolve").andReturn("/I/DO/NOT/EXIST");

        expect(function () {
            fileMgr.copyExtensions(accessList, session, session.targets[0], extManager);
        }).toThrow(new Error(path.normalize(localize.translate("EXCEPTION_MISSING_FILE_IN_API_DIR", "index.js", "/I/DO/NOT/EXIST"))));
    });

    it("generateFrameworkModulesJS() should create frameworkModules.js", function () {
        var libFiles = [],
            extFiles = [],
            modulesArr;

        libFiles.push(path.normalize(session.sourcePaths.CHROME + "/lib/framework.js"));
        libFiles.push(path.normalize(session.sourcePaths.CHROME + "/lib/config/user.js"));
        libFiles.push(path.normalize(session.sourcePaths.CHROME + "/lib/plugins/bridge.js"));
        libFiles.push(path.normalize(session.sourcePaths.CHROME + "/lib/policy/whitelist.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.app/client.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.app/index.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.app/manifest.json"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.connection/client.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.connection/index.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.connection/manifest.json"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.event/client.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.event/index.js"));
        extFiles.push(path.normalize(session.sourcePaths.CHROME + "/ext/blackberry.event/manifest.json"));

        spyOn(wrench, "readdirSyncRecursive").andCallFake(function (path) {
            if (/ext$/.test(path)) {
                return extFiles;
            } else {
                return libFiles;
            }
        });
        spyOn(fs, "statSync").andReturn({
            isDirectory: function () {
                return false;
            }
        });
        spyOn(fs, "existsSync").andReturn(true);
        spyOn(JSON, "stringify");
        spyOn(fs, "writeFileSync");

        fileMgr.generateFrameworkModulesJS(session);

        modulesArr = JSON.stringify.mostRecentCall.args[0];
        modulesArr.forEach(function (module) {
            expect(module.match(/^lib\/|^ext\//)).toBeTruthy();
        });
        expect(modulesArr).toContain("lib/framework.js");
        expect(modulesArr).toContain("lib/config/user.js");
        expect(modulesArr).toContain("lib/plugins/bridge.js");
        expect(modulesArr).toContain("lib/policy/whitelist.js");
        expect(modulesArr).toContain("ext/blackberry.event/index.js");
        expect(modulesArr).not.toContain("ext/blackberry.app/manifest.json");
        expect(modulesArr).not.toContain("ext/blackberry.connection/manifest.json");
        expect(modulesArr).not.toContain("ext/blackberry.event/manifest.json");
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


    it("copyWebworks() should copy and rename versioned webworks.js", function () {
        fileMgr.copyWebworks(session);
        expect(fs.statSync(session.sourceDir + "/chrome/webworks.js").isFile()).toBeTruthy();
    });

    it("copyWebworks() throws an error when too many webworks.js files exist", function () {
        var tmpFilePath = path.normalize(session.conf.ROOT + "/clientFiles/webworks-1.0.0.2.js");
        fs.writeFileSync(tmpFilePath, "Mock webworks.js");
        expect(function () {
            fileMgr.copyWebworks(session);
        }).toThrow(new Error(localize.translate("EXCEPTION_WEBWORKS_JS_IN_CLIENT_FILES_DIR", 2)));
        fs.unlinkSync(tmpFilePath);
    });

    it("cleanSource() should delete source folder", function () {
        expect(fs.existsSync(session.sourceDir)).toBeTruthy();
        expect(fs.statSync(session.sourceDir).isDirectory()).toBeTruthy();
        fileMgr.cleanSource(session);
        expect(fs.existsSync(session.sourceDir)).toBeFalsy();
    });

    it("prepareOutputFiles() should copy files if a folder is sent in", function () {
        spyOn(wrench, "copyDirSyncRecursive");
        fileMgr.prepareOutputFiles(session);

        expect(fs.existsSync(session.sourcePaths.CHROME)).toBeTruthy();
        expect(wrench.copyDirSyncRecursive).toHaveBeenCalledWith(session.conf.DEPENDENCIES_BOOTSTRAP, session.sourcePaths.CHROME);
        expect(fs.existsSync(session.sourcePaths.LIB)).toBeTruthy();
    });

    it("prepareOutputFiles() should copy files if a folder is sent in without .bbwpignore", function () {
        var oldPathExistsSync = fs.existsSync;
        spyOn(fs, "existsSync").andCallFake(function (ipath) {
            return path.basename(ipath) === conf.BBWP_IGNORE_FILENAME ? false : oldPathExistsSync(ipath);
        });
        spyOn(wrench, "copyDirSyncRecursive");
        fileMgr.prepareOutputFiles(session);

        expect(fs.existsSync(session.sourcePaths.CHROME)).toBeTruthy();
        expect(wrench.copyDirSyncRecursive).toHaveBeenCalledWith(session.conf.DEPENDENCIES_BOOTSTRAP, session.sourcePaths.CHROME);
        expect(fs.existsSync(session.sourcePaths.LIB)).toBeTruthy();
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
