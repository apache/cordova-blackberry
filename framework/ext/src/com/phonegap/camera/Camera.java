package com.phonegap.camera;

import net.rim.device.api.script.ScriptEngine;

import org.json.me.JSONArray;

import com.phonegap.api.Command;
import com.phonegap.api.CommandResult;

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
public class Camera implements Command 
{
	private ScriptEngine app;
	
	public static final String ACTION_GET_PICTURE = "getPicture";

	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public CommandResult execute(String action, String callbackId, JSONArray args) 
	{
		CommandResult result = null;
		
		if (action != null && action.equals(ACTION_GET_PICTURE)) 
		{			
			result = new CapturePhotoAction(callbackId).execute(args);
		}
		else 
		{
			result = new CommandResult(CommandResult.Status.INVALIDACTION,
				"{ message: 'InvalidActionException', status: "+CommandResult.Status.INVALIDACTION.ordinal()+" }");
		}
		
		return result;
	}

	/**
	 * Sets the context of the Command. This can then be used to do things like
	 * create a UiApplication screen to capture images and video.
	 * 
	 * @param app The context of the main UiApplication.
	 */
	public void setContext(ScriptEngine app) 
	{
		this.app = app;
	}	
}
