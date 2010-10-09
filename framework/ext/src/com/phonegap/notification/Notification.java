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
	
	public static final int ACTION_ALERT   = 0;
	public static final int ACTION_BEEP    = 1;
	public static final int ACTION_CONFIRM = 2;
	public static final int ACTION_VIBRATE = 3;
	
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
		
		switch (getAction(action)) {
		case ACTION_ALERT: 
			result = AlertAction.execute(args);
			break;
		case ACTION_BEEP:
			result = BeepAction.execute(args);
			break;
		case ACTION_CONFIRM:
			result = new ConfirmAction().execute(args);
			break;
		case ACTION_VIBRATE:
			result = VibrateAction.execute(args);
			break;
		default: 
			result = new PluginResult(PluginResult.Status.INVALIDACTION, 
					"Notification: Invalid action: " + action);
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
	
	/**
	 * Returns action to perform.
	 * @param action 
	 * @return action to perform
	 */
	protected static int getAction(String action) {
		if ("alert".equals(action)) return ACTION_ALERT;
		if ("beep".equals(action)) return ACTION_BEEP;
		if ("confirm".equals(action)) return ACTION_CONFIRM;
		if ("vibrate".equals(action)) return ACTION_VIBRATE; 
		return -1;
	}		
}
