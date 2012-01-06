
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2011, Research In Motion Limited.
 */
 
 //BlackBerry attaches the Java plugin manager at phonegap.PluginManager, we go to the same
//spot for compatibility
if (!window.phonegap) { window.phonegap = {}; }

(function () {
    "use strict";
    var retAsyncCall = { "status" : PhoneGap.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" },
        retInvalidAction = { "status" : PhoneGap.callbackStatus.INVALID_ACTION, "message" : "Action not found" },
        // Define JavaScript plugin implementations that are common across
        // WebWorks platforms (phone/tablet).
        plugins = {};

    phonegap.WebWorksPluginManager = function () {
    };

    phonegap.WebWorksPluginManager.prototype.exec = function (win, fail, clazz, action, args) {
        if (plugins[clazz]) {
            return plugins[clazz].execute(action, args, win, fail);
        }

        return {"status" : PhoneGap.callbackStatus.CLASS_NOT_FOUND_EXCEPTION, "message" : "Class " + clazz + " cannot be found"};
    };
}());
