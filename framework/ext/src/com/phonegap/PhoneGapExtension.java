/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 * Copyright (c) 2011, Research In Motion Limited.
 */
package com.phonegap;

import net.rim.device.api.browser.field2.BrowserField;
import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.system.Application;
import net.rim.device.api.web.WidgetConfig;
import net.rim.device.api.web.WidgetExtension;
import net.rim.device.api.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.phonegap.api.PluginManager;
import com.phonegap.api.PluginResult;
import com.phonegap.device.Device;
import com.phonegap.notification.Notification;
import com.phonegap.util.Log;
import com.phonegap.util.Logger;

/**
 * PhoneGapExtension is a BlackBerry WebWorks JavaScript extension.  It 
 * represents a single feature that can be used to access device capabilities. 
 */
public final class PhoneGapExtension implements WidgetExtension {

    // BrowserField object used to display the application
    //
    protected static BrowserField browser = null;
    
    // Browser script engine
    //
    protected static ScriptEngine script;

    // Application name
    //
    protected static String appName;

    // Application GUID
    //
    protected static long appID;
    
    // Plugin Manager
    //
    protected PluginManager pluginManager;
    
    // Feature ID
    //
    private static final String FEATURE_ID ="com.phonegap";

	// Called when the BlackBerry Widget references this extension for the first time.
	// It provides a list of feature IDs exposed by this extension.
	//
	public String[] getFeatureList() {
		return new String[] {FEATURE_ID};
	}

    // Called whenever a widget loads a resource that requires a feature ID that is supplied
    // in the getFeatureList
    //
    public void loadFeature(String feature, String version, Document doc,
            ScriptEngine scriptEngine) throws Exception {
        script = scriptEngine;
        // Not sure why logger is not already enabled?
        Logger.enableLogging();
        if (feature.equals(FEATURE_ID)) {
            pluginManager = new PluginManager(this);

            // create and parse the plugins.xml
            Document c = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(Application.class.getResourceAsStream("/plugins.xml"));

            NodeList plugins = c.getElementsByTagName("plugin");
            if (plugins.getLength() == 0) {
                Logger.warn("If you are using any PhoneGap APIs you will need to "+
                        "specify them in the config.xml using <gap:plugin name=\"MyPlugin\" "+
                        "value=\"com.example.MyPlugin\"/>");
            }
            for(int i=0; i<plugins.getLength() ; i++){
                Node plugin = plugins.item(i);
                Logger.log("Found plugin " + plugin.getAttributes().getNamedItem("name").getNodeValue() + " = " +  
                        plugin.getAttributes().getNamedItem("value").getNodeValue());
                pluginManager.addService(plugin.getAttributes().getNamedItem("name").getNodeValue(), 
                        plugin.getAttributes().getNamedItem("value").getNodeValue());
            }

            scriptEngine.addExtension("com.phonegap.JavaPluginManager",  pluginManager);
            scriptEngine.addExtension("com.phonegap.Logger",         new Log());

            // let PhoneGap JavaScript know that extensions have been loaded
            // if this is premature, we at least set the _nativeReady flag to true
            // so that when the JS side is ready, it knows native side is too
            Logger.log(this.getClass().getName() + ": invoking PhoneGap.onNativeReady.fire()");
            scriptEngine.executeScript("try {PhoneGap.onNativeReady.fire();} catch(e) {_nativeReady = true;}", null);
        }
    }

    // Called so that the extension can get a reference to the configuration or browser field object
    //
    public void register(WidgetConfig widgetConfig, BrowserField browserField) {
        browser = browserField;

        // grab widget application name and use it to generate a unique ID
        appName = widgetConfig.getName();
        appID = Long.parseLong(Math.abs(("com.phonegap."+appName).hashCode())+"",16);

        // create a notification profile for the application
        Notification.registerProfile();
    }

	// Called to clean up any features when the extension is unloaded
	//
	public void unloadFeatures(Document doc) {
		// TODO Auto-generated method stub
	}

	public static void invokeScript(String js) {
		script.executeScript(js, null);
	}
	
	/**
	 * Invokes the PhoneGap success callback specified by callbackId.
	 * @param callbackId   unique callback ID
	 * @param result       PhoneGap PluginResult containing result
	 */
	public static void invokeSuccessCallback(String callbackId, PluginResult result) {
		invokeScript(result.toSuccessCallbackString(callbackId));
	}

	/**
	 * Invokes the PhoneGap error callback specified by callbackId.
	 * @param callbackId   unique callback ID
	 * @param result       PhoneGap PluginResult containing result
	 */
	public static void invokeErrorCallback(String callbackId, PluginResult result) {
		invokeScript(result.toErrorCallbackString(callbackId));
	}
	
	/**
	 * Provides access to the browser instance for the application.
	 */
	public static BrowserField getBrowserField() {
	    return browser;
    }

    /**
     * Returns the widget application name.
     */
    public static String getAppName() {
        return appName;
    }

    /**
     * Returns unique ID of the widget application.
     */
    public static long getAppID() {
        return appID;
    }
}
