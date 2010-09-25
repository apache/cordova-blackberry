package com.phonegap.util;

import net.rim.device.api.script.Scriptable;
import net.rim.device.api.script.ScriptableFunction;

/**
 * LogFeature provides a mechanism for JavaScript code to utilize the Event Log.
 * LogFeature uses the <code>Logger</code> class under the covers.  
 * 
 * To enable use of the Blackberry Event Log from JavaScript, you must first
 * invoke the <code>enable</code> method:
 * 
 * <code>phonegap.Logger.enable();</code>
 * <code>phonegap.Logger.log(msg);</code>
 * 
 */
public final class LogFeature extends Scriptable {

	public static final String FIELD_LOG = "log";
	public static final String FIELD_ENABLE = "enable";
	
	public final LogFunction logFunction; // logs to the Event Log
	
	public LogFeature() {
		this.logFunction = new LogFunction();
	}

	public Object getField(String name) throws Exception {

		if (name.equals(FIELD_LOG)) {
			return this.logFunction;
		} 
		else if (name.equals(FIELD_ENABLE)) {
			return new ScriptableFunction() {
			    public Object invoke(Object obj, Object[] oargs) throws Exception {
			    	Logger.enableLogging();
			        return null;
			    }
			};
		}
		return super.getField(name);
	}

}
