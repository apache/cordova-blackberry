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
    jWorkflow = require("jWorkflow"),
    utils = require('./lib/utils'),
    version = getVersion(),
    project_path = process.argv[2],
    app_id = process.argv[3],
    bar_name = process.argv[4],
    template_project_dir = "/templates/project",
    modules_project_dir = "/../node_modules",
    framework_project_dir = "/../framework",
    build_dir = "build",
    update_dir = "lib/cordova." + version,
    js_src = "../javascript",
    js_path = "javascript",
    js_basename = "cordova-" + version + ".js";

    function getVersion() {
        var version = fs.readFileSync(__dirname + "/../VERSION");
        if (version) {
            return version.toString();
        }
    }

    function validate() {
        if (!project_path) {
            throw "You must give a project PATH";
        }
        if (fs.existsSync(project_path)) {
            throw "The project path must be an empty directory";
        }
        if (!validPackageName(app_id)) {
            throw "App ID must be sequence of alpha-numeric (optionally seperated by '.') characters, no longer than 50 characters";
        }
        if (!validBarName(bar_name)) {
            throw "BAR filename can only contain alpha-numeric, '.', '-' and '_' characters";
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

    function validBarName(barName) {
        var barNameRegex = /^[a-zA-Z0-9._-]+$/;
        return (typeof barName === "undefined") || barNameRegex.test(barName);
    }

    function clean() {
        if (fs.existsSync(build_dir)) {
            wrench.rmdirSyncRecursive(build_dir);
        }
    }

    function copyJavascript() {
        wrench.mkdirSyncRecursive(build_dir + "/" + js_path, 0777);
        utils.copyFile(__dirname + "/" + js_src + "/cordova.blackberry10.js", build_dir + "/" + js_path);

        //rename copied cordova.blackberry10.js file
        fs.renameSync(build_dir + "/" + js_path + "/cordova.blackberry10.js", build_dir + "/" + js_path + "/" + js_basename);
    }

    function copyFilesToProject() {
        // create project using template directory
        wrench.mkdirSyncRecursive(project_path, 0777);
        wrench.copyDirSyncRecursive(__dirname + template_project_dir, project_path);

        // change file permission for cordova scripts because ant copy doesn't preserve file permissions
        wrench.chmodSyncRecursive(project_path + "/cordova", 0700);

        //copy cordova-*version*.js to www
        utils.copyFile(build_dir + "/" + js_path + "/" + js_basename, project_path + "/www");

        //copy node modules to cordova build directory
        wrench.mkdirSyncRecursive(project_path + "/cordova/node_modules", 0777);
        wrench.copyDirSyncRecursive(__dirname + modules_project_dir, project_path + "/cordova/node_modules");
        fs.chmodSync(project_path + "/cordova/node_modules/plugman/plugman.js", 0755);

        //copy framework
        wrench.copyDirSyncRecursive(__dirname + framework_project_dir, project_path + "/cordova/framework");

        // save release
        wrench.mkdirSyncRecursive(project_path + "/" + update_dir, 0777);
        wrench.copyDirSyncRecursive(build_dir, project_path + "/" + update_dir);
    }

    function updateProject() {
        var projectJson,
            xmlString,
            configXMLPath = path.resolve(project_path + "/www/config.xml");

        if (typeof app_id !== "undefined") {
            xmlString = fs.readFileSync(configXMLPath, "utf-8");
            fs.writeFileSync(configXMLPath, xmlString.replace("default.app.id", app_id), "utf-8");
        }

        if (typeof bar_name !== "undefined") {
            projectJson = require(path.resolve(project_path + "/project.json"));
            projectJson.barName = bar_name;
            fs.writeFileSync(project_path + "/project.json", JSON.stringify(projectJson, null, 4) + "\n", "utf-8");
        }
    }

    function done(error) {
        if (error) {
            console.log("Project creation failed!\n" + "Error: " + error);
            process.exit(1);
        }
        else {
            console.log("Project creation complete!");
            process.exit();
        }
    }

    if ( process.argv[2] === "-h" || process.argv[2] === "--help" ) {
        console.log("\nUsage: create <project path> [package name [BAR filename]] \n");
        console.log("Options: \n");
        console.log("   -h, --help      output usage information \n");
    } else {
        try {
            build = jWorkflow.order(validate)
                .andThen(clean)
                .andThen(copyJavascript)
                .andThen(copyFilesToProject)
                .andThen(updateProject);

            build.start(function (error) {
                done(error);
            });
        } catch (ex) {
            console.log(ex);
        }
    }

