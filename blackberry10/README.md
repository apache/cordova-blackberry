Apache Cordova for BlackBerry 10
================================

Apache Cordova is an application development platform that allows you to use common web technologies, primarily HTML5, JavaScript, and CSS, to create applications for mobile devices. Cordova uses a standard set of APIs to access common device features. Additional plugins allow you to access BlackBerry specific APIs, so that you can extend your application to tightly integrate with the BlackBerry 10 OS.

Requirements
------------

Cordova for BlackBerry has the following software requirements:

-   Windows XP (32-bit) or Windows 7 (32-bit and 64-bit) or Mac OSX 10.6.4+
-   node.js (> 0.9.9) [Download node.js now](http://nodejs.org/)
-   BlackBerry 10 Native SDK. [Download the BlackBerry 10 Native SDK now.](http://developer.blackberry.com/native/download/)

    After installing the native SDK, its tools must be added to your system path. Either manually add the bin directory to your path or run the following scripts:
    -    [Linux/Mac] source [BBNDK directory]/bbndk-env.sh
    -    [Windows] [BBNDK directory]\bbndk-env.bat

Setting up your signing keys
----------------------------

Before starting development, you'll need to register for your code signing key and debug token. The signing key allows you to sign your completed app so that you can distribute it through BlackBerry World. The debug token allows you to test an unsigned app on a BlackBerry 10 device. You do not need to create and install the debug token yourself; if you supply the keystore password, the build script will create and install the debug token for you.

-   [Register for your code signing key now.](https://www.blackberry.com/SignedKeys/codesigning.html)
-   [Set your computer up for code signing. ](http://developer.blackberry.com/html5/documentation/set_up_for_signing.html)
-   [Learn more about debug tokens.](http://developer.blackberry.com/html5/documentation/running_your_bb10_app_2008471_11.html)

Creating your project
-------------------------

To create a new project, you use the `create` command to set up the folder structure for your app.

1.  On the command line, navigate to the folder where you extracted Cordova.
2.  Run the `create` command using the following syntax:

        bin/create <path-to-project>

This command creates the folder structure for your project at the specified location. All of your project resource files should be stored in the *<path-to-project>*/www folder, or in a subfolder within it.

Adding and managing targets
---------------------------

A target refers to a BlackBerry device or emulator that you will use to test your app. Targets are added directly to your project; you can add multiple targets to your project, each with a unique name. Then, when you want to deploy your app to a particular target, you can simply refer to that target by name when you run your script.

###Add a target

To add a target, on the command line, type the following command:

        <path-to-project>/cordova/target add <name> <ip-address> [-t | --type <device | simulator>] [-p | --password <password>] [--pin <device-pin>]

where

-   `<name>`  specifies a unique name for the target.
