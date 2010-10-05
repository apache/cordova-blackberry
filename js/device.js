
/**
 * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
  this.platform = phonegap.device.platform;
  this.version  = blackberry.system.softwareVersion;
  this.name     = blackberry.system.model;
  this.uuid     = phonegap.device.uuid;
  this.phonegap = phonegap.device.phonegap;
};

PhoneGap.addConstructor(function() {
  navigator.device = window.device = new Device();
  PhoneGap.onPhoneGapInfoReady.fire();
});
