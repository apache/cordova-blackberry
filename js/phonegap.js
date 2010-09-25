PhoneGap = { };
navigator = { };

PhoneGap.Device = {
  platform: phonegap.device.platform,
  version:  blackberry.system.softwareVersion,
  name:     blackberry.system.model,
  uuid:     phonegap.device.uuid,
  phonegap: phonegap.device.phonegap
};
window.device = navigator.device = PhoneGap.Device;

PhoneGap.Notification = {
  vibrate: function(duration) {
    PhoneGap.exec(null, null, 'Notification', 'vibrate', [duration]);
  },
  
  beep: function(count) {
    PhoneGap.exec(null, null, 'Notification', 'beep', [count]);
  },
  
  alert: function(message, title, buttonLabel) {
    PhoneGap.exec(null, null, 'Notification', 'alert', [message, title, buttonLabel]);
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
    PhoneGap.exec(reachabilityCallback, null, 'Network Status', 'isReachable', [domain]);
  }
};

navigator.network = PhoneGap.Network;

DestinationType = {
  DATA_URL: 0,
  FILE_URI: 1
};

PhoneGap.Camera = {
  getPicture: function(cameraSuccessCallback, cameraFailCallback, args) {
    PhoneGap.exec(cameraSuccessCallback, cameraFailCallback, 'Camera', 'getPicture', [args]);
  }
};
navigator.camera = PhoneGap.Camera;

/**
 * phonegap.Logger is a Blackberry Widget extension that will log to the 
 * BB Event Log and System.out.  Comment this line to disable.
 */ 
phonegap.Logger.enable();

/**
 * If Blackberry doesn't define a console object, we create our own.
 * console.log will use phonegap.Logger to log to BB Event Log and System.out.
 * Optionally, use <div/> console output for in-your-face debugging :)
 */
if (typeof console == "undefined") {
    
	console = new Object();
    
    console.log = function(msg) {
    	phonegap.Logger.log(msg);
    	
        /* just don't call console.log before the page loads 
        if (document.getElementById("consoleOutput")==null) {
        	var consoleDiv = document.createElement('div');
        	consoleDiv.id = 'consoleOutput';
        	document.getElementsByTagName("body")[0].appendChild(consoleDiv);
        }
        document.getElementById("consoleOutput").innerHTML += "<p>" + msg + "</p>"; 
        */
	}
}

/* ----- phonegap.blackberry-widgets.js ------ */

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
