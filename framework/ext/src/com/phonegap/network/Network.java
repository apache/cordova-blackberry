package com.phonegap.network;

import com.phonegap.api.Command;
import com.phonegap.api.CommandResult;

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
public class Network implements Command {
	
	private ScriptEngine app;
	
	public static final String ACTION_IS_REACHABLE = "isReachable";
	
	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public CommandResult execute(String action, JSONArray args) {
		CommandResult result = null;
		
		if (action.equals(ACTION_IS_REACHABLE)) {
			result = IsReachableAction.execute(args);
		}
		else {
			result = new CommandResult(CommandResult.Status.INVALIDACTION,
				"{ message: 'InvalidActionException', status: "+CommandResult.Status.INVALIDACTION.ordinal()+" }");
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
