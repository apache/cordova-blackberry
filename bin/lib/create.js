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
 * create a cordova/blackberry10 project
 *
 * USAGE
 *  ./create path [package [id [name [template]]]]
 */

var ERROR_VALUE = 2,
    path = require("path"),
    exit = require('exit'),
    shell = require('shelljs'),
    fs = require("fs"),
    os = require("os"),
    wrench = require("wrench"),
    version = getVersion(),
    project_path = validateProjectPath(),
    app_id = process.argv[3],
    app_name = process.argv[4] || 'WebWorks Application',
    TARGETS = ["device", "simulator"],
    TEMPLATE_PROJECT_DIR = path.join(__dirname, "..", "templates", "project"),
    ROOT_PROJECT_DIR = path.join(__dirname, "..", ".."),
    MODULES_PROJECT_DIR = path.join(__dirname, "..", "..", "node_modules"),
    BOOTSTRAP_PROJECT_DIR = path.join(__dirname, "..", "..", "framework", "bootstrap"),
    FRAMEWORK_LIB_PROJECT_DIR = path.join(__dirname, "..", "..", "framework", "lib"),
    CORDOVA_DIR = path.join(__dirname, ".."),
    CORDOVA_JS_SRC = path.join(__dirname, "..", "..", "javascript", "cordova.blackberry10.js"),
    native_dir = path.join(project_path, "native"),
    template_dir = process.argv[5] || TEMPLATE_PROJECT_DIR,
    js_path = "javascript",
    js_basename = "cordova.js";

function getVersion() {
    var version = fs.readFileSync(path.join(__dirname,  "..", "..", "VERSION"));
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
        exit(ERROR_VALUE);
        return "";
    } else {
        return path.resolve(process.argv[2]);
    }
}

function validate() {
    if (fs.existsSync(project_path)) {
        console.log("The project path must be an empty directory");
        help();
        exit(ERROR_VALUE);
    }
    if (!validPackageName(app_id)) {
        console.log("[warning] App ID must be sequence of alpha-numeric (optionally separated by '.') characters, no longer than 50 characters.\n" +
                    "special characters in '" + app_id + "' will be replaced by '_'");
    }
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
    wrench.copyDirSyncRecursive(template_dir, project_path);
    if (template_dir != TEMPLATE_PROJECT_DIR) {
        wrench.copyDirSyncRecursive(path.join(TEMPLATE_PROJECT_DIR, 'cordova'), path.join(project_path, 'cordova'));
    }

    // copy repo level target tool to project
    shell.cp(path.join(CORDOVA_DIR, "target"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "target.bat"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "lib", "target.js"), path.join(project_path, "cordova", "lib"));
    shell.cp(path.join(CORDOVA_DIR, "lib", "config.js"), path.join(project_path, "cordova", "lib"));

    // copy repo level init script to project
    shell.cp(path.join(CORDOVA_DIR, "whereis.cmd"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "init.bat"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "init"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "init_reqs.bat"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "init_reqs"), path.join(project_path, "cordova"));

    //copy VERSION file [used to identify corresponding ~/.cordova/lib directory for dependencies]
    shell.cp(path.join(ROOT_PROJECT_DIR, "VERSION"), path.join(project_path));

    // copy repo level check_reqs script to project
    shell.cp(path.join(CORDOVA_DIR, "check_reqs.bat"), path.join(project_path, "cordova"));
    shell.cp(path.join(CORDOVA_DIR, "check_reqs"), path.join(project_path, "cordova"));

    // change file permission for cordova scripts because ant copy doesn't preserve file permissions
    wrench.chmodSyncRecursive(path.join(project_path,"cordova"), 0700);

    //copy cordova-*version*.js to www
    shell.cp(CORDOVA_JS_SRC, path.join(project_path, "www"));
    fs.renameSync(path.join(project_path, "www", "cordova.blackberry10.js"), path.join(project_path, "www", js_basename));
    shell.cp('-rf', path.join(ROOT_PROJECT_DIR, 'cordova-js-src'), path.join(project_path, 'platform_www'));

    //copy node modules to cordova build directory
    wrench.mkdirSyncRecursive(nodeModulesDest, 0777);
    wrench.copyDirSyncRecursive(MODULES_PROJECT_DIR, nodeModulesDest);

    //copy framework bootstrap
    TARGETS.forEach(function (target) {
        var chromeDir = path.join(native_dir, target, "chrome"),
            frameworkLibDir = path.join(chromeDir, "lib"),
            defaultConfig;

        wrench.mkdirSyncRecursive(frameworkLibDir);
        wrench.copyDirSyncRecursive(BOOTSTRAP_PROJECT_DIR, chromeDir);
        wrench.copyDirSyncRecursive(FRAMEWORK_LIB_PROJECT_DIR, frameworkLibDir);

        //apply 'native' Cordova version
        defaultConfig = fs.readFileSync(path.join(frameworkLibDir,  "config", "default.js"));
        defaultConfig = defaultConfig.toString().replace("CORDOVA-VERSION", version);
        fs.writeFileSync(path.join(frameworkLibDir, "config", "default.js"), defaultConfig, "utf-8");

    });
}

function updateProject() {
    var configXMLPath = path.resolve(path.join(project_path, "www", "config.xml")),
        xmlString;

    if (typeof app_id !== "undefined") {
        xmlString = fs.readFileSync(configXMLPath, "utf-8");
        fs.writeFileSync(configXMLPath, xmlString.replace("default.app.id", app_id).replace("default.app.name", app_name), "utf-8");
    }
}

function help() {
    console.log("\nUsage: create <project-path> [id [name [template_path]]] \n");
    console.log("Options: \n");
    console.log("   -h, --help      output usage information \n");
}

if ( process.argv[2] === "-h" || process.argv[2] === "--help" ) {
    help();
} else {
    try {
        validate();
        copyFilesToProject();
        updateProject();
        exit();
    } catch (ex) {
        console.log("Project creation failed!");
        console.error(os.EOL + ex);
        exit(ERROR_VALUE);
    }
}
