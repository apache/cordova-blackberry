package com.phonegap.geolocation;

import java.util.Vector;

import javax.microedition.location.Location;
import javax.microedition.location.LocationListener;
import javax.microedition.location.LocationProvider;

import org.json.me.JSONException;
import org.json.me.JSONObject;

import com.phonegap.PhoneGapExtension;
import com.phonegap.util.Logger;

/**
 * GeolocationListener listens for update notifications from a LocationProvider.
 * Provides location update notifications to all registered callbacks.
 */
public final class GeolocationListener implements LocationListener {

	private LocationProvider locationProvider;  // location provider the listener listens to
	private Vector callbacks;                   // callbacks that are to be notified on location updates
	
	/**
	 * Creates a new listener that attaches itself to the specified LocationProvider.
	 * @param locationProvider location provider that listener will attach to
	 */
	public GeolocationListener(LocationProvider locationProvider) {
		this.callbacks = new Vector();
		this.locationProvider = locationProvider;
		this.locationProvider.setLocationListener(this, 5, -1, -1);
	}

	/**
	 * Registers the specified callback to receive location update notifications.
	 * @param callbackId
	 */
	public void addCallback(String callbackId) {
		this.callbacks.addElement(callbackId);
	}
	
	/**
	 * Unregisters the specified callback so that it no longer receives location
	 * update notifications.
	 * @param callbackId
	 */
	public void removeCallback(String callbackId) {
		int size = this.callbacks.size();
		for (int i=0; i<size; i++) {
			if (((String)this.callbacks.elementAt(i)).equals(callbackId)) {
				callbacks.removeElementAt(i);
			}
		}
	}
	
	/**
	 * Indicates whether this listener has any registered callbacks.
	 * @return true if the listener has registered callbacks
	 */
	public boolean hasCallbacks() {
		return !this.callbacks.isEmpty();
	}
	
	public void locationUpdated(LocationProvider provider, Location location) {
 
		if (location.isValid()) {
        	Logger.log(this.getClass().getName() + ": valid location updated");
            this.updateLocation(location);
        } else {
        	Logger.log(this.getClass().getName() + ": invalid location updated");
        	// getting the location timed out
        	this.updateLocationError(GeolocationStatus.GPS_INVALID_LOCATION);
        }
    }

    public void providerStateChanged(LocationProvider provider, int newState) {
    	switch (newState) {
	    	case LocationProvider.AVAILABLE:
	            Logger.log(this.getClass().getName() + ": provider state changed to AVAILABLE");
	    		break;
	    	case LocationProvider.OUT_OF_SERVICE:
	            Logger.log(this.getClass().getName() + ": provider state changed to OUT_OF_SERVICE");
	    		this.updateLocationError(GeolocationStatus.GPS_OUT_OF_SERVICE);
	    		break;
	    	case LocationProvider.TEMPORARILY_UNAVAILABLE:
	            Logger.log(this.getClass().getName() + ": provider state changed to TEMPORARILY_UNAVAILABLE");
	    		// This is what happens when you are inside
	    		// TODO: explore possible ways to recover
	    		this.shutdown();
	    		this.updateLocationError(GeolocationStatus.GPS_TEMPORARILY_UNAVAILABLE);
	    		break;
    	}
    }

    /**
     * Shuts down the listener by resetting the location provider.
     */
	public void shutdown() {
		this.locationProvider.setLocationListener(null, 0, 0, 0);
		this.locationProvider.reset();
		this.callbacks.removeAllElements();
	}
	    
	/**
	 * Notifies callbacks of location updates.
	 * @param location updated location
	 */
	protected void updateLocation(Location location) {
		JSONObject position = null; 
		try {
			position = Position.fromLocation(location).toJSONObject();
		} catch (JSONException e) {
			// TODO: throw a proper error
			e.printStackTrace();
		}

		int size = this.callbacks.size();
		for (int i=0; i<size; i++) {
			String callbackId = (String)this.callbacks.elementAt(i);
			PhoneGapExtension.invokeSuccessCallback(callbackId, new GeolocationResult(GeolocationStatus.OK, position));
		}
	}

	/**
	 * Notifies callbacks of location errors.
	 * @param status
	 */
	protected void updateLocationError(GeolocationStatus status) {
		int size = this.callbacks.size();
		for (int i=0; i<size; i++) {
			String callbackId = (String)this.callbacks.elementAt(i);
			PhoneGapExtension.invokeErrorCallback(callbackId, new GeolocationResult(status));
		}
		this.shutdown();
	}
}