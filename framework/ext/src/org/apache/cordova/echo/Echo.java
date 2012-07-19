/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Copyright (c) 2011, Research In Motion Limited.
 */
package org.apache.cordova.echo;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.json4j.JSONArray;
import org.apache.cordova.json4j.JSONException;
import org.apache.cordova.json4j.JSONObject;
import org.apache.cordova.util.Logger;
/**
 * A simple plugin to demonstrate how to build a plugin for Blackberry
 * Basically echos back the msg that a user calls to this plugin 
 */
public final class Echo extends Plugin {

    public static final String FIELD_VALUE 	= "value";
	public static final String DO_ECHO = "doEcho";

	public PluginResult execute(String action, JSONArray args, String callbackId) {
		PluginResult result = new PluginResult(PluginResult.Status.INVALID_ACTION, "Echo: Invalid action:" + action);
		if(action.equals(DO_ECHO)){
			try {
				JSONObject echoObj = new JSONObject();
				String theMsg = args.getString(0);
				if(theMsg.length()>0){   
				    echoObj.put(FIELD_VALUE, theMsg);
				    result = new PluginResult(PluginResult.Status.OK, echoObj);
				}else{
				    echoObj.put(FIELD_VALUE, "Nothing to echo.");
				    result = new PluginResult(PluginResult.Status.ERROR, echoObj);
				}
			} catch (JSONException e) {
				result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
			}
		}

		return result;
	}

}
