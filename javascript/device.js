
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
 * Copyright (c) 2011, Research In Motion Limited.
 */

/**
 * navigator.device
 *
 * Represents the mobile device, and provides properties for inspecting the
 * model, version, UUID of the phone, etc.
 */
(function () {
    "use strict";

    /**
     * @constructor
     */
    function Device() {
        var me = this;

        Cordova.exec(
            function (device) {
                me.platform = device.platform;
                me.version  = device.version;
                me.name     = device.name;
                me.uuid     = device.uuid;
                me.cordova  = device.cordova;
            },
            function (e) {
                console.log("Error initializing Cordova: " + e);
            },
            "Device",
            "getDeviceInfo",
            []
        );

    }

    /**
     * Define navigator.device.
     */
    Cordova.addConstructor(function () {
        var key;

        window.device = new Device();

        /* Newer BlackBerry 6 devices now define `navigator.device` */
        if (typeof navigator.device === 'undefined') {
            navigator.device = {};
        }

        /* Add Cordova device properties */
        for (key in window.device) {
            navigator.device[key] = window.device[key];
        }

        Cordova.onCordovaInfoReady.fire();
    });
}());
