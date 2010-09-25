package com.phonegap;

import org.w3c.dom.Document;

import com.phonegap.api.PluginManagerFeature;
import com.phonegap.api.PluginResult;
import com.phonegap.device.DeviceFeature;
import com.phonegap.util.LogFeature;

import net.rim.device.api.browser.field2.BrowserField;
import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.ui.UiApplication;
import net.rim.device.api.web.WidgetConfig;
import net.rim.device.api.web.WidgetExtension;

public final class PhoneGapExtension implements WidgetExtension {

	protected static ScriptEngine script;
	
	// Called when the BlackBerry Widget references this extension for the first time.
	// It provides a list of feature IDs exposed by this extension.
	//
	public String[] getFeatureList() {
		String[] result = new String[1];
		result[0] = "phonegap";
		return result;
	}

	// Called whenever a widget loads a resource that requires a feature ID that is supplied
	// in the getFeatureList
	//
	public void loadFeature(String feature, String version, Document doc,
			ScriptEngine scriptEngine) throws Exception {
		
		script = scriptEngine;
		
		if (feature.equals("phonegap")) {
			scriptEngine.addExtension("phonegap.device",         new DeviceFeature());
			scriptEngine.addExtension("phonegap.PluginManager",  new PluginManagerFeature(scriptEngine));
			scriptEngine.addExtension("phonegap.Logger",         new LogFeature());
		}
	}

	// Called so that the extension can get a reference to the configuration or browser field object
	//
	public void register(WidgetConfig widgetConfig, BrowserField browserField) {
		// TODO Auto-generated method stub
	}

	// Called to clean up any features when the extension is unloaded
	//
	public void unloadFeatures(Document doc) {
		// TODO Auto-generated method stub

	}

	public static void invokeSuccessCallback(String callbackId, PluginResult result) {
		script.executeScript(result.toSuccessCallbackString(callbackId), null);
	}

	public static void invokeErrorCallback(String callbackId, PluginResult result) {
		script.executeScript(result.toErrorCallbackString(callbackId), null);
	}
}
