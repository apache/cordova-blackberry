#!/usr/bin/env node

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

var shell = require('shelljs'),
    exit = require('exit'),
    path  = require('path'),
    fs    = require('fs'),
    ROOT    = path.join(__dirname, '..', '..');

function setShellFatal(value, func) {
    var oldVal = shell.config.fatal;
    shell.config.fatal = value;
    func();
    shell.config.fatal = oldVal;
}


function updateNativeDir(projectpath) {
    shell.cp('-rf', path.join(ROOT, 'bin', 'templates', 'project', 'native'), path.join(projectpath));
}

function updateCordovaJS(projectpath, version) {
    var jspath = path.join(projectpath, 'lib', 'cordova.' + version, 'javascript');
    shell.mkdir('-p', jspath); // remake lib dir tree with updated version
    shell.cp('-f', path.join(ROOT, 'javascript', 'cordova.blackberry10.js'), path.join(jspath, 'cordova.js')); // copy new js
    shell.cp('-f', path.join(ROOT, 'javascript', 'cordova.blackberry10.js'), path.join(projectpath, 'www', 'cordova.js'));
}

function updateCordovaTools(projectpath) {
    // update cordova scripts from template
    shell.cp('-rf', path.join(ROOT, 'bin', 'templates', 'project', 'cordova'), path.join(projectpath));
    // update repo level scripts
    updateTargetTool(projectpath);
    updateInitTool(projectpath); 
}

function updateTargetTool(projectpath) {
    shell.cp('-f', path.join(ROOT, 'bin', 'target'), path.join(projectpath, 'cordova'));
    shell.cp('-f', path.join(ROOT, 'bin', 'target.bat'), path.join(projectpath, 'cordova'));
    shell.cp('-f', path.join(ROOT, 'bin', 'lib', 'target.js'), path.join(projectpath, 'cordova', 'lib'));
}

function updateInitTool(projectpath) {
    shell.cp('-f', path.join(ROOT, 'bin', 'init.bat'), path.join(projectpath, 'cordova'));
    shell.cp('-f', path.join(ROOT, 'bin', 'init'), path.join(projectpath, 'cordova'));
    shell.cp('-f', path.join(ROOT, 'bin', 'init_reqs.bat'), path.join(projectpath, 'cordova'));
    shell.cp('-f', path.join(ROOT, 'bin', 'init_reqs'), path.join(projectpath, 'cordova'));
}

exports.updateProject = function (projectpath) {
    var version = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf-8').trim();
    setShellFatal(true, function () {
        shell.rm('-rf', path.join(projectpath, 'lib')); //remove old lib tree
        updateCordovaJS(projectpath, version);
        updateCordovaTools(projectpath);
        updateNativeDir(projectpath);
        fs.writeFileSync(path.join(projectpath, 'VERSION'), version + "\n", 'utf-8');
        console.log('BlackBerry10 project is now at version ' + version);
    });
};

if (require.main === module) {
    (function () {
        var args = process.argv;
        if (args.length < 3 || (args[2] === '--help' || args[2] === '-h')) {
            console.log('Usage: ' + path.relative(process.cwd(), path.join(__dirname, '..', 'update')) + ' <path_to_project>');
            exit(1);
        } else {
            exports.updateProject(args[2]);
        }
    })();
}
