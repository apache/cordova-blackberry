package com.phonegap.api;

import org.json.me.JSONObject;

import com.phonegap.PhoneGapExtension;

public class CommandResult {
	private final int status;
	private final String message;
	
	public CommandResult(CommandStatus status) {
		this.status = status.ordinal();
		this.message = "'" + status.getMessage() + "'";
	}
	
	public CommandResult(CommandStatus status, String message) {
		this.status = status.ordinal();
		this.message = "'" + message + "'";
	}

	public CommandResult(CommandStatus status, JSONObject message) {
		this.status = status.ordinal();
		if (message != null) {
			this.message = message.toString();
		} else {
			this.message = "null";
		}
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
		return "PhoneGap.callbackSuccess('"+callbackId+"', " + this.getJSONString() + " );";
	}
	
	public String toErrorCallbackString(String callbackId) {
		return "PhoneGap.callbackError('"+callbackId+"', " + this.getJSONString()+ ");";
	}

	public String toErrorString() {
		return "alert('general error');";
	}
}