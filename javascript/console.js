
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 * Copyright (c) 2011, Research In Motion Limited
 */

(function () {
    "use strict";

    function Logger() {
        if (typeof (phonegap.Logger) !== 'undefined') {
            return;
        }

        /**
         * If Blackberry doesn't define a console object, we create our own.
         * console.log will use phonegap.Logger to log to BB Event Log and System.out.
         */
        if (typeof console === "undefined") {
            console = { log :
                function (msg) {
                    PhoneGap.exec(null, null, 'Logger', 'log', msg);
                }
                };
        }
    }

    Logger.prototype.log = function (msg) {
        PhoneGap.exec(null, null, 'Logger', 'log', msg);
    };

    /**
     * Define phonegap.Logger object where the BB API expects to see it
     */
    PhoneGap.addConstructor(function () {
        phonegap.Logger = new Logger();
    });
}());