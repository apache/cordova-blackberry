@ECHO OFF

REM cd into project dir
cd %~dp0\..\

REM package app
@node.exe ./cordova/lib/build %*

