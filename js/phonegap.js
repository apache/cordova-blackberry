PhoneGap = { };
navigator = { };

PhoneGap.Device = {
  platform: phonegap.device.platform,
  version:  blackberry.system.softwareVersion,
  name:     blackberry.system.model,
  uuid:     phonegap.device.uuid
};
window.device = navigator.device = PhoneGap.Device;

PhoneGap.Notification = {
  vibrate: function(duration) {
    PhoneGap.execSync('com.phonegap.Notification', 'vibrate', [duration]);
  },

  beep: function(count) {
    PhoneGap.execSync('com.phonegap.Notification', 'beep', [count]);
  },
  
  alert: function(message, title, buttonLabel) {
    PhoneGap.execSync('com.phonegap.Notification', 'alert', [message, title, buttonLabel]);
  }
};

navigator.notification = PhoneGap.Notification;

NetworkStatus = {
  NOT_REACHABLE: 0,
  REACHABLE_VIA_CARRIER_DATA_NETWORK: 1,
  REACHABLE_VIA_WIFI_NETWORK: 2
};

PhoneGap.Network = {
  isReachable: function(domain, reachabilityCallback) {
    PhoneGap.exec(reachabilityCallback, function() {}, 'com.phonegap.Network', 'isReachable', [domain]);
  }
};

navigator.network = PhoneGap.Network;

/* ----- phonegap.blackberry-widgets.js ------ */

PhoneGap.EXEC_SYNC  = 0;
PhoneGap.EXEC_ASYNC = 1;

PhoneGap.callbackId = 0;
PhoneGap.callbacks  = {};

PhoneGap.resolveKlass = function(klass) {
    if (klass.toLowerCase() === 'com.phonegap.notification') {
        klass = 'com.phonegap.notification.Notification';
    }
    else if (klass.toLowerCase() === 'com.phonegap.network') {
        klass = 'com.phonegap.network.Network';
    }
    
    return klass;
}

PhoneGap.exec = function(success, fail, klass, action, args) {
    klass = PhoneGap.resolveKlass(klass);
    
    var callbackId = klass + PhoneGap.callbackId++;
    
    PhoneGap.callbacks[callbackId] = { success:success, fail:fail };

    return phonegap.commandManager.exec(klass, action, callbackId, JSON.stringify(args));
}

PhoneGap.callbackSuccess = function(callbackId, args) {
    PhoneGap.callbacks[callbackId].success(args);
    PhoneGap.clearExec(callbackId);
};

PhoneGap.callbackError = function(callbackId, args) {
    PhoneGap.callbacks[callbackId].fail(args);
    PhoneGap.clearExec(callbackId);
};

PhoneGap.clearExec = function(callbackId) {
    delete PhoneGap.callbacks[callbackId];
};

PhoneGap.execSync = function(klass, action, args) {
    klass = PhoneGap.resolveKlass(klass);
    
    return phonegap.commandManager.exec(klass, action, null, JSON.stringify(args), PhoneGap.EXEC_SYNC);
}

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