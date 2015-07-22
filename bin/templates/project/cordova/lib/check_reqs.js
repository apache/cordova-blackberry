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

/* jshint sub:true */
var shelljs = require('shelljs'),
    signingUtils = require("./signing-utils");

shelljs.config.silent = true;

/**
 * Method that checks for java and runs java -version to parse out the version installed.
 * If not found, or version can't be found, provides a message informing where to get Java from.
 * This method intended to be used by cordova-lib check_reqs method, called by check_all().
 *
 * @return <Requirement> object representing the result of the check.
 */
module.exports.check_java = function () {
    var requirement = new Requirement('java', 'Java JRE');
    if (shelljs.which('java')) {
        var javaVersion = shelljs.exec('java -version').output;
        if (javaVersion) {
            requirement.installed = true;
            requirement.metadata.version = javaVersion.match(/"([^"]+)"/)[1];
        } else {
            requirement.installed = false;
            requirement.metadata.reason = "Could not confirm Java JRE version. Should be Java 6 or newer. Download from here: http://www.oracle.com/technetwork/java/javase/downloads";
        }
    } else {
        requirement.installed = false;
        requirement.metadata.reason = "Please get the latest Java from here: http://www.oracle.com/technetwork/java/javase/downloads";
    }
    return requirement;
};

/**
 * Method that checks for BlackBerry Tools on the Path.
 * Searches for blackberry-nativepackager, blackberry-deploy, blackberry-signer, and blackberry-debugtokenrequest.
 * If any one can't be found, provides a message informing where and how to install them.
 * This method intended to be used by cordova-lib check_reqs method, called by check_all().
 *
 * @return <Requirement> object representing the result of the check.
 */
module.exports.check_bbtools = function () {
    var requirement = new Requirement('bbtools', 'BlackBerry SDK Tools');
    if (shelljs.which('blackberry-nativepackager') && shelljs.which('blackberry-deploy') && shelljs.which('blackberry-signer') && shelljs.which('blackberry-debugtokenrequest')) {
        requirement.installed = true;
        requirement.metadata.version = "";
    } else {
        requirement.installed = false;
        requirement.metadata.reason = "Download BB-Tools.zip, unzip, and add the bin folder to your PATH: https://developer.blackberry.com/html5/download/";
    }
    return requirement;
};

/**
 * Method that checks for the existence of an Author.p12 file.
 * If not found, provides a message pointing at documentation for setting one up.
 * This method intended to be used by cordova-lib check_reqs method, called by check_all().
 *
 * @return <Requirement> object representing the result of the check.
 */
module.exports.check_authorp12 = function () {
    var requirement = new Requirement('author.p12', 'Author Certificate');
    if (!signingUtils.getKeyStorePath()) {
        requirement.installed = false;
        requirement.metadata.reason = "Visit this page for instructions to create an Author certificate: https://developer.blackberry.com/html5/documentation/v2_2/testing_and_signing_setup.html";
    } else {
        requirement.installed = true;
        requirement.metadata.version = "";
    }
    return requirement;
};

/**
 * Method that checks for either of the signing key methods.
 * If BBID token is not found, and legacy keys are not found, provides a link to documentation to setup signing.
 * This method intended to be used by cordova-lib check_reqs method, called by check_all().
 *
 * @return <Requirement> object representing the result of the check.
 */
module.exports.check_signingkeys = function () {
    var requirement = new Requirement('signingKeys', 'Signing Keys');
    if (!signingUtils.getKeyStorePathBBID()) {

        if (signingUtils.getCskPath() && signingUtils.getDbPath()) {
            requirement.installed = true;
            requirement.metadata.version = "Legacy Signing Keys";
        } else {
            requirement.installed = false;
            requirement.metadata.reason = "Visit this page for instructions to set up Signing Keys: https://developer.blackberry.com/html5/documentation/v2_2/testing_and_signing_setup.html";
        }
    } else {
        requirement.installed = true;
        requirement.metadata.version = "BBID Signing Token";
    }
    return requirement;
};

/**
 * Object that represents one of requirements for current platform.
 * @param {String} id         The unique identifier for this requirements.
 * @param {String} name       The name of requirements. Human-readable field.
 * @param {String} version    The version of requirement installed. In some cases could be an array of strings
 *                            (for example, check_android_target returns an array of android targets installed)
 * @param {Boolean} installed Indicates whether the requirement is installed or not
 */
var Requirement = function (id, name, version, installed) {
    this.id = id;
    this.name = name;
    this.installed = installed || false;
    this.metadata = {
        version: version,
        reason: ""
    };
};

/**
 * Method that runs all checks one by one and returns a result of checks
 * as an array of Requirement objects. This method intended to be used by cordova-lib check_reqs method
 *
 * @return <Requirement[]> Array of requirements.
 */
module.exports.check_all = function() {

    var requirements = [
        this.check_java(),
        this.check_bbtools(),
        this.check_authorp12(),
        this.check_signingkeys()
    ];
    return requirements;
};
