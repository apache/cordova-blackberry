package com.phonegap.util;

import net.rim.device.api.script.ScriptableFunction;

/**
 * LogFunction represents a function that can be invoked from the script 
 * environment of the widget framework.  Messages are logged to the Blackberry
 * Event Log.  From JavaScript, invoke
 * 
 * <code>phonegap.Logger.log(msg);</code>
 */
public class LogFunction extends ScriptableFunction {

    public Object invoke(Object obj, Object[] oargs) throws Exception {
        
    	if (oargs != null) {
    		String message = (String)oargs[0];
            Logger.log(message);    		
    	}
    	
        return null;
      }
}
