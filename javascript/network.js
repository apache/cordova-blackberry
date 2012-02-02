
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
 * Network status
 */
Connection = {
		UNKNOWN: "unknown",
		ETHERNET: "ethernet",
		WIFI: "wifi",
		CELL_2G: "2g",
		CELL_3G: "3g",
		CELL_4G: "4g",
		NONE: "none"
};

/**
 * navigator.network
 */
(function() {
    /**
     * Check to see that navigator.network has not been initialized.
     */
    if (typeof navigator.network !== "undefined") {
        return;
    }

    /**
     * This class contains information about the current network Connection.
     * @constructor
     */
    var NetworkConnection = function() {
        this.type = null;
        this._firstRun = true;

        var me = this;
        this.getInfo(
            function(info) {
                me.type = info.type;
                if (typeof info.event !== "undefined") {
                    PhoneGap.fireDocumentEvent(info.event);
                }

                // should only fire this once
                if (me._firstRun) {
                    me._firstRun = false;
                    PhoneGap.onPhoneGapConnectionReady.fire();
                }
            },
            function(e) {
                // If we can't get the network info we should still tell PhoneGap
                // to fire the deviceready event.
                if (me._firstRun) {
                    me._firstRun = false;
                    PhoneGap.onPhoneGapConnectionReady.fire();
                }
                console.log("Error initializing Network Connection: " + e);
            });
    };

    /**
     * Get connection info
     *
     * @param {Function} successCallback The function to call when the Connection data is available
     * @param {Function} errorCallback The function to call when there is an error getting the Connection data. (OPTIONAL)
     */
    NetworkConnection.prototype.getInfo = function(successCallback, errorCallback) {
        // Get info
        PhoneGap.exec(successCallback, errorCallback, "Network Status", "getConnectionInfo", []);
    };

    /**
     * Define navigator.network and navigator.network.connection objects
     */
    PhoneGap.addConstructor(function() {
        navigator.network = new Object();

        navigator.network.connection = new NetworkConnection();
    });
}());
