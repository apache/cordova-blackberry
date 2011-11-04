/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */
package com.phonegap.app;

import net.rim.device.api.browser.field2.BrowserFieldHistory;
import net.rim.device.api.system.Application;
import net.rim.device.api.system.SystemListener2;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;

/**
 * The App plug-in. This class provides access to application specific
 * management. The following actions are supported:
 *
 *      clearHistory    - Clear the browser history.
 *      backHistory     - Navigate back in the browser history.
 *      detectBacklight - Start a system listener for backlight changes.
 *      ignoreBacklight - Stop the system listener for backlight changes.
 */
public class App extends Plugin {

    private final static String ACTION_CLEAR_HISTORY = "clearHistory";
    private final static String ACTION_BACK_HISTORY = "backHistory";
    private final static String ACTION_DETECT_BACKLIGHT = "detectBacklight";
    private final static String ACTION_IGNORE_BACKLIGHT = "ignoreBacklight";

    private SystemListener2 listener = null;
    private String callbackId = null;

    /**
     * Executes the requested action and returns a PluginResult.
     *
     * @param action
     *            The action to execute.
     * @param callbackId
     *            The callback ID to be invoked upon action completion
     * @param args
     *            JSONArry of arguments for the action.
     * @return A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args,
            final String callbackId) {
        PluginResult result = null;

        if (ACTION_CLEAR_HISTORY.equals(action)) {
            BrowserFieldHistory history = PhoneGapExtension.getBrowserField()
                    .getHistory();
            if (history != null) {
                history.clearHistory();
            }
            result = new PluginResult(PluginResult.Status.OK);
        } else if (ACTION_BACK_HISTORY.equals(action)) {
            PhoneGapExtension.getBrowserField().back();
            result = new PluginResult(PluginResult.Status.OK);
        } else if (ACTION_DETECT_BACKLIGHT.equals(action)) {
            addListener(callbackId);
            result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
        } else if (ACTION_IGNORE_BACKLIGHT.equals(action)) {
            removeListener();
            result = new PluginResult(PluginResult.Status.OK);
        } else {
            result = new PluginResult(PluginResult.Status.INVALID_ACTION,
                    "App: Invalid action: " + action);
        }

        return result;
    }

    /**
     * Called when Plugin is destroyed.
     */
    public void onDestroy() {
        removeListener();
    }

    /**
     * Register a system listener for backlight changes if one has not already
     * been registered.
     *
     * @param callbackId
     *            the callback ID associated with the system listener
     */
    private synchronized void addListener(final String callbackId) {
        if (listener == null) {
            listener = new SystemListener2() {
                public void batteryGood() {}
                public void batteryLow() {}
                public void batteryStatusChange(int status) {}
                public void powerOff() {}
                public void powerUp() {}

                public void backlightStateChange(boolean on) {
                    PluginResult result = new PluginResult(
                            PluginResult.Status.OK, on);

                    // Must keep the call back active for future events.
                    result.setKeepCallback(true);
                    success(result, callbackId);
                }

                public void cradleMismatch(boolean mismatch) {}
                public void fastReset() {}
                public void powerOffRequested(int reason) {}
                public void usbConnectionStateChange(int state) {}
            };

            this.callbackId = callbackId;
            Application.getApplication().addSystemListener(listener);
        }
    }

    /**
     * Remove the system listener if it is registered and close out the
     * callback handler.
     */
    private synchronized void removeListener() {
        if (listener != null) {
            Application.getApplication().removeSystemListener(listener);
            listener = null;

            if (callbackId != null) {
                success(new PluginResult(PluginResult.Status.NO_RESULT),
                        callbackId);
            }
        }
    }
}
