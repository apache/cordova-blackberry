package com.phonegap.notification;

import com.phonegap.api.Command;
import com.phonegap.api.CommandResult;
import com.phonegap.api.CommandStatus;

import org.json.me.JSONArray;

import net.rim.device.api.script.ScriptEngine;

/**
 * The Notification command interface.
 *
 * The Notification class can invoke the following actions:
 *
 *   - alert(message, title, buttonLabel)
 *   - beep(count)
 *   - vibration(duration)
 *
 */
public class Notification implements Command {
	
	private ScriptEngine app;
	
	public static final String ACTION_ALERT   = "alert";
	public static final String ACTION_BEEP    = "beep";
	public static final String ACTION_VIBRATE = "vibrate";
	
	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public CommandResult execute(String action, String callbackId, JSONArray args) {
		CommandResult result = null;
		
		if (action.equals(ACTION_ALERT)) {
			result = AlertAction.execute(args);
		}
		else if (action.equals(ACTION_BEEP)) {
			result = BeepAction.execute(args);
		}
		else if (action.equals(ACTION_VIBRATE)) {
			result = VibrateAction.execute(args);
		}
		else {
			result = new CommandResult(CommandStatus.INVALID_ACTION);
		}
		
		return result;
	}
	
	/**
	 * Sets the context of the Command. This can then be used to do things like
	 * get file paths associated with the UiApplication.
	 * 
	 * @param app The context of the main UiApplication.
	 */
	public void setContext(ScriptEngine app) {
		this.app = app;
	}
}
