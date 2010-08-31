package com.phonegap.notification;

import net.rim.device.api.script.ScriptableFunction;
import net.rim.device.api.ui.Screen;
import net.rim.device.api.ui.UiApplication;

public final class AlertFunction extends ScriptableFunction {

	public Object invoke(Object obj, Object[] args) throws Exception {
		
		// set title, message, and button label	
		String message = (args.length > 0) ? ((String)args[0]) : "";
		String title = (args.length > 1) ? ((String)args[1]) : "Alert";
		String buttonLabel = (args.length > 2) ? ((String)args[2]) : "OK";
		
		// show custom dialog
		synchronized(UiApplication.getEventLock()) {
			UiApplication ui = UiApplication.getUiApplication();
			Screen screen = new CustomDialog(message, title, buttonLabel);
			ui.pushScreen(screen);
		}

		return UNDEFINED;
	}

}
