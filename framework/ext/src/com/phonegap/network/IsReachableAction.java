package com.phonegap.network;

import com.phonegap.api.PluginResult;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.system.RadioInfo;
import net.rim.device.api.system.WLANInfo;

/**
 * IsReachable Action (Singleton)
 *
 * Find the device's current (best) network state:
 *
 *   - No network
 *   - Cellular data network
 *   - WiFi network
 *
 */
public class IsReachableAction {
	
	private static final int NOT_REACHABLE                      = 0;
	private static final int REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
	private static final int REACHABLE_VIA_WIFI_NETWORK         = 2;
	
	/**
	 * Find the device's current network state.
	 *
	 * The most reliable network is returned as the current network state.
	 *
	 * @param args JSONArray formatted as [ domain, callback ]
	 *             domain:   the domain to ping. This is ignored.
	 *             callback: the success callback that receives the network state.
	 * @return A CommandResult object with the success or failure state for finding
	 *         the state of the network.
	 */
	public static PluginResult execute(JSONArray args) {
		
		int networkState = NOT_REACHABLE;
		
		if (RadioInfo.isDataServiceOperational()) {
			networkState = REACHABLE_VIA_CARRIER_DATA_NETWORK;
		}
		
		if (WLANInfo.getWLANState() == WLANInfo.WLAN_STATE_CONNECTED) {
			networkState = REACHABLE_VIA_WIFI_NETWORK;
		}
		
		PluginResult result = new PluginResult(PluginResult.Status.OK, Integer.toString(networkState));
		
		return result;
	}
}