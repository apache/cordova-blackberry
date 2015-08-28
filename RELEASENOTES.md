<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
## Release Notes for Cordova BlackBerry ##

## 3.8.0 ###

* CB-8306 Fix parseUri to handle http://foo/bar?a@b.com&whatever
* CB-7807 Add BlackBerry10 platform to a project on any workstation OS
* CB-8417 moved platform specific js into platform
* CB-8417 renamed platform_modules into cordova-js-src
* CB-8899 stick to grunt-jasmine-node@0.2.1
* CB-9072 Fix exception logging in packager.js
* CB-9010 Adds check_reqs implementation
* CB-8941 Adds support for subdomain whitelisting
* CB-6768 Handle icons outside of www/.
* CB-9009 include http://localhost:8472 in Content-Security-Policy header
* CB-6768 Default Icon is now copied into platform_www.

## 3.7.0 ###

* CB-8161 Run: accept --nobuild as alias to --no-build

## 3.6.3 ###

* CB-7835 Control whether applications run with spatialNavigation mode
* CB-7658 generateTabletXMLFile only do munging if config.configFileInjections has elements
* CB-7535 DiskCache - change default to enable
* CB-7462 Change WebInspector dialog to a toast

### 3.6.0 ###

* Set VERSION to 3.6.0 (via coho)
* Update JS snapshot to version 3.6.0 (via coho)
* CB-7409 update CORDOVA_HOME_DIR based on npm_cache
* CB-7411 Make version in version script easier to replace by coho
* CB-7336 Add bundledDependencies to package.json
* CB-7211 jshint: force to see all errors
* CB-7210 cleanup create remove clean/copyJavascript
* CB-7250 test/cordova/integration/target use private home
* CB-7209 Improve tests including adding parallelism support
* CB-7209 Improve tests including adding parallelism support
* CB-7186 fix up packager-validator tests to indicate signing
* CB-7186 --no-signing will be ignored if --buildId is set
* Update package name to match convention (cordova-[platform name])
* CB-5815 cordova not defined when pausing w/o cordova.js included
* CB-7119 cordova run --target xxx dies if blackberry10.json is empty
* CB-7087 Retire blackberry10/ directory
* CB-6492 AppData hint is wrong for wXP
* CB-7036 make npm test work again (using grunt instead of jake)
* CB-7025 report platform update
* CB-6968 fix bashism (source) in update script and bb10-ndk-version
* CB-6934 run should complain about target w/o ip before password
* CB-6925 simulator detection: fail gracefully w/ no DHCP leases
* CB-6904 Improve Markdown in README.md
* CB-5436 Update defaults.xml and config.xml configuration reference
* CB-6850 use path.join() for blackberry10debugtoken.bar warning
* CB-6757 Provide useful hint when simulator does not seem to know its IP
* CB-5654 Log 'native' Cordova version during framework bootstrap
* CB-6786 Add license to CONTRIBUTING.md
* CB-6730: Tweak whitelist URI parsing to fix whitelist issues with @2x resource naming
* CB-6554 fix malformed json file
* updated package.json version
* Update JS snapshot to version 3.6.0-dev (via coho)
* Set VERSION to 3.6.0-dev (via coho)

### 3.1.0 ###

[CB-4268] Rework util functions to support getting list of connected devices / emulators
[CB-4268] Add support for --device and --emulator to run script
[CB-4292] Update plugman to 0.9.10
[CB-4342] Detect USB connected device
[CB-4065] Remove lib files after frameworkModules.js is generated
[CB-4734] Fixed issue where plugins are not added to frameworkModules
[CB-4423] Warn when special characters are used in create script
[CB-4344] Auto-detect started simulator
[CB-4272] Improve error messages related to debug tokens and signing
[CB-4292] Remove remaining plugins
[CB-4481] Removing permissions from template since not all apps should need them
[CB-4259] Removing plugman and cordova/plugin script
[CB-4634] Updating the default app to match cordova-app-hello-world
[CB-4544] Adds a --query flag to query the user for their password when we need it      - Rewrite the run script for maintenance
[BlackBerry10] Fixing a bug with debugtoken generation without prompt
Updating scripts to make init calls surrounded in quotes
[BlackBerry10] Updated init to work on Windows 7 with long paths         with spaces
[CB-4730] [BlackBerry10] Updating init calls to work on Win 7 64         with long paths.
[CB-4785] Fixing --no-build flag for run command
[CB-4732] Re-writing build script to use async
Syncing hello-world-app for 3.1 release
[CB-4076] Added support for the origin attribute in config.xml
[CB-4076] Modified config-parser to default to the uri attribute
[CB-4563] Migrated blackberry.app parameters to preferences
[CB-4812] Support for "default" value in the orientation preference
[CB-3798] Provide support for optional localized node/npm/bb-tools
Plugman version bump to 0.10.0
[CB3439] Introduces --web-inspector flag to enable webinspector for signed builds
[CB-3798] Fixed CORDOVA_BBTOOLS env variable with spaces in path
[CB-3798] Refactored all exec calls to use newly created utility exec function to avoid path with spaces errors
corrected playbook create tool usage
[CB-4346] changed utils genbarname function to return string as per ticket description, updated README.md section on create command
CB-4875 updated readme with info on accessing last supported versions of BBOS and Playbook
CB-4876 removal of playbook implementation

