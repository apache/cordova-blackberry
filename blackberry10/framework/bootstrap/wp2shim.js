/**
 * Loads the shim file when appropriate
 */
function start() {
    //Must load jnext first, as there seemed to be a race condition for if it was defined before it was used
    require("lib/jnext.js");
    require(frameworkModules, function () {
        require('lib/framework').start();
    });
}

if (window.wp === undefined) {
    var wpScript = document.createElement('script'),
        shimScript = document.createElement('script'),
        fragment = document.createDocumentFragment();

    wpScript.setAttribute('src','platform:///webplatform.js');
    shimScript.setAttribute('src','local:///chrome/wp-legacy.js');
    shimScript.onload = start;
    fragment.appendChild(wpScript);
    fragment.appendChild(shimScript);
    document.head.appendChild(fragment);
} else {
    start();
}
