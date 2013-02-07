/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
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
    project_package = process.argv[3],
    app_name = process.argv[4],
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
            throw "You must give a project PATH.";
        }
        if (fs.existsSync(project_path)) {
            throw "The project path must be an empty directory.";
        }
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

        //copy framework
        wrench.copyDirSyncRecursive(__dirname + framework_project_dir, project_path + "/cordova/framework");

        // save release
        wrench.mkdirSyncRecursive(project_path + "/" + update_dir, 0777);
        wrench.copyDirSyncRecursive(build_dir, project_path + "/" + update_dir);
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

    build = jWorkflow.order(validate)
                     .andThen(clean)
                     .andThen(copyJavascript)
                     .andThen(copyFilesToProject);

    build.start(function (error) {
        done(error);
    });

