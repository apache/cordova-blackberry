package com.phonegap.notification;

import com.phonegap.api.CommandResult;

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
	 * Displays a custom dialog box.
	 *
	 * @param args JSONArray formatted as [ message, title, buttonLabel ]
	 *             message:     the message to display in the dialog body (default: "").
	 *             title:       the title to display at the top of the dialog (default: "Alert").
	 *             buttonLabel: the button text (default: "OK").
	 * @return A CommandResult object with the success or failure state for displaying the dialog box.
	 */
	public static CommandResult execute(JSONArray args) {
		
		CommandResult result = null;
		
		try {
			String message     = (args.length() > 0) ? ((String)args.get(0)) : DEFAULT_MESSAGE;
			String title       = (args.length() > 1) ? ((String)args.get(1)) : DEFAULT_TITLE;
			String buttonLabel = (args.length() > 2) ? ((String)args.get(2)) : DEFAULT_BUTTON;
			
			synchronized(UiApplication.getEventLock()) {
				UiApplication ui = UiApplication.getUiApplication();
				Screen screen = new CustomDialog(message, title, buttonLabel);
				ui.pushScreen(screen);
			}
			
			result = new CommandResult(CommandResult.Status.OK, "true");
		}
		catch (JSONException e) {
			result = new CommandResult(CommandResult.Status.JSONEXCEPTION,
				"{ message: 'JSONException', status: "+CommandResult.Status.JSONEXCEPTION.ordinal()+" }");
		}
		
		return result;
	}
}