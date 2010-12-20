/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.http;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import javax.microedition.io.file.FileConnection;

import net.rim.device.api.io.FileNotFoundException;
import net.rim.device.api.io.IOUtilities;
import net.rim.device.api.io.MIMETypeAssociations;
import net.rim.device.api.io.http.HttpProtocolConstants;
import net.rim.device.api.ui.UiApplication;

import org.json.me.JSONArray;
import org.json.me.JSONException;
import org.json.me.JSONObject;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.util.Logger;

/**
 * The FileUploader plugin uses an HTTP multipart request to upload files on the
 * device to a remote server.  It currently supports a single file per HTTP 
 * request.
 */
public class FileUploader extends Plugin {

    /**
     * Error codes
     */
    public static int FILE_NOT_FOUND_ERR = 1;
    public static int INVALID_URL_ERR = 2;
    public static int CONNECTION_ERR = 3;
    
    /**
     * Constants
     */
    private static final String BOUNDARY = "----0x2fc1b3ef7cecbf14L";
    private static final String LINE_END = "\r\n";
    private static final String TD = "--";
    
    /**
     * Possible actions
     */
    protected static final int ACTION_UPLOAD = 0;

    /**
     * Executes the requested action and returns a PluginResult.
     * 
     * @param action        The action to execute.
     * @param callbackId    The callback ID to be invoked upon action completion.
     * @param args          JSONArry of arguments for the action.
     * @return              A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) {

        // required parameters
        String filePath = null;    
        String server = null;
        try {
            filePath = args.getString(0);
            server = args.getString(1);
        } catch (JSONException e) {
            Logger.log(this.getClass().getName() + ": " + e);
            return new PluginResult(PluginResult.Status.JSONEXCEPTION, 
            "Invalid or missing parameter");
        }

        // file parameters
        String fileKey = "file";
        String fileName = "image.jpg";
        String mimeType = null;
        if(args.length() > 2 && !args.isNull(2)) {
            fileKey = args.optString(2);
        }
        if(args.length() > 3 && !args.isNull(3)) {
            fileName = args.optString(3);
        }
        if(args.length() > 4 && !args.isNull(4)) {
            mimeType = args.optString(4);
        }

        // perform specified action
        PluginResult result = null;
        int a = getAction(action);
        if (a == ACTION_UPLOAD) {
            try {
                FileUploadResult r = this.upload(filePath, server, fileKey, fileName, mimeType, callbackId);
                result = new PluginResult(PluginResult.Status.OK, r.toJSONObject());
            } 
            catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(FILE_NOT_FOUND_ERR));
            } 
            catch (IllegalArgumentException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.MALFORMEDURLEXCEPTION,
                        Integer.toString(INVALID_URL_ERR));
            }
            catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(CONNECTION_ERR));
            } 
            catch (JSONException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        } 
        else {
            // invalid action
            result = new PluginResult(PluginResult.Status.INVALIDACTION, 
                    "File: invalid action " + action);
        }
        
        return result;
    }

    /**
     * Uploads the specified file to the server URL provided using an HTTP 
     * multipart request. 
     * @param filePath      Full path of the file on the file system
     * @param server        URL of the server to receive the file
     * @param fileKey       Name of file request parameter
     * @param fileName      File name to be used on server
     * @param mimeType      Describes file content type
     * @return FileUploadResult containing result of upload request
     */
    public FileUploadResult upload(String filePath, String server, String fileKey, 
            String fileName, String mimeType, String callbackId) throws IOException {

        FileUploadResult result = new FileUploadResult();
        
        InputStream in = null;
        OutputStream out = null;
        FileConnection fconn = null;
        HttpConnection httpConn = null;
        try {
            // open connection to the file 
            fconn = (FileConnection)Connector.open(filePath, Connector.READ);
            if (!fconn.exists()) {
                throw new FileNotFoundException(filePath + " not found");
            }            
            
            // determine mime type by 
            //     1) user-provided type
            //     2) retrieve from file system
            //     3) default to JPEG
            if (mimeType == null) {
                mimeType = MIMETypeAssociations.getMIMEType(filePath);
                if (mimeType == null) {
                    mimeType = HttpProtocolConstants.CONTENT_TYPE_IMAGE_JPEG;
                }          
            }
            Logger.log(this.getClass().getName() + ": contentType=" + mimeType);
            
            // Determine content length. It is important to include length of
            // boundary messages, especially when sending large (1+ MB) images.
            long fileSize = fconn.fileSize();
            String boundaryMsg = getBoundaryMessage(fileKey, fileName, mimeType);
            String lastBoundary = getEndBoundary();
            long contentLength = fileSize + (long)boundaryMsg.length() + (long)lastBoundary.length();
            result.setLength(contentLength);
            
            // get HttpConnection
            httpConn = HttpUtils.getHttpConnection(server);
            if (httpConn == null) {
                throw new IOException("Unable to establish connection.");
            }
            Logger.log(this.getClass().getName() + ": uploading " + filePath + " to " + httpConn.getURL()); 
            
            // set request headers
            httpConn.setRequestMethod(HttpConnection.POST);
            httpConn.setRequestProperty(
                    HttpProtocolConstants.HEADER_USER_AGENT, 
                    System.getProperty("browser.useragent"));
            httpConn.setRequestProperty(
                    HttpProtocolConstants.HEADER_KEEP_ALIVE, "300");
            httpConn.setRequestProperty(
                    HttpProtocolConstants.HEADER_CONNECTION, "keep-alive");
            httpConn.setRequestProperty(
                    HttpProtocolConstants.HEADER_CONTENT_TYPE, 
                    HttpProtocolConstants.CONTENT_TYPE_MULTIPART_FORM_DATA + "; boundary=" + BOUNDARY);
            httpConn.setRequestProperty(
                    HttpProtocolConstants.HEADER_CONTENT_LENGTH, 
                    Long.toString(contentLength));
            
            // TODO: support request parameters
            
            // write content...
            out = httpConn.openDataOutputStream();
            result.setState(FileUploadResult.State.UPLOADING);

            // boundary
            out.write(boundaryMsg.getBytes());
            
            // file data
            in = fconn.openInputStream();
            byte[] data = IOUtilities.streamToBytes(in);
            out.write(data);
            in.close();
            
            // end boundary
            out.write(lastBoundary.getBytes());
            
            // send request and get response
            int rc = httpConn.getResponseCode();
            Logger.log(this.getClass().getName() + ": sent " + contentLength + " bytes");
            result.setResponseCode(rc);
            in = httpConn.openDataInputStream(); 
            result.setResponse(new String(IOUtilities.streamToBytes(in)));
            result.setState(FileUploadResult.State.DONE);
        }
        finally {
            try {
                if (fconn != null) fconn.close();
                if (in != null) in.close();
                if (out != null) out.close();
                if (httpConn != null) httpConn.close();
            } 
            catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        }
        
        return result;
    }
    
    /**
     * Sends an upload progress notification back to JavaScript engine.
     * @param result        FileUploadResult containing bytes sent of total
     * @param callbackId    identifier of callback function to invoke 
     */
    protected void sendProgress(FileUploadResult result, final String callbackId) {
        JSONObject o = null; 
        try { 
            o = result.toJSONObject();
        }
        catch (JSONException e) {
            Logger.log(this.getClass().getName() + ": " + e);
            return;
        }

        // send a progress result
        final PluginResult r = new PluginResult(PluginResult.Status.OK, o);
        r.setKeepCallback(true);
        UiApplication.getUiApplication().invokeAndWait(
            new Runnable() {
                public void run() {
                    PhoneGapExtension.invokeSuccessCallback(callbackId, r);
                }
            }
        );
    }
    
    /**
     * Returns the boundary string that represents the beginning of a file 
     * in a multipart HTTP request.
     * @param fileKey       Name of file request parameter
     * @param fileName      File name to be used on server
     * @param mimeType      Describes file content type
     * @return string representing the boundary message in a multipart HTTP request
     */
    protected String getBoundaryMessage(String fileKey, String fileName, String mimeType) {
        return (new StringBuffer())
            .append(LINE_END)
            .append(TD).append(BOUNDARY).append(LINE_END)
            .append("Content-Disposition: form-data; name=\"").append(fileKey)
            .append("\"; filename=\"").append(fileName).append("\"").append(LINE_END)
            .append("Content-Type: ").append(mimeType).append(LINE_END)
            .append(LINE_END)
            .toString();
    }

    /**
     * Returns the boundary string that represents the end of a file in a 
     * multipart HTTP request.
     * @return string representing the end boundary message in a multipart HTTP request
     */
    protected String getEndBoundary() {
        return LINE_END + TD + BOUNDARY + TD + LINE_END;        
    }
    
    /**
     * Returns action to perform.
     * @param action action to perform
     * @return action to perform
     */
    protected static int getAction(String action) {
        if ("upload".equals(action)) return ACTION_UPLOAD;
        return -1;
    }
}
