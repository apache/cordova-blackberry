package com.phonegap.notification;

import net.rim.device.api.script.Scriptable;

public final class NotificationFeature extends Scriptable {

	public static final String FIELD_BEEP    = "beep";
	public static final String FIELD_VIBRATE = "vibrate";
	
	private BeepFunction    callBeep;
	private VibrateFunction callVibrate;
	
	public NotificationFeature() {
		this.callBeep    = new BeepFunction();
		this.callVibrate = new VibrateFunction();
	}
	
	public Object getField(String name) throws Exception {
		if (name.equals(FIELD_BEEP)) {
			return this.callBeep;
		}
		else if (name.equals(FIELD_VIBRATE)) {
			return this.callVibrate;
		}
	
		return super.getField(name);
	}
}
