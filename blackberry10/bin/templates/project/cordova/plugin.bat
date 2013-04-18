@ECHO OFF

cd %~dp0..\

if "%1" == "add" (
    @node.exe ./cordova/node_modules/plugman/plugman.js --platform blackberry10 --project . --plugin %2
)
