package com.phonegap.geolocation;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import com.phonegap.api.CommandResult;

public class PositionOptions {
	private static final int START_ARG_MAX_AGE = 0;
	private static final int START_ARG_TIMEOUT = 1;
	private static final int START_ARG_HIGH_ACCURACY = 2;
	private static final int START_ARG_DISTANCE = 3;
	private static final int START_ARG_INTERVAL = 4;
	
	public int maxAge;
	public int timeout;
	public boolean enableHighAccuracy;
	public int distance;
	public int interval;

	public static PositionOptions fromJSONArray(JSONArray args) throws NumberFormatException, JSONException {
		PositionOptions po = new PositionOptions();

		po.maxAge = Integer.parseInt(args.getString(START_ARG_MAX_AGE));
		po.timeout = Integer.parseInt(args.getString(START_ARG_TIMEOUT));
		po.enableHighAccuracy = args.getBoolean(START_ARG_HIGH_ACCURACY);
		po.distance = Integer.parseInt(args.getString(START_ARG_DISTANCE));
		po.interval = Integer.parseInt(args.getString(START_ARG_INTERVAL));

		return po;
	}
}
