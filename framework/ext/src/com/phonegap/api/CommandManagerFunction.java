package com.phonegap.api;

import java.util.Hashtable;

import org.json.me.JSONArray;

import com.phonegap.PhoneGapExtension;

import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.script.ScriptableFunction;

public class CommandManagerFunction extends ScriptableFunction {
	
	private final static int ARG_CLASS = 0;
	private final static int ARG_ACTION = 1;
	private final static int ARG_CALLBACK_ID = 2;
	private final static int ARG_ARGS = 3;
	
	
	private final ScriptEngine app;
	private final Hashtable commandCache;
	
	public CommandManagerFunction(ScriptEngine app) {
		this.app = app;
		this.commandCache = new Hashtable();
	}
	
	public Object invoke(Object obj, Object[] oargs) throws Exception {

		final String clazz = (String)oargs[ARG_CLASS];
		final String action = (String)oargs[ARG_ACTION];
		final String callbackId = (String)oargs[ARG_CALLBACK_ID];
		final JSONArray args = new JSONArray((String)oargs[ARG_ARGS]);

		CommandResult cr = null;
		
		try {
			if (!commandCache.containsKey(clazz)) {
				commandCache.put(clazz, getClassByName(clazz).newInstance());
			}
			// Create a new instance of the plugin and set the context and webview
			final Command plugin = (Command)commandCache.get(clazz);
			plugin.setContext(this.app);

			// Run this async on a background thread so that JavaScript can continue on
			Thread thread = new Thread() {
				public void run() {
					// Call execute on the plugin so that it can do it's thing
					final CommandResult cr = plugin.execute(action, callbackId, args);
					if (cr != null) {
						// Check if the 
						if (cr.getStatus() == 0) {
							app.executeScript(cr.toSuccessCallbackString(callbackId), null);
						} else {
							app.executeScript(cr.toErrorCallbackString(callbackId), null);
						}
					}
				}
			};
			thread.start();
			return "";
		} catch (ClassNotFoundException e) {
			cr = new CommandResult(CommandStatus.CLASS_NOT_FOUND_EXCEPTION);
		} catch (IllegalAccessException e) {
			cr = new CommandResult(CommandStatus.ILLEGAL_ACCESS_EXCEPTION);
		} catch (InstantiationException e) {
			cr = new CommandResult(CommandStatus.INSTANTIATION_EXCEPTION);
		}
		return ( cr != null ? cr.getMessage() : "{ status: 0, message: 'all good' }" );
	}
	
	private Class getClassByName(final String clazz) throws ClassNotFoundException {
		return Class.forName(clazz);
	}
}
