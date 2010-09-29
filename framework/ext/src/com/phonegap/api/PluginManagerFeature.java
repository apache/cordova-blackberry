package com.phonegap.api;

import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.script.Scriptable;

/**
 * PluginManagerFeature provides the plugin feature to the PhoneGap widget 
 * extension.  This feature is registered with the script engine as extension
 * <code>phonegap.PluginManager</code>.
 * 
 * This feature provides a single function, PluginManagerFunction, which 
 * represents a function that can be invoked from the script environment.  
 * To invoke the PluginManagerFunction from JavaScript, use 
 * <code>phonegap.PluginManager.exec(...)</code> 
 */
public final class PluginManagerFeature extends Scriptable {
	
	public static final String FIELD_EXEC = "exec";		
	private final PluginManagerFunction pluginManagerFunction;
	
	public PluginManagerFeature(ScriptEngine scriptEngine) {
		this.pluginManagerFunction = new PluginManagerFunction(scriptEngine);
        this.pluginManagerFunction.addService("Camera", "com.phonegap.camera.Camera");
        this.pluginManagerFunction.addService("Network Status", "com.phonegap.network.Network");
        this.pluginManagerFunction.addService("Notification", "com.phonegap.notification.Notification");
        this.pluginManagerFunction.addService("Accelerometer", "com.phonegap.accelerometer.Accelerometer");
	}
	
	/**
	 * When script environment calls phonegap.pluginManager.exec, ScriptEngine will invoke
	 * pluginManagerFunction.invoke.
	 */
	public Object getField(String name) throws Exception {
		if (name.equals(FIELD_EXEC)) {
			return this.pluginManagerFunction;
		}
		return super.getField(name);
	}
}