PhoneGap BlackBerry Widget
==========================
[PhoneGap framework](http://www.phonegap.com/) for the BlackBerry Web Widget platform. 

Directory Structure
-------------------
<pre>
  example/ ....... An example BlackBerry Widget project using the PhoneGap framework
  framework/ ..... PhoneGap framework source code. Only needed for contributors.
  lib/ ........... Libraries necessary for your own BlackBerry Widget projects
</pre>

Requirements
------------

Setup
-----

Getting Started
---------------
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
4. Create your Web Application
    * Edit `index.html`
    * Be sure to include