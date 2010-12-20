/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.http;

import org.json.me.JSONException;
import org.json.me.JSONObject;

/**
 * Encapsulates the result and/or status of uploading a file to a remote server.
 */
public class FileUploadResult {
    
    private State state = State.INIT;   // uploading state
    private long length = 0;            // content length
    private long sent = 0;              // bytes sent
    private int responseCode = -1;      // HTTP response code
    private String response = null;     // HTTP response

    public State getState() {
        return state;
    }
    
    public void setState(State state) {
        this.state = state;
    }
    
    public long getLength() {
        return length;
    }
    
    public void setLength(long length) {
        this.length = length;
    }
    
    public long getSent() {
        return sent;
    }
    
    public void setSent(long sent) {
        this.sent = sent;
    }
    
    public int getResponseCode() {
        return responseCode;
    }
    
    public void setResponseCode(int responseCode) {
        this.responseCode = responseCode;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }

    public JSONObject toJSONObject() throws JSONException {
        return new JSONObject(
                "{state:" + state + 
                ", length:" + length + 
                ", sent:" + sent + 
                ", responseCode:" + responseCode + 
                ", response:" + JSONObject.quote(response) + "}");
    }
    
    public static class State {
        private final int val;
        
        protected State(int state) {
            this.val = state;
        }
        
        public int ordinal() {
            return this.val;
        }
        
        public String toString() {
            return Integer.toString(val);
        }
        
        public static final State INIT = new State(0);
        public static final State UPLOADING = new State(1);
        public static final State DONE = new State(2);
    }
}
