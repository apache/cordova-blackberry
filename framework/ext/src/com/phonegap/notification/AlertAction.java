package com.phonegap.notification;

import com.phonegap.api.PluginResult;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import net.rim.device.api.ui.Screen;
import net.rim.device.api.ui.UiApplication;

/**
 * Alert Action (Singleton)
 *
 * Displays and interacts with a dialog box.
 *
 */
public class AlertAction {
	
	private static final String DEFAULT_MESSAGE = "";
	private static final String DEFAULT_TITLE   = "Alert";
	private static final String DEFAULT_BUTTON  = "OK";
	
	/**
	 * Displays a custom alert.
	 *
	 * @param args JSONArray formatted as [ message, title, buttonLabel ]
	 *             message:     the message to display in the dialog body (default: "").
	 *             title:       the title to display at the top of the dialog (default: "Alert").
	 *             buttonLabel: the button text (default: "OK").
	 * @return A PluginResult object with the success or failure state for displaying the dialog box.
	 */
	public static PluginResult execute(JSONArray args) {
		
		PluginResult result = null;
		
		try {
			String message = DEFAULT_MESSAGE;
			String title = DEFAULT_TITLE;
			String buttonLabel = DEFAULT_BUTTON;
			if (args.length() > 0 && args.get(0) != null)
				message = args.getString(0);
			if (args.length() > 1 && args.get(1) != null)
				title = args.getString(1);
			if (args.length() > 2 && args.get(2) != null)
				buttonLabel = args.getString(2);
			
			synchronized(UiApplication.getEventLock()) {
				UiApplication ui = UiApplication.getUiApplication();
				Screen screen = new AlertDialog(message, title, buttonLabel);
				ui.pushScreen(screen);
			}
			
			result = new PluginResult(PluginResult.Status.OK);
		}
		catch (JSONException e) {
			result = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
		}
		
		return result;
	}
}