package com.phonegap.api;

import org.json.me.JSONArray;

import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.script.ScriptableFunction;

public class CommandManagerFunction extends ScriptableFunction {
	
	private final ScriptEngine app;
	
	public CommandManagerFunction(ScriptEngine app) {
		this.app = app;
	}
	
	public Object invoke(Object obj, Object[] oargs) throws Exception {
		final String clazz = (String)oargs[0];
		final String action = (String)oargs[1];
		final String callbackId = (String)oargs[2];
		final JSONArray args = new JSONArray((String)oargs[3]);
		final boolean async = (oargs[4].toString().equals("1") ? true : false);
		CommandResult cr = null;
		
		try {
			Class c = getClassByName(clazz);

			// Create a new instance of the plugin and set the context and webview
			final Command plugin = (Command)c.newInstance();
			plugin.setContext(this.app);
			//plugin.setView(this.app);

			if (async) {
				// Run this async on a background thread so that JavaScript can continue on
				Thread thread = new Thread() {
					public void run() {
						// Call execute on the plugin so that it can do it's thing
						final CommandResult cr = plugin.execute(action, args);
						// Check if the 
						if (cr.getStatus() == 0) {
							app.executeScript(cr.toSuccessCallbackString(callbackId), null);
						} else {
							app.executeScript(cr.toErrorCallbackString(callbackId), null);
						}
					}
				};
				thread.start();
				return "";
			} else {
				// Call execute on the plugin so that it can do it's thing
				cr = plugin.execute(action, args);
			}
		} catch (ClassNotFoundException e) {
			cr = new CommandResult(CommandResult.Status.CLASSNOTFOUNDEXCEPTION, 
					"{ message: 'ClassNotFoundException', status: "+CommandResult.Status.CLASSNOTFOUNDEXCEPTION.ordinal()+" }");
		} catch (IllegalAccessException e) {
			cr = new CommandResult(CommandResult.Status.ILLEGALACCESSEXCEPTION, 
					"{ message: 'IllegalAccessException', status: "+CommandResult.Status.ILLEGALACCESSEXCEPTION.ordinal()+" }");
		} catch (InstantiationException e) {
			cr = new CommandResult(CommandResult.Status.INSTANTIATIONEXCEPTION, 
					"{ message: 'InstantiationException', status: "+CommandResult.Status.INSTANTIATIONEXCEPTION.ordinal()+" }");
		}
		// if async we have already returned at this point unless there was an error...
		if (async) {
			app.executeScript(cr.toErrorCallbackString(callbackId), null);
		}
		return ( cr != null ? cr.getResult() : "{ status: 0, message: 'all good' }" );
	}
	
	private Class getClassByName(final String clazz) throws ClassNotFoundException {
		return Class.forName(clazz);
	}
}
