
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Copyright (c) 2011, Research In Motion Limited
 */

(function () {
    "use strict";

    function Logger() {
        if (typeof (cordova.Logger) !== 'undefined') {
            return;
        }

        /**
         * If Blackberry doesn't define a console object, we create our own.
         * console.log will use cordova.Logger to log to BB Event Log and System.out.
         */
        if (typeof console === "undefined") {
            console = { log :
                function (msg) {
                    Cordova.exec(null, null, 'Logger', 'log', msg);
                }
                };
        }
    }

    Logger.prototype.log = function (msg) {
        Cordova.exec(null, null, 'Logger', 'log', msg);
    };

    /**
     * Define cordova.Logger object where the BB API expects to see it
     */
    Cordova.addConstructor(function () {
        cordova.Logger = new Logger();
    });
}());
