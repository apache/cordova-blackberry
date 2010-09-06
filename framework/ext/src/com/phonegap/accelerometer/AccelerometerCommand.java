package com.phonegap.accelerometer;

import net.rim.device.api.script.ScriptEngine;

import org.json.me.JSONArray;

import com.phonegap.api.Command;
import com.phonegap.api.CommandResult;

public class AccelerometerCommand implements Command {

	private ScriptEngine app;
	
	public CommandResult execute(String action, String callbackId, JSONArray args) {
		// TODO Auto-generated method stub

		/*
 private Channel orientationChannel;

 public void register()
 {
     // open channel
     orientationChannel = AccelerometerSensor.openOrientationDataChannel( Application.getApplication() );
     orientationChannel.setAccelerometerListener( this );
 }

 public void onData( AccelerometerData accData )
 {
     // get the new orientation
     int newOrientation = accData.getOrientation();
     // relayout accordingly
     relayout( newOrientation );
 }

 public void unregister()
 {
     // close the channel to save power
     orientationChannel.close();
 }
		 */
		
		return null;
	}

	public void setContext(ScriptEngine app) {
		this.app = app;
	}

}
