package com.phonegap.network;

import net.rim.device.api.script.Scriptable;
import net.rim.device.api.script.ScriptEngine;

public final class NetworkFeature extends Scriptable {

	public static final String FIELD_IS_REACHABLE = "isReachable";
	
	private IsReachableFunction callIsReachable;
	
	public NetworkFeature(ScriptEngine scriptEngine) {
		this.callIsReachable = new IsReachableFunction(scriptEngine);
	}
	
	public Object getField(String name) throws Exception {
		if (name.equals(FIELD_IS_REACHABLE)) {
			return this.callIsReachable;
		}
	
		return super.getField(name);
	}
}
