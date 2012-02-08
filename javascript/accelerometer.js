
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
 */

/**
 * Acceleration object has 3D coordinates and timestamp.
 */
var Acceleration = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.timestamp = new Date().getTime();
};

/**
 * navigator.accelerometer
 *
 * Provides access to device accelerometer data.
 */
(function() {
    /**
     * Check that navigator.accelerometer has not been initialized.
     */
    if (typeof navigator.accelerometer !== "undefined") {
        return;
    }

    /**
     * @constructor
     */
    function Accelerometer() {
        /**
         * The last known acceleration. type=Acceleration()
         */
        this.lastAcceleration = null;

        /**
         * List of accelerometer watch timers
         */
        this.timers = {};
    };

    /**
     * Asynchronously acquires the current acceleration.
     *
     * @param {Function} successCallback    The function to call when the acceleration data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
     * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
     */
    Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
        // successCallback required
        if (typeof successCallback !== "function") {
            console.log("Accelerometer Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback !== "function")) {
            console.log("Accelerometer Error: errorCallback is not a function");
            return;
        }

        // Get acceleration
        Cordova.exec(successCallback, errorCallback, "Accelerometer", "getAcceleration", []);
    };

    /**
     * Asynchronously acquires the device acceleration at a given interval.
     *
     * @param {Function} successCallback    The function to call each time the acceleration data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
     * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
        // Default interval (10 sec)
        var frequency = (options != undefined)? options.frequency : 10000;

        // successCallback required
        if (typeof successCallback != "function") {
            console.log("Accelerometer Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback != "function")) {
            console.log("Accelerometer Error: errorCallback is not a function");
            return;
        }

        // Make sure accelerometer timeout > frequency + 10 sec
        Cordova.exec(
                function(timeout) {
                    if (timeout < (frequency + 10000)) {
                        Cordova.exec(null, null, "Accelerometer", "setTimeout", [frequency + 10000]);
                    }
                },
                function(e) { }, "Accelerometer", "getTimeout", []);

        // Start watch timer
        var id = Cordova.createUUID();
        navigator.accelerometer.timers[id] = setInterval(function() {
            Cordova.exec(successCallback, errorCallback, "Accelerometer", "getAcceleration", []);
        }, (frequency ? frequency : 1));

        return id;
    };

    /**
     * Clears the specified accelerometer watch.
     *
     * @param {String} id The id of the watch returned from #watchAcceleration.
     */
    Accelerometer.prototype.clearWatch = function(id) {
        // Stop timer & remove from timer list
        if (id && navigator.accelerometer.timers[id] != undefined) {
            clearInterval(navigator.accelerometer.timers[id]);
            delete navigator.accelerometer.timers[id];
        }
    };

    /**
     * Define navigator.accelerometer object.
     */
    Cordova.addConstructor(function() {
        navigator.accelerometer = new Accelerometer();
    });
}());
