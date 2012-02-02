
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Provides the ability to override the behavior of button events.
 */
(function() {

    // Ensure that event handlers are only registered once.
    if (typeof PhoneGap.documentEventHandler['backbutton'] !== "undefined") {
        return;
    }

    // Only attempt to capture button events if the application has the
    // required permission.
    if (typeof blackberry.system.event === "undefined"
            || blackberry.system.event === null) {
        return;
    }

    /**
     * Physical buttons on the BlackBerry device that can be captured. Key is
     * the javascript event to listen for on the document object. Value is the
     * associated BlackBerry key identifier.
     */
    var buttonMapping = {
        'backbutton' : blackberry.system.event.KEY_BACK,
        'conveniencebutton1' : blackberry.system.event.KEY_CONVENIENCE_1,
        'conveniencebutton2' : blackberry.system.event.KEY_CONVENIENCE_2,
        'endcallbutton' : blackberry.system.event.KEY_ENDCALL,
        'menubutton' : blackberry.system.event.KEY_MENU,
        'startcallbutton' : blackberry.system.event.KEY_STARTCALL,
        'volumedownbutton' : blackberry.system.event.KEY_VOLUMEDOWN,
        'volumeupbutton' : blackberry.system.event.KEY_VOLUMEUP
    };

    /**
     * A map of events to listener arrays.  The keys must match the keys
     * specified for buttonMapping.
     */
    var buttonListeners = {
        'backbutton' : [],
        'conveniencebutton1' : [],
        'conveniencebutton2' : [],
        'endcallbutton' : [],
        'menubutton' : [],
        'startcallbutton' : [],
        'volumedownbutton' : [],
        'volumeupbutton' : []
    };

    /**
     * Helper function to generate a function that fires the specified event.
     *
     * @param {Object}
     *            event - the event to fire.
     */
    var fireEvent = function(event) {
        return function() {
            PhoneGap.fireDocumentEvent(event, null);
        };
    };

    var Button = function() {
    };

    /**
     * Handle addEventListener() and removeEventListener() for button events.
     *
     * @param {Object}
     *            eventType - one of the key identifiers from buttonMapping.
     * @param {Object}
     *            handler - function to call when eventType occurs.
     * @param {Object}
     *            add - whether to add or remove the event listener.
     */
    Button.prototype.eventHandler = function(eventType, handler, add) {
        // Nothing to do if an eventType or handler is not specified.
        if (eventType === null || handler === null) {
            return;
        }

        if (typeof buttonMapping[eventType] !== 'undefined') {
            // Check if the handler already exists in the list of handlers for
            // this event.
            var pos = buttonListeners[eventType].indexOf(handler);

            if (add) {
                // Add the handler to the list of handlers for this event if
                // it doesn't exist.
                if (pos === -1) {
                    // If this is the first handler for this event, register a
                    // button listener.
                    if (buttonListeners[eventType].length === 0) {
                        blackberry.system.event.onHardwareKey(
                                buttonMapping[eventType], fireEvent(eventType));
                    }

                    buttonListeners[eventType].push(handler);
                }
            } else {
                // Remove the handler from the list of handlers for this
                // event if it was found.
                if (pos > -1) {
                    buttonListeners[eventType].splice(pos, 1);

                    // If there are no more handlers for the event, remove
                    // the button listener.
                    if (buttonListeners[eventType].length === 0) {
                        // Specifying null as the function removes the button
                        // listener. This sets behavior back to default for the
                        // button.
                        blackberry.system.event.onHardwareKey(
                                buttonMapping[eventType], null);
                    }
                }
            }
        }
    };

    PhoneGap.addConstructor(function() {
        var button = new Button();

        // Register button event handlers so application can listen for events.
        for (var item in buttonMapping) {
            PhoneGap.addDocumentEventHandler(item, button.eventHandler);
        }
    });
}());
