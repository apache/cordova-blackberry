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

public class Accelerometer extends Plugin implements AccelerometerListener {

    private static final String ACTION_GET_ACCELERATION = "getAcceleration";
    private static final String ACTION_SET_TIMEOUT = "setTimeout";
    private static final String ACTION_GET_TIMEOUT = "getTimeout";
    private static final String ACTION_STOP = "stop";

    private static final int STOPPED = 0;
    private static final int RUNNING = 2;
    private static final int ERROR_FAILED_TO_START = 3;

    // BlackBerry uses a value of 1000 (AccelerometerSensor.G_FORCE_VALUE) to
    // represent g force constant. Spec uses m/s^2. This constant is used
    // to normalize BlackBerry values to the spec.
    private static final short G_FORCE_NORMALIZE = 981;

    // the single channel to the device sensor
    private static AccelerometerSensor.Channel _rawDataChannel = null;

    private int status = STOPPED; // status of this listener
    private float timeout = 30000; // timeout in msec to close sensor channel
    private long lastAccessTime; // last time accel data was retrieved

    public PluginResult execute(String action, JSONArray args, String calbackId) {

        PluginResult result = null;

        if (!AccelerometerSensor.isSupported()) {
            result = new PluginResult(
                    PluginResult.Status.ILLEGAL_ACCESS_EXCEPTION,
                    "Accelerometer sensor not supported");
        } else if (ACTION_GET_ACCELERATION.equals(action)) {
            AccelerometerData accelData = getCurrentAcceleration();
            if (accelData == null) {
                return new PluginResult(PluginResult.Status.IO_EXCEPTION,
                        ERROR_FAILED_TO_START);
            }

            JSONObject accel = new JSONObject();
            try {
                accel.put("x", normalize(accelData.getLastXAcceleration()));
                accel.put("y", normalize(accelData.getLastYAcceleration()));
                accel.put("z", normalize(accelData.getLastZAcceleration()));
                accel.put("timestamp", accelData.getLastTimestamp());
            } catch (JSONException e) {
                return new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                        "JSONException:" + e.getMessage());
            }
            result = new PluginResult(PluginResult.Status.OK, accel);
        } else if (ACTION_GET_TIMEOUT.equals(action)) {
            float f = getTimeout();
            return new PluginResult(PluginResult.Status.OK, Float.toString(f));
        } else if (ACTION_SET_TIMEOUT.equals(action)) {
            try {
                float t = Float.parseFloat(args.getString(0));
                setTimeout(t);
                return new PluginResult(PluginResult.Status.OK, status);
            } catch (NumberFormatException e) {
                return new PluginResult(PluginResult.Status.ERROR,
                        e.getMessage());
            } catch (JSONException e) {
                return new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                        e.getMessage());
            }
        } else if (ACTION_STOP.equals(action)) {
            stop();
            return new PluginResult(PluginResult.Status.OK, STOPPED);
        } else {
            result = new PluginResult(PluginResult.Status.INVALID_ACTION,
                    "Accelerometer: Invalid action:" + action);
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
        return true;
    }

    /**
     * Set the timeout to turn off accelerometer sensor.
     *
     * @param timeout
     *            Timeout in msec.
     */
    private void setTimeout(float timeout) {
        this.timeout = timeout;
    }

    /**
     * Get the timeout to turn off accelerometer sensor.
     *
     * @return timeout in msec
     */
    private float getTimeout() {
        return timeout;
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
     * Returns last acceleration data from the accelerometer sensor.
     *
     * @return AccelerometerData with last acceleration data
     */
    private AccelerometerData getCurrentAcceleration() {
        AccelerometerData accelData;

        if (status != RUNNING) {
            accelData = start();
        }
        else {
            // get the last acceleration
            accelData = getChannel().getAccelerometerData();
        }

        // remember the access time (for timeout purposes)
        lastAccessTime = System.currentTimeMillis();

        return accelData;
    }

    /**
     * Implements the AccelerometerListener method. We listen for the purpose of
     * closing the application's accelerometer sensor channel after timeout has
     * been exceeded.
     */
    public void onData(AccelerometerData accelData) {
        // time that accel event was received
        long timestamp = accelData.getLastTimestamp();

        // If values haven't been read for length of timeout,
        // turn off accelerometer sensor to save power
        if ((timestamp - lastAccessTime) > timeout) {
            Logger.log("stopping due to timeout, status = " + status);
            stop();
        }
    }

    /**
     * Adds this listener to sensor channel.
     */
    private AccelerometerData start() {
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
            return null;
        }

        status = RUNNING;

        return accelData;
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

        status = STOPPED;
    }

    /**
     * Called when Plugin is destroyed.
     */
    public void onDestroy() {
        stop();
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
}
