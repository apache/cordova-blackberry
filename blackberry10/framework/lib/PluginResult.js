/*
 * Copyright 2013 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function PluginResult (args, env) {

    this.CALLBACK_STATUS = {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
    };

    var callbackId = args.callbackId,
        send = function (data) {
            env.response.send(200, escape(encodeURIComponent(JSON.stringify(data))));
        },
        callback = function (success, status, data, keepCallback) {
            var executeString =
                "cordova.callbackFromNative('" +
                    callbackId  + "', " +
                    !!success + ", " +
                    status + ", " +
                    "[" + data + "], " +
                    !!keepCallback +
                ");";
            env.webview.executeJavaScript(executeString);
        };

    Object.defineProperty(this, "callbackId", {enumerable: true, value: callbackId});

    this.noResult = function (keepCallback) {
        send({ code: this.CALLBACK_STATUS.NO_RESULT, keepCallback: !!keepCallback });
    };

    this.error = function (msg, keepCallback, errorCode) {
        send({ code: errorCode || this.CALLBACK_STATUS.ERROR, msg: msg, keepCallback: !!keepCallback });
    };

    this.ok = function (data, keepCallback) {
        send({ code: this.CALLBACK_STATUS.OK, data: data, keepCallback: !!keepCallback });
    };

    this.callbackOk = function (data, keepCallback) {
        callback(true, this.CALLBACK_STATUS.OK, JSON.stringify(data), keepCallback);
    };

    this.callbackError = function (msg, keepCallback, errorCode) {
        callback(false, errorCode || this.CALLBACK_STATUS.ERROR, JSON.stringify(msg), keepCallback);
    };
}

module.exports = PluginResult;
