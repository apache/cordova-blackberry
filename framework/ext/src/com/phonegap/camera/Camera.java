package com.phonegap.camera;

import net.rim.device.api.script.ScriptEngine;

import org.json.me.JSONArray;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

/**
 * The Camera command interface.
 *
 * The Camera class can invoke the following actions:
 *
 *   - getPicture: takes photo and returns base64 encoded image
 *   - getPictureURI: takes photo and returns image URI
 *   
 *   future?
 *   - getVideoClip...
 *
 */
public class Camera implements Plugin 
{
	private ScriptEngine app;
	
	public static final String ACTION_TAKE_PICTURE = "takePicture";

	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public PluginResult execute(String action, String callbackId, JSONArray args) 
	{
		PluginResult result = null;
		
		if (action != null && action.equals(ACTION_TAKE_PICTURE)) 
		{			
			result = new CapturePhotoAction(callbackId).execute(args);
		}
		else 
		{
			result = new PluginResult(PluginResult.Status.INVALIDACTION, "Camera: Invalid action:" + action);
		}
		
		return result;
	}

	/**
	 * Sets the script engine to allow plugins to interact with and 
	 * execute browser scripts. 
	 *  
	 * @param app The script engine of the widget application.
	 */
	public void setContext(ScriptEngine app) 
	{
		this.app = app;
	}
	
	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
		return false;
	}
}
