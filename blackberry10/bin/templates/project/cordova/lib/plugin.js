/**
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

var action = process.argv[2],
    plugin = process.argv[3],
    PLUGMAN = require("path").join(__dirname, "..", "node_modules", "plugman", "main.js"),
    argumentor = {
        argIndex: 2,
        setAction: function () {
            process.argv[this.argIndex++] = "--" + action;
            return argumentor;
        },
        setPlatform: function () {
            process.argv[this.argIndex++] = "--platform";
            process.argv[this.argIndex++] = "blackberry10";
            return argumentor;
        },
        setProject: function () {
            process.argv[this.argIndex++] = "--project";
            process.argv[this.argIndex++] = ".";
            return argumentor;
        },
        setPlugin: function () {
            process.argv[this.argIndex++] = "--plugin";
            process.argv[this.argIndex++] = plugin.charAt(plugin.length - 1) === "/" ? plugin.slice(0, -1) : plugin;
            return argumentor;
        },
        setPluginsDir: function () {
            process.argv[this.argIndex++] = "--plugins_dir";
            process.argv[this.argIndex++] = "./plugins";
            return argumentor;
        }
    };

switch(action) {
    case "uninstall":
        argumentor.setAction();
    case "install":
        argumentor.setPlatform().setProject().setPlugin().setPluginsDir();
        break;
    case "fetch":
    case "remove":
        argumentor.setAction().setPlugin().setPluginsDir();
        break;
    case "prepare":
        argumentor.setAction().setPlatform().setProject().setPluginsDir();
        break;
    case "list":
        argumentor.setAction();
}

require(PLUGMAN);
