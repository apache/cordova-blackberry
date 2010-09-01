package com.phonegap.network;

import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.script.ScriptableFunction;
import net.rim.device.api.system.RadioInfo;
import net.rim.device.api.system.WLANInfo;

public final class IsReachableFunction extends ScriptableFunction {

	private static final int NOT_REACHABLE                      = 0;
	private static final int REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
	private static final int REACHABLE_VIA_WIFI_NETWORK         = 2;
	
	private static ScriptEngine mScriptEngine = null;
	
	public IsReachableFunction(ScriptEngine scriptEngine) {
		mScriptEngine = scriptEngine;
	}
	
	public Object invoke(Object obj, Object[] args) throws Exception {
		
		int reachability = NOT_REACHABLE;
		
		if (RadioInfo.isDataServiceOperational()) {
			reachability = REACHABLE_VIA_CARRIER_DATA_NETWORK;
		}
		
		if (WLANInfo.getWLANState() == WLANInfo.WLAN_STATE_CONNECTED) {
			reachability = REACHABLE_VIA_WIFI_NETWORK;
		}
		
		mScriptEngine.executeScript("navigator.network._reachabilityCallback(" + reachability + ");", obj);
		
		return new Integer(reachability);
		//if (Alert.isVibrateSupported()) {
		//	int duration = (args.length == 1) ? (((Integer)args[0]).intValue()) : (1000);
		//	Alert.startVibrate(duration); 
		//}
		
		//return UNDEFINED;
	}
}
