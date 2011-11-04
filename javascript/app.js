/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.app
 */
(function() {
    /**
     * Check to see that navigator.app has not been initialized.
     */
    if (typeof navigator.app !== "undefined") {
        return;
    }

    /**
     * This class provides general application management (clear cache/history,
     * navigate back history) as well as implementing the desired lifecycle
     * events.
     *
     * The lifecycle events for an application are defined as follows:
     *     Load page:               onload
     *     Load next page:          Previous page onunload, Next page onload
     *     Start another app:       pause
     *     Return to app:           resume
     *     Turn off display:        pause
     *     Turn on display:         resume
     *     Exit app:                onunload
     *
     * The WebWorks framework handles the onload of a page and onunload when
     * leaving a page.  All other events are enforced by this plugin.
     *
     * @constructor
     */
    var App = function() {
        this._resumeListener = [];
        this._pauseListener = [];
    };

    /**
     * Function to fire the resume event and notify the plugins that a resume
     * has occurred.  Used when display turns on and when returning to this
     * application from another application.
     */
    var resumeApp = function() {
        PhoneGap.fireDocumentEvent("resume");

        // notify PhoneGap JavaScript Extension
        phonegap.PluginManager.resume();
    };

    /**
     * Function to fire the pause event and notify the plugins that a pause has
     * occurred.  Used when display turns off and when switching to another
     * application from this application.
     */
    var pauseApp = function() {
        PhoneGap.fireDocumentEvent("pause");

        // notify PhoneGap JavaScript Extension
        phonegap.PluginManager.pause();
    };

    /**
     * Function to exit the application. Calls the window.onunload() method if
     * it is defined, cleans up the plugins and exits the application.
     */
    var exitApp = function() {
        // Call onunload if it is defined since BlackBerry does not invoke
        // on application exit.
        if (typeof window.onunload === "function") {
            window.onunload();
        }

        // allow PhoneGap JavaScript Extension opportunity to cleanup
        phonegap.PluginManager.destroy();

        // exit the app
        blackberry.app.exit();
    };

    /**
     * Navigate back in the browser history.
     */
    App.prototype.backHistory = function() {
        // window.history.back() behaves oddly on BlackBerry, so use
        // native implementation.
        PhoneGap.exec(null, null, "App", "backHistory", []);
    };

    /**
     * Clear the resource cache.
     */
    App.prototype.clearCache = function() {
        if (typeof blackberry.widgetcache === "undefined"
            || blackberry.widgetcache === null) {
            console.log("blackberry.widgetcache permission not found. Cache clear denied.");
            return;
        }
        blackberry.widgetcache.clearAll();
    };

    /**
     * Clear the browser history.
     */
    App.prototype.clearHistory = function() {
        PhoneGap.exec(null, null, "App", "clearHistory", []);
    };

    /**
     * Exit the application.
     */
    App.prototype.exitApp = exitApp;

    /**
     * Event handler for pause and resume events. An application may register to
     * listen for "pause" and "resume" events using:
     *
     * document.addEventListener("pause", function, false);
     * document.addEventListener("resume", function, false);
     *
     * When an application registers for either the pause or resume event, a
     * system listener is created in the native plugin code to listen for
     * backlight changes. When the backlight turns off, the pause event is
     * fired. When the backlight turns on the resume event is fired.
     *
     * @param {Object}
     *            eventType
     * @param {Object}
     *            handler
     * @param {Object}
     *            add
     */
    App.prototype._eventHandler = function(eventType, handler, add) {
        var me = navigator.app;
        if (add) {
            // If there are no current registered event listeners start the
            // backlight system listener on native side.
            if (me._resumeListener.length === 0
                    && me._pauseListener.length === 0) {
                PhoneGap.exec(function(on) {
                    if (on === true) {
                        resumeApp();
                    } else {
                        pauseApp();
                    }
                }, function(e) {
                    console.log("Error detecting backlight on/off");
                }, "App", "detectBacklight", [])
            }

            // Register the event listener in the proper array
            if (eventType === "resume") {
                var pos = me._resumeListener.indexOf(handler);
                if (pos === -1) {
                    me._resumeListener.push(handler);
                }
            } else if (eventType === "pause") {
                var pos = me._pauseListener.indexOf(handler);
                if (pos === -1) {
                    me._pauseListener.push(handler);
                }
            }
        } else {
            // Remove the event listener from the proper array
            if (eventType === "resume") {
                var pos = me._resumeListener.indexOf(handler);
                if (pos > -1) {
                    me._resumeListener.splice(pos, 1);
                }
            } else if (eventType === "pause") {
                var pos = me._pauseListener.indexOf(handler);
                if (pos > -1) {
                    me._pauseListener.splice(pos, 1);
                }
            }

            // If there are no more registered event listeners stop the
            // backlight system listener on native side.
            if (me._resumeListener.length === 0
                    && me._pauseListener.length === 0) {
                PhoneGap.exec(null, null, "App", "ignoreBacklight", []);
            }
        }
    };

    PhoneGap.addConstructor(function() {
        navigator.app = new App();

        // Register the event handlers so application can listen for events.
        PhoneGap.addDocumentEventHandler("pause", navigator.app._eventHandler);
        PhoneGap.addDocumentEventHandler("resume",navigator.app._eventHandler);
    });

    /**
     * When BlackBerry WebWorks application is brought to foreground, fire
     * resume event.
     */
    blackberry.app.event.onForeground(resumeApp);

    /**
     * When BlackBerry WebWorks application is sent to background, fire pause
     * event.
     */
    blackberry.app.event.onBackground(pauseApp);

    /**
     * Trap BlackBerry WebWorks exit. Allow plugins to clean up before exiting.
     */
    blackberry.app.event.onExit(exitApp);

}());
