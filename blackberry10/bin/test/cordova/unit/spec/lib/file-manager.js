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

    afterEach(function () {
        //cleanup packager-tests temp folder
        wrench.rmdirSyncRecursive(testData.session.outputDir);
    });

    it("prepareOutputFiles() should copy files and unzip archive", function () {
        spyOn(wrench, "copyDirSyncRecursive");
        fileMgr.prepareOutputFiles(session);

        expect(fs.existsSync(session.sourcePaths.CHROME)).toBeTruthy();
        expect(wrench.copyDirSyncRecursive).toHaveBeenCalledWith(session.conf.DEPENDENCIES_BOOTSTRAP, session.sourcePaths.CHROME);
        expect(fs.existsSync(session.sourcePaths.LIB)).toBeTruthy();
    });


    it("copyWWE() should copy wwe of the specified target", function () {
        //Create packager-tests source folder
        wrench.mkdirSyncRecursive(session.sourceDir);

        spyOn(packager_utils, "copyFile");
        fileMgr.copyWWE(session, "simulator");

        expect(packager_utils.copyFile).toHaveBeenCalledWith(path.normalize(session.conf.DEPENDENCIES_BOOTSTRAP + "/wwe"), path.normalize(session.sourceDir));
    });

    it("copyExtensions() should copy all .js files required by features listed in config.xml", function () {
        var session = testData.session,
            featureId = "Device",
            toDir = path.join(session.sourcePaths.EXT, featureId),
            apiDir = path.resolve(session.conf.EXT, featureId),

            //extension javascript files
            indexJS = path.join(apiDir, "index.js"),
            clientJS = path.join(apiDir, "client.js"),
            subfolderJS = path.join(apiDir, "/subfolder/myjs.js");//Sub folder js file

        //Create packager-tests source folder
        wrench.mkdirSyncRecursive(session.sourceDir);

        spyOn(fs, "existsSync").andReturn(true);
        spyOn(wrench, "mkdirSyncRecursive");
        spyOn(packager_utils, "copyFile");

        //Mock the extension directory
        spyOn(wrench, "readdirSyncRecursive").andCallFake(function (directory) {
            return [
                indexJS,
                clientJS,
                subfolderJS,
            ];
        });

        fileMgr.copyExtensions(session, session.targets[0]);

        //Extension directory is created
        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(toDir, "0755");

        //Javascript files are copied
        expect(packager_utils.copyFile).toHaveBeenCalledWith(indexJS, toDir, apiDir);
        expect(packager_utils.copyFile).toHaveBeenCalledWith(clientJS, toDir, apiDir);
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

        //Create packager-tests source folder
        wrench.mkdirSyncRecursive(session.sourceDir);

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

        fileMgr.copyExtensions(session, session.targets[0]);

        //plugins/jnext output directory is created
        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(session.sourcePaths.JNEXT_PLUGINS, "0755");

        //The .so files are copied
        expect(packager_utils.copyFile).toHaveBeenCalledWith(simulatorSO, soDest);
        expect(packager_utils.copyFile).toHaveBeenCalledWith(deviceSO, soDest);
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
