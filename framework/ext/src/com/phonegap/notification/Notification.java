package com.phonegap.notification;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

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
public class Notification implements Plugin {
	
	private ScriptEngine app;
	
	public static final String ACTION_ALERT   = "alert";
	public static final String ACTION_BEEP    = "beep";
	public static final String ACTION_VIBRATE = "vibrate";
	
	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public PluginResult execute(String action, String callbackId, JSONArray args) {
		PluginResult result = null;
		
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
			result = new PluginResult(PluginResult.Status.INVALIDACTION, "Notification: Invalid action: " + action);
		}
		
		return result;
	}
	
	/**
	 * Sets the script engine to allow plugins to interact with and 
	 * execute browser scripts. 
	 *  
	 * @param app The script engine of the widget application.
	 */
	public void setContext(ScriptEngine app) {
		this.app = app;
	}

	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
		return true;
	}	
}
