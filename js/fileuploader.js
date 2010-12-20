
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *  
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
 * FileUploader uploads a file to a remote server.
 */
function FileUploader() {};

/**
 * File upload status.
 */
FileUploadStatus = {
    INIT: 0,
    UPLOADING: 1,
    DONE: 2
};


/**
 * FileUploadResult
 */
function FileUploadResult() {
    this.state = 0;
    
    // for progress events
    this.sent = 0;
    this.length = 0;
    
    // response
    this.responseCode = null;
    this.response = null;
};

/**
 * FileUploadError
 */
function FileUploadError() {
    this.code = null;
};

FileUploadError.FILE_NOT_FOUND_ERR = 1;
FileUploadError.INVALID_URL_ERR = 2;
FileUploadError.CONNECTION_ERR = 3;

/**
* Given an absolute file path, uploads a file on the device to a remote server 
* using a multipart HTTP request.
* @param filePath {String}           Full path of the file on the device
* @param server {String}             URL of the server to receive the file
* @param successCallback (Function}  Callback to be invoked when upload has completed
* @param progressCallback {Function} Callback to be invoked to receive progress events
* @param errorCallback {Function}    Callback to be invoked upon error
* @param options {FileUploadOptions} Optional parameters such as file name and mimetype           
*/
FileUploader.prototype.upload = function(filePath, server, successCallback, progressCallback, errorCallback, options) {

    // check for options
    var fileKey = null;
    var fileName = null;
    var mimeType = null;
    if (options) {
        fileKey = options.fileKey;
        fileName = options.fileName;
        mimeType = options.mimeType;
    }
    
    // success callback will handle progress and done events
    var success = function(result) {
        // done
        if (result.state === FileUploadStatus.DONE) {
            if (typeof successCallback === "function") {
                successCallback(result);
            }
        }
        
        // progress event
        else {
            if (typeof progressCallback === "function") {
                progressCallback(result);
            }
        }
    };
    
    // error callback
    var fail = function(error) {
        var err = new FileUploadError();
        err.code = error;
        if (typeof errorCallback === "function") {
            errorCallback(err);
        }
    };
    
    PhoneGap.exec(success, fail, 'FileUploader', 'upload', [filePath, server, fileKey, fileName, mimeType]);
};

/**
 * Options to customize the HTTP request used to upload files.
 * @param fileKey {String}   Name of file request parameter.
 * @param fileName {String}  Filename to be used by the server. Defaults to image.jpg.
 * @param mimeType {String}  Mimetype of the uploaded file. Defaults to image/jpeg.
 * @param params {Object}    Object with key: value params to send to the server.
 */
function FileUploadOptions(fileKey, fileName, mimeType, params) {
    this.fileKey = fileKey || null;
    this.fileName = fileName || null;
    this.mimeType = mimeType || null;
    this.params = params || null;
};
