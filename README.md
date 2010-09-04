PhoneGap BlackBerry Widget
==========================

[PhoneGap framework](http://www.phonegap.com/) for the BlackBerry Web Widget platform. 

Directory Structure
-------------------

    framework/ ... BlackBerry Widget Extension (PhoneGap native code)
    js/ .......... Uncompiled PhoneGap JavaScript
    template/ .... Project template used to create a new project

Introduction
------------

The Blackberry Widget SDK provides a new framework for developing applications for Blackberry devices that support Blackberry OS 5.0 and higher.  In this framework, lightweight web applications called Blackberry Widgets can make use of device specific features and data through the use of the Blackberry Widget APIs.

Access to device information, file I/O, data access, etc. is done using Blackberry Widget Extensions, written in native Java code, that can be invoked by the Blackberry Widget framework.  It is therefore helpful to think of a Widget application as having two parts:

1. The Widget, or web application, consisting of HTML, CSS, JavaScript, and
2. The Extension, or native Java code that has access to the Widget APIs.

The PhoneGap BlackBerry Widget project implements the common PhoneGap API for BlackBerry Widgets. This project allows you to create projects that leverage the common PhoneGap API, PhoneGap plugins, and your own BlackBerry Widget extensions.


Minimum Requirements
--------------------

1. Windows XP and Windows 7 (32-bit and 64-bit).
2. [Sun Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html#jdk), version 1.6 (32-bit).
3. [Blackberry Widget SDK 1.0](http://na.blackberry.com/eng/developers/browserdev/widgetsdk.jsp).
4. [Apache ANT](http://ant.apache.org/bindownload.cgi)

Additional Requirements for Developing with Eclipse
---------------------------------------------------

1. Eclipse 3.5.
2. [Blackberry Web Plugin for Eclipse v2.0](http://na.blackberry.com/eng/developers/browserdev/eclipseplugin.jsp).
3. Blackberry Widget SDK 1.0 Plugin for Eclipse

Creating a PhoneGap Project
---------------------------

1. `cd phonegap-blackberry-widget`
2. `ant help` to read the command-line tool options
3. `ant create -Dproject.path="C:\development\my_widget_project"`
4. `cd C:\development\my_widget_project`

Running a PhoneGap Project
--------------------------

1. `cd C:\development\my_widget_project`
2. `ant help` to read the command-line tool options
3. `ant load-simulator` to run the widget on the simulator
4. `ant load-device` to run the widget on the device

Running PhoneGap Widget from a Command Line Environment
-------------------------------------------------------

The Blackberry Widget SDK comes with everything necessary to compile and run a Blackberry Widget application, including the Blackberry Widget Packager utility, and a Blackberry Smartphone Simulator.  

To compile and run the phonegap-blackberry-widget code using only the command line: 

1. Download and install the Blackberry Widget SDK. 
2. Add the `bbwp.exe` utility to your `PATH` environment variable.  
	* For example, `PATH=%PATH%;C:\Program Files\Research In Motion\BlackBerry Widget Packager` 
	* Note: the `bbwp.exe` utility is NOT in the `..\Blackberry Widget Packager\bin` directory, but the root directory
3. Build the phonegap-blackberry-widget project using the supplied Ant `build.xml` script.  This script does the following:
	1. Packages the phonegap-blackberry-widget code and web application resources for the Blackberry Widget Packager utility.
	2. Invokes the Blackberry Widget Packager utility to compile the source and create Blackberry application files (.cod, .alx, .jad, .cso, .csl).
	3. Launches the default Blackberry simulator and loads the application.
	
	$ cd phonegap-blackberry-widget
	$ ant load-simulator
	
	
Running PhoneGap Widget Using Eclipse
-------------------------------------

It is best to setup two projects in Eclipse: a Java project for the Widget Extension native Java code, and a Blackberry Widget project for the web application code and resources. 	

After installing Eclipse, you must install the Blackberry Web Plugin 2.0 and Blackberry Widget SDK Plugin 1.0 into the Eclipse environment.

1. Open Eclipse
2. Help -> Install New Software... -> Click Add...
	* Name: Blackberry Update - Web
	* Location: http://www.blackberry.com/go/eclipseUpdate/3.5/web
3. Select Blackberry Web Plugin and Blackberry Widget SDK
	* Note: Even if the Widget SDK is already installed on your system, you must install the Widget SDK plugin to enable Blackberry Widget project capabilities within Eclipse.
4. Restart Eclipse


Setup Extension Project
-----------------------

1. Create a Java project
	1. `File > New > Project... > Java Project`
		* Project Name: PhoneGapBlackberryExtension (Do NOT use special characters or whitespace in Blackberry Widget project names, as the RAPC compiler will choke on them).
		* JRE > Use a project specific JRE: Blackberry JRE 5.0.0
2. Import the phonegap extension code
	1. Select the PhoneGapBlackberryExtension project
	2. File -> Import -> `phonegap-blackberry-widget/framework/ext`


Setup Widget Project
--------------------

1. Create a BlackBerry Widget project
    1. `File > New > BlackBerry Widget Project`
        * Project Name: PhoneGapBlackberryWidget
        * Start Page: index.html
2. Import the PhoneGap widget code
	1. In the project tree, right-click on the widget project and select `Import...`
	2. Select `General > Filesystem`
	3. Import `phonegap-blackberry-widget/www`
	4. Select `config.xml` and `index.html`
	5. Select `ext` and `javascript` folders
3. Change PhoneGap widget name
	1. Open `config.xml`
	2. Click `Overview` tab
		* Name: PhoneGap Widget
4. Build the widget
    1. Select the project, right-click and select `Build and Sign BlackBerry Widget Project`
5. Run the widget
    1. Select the project, right-click and select `Run > Run as > Blackberry Simulator`

Troubleshooting
---------------

__Q: I uploaded my application to the BlackBerry device, but it will not open or run.__

__A:__ Try hard resetting the device by pressing and hold ALT + CAPS LOCK + DEL. You must press and hold each key in sequence and not all at once.

__Q: My simulator screen is not refreshing and I see blocks on a clicked position.__

__A:__ Windows 7 and the simulator's graphics acceleration do not mix. On the simulator, set View -> Graphics Acceleration to Off.