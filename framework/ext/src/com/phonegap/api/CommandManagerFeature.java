package com.phonegap.api;

import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.script.Scriptable;

/**
 * CommandManager is exposed to JavaScript in the PhoneGap WebView.
 * 
 * Calling native plugin code can be done by calling CommandManager.exec(...)
 * from JavaScript.
 * 
 * @author davejohnson
 *
 */
public final class CommandManagerFeature extends Scriptable {
	public static final String FIELD_EXEC = "exec";
	
	private final CommandManagerFunction callCommandManager;
	
	public CommandManagerFeature(ScriptEngine scriptEngine) {
		this.callCommandManager = new CommandManagerFunction(scriptEngine);
	}
	
	public Object getField(String name) throws Exception {
		if (name.equals(FIELD_EXEC)) {
			return this.callCommandManager;
		}
		
		return super.getField(name);
	}
}