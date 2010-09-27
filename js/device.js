/**
 * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
PhoneGap.Device = {
  platform: phonegap.device.platform,
  version:  blackberry.system.softwareVersion,
  name:     blackberry.system.model,
  uuid:     phonegap.device.uuid,
  phonegap: phonegap.device.phonegap
}

window.device = navigator.device = PhoneGap.Device;
