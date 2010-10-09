package com.phonegap.notification;

import net.rim.device.api.system.Application;
import net.rim.device.api.ui.UiApplication;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import com.phonegap.api.PluginResult;
import com.phonegap.util.Logger;

/**
 * Displays a confirmation dialog with customizable title, message, and button
 * fields.
 */
public class ConfirmAction {

    private static final String DEFAULT_MESSAGE = "";
    private static final String DEFAULT_TITLE   = "Confirm";
    private static final String DEFAULT_BUTTONS = "OK,Cancel";

    /**
     * Displays a custom confirmation dialog.
     *
     * @param args JSONArray formatted as [ message, title, buttonLabels ]
     *             message:     the message to display in the dialog body (default: "").
     *             title:       the title to display at the top of the dialog (default: "Confirm").
     *             buttonLabel: the button text (default: "OK,Cancel").
     * @return A PluginResult object with .
     */
    public synchronized PluginResult execute(JSONArray args) {

        PluginResult result = null;

        try {
            String message = DEFAULT_MESSAGE;
            String title = DEFAULT_TITLE;
            String buttonLabels = DEFAULT_BUTTONS;
            if (args.length() > 0 && args.get(0) != null)
                message = args.getString(0);
            if (args.length() > 1 && args.get(1) != null)
                title = args.getString(1);
            if (args.length() > 2 && args.get(2) != null)
                buttonLabels = args.getString(2);

            // show the dialog
            ConfirmDialog dialog = new ConfirmDialog(message, title, buttonLabels);
            synchronized(UiApplication.getEventLock()) {
                UiApplication ui = UiApplication.getUiApplication();
                ui.pushScreen(dialog);
            }
                
            // wait for it...(to close)
            dialog.setListener(this);
            try {
                this.wait(); 
            } catch (InterruptedException e) {
                Logger.log(this.getClass().getName() + ": " + e.getMessage());
            }
           
            // add '1' to the button index to match the JavaScript API (which starts at 1)
            // (why not start at '0'?  aren't we programmers?)
            int value = dialog.getSelectedValue() + 1;

            Logger.log(this.getClass().getName() + ": returning button=" + value);
            result = new PluginResult(PluginResult.Status.OK, Integer.toString(value));
        }
        catch (JSONException e) {
            result = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
        }

        return result;
    }
}
