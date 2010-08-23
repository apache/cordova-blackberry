package com.phonegap.api;

public class CommandResult {
	private final int status;
	private final String result;
	
	public CommandResult(Status status, String result) {
		this.status = status.ordinal();
		this.result = result;
	}

	public int getStatus() {
		return status;
	}

	public String getResult() {
		return result;
	}
	
	public String toSuccessCallbackString(String callbackId) {
		return "try { PhoneGap.callbackSuccess('"+callbackId+"', " + this.getResult()+ "); } catch(e) { alert('error in callbackSuccess. probably badly formed callback JSON'); }";
	}
	
	public String toErrorCallbackString(String callbackId) {
		return "try { PhoneGap.callbackError('"+callbackId+"', " + this.getResult()+ "); } catch(e) { alert('error in callbackError. probably badly formed callback JSON'); }";
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
	}
}
