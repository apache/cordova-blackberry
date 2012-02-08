/*
 * Example usage of the plugin:
 *
 *   window.plugins.example.echo(
 *       // argument passed to the native plugin
 *       'Hello Cordova',
 *
 *       // success callback
 *       function(response) {
 *           alert(response);
 *       },
 *
 *       // error callback
 *       function(error) {
 *           alert('error: ' + error);
 *       }
 *   );
 */
(function() {
    var Example = function() {
        return {
            echo: function(message, successCallback, errorCallback) {
                Cordova.exec(successCallback, errorCallback, 'Example', 'echo', [ message ]);
            }
        }
    };

    Cordova.addConstructor(function() {
        // add plugin to window.plugins
        Cordova.addPlugin('example', new Example());
    });
})();
