@ECHO OFF
goto comment
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
:comment
setlocal enabledelayedexpansion

set /P CORDOVA_VERSION=<"%~dp0..\VERSION"
set "CORDOVA_HOME_DIR=!USERPROFILE!\.cordova\lib\npm_cache\cordova-blackberry10\!CORDOVA_VERSION!"\package
set "LOCAL_NODE_BINARY=!CORDOVA_HOME_DIR!\bin\dependencies\node\bin"

set FOUNDWHERE=
for /f "usebackq delims=" %%e in (`where where 2^>nul`) do (
  if not defined FOUNDWHERE set "FOUNDWHERE=%%e"
)
if not defined FOUNDWHERE set "FOUNDWHERE=%~dp0\whereis"

if defined CORDOVA_NODE (
  if exist "!CORDOVA_NODE!" (
        goto end
  )
)

if exist "!LOCAL_NODE_BINARY!" (
  set "CORDOVA_NODE=!LOCAL_NODE_BINARY!"
) else (
  for /f "usebackq delims=" %%e in (`%FOUNDWHERE% node 2^>nul`) do (
    set "CORDOVA_NODE=%%~dpe"
  )
)

:end

if not exist "%LOCAL_NODE_BINARY%" (
  if not exist "%CORDOVA_NODE%\node.exe" (
    echo node cannot be found on the path. Aborting.
    exit /b 2
  )
)

:: Export variables we want to share with the caller
for /f "delims=" %%A in (""!CORDOVA_NODE!"") do (
      endlocal
      set "CORDOVA_NODE=%%~A"
)
exit /b 0
