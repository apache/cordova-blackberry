
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.battery
 */
(function() {
    /**
     * Check to see that navigator.battery has not been initialized.
     */
    if (typeof navigator.battery !== "undefined") {
        return;
    }
    /**
     * This class contains information about the current battery status.
     * @constructor
     */
    var Battery = function() {
        this._level = null;
        this._isPlugged = null;
        this._batteryListener = [];
        this._lowListener = [];
        this._criticalListener = [];
        // Register one listener to each of level and state change events using WebWorks API.
        blackberry.system.event.deviceBatteryStateChange(this._stateChange);
        blackberry.system.event.deviceBatteryLevelChange(this._levelChange);
    };

    /**
     * Registers as an event producer for battery events.
     *
     * @param {Object} eventType
     * @param {Object} handler
     * @param {Object} add
     */
    Battery.prototype.eventHandler = function(eventType, handler, add) {
        var me = navigator.battery;
        if (add) {
            // Register the event listener in the proper array
            if (eventType === "batterystatus") {
                var pos = me._batteryListener.indexOf(handler);
                if (pos === -1) {
                    me._batteryListener.push(handler);
                }
            } else if (eventType === "batterylow") {
                var pos = me._lowListener.indexOf(handler);
                if (pos === -1) {
                    me._lowListener.push(handler);
                }
            } else if (eventType === "batterycritical") {
                var pos = me._criticalListener.indexOf(handler);
                if (pos === -1) {
                    me._criticalListener.push(handler);
                }
            }
        } else {
            // Remove the event listener from the proper array
            if (eventType === "batterystatus") {
                var pos = me._batteryListener.indexOf(handler);
                if (pos > -1) {
                    me._batteryListener.splice(pos, 1);
                }
            } else if (eventType === "batterylow") {
                var pos = me._lowListener.indexOf(handler);
                if (pos > -1) {
                    me._lowListener.splice(pos, 1);
                }
            } else if (eventType === "batterycritical") {
                var pos = me._criticalListener.indexOf(handler);
                if (pos > -1) {
                    me._criticalListener.splice(pos, 1);
                }
            }
        }
    };

    /**
     * Callback for battery state change using WebWorks API
     *
     * @param {Object} state
     */
    Battery.prototype._stateChange = function(state) {
        var me = navigator.battery;
        if (state === 2 || state === 3) { // state is either CHARGING or UNPLUGGED
          var info = {
            "level":me._level,
            "isPlugged":me._isPlugged
          };

          if (state === 2 && (me._isPlugged === false || me._isPlugged === null)) {
            me._isPlugged = info.isPlugged = true;
            me._fire('status', info);
          } else if (state === 3 && (me._isPlugged === true || me._isPlugged === null)) {
            me._isPlugged = info.isPlugged = false;

            me._fire('status', info);
          }
        }
    };

    /**
     * Callback for battery level change using WebWorks API
     *
     * @param {Object} level
     */
    Battery.prototype._levelChange = function(level) {
        var me = navigator.battery;

        if (level != me._level) {
          me._level = level;
          var info = {
            "level":me._level,
            "isPlugged":me._isPlugged
          };

          // Fire off the basic battery status change event listeners.
          me._fire('status', info);

          // Fire low battery events if applicable
          if (level == 20 || level == 5) {
              if (level == 20) {
                me._fire('low', info);
              } else {
                me._fire('critical', info);
              }
          }
        }
    };

    /**
     * Helper function to fire all listeners of a type.
     *
     * @param {Object} type
     * @param {Object} data
     */
    Battery.prototype._fire = function(type, data) {
      var targetAr = '_batteryListener';

      if (type == 'critical') {
        targetAr = '_criticalListener';
      } else if (type == 'low') {
        targetAr = '_lowListener';
      }
      for (var i = 0, l = this[targetAr].length; i < l; i++) {
        this[targetAr][i](data);
      }
    };

    PhoneGap.addConstructor(function() {

        if (typeof navigator.battery === "undefined") {
            navigator.battery = new Battery();
            PhoneGap.addWindowEventHandler("batterystatus", navigator.battery.eventHandler);
            PhoneGap.addWindowEventHandler("batterylow", navigator.battery.eventHandler);
            PhoneGap.addWindowEventHandler("batterycritical", navigator.battery.eventHandler);
        }
    });

}());
