
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
 * Contains properties that describe a file.
 */
function FileProperties(filePath) {
    this.filePath = filePath;
    this.size = 0;
    this.lastModifiedDate = null;
};

/**
 * FileError
 */
function FileError() {
    this.code = null;
};

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by File API specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

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
 * Fires a file event to the specified callback.
 * 
 * @param callback      Callback to receive event notification.
 * @param target        Target of event.
 * @param type          Type of event.
 */
FileMgr.prototype.fireEvent = function(callback, target, type) {
    if (typeof callback == "function") {
        var event = {"type": type};
        event.target = target;
        callback(event);
    }
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

/**
 * Writes data to the specified file.
 * 
 * @param fileName          The full path of the file to write
 * @param data              The data to be written
 * @param position          The position in the file to begin writing
 * @param successCallback   Callback invoked after successful write operation
 * @param errorCallback     Callback invoked on error
 */
FileMgr.prototype.write = function(fileName, data, position, successCallback, errorCallback) {
    PhoneGap.exec(successCallback, errorCallback, "File", "write", [fileName, data, position]);
};

/**
 * Tests whether file exists.  Will return false if the path specifies a directory.
 * 
 * @param fullPath             The full path of the file 
 */
FileMgr.prototype.testFileExists = function(fullPath) {
    return blackberry.io.file.exists(fullPath);
};

/**
 * Tests whether directory exists.  Will return false if the path specifies a file.
 * 
 * @param fullPath             The full path of the directory
 */
FileMgr.prototype.testDirectoryExists = function(fullPath) {
    return blackberry.io.dir.exists(fullPath);
};

/**
 * Gets the properties of a file.  Throws an exception if fileName is a directory.
 * 
 * @param fileName          The full path of the file 
 */
FileMgr.prototype.getFileProperties = function(fileName) {    
    var fileProperties = new FileProperties(fileName);
    // attempt to get file properties
    if (blackberry.io.file.exists(fileName)) {
        var props = blackberry.io.file.getFileProperties(fileName);
        fileProperties.size = props.size;
        fileProperties.lastModifiedDate = props.dateModified;
    }
    // fileName is a directory
    else if (blackberry.io.dir.exists(fileName)) {
        throw FileError.TYPE_MISMATCH_ERR;
    }
    return fileProperties;
};

/**
 * Changes the length of the specified file.  Data beyond new length is discarded.  
 * 
 * @param fileName          The full path of the file to truncate
 * @param size              The size to which the length of the file is to be adjusted
 * @param successCallback   Callback invoked after successful write operation
 * @param errorCallback     Callback invoked on error
 */
FileMgr.prototype.truncate = function(fileName, size, successCallback, errorCallback) {
    PhoneGap.exec(successCallback, errorCallback, "File", "truncate", [fileName, size]);
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
    navigator.fileMgr.fireEvent(this.onerror, this, "error");
    navigator.fileMgr.fireEvent(this.onabort, this, "abort");
    navigator.fileMgr.fireEvent(this.onloadend, this, "loadend");
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
    navigator.fileMgr.fireEvent(this.onloadstart, this, "loadstart");        

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
            navigator.fileMgr.fireEvent(me.onload, me, "load");
            me.readyState = FileReader.DONE;
            navigator.fileMgr.fireEvent(me.onloadend, me, "loadend");
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
            navigator.fileMgr.fireEvent(me.onerror, me, "error");
            me.readyState = FileReader.DONE;
            navigator.fileMgr.fireEvent(me.onloadend, me, "loadend");
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
    navigator.fileMgr.fireEvent(this.onloadstart, this, "loadstart");
    
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
            navigator.fileMgr.fireEvent(me.onload, me, "load");
            me.readyState = FileReader.DONE;
            navigator.fileMgr.fireEvent(me.onloadend, me, "loadend");
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
            navigator.fileMgr.fireEvent(me.onerror, me, "error");
            me.readyState = FileReader.DONE;
            navigator.fileMgr.fireEvent(me.onloadend, me, "loadend");
        }
    );
};

//-----------------------------------------------------------------------------
//File Writer
//-----------------------------------------------------------------------------

/**
* This class writes to the mobile device file system.
*
* @param filePath       The full path to the file to be written to
* @param append         If true, then data will be written to the end of the file rather than the beginning 
*/
function FileWriter(filePath, append) {
    this.fileName = filePath;
    this.length = 0;

    // get the file properties
    var fp = navigator.fileMgr.getFileProperties(filePath);
    this.length = fp.size;
    
    // default is to write at the beginning of the file
    this.position = (append !== true) ? 0 : this.length;
    
    this.readyState = 0; // EMPTY
    
    // Error
    this.error = null;

    // Event handlers
    this.onwritestart = null;   // When writing starts
    this.onprogress = null;     // While writing the file, and reporting partial file data
    this.onwrite = null;        // When the write has successfully completed.
    this.onwriteend = null;     // When the request has completed (either in success or failure).
    this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
    this.onerror = null;        // When the write has failed (see errors).
};

//States
FileWriter.INIT = 0;
FileWriter.WRITING = 1;
FileWriter.DONE = 2;

/**
 * Abort writing file.
 */
FileWriter.prototype.abort = function() {
    // check for invalid state 
    if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
        throw FileError.INVALID_STATE_ERR;
    }
    
    // set error
    var error = new FileError();
    error.code = error.ABORT_ERR;
    this.error = error;

    // dispatch progress events
    navigator.fileMgr.fireEvent(this.onerror, this, "error");
    navigator.fileMgr.fireEvent(this.onabort, this, "abort");

    // set state
    this.readyState = FileWriter.DONE;
    
    // done
    navigator.fileMgr.fireEvent(this.writeend, this, "writeend");
};

/**
 * Sets the file position at which the next write will occur.
 * 
 * @param offset    Absolute byte offset into the file
 */
FileWriter.prototype.seek = function(offset) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw FileError.INVALID_STATE_ERR;
    }

    if (!offset) {
        return;
    }
    
    // offset is bigger than file size, set to length of file
    if (offset > this.length) { 
        this.position = this.length;
    }
    // seek back from end of file
    else if (offset < 0) { 
        this.position = Math.max(offset + this.length, 0);
    } 
    // offset in the middle of file
    else {
        this.position = offset;
    }
};

/**
 * Truncates the file to the specified size.
 * 
 * @param size      The size to which the file length is to be adjusted
 */
FileWriter.prototype.truncate = function(size) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw FileError.INVALID_STATE_ERR;
    }
    
    // WRITING state
    this.readyState = FileWriter.WRITING;

    // write the data to a file
    var me = this;
    navigator.fileMgr.fireEvent(this.onwritestart, this, "writestart");

    // truncate file
    navigator.fileMgr.truncate(this.fileName, size, 
        // Success callback receives the new file size
        function(result) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // new file size is returned
            me.length = result;
            // position is lesser of old position or new file size
            me.position = Math.min(me.position, result);

            // success procedure
            navigator.fileMgr.fireEvent(me.onwrite, me, "write");
            me.readyState = FileWriter.DONE;
            navigator.fileMgr.fireEvent(me.onwriteend, me, "writeend");
        },

        // Error callback
        function(error) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // Save error
            var err = new FileError();
            err.code = error;
            me.error = err;

            // error procedure
            navigator.fileMgr.fireEvent(me.onerror, me, "error");
            me.readyState = FileWriter.DONE;
            navigator.fileMgr.fireEvent(me.onwriteend, me, "writeend");
        }            
    );
};

/**
 * Writes the contents of a file to the device.
 * 
 * @param data      contents to be written
 */
FileWriter.prototype.write = function(data) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw FileError.INVALID_STATE_ERR;
    }

    // WRITING state
    this.readyState = FileWriter.WRITING;

    // write the data to a file
    var me = this;
    navigator.fileMgr.fireEvent(this.onwritestart, this, "writestart");

    // Write file
    navigator.fileMgr.write(this.fileName, data, this.position,

        // Success callback receives bytes written
        function(result) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // new length is maximum of old length, or position plus bytes written
            me.length = Math.max(me.length, me.position + result);
            // position always increases by bytes written because file would be extended
            me.position += result;

            // success procedure
            navigator.fileMgr.fireEvent(me.onwrite, me, "write");
            me.readyState = FileWriter.DONE;
            navigator.fileMgr.fireEvent(me.onwriteend, me, "writeend");
        },

        // Error callback
        function(error) {
            // If DONE (canceled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // Save error
            var err = new FileError();
            err.code = error;
            me.error = err;

            // error procedure
            navigator.fileMgr.fireEvent(me.onerror, me, "error");
            me.readyState = FileWriter.DONE;
            navigator.fileMgr.fireEvent(me.onwriteend, me, "writeend");
        }
    );
};
