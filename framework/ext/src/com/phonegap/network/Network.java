package com.phonegap.network;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

import org.json.me.JSONArray;

import net.rim.device.api.script.ScriptEngine;

/**
 * The Network command interface.
 *
 * The Network class can invoke the following actions:
 *
 *   - isReachable(domain, callback)
 *
 */
public class Network implements Plugin {
	
	private ScriptEngine app;
	
	public static final String ACTION_IS_REACHABLE = "isReachable";
	
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
		
		if (action.equals(ACTION_IS_REACHABLE)) {
			result = IsReachableAction.execute(args);
		}
		else {
			result = new PluginResult(PluginResult.Status.INVALIDACTION, "Network: Invalid action: " + action);
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
		return false;
	}	
}
