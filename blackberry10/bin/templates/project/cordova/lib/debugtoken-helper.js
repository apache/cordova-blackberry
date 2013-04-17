/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var childProcess = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    conf = require("./conf"),
    localize = require("./localize"),
    logger = require("./logger"),
    pkgrUtils = require("./packager-utils"),
    workingDir = path.normalize(__dirname + "/.."),
    debugTokenDir = path.normalize(workingDir + "/" + "debugtoken.bar"),
    properties,
    targets,
    deployCallback,
    self = {};

function generateCreateTokenOptions(pins, password) {
    var options = [],
        i;

    options.push("-storepass");
    options.push(password);

    for (i = 0; i < pins.length; i++) {
        options.push("-devicepin");
        options.push(pins[i]);
    }

    options.push(debugTokenDir);

    return options;
}

function generateDeployTokenOptions(target) {
    var options = [];

    options.push("-installDebugToken");
    options.push(debugTokenDir);

    options.push("-device");
    options.push(properties.targets[target].ip);

    options.push("-password");
    options.push(properties.targets[target].password);

    return options;
}

function execNativeScript(script, options, callback) {
    var process;

    if (pkgrUtils.isWindows()) {
        script += ".bat";
    }

    if (fs.existsSync(conf.DEPENDENCIES_TOOLS)) {
        process = childProcess.spawn(path.normalize(conf.DEPENDENCIES_TOOLS + script), options, {
            "cwd" : workingDir,
            "env" : process ? process.env : undefined
        });

        process.stdout.on("data", pkgrUtils.handleProcessOutput);

        process.stderr.on("data", pkgrUtils.handleProcessOutput);

        process.on("exit", function (code) {
            if (callback && typeof callback === "function") {
                callback(code);
            }
        });
    } else {
        throw localize.translate("EXCEPTION_MISSING_TOOLS");
    }
}

function checkTarget(target) {
    if (!properties.targets[target]) {
        logger.warn(localize.translate("WARN_TARGET_NOT_EXIST", target));
        return false;
    }

    if (!properties.targets[target].ip) {
        logger.warn(localize.translate("WARN_IP_NOT_DEFINED", target));
        return false;
    }

    if (!properties.targets[target].password) {
        logger.warn(localize.translate("WARN_PASSWORD_NOT_DEFINED", target));
        return false;
    }

    return true;

}

// Deploy the debug token for each target in targets array recursively
function deployTokenToTargetsRecursively() {
    var target;

    if (targets.length > 0) {
        target = targets.pop();

        logger.info(localize.translate("PROGRESS_DEPLOYING_DEBUG_TOKEN", target));
        if (checkTarget(target)) {
            execNativeScript("/bin/blackberry-deploy",
                generateDeployTokenOptions(target),
                deployTokenToTargetsRecursively
            );
        } else {
            deployTokenToTargetsRecursively();
        }
    } else {
        if (deployCallback && typeof deployCallback === "function") {
            deployCallback();
        }
    }
}

self.createToken = function (projectProperties, target, callback) {
    var pins = [],
        key;

    // Store the global variable "properties"
    properties = projectProperties;

    // Gather PINs information from properties
    if (target === "all") {
        for (key in properties.targets) {
            if (properties.targets.hasOwnProperty(key) && properties.targets[key].pin) {
                pins.push(properties.targets[key].pin);
            }
        }
    } else {
        if (!target) {
            target = properties.defaultTarget;
        }

        if (properties.targets.hasOwnProperty(target) && properties.targets[target].pin) {
            pins.push(properties.targets[target].pin);
        }
    }

    if (pins.length === 0) {
        logger.warn(localize.translate("WARN_NO_DEVICE_PIN_FOUND"));
        if (callback && typeof callback === "function") {
            callback(-1);
        }
    } else if (!properties.keystorepass) {
        logger.warn(localize.translate("WARN_NO_SIGNING_PASSWORD_PROVIDED"));
        if (callback && typeof callback === "function") {
            callback(-1);
        }
    } else {
        logger.info(localize.translate("PROGRESS_GENERATING_DEBUG_TOKEN"));
        // Call "blackberry-debugtokenrequest" to generate debug token
        execNativeScript("/bin/blackberry-debugtokenrequest",
            generateCreateTokenOptions(pins, properties.keystorepass),
            callback
        );
    }
};

self.deployToken = function (projectProperties, target, callback) {
    var key;

    // Store the global variable "properties"
    properties = projectProperties;

    // Initialize the global variable "targets"
    targets = [];

    // Store callback so it will be invoked after debug token is deployed to all target(s)
    deployCallback = callback;

    // Gather targets information from properties
    // Gather PINs information from properties
    if (target === "all") {
        for (key in properties.targets) {
            if (properties.targets.hasOwnProperty(key) && properties.targets[key].pin) {
                targets.push(key);
            }
        }
    } else {
        if (!target) {
            target = properties.defaultTarget;
        }

        if (properties.targets.hasOwnProperty(target) && properties.targets[target].pin) {
            targets.push(target);
        }
    }

    // Deploy debug token recursively
    deployTokenToTargetsRecursively();
};

module.exports = self;
