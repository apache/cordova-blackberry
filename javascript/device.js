

/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
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

        PhoneGap.exec(
            function (device) {
                me.platform = device.platform;
                me.version  = device.version;
                me.name     = device.name;
                me.uuid     = device.uuid;
                me.phonegap = device.phonegap;
            },
            function (e) {
                console.log("Error initializing PhoneGap: " + e);
            }, 
            "Device", 
            "getDeviceInfo", 
            []
        );

    }

    /**
     * Define navigator.device.
     */
    PhoneGap.addConstructor(function () {
        var key;

        window.device = new Device();

        /* Newer BlackBerry 6 devices now define `navigator.device` */
        if (typeof navigator.device === 'undefined') {
            navigator.device = {};
        }

        /* Add PhoneGap device properties */
        for (key in window.device) {
            navigator.device[key] = window.device[key];
        }

        PhoneGap.onPhoneGapInfoReady.fire();
    });
}());
