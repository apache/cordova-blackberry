package com.phonegap.camera;

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
public class Camera extends Plugin 
{
	public static final String ACTION_TAKE_PICTURE = "takePicture";

	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public PluginResult execute(String action, JSONArray args, String callbackId) 
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
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
		return false;
	}
}
