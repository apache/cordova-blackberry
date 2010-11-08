/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.file;

import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.FileNotFoundException;
import net.rim.device.api.io.IOUtilities;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.util.Logger;

public class FileManager extends Plugin {

    /**
     * File related errors.
     */
    public static int NOT_FOUND_ERR = 1;
    public static int SECURITY_ERR = 2;
    public static int ABORT_ERR = 3;
    public static int NOT_READABLE_ERR = 4;
    public static int ENCODING_ERR = 5;
    public static int NO_MODIFICATION_ALLOWED_ERR = 6;
    public static int INVALID_STATE_ERR = 7;
    public static int SYNTAX_ERR = 8;

    /**
     * Possible actions.
     */
    protected static final int ACTION_READ_AS_TEXT = 0;
    protected static final int ACTION_READ_AS_DATA_URL = 1;
    
    public PluginResult execute(String action, JSONArray args, String callbackId) {

        // get parameters
        String filePath = null;
        try {
            filePath = args.getString(0);
        } catch (JSONException e) {
            Logger.log(this.getClass().getName() + ": " + e);
            return new PluginResult(PluginResult.Status.JSONEXCEPTION, 
            "Invalid or missing file parameter");
        }
        String encoding = args.optString(1);
        
        // perform specified action
        String result = null;
        switch (getAction(action)) {
        case ACTION_READ_AS_TEXT:
            try {
                result = readAsText(filePath, encoding);
            } catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_FOUND_ERR));
            } catch (UnsupportedEncodingException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(ENCODING_ERR));
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_READABLE_ERR));            
            }
            
            return new PluginResult(PluginResult.Status.OK, result);
            
        case ACTION_READ_AS_DATA_URL:
            try {
                result = readAsDataURL(filePath);
            } catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_FOUND_ERR));
            } catch (UnsupportedEncodingException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(ENCODING_ERR));
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_READABLE_ERR));            
            }
            
            return new PluginResult(PluginResult.Status.OK, result);            
        }

        // invalid action
        return new PluginResult(PluginResult.Status.INVALIDACTION, "File: invalid action " + action);
    }
    
    /**
     * Reads a file and encodes the contents using the specified encoding.
     * @param filePath  Full path of the file to be read
     * @param encoding  Encoding to use for the file contents
     * @return String containing encoded file contents
     */
    protected String readAsText(String filePath, String encoding) throws FileNotFoundException, UnsupportedEncodingException, IOException {
        // read the file
        byte[] blob = readFile(filePath);
        
        // return encoded file contents
        Logger.log(this.getClass().getName() + ": encoding file contents using " + encoding);
        return new String(blob, encoding);
    }
    
    /**
     * Read file and return data as a base64 encoded data url.
     * A data url is of the form:
     *      data:[<mediatype>][;base64],<data>
     * @param filePath  Full path of the file to be read
     */
    protected String readAsDataURL(String filePath) throws FileNotFoundException, IOException {
        String result = null;

        // read file
        byte[] blob = readFile(filePath);
        
        // encode file contents using BASE64 encoding
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        Base64OutputStream base64OutputStream = new Base64OutputStream(byteArrayOutputStream);
        base64OutputStream.write(blob);
        base64OutputStream.flush();
        base64OutputStream.close(); 
        result = byteArrayOutputStream.toString();
 
        // put result in proper form 
        // TODO: determine media type? (not required)
        String mediaType = "";
        result = "data:" + mediaType + ";base64," + result;
        
        return result;
    }
    
    /**
     * Reads file as byte array.
     * @param filePath  
     */
    protected byte[] readFile(String filePath) throws FileNotFoundException, IOException {
        byte[] blob = null;
        FileConnection fconn = null;
        DataInputStream dis = null;
        try {
            fconn = (FileConnection)Connector.open(filePath, Connector.READ);
            if (!fconn.exists()) {
                throw new FileNotFoundException(filePath + " not found");                
            }
            dis = fconn.openDataInputStream();
            blob = IOUtilities.streamToBytes(dis);
        } finally {
            try { 
                if (dis != null) dis.close();
                if (fconn != null) fconn.close();
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        }
        return blob;
    }

    /**
     * Returns action to perform.
     * @param action 
     * @return action to perform
     */
    protected static int getAction(String action) {
        if ("readAsText".equals(action)) return ACTION_READ_AS_TEXT;
        if ("readAsDataURL".equals(action)) return ACTION_READ_AS_DATA_URL;
        return -1;
    }   
}
