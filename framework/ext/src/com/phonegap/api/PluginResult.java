package com.phonegap.api;

import org.json.me.JSONObject;

public class PluginResult {
	private final int status;
	private final String message;
	
	public PluginResult(Status status, String message) {
		this.status = status.ordinal();
		this.message = "'" + message + "'";
	}

	public PluginResult(Status status, JSONObject message) {
		this.status = status.ordinal();
		this.message = message.toString();
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
		//return "PhoneGap.error(" + this.getResult()+ ");";
	}

	public static class Status
	{
	    private int val;
	    private Status(int val) {
	    	this.val = val;
	    }
	    
	    public int ordinal() {
	    	return this.val;
	    }

	    public static final Status OK = new Status(0);
	    public static final Status CLASSNOTFOUNDEXCEPTION = new Status(1);
	    public static final Status ILLEGALACCESSEXCEPTION = new Status(2);
	    public static final Status INSTANTIATIONEXCEPTION = new Status(3);
	    public static final Status MALFORMEDURLEXCEPTION = new Status(4);
	    public static final Status IOEXCEPTION = new Status(5);
	    public static final Status INVALIDACTION = new Status(6);
	    public static final Status JSONEXCEPTION = new Status(7);
	    public static final Status INPROGRESS = new Status(8);
	}
}
