package com.phonegap.geolocation;

import com.phonegap.api.CommandStatus;

public class GeolocationStatus extends CommandStatus {
	public GeolocationStatus(int val, String message) {
		super(val, message);
	}

	public static final GeolocationStatus GPS_NOT_AVAILABLE = new GeolocationStatus(1, "GPS not available");
	public static final GeolocationStatus GPS_OUT_OF_SERVICE = new GeolocationStatus(2, "GPS out of service");
	public static final GeolocationStatus GPS_TEMPORARILY_UNAVAILABLE = new GeolocationStatus(3, "GPS temporarily not available");
	public static final GeolocationStatus GPS_TIMEOUT = new GeolocationStatus(4, "GPS location acquisition timeout");
	public static final GeolocationStatus GPS_INTERUPTED_EXCEPTION = new GeolocationStatus(5, "GPS location acquisition was interupted");
	public static final GeolocationStatus GPS_INVALID_LOCATION = new GeolocationStatus(6, "GPS returned an invalid location");
	public static final GeolocationStatus GPS_ILLEGAL_ARGUMENT_EXCEPTION = new GeolocationStatus(7, "An illegal argument was passed to the location listener");
}
