/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.apache.cordova.accelerometer;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import net.rim.device.api.system.AccelerometerData;
import net.rim.device.api.system.AccelerometerListener;
import net.rim.device.api.system.AccelerometerSensor;
import net.rim.device.api.system.Application;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.json4j.JSONArray;
import org.apache.cordova.json4j.JSONException;
import org.apache.cordova.json4j.JSONObject;
import org.apache.cordova.util.Logger;

public class Accelerometer extends Plugin implements AccelerometerListener {
    private static final String LOG_TAG = "Accelerometer: ";

    private static final String ACTION_GET_ACCELERATION = "getAcceleration";
    private static final String ACTION_ADD_WATCH = "addWatch";
    private static final String ACTION_CLEAR_WATCH = "clearWatch";

    private static final int STOPPED = 0;
    private static final int STARTING = 1;
    private static final int RUNNING = 2;
    private static final int ERROR_FAILED_TO_START = 3;

    // BlackBerry uses a value of 1000 (AccelerometerSensor.G_FORCE_VALUE) to
    // represent g force constant. Spec uses m/s^2. This constant is used
    // to normalize BlackBerry values to the spec.
    private static final short G_FORCE_NORMALIZE = 981;

    // the single channel to the device sensor
    private static AccelerometerSensor.Channel _rawDataChannel = null;

    private int state = STOPPED; // state of this listener
    private long initTime = 0;

    /**
     * Hash of all the listeners created, keyed on callback ids.
     */
    private final Vector callbackIds = new Vector();
    private final Hashtable watchIds = new Hashtable();

    public PluginResult execute(String action, JSONArray args, String callbackId) {
        PluginResult result;
        try {
            if (!AccelerometerSensor.isSupported()) {
                result = new PluginResult(
                        PluginResult.Status.ILLEGAL_ACCESS_EXCEPTION,
                        "Accelerometer sensor not supported");
            } else if (ACTION_GET_ACCELERATION.equals(action)) {
                result = getAcceleration(callbackId);
            } else if (ACTION_ADD_WATCH.equals(action)) {
                String watchId = args.getString(0);
                result = addWatch(watchId, callbackId);
            } else if (ACTION_CLEAR_WATCH.equals(action)) {
                String watchId = args.getString(0);
                result = clearWatch(watchId);
            } else {
                result = new PluginResult(PluginResult.Status.INVALID_ACTION,
                        "Accelerometer: Invalid action:" + action);
            }
        } catch (JSONException e) {
            result = new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                    e.getMessage());
        }

        return result;
    }

    /**
     * Identifies if action to be executed returns a value and should be run
     * synchronously.
     *
     * @param action
     *            The action to execute
     * @return T=returns value
     */
    public boolean isSynch(String action) {
        if (ACTION_GET_ACCELERATION.equals(action) && state == RUNNING) {
            return true;
        } else if (ACTION_ADD_WATCH.equals(action) && state == RUNNING) {
            return true;
        } else if (ACTION_CLEAR_WATCH.equals(action)) {
            return true;
        }
        return false;
    }

    /**
     * Implements the AccelerometerListener method. We listen for the purpose of
     * closing the application's accelerometer sensor channel after timeout has
     * been exceeded.
     */
    public void onData(AccelerometerData accelData) {
        short x = accelData.getLastXAcceleration();
        short y = accelData.getLastYAcceleration();
        short z = accelData.getLastZAcceleration();

        // If any value is not zero, assume sensor is now active and set state.
        if (state == STARTING && (x != 0 || y != 0 || z != 0)) {
            state = RUNNING;
        }

        if (state == RUNNING) {
            // Send the new accelerometer data.
            JSONObject accel = new JSONObject();
            try {
                accel.put("x", normalize(x));
                accel.put("y", normalize(y));
                accel.put("z", normalize(z));
                accel.put("timestamp", accelData.getLastTimestamp());
                sendResult(true,
                        new PluginResult(PluginResult.Status.OK, accel), true);
            } catch (JSONException e) {
                sendResult(false, new PluginResult(
                        PluginResult.Status.JSON_EXCEPTION, "JSONException:"
                                + e.getMessage()), false);
            }
        } else if ((System.currentTimeMillis() - initTime) > 2000) {
            // If the sensor does not become active within 2 seconds of
            // the request to start it, fail out.
            stop();
            state = ERROR_FAILED_TO_START;
            JSONObject errorObj = new JSONObject();
            try {
                errorObj.put("code", ERROR_FAILED_TO_START);
                errorObj.put("message", "Accelerometer could not be started.");
            } catch (JSONException e) {
                Logger.log(LOG_TAG
                        + "Failed to build JSON object for ERROR_FAILED_TO_START.");
            }
            sendResult(false, new PluginResult(PluginResult.Status.ERROR,
                    errorObj), false);
        }
    }

    /**
     * Called when Plugin is destroyed.
     */
    public void onDestroy() {
        // Close out the call back IDs and stop.
        sendResult(true, new PluginResult(PluginResult.Status.NO_RESULT), false);
    }

    /**
     * Adds a SystemListener to listen for changes to the battery state. The
     * listener is only registered if one has not already been added.
     */
    private int addListener() {
        if (_rawDataChannel == null || !_rawDataChannel.isOpen()) {
            _rawDataChannel = AccelerometerSensor
                    .openRawDataChannel(Application.getApplication());
            Logger.log(LOG_TAG + "sensor channel opened");

            initTime = System.currentTimeMillis();
            state = STARTING;
            _rawDataChannel.setAccelerometerListener(this);
            Logger.log(LOG_TAG + "sensor listener added");
        }

        return state;
    }

    /**
     * Track the specified watch ID and start the accelerometer channel if it
     * hasn't been started.
     *
     * @param watchId
     * @param callbackId
     * @return
     */
    private synchronized PluginResult addWatch(String watchId, String callbackId) {
        watchIds.put(watchId, callbackId);
        addListener();
        PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT,
                "");
        result.setKeepCallback(true);

        return result;
    }

    /**
     * Removes the specified watch ID and stops the accelerometer channel if
     * this it was the last active listener.
     *
     * @param watchId
     * @return
     */
    private synchronized PluginResult clearWatch(String watchId) {
        if (watchIds.containsKey(watchId)) {
            watchIds.remove(watchId);
            if (watchIds.size() == 0 && callbackIds.size() == 0) {
                stop();
            }
        }
        return new PluginResult(PluginResult.Status.OK, "");
    }

    /**
     * If the sensor is active, return the last acquired accelerometer data,
     * otherwise start the sensor and listen for data.
     *
     * @return AccelerometerData with last acceleration data
     */
    private synchronized PluginResult getAcceleration(String callbackId) {
        PluginResult result;

        if (state != RUNNING) {
            callbackIds.addElement(callbackId);
            addListener();
            result = new PluginResult(PluginResult.Status.NO_RESULT, "");
            result.setKeepCallback(true);
        } else {
            // get the last acceleration
            AccelerometerData accelData = _rawDataChannel
                    .getAccelerometerData();
            JSONObject accel = new JSONObject();
            try {
                accel.put("x", normalize(accelData.getLastXAcceleration()));
                accel.put("y", normalize(accelData.getLastYAcceleration()));
                accel.put("z", normalize(accelData.getLastZAcceleration()));
                accel.put("timestamp", accelData.getLastTimestamp());
                result = new PluginResult(PluginResult.Status.OK, accel);
            } catch (JSONException e) {
                result = new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                        "JSONException:" + e.getMessage());
            }
        }

        return result;
    }

    /**
     * Normalize the range of values returned by BlackBerry to the agreed upon
     * cross platform range.
     *
     * @param value
     * @return normalized value
     */
    private double normalize(short value) {
        // Integer multiplication is less troublesome then floating point.
        StringBuffer buf = new StringBuffer(String.valueOf(value
                * G_FORCE_NORMALIZE));

        // Manipulate the string to properly insert zeros and decimal point so
        // something like -708910 becomes -7.08910 and 764 becomes .00764.
        // Due to the values returned by BlackBerry there will always be 5
        // decimal precision in the normalized value.
        int idx = buf.charAt(0) == '-' ? 1 : 0;
        while (buf.length() < (5 + idx)) {
            buf.insert(idx, '0');
        }
        buf.insert(buf.length() - 5, '.');

        return Double.parseDouble(buf.toString());
    }

    /**
     * Helper function to send a PluginResult to the saved call back IDs.
     *
     * @param issuccess
     *            true if this is a successful result, false otherwise.
     * @param result
     *            the PluginResult to return
     * @param keepCallback
     *            Boolean value indicating whether to keep the call back id
     *            active.
     */
    private synchronized void sendResult(boolean issuccess,
            PluginResult result, boolean keepCallback) {

        if (result != null) {
            // Must keep the call back active for future watch events.
            result.setKeepCallback(keepCallback);

            // Iterate through the saved watch IDs.
            for (Enumeration watches = watchIds.elements(); watches
                    .hasMoreElements();) {
                if (issuccess) {
                    success(result, (String) watches.nextElement());
                } else {
                    error(result, (String) watches.nextElement());
                }
            }

            // callbackIds are from getAcceleration() requests so they are
            // one time and should not keep callback.
            result.setKeepCallback(false);

            // Iterate through the saved call back IDs.
            for (Enumeration callbacks = callbackIds.elements(); callbacks
                    .hasMoreElements();) {
                if (issuccess) {
                    success(result, (String) callbacks.nextElement());
                } else {
                    error(result, (String) callbacks.nextElement());
                }
            }
        }

        if (!keepCallback) {
            watchIds.clear();
        }
        callbackIds.removeAllElements();

        if (watchIds.size() == 0) {
            stop();
        }
    }

    /**
     * Stops accelerometer listener and closes the sensor channel.
     */
    private synchronized void stop() {
        if (_rawDataChannel != null && _rawDataChannel.isOpen()) {

            // Remove the battery listener.
            _rawDataChannel.removeAccelerometerListener();
            _rawDataChannel.close();
            _rawDataChannel = null;

            Logger.log(LOG_TAG + "sensor channel closed");
        }

        state = STOPPED;
    }
}
