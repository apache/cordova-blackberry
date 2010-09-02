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
  _reachabilityCallback: null,
  
  isReachable: function(domain, reachabilityCallback) {
    this._reachabilityCallback = reachabilityCallback;
    phonegap.network.isReachable();
  }
};
navigator.network = PhoneGap.Network;

PhoneGap.execSync = function(klass, action, args) {

    // Translate the klass paths
    
    if (klass.toLowerCase() === 'com.phonegap.notification') {
        klass = 'com.phonegap.notification.Notification';
    }
    
    return phonegap.commandManager.exec(klass, action, null, JSON.stringify(args), 0);
}