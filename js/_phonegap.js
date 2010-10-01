
PhoneGap = { };
navigator = { };

PhoneGap.callbackId = 0;
PhoneGap.callbacks  = {};

/**
 * Called by native code when returning successful result from an action.
 *
 * @param callbackId
 * @param args
 */
PhoneGap.callbackSuccess = function(callbackId, args) {
	if (PhoneGap.callbacks[callbackId]) {
        try {
            if (PhoneGap.callbacks[callbackId].success) {
                PhoneGap.callbacks[callbackId].success(args.message);
            }
        }
        catch (e) {
            console.log("Error in success callback: "+callbackId+" = "+e);
        }
        delete PhoneGap.callbacks[callbackId];
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
        delete PhoneGap.callbacks[callbackId];
    }
};

/**
 * Execute a PhoneGap command.  It is up to the native side whether this action is sync or async.  
 * The native side can return:
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
        var callbackId = service + PhoneGap.callbackId++;
        if (success || fail) {
            PhoneGap.callbacks[callbackId] = {success:success, fail:fail};
        }
        
        // Note: Device returns string, but for some reason emulator returns object - so convert to string.
        var r = ""+phonegap.PluginManager.exec(service, action, callbackId, JSON.stringify(args), true);
        
        // If a result was returned
        if (r.length > 0) {
            eval("var v="+r+";");
        
            // If status is OK, then return value back to caller
            if (v.status == 0) {

                // If there is a success callback, then call it now with returned value
                if (success) {
                    success(v.message);
                    delete PhoneGap.callbacks[callbackId];
                }
                return v.message;
            }

            // If error, then display error
            else {
                console.log("Error: Status="+r.status+" Message="+v.message);

                // If there is a fail callback, then call it now with returned value
                if (fail) {
                    fail(v.message);
                    delete PhoneGap.callbacks[callbackId];
                }
                return null;
            }
        }
    } catch (e) {
        console.log("Error: "+e);
    }
};

/**
 * Create a UUID
 *
 * @return
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
 * Custom pub-sub channel that can have functions subscribed to it
 */
PhoneGap.Channel = function(type)
{
    this.type = type;
    this.handlers = {};
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
    var g = null, that = this;
    var m = function() {
        f.apply(c || null, arguments);
        that.unsubscribe(g);
    }
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
    var fail = false, item, handler, rv;
    if (this.enabled) {
        for (item in this.handlers) {
            handler = this.handlers[item];
            if (handler instanceof Function) {
                rv = (handler.apply(this, arguments)==false);
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
    var i = c.length, j = 0, f = function() {
        if (!(--i)) h();
    }
    for ( ; j<i; j++) {
        (!c[j].fired?c[j].subscribeOnce(f):i--);
    }
    if (!i) h();
}


/**
 * onDOMContentLoaded channel is fired when the DOM content 
 * of the page has been parsed.
 */
PhoneGap.onDOMContentLoaded = new PhoneGap.Channel();

/**
 * onNativeReady channel is fired when the PhoneGap native code
 * has been initialized.
 */
PhoneGap.onNativeReady = new PhoneGap.Channel();

/**
 * onDeviceReady is fired only after both onDOMContentLoaded and 
 * onNativeReady have fired.
 */
PhoneGap.onDeviceReady = new PhoneGap.Channel();


// Compatibility stuff so that we can use addEventListener('deviceready')
// and addEventListener('touchstart')
PhoneGap.m_document_addEventListener = document.addEventListener;

document.addEventListener = function(evt, handler, capture) {
    if (evt === 'deviceready') {
        PhoneGap.onDeviceReady.subscribeOnce(handler);
    } else {
        PhoneGap.m_document_addEventListener.call(document, evt, handler, capture);
    }
};

PhoneGap.m_element_addEventListener = Element.prototype.addEventListener;

/**
 * For BlackBerry, the touchstart event does not work so we need to do click
 * events when touchstart events are attached.
 */
Element.prototype.addEventListener = function(evt, handler, capture) {
    if (evt === 'touchstart') {
        evt = 'click';
    }
    PhoneGap.m_element_addEventListener.call(this, evt, handler, capture);
};

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since 
// it may be called before any PhoneGap JS is ready.
if (typeof _nativeReady !== 'undefined') { PhoneGap.onNativeReady.fire(); }

PhoneGap.Channel.join(function() {
    PhoneGap.onDeviceReady.fire();
}, [ PhoneGap.onDOMContentLoaded, PhoneGap.onNativeReady ]);


// Listen for DOMContentLoaded and notify our channel subscribers
document.addEventListener('DOMContentLoaded', function() {
    PhoneGap.onDOMContentLoaded.fire();
}, false);


PhoneGap.close = function(context, func, params) {
    if (typeof params === 'undefined') {
        return function() {
            return func.apply(context, arguments);
        }
    } else {
        return function() {
            return func.apply(context, params);
        }
    }
};
