/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */
package com.phonegap.camera;

import net.rim.device.api.system.Bitmap;

import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;

/**
 * A helper class to hold all the options specified when using the camera api.
 */
public class CameraOptions {

    /** Return the result as a Base-64 encoded string. */
    public static final int DESTINATION_DATA_URL = 0;

    /** Return the result as a file URI. */
    public static final int DESTINATION_FILE_URI = 1;

    /** JPEG image encoding. */
    public static final int ENCODING_JPEG = 0;

    /** PNG image encoding. */
    public static final int ENCODING_PNG = 1;

    /** Select image from picture library. */
    public static final int SOURCE_PHOTOLIBRARY = 0;

    /** Take picture from camera. */
    public static final int SOURCE_CAMERA = 1;

    /** Select image from picture library. */
    public static final int SOURCE_SAVEDPHOTOALBUM = 2;

    // Class members with defaults set.
    public int quality = 80;
    public int destinationType = DESTINATION_DATA_URL;
    public int sourceType = SOURCE_CAMERA;
    public int targetWidth = -1;
    public int targetHeight = -1;
    public int encoding = ENCODING_JPEG;
    public String fileExtension = ".jpg";
    public int imageFilter = Bitmap.FILTER_LANCZOS;
    public boolean reformat = false;

    /**
     * Defines the order of args in the JSONArray
     *
     * [ 80,                                   // quality
     *   Camera.DestinationType.DATA_URL,      // destinationType
     *   Camera.PictureSourceType.PHOTOLIBRARY // sourceType (ignored)
     *   400,                                  // targetWidth
     *   600,                                  // targetHeight
     *   Camera.EncodingType.JPEG]             // encoding
     */
    private static final int ARG_QUALITY = 0;
    private static final int ARG_DESTINATION_TYPE = 1;
    private static final int ARG_SOURCE_TYPE = 2;
    private static final int ARG_TARGET_WIDTH = 3;
    private static final int ARG_TARGET_HEIGHT = 4;
    private static final int ARG_ENCODING = 5;


    /**
     * Parse the JSONArray and populate the class members with the values.
     *
     * @param args
     *            a JSON Array of camera options.
     * @return a new CameraOptions object with values set.
     * @throws NumberFormatException
     * @throws JSONException
     */
    public static CameraOptions fromJSONArray(JSONArray args)
            throws NumberFormatException, JSONException {
        CameraOptions options = new CameraOptions();

        if (args != null && args.length() > 0) {
            // Use the quality value to determine what image filter to use
            // if a reformat is necessary.  The possible values in order from
            // fastest (poorest quality) to slowest (best quality) are:
            //
            //     FILTER_BOX -> FILTER_BILINEAR -> FILTER_LANCZOS
            if (!args.isNull(ARG_QUALITY)) {
                int quality = Integer.parseInt(args.getString(ARG_QUALITY));
                if (quality > 0) {
                    options.quality = quality > 100 ? 100 : quality;
                    if (options.quality < 30) {
                        options.imageFilter = Bitmap.FILTER_BOX;
                    } else if (options.quality < 60) {
                        options.imageFilter = Bitmap.FILTER_BILINEAR;
                    }
                }
            }

            if (!args.isNull(ARG_DESTINATION_TYPE)) {
                int destType = Integer.parseInt(args
                        .getString(ARG_DESTINATION_TYPE));
                if (destType == DESTINATION_FILE_URI) {
                    options.destinationType = DESTINATION_FILE_URI;
                }
            }

            if (!args.isNull(ARG_SOURCE_TYPE)) {
                options.sourceType = Integer.parseInt(args
                        .getString(ARG_SOURCE_TYPE));
            }

            if (!args.isNull(ARG_TARGET_WIDTH)) {
                options.targetWidth = Integer.parseInt(args
                        .getString(ARG_TARGET_WIDTH));
            }

            if (!args.isNull(ARG_TARGET_HEIGHT)) {
                options.targetHeight = Integer.parseInt(args
                        .getString(ARG_TARGET_HEIGHT));
            }

            if (!args.isNull(ARG_ENCODING)) {
                int encoding = Integer.parseInt(args.getString(ARG_ENCODING));
                if (encoding == ENCODING_PNG) {
                    options.encoding = ENCODING_PNG;
                    options.fileExtension = ".png";
                }
            }

            // A reformat of the picture taken from the camera is only performed
            // if a custom width or height was specified or the user wants
            // the output in an encoded form which is not JPEG.
            if (options.targetWidth > 0 || options.targetHeight > 0
                    || options.encoding != ENCODING_JPEG) {
                options.reformat = true;
            }
        }

        return options;
    }

    /**
     * @see java.lang.Object#toString()
     */
    public String toString() {
        StringBuffer str = new StringBuffer();
        str.append("Destination: " + destinationType + "\n");
        str.append("Source: " + sourceType + "\n");
        str.append("Quality: " + quality + "\n");
        str.append("Width:  " + targetWidth + "\n");
        str.append("Height: " + targetHeight + "\n");
        str.append("Encoding:    " + encoding + "\n");
        str.append("Filter: " + imageFilter + "\n");
        str.append("Reformat: " + reformat);
        return str.toString();
    }
}
