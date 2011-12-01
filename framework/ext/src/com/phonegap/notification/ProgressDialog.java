/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */
package com.phonegap.notification;

import net.rim.device.api.system.Characters;
import net.rim.device.api.ui.UiApplication;
import net.rim.device.api.ui.component.GaugeField;
import net.rim.device.api.ui.component.LabelField;
import net.rim.device.api.ui.component.SeparatorField;
import net.rim.device.api.ui.container.PopupScreen;
import net.rim.device.api.ui.container.VerticalFieldManager;

import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;
import com.phonegap.ui.SpacerField;

/**
 * A Popup progress dialog box with an optional title and message and a progress
 * bar with a range from 0 to 100 (percent).
 */
public final class ProgressDialog extends PopupScreen {
    private static ProgressDialog dialog = null;
    private GaugeField gauge = null;

    /**
     * Construct a progress dialog, with customizable title and message.
     *
     * @param title
     *            Title of the progress dialog
     * @param message
     *            Message to print in the body of the dialog
     */
    private ProgressDialog(String title, String message) {
        super(new VerticalFieldManager());

        if (title != null && title.length() > 0) {
            add(new LabelField(title));
            add(new SeparatorField(SeparatorField.LINE_HORIZONTAL));
        }

        if (message != null && message.length() > 0) {
            add(new SpacerField(0, 20));
            add(new LabelField(message, FIELD_HCENTER | FIELD_VCENTER));
        }
        add(new SpacerField(0, 20));

        gauge = new GaugeField(null, 0, 100, 0, GaugeField.PERCENT
                | GaugeField.FIELD_HCENTER);
        add(gauge);
        add(new SpacerField(0, 20));
    }

    /**
     * Changes the value displayed in the dialogs GaugeField.
     *
     * @param args
     *            JSONArray of arguments.
     * @return a PluginResult indicating success or error.
     */
    static synchronized PluginResult setValue(JSONArray args) {
        if (dialog != null) {
            if (args.length() > 0 && !args.isNull(0)) {
                int value = -1;
                try {
                    value = args.getInt(0);
                } catch (JSONException e) {
                    return new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                            "JSONException: " + e.getMessage());
                }

                if (value >= 0 && value <= 100) {
                    dialog.setValue(value);
                }
            }
        }
        return new PluginResult(PluginResult.Status.OK, "");
    }

    /**
     * Creates and displays the progress dialog.
     *
     * @param args
     *            JSONArray of arguments.
     * @return a PluginResult indicating success or error.
     */
    static synchronized PluginResult start(JSONArray args) {
        if (dialog == null) {
            String message = null;
            String title = null;

            // Title and message are optional, grab the strings from the args
            // if they are there.
            if (args != null && args.length() > 0) {
                try {
                    if (!args.isNull(0)) {
                        title = args.getString(0);
                    }
                    if (args.length() > 1 && !args.isNull(1)) {
                        message = args.getString(1);
                    }
                } catch (JSONException e) {
                    return new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                            "JSONException: " + e.getMessage());
                }
            }

            dialog = new ProgressDialog(title, message);
            final UiApplication uiApp = UiApplication.getUiApplication();
            uiApp.invokeLater(new Runnable() {
                public void run() {
                    uiApp.pushModalScreen(dialog);
                }
            });
        }

        return new PluginResult(PluginResult.Status.OK, "");
    }

    /**
     * Closes the progress dialog.
     *
     * @return a PluginResult indicating success or error.
     */
    static synchronized PluginResult stop() {
        if (dialog != null) {
            final UiApplication uiApp = UiApplication.getUiApplication();
            final ProgressDialog tmpDialog = dialog;
            uiApp.invokeLater(new Runnable() {
                public void run() {
                    uiApp.popScreen(tmpDialog);
                }
            });
            dialog = null;
        }

        return new PluginResult(PluginResult.Status.OK, "");
    }

    /**
     * @see net.rim.device.api.ui.Screen#keyChar(char, int, int)
     */
    protected boolean keyChar(char key, int status, int time) {
        // If the user clicks back key while progress dialog is displayed, close
        // the progress dialog.
        if (key == Characters.ESCAPE) {
            stop();
        }

        return super.keyChar(key, status, time);
    }

    /**
     * Changes the value displayed in the GaugeField.
     *
     * @param value
     *            the value (percentage) to set in GaugeField.
     */
    private void setValue(final int value) {
        UiApplication.getUiApplication().invokeLater(new Runnable() {
            public void run() {
                gauge.setValue(value);
            }
        });
    }
}
