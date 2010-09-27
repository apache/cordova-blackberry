
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
