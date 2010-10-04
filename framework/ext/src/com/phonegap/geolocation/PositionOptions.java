package com.phonegap.geolocation;

import org.json.me.JSONArray;
import org.json.me.JSONException;

public class PositionOptions {
	private static final int START_ARG_MAX_AGE = 1;
	private static final int START_ARG_TIMEOUT = 2;
	private static final int START_ARG_HIGH_ACCURACY = 3;
	private static final int START_ARG_DISTANCE = 4;
	private static final int START_ARG_INTERVAL = 5;
	
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
