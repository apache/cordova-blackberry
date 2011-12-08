/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * Options to customize the HTTP request used to upload files.
 *
 * @constructor
 * @param fileKey
 *            {String} Name of file request parameter.
 * @param fileName
 *            {String} Filename to be used by the server. Defaults to image.jpg.
 * @param mimeType
 *            {String} Mimetype of the uploaded file. Defaults to image/jpeg.
 * @param params
 *            {Object} Object with key: value params to send to the server.
 */
var FileUploadOptions = function(fileKey, fileName, mimeType, params) {
    this.fileKey = fileKey || null;
    this.fileName = fileName || null;
    this.mimeType = mimeType || null;
    this.params = params || null;
};

/**
 * FileUploadResult
 * @constructor
 */
var FileUploadResult = function() {
    this.bytesSent = 0;
    this.responseCode = null;
    this.response = null;
};

/**
 * FileTransferError
 * @constructor
 */
var FileTransferError = function() {
    this.code = null;
};

FileTransferError.FILE_NOT_FOUND_ERR = 1;
FileTransferError.INVALID_URL_ERR = 2;
FileTransferError.CONNECTION_ERR = 3;

/**
 * FileTransfer transfers files to a remote server.
 */
var FileTransfer = FileTransfer || (function() {
    /**
     * @constructor
     */
    function FileTransfer() {
    };

    /**
     * Given an absolute file path, uploads a file on the device to a remote
     * server using a multipart HTTP request.
     *
     * @param filePath
     *            {String} Full path of the file on the device
     * @param server
     *            {String} URL of the server to receive the file
     * @param successCallback
     *            (Function} Callback to be invoked when upload has completed
     * @param errorCallback
     *            {Function} Callback to be invoked upon error
     * @param options
     *            {FileUploadOptions} Optional parameters such as file name and
     *            mimetype
     */
    FileTransfer.prototype.upload = function(filePath, server, successCallback,
            errorCallback, options, debug) {

        // check for options
        var fileKey = null;
        var fileName = null;
        var mimeType = null;
        var params = null;
        var chunkedMode = true;
        if (options) {
            fileKey = options.fileKey;
            fileName = options.fileName;
            mimeType = options.mimeType;
            if (options.chunkedMode !== null
                    || typeof options.chunkedMode !== "undefined") {
                chunkedMode = options.chunkedMode;
            }
            if (options.params) {
                params = options.params;
            } else {
                params = {};
            }
        }

        PhoneGap.exec(successCallback, errorCallback, 'FileTransfer', 'upload',
                [ filePath, server, fileKey, fileName, mimeType, params, debug,
                        chunkedMode ]);
    };

    /**
     * Downloads a file form a given URL and saves it to the specified
     * directory.
     *
     * @param source
     *            {String} URL of the server to receive the file
     * @param target
     *            {String} Full path of the file on the device
     * @param successCallback
     *            (Function} Callback to be invoked when upload has completed
     * @param errorCallback
     *            {Function} Callback to be invoked upon error
     */
    FileTransfer.prototype.download = function(source, target, successCallback,
            errorCallback) {
        var castSuccess = function(entry) {
            if (typeof successCallback === "function") {
                var fileEntry = new FileEntry(entry);
                successCallback(entry);
            }
        };
        PhoneGap.exec(castSuccess, errorCallback, 'FileTransfer',
                'download', [ source, target ]);
    };

    return FileTransfer;
}());
