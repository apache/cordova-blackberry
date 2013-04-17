/*
 *  Copyright 2013 Research In Motion Limited.
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

var propertiesFile = 'project.json',
    properties = require('../../' + propertiesFile),
    fs = require('fs'),
    commander = require('commander'),
    command,
    name,
    ip,
    type,
    password,
    pin,
    pinRegex = new RegExp("[0-9A-Fa-f]{8}");

function writeProjectFile(contents, file) {
    fs.writeFile(file, contents, 'utf-8', function (err) {
        if (err) console.log("Error updating project.json :(\n" + err);
        process.exit();
    });
}

function isValidIp(ip) {
    var num,
        result = true,
        ipArray;

    if (typeof ip !== 'string') {
        throw "IP is required";
    } else {
        ipArray = ip.split('.');
        if (ipArray.length !== 4) {
            result = false;
        }
        ipArray.forEach(function (quadrant) {
            num = Number(quadrant);
            if (isNaN(num) || (num < 0) || (num > 255)) {
                result = false;
            }
        });
    }
    return result;
}

function isValidType(type) {
    var result = true;

    if (typeof type !== 'string') {
        throw "target type is required";
    }
    else if (!(type === 'device' || type === 'simulator')) {
        result = false;
    }
    return result;
}

function isValidPin(pin) {
    var result = true;
    if (typeof pin !== 'undefined' && !pinRegex.test(pin)) {
        result = false;
    }
    return result;
}

commander
    .usage('[command] [params]')
    .option('-p, --password <password>', 'Specifies password for this target')
    .option('--pin <devicepin>', 'Specifies PIN for this device');

commander
    .on('--help', function () {
        console.log('   Synopsis:');
        console.log('   $ target');
        console.log('   $ target add <name> <ip> <type> [-p | --password <password>] [--pin <devicepin>]');
        console.log('   $ target remove <name>');
        console.log('   $ target default [name]');
        console.log(' ');
    });

commander
    .command('add')
    .description("Add specified target")
    .action(function () {
        if (commander.args.length === 1) {
            throw "Target details not specified";
        }
        name = commander.args[0];
        ip = commander.args[1];
        type = commander.args[2];
        if (commander.password && typeof commander.password === 'string') {
            password = commander.password;
        }
        if (commander.pin && typeof commander.pin === 'string') {
            pin = commander.pin;
        }
        if (!isValidIp(ip)) {
            throw "Invalid IP: " + ip;
        }
        if (!isValidType(type)) {
            throw "Invalid target type: " + type;
        }
        if (!isValidPin(pin)) {
            throw "Invalid PIN: " + pin;
        }
        if (properties.targets.hasOwnProperty(name)) {
            console.log("Overwriting target: " + name);
        }
        properties.targets[name] = {"ip": ip, "type": type, "password": password, "pin": pin};
    });

commander
    .command('remove')
    .description("Remove specified target")
    .action(function () {
        if (commander.args.length === 1) {
            throw 'No target specified';
        }
        name = commander.args[0];
        if (!properties.targets.hasOwnProperty(name)) {
            throw "Target: '" + name + "' not found";
        }
        if (name === properties.defaultTarget) {
            console.log("Deleting default target, please set a new default target");
            properties.defaultTarget = "";
        }
        delete properties.targets[name];
    });

commander
    .command('default')
    .description("Get or set default target")
    .action(function () {
        if (commander.args.length === 1) {
            console.log(properties.defaultTarget);
            process.exit();
        }
        name = commander.args[0];
        if (properties.targets.hasOwnProperty(name)) {
            properties.defaultTarget = name;
        } else {
            throw "Target '" + name + "' not found";
        }
    });

commander
    .command('*')
    .action(function () {
        throw 'Unrecognized command';
    });


try {
    commander.parse(process.argv);

    if (commander.args.length === 0) {
        Object.keys(properties.targets).forEach(function (target) {
            if (target === properties.defaultTarget) {
                console.log('* ' + target);
            } else {
                console.log('  ' + target);
            }
        });
        process.exit();
    }
    if (Object.keys(properties.targets).length === 1) {
        properties.defaultTarget = Object.keys(properties.targets)[0];
    }

    writeProjectFile(JSON.stringify(properties, null, 4) + "\n", propertiesFile);
} catch (e) {
    console.log(e);
    process.exit();
}
