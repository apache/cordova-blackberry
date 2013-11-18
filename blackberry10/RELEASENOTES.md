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

### 3.2.0 ###

CB-5317 Move signing warn logic to build/run scripts
CB-5266 update create.js to copy all shell scripts regardless of host platform
CB-5254 log useful error info to std err
CB-5135 Mark scripts as requiring Bash instead of using a random system shell
Auto-detect started simulator on Linux
CB-4340 Auto-detect target pin when its not there
[CB-2980] Added the install-emulator script
[CB-2988] Added the install-device script
[CB-4913] Updates warnings to check for BBID token
CB-4876 removal of playbook implementation
CB-4875 updated readme with info on accessing last supported versions of BBOS and Playbook
[CB-4762] Added a fix to the run script to error out when the IP is not found
[CB-4785] Fixing --no-build flag for run command
[CB-4734] Added list of files to keep in chrome/lib
[CB-4734] Fixed issue where plugins are not added to frameworkModules
[CB-4730] [BlackBerry10] Updating init calls to work on Win 7 64     with long paths.
[BlackBerry10] Updated init to work on Windows 7 with long paths     with spaces
[BlackBerry10] Fixing a bug with debugtoken generation without prompt
[CB-4544] Adds a --query flag to query the user for their password when we need it  - Rewrite the run script for maintenance
[CB-4065] Remove lib files after frameworkModules.js is generated
[CB-4564]Only alow .js files into frameworkModules
[CB-4563] Migrated blackberry.app parameters to preferences
[CB-3798] Refactored all exec calls to use newly created utility exec function to avoid path with spaces errors
[CB-4343] Remove parsing of project name from create script.
[CB-4575] Removing plugman chmod change from creation as we no longer use plugman within the framework
[CB-4344] Auto-detect started simulator

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

