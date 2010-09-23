package com.phonegap.api;

import net.rim.device.api.script.ScriptEngine;

import org.json.me.JSONArray;

/**
 * Plugin interface must be implemented by any plugin classes.
 *
 * The execute method is called by the PluginManager.
 *
 * @author davejohnson
 *
 */
public interface Plugin {
	/**
	 * Executes the request and returns PluginResult.
	 * 
	 * @param action The action to execute.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args JSONArry of arguments for the action.
	 * @return A PluginResult object with a status and message.
	 */
	PluginResult execute(String action, String calbackId, JSONArray args);
	
	/**
	 * Sets the script engine to allow plugins to interact with and 
	 * execute browser scripts. 
	 *  
	 * @param app The script engine of the widget application.
	 */
	void setContext(ScriptEngine app);

	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action);
}
