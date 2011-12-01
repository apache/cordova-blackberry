
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.notification
 * 
 * Provides access to notifications on the device.
 */
(function() {
    /**
     * Check that navigator.notification has not been initialized.
     */
    if (typeof navigator.notification !== "undefined") {
        return;
    }
    
    /**
     * @constructor
     */
    function Notification() {
    };

    /**
     * Display an activity dialog
     */
    Notification.prototype.activityStart = function(title, message) {
        // If title and message not specified then mimic Android behavior of
        // using default strings.
        if (typeof title === "undefined" && typeof message == "undefined") {
            title = "Busy";
            message = 'Please wait...';
        }

        PhoneGap.exec(null, null, 'Notification', 'activityStart', [title, message]);
    };

    /**
     * Close an activity dialog
     */
    Notification.prototype.activityStop = function() {
        PhoneGap.exec(null, null, 'Notification', 'activityStop', []);
    };

    /**
     * Open a native alert dialog, with a customizable title and button text.
     * @param {String}   message          Message to print in the body of the alert
     * @param {Function} completeCallback The callback that is invoked when user clicks a button.
     * @param {String}   title            Title of the alert dialog (default: 'Alert')
     * @param {String}   buttonLabel      Label of the close button (default: 'OK')
     */
    Notification.prototype.alert = function(message, completeCallback, title, buttonLabel) {
        var _title = (title || "Alert");
        var _buttonLabel = (buttonLabel || "OK");
        PhoneGap.exec(completeCallback, null, 'Notification', 'alert', [message, _title, _buttonLabel]);
    };

    /**
     * Causes the device to blink a status LED.
     *
     * @param {Integer} count       The number of blinks.
     * @param {String} color       The color of the light.
     */
    Notification.prototype.blink = function(count, color) {
        // NOT IMPLEMENTED
    };

    /**
     * Open a custom confirmation dialog, with a customizable title and button text.
     * @param {String}  message         Message to print in the body of the dialog
     * @param {Function}resultCallback  The callback that is invoked when a user clicks a button.
     * @param {String}  title           Title of the alert dialog (default: 'Confirm')
     * @param {String}  buttonLabels    Comma separated list of the button labels (default: 'OK,Cancel')
     */
    Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) {
        var _title = (title || "Confirm");
        var _buttonLabels = (buttonLabels || "OK,Cancel");
        return PhoneGap.exec(resultCallback, null, 'Notification', 'confirm', [message, _title, _buttonLabels]);
    };

    /**
     * Display a progress dialog with progress bar that goes from 0 to 100.
     *
     * @param {String} title        Title of the progress dialog.
     * @param {String} message      Message to display in the dialog.
     */
    Notification.prototype.progressStart = function(title, message) {
        PhoneGap.exec(null, null, 'Notification', 'progressStart', [title, message]);
    };

    /**
     * Close the progress dialog.
     */
    Notification.prototype.progressStop = function() {
        PhoneGap.exec(null, null, 'Notification', 'progressStop', []);
    };

    /**
     * Set the progress dialog value.
     *
     * @param {Number} value         0-100
     */
    Notification.prototype.progressValue = function(value) {
        PhoneGap.exec(null, null, 'Notification', 'progressValue', [value]);
    };

    /**
     * Causes the device to vibrate.
     * @param {Integer} mills The number of milliseconds to vibrate for.
     */
    Notification.prototype.vibrate = function(mills) {
        PhoneGap.exec(null, null, 'Notification', 'vibrate', [mills]);
    };

    /**
     * Causes the device to beep.
     * @param {Integer} count The number of beeps.
     */
    Notification.prototype.beep = function(count) {
        PhoneGap.exec(null, null, 'Notification', 'beep', [count]);
    };

    /**
     * Define navigator.notification object.
     */
    PhoneGap.addConstructor(function() {
        navigator.notification = new Notification();
    });    
}());
