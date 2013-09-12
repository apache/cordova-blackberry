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
set INITCALL="%~dps0init"
if not exist INITCALL (
    set INITCALL="%~dp0init"
)
call %INITCALL%

set FOUNDJAVA=
for %%e in (%PATHEXT%) do (
  for %%X in (java%%e) do (
    if not defined FOUNDJAVA (
      set FOUNDJAVA=%%~$PATH:X
    )
  )
)
if not exist "%CORDOVA_NODE%\node.exe" (
  echo node cannot be found on the path. Aborting.
  exit /b 1
)
if not exist "%CORDOVA_NODE%\npm" (
  echo npm cannot be found on the path. Aborting.
  exit /b 1
)
if not defined FOUNDJAVA (
  echo java cannot be found on the path. Aborting.
  exit /b 1
)
if not exist "%CORDOVA_BBTOOLS%\blackberry-nativepackager" (
  echo blackberry-nativepackager cannot be found on the path. Aborting.
  exit /b 1
)
if not exist "%CORDOVA_BBTOOLS%\blackberry-deploy" (
  echo blackberry-deploy cannot be found on the path. Aborting.
  exit /b 1
)
if not exist "%CORDOVA_BBTOOLS%\blackberry-signer" (
  echo blackberry-signer cannot be found on the path. Aborting.
  exit /b 1
)
if not exist "%CORDOVA_BBTOOLS%\blackberry-debugtokenrequest" (
  echo blackberry-debugtokenrequest cannot be found on the path. Aborting.
  exit /b 1
)

"%CORDOVA_NODE%\node" "%~dp0\check_reqs.js" %*
