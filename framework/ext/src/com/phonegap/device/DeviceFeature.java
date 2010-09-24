package com.phonegap.device;

import net.rim.device.api.script.Scriptable;
import net.rim.device.api.system.DeviceInfo;

public final class DeviceFeature extends Scriptable {
	public static final String FIELD_PLATFORM = "platform";
	public static final String FIELD_UUID     = "uuid";
	public static final String FIELD_PHONEGAP = "phonegap";
	
	public Object getField(String name) throws Exception {
		
		if (name.equals(FIELD_PLATFORM)) {
			return new String(DeviceInfo.getPlatformVersion());
		}
		else if (name.equals(FIELD_UUID)) {
			return new Integer(DeviceInfo.getDeviceId());
		}
		else if (name.equals(FIELD_PHONEGAP)) {
			return "pre-0.92 EDGE";
		}
		
		return super.getField(name);
	}
}






