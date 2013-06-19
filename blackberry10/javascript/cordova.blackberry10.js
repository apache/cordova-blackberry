// Platform: blackberry10
// 2.7.0rc1-156-g209bd10
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/
;(function() {
var CORDOVA_JS_BUILD_LABEL = '2.7.0rc1-156-g209bd10';
// file: lib/scripts/require.js

var require,
    define;

(function () {
    var modules = {},
    // Stack of moduleIds currently being built.
        requireStack = [],
    // Map of module ID -> index into requireStack of modules currently being built.
        inProgressModules = {},
        SEPERATOR = ".";



    function build(module) {
        var factory = module.factory,
            localRequire = function (id) {
                var resultantId = id;
                //Its a relative path, so lop off the last portion and add the id (minus "./")
                if (id.charAt(0) === ".") {
                    resultantId = module.id.slice(0, module.id.lastIndexOf(SEPERATOR)) + SEPERATOR + id.slice(2);
                }
                return require(resultantId);
            };
        module.exports = {};
        delete module.factory;
        factory(localRequire, module.exports, module);
        return module.exports;
    }

    require = function (id) {
        if (!modules[id]) {
            throw "module " + id + " not found";
        } else if (id in inProgressModules) {
            var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
            throw "Cycle in require graph: " + cycle;
        }
        if (modules[id].factory) {
            try {
                inProgressModules[id] = requireStack.length;
                requireStack.push(id);
                return build(modules[id]);
            } finally {
                delete inProgressModules[id];
                requireStack.pop();
            }
        }
        return modules[id].exports;
    };

    define = function (id, factory) {
        if (modules[id]) {
            throw "module " + id + " already defined";
        }

        modules[id] = {
            id: id,
            factory: factory
        };
    };

    define.remove = function (id) {
        delete modules[id];
    };

    define.moduleMap = modules;
})();

//Export for use in node
if (typeof module === "object" && typeof require === "function") {
    module.exports.require = require;
    module.exports.define = define;
}

// file: lib/cordova.js
define("cordova", function(require, exports, module) {


var channel = require('cordova/channel');

/**
 * Listen for DOMContentLoaded and notify our channel subscribers.
 */
document.addEventListener('DOMContentLoaded', function() {
    channel.onDOMContentLoaded.fire();
}, false);
if (document.readyState == 'complete' || document.readyState == 'interactive') {
    channel.onDOMContentLoaded.fire();
}

/**
 * Intercept calls to addEventListener + removeEventListener and handle deviceready,
 * resume, and pause events.
 */
var m_document_addEventListener = document.addEventListener;
var m_document_removeEventListener = document.removeEventListener;
var m_window_addEventListener = window.addEventListener;
var m_window_removeEventListener = window.removeEventListener;

/**
 * Houses custom event handlers to intercept on document + window event listeners.
 */
var documentEventHandlers = {},
    windowEventHandlers = {};

document.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof documentEventHandlers[e] != 'undefined') {
        documentEventHandlers[e].subscribe(handler);
    } else {
        m_document_addEventListener.call(document, evt, handler, capture);
    }
};

window.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof windowEventHandlers[e] != 'undefined') {
        windowEventHandlers[e].subscribe(handler);
    } else {
        m_window_addEventListener.call(window, evt, handler, capture);
    }
};

document.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    // If unsubscribing from an event that is handled by a plugin
    if (typeof documentEventHandlers[e] != "undefined") {
        documentEventHandlers[e].unsubscribe(handler);
    } else {
        m_document_removeEventListener.call(document, evt, handler, capture);
    }
};

window.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    // If unsubscribing from an event that is handled by a plugin
    if (typeof windowEventHandlers[e] != "undefined") {
        windowEventHandlers[e].unsubscribe(handler);
    } else {
        m_window_removeEventListener.call(window, evt, handler, capture);
    }
};

function createEvent(type, data) {
    var event = document.createEvent('Events');
    event.initEvent(type, false, false);
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                event[i] = data[i];
            }
        }
    }
    return event;
}

if(typeof window.console === "undefined") {
    window.console = {
        log:function(){}
    };
}

var cordova = {
    define:define,
    require:require,
    /**
     * Methods to add/remove your own addEventListener hijacking on document + window.
     */
    addWindowEventHandler:function(event) {
        return (windowEventHandlers[event] = channel.create(event));
    },
    addStickyDocumentEventHandler:function(event) {
        return (documentEventHandlers[event] = channel.createSticky(event));
    },
    addDocumentEventHandler:function(event) {
        return (documentEventHandlers[event] = channel.create(event));
    },
    removeWindowEventHandler:function(event) {
        delete windowEventHandlers[event];
    },
    removeDocumentEventHandler:function(event) {
        delete documentEventHandlers[event];
    },
    /**
     * Retrieve original event handlers that were replaced by Cordova
     *
     * @return object
     */
    getOriginalHandlers: function() {
        return {'document': {'addEventListener': m_document_addEventListener, 'removeEventListener': m_document_removeEventListener},
        'window': {'addEventListener': m_window_addEventListener, 'removeEventListener': m_window_removeEventListener}};
    },
    /**
     * Method to fire event from native code
     * bNoDetach is required for events which cause an exception which needs to be caught in native code
     */
    fireDocumentEvent: function(type, data, bNoDetach) {
        var evt = createEvent(type, data);
        if (typeof documentEventHandlers[type] != 'undefined') {
            if( bNoDetach ) {
              documentEventHandlers[type].fire(evt);
            }
            else {
              setTimeout(function() {
                  // Fire deviceready on listeners that were registered before cordova.js was loaded.
                  if (type == 'deviceready') {
                      document.dispatchEvent(evt);
                  }
                  documentEventHandlers[type].fire(evt);
              }, 0);
            }
        } else {
            document.dispatchEvent(evt);
        }
    },
    fireWindowEvent: function(type, data) {
        var evt = createEvent(type,data);
        if (typeof windowEventHandlers[type] != 'undefined') {
            setTimeout(function() {
                windowEventHandlers[type].fire(evt);
            }, 0);
        } else {
            window.dispatchEvent(evt);
        }
    },

    /**
     * Plugin callback mechanism.
     */
    // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
    // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
    callbackId: Math.floor(Math.random() * 2000000000),
    callbacks:  {},
    callbackStatus: {
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
    },

    /**
     * Called by native code when returning successful result from an action.
     */
    callbackSuccess: function(callbackId, args) {
        try {
            cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
        } catch (e) {
            console.log("Error in error callback: " + callbackId + " = "+e);
        }
    },

    /**
     * Called by native code when returning error result from an action.
     */
    callbackError: function(callbackId, args) {
        // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
        // Derive success from status.
        try {
            cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
        } catch (e) {
            console.log("Error in error callback: " + callbackId + " = "+e);
        }
    },

    /**
     * Called by native code when returning the result from an action.
     */
    callbackFromNative: function(callbackId, success, status, args, keepCallback) {
        var callback = cordova.callbacks[callbackId];
        if (callback) {
            if (success && status == cordova.callbackStatus.OK) {
                callback.success && callback.success.apply(null, args);
            } else if (!success) {
                callback.fail && callback.fail.apply(null, args);
            }

            // Clear callback if not expecting any more results
            if (!keepCallback) {
                delete cordova.callbacks[callbackId];
            }
        }
    },
    addConstructor: function(func) {
        channel.onCordovaReady.subscribe(function() {
            try {
                func();
            } catch(e) {
                console.log("Failed to run constructor: " + e);
            }
        });
    }
};

// Register pause, resume and deviceready channels as events on document.
channel.onPause = cordova.addDocumentEventHandler('pause');
channel.onResume = cordova.addDocumentEventHandler('resume');
channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

module.exports = cordova;

});

// file: lib/common/argscheck.js
define("cordova/argscheck", function(require, exports, module) {

var exec = require('cordova/exec');
var utils = require('cordova/utils');

var moduleExports = module.exports;

var typeMap = {
    'A': 'Array',
    'D': 'Date',
    'N': 'Number',
    'S': 'String',
    'F': 'Function',
    'O': 'Object'
};

function extractParamName(callee, argIndex) {
  return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
}

function checkArgs(spec, functionName, args, opt_callee) {
    if (!moduleExports.enableChecks) {
        return;
    }
    var errMsg = null;
    var typeName;
    for (var i = 0; i < spec.length; ++i) {
        var c = spec.charAt(i),
            cUpper = c.toUpperCase(),
            arg = args[i];
        // Asterix means allow anything.
        if (c == '*') {
            continue;
        }
        typeName = utils.typeName(arg);
        if ((arg === null || arg === undefined) && c == cUpper) {
            continue;
        }
        if (typeName != typeMap[cUpper]) {
            errMsg = 'Expected ' + typeMap[cUpper];
            break;
        }
    }
    if (errMsg) {
        errMsg += ', but got ' + typeName + '.';
        errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
        // Don't log when running unit tests.
        if (typeof jasmine == 'undefined') {
            console.error(errMsg);
        }
        throw TypeError(errMsg);
    }
}

function getValue(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

moduleExports.checkArgs = checkArgs;
moduleExports.getValue = getValue;
moduleExports.enableChecks = true;


});

// file: lib/common/builder.js
define("cordova/builder", function(require, exports, module) {

var utils = require('cordova/utils');

function each(objects, func, context) {
    for (var prop in objects) {
        if (objects.hasOwnProperty(prop)) {
            func.apply(context, [objects[prop], prop]);
        }
    }
}

function clobber(obj, key, value) {
    exports.replaceHookForTesting(obj, key);
    obj[key] = value;
    // Getters can only be overridden by getters.
    if (obj[key] !== value) {
        utils.defineGetter(obj, key, function() {
            return value;
        });
    }
}

function assignOrWrapInDeprecateGetter(obj, key, value, message) {
    if (message) {
        utils.defineGetter(obj, key, function() {
            console.log(message);
            delete obj[key];
            clobber(obj, key, value);
            return value;
        });
    } else {
        clobber(obj, key, value);
    }
}

function include(parent, objects, clobber, merge) {
    each(objects, function (obj, key) {
        try {
          var result = obj.path ? require(obj.path) : {};

          if (clobber) {
              // Clobber if it doesn't exist.
              if (typeof parent[key] === 'undefined') {
                  assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              } else if (typeof obj.path !== 'undefined') {
                  // If merging, merge properties onto parent, otherwise, clobber.
                  if (merge) {
                      recursiveMerge(parent[key], result);
                  } else {
                      assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                  }
              }
              result = parent[key];
          } else {
            // Overwrite if not currently defined.
            if (typeof parent[key] == 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
            } else {
              // Set result to what already exists, so we can build children into it if they exist.
              result = parent[key];
            }
          }

          if (obj.children) {
            include(result, obj.children, clobber, merge);
          }
        } catch(e) {
          utils.alert('Exception building cordova JS globals: ' + e + ' for key "' + key + '"');
        }
    });
}

/**
 * Merge properties from one object onto another recursively.  Properties from
 * the src object will overwrite existing target property.
 *
 * @param target Object to merge properties into.
 * @param src Object to merge properties from.
 */
function recursiveMerge(target, src) {
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            if (target.prototype && target.prototype.constructor === target) {
                // If the target object is a constructor override off prototype.
                clobber(target.prototype, prop, src[prop]);
            } else {
                if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
                    recursiveMerge(target[prop], src[prop]);
                } else {
                    clobber(target, prop, src[prop]);
                }
            }
        }
    }
}

exports.buildIntoButDoNotClobber = function(objects, target) {
    include(target, objects, false, false);
};
exports.buildIntoAndClobber = function(objects, target) {
    include(target, objects, true, false);
};
exports.buildIntoAndMerge = function(objects, target) {
    include(target, objects, true, true);
};
exports.recursiveMerge = recursiveMerge;
exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;
exports.replaceHookForTesting = function() {};

});

// file: lib/common/channel.js
define("cordova/channel", function(require, exports, module) {

var utils = require('cordova/utils'),
    nextGuid = 1;

/**
 * Custom pub-sub "channel" that can have functions subscribed to it
 * This object is used to define and control firing of events for
 * cordova initialization, as well as for custom events thereafter.
 *
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
 * onNativeReady*              Internal event that indicates the Cordova native side is ready.
 * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
 * onDeviceReady*              User event fired to indicate that Cordova is ready
 * onResume                    User event fired to indicate a start/resume lifecycle event
 * onPause                     User event fired to indicate a pause lifecycle event
 * onDestroy*                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
 *
 * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
 * All listeners that subscribe after the event is fired will be executed right away.
 *
 * The only Cordova events that user code should register for are:
 *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
 *      pause                 App has moved to background
 *      resume                App has returned to foreground
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 *
 * The DOM lifecycle events should be used for saving and restoring state
 *      window.onload
 *      window.onunload
 *
 */

/**
 * Channel
 * @constructor
 * @param type  String the channel name
 */
var Channel = function(type, sticky) {
    this.type = type;
    // Map of guid -> function.
    this.handlers = {};
    // 0 = Non-sticky, 1 = Sticky non-fired, 2 = Sticky fired.
    this.state = sticky ? 1 : 0;
    // Used in sticky mode to remember args passed to fire().
    this.fireArgs = null;
    // Used by onHasSubscribersChange to know if there are any listeners.
    this.numHandlers = 0;
    // Function that is called when the first listener is subscribed, or when
    // the last listener is unsubscribed.
    this.onHasSubscribersChange = null;
},
    channel = {
        /**
         * Calls the provided function only after all of the channels specified
         * have been fired. All channels must be sticky channels.
         */
        join: function(h, c) {
            var len = c.length,
                i = len,
                f = function() {
                    if (!(--i)) h();
                };
            for (var j=0; j<len; j++) {
                if (c[j].state === 0) {
                    throw Error('Can only use join with sticky channels.');
                }
                c[j].subscribe(f);
            }
            if (!len) h();
        },
        create: function(type) {
            return channel[type] = new Channel(type, false);
        },
        createSticky: function(type) {
            return channel[type] = new Channel(type, true);
        },

        /**
         * cordova Channels that must fire before "deviceready" is fired.
         */
        deviceReadyChannelsArray: [],
        deviceReadyChannelsMap: {},

        /**
         * Indicate that a feature needs to be initialized before it is ready to be used.
         * This holds up Cordova's "deviceready" event until the feature has been initialized
         * and Cordova.initComplete(feature) is called.
         *
         * @param feature {String}     The unique feature name
         */
        waitForInitialization: function(feature) {
            if (feature) {
                var c = channel[feature] || this.createSticky(feature);
                this.deviceReadyChannelsMap[feature] = c;
                this.deviceReadyChannelsArray.push(c);
            }
        },

        /**
         * Indicate that initialization code has completed and the feature is ready to be used.
         *
         * @param feature {String}     The unique feature name
         */
        initializationComplete: function(feature) {
            var c = this.deviceReadyChannelsMap[feature];
            if (c) {
                c.fire();
            }
        }
    };

function forceFunction(f) {
    if (typeof f != 'function') throw "Function required as first argument!";
}

/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
Channel.prototype.subscribe = function(f, c) {
    // need a function to call
    forceFunction(f);
    if (this.state == 2) {
        f.apply(c || this, this.fireArgs);
        return;
    }

    var func = f,
        guid = f.observer_guid;
    if (typeof c == "object") { func = utils.close(c, f); }

    if (!guid) {
        // first time any channel has seen this subscriber
        guid = '' + nextGuid++;
    }
    func.observer_guid = guid;
    f.observer_guid = guid;

    // Don't add the same handler more than once.
    if (!this.handlers[guid]) {
        this.handlers[guid] = func;
        this.numHandlers++;
        if (this.numHandlers == 1) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

/**
 * Unsubscribes the function with the given guid from the channel.
 */
Channel.prototype.unsubscribe = function(f) {
    // need a function to unsubscribe
    forceFunction(f);

    var guid = f.observer_guid,
        handler = this.handlers[guid];
    if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

/**
 * Calls all functions subscribed to this channel.
 */
Channel.prototype.fire = function(e) {
    var fail = false,
        fireArgs = Array.prototype.slice.call(arguments);
    // Apply stickiness.
    if (this.state == 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
    }
    if (this.numHandlers) {
        // Copy the values first so that it is safe to modify it from within
        // callbacks.
        var toCall = [];
        for (var item in this.handlers) {
            toCall.push(this.handlers[item]);
        }
        for (var i = 0; i < toCall.length; ++i) {
            toCall[i].apply(this, fireArgs);
        }
        if (this.state == 2 && this.numHandlers) {
            this.numHandlers = 0;
            this.handlers = {};
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};


// defining them here so they are ready super fast!
// DOM event that is received when the web page is loaded and parsed.
channel.createSticky('onDOMContentLoaded');

// Event to indicate the Cordova native side is ready.
channel.createSticky('onNativeReady');

// Event to indicate that all Cordova JavaScript objects have been created
// and it's time to run plugin constructors.
channel.createSticky('onCordovaReady');

// Event to indicate that all automatically loaded JS plugins are loaded and ready.
channel.createSticky('onPluginsReady');

// Event to indicate that Cordova is ready
channel.createSticky('onDeviceReady');

// Event to indicate a resume lifecycle event
channel.create('onResume');

// Event to indicate a pause lifecycle event
channel.create('onPause');

// Event to indicate a destroy lifecycle event
channel.createSticky('onDestroy');

// Channels that must fire before "deviceready" is fired.
channel.waitForInitialization('onCordovaReady');
channel.waitForInitialization('onDOMContentLoaded');

module.exports = channel;

});

// file: lib/common/commandProxy.js
define("cordova/commandProxy", function(require, exports, module) {


// internal map of proxy function
var CommandProxyMap = {};

module.exports = {

    // example: cordova.commandProxy.add("Accelerometer",{getCurrentAcceleration: function(successCallback, errorCallback, options) {...},...);
    add:function(id,proxyObj) {
        console.log("adding proxy for " + id);
        CommandProxyMap[id] = proxyObj;
        return proxyObj;
    },

    // cordova.commandProxy.remove("Accelerometer");
    remove:function(id) {
        var proxy = CommandProxyMap[id];
        delete CommandProxyMap[id];
        CommandProxyMap[id] = null;
        return proxy;
    },

    get:function(service,action) {
        return ( CommandProxyMap[service] ? CommandProxyMap[service][action] : null );
    }
};
});

// file: lib/blackberry10/exec.js
define("cordova/exec", function(require, exports, module) {

var cordova = require('cordova'),
    plugins = {
        'Compass' : require('cordova/plugin/blackberry10/magnetometer'),
        'FileTransfer': require('cordova/plugin/blackberry10/fileTransfer')
    };

function RemoteFunctionCall(functionUri) {
    var params = {};

    function composeUri() {
        return require("cordova/plugin/blackberry10/utils").getURIPrefix() + functionUri;
    }

    function createXhrRequest(uri, isAsync) {
        var request = new XMLHttpRequest();
        request.open("POST", uri, isAsync);
        request.setRequestHeader("Content-Type", "application/json");
        return request;
    }

    this.addParam = function (name, value) {
        params[name] = escape(encodeURIComponent(JSON.stringify(value)));
    };

    this.makeSyncCall = function () {
        var request = createXhrRequest(composeUri(), false),
            response;

        request.send(JSON.stringify(params));
        response = JSON.parse(decodeURIComponent(request.responseText) || "null");
        return response;
    };
}


function exec (success, fail, service, action, args) {
    var uri = service + "/" + action,
        request = new RemoteFunctionCall(uri),
        callbackId = service + cordova.callbackId++,
        response,
        name,
        didSucceed;

    for (name in args) {
        if (Object.hasOwnProperty.call(args, name)) {
            request.addParam(name, args[name]);
        }
    }

    cordova.callbacks[callbackId] = {success:success, fail:fail};
    request.addParam("callbackId", callbackId);

    response = request.makeSyncCall();

    didSucceed = response.code === cordova.callbackStatus.OK || response.code === cordova.callbackStatus.NO_RESULT;
    cordova.callbackFromNative(callbackId, didSucceed, response.code, [ didSucceed ? response.data : response.msg ], !!response.keepCallback);
}

/**
 * Execute a cordova command.  It is up to the native side whether this action
 * is synchronous or asynchronous.  The native side can return:
 *      Synchronous: PluginResult object as a JSON string
 *      Asynchronous: Empty string ""
 * If async, the native side will cordova.callbackSuccess or cordova.callbackError,
 * depending upon the result of the action.
 *
 * @param {Function} success    The success callback
 * @param {Function} fail       The fail callback
 * @param {String} service      The name of the service to use
 * @param {String} action       Action to be run in cordova
 * @param {String[]} [args]     Zero or more arguments to pass to the method
 */
module.exports = function (success, fail, service, action, args) {
    if (plugins[service] && plugins[service][action]) {
        return plugins[service][action](args, success, fail);
    }
    return exec(success, fail, service, action, args);
};

});

// file: lib/common/modulemapper.js
define("cordova/modulemapper", function(require, exports, module) {

var builder = require('cordova/builder'),
    moduleMap = define.moduleMap,
    symbolList,
    deprecationMap;

exports.reset = function() {
    symbolList = [];
    deprecationMap = {};
};

function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
    if (!(moduleName in moduleMap)) {
        throw new Error('Module ' + moduleName + ' does not exist.');
    }
    symbolList.push(strategy, moduleName, symbolPath);
    if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
    }
}

// Note: Android 2.3 does have Function.bind().
exports.clobbers = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
};

exports.merges = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
};

exports.defaults = function(moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
};

function prepareNamespace(symbolPath, context) {
    if (!symbolPath) {
        return context;
    }
    var parts = symbolPath.split('.');
    var cur = context;
    for (var i = 0, part; part = parts[i]; ++i) {
        cur = cur[part] = cur[part] || {};
    }
    return cur;
}

exports.mapModules = function(context) {
    var origSymbols = {};
    context.CDV_origSymbols = origSymbols;
    for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf('.');
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);

        var module = require(moduleName);
        var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];

        if (strategy == 'm' && target) {
            builder.recursiveMerge(target, module);
        } else if ((strategy == 'd' && !target) || (strategy != 'd')) {
            if (!(symbolPath in origSymbols)) {
                origSymbols[symbolPath] = target;
            }
            builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
    }
};

exports.getOriginalSymbol = function(context, symbolPath) {
    var origSymbols = context.CDV_origSymbols;
    if (origSymbols && (symbolPath in origSymbols)) {
        return origSymbols[symbolPath];
    }
    var parts = symbolPath.split('.');
    var obj = context;
    for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
    }
    return obj;
};

exports.loadMatchingModules = function(matchingRegExp) {
    for (var k in moduleMap) {
        if (matchingRegExp.exec(k)) {
            require(k);
        }
    }
};

exports.reset();


});

// file: lib/blackberry10/platform.js
define("cordova/platform", function(require, exports, module) {

module.exports = {
    id: "blackberry10",
    initialize: function() {
        var modulemapper = require('cordova/modulemapper'),
            addDocumentEventListener = document.addEventListener;

        modulemapper.loadMatchingModules(/cordova.*\/symbols$/);
        modulemapper.loadMatchingModules(new RegExp('cordova/blackberry10/.*bbsymbols$'));

        modulemapper.clobbers('cordova/plugin/blackberry10/vibrate', 'navigator.notification.vibrate');
        modulemapper.clobbers('cordova/plugin/File', 'File');
        modulemapper.merges('cordova/plugin/blackberry10/compass', 'navigator.compass');

        modulemapper.mapModules(window);

        //override to pass online/offline events to window
        document.addEventListener = function (type) {
            if (type === "online" || type === "offline") {
                window.addEventListener.apply(window, arguments);
            } else {
                addDocumentEventListener.apply(document, arguments);
            }
        };
    }
};

});

// file: lib/blackberry10/plugin/DirectoryEntry.js
define("cordova/plugin/DirectoryEntry", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    Entry = require('cordova/plugin/Entry'),
    FileError = require('cordova/plugin/FileError'),
    DirectoryReader = require('cordova/plugin/DirectoryReader'),
    fileUtils = require('cordova/plugin/blackberry10/fileUtils'),
    DirectoryEntry = function (name, fullPath) {
        DirectoryEntry.__super__.constructor.call(this, false, true, name, fullPath);
    };

utils.extend(DirectoryEntry, Entry);

DirectoryEntry.prototype.createReader = function () {
    return new DirectoryReader(this.fullPath);
};

DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
    argscheck.checkArgs('sOFF', 'DirectoryEntry.getDirectory', arguments);
    this.nativeEntry.getDirectory(path, options, function (entry) {
        successCallback(fileUtils.createEntry(entry));
    }, errorCallback);
};

DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'DirectoryEntry.removeRecursively', arguments);
    this.nativeEntry.removeRecursively(successCallback, errorCallback);
};

DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
    argscheck.checkArgs('sOFF', 'DirectoryEntry.getFile', arguments);
    this.nativeEntry.getFile(path, options, function (entry) {
        successCallback(fileUtils.createEntry(entry));
    }, errorCallback);
};

module.exports = DirectoryEntry;

});

// file: lib/blackberry10/plugin/DirectoryReader.js
define("cordova/plugin/DirectoryReader", function(require, exports, module) {

var FileError = require('cordova/plugin/FileError'),
    fileUtils = require('cordova/plugin/blackberry10/fileUtils');

function DirectoryReader(path) {
    this.path = path;
}

DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
    var win = typeof successCallback !== 'function' ? null : function(result) {
            var retVal = [];
            for (var i=0; i<result.length; i++) {
                retVal.push(fileUtils.createEntry(result[i]));
            }
            successCallback(retVal);
        },
        fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
    fileUtils.getEntryForURI(this.path, function (entry) {
        entry.nativeEntry.createReader().readEntries(win, fail);
    }, function () {
        fail(FileError.NOT_FOUND_ERR);
    });
};

module.exports = DirectoryReader;

});

// file: lib/blackberry10/plugin/Entry.js
define("cordova/plugin/Entry", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    FileError = require('cordova/plugin/FileError'),
    Metadata = require('cordova/plugin/Metadata'),
    fileUtils = require('cordova/plugin/blackberry10/fileUtils');

function Entry(isFile, isDirectory, name, fullPath, fileSystem) {
    this.isFile = !!isFile;
    this.isDirectory = !!isDirectory;
    this.name = name || '';
    this.fullPath = fullPath || '';
    this.filesystem = fileSystem || null;
}

Entry.prototype.getMetadata = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'Entry.getMetadata', arguments);
    var success = function(lastModified) {
        var metadata = new Metadata(lastModified);
        if (typeof successCallback === 'function') {
            successCallback(metadata);
        }
    };
    this.nativeEntry.getMetadata(success, errorCallback);
};

Entry.prototype.setMetadata = function(successCallback, errorCallback, metadataObject) {
    argscheck.checkArgs('FFO', 'Entry.setMetadata', arguments);
    errorCallback("Not supported by platform");
};

Entry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    argscheck.checkArgs('oSFF', 'Entry.moveTo', arguments);
    var srcPath = this.fullPath,
        name = newName || this.name,
        success = function(entry) {
            if (entry) {
                if (typeof successCallback === 'function') {
                    successCallback(fileUtils.createEntry(entry));
                }
            }
            else {
                if (typeof errorCallback === 'function') {
                    errorCallback(new FileError(FileError.NOT_FOUND_ERR));
                }
            }
        };
    this.nativeEntry.moveTo(parent.nativeEntry, newName, success, errorCallback);
};


Entry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    argscheck.checkArgs('oSFF', 'Entry.copyTo', arguments);
    var srcPath = this.fullPath,
        name = newName || this.name,
        success = function(entry) {
            if (entry) {
                if (typeof successCallback === 'function') {
                    successCallback(fileUtils.createEntry(entry));
                }
            }
            else {
                if (typeof errorCallback === 'function') {
                    errorCallback(new FileError(FileError.NOT_FOUND_ERR));
                }
            }
        };
    this.nativeEntry.copyTo(parent.nativeEntry, newName, success, errorCallback);
};

Entry.prototype.toURL = function() {
    return this.fullPath;
};

Entry.prototype.toURI = function(mimeType) {
    console.log("DEPRECATED: Update your code to use 'toURL'");
    return this.toURL();
};

Entry.prototype.remove = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'Entry.remove', arguments);
    this.nativeEntry.remove(successCallback, errorCallback);
};

Entry.prototype.getParent = function(successCallback, errorCallback) {
    argscheck.checkArgs('FF', 'Entry.getParent', arguments);
    var win = successCallback && function(result) {
        successCallback(fileUtils.createEntry(result));
    };
    this.nativeEntry.getParent(win, errorCallback);
};

module.exports = Entry;

});

// file: lib/blackberry10/plugin/FileEntry.js
define("cordova/plugin/FileEntry", function(require, exports, module) {

var utils = require('cordova/utils'),
    Entry = require('cordova/plugin/Entry'),
    FileWriter = require('cordova/plugin/FileWriter'),
    File = require('cordova/plugin/File'),
    FileError = require('cordova/plugin/FileError'),
    FileEntry = function (name, fullPath) {
        FileEntry.__super__.constructor.apply(this, [true, false, name, fullPath]);
    };

utils.extend(FileEntry, Entry);

FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
    this.file(function (file) {
        successCallback(new FileWriter(file));
    }, errorCallback);
};

FileEntry.prototype.file = function(successCallback, errorCallback) {
    var fullPath = this.fullPath,
        success = function (file) {
            successCallback(new File(file.name, fullPath, file.type, file.lastModifiedDate, file.size));
        };
    this.nativeEntry.file(success, errorCallback);
};

module.exports = FileEntry;

});

// file: lib/blackberry10/plugin/FileReader.js
define("cordova/plugin/FileReader", function(require, exports, module) {

var origFileReader = window.FileReader,
    fileUtils = require('cordova/plugin/blackberry10/fileUtils'),
    utils = require('cordova/utils');

var FileReader = function() {
    this.nativeReader = new origFileReader();
};

utils.defineGetter(FileReader.prototype, 'readyState', function() {
    return this.nativeReader.readyState;
});

utils.defineGetter(FileReader.prototype, 'error', function() {
    return this.nativeReader.error;
});

utils.defineGetter(FileReader.prototype, 'result', function() {
    return this.nativeReader.result;
});

function defineEvent(eventName) {
    utils.defineGetterSetter(FileReader.prototype, eventName, function() {
        return this.nativeReader[eventName] || null;
    }, function(value) {
        this.nativeReader[eventName] = value;
    });
}

defineEvent('onabort');
defineEvent('onerror');
defineEvent('onload');
defineEvent('onloadend');
defineEvent('onloadstart');
defineEvent('onprogress');

FileReader.prototype.abort = function() {
    return this.nativeReader.abort();
};

function read(method, context, file, encoding) {
    if (file.fullPath) {
         fileUtils.getEntryForURI(file.fullPath, function (entry) {
            entry.nativeEntry.file(function (nativeFile) {
                context.nativeReader[method].call(context.nativeReader, nativeFile, encoding);
            }, context.onerror);
        }, context.onerror);
    } else {
        context.nativeReader[method](file, encoding);
    }
}

FileReader.prototype.readAsText = function(file, encoding) {
    read("readAsText", this, file, encoding);
};

FileReader.prototype.readAsDataURL = function(file) {
    read("readAsDataURL", this, file);
};

FileReader.prototype.readAsBinaryString = function(file) {
    read("readAsBinaryString", this, file);
};

FileReader.prototype.readAsArrayBuffer = function(file) {
    read("readAsArrayBuffer", this, file);
};

window.FileReader = FileReader;
module.exports = FileReader;

});

// file: lib/blackberry10/plugin/FileSystem.js
define("cordova/plugin/FileSystem", function(require, exports, module) {

module.exports = function(name, root) {
    this.name = name || null;
    if (root) {
        this.root = root;
    }
};

});

// file: lib/blackberry10/plugin/FileTransfer.js
define("cordova/plugin/FileTransfer", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec'),
    FileTransferError = require('cordova/plugin/FileTransferError');

function getBasicAuthHeader(urlString) {
    var header =  null;

    if (window.btoa) {
        // parse the url using the Location object
        var url = document.createElement('a');
        url.href = urlString;

        var credentials = null;
        var protocol = url.protocol + "//";
        var origin = protocol + url.host;

        // check whether there are the username:password credentials in the url
        if (url.href.indexOf(origin) !== 0) { // credentials found
            var atIndex = url.href.indexOf("@");
            credentials = url.href.substring(protocol.length, atIndex);
        }

        if (credentials) {
            var authHeader = "Authorization";
            var authHeaderValue = "Basic " + window.btoa(credentials);

            header = {
                name : authHeader,
                value : authHeaderValue
            };
        }
    }

    return header;
}

var idCounter = 0;

/**
 * FileTransfer uploads a file to a remote server.
 * @constructor
 */
var FileTransfer = function() {
    this._id = ++idCounter;
    this.onprogress = null; // optional callback
};

/**
* Given an absolute file path, uploads a file on the device to a remote server
* using a multipart HTTP request.
* @param filePath {String}           Full path of the file on the device
* @param server {String}             URL of the server to receive the file
* @param successCallback (Function}  Callback to be invoked when upload has completed
* @param errorCallback {Function}    Callback to be invoked upon error
* @param options {FileUploadOptions} Optional parameters such as file name and mimetype
* @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
*/
FileTransfer.prototype.upload = function(filePath, server, successCallback, errorCallback, options, trustAllHosts) {
    argscheck.checkArgs('ssFFO*', 'FileTransfer.upload', arguments);
    // check for options
    var fileKey = null;
    var fileName = null;
    var mimeType = null;
    var params = null;
    var chunkedMode = true;
    var headers = null;
    var httpMethod = null;
    var basicAuthHeader = getBasicAuthHeader(server);
    if (basicAuthHeader) {
        options = options || {};
        options.headers = options.headers || {};
        options.headers[basicAuthHeader.name] = basicAuthHeader.value;
    }

    if (options) {
        fileKey = options.fileKey;
        fileName = options.fileName;
        mimeType = options.mimeType;
        headers = options.headers;
        httpMethod = options.httpMethod || "POST";
        if (httpMethod.toUpperCase() == "PUT"){
            httpMethod = "PUT";
        } else {
            httpMethod = "POST";
        }
        if (options.chunkedMode !== null || typeof options.chunkedMode != "undefined") {
            chunkedMode = options.chunkedMode;
        }
        if (options.params) {
            params = options.params;
        }
        else {
            params = {};
        }
    }

    var fail = errorCallback && function(e) {
        var error = new FileTransferError(e.code, e.source, e.target, e.http_status, e.body);
        errorCallback(error);
    };

    var self = this;
    var win = function(result) {
        if (typeof result.lengthComputable != "undefined") {
            if (self.onprogress) {
                self.onprogress(result);
            }
        } else {
            successCallback && successCallback(result);
        }
    };
    exec(win, fail, 'FileTransfer', 'upload', [filePath, server, fileKey, fileName, mimeType, params, trustAllHosts, chunkedMode, headers, this._id, httpMethod]);
};

/**
 * Downloads a file form a given URL and saves it to the specified directory.
 * @param source {String}          URL of the server to receive the file
 * @param target {String}         Full path of the file on the device
 * @param successCallback (Function}  Callback to be invoked when upload has completed
 * @param errorCallback {Function}    Callback to be invoked upon error
 * @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
 * @param options {FileDownloadOptions} Optional parameters such as headers
 */
FileTransfer.prototype.download = function(source, target, successCallback, errorCallback, trustAllHosts, options) {
    argscheck.checkArgs('ssFF*', 'FileTransfer.download', arguments);
    var self = this;

    var basicAuthHeader = getBasicAuthHeader(source);
    if (basicAuthHeader) {
        options = options || {};
        options.headers = options.headers || {};
        options.headers[basicAuthHeader.name] = basicAuthHeader.value;
    }

    var headers = null;
    if (options) {
        headers = options.headers || null;
    }

    var win = function(result) {
        if (typeof result.lengthComputable != "undefined") {
            if (self.onprogress) {
                return self.onprogress(result);
            }
        } else if (successCallback) {
            successCallback(result);
        }
    };

    var fail = errorCallback && function(e) {
        var error = new FileTransferError(e.code, e.source, e.target, e.http_status, e.body);
        errorCallback(error);
    };

    exec(win, fail, 'FileTransfer', 'download', [source, target, trustAllHosts, this._id, headers]);
};

/**
 * Aborts the ongoing file transfer on this object. The original error
 * callback for the file transfer will be called if necessary.
 */
FileTransfer.prototype.abort = function() {
    exec(null, null, 'FileTransfer', 'abort', [this._id]);
};

module.exports = FileTransfer;

});

// file: lib/blackberry10/plugin/FileWriter.js
define("cordova/plugin/FileWriter", function(require, exports, module) {

var FileError = require('cordova/plugin/FileError'),
    ProgressEvent = require('cordova/plugin/ProgressEvent'),
    fileUtils = require('cordova/plugin/blackberry10/fileUtils'),
    utils = require('cordova/utils');

function FileWriter (file) {
    var that = this;
    this.file = file;
    this.events = {};
    this.pending = [];
    fileUtils.getEntryForURI(file.fullPath, function (entry) {
        entry.nativeEntry.createWriter(function (writer) {
            var i,
                event;
            that.nativeWriter = writer;
            for (event in that.events) {
                if (that.events.hasOwnProperty(event)) {
                    that.nativeWriter[event] = that.events[event];
                }
            }
            for (i = 0; i < that.pending.length; i++) {
                that.pending[i]();
            }
        });
    });
    this.events = {};
    this.pending = [];
}

utils.defineGetter(FileWriter.prototype, 'error', function() {
    return this.nativeWriter ? this.nativeWriter.error : null;
});

utils.defineGetter(FileWriter.prototype, 'fileName', function() {
    return this.nativeWriter ? this.nativeWriter.fileName : this.file.name;
});

utils.defineGetter(FileWriter.prototype, 'length', function() {
    return this.nativeWriter ? this.nativeWriter.length : this.file.size;
});

utils.defineGetter(FileWriter.prototype, 'position', function() {
    return this.nativeWriter ? this.nativeWriter.position : 0;
});

utils.defineGetter(FileWriter.prototype, 'readyState', function() {
    return this.nativeWriter ? this.nativeWriter.readyState : 0;
});

function defineEvent(eventName) {
    utils.defineGetterSetter(FileWriter.prototype, eventName, function() {
        return this.nativeWriter ? this.nativeWriter[eventName] || null : this.events[eventName] || null;
    }, function(value) {
        if (this.nativeWriter) {
            this.nativeWriter[eventName] = value;
        }
        else {
            this.events[eventName] = value;
        }
    });
}

defineEvent('onabort');
defineEvent('onerror');
defineEvent('onprogress');
defineEvent('onwrite');
defineEvent('onwriteend');
defineEvent('onwritestart');

FileWriter.prototype.abort = function() {
    this.nativeWriter.abort();
};

FileWriter.prototype.write = function(text) {
    var that = this,
        op = function () {
            that.nativeWriter.write(new Blob([text]));
        };
    this.nativeWriter ? op() : this.pending.push(op);

};

FileWriter.prototype.seek = function(offset) {
    var that = this,
        op = function () {
            that.nativeWriter.seek(offset);
        };
    this.nativeWriter ? op() : this.pending.push(op);
};

FileWriter.prototype.truncate = function(size) {
    var that = this,
        op = function () {
            that.nativeWriter.truncate(size);
        };
    this.nativeWriter ? op() : this.pending.push(op);
};

module.exports = FileWriter;

});

// file: lib/blackberry10/plugin/blackberry10/InAppBrowser.js
define("cordova/plugin/blackberry10/InAppBrowser", function(require, exports, module) {

var cordova = require('cordova'),
    modulemapper = require('cordova/modulemapper'),
    origOpen = modulemapper.getOriginalSymbol(window, 'open'),
    browser = {
        close: function () { } //dummy so we don't have to check for undefined
    };

var navigate = {
    "_blank": function (url, whitelisted) {
        return origOpen(url, "_blank");
    },

    "_self": function (url, whitelisted) {
        if (whitelisted) {
            window.location.href = url;
            return window;
        }
        else {
            return origOpen(url, "_blank");
        }
    },

    "_system": function (url, whitelisted) {
        blackberry.invoke.invoke({
            target: "sys.browser",
            uri: url
        }, function () {}, function () {});

        return {
            close: function () { }
        };
    }
};

module.exports = {
    open: function (args, win, fail) {
        var url = args[0],
            target = args[1] || '_self',
            a = document.createElement('a');

        //Make all URLs absolute
        a.href = url;
        url = a.href;

        switch (target) {
        case '_self':
        case '_system':
        case '_blank':
            break;
        default:
            target = '_blank';
            break;
        }

        cordova.exec(function (whitelisted) {
            browser = navigate[target](url, whitelisted);
        }, fail, "org.apache.cordova", "isWhitelisted", [url], true);

        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "" };
    },
    close: function (args, win, fail) {
        browser.close();
        return { "status" : cordova.callbackStatus.OK, "message" : "" };
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/compass.js
define("cordova/plugin/blackberry10/compass", function(require, exports, module) {

var exec = require('cordova/exec'),
    utils = require('cordova/utils'),
    CompassHeading = require('cordova/plugin/CompassHeading'),
    CompassError = require('cordova/plugin/CompassError'),
    timers = {},
    listeners = [],
    heading = null,
    running = false,
    start = function () {
        exec(function (result) {
            heading = new CompassHeading(result.magneticHeading, result.trueHeading, result.headingAccuracy, result.timestamp);
            listeners.forEach(function (l) {
                l.win(heading);
            });
        }, function (e) {
            listeners.forEach(function (l) {
                l.fail(e);
            });
        },
        "Compass", "start", []);
        running = true;
    },
    stop = function () {
        exec(null, null, "Compass", "stop", []);
        running = false;
    },
    createCallbackPair = function (win, fail) {
        return {win:win, fail:fail};
    },
    removeListeners = function (l) {
        var idx = listeners.indexOf(l);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) {
                stop();
            }
        }
    },
    compass = {
        /**
         * Asynchronously acquires the current heading.
         * @param {Function} successCallback The function to call when the heading
         * data is available
         * @param {Function} errorCallback The function to call when there is an error
         * getting the heading data.
         * @param {CompassOptions} options The options for getting the heading data (not used).
         */
        getCurrentHeading:function(successCallback, errorCallback, options) {
            if (typeof successCallback !== "function") {
                throw "getCurrentHeading must be called with at least a success callback function as first parameter.";
            }

            var p;
            var win = function(a) {
                removeListeners(p);
                successCallback(a);
            };
            var fail = function(e) {
                removeListeners(p);
                errorCallback(e);
            };

            p = createCallbackPair(win, fail);
            listeners.push(p);

            if (!running) {
                start();
            }
        },

        /**
         * Asynchronously acquires the heading repeatedly at a given interval.
         * @param {Function} successCallback The function to call each time the heading
         * data is available
         * @param {Function} errorCallback The function to call when there is an error
         * getting the heading data.
         * @param {HeadingOptions} options The options for getting the heading data
         * such as timeout and the frequency of the watch. For iOS, filter parameter
         * specifies to watch via a distance filter rather than time.
         */
        watchHeading:function(successCallback, errorCallback, options) {
            var frequency = (options !== undefined && options.frequency !== undefined) ? options.frequency : 100;
            var filter = (options !== undefined && options.filter !== undefined) ? options.filter : 0;

            // successCallback required
            if (typeof successCallback !== "function") {
              console.log("Compass Error: successCallback is not a function");
              return;
            }

            // errorCallback optional
            if (errorCallback && (typeof errorCallback !== "function")) {
              console.log("Compass Error: errorCallback is not a function");
              return;
            }
            // Keep reference to watch id, and report heading readings as often as defined in frequency
            var id = utils.createUUID();

            var p = createCallbackPair(function(){}, function(e) {
                removeListeners(p);
                errorCallback(e);
            });
            listeners.push(p);

            timers[id] = {
                timer:window.setInterval(function() {
                    if (heading) {
                        successCallback(heading);
                    }
                }, frequency),
                listeners:p
            };

            if (running) {
                // If we're already running then immediately invoke the success callback
                // but only if we have retrieved a value, sample code does not check for null ...
                if(heading) {
                    successCallback(heading);
                }
            } else {
                start();
            }

            return id;
        },

        /**
         * Clears the specified heading watch.
         * @param {String} watchId The ID of the watch returned from #watchHeading.
         */
        clearWatch:function(id) {
            // Stop javascript timer & remove from timer list
            if (id && timers[id]) {
                window.clearInterval(timers[id].timer);
                removeListeners(timers[id].listeners);
                delete timers[id];
            }
        }
    };

module.exports = compass;

});

// file: lib/blackberry10/plugin/blackberry10/exception.js
define("cordova/plugin/blackberry10/exception", function(require, exports, module) {

module.exports = {

    types: {
        Application: "Application",
        ArgumentLength: "ArgumentLength",
        ArgumentType: "ArgumentType",
        Argument: "Argument",
        NotificationType: "NotificationType",
        NotificationStateType: "NotificationStateType",
        DomObjectNotFound: "DomObjectNotFound",
        MethodNotImplemented: "MethodNotImplemented",
        InvalidState: "InvalidState",
        ApplicationState: "ApplicationState"
    },

    handle: function handle(exception, reThrow) {
        reThrow = reThrow || false;

        var eMsg = exception.message || "exception caught!",
        msg = eMsg + "\n\n" + (exception.stack || "*no stack provided*") + "\n\n";

        console.error(msg);

        if (reThrow) {
            throw exception;
        }
    },

    raise: function raise(exceptionType, message, customExceptionObject) {
        var obj = customExceptionObject || {
                type: "",
                message: "",

                toString: function () {
                    var result = this.name + ': "' + this.message + '"';

                    if (this.stack) {
                        result += "\n" + this.stack;
                    }
                    return result;
                }
            };

        message = message || "";

        obj.name = exceptionType;
        obj.type = exceptionType;
        // TODO: include the exception objects original message if exists
        obj.message = message;

        throw obj;
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/fileTransfer.js
define("cordova/plugin/blackberry10/fileTransfer", function(require, exports, module) {

/*global Blob:false */
var cordova = require('cordova'),
    nativeResolveLocalFileSystemURI = function(uri, success, fail) {
        if (uri.substring(0,11) !== "filesystem:") {
            uri = "filesystem:" + uri;
        }
        resolveLocalFileSystemURI(uri, success, fail);
    },
    xhr;

function getParentPath(filePath) {
    var pos = filePath.lastIndexOf('/');
    return filePath.substring(0, pos + 1);
}

function getFileName(filePath) {
    var pos = filePath.lastIndexOf('/');
    return filePath.substring(pos + 1);
}

function checkURL(url) {
    return url.indexOf(' ') === -1 ?  true : false;
}

module.exports = {
    abort: function () {
        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "async"};
    },

    upload: function(args, win, fail) {
        var filePath = args[0],
            server = args[1],
            fileKey = args[2],
            fileName = args[3],
            mimeType = args[4],
            params = args[5],
            /*trustAllHosts = args[6],*/
            chunkedMode = args[7],
            headers = args[8];

        if (!checkURL(server)) {
            fail(new FileTransferError(FileTransferError.INVALID_URL_ERR, server, filePath));
        }

        nativeResolveLocalFileSystemURI(filePath, function(entry) {
            entry.file(function(file) {
                function uploadFile(blobFile) {
                    var fd = new FormData();

                    fd.append(fileKey, blobFile, fileName);
                    for (var prop in params) {
                        if(params.hasOwnProperty(prop)) {
                            fd.append(prop, params[prop]);
                        }
                    }

                    xhr = new XMLHttpRequest();
                    xhr.open("POST", server);
                    xhr.onload = function(evt) {
                        if (xhr.status === 200) {
                            var result = new FileUploadResult();
                            result.bytesSent = file.size;
                            result.responseCode = xhr.status;
                            result.response = xhr.response;
                            win(result);
                        } else if (xhr.status === 404) {
                            fail(new FileTransferError(FileTransferError.INVALID_URL_ERR, server, filePath, xhr.status, xhr.response));
                        } else {
                            fail(new FileTransferError(FileTransferError.CONNECTION_ERR, server, filePath, xhr.status, xhr.response));
                        }
                    };
                    xhr.ontimeout = function(evt) {
                        fail(new FileTransferError(FileTransferError.CONNECTION_ERR, server, filePath, xhr.status, xhr.response));
                    };
                    xhr.onerror = function () {
                        fail(new FileTransferError(FileTransferError.CONNECTION_ERR, server, filePath, this.status, xhr.response));
                    };
                    xhr.onprogress = function (evt) {
                        win(evt);
                    };

                    for (var header in headers) {
                        if (headers.hasOwnProperty(header)) {
                            xhr.setRequestHeader(header, headers[header]);
                        }
                    }

                    xhr.send(fd);
                }

                var bytesPerChunk;
                if (chunkedMode === true) {
                    bytesPerChunk = 1024 * 1024; // 1MB chunk sizes.
                } else {
                    bytesPerChunk = file.size;
                }
                var start = 0;
                var end = bytesPerChunk;
                while (start < file.size) {
                    var chunk = file.slice(start, end, mimeType);
                    uploadFile(chunk);
                    start = end;
                    end = start + bytesPerChunk;
                }
            }, function(error) {
                fail(new FileTransferError(FileTransferError.FILE_NOT_FOUND_ERR, server, filePath));
            });
        }, function(error) {
            fail(new FileTransferError(FileTransferError.FILE_NOT_FOUND_ERR, server, filePath));
        });

        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "async"};
    },

    download: function (args, win, fail) {
        var source = args[0],
            target = args[1],
            headers = args[4],
            fileWriter;

        if (!checkURL(source)) {
            fail(new FileTransferError(FileTransferError.INVALID_URL_ERR, source, target));
        }

        xhr = new XMLHttpRequest();

        function writeFile(entry) {
            entry.createWriter(function (writer) {
                fileWriter = writer;
                fileWriter.onwriteend = function (evt) {
                    if (!evt.target.error) {
                        win(entry);
                    } else {
                        fail(evt.target.error);
                    }
                };
                fileWriter.onerror = function (evt) {
                    fail(evt.target.error);
                };
                fileWriter.write(new Blob([xhr.response]));
            }, function (error) {
                fail(error);
            });
        }

        xhr.onerror = function (e) {
            fail(new FileTransferError(FileTransferError.CONNECTION_ERR, source, target, xhr.status, xhr.response));
        };

        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200 && xhr.response) {
                    nativeResolveLocalFileSystemURI(getParentPath(target), function (dir) {
                        dir.getFile(getFileName(target), {create: true}, writeFile, function (error) {
                            fail(new FileTransferError(FileTransferError.FILE_NOT_FOUND_ERR, source, target, xhr.status, xhr.response));
                        });
                    }, function (error) {
                        fail(new FileTransferError(FileTransferError.FILE_NOT_FOUND_ERR, source, target, xhr.status, xhr.response));
                    });
                } else if (xhr.status === 404) {
                    fail(new FileTransferError(FileTransferError.INVALID_URL_ERR, source, target, xhr.status, xhr.response));
                } else {
                    fail(new FileTransferError(FileTransferError.CONNECTION_ERR, source, target, xhr.status, xhr.response));
                }
            }
        };
        xhr.onprogress = function (evt) {
            win(evt);
        };

        xhr.open("GET", source, true);
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }
        xhr.send();
        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "async"};
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/fileUtils.js
define("cordova/plugin/blackberry10/fileUtils", function(require, exports, module) {

function convertPath(url) {
    return decodeURI(url).substring(11).replace(/\/$/, '');
}

module.exports = {

    createEntry: function (entry) {
        var cordovaEntry;
        if (entry.isFile) {
            cordovaEntry = new window.FileEntry(entry.name, convertPath(entry.toURL()));
        } else {
            cordovaEntry = new window.DirectoryEntry(entry.name, convertPath(entry.toURL()));
        }
        cordovaEntry.nativeEntry = entry;
        return cordovaEntry;
    },

    getEntryForURI: function (uri, success, fail) {
        //TODO: account for local vs file system
        window.resolveLocalFileSystemURI(uri, success, fail);
    },

    getFileSystemName: function (fs) {
        return (fs.name.indexOf('Persistent') != -1) ? 'persistent' : 'temporary';
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/magnetometer.js
define("cordova/plugin/blackberry10/magnetometer", function(require, exports, module) {

var cordova = require('cordova'),
    callback;

module.exports = {
    start: function (args, win, fail) {
        window.removeEventListener("deviceorientation", callback);
        callback = function (orientation) {
            var heading = 360 - orientation.alpha;
            win({
                magneticHeading: heading,
                trueHeading: heading,
                headingAccuracy: 0,
                timestamp: orientation.timeStamp
            });
        };

        window.addEventListener("deviceorientation", callback);
        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" };
    },
    stop: function (args, win, fail) {
        window.removeEventListener("deviceorientation", callback);
        return { "status" : cordova.callbackStatus.OK, "message" : "removed" };
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/media.js
define("cordova/plugin/blackberry10/media", function(require, exports, module) {

var cordova = require('cordova'),
    audioObjects = {};

module.exports = {
    create: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            src = args[1];

        if (typeof src == "undefined"){
            audioObjects[id] = new Audio();
        } else {
            audioObjects[id] = new Audio(src);
        }

        return {"status" : 1, "message" : "Audio object created" };
    },
    startPlayingAudio: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (args.length === 1 || typeof args[1] == "undefined" ) {
            return {"status" : 9, "message" : "Media source argument not found"};
        }

        if (audio) {
            audio.pause();
            audioObjects[id] = undefined;
        }

        audio = audioObjects[id] = new Audio(args[1]);
        audio.play();
        return {"status" : 1, "message" : "Audio play started" };
    },
    stopPlayingAudio: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        audio.pause();
        audioObjects[id] = undefined;

        return {"status" : 1, "message" : "Audio play stopped" };
    },
    seekToAudio: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            result = {"status" : 2, "message" : "Audio Object has not been initialized"};
        } else if (args.length === 1) {
            result = {"status" : 9, "message" : "Media seek time argument not found"};
        } else {
            try {
                audio.currentTime = args[1];
            } catch (e) {
                console.log('Error seeking audio: ' + e);
                return {"status" : 3, "message" : "Error seeking audio: " + e};
            }

            result = {"status" : 1, "message" : "Seek to audio succeeded" };
        }
        return result;
    },
    pausePlayingAudio: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        audio.pause();

        return {"status" : 1, "message" : "Audio paused" };
    },
    getCurrentPositionAudio: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        return {"status" : 1, "message" : audio.currentTime };
    },
    getDuration: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (!audio) {
            return {"status" : 2, "message" : "Audio Object has not been initialized"};
        }

        return {"status" : 1, "message" : audio.duration };
    },
    startRecordingAudio: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        if (args.length <= 1) {
            return {"status" : 9, "message" : "Media start recording, insufficient arguments"};
        }

        blackberry.media.microphone.record(args[1], win, fail);
        return { "status" : cordova.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" };
    },
    stopRecordingAudio: function (args, win, fail) {
    },
    release: function (args, win, fail) {
        if (!args.length) {
            return {"status" : 9, "message" : "Media Object id was not sent in arguments"};
        }

        var id = args[0],
            audio = audioObjects[id],
            result;

        if (audio) {
            if(audio.src !== ""){
                audio.src = undefined;
            }
            audioObjects[id] = undefined;
            //delete audio;
        }

        result = {"status" : 1, "message" : "Media resources released"};

        return result;
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/utils.js
define("cordova/plugin/blackberry10/utils", function(require, exports, module) {

var self,
    exception = require('cordova/plugin/blackberry10/exception');

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

self = module.exports = {
    validateNumberOfArguments: function (lowerBound, upperBound, numberOfArguments, customExceptionType, customExceptionMessage, customExceptionObject) {

        customExceptionMessage = customExceptionMessage || "";

        if (arguments.length < 3 || arguments.length > 6) {
            exception.raise(exception.types.Argument, "Wrong number of arguments when calling: validateNumberOfArguments()");
        }

        if (isNaN(lowerBound) && isNaN(upperBound) && isNaN(numberOfArguments)) {
            exception.raise(exception.types.ArgumentType, "(validateNumberOfArguments) Arguments are not numbers");
        }

        lowerBound = parseInt(lowerBound, 10);
        upperBound = parseInt(upperBound, 10);
        numberOfArguments = parseInt(numberOfArguments, 10);

        if (numberOfArguments < lowerBound || numberOfArguments > upperBound) {
            exception.raise((customExceptionType || exception.types.ArgumentLength), (customExceptionMessage + "\n\nWrong number of arguments"), customExceptionObject);
        }

    },

    validateArgumentType: function (arg, argType, customExceptionType, customExceptionMessage, customExceptionObject) {
        var invalidArg = false,
            msg;

        switch (argType) {
        case "array":
            if (!arg instanceof Array) {
                invalidArg = true;
            }
            break;
        case "date":
            if (!arg instanceof Date) {
                invalidArg = true;
            }
            break;
        case "integer":
            if (typeof arg === "number") {
                if (arg !== Math.floor(arg)) {
                    invalidArg = true;
                }
            }
            else {
                invalidArg = true;
            }
            break;
        default:
            if (typeof arg !== argType) {
                invalidArg = true;
            }
            break;
        }

        if (invalidArg) {
            msg = customExceptionMessage +  ("\n\nInvalid Argument type. argument: " + arg + " ==> was expected to be of type: " + argType);
            exception.raise((customExceptionType || exception.types.ArgumentType), msg, customExceptionObject);
        }
    },

    validateMultipleArgumentTypes: function (argArray, argTypeArray, customExceptionType, customExceptionMessage, customExceptionObject) {
        for (var i = 0; i < argArray.length; i++) {
            this.validateArgumentType(argArray[i], argTypeArray[i], customExceptionType, customExceptionMessage, customExceptionObject);
        }
    },

    arrayContains: function (array, obj) {
        var i = array.length;
        while (i--) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    },

    some: function (obj, predicate, scope) {
        if (obj instanceof Array) {
            return obj.some(predicate, scope);
        }
        else {
            var values = self.map(obj, predicate, scope);

            return self.reduce(values, function (some, value) {
                return value ? value : some;
            }, false);
        }
    },

    count: function (obj) {
        return self.sum(obj, function (total) {
            return 1;
        });
    },

    sum: function (obj, selector, scope) {
        var values = self.map(obj, selector, scope);
        return self.reduce(values, function (total, value) {
            return total + value;
        });
    },

    max: function (obj, selector, scope) {
        var values = self.map(obj, selector, scope);
        return self.reduce(values, function (max, value) {
            return max < value ? value : max;
        }, Number.MIN_VALUE);
    },

    min: function (obj, selector, scope) {
        var values = self.map(obj, selector, scope);
        return self.reduce(values, function (min, value) {
            return min > value ? value : min;
        }, Number.MAX_VALUE);
    },

    forEach: function (obj, action, scope) {
        if (obj instanceof Array) {
            return obj.forEach(action, scope);
        }
        else {
            self.map(obj, action, scope);
        }
    },

    filter: function (obj, predicate, scope) {
        if (obj instanceof Array) {
            return obj.filter(predicate, scope);
        }
        else {
            var result = [];
            self.forEach(obj, function (value, index) {
                if (predicate.apply(scope, [value, index])) {
                    result.push(value);
                }

            }, scope);

            return result;
        }
    },

    reduce: function (obj, func, init, scope) {
        var i,
            initial = init === undefined ? 0 : init,
            result = initial;


        if (obj instanceof Array) {
            return obj.reduce(func, initial);
        }
        else if (obj instanceof NamedNodeMap) {
            for (i = 0; i < obj.length; i++) {
                result = func.apply(scope, [result, obj[i], i]);
            }
        }
        else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    result = func.apply(scope, [result, obj[i], i]);
                }
            }
        }

        return result;

    },

    map: function (obj, func, scope) {
        var i,
            returnVal = null,
            result = [];

        if (obj instanceof Array) {
            return obj.map(func, scope);
        }
        else if (obj instanceof NamedNodeMap) {
            for (i = 0; i < obj.length; i++) {
                returnVal = func.apply(scope, [obj[i], i]);
                result.push(returnVal);
            }
        }
        else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    returnVal = func.apply(scope, [obj[i], i]);
                    result.push(returnVal);
                }
            }
        }

        return result;
    },

    series: function (tasks, callback) {

        var execute = function () {
            var args = [],
                task;

            if (tasks.length) {
                task = tasks.shift();
                args = args.concat(task.args).concat(execute);
                task.func.apply(this, args);
            }
            else {
                callback.func.apply(this, callback.args);
            }
        };

        execute();
    },

    regexSanitize: function (regexString) {
        return regexString.replace("^", "\\^")
                    .replace("$", "\\$")
                    .replace("(", "\\(")
                    .replace(")", "\\)")
                    .replace("<", "\\<")
                    .replace("[", "\\[")
                    .replace("{", "\\{")
                    .replace(/\\/, "\\\\")
                    .replace("|", "\\|")
                    .replace(">", "\\>")
                    .replace(".", "\\.")
                    .replace("*", "\\*")
                    .replace("+", "\\+")
                    .replace("?", "\\?");
    },

    find: function (comparison, collection, startInx, endInx, callback) {
        var results = [],
            compare = function (s, pattern) {

                if (typeof(s) !== "string" || pattern === null) {
                    return s === pattern;
                }

                var regex = pattern.replace(/\./g, "\\.")
                                   .replace(/\^/g, "\\^")
                                   .replace(/\*/g, ".*")
                                   .replace(/\\\.\*/g, "\\*");

                regex = "^".concat(regex, "$");

                return !!s.match(new RegExp(regex, "i"));
            };

        self.forEach(collection, function (c) {
            var match,
                fail = false;

            self.forEach(comparison, function (value, key) {
                if (!fail && value !== undefined) {

                    if (compare(c[key], value)) {
                        match = c;
                    }
                    else {
                        fail = true;
                        match = null;
                    }
                }
            });

            if (match) {
                results.push(match);
            }
        });

        if (callback) {
            if (startInx === undefined) {
                startInx = 0;
            }
            if (endInx === undefined) {
                endInx = results.length;
            }
            if (startInx === endInx) {
                endInx = startInx + 1;
            }

            callback.apply(null, [results.slice(startInx, endInx)]);
        }
    },

    mixin: function (mixin, to) {
        Object.getOwnPropertyNames(mixin).forEach(function (prop) {
            if (Object.hasOwnProperty.call(mixin, prop)) {
                Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(mixin, prop));
            }
        });
        return to;
    },

    copy: function (obj) {
        var i,
            newObj = (obj === null ? false : global.toString.call(obj) === "[object Array]") ? [] : {};

        if (typeof obj === 'number' ||
            typeof obj === 'string' ||
            typeof obj === 'boolean' ||
            obj === null ||
            obj === undefined) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj);
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i] && typeof obj[i] === "object") {
                    if (obj[i] instanceof Date) {
                        newObj[i] = obj[i];
                    }
                    else {
                        newObj[i] = self.copy(obj[i]);
                    }
                }
                else {
                    newObj[i] = obj[i];
                }
            }
        }

        return newObj;
    },

    startsWith : function (str, substr) {
        return str.indexOf(substr) === 0;
    },

    endsWith : function (str, substr) {
        return str.indexOf(substr, str.length - substr.length) !== -1;
    },

    parseUri : function (str) {
        var i, uri = {},
            key = [ "source", "scheme", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ],
            matcher = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(str);

        for (i = key.length - 1; i >= 0; i--) {
            uri[key[i]] = matcher[i] || "";
        }

        return uri;
    },

    // uri - output from parseUri
    isAbsoluteURI : function (uri) {
        if (uri && uri.source) {
            return uri.relative !== uri.source;
        }

        return false;
    },

    fileNameToImageMIME : function (fileName) {

        var extensionsToMIME = {},
            ext;

        extensionsToMIME.png = 'image/png';
        extensionsToMIME.jpg = 'image/jpeg';
        extensionsToMIME.jpe = 'image/jpeg';
        extensionsToMIME.jpeg = 'image/jpeg';
        extensionsToMIME.gif = 'image/gif';
        extensionsToMIME.bmp = 'image/bmp';
        extensionsToMIME.bm = 'image/bmp';
        extensionsToMIME.svg = 'image/svg+xml';
        extensionsToMIME.tif = 'image/tiff';
        extensionsToMIME.tiff = 'image/tiff';

        ext = fileName.split('.').pop();
        return extensionsToMIME[ext];
    },

    isLocalURI : function (uri) {
        return uri && uri.scheme && "local:///".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isFileURI : function (uri) {
        return uri && uri.scheme && "file://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isHttpURI : function (uri) {
        return uri && uri.scheme && "http://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isHttpsURI : function (uri) {
        return uri && uri.scheme && "https://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Checks if the specified uri starts with 'data:'
    isDataURI : function (uri) {
        return uri && uri.scheme && "data:".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    inNode : function () {
        return !!require.resolve;
    },

    requireWebview : function () {
        return require("./webview");
    },
    convertDataToBinary : function (data, dataEncoding) {
        var rawData,
            uint8Array,
            i;

        if (data) {
            if (dataEncoding.toLowerCase() === "base64") {
                rawData = window.atob(data);
            }
            else {
                rawData = data;
            }

            uint8Array = new Uint8Array(new ArrayBuffer(rawData.length));

            for (i = 0; i < uint8Array.length; i++) {
                uint8Array[i] = rawData.charCodeAt(i);
            }

            return uint8Array.buffer;
        }
    },
    getBlobWithArrayBufferAsData : function (data, dataEncoding) {
        var rawData,
            blobBuilderObj = new window.WebKitBlobBuilder();
        rawData = this.convertDataToBinary(data, dataEncoding);
        blobBuilderObj.append(rawData);

        return blobBuilderObj.getBlob("arraybuffer");
    },
    loadModule: function (module) {
        return require(module);
    },
    loadExtensionModule: function (extBasename, path) {
        var ext = require("./manifest")[extBasename];

        if (ext) {
            return require("../ext/" + ext.namespace + "/" + path);
        } else {
            return null;
        }
    },
    hasPermission: function (config, permission) {
        if (config && config.permissions && config.permissions.length) {
            return config.permissions.indexOf(permission) >= 0;
        }

        return false;
    },
    guid: function () {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },
    getURIPrefix: function () {
        return "http://localhost:8472/";
    },
    translatePath: function (path) {
        if (path.indexOf("local:///") === 0) {
            var sourceDir = window.qnx.webplatform.getApplication().getEnv("HOME"); //leading slashes need to be removed
            path = "file:///" + sourceDir.replace(/^\/*/, '') + "/../app/native/" + path.replace(/local:\/\/\//, '');
        }
        return path;
    },
    invokeInBrowser: function (url) {
        var request = {
            uri: url,
            target: "sys.browser"
        };
        window.qnx.webplatform.getApplication().invocation.invoke(request);
    },
    isPersonal: function () {
        return window.qnx.webplatform.getApplication().getEnv("PERIMETER") === "personal";
    },
    deepclone: function (obj) {
        var newObj = obj instanceof Array ? [] : {},
            key;

        if (typeof obj === 'number' ||
                typeof obj === 'string' ||
                typeof obj === 'boolean' ||
                obj === null ||
                obj === undefined) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj);
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] && typeof obj[key] === "object") {
                    newObj[key] = self.deepclone(obj[key]);
                } else {
                    newObj[key] = obj[key];
                }
            }
        }

        return newObj;
    }
};

});

// file: lib/blackberry10/plugin/blackberry10/vibrate.js
define("cordova/plugin/blackberry10/vibrate", function(require, exports, module) {

module.exports = function (time) {
    var proto = Object.getPrototypeOf(navigator);

    if (proto && proto.vibrate) {
        proto.vibrate(time);
    } else if (proto && proto.webkitVibrate) {
        //Older OS contain webkit prefix
        proto.webkitVibrate(time);
    }
};

});

// file: lib/common/plugin/console-via-logger.js
define("cordova/plugin/console-via-logger", function(require, exports, module) {

//------------------------------------------------------------------------------

var logger = require("cordova/plugin/logger");
var utils  = require("cordova/utils");

//------------------------------------------------------------------------------
// object that we're exporting
//------------------------------------------------------------------------------
var console = module.exports;

//------------------------------------------------------------------------------
// copy of the original console object
//------------------------------------------------------------------------------
var WinConsole = window.console;

//------------------------------------------------------------------------------
// whether to use the logger
//------------------------------------------------------------------------------
var UseLogger = false;

//------------------------------------------------------------------------------
// Timers
//------------------------------------------------------------------------------
var Timers = {};

//------------------------------------------------------------------------------
// used for unimplemented methods
//------------------------------------------------------------------------------
function noop() {}

//------------------------------------------------------------------------------
// used for unimplemented methods
//------------------------------------------------------------------------------
console.useLogger = function (value) {
    if (arguments.length) UseLogger = !!value;

    if (UseLogger) {
        if (logger.useConsole()) {
            throw new Error("console and logger are too intertwingly");
        }
    }

    return UseLogger;
};

//------------------------------------------------------------------------------
console.log = function() {
    if (logger.useConsole()) return;
    logger.log.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.error = function() {
    if (logger.useConsole()) return;
    logger.error.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.warn = function() {
    if (logger.useConsole()) return;
    logger.warn.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.info = function() {
    if (logger.useConsole()) return;
    logger.info.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.debug = function() {
    if (logger.useConsole()) return;
    logger.debug.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.assert = function(expression) {
    if (expression) return;

    var message = logger.format.apply(logger.format, [].slice.call(arguments, 1));
    console.log("ASSERT: " + message);
};

//------------------------------------------------------------------------------
console.clear = function() {};

//------------------------------------------------------------------------------
console.dir = function(object) {
    console.log("%o", object);
};

//------------------------------------------------------------------------------
console.dirxml = function(node) {
    console.log(node.innerHTML);
};

//------------------------------------------------------------------------------
console.trace = noop;

//------------------------------------------------------------------------------
console.group = console.log;

//------------------------------------------------------------------------------
console.groupCollapsed = console.log;

//------------------------------------------------------------------------------
console.groupEnd = noop;

//------------------------------------------------------------------------------
console.time = function(name) {
    Timers[name] = new Date().valueOf();
};

//------------------------------------------------------------------------------
console.timeEnd = function(name) {
    var timeStart = Timers[name];
    if (!timeStart) {
        console.warn("unknown timer: " + name);
        return;
    }

    var timeElapsed = new Date().valueOf() - timeStart;
    console.log(name + ": " + timeElapsed + "ms");
};

//------------------------------------------------------------------------------
console.timeStamp = noop;

//------------------------------------------------------------------------------
console.profile = noop;

//------------------------------------------------------------------------------
console.profileEnd = noop;

//------------------------------------------------------------------------------
console.count = noop;

//------------------------------------------------------------------------------
console.exception = console.log;

//------------------------------------------------------------------------------
console.table = function(data, columns) {
    console.log("%o", data);
};

//------------------------------------------------------------------------------
// return a new function that calls both functions passed as args
//------------------------------------------------------------------------------
function wrappedOrigCall(orgFunc, newFunc) {
    return function() {
        var args = [].slice.call(arguments);
        try { orgFunc.apply(WinConsole, args); } catch (e) {}
        try { newFunc.apply(console,    args); } catch (e) {}
    };
}

//------------------------------------------------------------------------------
// For every function that exists in the original console object, that
// also exists in the new console object, wrap the new console method
// with one that calls both
//------------------------------------------------------------------------------
for (var key in console) {
    if (typeof WinConsole[key] == "function") {
        console[key] = wrappedOrigCall(WinConsole[key], console[key]);
    }
}

});

// file: lib/common/plugin/echo.js
define("cordova/plugin/echo", function(require, exports, module) {

var exec = require('cordova/exec'),
    utils = require('cordova/utils');

/**
 * Sends the given message through exec() to the Echo plugin, which sends it back to the successCallback.
 * @param successCallback  invoked with a FileSystem object
 * @param errorCallback  invoked if error occurs retrieving file system
 * @param message  The string to be echoed.
 * @param forceAsync  Whether to force an async return value (for testing native->js bridge).
 */
module.exports = function(successCallback, errorCallback, message, forceAsync) {
    var action = 'echo';
    var messageIsMultipart = (utils.typeName(message) == "Array");
    var args = messageIsMultipart ? message : [message];

    if (utils.typeName(message) == 'ArrayBuffer') {
        if (forceAsync) {
            console.warn('Cannot echo ArrayBuffer with forced async, falling back to sync.');
        }
        action += 'ArrayBuffer';
    } else if (messageIsMultipart) {
        if (forceAsync) {
            console.warn('Cannot echo MultiPart Array with forced async, falling back to sync.');
        }
        action += 'MultiPart';
    } else if (forceAsync) {
        action += 'Async';
    }

    exec(successCallback, errorCallback, "Echo", action, args);
};


});

// file: lib/common/plugin/logger.js
define("cordova/plugin/logger", function(require, exports, module) {

//------------------------------------------------------------------------------
// The logger module exports the following properties/functions:
//
// LOG                          - constant for the level LOG
// ERROR                        - constant for the level ERROR
// WARN                         - constant for the level WARN
// INFO                         - constant for the level INFO
// DEBUG                        - constant for the level DEBUG
// logLevel()                   - returns current log level
// logLevel(value)              - sets and returns a new log level
// useConsole()                 - returns whether logger is using console
// useConsole(value)            - sets and returns whether logger is using console
// log(message,...)             - logs a message at level LOG
// error(message,...)           - logs a message at level ERROR
// warn(message,...)            - logs a message at level WARN
// info(message,...)            - logs a message at level INFO
// debug(message,...)           - logs a message at level DEBUG
// logLevel(level,message,...)  - logs a message specified level
//
//------------------------------------------------------------------------------

var logger = exports;

var exec    = require('cordova/exec');
var utils   = require('cordova/utils');

var UseConsole   = true;
var UseLogger    = true;
var Queued       = [];
var DeviceReady  = false;
var CurrentLevel;

var originalConsole = console;

/**
 * Logging levels
 */

var Levels = [
    "LOG",
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG"
];

/*
 * add the logging levels to the logger object and
 * to a separate levelsMap object for testing
 */

var LevelsMap = {};
for (var i=0; i<Levels.length; i++) {
    var level = Levels[i];
    LevelsMap[level] = i;
    logger[level]    = level;
}

CurrentLevel = LevelsMap.WARN;

/**
 * Getter/Setter for the logging level
 *
 * Returns the current logging level.
 *
 * When a value is passed, sets the logging level to that value.
 * The values should be one of the following constants:
 *    logger.LOG
 *    logger.ERROR
 *    logger.WARN
 *    logger.INFO
 *    logger.DEBUG
 *
 * The value used determines which messages get printed.  The logging
 * values above are in order, and only messages logged at the logging
 * level or above will actually be displayed to the user.  E.g., the
 * default level is WARN, so only messages logged with LOG, ERROR, or
 * WARN will be displayed; INFO and DEBUG messages will be ignored.
 */
logger.level = function (value) {
    if (arguments.length) {
        if (LevelsMap[value] === null) {
            throw new Error("invalid logging level: " + value);
        }
        CurrentLevel = LevelsMap[value];
    }

    return Levels[CurrentLevel];
};

/**
 * Getter/Setter for the useConsole functionality
 *
 * When useConsole is true, the logger will log via the
 * browser 'console' object.
 */
logger.useConsole = function (value) {
    if (arguments.length) UseConsole = !!value;

    if (UseConsole) {
        if (typeof console == "undefined") {
            throw new Error("global console object is not defined");
        }

        if (typeof console.log != "function") {
            throw new Error("global console object does not have a log function");
        }

        if (typeof console.useLogger == "function") {
            if (console.useLogger()) {
                throw new Error("console and logger are too intertwingly");
            }
        }
    }

    return UseConsole;
};

/**
 * Getter/Setter for the useLogger functionality
 *
 * When useLogger is true, the logger will log via the
 * native Logger plugin.
 */
logger.useLogger = function (value) {
    // Enforce boolean
    if (arguments.length) UseLogger = !!value;
    return UseLogger;
};

/**
 * Logs a message at the LOG level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.log   = function(message) { logWithArgs("LOG",   arguments); };

/**
 * Logs a message at the ERROR level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.error = function(message) { logWithArgs("ERROR", arguments); };

/**
 * Logs a message at the WARN level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.warn  = function(message) { logWithArgs("WARN",  arguments); };

/**
 * Logs a message at the INFO level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.info  = function(message) { logWithArgs("INFO",  arguments); };

/**
 * Logs a message at the DEBUG level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.debug = function(message) { logWithArgs("DEBUG", arguments); };

// log at the specified level with args
function logWithArgs(level, args) {
    args = [level].concat([].slice.call(args));
    logger.logLevel.apply(logger, args);
}

/**
 * Logs a message at the specified level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.logLevel = function(level /* , ... */) {
    // format the message with the parameters
    var formatArgs = [].slice.call(arguments, 1);
    var message    = logger.format.apply(logger.format, formatArgs);

    if (LevelsMap[level] === null) {
        throw new Error("invalid logging level: " + level);
    }

    if (LevelsMap[level] > CurrentLevel) return;

    // queue the message if not yet at deviceready
    if (!DeviceReady && !UseConsole) {
        Queued.push([level, message]);
        return;
    }

    // Log using the native logger if that is enabled
    if (UseLogger) {
        exec(null, null, "Logger", "logLevel", [level, message]);
    }

    // Log using the console if that is enabled
    if (UseConsole) {
        // make sure console is not using logger
        if (console.__usingCordovaLogger) {
            throw new Error("console and logger are too intertwingly");
        }

        // log to the console
        switch (level) {
            case logger.LOG:   originalConsole.log(message); break;
            case logger.ERROR: originalConsole.log("ERROR: " + message); break;
            case logger.WARN:  originalConsole.log("WARN: "  + message); break;
            case logger.INFO:  originalConsole.log("INFO: "  + message); break;
            case logger.DEBUG: originalConsole.log("DEBUG: " + message); break;
        }
    }
};


/**
 * Formats a string and arguments following it ala console.log()
 *
 * Any remaining arguments will be appended to the formatted string.
 *
 * for rationale, see FireBug's Console API:
 *    http://getfirebug.com/wiki/index.php/Console_API
 */
logger.format = function(formatString, args) {
    return __format(arguments[0], [].slice.call(arguments,1)).join(' ');
};


//------------------------------------------------------------------------------
/**
 * Formats a string and arguments following it ala vsprintf()
 *
 * format chars:
 *   %j - format arg as JSON
 *   %o - format arg as JSON
 *   %c - format arg as ''
 *   %% - replace with '%'
 * any other char following % will format it's
 * arg via toString().
 *
 * Returns an array containing the formatted string and any remaining
 * arguments.
 */
function __format(formatString, args) {
    if (formatString === null || formatString === undefined) return [""];
    if (arguments.length == 1) return [formatString.toString()];

    if (typeof formatString != "string")
        formatString = formatString.toString();

    var pattern = /(.*?)%(.)(.*)/;
    var rest    = formatString;
    var result  = [];

    while (args.length) {
        var match = pattern.exec(rest);
        if (!match) break;

        var arg   = args.shift();
        rest = match[3];
        result.push(match[1]);

        if (match[2] == '%') {
            result.push('%');
            args.unshift(arg);
            continue;
        }

        result.push(__formatted(arg, match[2]));
    }

    result.push(rest);

    var remainingArgs = [].slice.call(args);
    remainingArgs.unshift(result.join(''));
    return remainingArgs;
}

function __formatted(object, formatChar) {

    try {
        switch(formatChar) {
            case 'j':
            case 'o': return JSON.stringify(object);
            case 'c': return '';
        }
    }
    catch (e) {
        return "error JSON.stringify()ing argument: " + e;
    }

    if ((object === null) || (object === undefined)) {
        return Object.prototype.toString.call(object);
    }

    return object.toString();
}


//------------------------------------------------------------------------------
// when deviceready fires, log queued messages
logger.__onDeviceReady = function() {
    if (DeviceReady) return;

    DeviceReady = true;

    for (var i=0; i<Queued.length; i++) {
        var messageArgs = Queued[i];
        logger.logLevel(messageArgs[0], messageArgs[1]);
    }

    Queued = null;
};

// add a deviceready event to log queued messages
document.addEventListener("deviceready", logger.__onDeviceReady, false);

});

// file: lib/common/plugin/logger/symbols.js
define("cordova/plugin/logger/symbols", function(require, exports, module) {


var modulemapper = require('cordova/modulemapper');

modulemapper.clobbers('cordova/plugin/logger', 'cordova.logger');

});

// file: lib/blackberry10/plugin/requestFileSystem.js
define("cordova/plugin/requestFileSystem", function(require, exports, module) {

var fileUtils = require('cordova/plugin/blackberry10/fileUtils'),
    FileError = require('cordova/plugin/FileError'),
    FileSystem = require('cordova/plugin/FileSystem');

module.exports = function (type, size, success, fail) {
    if (size >= 1000000000000000) {
        fail(new FileError(FileError.QUOTA_EXCEEDED_ERR));
    } else if (type !== 1 && type !== 0) {
        fail(new FileError(FileError.SYNTAX_ERR));
    } else {
        window.webkitRequestFileSystem(type, size, function (fs) {
            success((new FileSystem(fileUtils.getFileSystemName(fs), fileUtils.createEntry(fs.root))));
        }, function (error) {
            fail(new FileError(error));
        });
    }
};

});

// file: lib/blackberry10/plugin/resolveLocalFileSystemURI.js
define("cordova/plugin/resolveLocalFileSystemURI", function(require, exports, module) {

var fileUtils = require('cordova/plugin/blackberry10/fileUtils'),
    FileError = require('cordova/plugin/FileError');

module.exports = function (uri, success, fail) {
    var type,
        path,
        paramPath;
    if (!uri || uri.indexOf("/") === 0) {
        fail(new FileError(FileError.ENCODING_ERR));
    } else {
        type = uri.indexOf("persistent") === -1 ? 0 : 1;
        path = uri.substring(type === 1 ? uri.indexOf("persistent") + 11 : uri.indexOf("temporary") + 10);
        if (path.substring(0,1) == "/") {
            path = path.substring(1);
        }
        paramPath = path.indexOf("?");
        if (paramPath > -1) {
            path = path.substring(0, paramPath);
        }
        window.webkitRequestFileSystem(type, 25*1024*1024, function (fs) {
            if (path === "") {
                success(fileUtils.createEntry(fs.root));
            } else {
                fs.root.getDirectory(path, {}, function (entry) {
                    success(fileUtils.createEntry(entry));
                }, function () {
                    fs.root.getFile(path, {}, function (entry) {
                        success(fileUtils.createEntry(entry));
                    }, fail);
                });
            }
        }, fail);
    }
};

});

// file: lib/common/symbols.js
define("cordova/symbols", function(require, exports, module) {

var modulemapper = require('cordova/modulemapper');

// Use merges here in case others symbols files depend on this running first,
// but fail to declare the dependency with a require().
modulemapper.merges('cordova', 'cordova');
modulemapper.clobbers('cordova/exec', 'cordova.exec');
modulemapper.clobbers('cordova/exec', 'Cordova.exec');

});

// file: lib/common/utils.js
define("cordova/utils", function(require, exports, module) {

var utils = exports;

/**
 * Defines a property getter / setter for obj[key].
 */
utils.defineGetterSetter = function(obj, key, getFunc, opt_setFunc) {
    if (Object.defineProperty) {
        var desc = {
            get: getFunc,
            configurable: true
        };
        if (opt_setFunc) {
            desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
    } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
            obj.__defineSetter__(key, opt_setFunc);
        }
    }
};

/**
 * Defines a property getter for obj[key].
 */
utils.defineGetter = utils.defineGetterSetter;

utils.arrayIndexOf = function(a, item) {
    if (a.indexOf) {
        return a.indexOf(item);
    }
    var len = a.length;
    for (var i = 0; i < len; ++i) {
        if (a[i] == item) {
            return i;
        }
    }
    return -1;
};

/**
 * Returns whether the item was found in the array.
 */
utils.arrayRemove = function(a, item) {
    var index = utils.arrayIndexOf(a, item);
    if (index != -1) {
        a.splice(index, 1);
    }
    return index != -1;
};

utils.typeName = function(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
};

/**
 * Returns an indication of whether the argument is an array or not
 */
utils.isArray = function(a) {
    return utils.typeName(a) == 'Array';
};

/**
 * Returns an indication of whether the argument is a Date or not
 */
utils.isDate = function(d) {
    return utils.typeName(d) == 'Date';
};

/**
 * Does a deep clone of the object.
 */
utils.clone = function(obj) {
    if(!obj || typeof obj == 'function' || utils.isDate(obj) || typeof obj != 'object') {
        return obj;
    }

    var retVal, i;

    if(utils.isArray(obj)){
        retVal = [];
        for(i = 0; i < obj.length; ++i){
            retVal.push(utils.clone(obj[i]));
        }
        return retVal;
    }

    retVal = {};
    for(i in obj){
        if(!(i in retVal) || retVal[i] != obj[i]) {
            retVal[i] = utils.clone(obj[i]);
        }
    }
    return retVal;
};

/**
 * Returns a wrapped version of the function
 */
utils.close = function(context, func, params) {
    if (typeof params == 'undefined') {
        return function() {
            return func.apply(context, arguments);
        };
    } else {
        return function() {
            return func.apply(context, params);
        };
    }
};

/**
 * Create a UUID
 */
utils.createUUID = function() {
    return UUIDcreatePart(4) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(6);
};

/**
 * Extends a child object from a parent object using classical inheritance
 * pattern.
 */
utils.extend = (function() {
    // proxy used to establish prototype chain
    var F = function() {};
    // extend Child from Parent
    return function(Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}());

/**
 * Alerts a message in any available way: alert or console.log.
 */
utils.alert = function(msg) {
    if (window.alert) {
        window.alert(msg);
    } else if (console && console.log) {
        console.log(msg);
    }
};


//------------------------------------------------------------------------------
function UUIDcreatePart(length) {
    var uuidpart = "";
    for (var i=0; i<length; i++) {
        var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length == 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}


});

window.cordova = require('cordova');
// file: lib/scripts/bootstrap.js

(function (context) {
    if (context._cordovaJsLoaded) {
        throw new Error('cordova.js included multiple times.');
    }
    context._cordovaJsLoaded = true;

    var channel = require('cordova/channel');
    var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];

    function logUnfiredChannels(arr) {
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].state != 2) {
                console.log('Channel not fired: ' + arr[i].type);
            }
        }
    }

    window.setTimeout(function() {
        if (channel.onDeviceReady.state != 2) {
            console.log('deviceready has not fired after 5 seconds.');
            logUnfiredChannels(platformInitChannelsArray);
            logUnfiredChannels(channel.deviceReadyChannelsArray);
        }
    }, 5000);

    // Replace navigator before any modules are required(), to ensure it happens as soon as possible.
    // We replace it so that properties that can't be clobbered can instead be overridden.
    function replaceNavigator(origNavigator) {
        var CordovaNavigator = function() {};
        CordovaNavigator.prototype = origNavigator;
        var newNavigator = new CordovaNavigator();
        // This work-around really only applies to new APIs that are newer than Function.bind.
        // Without it, APIs such as getGamepads() break.
        if (CordovaNavigator.bind) {
            for (var key in origNavigator) {
                if (typeof origNavigator[key] == 'function') {
                    newNavigator[key] = origNavigator[key].bind(origNavigator);
                }
            }
        }
        return newNavigator;
    }
    if (context.navigator) {
        context.navigator = replaceNavigator(context.navigator);
    }

    // _nativeReady is global variable that the native side can set
    // to signify that the native code is ready. It is a global since
    // it may be called before any cordova JS is ready.
    if (window._nativeReady) {
        channel.onNativeReady.fire();
    }

    /**
     * Create all cordova objects once native side is ready.
     */
    channel.join(function() {
        // Call the platform-specific initialization
        require('cordova/platform').initialize();

        // Fire event to notify that all objects are created
        channel.onCordovaReady.fire();

        // Fire onDeviceReady event once page has fully loaded, all
        // constructors have run and cordova info has been received from native
        // side.
        // This join call is deliberately made after platform.initialize() in
        // order that plugins may manipulate channel.deviceReadyChannelsArray
        // if necessary.
        channel.join(function() {
            require('cordova').fireDocumentEvent('deviceready');
        }, channel.deviceReadyChannelsArray);

    }, platformInitChannelsArray);

}(window));

// file: lib/scripts/bootstrap-blackberry10.js
var channel = require("cordova/channel");

channel.onPluginsReady.subscribe(function () {
    channel.onNativeReady.fire();
});

// file: lib/scripts/plugin_loader.js

// Tries to load all plugins' js-modules.
// This is an async process, but onDeviceReady is blocked on onPluginsReady.
// onPluginsReady is fired when there are no plugins to load, or they are all done.
(function (context) {
    // To be populated with the handler by handlePluginsObject.
    var onScriptLoadingComplete;

    var scriptCounter = 0;
    function scriptLoadedCallback() {
        scriptCounter--;
        if (scriptCounter === 0) {
            onScriptLoadingComplete && onScriptLoadingComplete();
        }
    }

    function scriptErrorCallback(err) {
        // Open Question: If a script path specified in cordova_plugins.js does not exist, do we fail for all?
        // this is currently just continuing.
        scriptCounter--;
        if (scriptCounter === 0) {
            onScriptLoadingComplete && onScriptLoadingComplete();
        }
    }

    // Helper function to inject a <script> tag.
    function injectScript(path) {
        scriptCounter++;
        var script = document.createElement("script");
        script.onload = scriptLoadedCallback;
        script.onerror = scriptErrorCallback;
        script.src = path;
        document.head.appendChild(script);
    }

    // Called when:
    // * There are plugins defined and all plugins are finished loading.
    // * There are no plugins to load.
    function finishPluginLoading() {
        context.cordova.require('cordova/channel').onPluginsReady.fire();
    }

    // Handler for the cordova_plugins.js content.
    // See plugman's plugin_loader.js for the details of this object.
    // This function is only called if the really is a plugins array that isn't empty.
    // Otherwise the onerror response handler will just call finishPluginLoading().
    function handlePluginsObject(modules, path) {
        // First create the callback for when all plugins are loaded.
        var mapper = context.cordova.require('cordova/modulemapper');
        onScriptLoadingComplete = function() {
            // Loop through all the plugins and then through their clobbers and merges.
            for (var i = 0; i < modules.length; i++) {
                var module = modules[i];
                if (module) {
                    try { 
                        if (module.clobbers && module.clobbers.length) {
                            for (var j = 0; j < module.clobbers.length; j++) {
                                mapper.clobbers(module.id, module.clobbers[j]);
                            }
                        }

                        if (module.merges && module.merges.length) {
                            for (var k = 0; k < module.merges.length; k++) {
                                mapper.merges(module.id, module.merges[k]);
                            }
                        }

                        // Finally, if runs is truthy we want to simply require() the module.
                        // This can be skipped if it had any merges or clobbers, though,
                        // since the mapper will already have required the module.
                        if (module.runs && !(module.clobbers && module.clobbers.length) && !(module.merges && module.merges.length)) {
                            context.cordova.require(module.id);
                        }
                    }
                    catch(err) {
                        // error with module, most likely clobbers, should we continue?
                    }
                }
            }

            finishPluginLoading();
        };

        // Now inject the scripts.
        for (var i = 0; i < modules.length; i++) {
            injectScript(path + modules[i].file);
        }
    }

    // Find the root of the app
    var path = '';
    var scripts = document.getElementsByTagName('script');
    var term = 'cordova.js';
    for (var n = scripts.length-1; n>-1; n--) {
        var src = scripts[n].src;
        if (src.indexOf(term) == (src.length - term.length)) {
            path = src.substring(0, src.length - term.length);
            break;
        }
    }

    var plugins_json = path + 'cordova_plugins.json';
    var plugins_js = path + 'cordova_plugins.js';

    // One some phones (Windows) this xhr.open throws an Access Denied exception
    // So lets keep trying, but with a script tag injection technique instead of XHR
    var injectPluginScript = function injectPluginScript() {
        try {
            var script = document.createElement("script");
            script.onload = function(){
                var list = cordova.require("cordova/plugin_list");
                handlePluginsObject(list,path);
            };
            script.onerror = function() {
                // Error loading cordova_plugins.js, file not found or something
                // this is an acceptable error, pre-3.0.0, so we just move on.
                finishPluginLoading();
            };
            script.src = plugins_js;
            document.head.appendChild(script);

        } catch(err){
            finishPluginLoading();
        }
    } 


    // Try to XHR the cordova_plugins.json file asynchronously.
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        // If the response is a JSON string which composes an array, call handlePluginsObject.
        // If the request fails, or the response is not a JSON array, just call finishPluginLoading.
        var obj;
        try {
            obj = (this.status == 0 || this.status == 200) && this.responseText && JSON.parse(this.responseText);
        } catch (err) {
            // obj will be undefined.
        }
        if (Array.isArray(obj) && obj.length > 0) {
            handlePluginsObject(obj, path);
        } else {
            finishPluginLoading();
        }
    };
    xhr.onerror = function() {
        // In this case, the json file was not present, but XHR was allowed, 
        // so we should still try the script injection technique with the js file
        // in case that is there.
        injectPluginScript();
    };
    try { // we commented we were going to try, so let us actually try and catch
        xhr.open('GET', plugins_json, true); // Async
        xhr.send();
    } catch(err){
        injectPluginScript();
    }
}(window));


})();