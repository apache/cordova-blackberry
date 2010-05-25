package com.phonegap.notification;

import net.rim.device.api.script.ScriptableFunction;
import net.rim.device.api.system.Alert;

public final class VibrateFunction extends ScriptableFunction {

	public Object invoke(Object obj, Object[] args) throws Exception {
		
		if (Alert.isVibrateSupported()) {
			int duration = (args.length == 1) ? (((Integer)args[0]).intValue()) : (1000);
			Alert.startVibrate(duration); 
		}
		
		return UNDEFINED;
	}
}
