
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
 * These classes provides generic read and write access to the mobile device file system.
 * They are not used to read files from a server.
 */

/**
 * List of files
 */
function FileList() {
    this.files = {};
};

/**
 * Describes a single file in a FileList
 */
function File() {
    this.name = null;
    this.type = null;
    this.urn = null;
    this.lastModifiedDate = ""; 
    this.size = 0;
};

/**
 * FileError
 */
function FileError() {
    // File error codes
    // Found in DOMException
    this.NOT_FOUND_ERR = 1;
    this.SECURITY_ERR = 2;
    this.ABORT_ERR = 3;

    // Added by this specification
    this.NOT_READABLE_ERR = 4;
    this.ENCODING_ERR = 5;
    this.NO_MODIFICATION_ALLOWED_ERR = 6;
    this.INVALID_STATE_ERR = 7;
    this.SYNTAX_ERR = 8;

    this.code = null;
};

//-----------------------------------------------------------------------------
//File manager
//-----------------------------------------------------------------------------

/**
 * This class provides read and write access to mobile device file system in 
 * support of FileReader and FileWriter APIs based on 
 * http://www.w3.org/TR/2010/WD-FileAPI-20101026
 * and
 * <writer url>
 */
function FileMgr() {
};

/**
 * Reads a file from the device and encodes the contents using the specified 
 * encoding. 
 * 
 * @param fileName          The full path of the file to read
 * @param encoding          The encoding to use to encode the file's content
 * @param successCallback   Callback invoked with file contents
 * @param errorCallback     Callback invoked on error
 */
FileMgr.prototype.readAsText = function(fileName, encoding, successCallback, errorCallback) {
    PhoneGap.exec(successCallback, errorCallback, "File", "readAsText", [fileName, encoding]);
};

/**
 * Reads a file from the device and encodes the contents using BASE64 encoding.  
 * 
 * @param fileName          The full path of the file to read.
 * @param successCallback   Callback invoked with file contents
 * @param errorCallback     Callback invoked on error
 */
FileMgr.prototype.readAsDataURL = function(fileName, successCallback, errorCallback) {
    PhoneGap.exec(successCallback, errorCallback, "File", "readAsDataURL", [fileName]);
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.fileMgr == "undefined") navigator.fileMgr = new FileMgr();
});

//-----------------------------------------------------------------------------
//File Reader
//-----------------------------------------------------------------------------

/**
 * This class reads the mobile device file system.
 */
function FileReader() {
    this.fileName = "";

    this.readyState = 0;

    // File data
    this.result = null;

    // Error
    this.error = null;

    // Event handlers
    this.onloadstart = null;    // When the read starts.
    this.onprogress = null;     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progess.loaded/progress.total)
    this.onload = null;         // When the read has successfully completed.
    this.onerror = null;        // When the read has failed (see errors).
    this.onloadend = null;      // When the request has completed (either in success or failure).
    this.onabort = null;        // When the read has been aborted. For instance, by invoking the abort() method.
};

//States
FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

/**
 * Fires a file event to the specified callback.
 * 
 * @param callback      Callback to receive event notification.
 * @param type          Type of event.
 */
FileReader.prototype.fireEvent = function(callback, type) {
    if (typeof callback == "function") {
        var event = {"type": type};
        event.target = this;
        callback(event);
    }
};

/**
 * Abort read file operation.
 */
FileReader.prototype.abort = function() {
    this.readyState = FileReader.DONE;
    this.result = null;
    
    // set error
    var error = new FileError();
    error.code = error.ABORT_ERR;
    this.error = error;

    // abort procedure
    this.fireEvent(this.onerror, "error");
    this.fireEvent(this.onabort, "abort");
    this.fireEvent(this.onloadend, "loadend");
};

/**
 * Reads and encodes text file.
 *
 * @param file          The name of the file
 * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
 */
FileReader.prototype.readAsText = function(file, encoding) {
    // Use UTF-8 as default encoding
    var enc = encoding ? encoding : "UTF-8";
    
    // start
    this.readyState = FileReader.LOADING;
    this.fireEvent(this.onloadstart, "loadstart");        

    // read and encode file
    this.fileName = file;
    var me = this;
    navigator.fileMgr.readAsText(file, enc, 

        // success callback
        function(result) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // success procedure
            me.result = result;
            me.fireEvent(me.onload, "load");
            me.readyState = FileReader.DONE;
            me.fireEvent(me.onloadend, "loadend");
        },

        // error callback
        function(error) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // capture error
            var err = new FileError();
            err.code = error;
            me.error = err;
            
            // error procedure
            me.result = null;
            me.fireEvent(me.onerror, "error");
            me.readyState = FileReader.DONE;
            me.fireEvent(me.onloadend, "loadend");
        }
    );
};

/**
 * Read file and return data as a base64 encoded data url.
 * A data url is of the form:
 *      data:[<mediatype>][;base64],<data>
 *
 * @param file          The name of the file
 */
FileReader.prototype.readAsDataURL = function(file) {
    // start
    this.readyState = FileReader.LOADING;
    this.fireEvent(this.onloadstart, "loadstart");
    
    // read and encode file
    this.fileName = file;
    var me = this;
    navigator.fileMgr.readAsDataURL(file, 

        // success callback
        function(result) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // success procedure
            me.result = result;
            me.fireEvent(me.onload, "load");
            me.readyState = FileReader.DONE;
            me.fireEvent(me.onloadend, "loadend");
        },

        // error callback
        function(error) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // capture error
            var err = new FileError();
            err.code = error;
            me.error = err;
            
            // error procedure
            me.result = null;
            me.fireEvent(me.onerror, "error");
            me.readyState = FileReader.DONE;
            me.fireEvent(me.onloadend, "loadend");
        }
    );
};
