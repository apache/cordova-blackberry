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

var fs = require("fs"),
    path = require("path"),
    utils = require("./utils"),
    targetUtils = require("./target-utils.js"),
    localize = require("./localize"),
    pkgrUtils = require("./packager-utils"),
    debugTokenHelper = require("./debugtoken-helper"),
    xml2js = require('xml2js'),
    logger = require("./logger"),
    async = require("async"),
    properties = utils.getProperties(),
    workingdir = path.normalize(__dirname + "/..");

function getTargetName(options, done) {
    var ipFinder = options.device ? targetUtils.findConnectedDevice : targetUtils.findConnectedSimulator,
        targetType = options.device ? "device" : "emulator";

    if (options.target) {
        done(null, options, options.target);
    } else if (options.device || options.emulator) {
        if (options.device && options.emulator) {
            localize.translate("WARN_RUN_DEVICE_OVERIDES_EMULATOR");
        }

        async.series(
        {
            ip: function (done) {
                ipFinder(function (ip) {
                   done(ip ? null : "No connected BlackBerry 10 " + targetType + " found", ip);
                });
            },
            devicePass: function (done) {
                if (!options.devicepass && options.devicepass !== "") {
                    if (options.query) {
                        utils.prompt({description: "Please enter your " + targetType +  " password: ", hidden: true}, done);
                    } else {
                        done("Please provide device password using --devicepass");
                    }
                } else {
                    done(null, options.devicepass);
                }
            }
        },
        function (err, results) {
            if (err) {
                done(err);
            } else {
                options.devicepass = results.devicePass;
                checkDeviceInfo(results.ip, targetType, results.devicePass, done);
            }
        });
    } else {
        done(null, options, properties.defaultTarget);
    }
}

function validateTarget(options, targetName, allDone) {
    var deployTarget,
        err,
        runTasks = [];

    if (!targetName) {
        err = "No target exists, to add that target please run target add <name> <ip> [-t | --type <device | simulator>] [-p <password>] [--pin <devicepin>]";
    } else if (!properties.targets[targetName]) {
        err = "The target \"" + targetName + "\" does not exist, to add that target please run target add " + targetName + " <ip> [-t | --type <device | simulator>] [-p <password>] [--pin <devicepin>]";
    } else {
        deployTarget = utils.clone(properties.targets[targetName]);
        deployTarget.name = targetName;

        if (!deployTarget.ip) {
            if (options.query) {
                runTasks.push(function (done) {
                    utils.prompt({description: "Please enter the IP address for target " + deployTarget.name + ": "}, function (e, ip) {
                        deployTarget.ip = ip;
                        done(e);
                    });
                });
            } else {
                err = "IP is not defined in target \"" + target + "\"";
            }
        }

        if (!deployTarget.password && deployTarget.password !== "") {
            if (options.devicepass || options.devicepass === "") {
                deployTarget.password = options.devicepass;
            } else {
                if (options.query) {
                    runTasks.push(function (done) {
                        utils.prompt({description: "Please enter your " + deployTarget.type +  " password: ", hidden: true}, function (e, devicePass) {
                            deployTarget.password = devicePass;
                            done(e);
                        });
                    });
                } else {
                    err = "Please provide device password using --devicepass or add one to the target " + deployTarget.name + " defined at " + utils.getPropertiesFilePath();
                }
            }
        }
    }

    async.series(runTasks, function (e) {
        var finalErr = err || e;
        if (!finalErr && deployTarget) {
            logger.info("Target " + deployTarget.name + " selected");
        }
        allDone(err || e, deployTarget);
    });
}
//options are keystorepass, query
function handleDebugToken(options, deployTarget, allDone) {
    options.keystorepass = options.keystorepass || properties.keystorepass;

    // if target has no pin, skip the debug token feature
    if (deployTarget.pin) {
        async.waterfall(
            [
                debugTokenHelper.checkDebugToken.bind(this, deployTarget.pin),
                function (done) {
                    //If no keystorepass is provided debugTokenHelper will throw an error.
                    if (!options.keystorepass && options.query) {
                        utils.prompt({description: "Please enter your keystore password: ", hidden: true}, function (err, result) {
                            options.keystorepass = result;
                            done(err, result);
                        });
                    } else {
                        done(null, options.keystorepass);
                    }
                },
                debugTokenHelper.createToken.bind(this, properties, "all")
            ],
                function (err, results) {
                    // If the error is true, then the debug token is valid and creation was skipped.
                    if (err === true) {
                        logger.info(localize.translate("PROGRESS_DEBUG_TOKEN_IS_VALID"));
                        //Clear the error so it is still deployed
                        err = null;
                    }

                    if (!err) {
                        debugTokenHelper.deployToken(deployTarget.name, deployTarget.ip, deployTarget.password, function (code) {
                            allDone(code, deployTarget);
                        });
                    } else {
                        allDone(err);
                    }
                }
        );
    } else {
        allDone(null, deployTarget);
    }
}

function generateDeployOptions(options, deployTarget, uninstall) {
    var deployOptions = [],
        barPath = pkgrUtils.escapeStringForShell(
            path.normalize(__dirname + "/../../build/" +
                (deployTarget.type === "device" ? "device" : "simulator") +
                "/" + utils.genBarName() + ".bar"));

    deployOptions.push("-device");
    deployOptions.push(deployTarget.ip);

    if (deployTarget.password) {
        deployOptions.push("-password");
        deployOptions.push(deployTarget.password);
    }

    deployOptions.push("-package");
    deployOptions.push(barPath);

    if (uninstall) {
        deployOptions.push("-uninstallApp");
        return deployOptions;
    } else {

        deployOptions.push("-installApp");

        if (options.launch) {
            deployOptions.push("-launchApp");
        }

        return deployOptions;
    }
}

function execNativeDeploy(options, callback) {
    var script = path.normalize(path.join(process.env.CORDOVA_BBTOOLS, "blackberry-deploy"));

    utils.exec(script, options, {
        "cwd": workingdir,
        "env": process.env
    }, callback);
}

_self = {
    //options looking for are: query, devicepass, password, target, (device || emulator)
    getValidatedTarget : function (options, callback) {
        async.waterfall(
            [
                getTargetName.bind(this, options),
                validateTarget,
            ], callback
        );
    },
    //options looking for are: launch
    deployToTarget : function (options, deployTarget, callback) {
        execNativeDeploy(generateDeployOptions(options, deployTarget, false));
    },

    uninstall : function (options, deployTarget, allDone) {
        var script = path.join(process.env.CORDOVA_BBTOOLS, "blackberry-deploy"),
            args = [
                "-listInstalledApps",
                "-device",
                deployTarget.ip
            ],
            projectRootDir = path.normalize(path.join(__dirname, "..")),
            installedAppsOutput,
            runTasks = [];

        if (options.uninstall) {
            if (deployTarget.password) {
                args.push("-password", deployTarget.password);
            }
            runTasks = [
            utils.exec.bind(this, script, args, { "cwd": projectRootDir, _customOptions: {silent: true}}),
            function listInstalledAppsOutput (stdout, stderr, done) {
                installedAppsOutput = stdout;
                fs.readFile(path.join(__dirname + "/../../www/", "config.xml"), done);
            },
            function configXMLOutput (result, done) {
                var parser = new xml2js.Parser();
                parser.parseString(result, done);
            },
            function parsedConfigXMLOutput (result, done) {
                if (installedAppsOutput.indexOf(result['@'].id) !== -1) {
                    var options = generateDeployOptions(options, deployTarget, true);
                    execNativeDeploy(options, done);
                } else {
                    done();
                }
            }

            ]
        }

        async.waterfall(runTasks,
            function (err, results) {
                //Absorb error for uninstallation
                allDone(null, deployTarget);
            }
            );
    },

    checkBuild : function (deployTarget, allDone) {
        barPath = pkgrUtils.escapeStringForShell(
            path.normalize(__dirname + "/../../build/" +
                (deployTarget.type === "device" ? "device" : "simulator") +
                "/" + utils.genBarName() + ".bar"));
        if (fs.existsSync(barPath)) {
            allDone(null, deployTarget);
        } else {
            allDone(err = "No build file exists, please run: build [--debug] [--release] [-k | --keystorepass] [-b | --buildId <number>] [-p | --params <json>] [-ll | --loglevel <level>] ");
        }

    },

    checkDeviceInfo : function (ip, deviceType, devicePass, done) {
        var props = utils.getProperties(),
        targetName;

        targetUtils.getDeviceInfo(ip, devicePass, function (err, device) {
            if (!err) {
                targetName = device.name + "-" + device.pin;
                props.targets[targetName] = {
                    ip: ip,
                    pin: device.pin,
                    type: deviceType
                };
                utils.writeToPropertiesFile(props);
            }
            done(err, targetName);
        });
    }
};

module.exports = _self;
