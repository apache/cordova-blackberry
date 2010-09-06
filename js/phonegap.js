PhoneGap = { };
navigator = { };

PhoneGap.Device = {
  //platform: phonegap.device.platform,
  //version:  blackberry.system.softwareVersion,
  //name:     blackberry.system.model,
  //uuid:     phonegap.device.uuid
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