Apache Cordova for BlackBerry 10
================================

---
📌 **Deprecation Notice**

This repository is deprecated and no more work will be done on this by Apache Cordova. You can continue to use this and it should work as-is but any future issues will not be fixed by the Cordova community.

Feel free to fork this repository and improve your fork. Existing forks are listed in [Network](../../network) and [Forks](../../network/members).

- Learn more: https://github.com/apache/cordova/blob/master/deprecated.md#deprecated-platforms
---

**Apache Cordova** is an application development platform that allows you to use common web technologies, primarily **HTML5**, **JavaScript**, and **CSS**, to create applications for mobile devices. **Cordova** uses a standard set of APIs to access common device features. Additional plugins allow you to access **BlackBerry 10** specific APIs, so that you can extend your application to tightly integrate with the **BlackBerry 10 OS**.

Requirements
------------

Cordova for BlackBerry 10 has the following software requirements:

-   **Windows XP** (32-bit), **Windows 7** (32-bit and 64-bit), or **Mac OS X** 10.6.4+
-   **Node.js** (> 0.9.9) [Download node.js now](http://nodejs.org/)
-   **BlackBerry 10 Native SDK**. [Download the BlackBerry 10 Native SDK now.](http://developer.blackberry.com/native/download/)

    After installing the Native SDK, its tools must be added to your system path. Either manually add the bin directory to your path or run the following scripts:
    -    *Linux/OS X* `source [BBNDK directory]/bbndk-env.sh`
    -    *Windows* `[BBNDK directory]\bbndk-env.bat`
    
Conventions
-----------
The instructions in this document will generally use `/` as the path separator. On *Windows*, you should enter `\` where you see `/` in these instructions.

Setting up your signing keys
----------------------------

Before starting development, you'll need to register for your code signing key and debug token. The signing key allows you to sign your completed app so that you can distribute it through **BlackBerry World**. The debug token allows you to test an unsigned app on a BlackBerry 10 device. You do not need to create and install the debug token yourself; if you supply the keystore password, the build script will create and install the debug token for you.

-   [Register for your code signing key now.](https://www.blackberry.com/SignedKeys/codesigning.html)
-   [Set your computer up for code signing. ](http://developer.blackberry.com/html5/documentation/set_up_for_signing.html)
-   [Learn more about debug tokens.](http://developer.blackberry.com/html5/documentation/running_your_bb10_app_2008471_11.html)

Creating your project
-------------------------

To create a new project, you use the `create` command to set up the folder structure for your app.

1.  On the command line, navigate to the folder where you extracted Cordova.
2.  Run the `create` command using the following syntax:

        bin/create <path-to-project> [<project-package> [<project-name> [<path-to-www-template>]]]

This command creates the folder structure for your project at the specified location. All of your project resource files should be stored in the `<path-to-project>/www` folder, or in a subfolder within it.

where

- `<path-to-project>` specifies the directory to create for your project
- `<project-package>` specifies a reverse domain style identifier
- `<project-name>` specifies the app's display name
- `<path-to-www-template>` specifies the directory to use as a template

Adding and managing targets
---------------------------

A target refers to a **BlackBerry 10** *device* or *simulator* that you will use to test your app. Targets are added directly to your project; you can add multiple targets to your project, each with a unique name. Then, when you want to deploy your app to a particular target, you can simply refer to that target by name when you run your script.

###Add a target

To add a target, on the command line, type the following command:

        <path-to-project>/cordova/target add <name> <ip-address> [--type simulator] [--password <password>] [--pin <device-pin>]

where

-   `<name>`  specifies a unique name for the target.
-   `<ip-address>`  specifies the ip address of the **BlackBerry 10** *device* or *simulator*.
-   `--type simulator` If not provided, *device* is assumed.
-   `--password <password>`  specifies the password for the *device*/*simulator*. This is only necessary if the *device*/*simulator* is password protected.
-   `--pin <device-pin>`  specifies the `PIN` of the **BlackBerry 10** *device*, which identifies that device as a valid host for the debug token. This argument is required only if you are creating a *debug token*.

###Remove a target

To remove a target, on the command line, type the following command:

        <path-to-project>/cordova/target remove <name>

Building your app
-----------------

To build your app, run the `build` script. You can build the app in either *release mode* or in *debug mode*.

-   When you build the app in *release mode*, you are preparing it for distribution through **BlackBerry World**. The script packages your app resources and plugins together in a `.bar file`, then *signs* the app.
-   When you build the app in *debug mode*, you are preparing it to be tested. The script packages your app resources and plugins together in a `.bar file`, but does not sign it. The script can also deploy the app onto a previously defined target. If you have not already created and installed a *debug token*, you can supply the keystore password, and the build script will create and install the *debug token* for you as well.

    *Debug mode* also enables **Web Inspector** for the app, which allows you to remotely inspect the source code. A prompt displays the URL that you can use to connect to and inspect your app. For more information on using **Web Inspector**, see [Debugging using Web Inspector](http://developer.blackberry.com/html5/documentation/web_inspector_overview_1553586_11.html).

###Build your app in release mode

To build your app in release mode, on the command line, type the following command:

        <path-to-project>/cordova/build release [<target>] [--keystorepass <password>] [--buildId <number>] [--params <params-JSON-file>]

where

-   `<target>`  specifies the name of a previously added target. If `<target>`  is not specified, the default target is used, if one has been created. This argument is only required if you want the script to deploy your app to a BlackBerry device or emulator and you have not created a default target. Additionally, if `<target>`  is a device, then that device must be connected to your computer by USB connection or be connected to the same Wi-Fi network as your computer.
-   `--keystorepass <password>`  specifies the password you defined when you configured your computer to sign applications (by default you'll be prompted for this if it isn't otherwise configured).
-   `--buildId <number>`  specifies the build version number of your application. Typically, this number should be incremented from the previous signed version. This argument is optional.
-   `--params <params-JSON-file>`  specifies a JSON file containing additional parameters to pass to downstream tools. This argument is optional.

###Build your app in debug mode

To build your app in debug mode, on the command line, type the following command:

        <path-to-project>/cordova/build debug [<target>] [--params <params-JSON-file>] [--loglevel <error|warn|verbose>]

where

-   `<target>`  specifies the name of a previously added target. If `<target>`  is not specified, the default target is used, if one has been created. This argument is only required if you want the script to deploy your app to a BlackBerry device or emulator and you have not created a default target. Additionally, if `<target>`  is a device, then that device must be connected to your computer by USB connection or be connected to the same Wi-Fi network as your computer.
-   `--params <params-JSON-file>`  specifies a JSON file containing additional parameters to pass to downstream tools.
-   `--loglevel <level>`  specifies the log level. The log level may be one of `error`, `warn`, or `verbose`.

Note that all of these parameters are optional. If you have previously defined a default target (and installed a debug token, if that target is a BlackBerry device), you can run the script with no arguments, and the script will package your app and deploy it to the default target. For example:

        <path-to-project>/cordova/build debug

Deploying an app
-------------------------

You can test your app using either a BlackBerry device or an emulator. Before deploying your app, you must first create a target for the device or emulator you want to deploy your app to.

The run script will first build  your app. If you intend to deploy an app to a physical device for testing, you must first install a debug token on that device. If you specify the `--keystorepass <password>` argument when running the run script, the script will create and install the debug token for you. You do not need a debug token to test your app on an emulator, even if that app is unsigned.

To deploy your app to a device or emulator, on a command line type the following command:

        <path-to-project>/cordova/run <target> [--no-build]

where
-   `<target>`  specifies the name of a previously added target. If `<target>`  is a device, then that device must be connected to your computer by USB connection or be connected to the same Wi-Fi network as your computer.

-   `-no--build` will use the most recently built version of the application rather than re-building. This is useful to test an application in release mode.

Adding and managing plugins
---------------------------

To add additional functionality that is outside of the core features of Cordova, you'll need to add plugins. A plugin represents a set of APIs that provide access to additional features of the platform.

In order to use a plugin, you must first add it into your project. Once added into your project, the plugin will be bundled with your project during the build process, to ensure that your app has access to all the APIs it needs.

To add and manage plugins you can use the plugman tool. It is available via npm (ie npm install -g plugman)

###Add a plugin

To add a plugin, on the command line, type the following command:

        plugman install --platform blackberry10 --project . --plugin <id|path|url> [--variable NAME=name]

###Remove a plugin

To remove a plugin, on the command line, type the following command:

        plugman uninstall --platform blackberry10 --project . --plugin <id>

###View a list of installed plugins

To view a list of installed plugins, on the command line, type the following command:

        plugman ls

Historical notes
================

If you are looking for **BlackBerry Tablet OS** or **BBOS** *classic*, you need to check them out via a branch:

**BlackBerry Tablet OS**:

        git checkout 2.9.0

**BBOS** 5 to 7:

        git checkout 2.8.0
