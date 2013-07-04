/*
 *  Copyright 2012 Research In Motion Limited.
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

var PluginResult = require("./PluginResult"),
    DEFAULT_SERVICE = "default",
    DEFAULT_ACTION = "exec";

function rebuildRequest(req) {
    var originalURL = req.params.service + "/" +
            req.params.action +
            (req.params.ext ? "/" + req.params.ext  : "") +
            (req.params.method ? "/" + req.params.method : "") +
            (req.params.args ? "?" + req.params.args : ""),
        tokens = originalURL.split('/'),
        //Handle the case where the method is multi-level
        finalToken = (tokens[1] && tokens.length > 2) ? tokens.slice(1).join('/') : tokens[1],
        args = null;

    // set args
    if (finalToken && finalToken.indexOf("?") >= 0) {
        // Re-split args
        args = finalToken.split("?")[1];
    }

    return {
        params : {
            service : DEFAULT_SERVICE,
            action : DEFAULT_ACTION,
            ext : tokens[0],
            method : (finalToken && finalToken.indexOf("?") >= 0) ? finalToken.split("?")[0] : finalToken,
            args : args
        },
        body : req.body,
        origin : req.origin
    };
}

function parseArgs(req) {
    var args = null,
        params,
        name;
    // set args
    if (req.params.args && typeof req.params.args === "string") {
        // GET querystring to json
        params = req.params.args.split("&");
        if (params) {
            args = {};
            params.forEach(function (param) {
                var parts = param.split("=");
                args[parts[0]] = parts[1];
            });
        }
    } else {
        // POST body to json
        if (req.body) {
            args = JSON.parse(req.body);
        }
    }

    for (name in args) {
        if (Object.hasOwnProperty.call(args, name)) {
            args[name] = (args[name] === "undefined" ? undefined : JSON.parse(decodeURIComponent(unescape(args[name]))));
        }
    }

    req.params.args = args;
}

module.exports = {
    handle: function (req, res, sourceWebview, config) {
        try {
            var pluginName = "lib/plugins/" + req.params.service,
                plugin,
                env;

            if (frameworkModules.indexOf(pluginName + ".js") === -1) {
                pluginName = "lib/plugins/" + DEFAULT_SERVICE;
                req = rebuildRequest(req);
            }

            parseArgs(req);

            //Updating because some versions of node only work with relative paths
            pluginName = pluginName.replace('lib', '.');

            plugin = require("./utils").loadModule(pluginName);

            env = {
                "request": req,
                "response": res,
                "webview": sourceWebview,
                "config": config
            };

            plugin[req.params.action](
                req,
                new PluginResult(req.params.args, env),
                req.params.args,
                env
            );
        } catch (e) {
            console.error("lib/servser: ", e);
            res.send(404, "Server encountered an error executing the request.");
        }
    }
};
