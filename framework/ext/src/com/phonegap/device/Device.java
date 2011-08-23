/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 * Copyright (c) 2011, Research In Motion Limited.
 */
package com.phonegap.device;

import net.rim.device.api.system.DeviceInfo;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;
import com.phonegap.json4j.JSONObject;

/**
 * Provides device information, including:
 * 
 * - Device platform version (e.g. 2.13.0.95). Not to be confused with BlackBerry OS version.
 * - Unique device identifier (UUID).
 * - PhoneGap software version.
 */
public final class Device extends Plugin {

	public static final String FIELD_PLATFORM 	= "platform";
	public static final String FIELD_UUID     	= "uuid";
	public static final String FIELD_PHONEGAP 	= "phonegap";
	public static final String FIELD_NAME 		= "name";
	public static final String FIELD_VERSION 	= "version";	
	
	public static final String ACTION_GET_DEVICE_INFO = "getDeviceInfo";
		
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		PluginResult result = new PluginResult(PluginResult.Status.INVALIDACTION, "Device: Invalid action:" + action);
		
		if(action.equals(ACTION_GET_DEVICE_INFO)){
			try {
				JSONObject device = new JSONObject();
				device.put( FIELD_PLATFORM, new String(DeviceInfo.getPlatformVersion() ) );
				device.put( FIELD_UUID, new Integer( DeviceInfo.getDeviceId()) );
				device.put( FIELD_PHONEGAP, "1.0.0" );
				device.put( FIELD_NAME, new String(DeviceInfo.getDeviceName()) );
				device.put( FIELD_VERSION, new String(DeviceInfo.getSoftwareVersion()) );
				result = new PluginResult(PluginResult.Status.OK, device);
			} catch (JSONException e) {
				result = new PluginResult(PluginResult.Status.JSONEXCEPTION, e.getMessage());
			}					
		}
		
		return result;
	}

}
