/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * create a cordova/blackberry project
 *
 * USAGE
 *  ./create [path package appname]
 */

var build,
    path = require("path"),
    fs = require("fs"),
    wrench = require("wrench"),
    utils = require(path.join(__dirname, 'lib/utils')),
    version = getVersion(),
    project_path = validateProjectPath(),
    app_id = process.argv[3],
    TARGETS = ["device", "simulator"],
    TEMPLATE_PROJECT_DIR = path.join(__dirname, "templates", "project"),
    ROOT_PROJECT_DIR = path.join(__dirname, ".."),
    MODULES_PROJECT_DIR = path.join(__dirname, "..", "node_modules"),
    BOOTSTRAP_PROJECT_DIR = path.join(__dirname, "..", "framework", "bootstrap"),
    FRAMEWORK_LIB_PROJECT_DIR = path.join(__dirname, "..", "framework", "lib"),
    BIN_DIR = path.join(__dirname),
    BUILD_DIR = path.join(__dirname, "build"),
    CORDOVA_JS_SRC = path.join(__dirname, "..", "javascript", "cordova.blackberry10.js"),
    update_dir = path.join(project_path, "lib", "cordova." + version),
    native_dir = path.join(project_path, "native"),
    js_path = "javascript",
    js_basename = "cordova.js";

function getVersion() {
    var version = fs.readFileSync(path.join(__dirname,  "..", "VERSION"));
    if (version) {
        return version.toString().replace( /([^\x00-\xFF]|\s)*$/g, '' );
    }
}

function validPackageName(packageName) {
    var domainRegex = /^[a-zA-Z]([a-zA-Z0-9])*(\.[a-zA-Z]([a-zA-Z0-9])*)*$/;
    if (typeof packageName !== "undefined") {
        if ((packageName.length > 50) || !domainRegex.test(packageName)) {
            return false;
        }
    }
    return true;
}

function validateProjectPath() {
    if (!process.argv[2]) {
        console.log("You must give a project PATH");
        help();
        process.exit(2);
        return "";
    } else {
        return path.resolve(process.argv[2]);
    }
}

function validate() {
    if (fs.existsSync(project_path)) {
        console.log("The project path must be an empty directory");
        help();
        process.exit(2);
    }
    if (!validPackageName(app_id)) {
        console.log("[warning] App ID must be sequence of alpha-numeric (optionally seperated by '.') characters, no longer than 50 characters.\n" +
                    "special characters in '" + app_id + "' will be replaced by '_'");
    }
}

function clean() {
    if (fs.existsSync(BUILD_DIR)) {
        wrench.rmdirSyncRecursive(BUILD_DIR);
    }
}

function copyJavascript() {
    wrench.mkdirSyncRecursive(path.join(BUILD_DIR, js_path), 0777);
    utils.copyFile(CORDOVA_JS_SRC, path.join(BUILD_DIR, js_path));

    //rename copied cordova.blackberry10.js file
    fs.renameSync(path.join(BUILD_DIR, js_path, "cordova.blackberry10.js"), path.join(BUILD_DIR, js_path, js_basename));
}

function copyFilesToProject() {
    var nodeModulesDest = path.join(project_path, "cordova", "node_modules"),
        bbtoolsBinDest = path.join(project_path, "cordova", "dependencies", "bb-tools", "bin"),
        bbtoolsLibDest = path.join(project_path, "cordova", "dependencies", "bb-tools", "lib"),
        bbNativePackager = "blackberry-nativepackager",
        bbSigner = "blackberry-signer",
        bbDeploy = "blackberry-deploy",
        bbDebugTokenRequest= "blackberry-debugtokenrequest";

    // create project using template directory
    wrench.mkdirSyncRecursive(project_path, 0777);
    wrench.copyDirSyncRecursive(TEMPLATE_PROJECT_DIR, project_path);

    // copy repo level target tool to project
    utils.copyFile(path.join(BIN_DIR, "target"), path.join(project_path, "cordova"));
    utils.copyFile(path.join(BIN_DIR, "target.bat"), path.join(project_path, "cordova"));
    utils.copyFile(path.join(BIN_DIR, "lib", "target.js"), path.join(project_path, "cordova", "lib"));
    utils.copyFile(path.join(BIN_DIR, "lib", "utils.js"), path.join(project_path, "cordova", "lib"));

    // copy repo level init script to project
    if (utils.isWindows()) {
        utils.copyFile(path.join(BIN_DIR, "init.bat"), path.join(project_path, "cordova"));
    } else {
        utils.copyFile(path.join(BIN_DIR, "init"), path.join(project_path, "cordova"));
    }

    //copy VERSION file [used to identify corresponding ~/.cordova/lib directory for dependencies]
    utils.copyFile(path.join(ROOT_PROJECT_DIR, "VERSION"), path.join(project_path));

    // change file permission for cordova scripts because ant copy doesn't preserve file permissions
    wrench.chmodSyncRecursive(path.join(project_path,"cordova"), 0700);

    //copy cordova-*version*.js to www
    utils.copyFile(path.join(BUILD_DIR, js_path, js_basename), path.join(project_path, "www"));

    //copy node modules to cordova build directory
    wrench.mkdirSyncRecursive(nodeModulesDest, 0777);
    wrench.copyDirSyncRecursive(MODULES_PROJECT_DIR, nodeModulesDest);

    //copy framework bootstrap
    TARGETS.forEach(function (target) {
        var chromeDir = path.join(native_dir, target, "chrome"),
            frameworkLibDir = path.join(chromeDir, "lib");

        wrench.mkdirSyncRecursive(frameworkLibDir);
        wrench.copyDirSyncRecursive(BOOTSTRAP_PROJECT_DIR, chromeDir);
        wrench.copyDirSyncRecursive(FRAMEWORK_LIB_PROJECT_DIR, frameworkLibDir);
    });

    // save release
    wrench.mkdirSyncRecursive(update_dir, 0777);
    wrench.copyDirSyncRecursive(BUILD_DIR, update_dir);
}

function updateProject() {
    var projectJson = require(path.resolve(path.join(project_path, "project.json"))),
        configXMLPath = path.resolve(path.join(project_path, "www", "config.xml")),
        xmlString;

    if (typeof app_id !== "undefined") {
        xmlString = fs.readFileSync(configXMLPath, "utf-8");
        fs.writeFileSync(configXMLPath, xmlString.replace("default.app.id", app_id), "utf-8");
    }

    projectJson.globalFetchDir = path.join(__dirname, "..", "plugins");

    fs.writeFileSync(path.join(project_path, "project.json"), JSON.stringify(projectJson, null, 4) + "\n", "utf-8");
}

function help() {
    console.log("\nUsage: create <project path> [package name] \n");
    console.log("Options: \n");
    console.log("   -h, --help      output usage information \n");
}

if ( process.argv[2] === "-h" || process.argv[2] === "--help" ) {
    help();
} else {
    try {
        validate();
        clean();
        copyJavascript();
        copyFilesToProject();
        updateProject();
        clean();
        process.exit();
    } catch (ex) {
        console.log("Project creation failed!\n" + "Error: " + ex);
        process.exit(1);
    }
}

