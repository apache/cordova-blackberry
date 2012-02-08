/*
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
 * Copyright (c) 2011, Research In Motion Limited.
 */

/**
 * This represents the Cordova API itself, and provides a global namespace for accessing
 * information about the state of Cordova.
 */
var Cordova = Cordova || (function() {

    /**
     * Cordova object.
     */
    var Cordova = {
        documentEventHandler: {},   // Collection of custom document event handlers
        windowEventHandler: {}      // Collection of custom window event handlers
    };

    //----------------------------------------------
    // Publish/subscribe channels for initialization
    //----------------------------------------------

    /**
     * The order of events during page load and Cordova startup is as follows:
     *
     * onDOMContentLoaded         Internal event that is received when the web page is loaded and parsed.
     * window.onload              Body onload event.
     * onNativeReady              Internal event that indicates the Cordova native side is ready.
     * onCordovaInit             Internal event that kicks off creation of all Cordova JavaScript objects (runs constructors).
     * onCordovaReady            Internal event fired when all Cordova JavaScript objects have been created
     * onCordovaInfoReady        Internal event fired when device properties are available
     * onDeviceReady              User event fired to indicate that Cordova is ready
     *
     * The only Cordova event that user code should register for is:
     *      onDeviceReady
     *
     * Listener can be registered as:
     *      document.addEventListener("deviceready", myDeviceReadyListener, false);
     *
     * Additional lifecycle events are enforced by the App plugin.  Reference
     * app.js for details.
     */

    /**
     * Custom pub-sub channel that can have functions subscribed to it
     */
    Cordova.Channel = function(type) {
        this.type = type;
        this.handlers = { };
        this.guid = 0;
        this.fired = false;
        this.enabled = true;
    };

    /**
     * Subscribes the given function to the channel. Any time that
     * Channel.fire is called so too will the function.
     * Optionally specify an execution context for the function
     * and a guid that can be used to stop subscribing to the channel.
     * Returns the guid.
     */
    Cordova.Channel.prototype.subscribe = function(f, c, g) {
        // need a function to call
        if (f == null) { return; }

        var func = f;
        if (typeof c == "object" && f instanceof Function) { func = Cordova.close(c, f); }

        g = g || func.observer_guid || f.observer_guid || this.guid++;
        func.observer_guid = g;
        f.observer_guid = g;
        this.handlers[g] = func;
        return g;
    };

    /**
     * Like subscribe but the function is only called once and then it
     * auto-unsubscribes itself.
     */
    Cordova.Channel.prototype.subscribeOnce = function(f, c) {
        var g = null;
        var _this = this;
        var m = function() {
            f.apply(c || null, arguments);
            _this.unsubscribe(g);
        };
        if (this.fired) {
            if (typeof c == "object" && f instanceof Function) { f = Cordova.close(c, f); }
            f.apply(this, this.fireArgs);
        } else {
            g = this.subscribe(m);
        }
        return g;
    };

    /**
     * Unsubscribes the function with the given guid from the channel.
     */
    Cordova.Channel.prototype.unsubscribe = function(g) {
        if (g instanceof Function) { g = g.observer_guid; }
        this.handlers[g] = null;
        delete this.handlers[g];
    };

    /**
     * Calls all functions subscribed to this channel.
     */
    Cordova.Channel.prototype.fire = function(e) {
        if (this.enabled) {
            var fail = false;
            for (var item in this.handlers) {
                var handler = this.handlers[item];
                if (handler instanceof Function) {
                    var rv = (handler.apply(this, arguments)==false);
                    fail = fail || rv;
                }
            }
            this.fired = true;
            this.fireArgs = arguments;
            return !fail;
        }
        return true;
    };

    /**
     * Calls the provided function only after all of the channels specified
     * have been fired.
     */
    Cordova.Channel.join = function(h, c) {
        var i = c.length;
        var len = i;
        var f = function() {
            if (!(--i)) h();
        };
        for (var j=0; j<len; j++) {
            (!c[j].fired?c[j].subscribeOnce(f):i--);
        }
        if (!i) h();
    };

    /**
     * onDOMContentLoaded channel is fired when the DOM content
     * of the page has been parsed.
     */
    Cordova.onDOMContentLoaded = new Cordova.Channel('onDOMContentLoaded');

    /**
     * onNativeReady channel is fired when the Cordova native code
     * has been initialized.
     */
    Cordova.onNativeReady = new Cordova.Channel('onNativeReady');

    /**
     * onCordovaInit channel is fired when the web page is fully loaded and
     * Cordova native code has been initialized.
     */
    Cordova.onCordovaInit = new Cordova.Channel('onCordovaInit');

    /**
     * onCordovaReady channel is fired when the JS Cordova objects have been created.
     */
    Cordova.onCordovaReady = new Cordova.Channel('onCordovaReady');

    /**
     * onCordovaInfoReady channel is fired when the Cordova device properties
     * has been set.
     */
    Cordova.onCordovaInfoReady = new Cordova.Channel('onCordovaInfoReady');

    /**
     * onCordovaConnectionReady channel is fired when the Cordova connection
     * properties have been set.
     */
    Cordova.onCordovaConnectionReady = new Cordova.Channel('onCordovaConnectionReady');

    /**
     * onDeviceReady is fired only after all Cordova objects are created and
     * the device properties are set.
     */
    Cordova.onDeviceReady = new Cordova.Channel('onDeviceReady');

    /**
     * Cordova Channels that must fire before "deviceready" is fired.
     */
    Cordova.deviceReadyChannelsArray = [ Cordova.onCordovaReady, Cordova.onCordovaInfoReady, Cordova.onCordovaConnectionReady ];

    /**
     * User-defined channels that must also fire before "deviceready" is fired.
     */
    Cordova.deviceReadyChannelsMap = {};

    /**
     * Indicate that a feature needs to be initialized before it is ready to be
     * used. This holds up Cordova's "deviceready" event until the feature has been
     * initialized and Cordova.initializationComplete(feature) is called.
     *
     * @param feature {String} The unique feature name
     */
    Cordova.waitForInitialization = function(feature) {
        if (feature) {
            var channel = new Cordova.Channel(feature);
            Cordova.deviceReadyChannelsMap[feature] = channel;
            Cordova.deviceReadyChannelsArray.push(channel);
        }
    };

    /**
     * Indicate that initialization code has completed and the feature is ready to
     * be used.
     *
     * @param feature {String} The unique feature name
     */
    Cordova.initializationComplete = function(feature) {
        var channel = Cordova.deviceReadyChannelsMap[feature];
        if (channel) {
            channel.fire();
        }
    };

    /**
     * Create all Cordova objects once page has fully loaded and native side is ready.
     */
    Cordova.Channel.join(function() {

        // Run Cordova constructors
        Cordova.onCordovaInit.fire();

        // Fire event to notify that all objects are created
        Cordova.onCordovaReady.fire();

        // Fire onDeviceReady event once all constructors have run and
        // Cordova info has been received from native side.
        Cordova.Channel.join(function() {
            Cordova.onDeviceReady.fire();
        }, Cordova.deviceReadyChannelsArray);

    }, [ Cordova.onDOMContentLoaded, Cordova.onNativeReady ]);

    //---------------
    // Event handling
    //---------------

    /**
     * Listen for DOMContentLoaded and notify our channel subscribers.
     */
    document.addEventListener('DOMContentLoaded', function() {
        Cordova.onDOMContentLoaded.fire();
    }, false);

    // Intercept calls to document.addEventListener
    Cordova.m_document_addEventListener = document.addEventListener;

    // Intercept calls to window.addEventListener
    Cordova.m_window_addEventListener = window.addEventListener;

    /**
     * Add a custom window event handler.
     *
     * @param {String} event            The event name that callback handles
     * @param {Function} callback       The event handler
     */
    Cordova.addWindowEventHandler = function(event, callback) {
        Cordova.windowEventHandler[event] = callback;
    };

    /**
     * Add a custom document event handler.
     *
     * @param {String} event            The event name that callback handles
     * @param {Function} callback       The event handler
     */
    Cordova.addDocumentEventHandler = function(event, callback) {
        Cordova.documentEventHandler[event] = callback;
    };

    /**
     * Intercept adding document event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    document.addEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();
        if (e == 'deviceready') {
            Cordova.onDeviceReady.subscribeOnce(handler);
        } else {
            if (typeof Cordova.documentEventHandler[e] !== "undefined") {
                if (Cordova.documentEventHandler[e](e, handler, true)) {
                    return; // Stop default behavior
                }
            }

            Cordova.m_document_addEventListener.call(document, evt, handler, capture);
        }
    };

    /**
     * Intercept adding window event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    window.addEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();

        // If subscribing to an event that is handled by a plugin
        if (typeof Cordova.windowEventHandler[e] !== "undefined") {
            if (Cordova.windowEventHandler[e](e, handler, true)) {
                return; // Stop default behavior
            }
        }

        Cordova.m_window_addEventListener.call(window, evt, handler, capture);
    };

    // Intercept calls to document.removeEventListener and watch for events that
    // are generated by Cordova native code
    Cordova.m_document_removeEventListener = document.removeEventListener;

    // Intercept calls to window.removeEventListener
    Cordova.m_window_removeEventListener = window.removeEventListener;

    /**
     * Intercept removing document event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    document.removeEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();

        // If unsubcribing from an event that is handled by a plugin
        if (typeof Cordova.documentEventHandler[e] !== "undefined") {
            if (Cordova.documentEventHandler[e](e, handler, false)) {
                return; // Stop default behavior
            }
        }

        Cordova.m_document_removeEventListener.call(document, evt, handler, capture);
    };

    /**
     * Intercept removing window event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    window.removeEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();

        // If unsubcribing from an event that is handled by a plugin
        if (typeof Cordova.windowEventHandler[e] !== "undefined") {
            if (Cordova.windowEventHandler[e](e, handler, false)) {
                return; // Stop default behavior
            }
        }

        Cordova.m_window_removeEventListener.call(window, evt, handler, capture);
    };

    /**
     * Method to fire document event
     *
     * @param {String} type             The event type to fire
     * @param {Object} data             Data to send with event
     */
    Cordova.fireDocumentEvent = function(type, data) {
        var e = document.createEvent('Events');
        e.initEvent(type, false, false);
        if (data) {
            for (var i in data) {
                e[i] = data[i];
            }
        }
        document.dispatchEvent(e);
    };

    /**
     * Method to fire window event
     *
     * @param {String} type             The event type to fire
     * @param {Object} data             Data to send with event
     */
    Cordova.fireWindowEvent = function(type, data) {
        var e = document.createEvent('Events');
        e.initEvent(type, false, false);
        if (data) {
            for (var i in data) {
                e[i] = data[i];
            }
        }
        window.dispatchEvent(e);
    };

    //--------
    // Plugins
    //--------

    /**
     * Add an initialization function to a queue that ensures it will run and
     * initialize application constructors only once Cordova has been initialized.
     *
     * @param {Function} func The function callback you want run once Cordova is initialized
     */
    Cordova.addConstructor = function(func) {
        Cordova.onCordovaInit.subscribeOnce(function() {
            try {
                func();
            } catch(e) {
                if (typeof(debug) != 'undefined' && typeof(debug['log']) == 'function') {
                    debug.log("Failed to run constructor: " + debug.processMessage(e));
                } else {
                    alert("Failed to run constructor: " + e.message);
                }
            }
        });
    };

    /**
     * Plugins object.
     */
    if (!window.plugins) {
        window.plugins = {};
    }

    /**
     * Adds new plugin object to window.plugins.
     * The plugin is accessed using window.plugins.<name>
     *
     * @param name      The plugin name
     * @param obj       The plugin object
     */
    Cordova.addPlugin = function(name, obj) {
        if (!window.plugins[name]) {
            window.plugins[name] = obj;
        }
        else {
            console.log("Plugin " + name + " already exists.");
        }
    };

    /**
     * Plugin callback mechanism.
     */
    Cordova.callbackId = 0;
    Cordova.callbacks  = {};
    Cordova.callbackStatus = {
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

    /**
     * Called by native code when returning successful result from an action.
     *
     * @param callbackId
     * @param args
     */
    Cordova.callbackSuccess = function(callbackId, args) {
        if (Cordova.callbacks[callbackId]) {

            // If result is to be sent to callback
            if (args.status == Cordova.callbackStatus.OK) {
                try {
                    if (Cordova.callbacks[callbackId].success) {
                        Cordova.callbacks[callbackId].success(args.message);
                    }
                }
                catch (e) {
                    console.log("Error in success callback: "+callbackId+" = "+e);
                }
            }

            // Clear callback if not expecting any more results
            if (!args.keepCallback) {
                delete Cordova.callbacks[callbackId];
            }
        }
    };

    /**
     * Called by native code when returning error result from an action.
     *
     * @param callbackId
     * @param args
     */
    Cordova.callbackError = function(callbackId, args) {
        if (Cordova.callbacks[callbackId]) {
            try {
                if (Cordova.callbacks[callbackId].fail) {
                    Cordova.callbacks[callbackId].fail(args.message);
                }
            }
            catch (e) {
                console.log("Error in error callback: "+callbackId+" = "+e);
            }

            // Clear callback if not expecting any more results
            if (!args.keepCallback) {
                delete Cordova.callbacks[callbackId];
            }
        }
    };

    /**
     * Execute a Cordova command.  It is up to the native side whether this action
     * is synchronous or asynchronous.  The native side can return:
     *      Synchronous: PluginResult object as a JSON string
     *      Asynchrounous: Empty string ""
     * If async, the native side will Cordova.callbackSuccess or Cordova.callbackError,
     * depending upon the result of the action.
     *
     * @param {Function} success    The success callback
     * @param {Function} fail       The fail callback
     * @param {String} service      The name of the service to use
     * @param {String} action       Action to be run in Cordova
     * @param {String[]} [args]     Zero or more arguments to pass to the method
     */
    Cordova.exec = function(success, fail, service, action, args) {
        try {
            var v = cordova.PluginManager.exec(success, fail, service, action, args);

            // If status is OK, then return value back to caller
            if (v.status == Cordova.callbackStatus.OK) {

                // If there is a success callback, then call it now with returned value
                if (success) {
                    try {
                        success(v.message);
                    }
                    catch (e) {
                        console.log("Error in success callback: "+callbackId+" = "+e);
                    }

                }
                return v.message;
            } else if (v.status == Cordova.callbackStatus.NO_RESULT) {

            } else {
                // If error, then display error
                console.log("Error: Status="+v.status+" Message="+v.message);

                // If there is a fail callback, then call it now with returned value
                if (fail) {
                    try {
                        fail(v.message);
                    }
                    catch (e) {
                        console.log("Error in error callback: "+callbackId+" = "+e);
                    }
                }
                return null;
            }
        } catch (e) {
            console.log("Error: "+e);
        }
    };

    //------------------
    // Utility functions
    //------------------

    /**
     * Does a deep clone of the object.
     */
    Cordova.clone = function(obj) {
        if(!obj) {
            return obj;
        }

        if(obj instanceof Array){
            var retVal = new Array();
            for(var i = 0; i < obj.length; ++i){
                retVal.push(Cordova.clone(obj[i]));
            }
            return retVal;
        }

        if (obj instanceof Function) {
            return obj;
        }

        if(!(obj instanceof Object)){
            return obj;
        }

        if(obj instanceof Date){
            return obj;
        }

        retVal = new Object();
        for(i in obj){
            if(!(i in retVal) || retVal[i] != obj[i]) {
                retVal[i] = Cordova.clone(obj[i]);
            }
        }
        return retVal;
    };

    Cordova.close = function(context, func, params) {
        if (typeof params === 'undefined') {
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
    Cordova.createUUID = function() {
        return Cordova.UUIDcreatePart(4) + '-' +
            Cordova.UUIDcreatePart(2) + '-' +
            Cordova.UUIDcreatePart(2) + '-' +
            Cordova.UUIDcreatePart(2) + '-' +
            Cordova.UUIDcreatePart(6);
    };

    Cordova.UUIDcreatePart = function(length) {
        var uuidpart = "";
        for (var i=0; i<length; i++) {
            var uuidchar = parseInt((Math.random() * 256)).toString(16);
            if (uuidchar.length == 1) {
                uuidchar = "0" + uuidchar;
            }
            uuidpart += uuidchar;
        }
        return uuidpart;
    };

    /**
     * Extends a child object from a parent object using classical inheritance
     * pattern.
     */
    Cordova.extend = (function() {
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

    return Cordova;
}());

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any Cordova JS is ready.
if (typeof _nativeReady !== 'undefined') { Cordova.onNativeReady.fire(); }
