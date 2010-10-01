/**
 * The MIT License
 * -------------------------------------------------------------
 * Copyright (c) 2008, Rob Ellis, Brock Whitten, Brian Leroux, Joe Bowser, Dave Johnson, Nitobi
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package com.phonegap.geolocation;

import javax.microedition.location.Location;
import javax.microedition.location.LocationException;
import javax.microedition.location.LocationListener;
import javax.microedition.location.LocationProvider;

import org.json.me.JSONArray;

import net.rim.blackberry.api.invoke.Invoke;
import net.rim.blackberry.api.invoke.MapsArguments;
import net.rim.device.api.script.ScriptEngine;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.Command;
import com.phonegap.api.CommandResult;

/**
 * Wraps all GPS functions.
 *
 * @author Jose Noheda
 *
 */
public class GeoLocationCommand2 implements Command {

	private static final int MAP_COMMAND = 0;
	private static final int STOP_COMMAND = 1;
	private static final int START_COMMAND = 2;
	private static final int CAPTURE_INTERVAL = 5;
	private static final String CODE = "PhoneGap=location";
	private static final String GEO_NS = "navigator.geolocation.";
	private static final String GEO_STOP = GEO_NS + "started = false;" + GEO_NS + "lastPosition = null;";
	private static final String GEO_START = GEO_NS + "started = true;";
	private static final String GEO_SET_LOCATION = GEO_NS + "setLocation(";
	private static final String GEO_SET_ERROR = GEO_NS + "setError(";
	private static final String FUNC_SUF = ");";
	
	private static final String ERROR_UNAVAILABLE = "'GPS unavailable on this device.'";
	private static final String ERROR_OUTOFSERVICE = "'GPS is out of service on this device.'";
	
	private Position position;
	private boolean availableGPS = true;
	private LocationProvider locationProvider;
	private ScriptEngine app;

	public GeoLocationCommand2() {
		try {
			locationProvider = LocationProvider.getInstance(null);
			// Passing null as the parameter is equal to passing a Criteria that has all fields set to the default values, 
			// i.e. the least restrictive set of criteria.
		} catch (LocationException e) {
			availableGPS = false;
			locationProvider = null;
		}
	}

	/**
	 * Determines whether the specified instruction is accepted by the command. 
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return true if the Command accepts the instruction, false otherwise.
	 */
	public boolean accept(String instruction) {
		return instruction != null && instruction.startsWith(CODE);
	}
	
	/**
	 * Deletes the last valid obtained position.
	 */
	public void clearPosition() {
		position = null;
	}

	/**
	 * Executes the following sub-commands:
	 *   START: Initializes the internal GPS module
	 *   STOP:  Stops GPS module (saving battery life)
	 *   CHECK: Reads latest position available
	 *   MAP:   Invokes the internal MAP application
	 */
	public CommandResult execute(String action, String callbackId,
			JSONArray args) {
		if (!availableGPS) return new CommandResult(GeolocationStatus.GPS_NOT_AVAILABLE);
		switch (getCommand(action)) {
			case MAP_COMMAND:	if (position != null) Invoke.invokeApplication(Invoke.APP_TYPE_MAPS, new MapsArguments(MapsArguments.ARG_LOCATION_DOCUMENT, getLocationDocument()));
								break;
			case STOP_COMMAND:  clearPosition();
								locationProvider.setLocationListener(null, 0, 0, 0);
								return null;
			case START_COMMAND: locationProvider.setLocationListener(new LocationListenerImpl(this), CAPTURE_INTERVAL, -1, -1);
								return null;
		}
		return null;
	}
	/**
	 * Parses the specified instruction and the parameters and determines what type of functional call is being made.
	 * @param instruction The string instruction passed from JavaScript via cookie.
	 * @return Integer representing action type.
	 */
	private int getCommand(String instruction) {
		String command = instruction.substring(instruction.lastIndexOf('/') + 1);
		if ("map".equals(command)) return MAP_COMMAND;
		if ("stop".equals(command)) return STOP_COMMAND;
		if ("start".equals(command)) return START_COMMAND;
		return -1;
	}

	private void updateLocation(double lat, double lng, float altitude, float accuracy, float alt_accuracy, float heading, float speed, long time) {
		position = new Position(lat, lng, altitude, accuracy, alt_accuracy, heading, speed, time);
		PhoneGapExtension.Log("location: " + String.valueOf(lat));
		this.app.executeScript("got location: " + String.valueOf(lat), null);
	}

	private String setError(String error) {
		return GEO_SET_ERROR + error + FUNC_SUF;
	}

	private String getLocationDocument() {
    	StringBuffer location = new StringBuffer("<location-document><location x=\"");
    	location.append(position.getLatitude()).append("\" y=\"");
    	location.append(position.getLongitude()).append("\" label=\"Here\" description=\"Unavailable\"");
    	location.append("/></location-document>");
    	return location.toString();
    }

	/**
     * Implementation of the LocationListener interface
     */
	private class LocationListenerImpl implements LocationListener {

		private GeoLocationCommand2 command;

		public LocationListenerImpl(GeoLocationCommand2 command) {
			this.command = command;
		}

		public void locationUpdated(LocationProvider provider, Location location) {
			PhoneGapExtension.Log("locationUdated");
            if (location.isValid()) {
    			PhoneGapExtension.Log("location valid");

                double latitude = location.getQualifiedCoordinates().getLatitude();
    			PhoneGapExtension.Log(String.valueOf(latitude));
                double longitude = location.getQualifiedCoordinates().getLongitude();
                float altitude = location.getQualifiedCoordinates().getAltitude();
                float accuracy = location.getQualifiedCoordinates().getHorizontalAccuracy();
                float alt_accuracy = location.getQualifiedCoordinates().getVerticalAccuracy();
                float heading = location.getCourse();
                float speed = location.getSpeed();
				long timestamp = location.getTimestamp();
                command.updateLocation(latitude, longitude, altitude, accuracy, alt_accuracy, heading, speed, timestamp);
            } else {
    			PhoneGapExtension.Log("location invalid");

            	command.clearPosition();
            }
        }

        public void providerStateChanged(LocationProvider provider, int newState) {
        	switch (newState) {
        	case LocationProvider.AVAILABLE:
        		break;
        	case LocationProvider.OUT_OF_SERVICE:
        		command.setError(ERROR_OUTOFSERVICE);
        		break;
        	case LocationProvider.TEMPORARILY_UNAVAILABLE:
        		PhoneGapExtension.Log("foo");
        		break;
        	}
        }
    }

	public void setContext(ScriptEngine app) {
		// TODO Auto-generated method stub
		this.app = app;
	}

}
