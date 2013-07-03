(function () {
/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }
        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            main.apply(undef, args);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("dependencies/almond/almond", function(){});

define('legacy/lib/ui',['require','exports','module'],function (require, exports, module) {
var _plugins = [
        "default",
        "toast",
        "childwebviewcontrols",
        "dialog",
        "contextMenu",
        "invocationlist",
        "formcontrol"
    ];

function init(renderingWebView, subscriptionWebView, options) {
    var plugin,
        i;
    options = options || {};
    for (i = 0; i < _plugins.length; i++) {
        plugin = _plugins[i];
        if (options.exclude && options.exclude.indexOf(plugin) > -1) {
            continue;
        }
        renderingWebView[plugin].init(renderingWebView);
        if (typeof renderingWebView[plugin].subscribeTo === "function") {
            renderingWebView[plugin].subscribeTo(subscriptionWebView);
        }
    }
}

module.exports = {
    init : init
};
});

define('legacy/lib/WebView',['require','exports','module'],function (require, exports, module) {
module.exports = {
    extendPrototype: function () {
        // Need constructor to add more prototypes as shim
        var WebView = window.qnx.webplatform.getController().constructor,
            sendEvents = [
                'JavaScriptWindowObjectCleared',
                'LocationChanging',
                'ContextMenuRequestEvent',
                'ContextMenuCancelEvent',
                'PropertyCurrentContextEvent',
                'UnknownProtocol',
                'DialogRequested',
                'ChooseFile',
                'SSLHandshakingFailed',
                'GeolocationPermissionRequest',
                'NotificationPermissionRequest',
                'NetworkError',
                'NotificationPermissionCheck',
                'UserMediaRequest',
                'OpenWindow',
                'ChildWindowOpen',
                'ChildWebViewCreated',
                'NetworkResourceStatusReceived',
                'NetworkResourceHeaderReceived',
                'NetworkResourceDataReceived',
                'NetworkResourceRequested'
            ];

        /**
         * @description Maps on function to exisiting addEventListener or to the sendEvents
         * @param {String} eventType The type of the event that the webview needs to listen on
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        WebView.prototype.on = function (eventType, eventListener) {
            var that = this;
            if (sendEvents.indexOf(eventType) !== -1) {
                that["on" + eventType] = function (value) {
                    var valueObj = (typeof value === "object") ? value : JSON.parse(value),
                        options = {
                            returnValue: {},
                            webviewId: that.id,
                            waitHandle: valueObj.waitHandle
                        },
                        returnValue;
                    returnValue = eventListener(options, value);
                    if (returnValue) {
                        return returnValue;
                    }
                };
            } else {
                this.addEventListener(eventType, eventListener);
            }
        };

        /**
         * @description Maps un function to removeEventListener
         * @param {String} eventType The type of the event that the webview needs to remove
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        WebView.prototype.un = function (eventType, eventListener) {
            this.removeEventListener(eventType, eventListener);
        };

        /**
         * @description Maps emit function to dispatchEventListener
         * @param {String} eventType The type of the event that the webview needs to emit
         * @param {String} eventArgs The stringified arguments which needs to be sent with the event
         * @param {Boolean} sync The option to make this event synchronous or asynchronous
         */
        WebView.prototype.emit = function (eventType, eventArgs, sync) {
            this.dispatchEvent(eventType, eventArgs, sync);
        };
    }
};
});

define('legacy/lib/Application',['require','exports','module'],function (require, exports, module) {
module.exports = {
    extendPrototype : function () {
        var app = window.qnx.webplatform.getApplication().constructor;

        /**
         * @description Maps on function to existing addEventlistener
         * @param {String} eventType The type of the event that the app needs to listen
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        app.prototype.on = function (eventType, eventListener) {
            this.addEventListener(eventType, eventListener);
        };

        /**
         * @description Maps un function to existing addEventlistener
         * @param {String} eventType The type of the event that the app needs to remove
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        app.prototype.un = function (eventType, eventListener) {
            this.removeEventListener(eventType, eventListener);
        };
    }
};
});

define('legacy/lib/invocation',['require','exports','module'],function (require, exports, module) {
module.exports = {
    extendPrototype: function () {
        var invocation = window.qnx.webplatform.getApplication().invocation;

        /**
         * @description Maps on function to existing addEventlistener
         * @param {String} eventType The type of the event that the app needs to listen
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        invocation.on = function (eventType, eventListener) {
            this.addEventListener(eventType, eventListener);
        };

        /**
         * @description Maps un function to existing addEventlistener
         * @param {String} eventType The type of the event that the app needs to remove
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        invocation.un = function (eventType, eventListener) {
            this.removeEventListener(eventType, eventListener);
        };
    }
};
});

define('legacy/lib/device',['require','exports','module'],function (require, exports, module) {
module.exports = {
    extendPrototype: function () {
        var device = window.qnx.webplatform.device.constructor;

        /**
         * @description Maps on function to existing addEventlistener
         * @param {String} eventType The type of the event that the app needs to listen
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        device.prototype.on = function (eventType, eventListener) {
            this.addEventListener(eventType, eventListener);
        };

        /**
         * @description Maps un function to existing addEventlistener
         * @param {String} eventType The type of the event that the app needs to remove
         * @param {Function} eventListener The event handler which needs to be executed when the event occurs
         */
        device.prototype.un = function (eventType, eventListener) {
            this.removeEventListener(eventType, eventListener);
        };
    }
};
});

define('legacy/lib/main',['require','exports','module','./ui','./WebView','./Application','./invocation','./device'],function (require, exports, module) {
var _renderingWebView,
    _ui = require('./ui'),
    _modules = {
        "WebView": require('./WebView'),
        "Application": require('./Application'),
        "invocation": require('./invocation'),
        "device": require('./device')
    };

(function extendAllPrototypes() {
    var item;
    for (item in _modules) {
        _modules[item].extendPrototype();
    }
}());

//window.wp
window.wp = {};
window.wp.getController = qnx.webplatform.getController;
window.wp.getWebViews = qnx.webplatform.getWebViews;
window.wp.pps = qnx.webplatform.pps;
window.wp.getApplication = qnx.webplatform.getApplication;
window.wp.nativeCall = qnx.webplatform.nativeCall;
window.wp.createWebView = function (options, callback) {
    if (typeof options !== 'undefined' && options.ui/*shim*/) {
        return qnx.webplatform.createUIWebView(options, callback);
    } else {
        return qnx.webplatform.createWebView(options, callback);
    }
};

//window.wp.core
window.wp.core = {};
window.wp.core.invocation = qnx.webplatform.getApplication().invocation;

//window.wp.core.events
window.wp.core.events = {};
window.wp.core.events.on = qnx.webplatform.getController().on;
window.wp.core.events.un = qnx.webplatform.getController().un;
window.wp.core.events.emit = qnx.webplatform.getController().emit;

//window.wp.device
window.wp.device = qnx.webplatform.device;

//window.wp.ui
window.wp.ui = {};
window.wp.ui.init = function (renderingWebView, subscriptionWebView) {
    _renderingWebView = renderingWebView;
    _ui.init(renderingWebView, subscriptionWebView);
    window.wp.ui.default = renderingWebView.default;
    window.wp.ui.dialog = renderingWebView.dialog;
    window.wp.ui.contextMenu = renderingWebView.contextMenu;
    window.wp.ui.toast = renderingWebView.toast;
    window.wp.ui.formcontrol = renderingWebView.formcontrol;
    window.wp.ui.invocatinolist = renderingWebView.invocationlist;
    window.wp.ui.childwebviewcontrols = renderingWebView.childwebviewcontrols;
};
});

require(["./legacy/lib/main"]);
}());