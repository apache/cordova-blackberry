@ECHO OFF

REM cd into project dir
cd %~dp0\..\

@node.exe ./cordova/lib/run %*
