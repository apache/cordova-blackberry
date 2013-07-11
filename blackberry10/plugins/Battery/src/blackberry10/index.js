/*
 * Copyright 2010-2011 Research In Motion Limited.
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

var _clientListeners = {},
    _webkitBattery = navigator.webkitBattery || navigator.battery;

function createCordovaInfo(webkitInfo) {
    var resultInfo = {};
    if (webkitInfo) {
        if (webkitInfo.srcElement) {
            //webkitBattery listeners store webkitBattery in srcElement object
            webkitInfo = webkitInfo.srcElement;
        }

        //put data from webkitBattery into a format cordova expects
        //webkitBattery seems to return level as a decimal pre 10.2
        resultInfo.level = webkitInfo.level <= 1 ? webkitInfo.level * 100 : webkitInfo.level;
        resultInfo.isPlugged = webkitInfo.charging;
    }
    return resultInfo;
}

module.exports = {
    start: function (result, args, env) {
        var listener = function (info) {
                var resultInfo = createCordovaInfo(info);
                Object.keys(_clientListeners).forEach(function (pluginResult) {
                    pluginResult.callbackOk(resultInfo, true);
                });
            };

        if (_clientListeners[env.webview.id]) {
            //TODO: Change back to erroring out after reset is implemented
            //result.error("Battery listener already running");
        }

        _clientListeners[env.webview.id] = result;

        //We set them both together, so only checking one (laziness === efficiency)
        if (_webkitBattery.onchargingchange !== null) {
            _webkitBattery.onchargingchange = listener;
            _webkitBattery.onlevelchange = listener;
        }

        setTimeout(function(){
            //Call callback with webkitBattery data right away
            var resultInfo = createCordovaInfo(_webkitBattery);
            result.callbackOk(resultInfo);
        });

        result.noResult(true);
    },

    stop: function (result, args, env) {
        var listener = _clientListeners[env.webview.id];

        if (!listener) {
            result.error("Battery listener has not started");
        } else {
            delete _clientListeners[env.webview.id];

            if (!Object.keys(_clientListeners).length) {
                _webkitBattery.onchargingchange = null;
                _webkitBattery.onlevelchange = null;
            }

            result.noResult(false);
        }
    }
};
