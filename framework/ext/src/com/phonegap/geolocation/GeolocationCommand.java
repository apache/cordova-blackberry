package com.phonegap.geolocation;

import java.util.Date;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Timer;
import java.util.Vector;

import javax.microedition.location.Criteria;
import javax.microedition.location.Location;
import javax.microedition.location.LocationException;
import javax.microedition.location.LocationProvider;

import net.rim.device.api.gps.GPSInfo;
import net.rim.device.api.script.ScriptEngine;

import org.json.me.JSONArray;
import org.json.me.JSONException;
import org.json.me.JSONObject;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.Command;
import com.phonegap.api.CommandResult;

public class GeolocationCommand implements Command {

	private ScriptEngine app;
	
	// Possible actions
	private static final int WATCH_ACTION = 1;
	private static final int CLEAR_WATCH_ACTION = 2;
	private static final int GET_POSITION_ACTION = 3;
	private static final int SHUTDOWN = 4;
	
	// STOP_COMMAND argument indices
	private static final int STOP_ARG_CALLBACK_ID = 0;

	private static final float MIN_GPS_ACCURACY = 10F; // meters

	private static final String CALLBACKS_KEY = "callbacks";
	private static final String LOCATION_PROVIDER_KEY = "locationProvider";
	
	/**
	 * The last valid position that was receieved.
	 */
	private Position lastPosition;
	/**
	 * Indicates if we have been able to get a location provider object or not.
	 */
	private boolean gpsAvailable = true;

	/**
	 * Hash of all the location providers created, keyed on the position options.
	 */
	private final Hashtable locationProviders;
	/**
	 * Hash of location provider keys, keyed on callback ids.
	 */
	private final Hashtable callbackIdKeyMap;

	public GeolocationCommand() {
		this.locationProviders = new Hashtable();
		this.callbackIdKeyMap = new Hashtable();
	}

	public void setContext(ScriptEngine app) {
		this.app = app;
	}
	
	public CommandResult execute(String action, String callbackId, JSONArray args) {
		PositionOptions po;

		// 6.0
		//LocationInfo.isLocationOn();
		//LocationInfo.setLocationOn();
		//LocationInfo.isModeAvailable();
		
		// 5.0
		//GPSInfo.isGPSModeAvailable(GPSInfo.GPS_DEVICE_INTERNAL);
		
		if (!gpsAvailable) {
			return new CommandResult(GeolocationStatus.GPS_NOT_AVAILABLE);
		}

		switch (getCommand(action)) {
			case CLEAR_WATCH_ACTION:
				try {
					callbackId = args.getString(STOP_ARG_CALLBACK_ID);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					return new CommandResult(GeolocationStatus.INVALID_ARGUMENT, "Callback ID argument is not valid.");
				}

				return clearWatch(callbackId);

			case WATCH_ACTION:

				try {
					po = PositionOptions.fromJSONArray(args);
				} catch (NumberFormatException e) {
					return new CommandResult(GeolocationStatus.INVALID_ARGUMENT, "One of the arguments is not a valid number.");					
				} catch (JSONException e) {
					return new CommandResult(GeolocationStatus.INVALID_ARGUMENT, "One of the arguments is not valid JSON.");
				}

				// This should return either null or an error CommandResult
				return this.watchPosition(callbackId, action, po);
				
			case GET_POSITION_ACTION:

				try {
					po = PositionOptions.fromJSONArray(args);
				} catch (NumberFormatException e) {
					return new CommandResult(GeolocationStatus.INVALID_ARGUMENT, "One of the arguments is not a valid number.");					
				} catch (JSONException e) {
					return new CommandResult(GeolocationStatus.INVALID_ARGUMENT, "One of the arguments is not valid JSON.");
				}

				return this.getCurrentPosition(action, po);

			case SHUTDOWN:
				return this.shutdown();

		}
		return new CommandResult(GeolocationStatus.INVALID_ACTION);
	}

	/**
	 * Checks if the provided location is valid or not.
	 * @param location
	 * @return
	 */
	public boolean isLocationValid(Location location) {
		return location != null && location.isValid();
	}
	
	/**
	 * Checks if the provided location is fresh or not.
	 * @param po
	 * @param location
	 * @return
	 */
	public boolean isLocationFresh(PositionOptions po, Location location) {
		return new Date().getTime() - location.getTimestamp() < po.maxAge;
	}
	
	/**
	 * Checks if the accuracy of the location is high enough.
	 * @param po
	 * @param location
	 * @return
	 */
	public boolean isLocationAccurate(PositionOptions po, Location location) {
		return po.enableHighAccuracy && location.getQualifiedCoordinates().getHorizontalAccuracy() > MIN_GPS_ACCURACY;
	}
	
	/**
	 * Creates a new location provider with some criteria.
	 * If unable to get a location provider gpsAvailable is set to false.
	 * @return
	 */
	public LocationProvider getLocationProvider() {
		/*
 void	setCostAllowed(boolean costAllowed) 
          Sets the preferred cost setting.
 void	setPreferredPowerConsumption(int level) 
          Sets the preferred maximum level of power consumption.
 void	setPreferredResponseTime(int time) 
          Sets the desired maximum response time preference.
		 */
		Criteria c = new Criteria();
		c.setAddressInfoRequired(false);
		c.setAltitudeRequired(true);
		c.setCostAllowed(true);
		c.setHorizontalAccuracy(100);
		//c.setVerticalAccuracy(accuracy);
		c.setPreferredPowerConsumption(Criteria.NO_REQUIREMENT);
		c.setPreferredResponseTime(10000);
		c.setSpeedAndCourseRequired(true);
		LocationProvider lp;
		try {
			// Note: this actually could return an existing locationProvider that is already
			// try to get a location ...
			lp = (LocationProvider)LocationProvider.getInstance(null);
		} catch (LocationException e) {
			this.gpsAvailable = false;
			return null;
		}
		return lp;
	}
	
	/**
	 * Gets a string to key the location provider on in a hash.
	 * @param action
	 * @param po
	 * @return
	 */
	public String getKey(String action, PositionOptions po) {
		return action + "-" + String.valueOf(po.maxAge) + "-" + String.valueOf(po.timeout) + "-" + 
			String.valueOf(po.enableHighAccuracy) + "-" + String.valueOf(po.distance) + "-" + String.valueOf(po.interval);
	}
	
	/**
	 * Creates a location listener and setups up a callback id hash for that listener.
	 * @param callbackId
	 * @param action
	 * @param po
	 * @return
	 */
	public CommandResult watchPosition(String callbackId, String action, PositionOptions po) {

		String key = getKey(action, po);

		if (!locationProviders.containsKey(key)) {
			// If there is no LocationProvider with the specified key then create a new one
			LocationProvider lp = getLocationProvider();
			if (lp == null) {
				return new CommandResult(GeolocationStatus.GPS_NOT_AVAILABLE);
			}
			try {
				lp.setLocationListener(new GeolocationListener(this, key), 5, -1, -1);
			} catch (IllegalArgumentException e) {
				// if 	interval < -1, or 
				// if 	(interval != -1) and 
				//		(timeout > interval or maxAge > interval or 
				//			(timeout < 1 and timeout != -1) or 
				//			(maxAge < 1 and maxAge != -1)
				//		) 
				return new CommandResult(GeolocationStatus.GPS_ILLEGAL_ARGUMENT_EXCEPTION);
			}

			Vector callbacks = new Vector();
			callbacks.addElement(callbackId);
			Hashtable h = new Hashtable();
			h.put(LOCATION_PROVIDER_KEY, lp);
			h.put(CALLBACKS_KEY, callbacks);
			this.locationProviders.put(key, h);
			this.callbackIdKeyMap.put(callbackId, key);
		} else {
			Hashtable h = (Hashtable)locationProviders.get(key);
			Vector callbacks = (Vector)h.get(CALLBACKS_KEY);
			callbacks.addElement(callbackId);
			h.put(CALLBACKS_KEY, callbacks);
		}
		return null;
	}

	/**
	 * Shuts down all location listeners and clears the hashes
	 * @return
	 */
	public CommandResult shutdown() {
		// TODO: This stuff should be synchronized I think since we are multi-threaded at this point...
		this.callbackIdKeyMap.clear();
		for (Enumeration keys = this.locationProviders.keys() ; keys.hasMoreElements() ;) {
			String k = (String)keys.nextElement();
			shutdownByKey(k);
		}
		this.locationProviders.clear();
		return null;
	}
	
	public void shutdownByKey(String key) {
		Hashtable h = (Hashtable)this.locationProviders.get(key);
		LocationProvider lp = (LocationProvider)h.get(LOCATION_PROVIDER_KEY);
		lp.setLocationListener(null, 0, 0, 0);
		lp.reset();
		h.clear();
	}
	
	/**
	 * Clears the watch for the provided callback id.
	 * If no more watches exist for the location provider it is shut down.
	 * @param callbackId
	 * @return
	 */
	public CommandResult clearWatch(String callbackId) {
		// This will find the key that is associated with the callback id
		// It will then remove the callback id from the key
		// If there are no more callback id's it will shut down the location listener
		String key;

		if (this.callbackIdKeyMap.containsKey(callbackId)) {
			key = (String)this.callbackIdKeyMap.get(callbackId);
			Hashtable h = (Hashtable)this.locationProviders.get(key);
			Vector callbackIds = (Vector)h.get(CALLBACKS_KEY);
			// Remove the callback from the callbacks list
			int size = callbackIds.size();
			for (int i=0; i<size; i++) {
				if (((String)callbackIds.elementAt(i)).equals(callbackId)) {
					callbackIds.removeElementAt(i);
				}
			}
			// If we have no more callbacks then shut down the LocationProvider
			if (callbackIds.size() == 0) {
				LocationProvider lp = (LocationProvider)this.locationProviders.get(LOCATION_PROVIDER_KEY);
				lp.setLocationListener(null, 0, 0, 0);
				this.locationProviders.remove(key);
			} else {
				h.put(CALLBACKS_KEY, callbackIds);
			}
		}
		return new CommandResult(GeolocationStatus.OK);
	}
	
	/**
	 * Returns a CommandResult with status OK and a JSON object representing the coords
	 * @param action
	 * @param po
	 * @return
	 */
	public CommandResult getCurrentPosition(String action, PositionOptions po) {
		// This may come from another app on the device that has already requested a location
		Location location = LocationProvider.getLastKnownLocation();
		PhoneGapExtension.Log(String.valueOf(location.getQualifiedCoordinates().getLatitude()));
		if (!isLocationValid(location) || !isLocationFresh(po, location) || !isLocationAccurate(po, location)) {

			// high accuracy
			//Location.MTA_UNASSISTED | Location.MTE_SATELLITE | Location.MTY_TERMINALBASED;

			LocationProvider lp = getLocationProvider();
			try {
				PhoneGapExtension.Log("foo");
				location = lp.getLocation(po.timeout);
			} catch(LocationException e) {
				PhoneGapExtension.Log("bar");
				lp.reset();
				return new CommandResult(GeolocationStatus.GPS_TIMEOUT);
			} catch (InterruptedException e) {
				PhoneGapExtension.Log("baz");
				lp.reset();
				return new CommandResult(GeolocationStatus.GPS_INTERUPTED_EXCEPTION);
			}
			PhoneGapExtension.Log("foobarbaz");
		}
		
		// now convert the location to a JSON object and return it in the CommandResult
		JSONObject position = null;
		try {
			position = Position.fromLocation(location).toJSONObject();
		} catch (JSONException e) {
			return new CommandResult(GeolocationStatus.JSON_EXCEPTION, "Converting the location to a JSON object failed");
		}
		return new CommandResult(GeolocationStatus.OK, position);
	}
	
	private int getCommand(String action) {
		if ("watchPosition".equals(action)) return WATCH_ACTION;
		if ("clearWatch".equals(action)) return CLEAR_WATCH_ACTION;
		if ("getCurrentPosition".equals(action)) return GET_POSITION_ACTION;
		return -1;
	}
	
	/**
	 * Calls the callback with a valid location.
	 * @param key
	 * @param location
	 */
	protected void updateLocation(String key, Location location) {
		lastPosition = Position.fromLocation(location);
		try {
			JSONObject o = lastPosition.toJSONObject();
		} catch (JSONException e) {
			// TODO: throw a proper error
			e.printStackTrace();
		}
		Vector callbacks = (Vector)((Hashtable)(this.locationProviders.get(key))).get(CALLBACKS_KEY);
		int size = callbacks.size();
		for (int i=0; i<size; i++) {
			this.app.executeScript(new CommandResult(GeolocationStatus.OK).toSuccessCallbackString((String)callbacks.elementAt(i)), null);
		}
	}

	protected void updateLocationError(String key, CommandResult result) {
		Vector callbacks = (Vector)((Hashtable)(this.locationProviders.get(key))).get(CALLBACKS_KEY);
		int size = callbacks.size();
		for (int i=0; i<size; i++) {
			this.app.executeScript(result.toErrorCallbackString((String)callbacks.elementAt(i)), null);
		}
		this.shutdownByKey(key);
		if (result.getStatus() == GeolocationStatus.GPS_TEMPORARILY_UNAVAILABLE.ordinal()) {
			//Timer t = new Timer();
			//t.schedule(task, delay);
		}
	}
}
