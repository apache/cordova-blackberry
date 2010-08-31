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


