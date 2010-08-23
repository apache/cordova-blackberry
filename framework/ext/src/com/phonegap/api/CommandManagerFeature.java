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
	private final ScriptEngine app;
	
	public static final String FIELD_EXEC    = "exec";

	private final CommandManagerFunction    commandManager;
	
	public CommandManagerFeature(ScriptEngine app) {
		this.app = app;
		this.commandManager = new CommandManagerFunction(this.app);
	}
}