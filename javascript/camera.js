
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.camera 
 * 
 * Provides access to the device camera.
 */
var Camera = Camera || (function() {
    /**
     * Format of image that returned from getPicture.
     *
     * Example: navigator.camera.getPicture(success, fail,
     *              { quality: 80,
     *                destinationType: Camera.DestinationType.DATA_URL,
     *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
     */
    var DestinationType = {
        DATA_URL: 0,                // Return base64 encoded string
        FILE_URI: 1                 // Return file URI
    };

    /**
     * Source to getPicture from.
     *
     * Example: navigator.camera.getPicture(success, fail,
     *              { quality: 80,
     *                destinationType: Camera.DestinationType.DATA_URL,
     *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
     */
    var PictureSourceType = {       // Ignored on Blackberry
        PHOTOLIBRARY : 0,           // Choose image from picture library 
        CAMERA : 1,                 // Take picture from camera
        SAVEDPHOTOALBUM : 2         // Choose image from picture library 
    };

    /**
     * Encoding of image returned from getPicture.
     *
     * Example: navigator.camera.getPicture(success, fail,
     *              { quality: 80,
     *                destinationType: Camera.DestinationType.DATA_URL,
     *                sourceType: Camera.PictureSourceType.CAMERA,
     *                encodingType: Camera.EncodingType.PNG})
     */
    var EncodingType = {
        JPEG: 0,                    // Return JPEG encoded image
        PNG: 1                      // Return PNG encoded image
    };

    /**
     * @constructor
     */
    function Camera() {
    };

    /**
     * Attach constants to Camera.prototype (this is not really necessary, but
     * we do it for backward compatibility).
     */
    Camera.prototype.DestinationType = DestinationType;
    Camera.prototype.PictureSourceType = PictureSourceType;
    Camera.prototype.EncodingType = EncodingType;
    
    /**
     * Gets a picture from source defined by "options.sourceType", and returns the
     * image as defined by the "options.destinationType" option.

     * The defaults are sourceType=CAMERA and destinationType=DATA_URL.
     *
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {Object} options
     */
    Camera.prototype.getPicture = function(successCallback, errorCallback, options) {

        // successCallback required
        if (typeof successCallback != "function") {
            console.log("Camera Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback != "function")) {
            console.log("Camera Error: errorCallback is not a function");
            return;
        }

        if (typeof options.quality == "number") {
            quality = options.quality;
        } else if (typeof options.quality == "string") {
            var qlity = new Number(options.quality);
            if (isNaN(qlity) === false) {
                quality = qlity.valueOf();
            }
        }

        var destinationType = DestinationType.DATA_URL;
        if (options.destinationType) {
            destinationType = options.destinationType;
        }

        var sourceType = PictureSourceType.CAMERA;
        if (typeof options.sourceType == "number") {
            sourceType = options.sourceType;
        }

        var targetWidth = -1;
        if (typeof options.targetWidth == "number") {
            targetWidth = options.targetWidth;
        } else if (typeof options.targetWidth == "string") {
            var width = new Number(options.targetWidth);
            if (isNaN(width) === false) {
                targetWidth = width.valueOf();
            }
        }

        var targetHeight = -1;
        if (typeof options.targetHeight == "number") {
            targetHeight = options.targetHeight;
        } else if (typeof options.targetHeight == "string") {
            var height = new Number(options.targetHeight);
            if (isNaN(height) === false) {
                targetHeight = height.valueOf();
            }
        }

        var encodingType = EncodingType.JPEG;
        if (typeof options.encodingType == "number") {
            encodingType = options.encodingType;
        }

        PhoneGap.exec(successCallback, errorCallback, "Camera", "takePicture", [quality, destinationType, sourceType, targetWidth, targetHeight, encodingType]);
    };

    /**
     * Define navigator.camera object.
     */
    PhoneGap.addConstructor(function() {
        navigator.camera = new Camera();
    });
    
    /**
     * Return an object that contains the static constants.
     */
    return {
        DestinationType: DestinationType,
        PictureSourceType: PictureSourceType,
        EncodingType: EncodingType
    };
}());
