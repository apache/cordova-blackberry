package com.phonegap.api;

import org.json.me.JSONObject;

public class PluginResult {
	
	private final int status;
	private final String message;
	
	public PluginResult(Status status) {
		this.status = status.ordinal();
		this.message = "'" + status.getMessage() + "'";
	}
	
	public PluginResult(Status status, String message) {
		this.status = status.ordinal();
		this.message = "'" + message + "'";
	}

	public PluginResult(Status status, JSONObject message) {
		this.status = status.ordinal();
		this.message = (message != null) ? message.toString(): "null";
	}
	
	public int getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}

	public String getJSONString() {
		return "{ status: " + this.getStatus() + ", message: " + this.getMessage() + " }";
	}
	
	public String toSuccessCallbackString(String callbackId) {
		return "try { PhoneGap.callbackSuccess('"+callbackId+"', " + this.getJSONString() + "); } catch(e) { alert('error in callbackSuccess:' + e.message); }";
	}
	
	public String toErrorCallbackString(String callbackId) {
		return "try { PhoneGap.callbackError('"+callbackId+"', " + this.getJSONString() + "); } catch(e) { alert('error in callbackError:' + e.message); }";
	}

	public String toErrorString() {
		return "alert('general error');";
	}

	public static class Status
	{
	    private int val;
	    private String message;
	    
	    protected Status(int val, String message) {
	    	this.val = val;
	    	this.message = message;
	    }
	    
	    public int ordinal() {
	    	return this.val;
	    }
	    
	    public String getMessage() {
	    	return this.message;
	    }

	    public static final Status OK = new Status(0, "OK");
	    public static final Status CLASSNOTFOUNDEXCEPTION = new Status(1, "Class not found");
	    public static final Status ILLEGALACCESSEXCEPTION = new Status(2, "Illegal access");
	    public static final Status INSTANTIATIONEXCEPTION = new Status(3, "Instantiation error");
	    public static final Status MALFORMEDURLEXCEPTION = new Status(4, "Malformed URL");
	    public static final Status IOEXCEPTION = new Status(5, "IO error");
	    public static final Status INVALIDACTION = new Status(6, "Invalid action");
	    public static final Status JSONEXCEPTION = new Status(7, "JSON error");
	    public static final Status ERROR = new Status(8, "Error");
	    public static final Status ILLEGAL_ARGUMENT_EXCEPTION = new Status(9, "Illegal argument");
	}
}
