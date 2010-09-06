package com.phonegap.geolocation;

import javax.microedition.location.Location;
import javax.microedition.location.LocationListener;
import javax.microedition.location.LocationProvider;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.CommandResult;

/**
 * Implementation of the LocationListener interface
 */
public final class GeolocationListener implements LocationListener {

	private final GeolocationCommand command;
	// The hashtable lookup key to find the LocationProvider
	private final String key;

	public GeolocationListener(GeolocationCommand command, String key) {
		this.key = key;
		this.command = command;
	}

	public void locationUpdated(LocationProvider provider, Location location) {
        if (location.isValid()) {
        	PhoneGapExtension.Log(" valid location updated");
    		// If the location is valid then update the location
            command.updateLocation(this.key, location);
        } else {
        	PhoneGapExtension.Log(" invalid location updated");
        	// getting the location timed out
        	command.updateLocationError(this.key, new CommandResult(GeolocationStatus.GPS_INVALID_LOCATION));
        }
    }

    public void providerStateChanged(LocationProvider provider, int newState) {
    	switch (newState) {
	    	case LocationProvider.AVAILABLE:
	    		break;
	    	case LocationProvider.OUT_OF_SERVICE:
	    		command.updateLocationError(this.key, new CommandResult(GeolocationStatus.GPS_OUT_OF_SERVICE));
	    		break;
	    	case LocationProvider.TEMPORARILY_UNAVAILABLE:
	    		command.updateLocationError(this.key, new CommandResult(GeolocationStatus.GPS_TEMPORARILY_UNAVAILABLE));
	    		break;
    	}
    }
}