PhoneGap BlackBerry Widget
==========================

[PhoneGap framework](http://www.phonegap.com/) for the BlackBerry Web Widget platform. 

Directory Structure
-------------------


    framework/ ..... BlackBerry Widget Extension (PhoneGap native code).
    js/ ............ PhoneGap JavaScript
    lib/ ........... Compiled Extension
    www/ ........... App


Setup Extension Project
-----------------------

1. Open Eclipse
2. File -> Import -> `phonegap-blackberry-widget/framework/ext`
3. Project -> BlackBerry -> Package Widget

Setup Widget Project
--------------------

1. Create a BlackBerry Widget project
    1. `File > New > BlackBerry Widget Project`
        * Project Name: HelloWorld
        * Start Page: index.html
2. Add PhoneGap extension
    1. Import phonegap.jar
        1. In the project tree, right-click on `ext` and select `import`
        2. Select `General > Filesystem`
        3. Import `phonegap-blackberry-widget/lib/phonegap.jar`
    2. Add PhoneGap to Widget Permission
        1. Open `config.xml`
        2. Click `Widget Permissions` tab at the bottom-left
        3. Click `Add Feature`
        4. Add `phonegap` and `blackberry.system`
3. Add PhoneGap javascript file
    1. Create a new directory called `js/`
    2. Import `lib/phonegap.js` into `js/`
    3. Include `js/phonegap.js` in index.html
        * `<script type="text/javascript" src="js/phonegap.js"></script>`
4. Build the widget
    1. Select `Project > Build and Sign BlackBerry Widget Project`
5. Run the run widget
    1. Select `Run > Run as > Simulator`
        * If the simulator screen does not respond, then try turning on graphics acceleration with `View > Graphics Acceleration > Off`
