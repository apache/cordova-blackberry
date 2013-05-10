/*
 *
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
*/

//cordova-js/lib/common/plugin/CaptureError.js
var INTERNAL_ERROR_CODE = 0,
    APPLICATION_BUSY_ERROR_CODE = 1,
    INVALID_ARGUMENT_ERROR_CODE = 2,
    NO_MEDIA_FILES_ERROR_CODE = 3,
    NOT_SUPPORTED_ERROR_CODE = 20;

function capture(action, result, webview) {
    var noop = function () {},
        fail = function (error) {
            result.callbackError({code: INTERNAL_ERROR_CODE});
        },
        done = function (path) {
            var sb = webview.getSandbox();
            webview.setSandbox(false);
            window.webkitRequestFileSystem(window.PERSISTENT, 1024, function (fs) {
                fs.root.getFile(path, {}, function (fe) {
                    fe.file(function (file) {
                        file.fullPath = fe.fullPath;
                        webview.setSandbox(sb);
                        result.callbackOK([file]);
                    }, fail);
                }, fail);
            }, fail);
        },
        cancel = function () {
            result.callbackError({code: NO_MEDIA_FILES_ERROR_CODE });
        },
        invokeCallback = function () {
            result.callbackError({code: APPLICATION_BUSY_ERROR_CODE});
        };

    window.wp.getApplication().cards.camera.open(action, done, cancel, invokeCallback);

    result.noResult(true);
}

module.exports = {
    getSupportedAudioModes: function (success, fail, args, env) {
        var result = new PluginResult(args, env);
        result.ok([]);
    },
    getSupportedImageModes: function (win, fail, args, env) {
        var result = new PluginResult(args, env);
        result.ok([]);
    },
    getSupportedVideoModes: function (win, fail, args, env) {
        var result = new PluginResult(args, env);
        result.ok([]);
    },
    captureImage: function (win, fail, args, env) {
        var result = new PluginResult(args, env);

        if (args[0].limit > 0) {
            capture("photo", result, env.webview);
        }
        else {
            result.error({code: INVALID_ARGUMENT_ERROR_CODE});
        }
    },
    captureVideo: function (win, fail, args, env) {
        var result = new PluginResult(args, env);

        if (args[0].limit > 0) {
            capture("video", result, env.webview);
        }
        else {
            result.error({code: INVALID_ARGUMENT_ERROR_CODE});
        }
    },
    captureAudio: function (win, fail, args, env) {
        var result = new PluginResult(args, env);
        result.error({code: NOT_SUPPORTED_ERROR_CODE});
    }
};
