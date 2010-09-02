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
  vibrate: phonegap.notification.vibrate,
  beep:    phonegap.notification.beep,
  alert:   phonegap.notification.alert
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
    var value = phonegap.commandManager.exec(klass, action, null, JSON.stringify(args), 0);
    alert(value);
    return value;
}