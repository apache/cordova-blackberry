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
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 */
var PhoneGap = PhoneGap || (function() {
    
    /**
     * PhoneGap object.
     */
    var PhoneGap = {
        documentEventHandler: {},   // Collection of custom document event handlers
        windowEventHandler: {}      // Collection of custom window event handlers
    };

    //----------------------------------------------
    // Publish/subscribe channels for initialization
    //----------------------------------------------

    /**
     * The order of events during page load and PhoneGap startup is as follows:
     *
     * onDOMContentLoaded         Internal event that is received when the web page is loaded and parsed.
     * window.onload              Body onload event.
     * onNativeReady              Internal event that indicates the PhoneGap native side is ready.
     * onPhoneGapInit             Internal event that kicks off creation of all PhoneGap JavaScript objects (runs constructors).
     * onPhoneGapReady            Internal event fired when all PhoneGap JavaScript objects have been created
     * onPhoneGapInfoReady        Internal event fired when device properties are available
     * onDeviceReady              User event fired to indicate that PhoneGap is ready
     *
     * The only PhoneGap event that user code should register for is:
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
    PhoneGap.Channel = function(type) {
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
    PhoneGap.Channel.prototype.subscribe = function(f, c, g) {
        // need a function to call
        if (f == null) { return; }

        var func = f;
        if (typeof c == "object" && f instanceof Function) { func = PhoneGap.close(c, f); }

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
    PhoneGap.Channel.prototype.subscribeOnce = function(f, c) {
        var g = null;
        var _this = this;
        var m = function() {
            f.apply(c || null, arguments);
            _this.unsubscribe(g);
        };
        if (this.fired) {
            if (typeof c == "object" && f instanceof Function) { f = PhoneGap.close(c, f); }
            f.apply(this, this.fireArgs);
        } else {
            g = this.subscribe(m);
        }
        return g;
    };

    /** 
     * Unsubscribes the function with the given guid from the channel.
     */
    PhoneGap.Channel.prototype.unsubscribe = function(g) {
        if (g instanceof Function) { g = g.observer_guid; }
        this.handlers[g] = null;
        delete this.handlers[g];
    };

    /** 
     * Calls all functions subscribed to this channel.
     */
    PhoneGap.Channel.prototype.fire = function(e) {
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
    PhoneGap.Channel.join = function(h, c) {
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
    PhoneGap.onDOMContentLoaded = new PhoneGap.Channel('onDOMContentLoaded');

    /**
     * onNativeReady channel is fired when the PhoneGap native code
     * has been initialized.
     */
    PhoneGap.onNativeReady = new PhoneGap.Channel('onNativeReady');

    /**
     * onPhoneGapInit channel is fired when the web page is fully loaded and
     * PhoneGap native code has been initialized.
     */
    PhoneGap.onPhoneGapInit = new PhoneGap.Channel('onPhoneGapInit');

    /**
     * onPhoneGapReady channel is fired when the JS PhoneGap objects have been created.
     */
    PhoneGap.onPhoneGapReady = new PhoneGap.Channel('onPhoneGapReady');

    /**
     * onPhoneGapInfoReady channel is fired when the PhoneGap device properties
     * has been set.
     */
    PhoneGap.onPhoneGapInfoReady = new PhoneGap.Channel('onPhoneGapInfoReady');

    /**
     * onPhoneGapConnectionReady channel is fired when the PhoneGap connection
     * properties have been set.
     */
    PhoneGap.onPhoneGapConnectionReady = new PhoneGap.Channel('onPhoneGapConnectionReady');

    /**
     * onDeviceReady is fired only after all PhoneGap objects are created and
     * the device properties are set.
     */
    PhoneGap.onDeviceReady = new PhoneGap.Channel('onDeviceReady');

    /**
     * PhoneGap Channels that must fire before "deviceready" is fired.
     */ 
    PhoneGap.deviceReadyChannelsArray = [ PhoneGap.onPhoneGapReady, PhoneGap.onPhoneGapInfoReady, PhoneGap.onPhoneGapConnectionReady ];

    /**
     * User-defined channels that must also fire before "deviceready" is fired.
     */
    PhoneGap.deviceReadyChannelsMap = {};

    /**
     * Indicate that a feature needs to be initialized before it is ready to be
     * used. This holds up PhoneGap's "deviceready" event until the feature has been
     * initialized and PhoneGap.initializationComplete(feature) is called.
     * 
     * @param feature {String} The unique feature name
     */
    PhoneGap.waitForInitialization = function(feature) {
        if (feature) {
            var channel = new PhoneGap.Channel(feature);
            PhoneGap.deviceReadyChannelsMap[feature] = channel;
            PhoneGap.deviceReadyChannelsArray.push(channel);
        }
    };

    /**
     * Indicate that initialization code has completed and the feature is ready to
     * be used.
     * 
     * @param feature {String} The unique feature name
     */
    PhoneGap.initializationComplete = function(feature) {
        var channel = PhoneGap.deviceReadyChannelsMap[feature];
        if (channel) {
            channel.fire();
        }
    };

    /**
     * Create all PhoneGap objects once page has fully loaded and native side is ready.
     */
    PhoneGap.Channel.join(function() {

        // Run PhoneGap constructors
        PhoneGap.onPhoneGapInit.fire();

        // Fire event to notify that all objects are created
        PhoneGap.onPhoneGapReady.fire();

        // Fire onDeviceReady event once all constructors have run and 
        // PhoneGap info has been received from native side.
        PhoneGap.Channel.join(function() {
            PhoneGap.onDeviceReady.fire();
        }, PhoneGap.deviceReadyChannelsArray);    
        
    }, [ PhoneGap.onDOMContentLoaded, PhoneGap.onNativeReady ]);

    //---------------
    // Event handling
    //---------------

    /**
     * Listen for DOMContentLoaded and notify our channel subscribers.
     */ 
    document.addEventListener('DOMContentLoaded', function() {
        PhoneGap.onDOMContentLoaded.fire();
    }, false);

    // Intercept calls to document.addEventListener
    PhoneGap.m_document_addEventListener = document.addEventListener;

    // Intercept calls to window.addEventListener
    PhoneGap.m_window_addEventListener = window.addEventListener;

    /**
     * Add a custom window event handler.
     *
     * @param {String} event            The event name that callback handles
     * @param {Function} callback       The event handler
     */
    PhoneGap.addWindowEventHandler = function(event, callback) {
        PhoneGap.windowEventHandler[event] = callback;
    };

    /**
     * Add a custom document event handler.
     *
     * @param {String} event            The event name that callback handles
     * @param {Function} callback       The event handler
     */
    PhoneGap.addDocumentEventHandler = function(event, callback) {
        PhoneGap.documentEventHandler[event] = callback;
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
            PhoneGap.onDeviceReady.subscribeOnce(handler);
        } else {
            if (typeof PhoneGap.documentEventHandler[e] !== "undefined") {
                if (PhoneGap.documentEventHandler[e](e, handler, true)) {
                    return; // Stop default behavior
                }
            }

            PhoneGap.m_document_addEventListener.call(document, evt, handler, capture);
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
        if (typeof PhoneGap.windowEventHandler[e] !== "undefined") {
            if (PhoneGap.windowEventHandler[e](e, handler, true)) {
                return; // Stop default behavior
            }
        }

        PhoneGap.m_window_addEventListener.call(window, evt, handler, capture);
    };

    // Intercept calls to document.removeEventListener and watch for events that
    // are generated by PhoneGap native code
    PhoneGap.m_document_removeEventListener = document.removeEventListener;

    // Intercept calls to window.removeEventListener
    PhoneGap.m_window_removeEventListener = window.removeEventListener;

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
        if (typeof PhoneGap.documentEventHandler[e] !== "undefined") {
            if (PhoneGap.documentEventHandler[e](e, handler, false)) {
                return; // Stop default behavior
            }
        }

        PhoneGap.m_document_removeEventListener.call(document, evt, handler, capture);
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
        if (typeof PhoneGap.windowEventHandler[e] !== "undefined") {
            if (PhoneGap.windowEventHandler[e](e, handler, false)) {
                return; // Stop default behavior
            }
        }

        PhoneGap.m_window_removeEventListener.call(window, evt, handler, capture);
    };

    /**
     * Method to fire document event
     *
     * @param {String} type             The event type to fire
     * @param {Object} data             Data to send with event
     */
    PhoneGap.fireDocumentEvent = function(type, data) {
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
    PhoneGap.fireWindowEvent = function(type, data) {
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
     * initialize application constructors only once PhoneGap has been initialized.
     * 
     * @param {Function} func The function callback you want run once PhoneGap is initialized
     */
    PhoneGap.addConstructor = function(func) {
        PhoneGap.onPhoneGapInit.subscribeOnce(function() {
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
    PhoneGap.addPlugin = function(name, obj) {
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
    PhoneGap.callbackId = 0;
    PhoneGap.callbacks  = {};
    PhoneGap.callbackStatus = {
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
    PhoneGap.callbackSuccess = function(callbackId, args) {
        if (PhoneGap.callbacks[callbackId]) {

            // If result is to be sent to callback
            if (args.status == PhoneGap.callbackStatus.OK) {
                try {
                    if (PhoneGap.callbacks[callbackId].success) {
                        PhoneGap.callbacks[callbackId].success(args.message);
                    }
                }
                catch (e) {
                    console.log("Error in success callback: "+callbackId+" = "+e);
                }
            }

            // Clear callback if not expecting any more results
            if (!args.keepCallback) {
                delete PhoneGap.callbacks[callbackId];
            }
        }
    };

    /**
     * Called by native code when returning error result from an action.
     *
     * @param callbackId
     * @param args
     */
    PhoneGap.callbackError = function(callbackId, args) {
        if (PhoneGap.callbacks[callbackId]) {
            try {
                if (PhoneGap.callbacks[callbackId].fail) {
                    PhoneGap.callbacks[callbackId].fail(args.message);
                }
            }
            catch (e) {
                console.log("Error in error callback: "+callbackId+" = "+e);
            }

            // Clear callback if not expecting any more results
            if (!args.keepCallback) {
                delete PhoneGap.callbacks[callbackId];
            }
        }
    };

    /**
     * Execute a PhoneGap command.  It is up to the native side whether this action
     * is synchronous or asynchronous.  The native side can return:
     *      Synchronous: PluginResult object as a JSON string
     *      Asynchrounous: Empty string ""
     * If async, the native side will PhoneGap.callbackSuccess or PhoneGap.callbackError,
     * depending upon the result of the action.
     *
     * @param {Function} success    The success callback
     * @param {Function} fail       The fail callback
     * @param {String} service      The name of the service to use
     * @param {String} action       Action to be run in PhoneGap
     * @param {String[]} [args]     Zero or more arguments to pass to the method
     */
    PhoneGap.exec = function(success, fail, service, action, args) {
        try {
            var v = phonegap.PluginManager.exec(success, fail, service, action, args);

            // If status is OK, then return value back to caller
            if (v.status == PhoneGap.callbackStatus.OK) {

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
            } else if (v.status == PhoneGap.callbackStatus.NO_RESULT) {

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
    PhoneGap.clone = function(obj) {
        if(!obj) { 
            return obj;
        }
        
        if(obj instanceof Array){
            var retVal = new Array();
            for(var i = 0; i < obj.length; ++i){
                retVal.push(PhoneGap.clone(obj[i]));
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
                retVal[i] = PhoneGap.clone(obj[i]);
            }
        }
        return retVal;
    };

    PhoneGap.close = function(context, func, params) {
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
    PhoneGap.createUUID = function() {
        return PhoneGap.UUIDcreatePart(4) + '-' +
            PhoneGap.UUIDcreatePart(2) + '-' +
            PhoneGap.UUIDcreatePart(2) + '-' +
            PhoneGap.UUIDcreatePart(2) + '-' +
            PhoneGap.UUIDcreatePart(6);
    };

    PhoneGap.UUIDcreatePart = function(length) {
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
    PhoneGap.extend = (function() {
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
    
    return PhoneGap;
}());

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since 
// it may be called before any PhoneGap JS is ready.
if (typeof _nativeReady !== 'undefined') { PhoneGap.onNativeReady.fire(); }
