package com.phonegap.camera;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.blackberry.api.invoke.CameraArguments;
import net.rim.blackberry.api.invoke.Invoke;
import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.file.FileSystemJournal;
import net.rim.device.api.io.file.FileSystemJournalEntry;
import net.rim.device.api.io.file.FileSystemJournalListener;
import net.rim.device.api.system.Characters;
import net.rim.device.api.system.EventInjector;
import net.rim.device.api.ui.UiApplication;

import org.json.me.JSONArray;
import org.json.me.JSONObject;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.PluginResult;

public class CapturePhotoAction implements FileSystemJournalListener
{
	private static final int DATA_URL = 0;
	private static final int FILE_URI = 1;
	
	private long lastUSN = 0;
	private String callbackId;
	private int destinationType = DATA_URL;

	public CapturePhotoAction(String callbackId)
	{
		this.callbackId = callbackId;
	}
	
	/**
	 * Capture a photo using device camera.  The camera is invoked using native APIs.
	 * The photo is captured by listening to file system changes, and sent back by 
	 * invoking the appropriate JS callback.
	 *
	 * @param args JSONArray formatted as [ cameraArgs ]
	 *        cameraArgs:      
	 * @return A CommandResult object with the INPROGRESS state for taking a photo.
	 */
	public PluginResult execute(JSONArray args) 
	{
		// get the camera options, if supplied
		JSONObject options = args.optJSONObject(0);
		if (options != null)
		{
			// determine the desired destination type: data or file URI
			this.destinationType = 
				(options.optInt("destinationType") == FILE_URI) ? FILE_URI : DATA_URL;
		}
		
		// MMAPI interface doesn't use the native Camera application or interface
		// (we would have to replicate it).  So, we invoke the native Camera application,
		// which doesn't allow us to set any options.
		synchronized(UiApplication.getEventLock()) {
			UiApplication.getUiApplication().addFileSystemJournalListener(this);
			Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA, new CameraArguments());
		}
		
		// We don't want to use an OK status here.  Currently, CommandManagerFunction 
		// will invoke the success callback if OK status is received, but at this point, 
		// we have no image. We invoked the Camera application, which runs in a separate
		// process, and must now wait for the listener to receive the user's input. 
		return new PluginResult(PluginResult.Status.INPROGRESS, "");
	}

	/**
	 * Listens for file system changes.  When a JPEG file is added, we process 
	 * it and send it back.
	 */
	public void fileJournalChanged() 
	{
		// next sequence number file system will use
		long USN = FileSystemJournal.getNextUSN();
		
		for (long i = USN - 1; i >= lastUSN && i < USN; --i)
		{
			FileSystemJournalEntry entry = FileSystemJournal.getEntry(i);
			if (entry == null)
			{
				break;
			}
			
			if (entry.getEvent() == FileSystemJournalEntry.FILE_ADDED)
			{
				String path = entry.getPath();
				if (path != null && path.indexOf(".jpg") != -1)
				{					
					// we found a new JPEG, process it
					PluginResult result = processImage("file://" + path);
					
					// clean up
					closeCamera();

					// invoke the appropriate callback
					if (result.getStatus() == PluginResult.Status.OK.ordinal())
					{
						PhoneGapExtension.invokeSuccessCallback(callbackId, result);
					}
					else 
					{
						PhoneGapExtension.invokeErrorCallback(callbackId, result);
					}
					
					break;
				}
			}
		}
		
		// remember the file journal change number, 
		// so we don't search the same events again and again
		lastUSN = USN;
	}
	
	/**
	 * Returns either the image URI or the image itself encoded as a Base64 string.
	 */
	private PluginResult processImage(String photoPath)
	{
		String resultData;
		
		if (this.destinationType == FILE_URI) 
		{
			// just return the photo URI
			resultData = photoPath;
		}
		else 
		{
			// encode the image as base64 string
			try 
			{
				resultData = encodeImage(photoPath);
			}
			catch (Exception e)
			{
				return new PluginResult(PluginResult.Status.IOEXCEPTION, e.toString());
			}
		}

		return new PluginResult(PluginResult.Status.OK, resultData);
	}
	
	/**
	 * Opens the photo at a given URI and converts it to a Base64-encoded string.
	 * @param photoPath - file URI
	 * @return Base64-encoded String of image at file URI
	 */
	private String encodeImage(String photoPath) throws IOException
	{
		String imageData = null;
		
		// open the image file
		FileConnection fconn = (FileConnection)Connector.open(photoPath);
		try 
		{
			if (fconn.exists()) 
			{
				// read the image data
				// sleep to ensure file is no longer being written to
				try {
				  Thread.sleep(100);
				} catch (InterruptedException e) {
				}

				InputStream imageStream = fconn.openInputStream();
				byte[] rawImage = new byte[(int) fconn.fileSize()];
				imageStream.read(rawImage);

				// encode using base64
				ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream(rawImage.length);
				Base64OutputStream base64OutputStream = new Base64OutputStream(byteArrayOutputStream);
				base64OutputStream.write(rawImage);
				base64OutputStream.flush();
				byteArrayOutputStream.flush();
				imageData = byteArrayOutputStream.toString();
				imageStream.close();
				base64OutputStream.close();
				byteArrayOutputStream.close();	
			}
		}
		finally 
		{
			fconn.close();
		}
		
		return imageData;
	}
	
	/**
	 * Closes the native camera application. 
	 */
	private void closeCamera() 
	{
		// cleanup - remove file system listener
		UiApplication.getUiApplication().removeFileSystemJournalListener(this);

		// simulate two escape characters to exit camera application
		// no, there is no other way to do this
		EventInjector.KeyEvent inject = new EventInjector.KeyEvent(
				EventInjector.KeyEvent.KEY_DOWN, Characters.ESCAPE, 0);
		inject.post();
		inject.post();
	}
}
