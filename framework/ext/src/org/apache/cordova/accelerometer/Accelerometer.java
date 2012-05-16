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

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.json4j.JSONArray;
import org.apache.cordova.json4j.JSONException;
import org.apache.cordova.json4j.JSONObject;
import org.apache.cordova.util.Logger;

import net.rim.device.api.system.AccelerometerData;
import net.rim.device.api.system.AccelerometerListener;
import net.rim.device.api.system.AccelerometerSensor;
import net.rim.device.api.system.Application;

import java.util.Enumeration;
import java.util.Vector;
import java.util.Hashtable;

public class Accelerometer extends Plugin implements AccelerometerListener {

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

    private int status = STOPPED; // status of this listener

    private Hashtable watches = new Hashtable();
    private Vector callbacks = new Vector();

    private short x, y, z;
    private long timestamp;

    public PluginResult execute(String action, JSONArray args, String callbackId) {

        PluginResult result = null;

        try {
            if (!AccelerometerSensor.isSupported()) {
                result = new PluginResult(
                    PluginResult.Status.ILLEGAL_ACCESS_EXCEPTION,
                    "Accelerometer sensor not supported");
            } else if (ACTION_GET_ACCELERATION.equals(action)) {
                if (this.status != RUNNING) {
                    result = new PluginResult(PluginResult.Status.NO_RESULT);
                    result.setKeepCallback(true);
                    this.callbacks.addElement(callbackId);
                    this.start();
                } else {
                    result = new PluginResult(
                        PluginResult.Status.OK,
                        this.getAccelerationJSON());
                }
            } else if (ACTION_ADD_WATCH.equals(action)) {
                String watchId = args.getString(0);
                this.watches.put(watchId, callbackId);
                if (this.status != RUNNING) {
                    this.start();
                }
                result = new PluginResult(PluginResult.Status.NO_RESULT);
                result.setKeepCallback(true);
            } else if (ACTION_CLEAR_WATCH.equals(action)) {
                String watchId = args.getString(0);
                if (this.watches.containsKey(watchId)) {
                    this.watches.remove(watchId);
                    if (this.size() == 0) {
                        this.stop();
                    }
                }
                result = new PluginResult(PluginResult.Status.OK);
            } else {
                result = new PluginResult(PluginResult.Status.INVALID_ACTION,
                        "Accelerometer: Invalid action:" + action);
            }
        } catch(JSONException e) {
            result = new PluginResult(PluginResult.Status.JSON_EXCEPTION);
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
        if (action.equals("getAcceleration") && this.status == RUNNING) {
            return true;
        } else if (action.equals("addWatch") && this.status == RUNNING) {
            return true;
        } else if (action.equals("clearWatch")) {
            return true;
        }
        return false;
    }

    /**
     * Opens a raw data channel to the accelerometer sensor.
     *
     * @return the AccelerometerSensor.Channel for the application
     */
    private static AccelerometerSensor.Channel getChannel() {
        // an application can only have one open channel
        if (_rawDataChannel == null || !_rawDataChannel.isOpen()) {
            _rawDataChannel = AccelerometerSensor
                    .openRawDataChannel(Application.getApplication());
            Logger.log(Accelerometer.class.getName()
                    + ": sensor channel opened");
        }
        return _rawDataChannel;
    }

    /**
     * Implements the AccelerometerListener method.
     *
     */

    public void onData(AccelerometerData accelData) {
        if (this.status == STOPPED) return;

        this.timestamp = accelData.getLastTimestamp();
        this.x = accelData.getLastXAcceleration();
        this.y = accelData.getLastYAcceleration();
        this.z = accelData.getLastZAcceleration();

        this.win();

        if (this.size() == 0) {
            this.stop();
        }
    }

    /**
     * Adds this listener to sensor channel.
     */
    private void start() {
        // If already started or starting, return.
        if (this.status == RUNNING || this.status == STARTING) return;

        this.status = STARTING;

        // open the sensor channel and register listener
        getChannel().setAccelerometerListener(this);
        Logger.log(this.getClass().getName() + ": sensor listener added");

        // Need to wait until sensor is active. Otherwise, first query will
        // return zeros for all values. Wait up to 2 seconds.
        int waittime = 2000;
        AccelerometerData accelData = null;
        while (waittime > 0) {
            accelData = getChannel().getAccelerometerData();
            // If any value is not zero, assume sensor is active and break out.
            if (accelData.getLastXAcceleration() != 0
                    || accelData.getLastYAcceleration() != 0
                    || accelData.getLastZAcceleration() != 0) {
                break;
            }

            // Sleep and give sensor more time to warm up.
            waittime -= 100;
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        // Sensor failed to start.
        if (waittime == 0) {
            stop();
            this.status = ERROR_FAILED_TO_START;
            this.fail(this.status, "Accelerometer could not be started.");
            return;
        }

        this.status = RUNNING;
    }

    /**
     * Stops accelerometer listener and closes the sensor channel.
     */
    private void stop() {
        // close the sensor channel
        if (_rawDataChannel != null && _rawDataChannel.isOpen()) {
            _rawDataChannel.close();
            Logger.log(this.getClass().getName() + ": sensor channel closed");
        }

        this.status = STOPPED;
    }

    private void fail(int code, String message) {
        // Error object
        JSONObject errorObj = new JSONObject();
        try {
            errorObj.put("code", code);
            errorObj.put("message", message);
        } catch (JSONException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        PluginResult err = new PluginResult(PluginResult.Status.ERROR, errorObj);
    	
        for (Enumeration e = this.callbacks.elements(); e.hasMoreElements();)
        {
            this.error(err, (String)e.nextElement());
        }
        this.callbacks.removeAllElements();
        
        err.setKeepCallback(true);

        for (Enumeration e = this.watches.keys(); e.hasMoreElements();)
        {
            this.error(err, (String)this.watches.get((String)e.nextElement()));
        }
    }
    
    private void win() {
        // Success return object
        PluginResult result = new PluginResult(PluginResult.Status.OK, this.getAccelerationJSON());
        
        for (Enumeration e = this.callbacks.elements(); e.hasMoreElements();)
        {
            this.success(result, (String)e.nextElement());
        }
        this.callbacks.removeAllElements();

        result.setKeepCallback(true);
        
        for (Enumeration e = this.watches.keys(); e.hasMoreElements();)
        {
            this.success(result, (String)this.watches.get((String)e.nextElement()));
        }
    }

    /**
     * Called when Plugin is destroyed.
     */
    public void onDestroy() {
        stop();
    }

    private int size() {
        return this.watches.size() + this.callbacks.size();
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

    private JSONObject getAccelerationJSON() {
        JSONObject accel = new JSONObject();
        try {
            accel.put("x", normalize(this.x));
            accel.put("y", normalize(this.y));
            accel.put("z", normalize(this.z));
            accel.put("timestamp", this.timestamp);
        } catch (JSONException e) {
        }
        return accel;
    }
}
