REM check if any command line parameters passed

REM npm i
REM npm run build --workspace packages/vscode-ws-jsonrpc
REM npm run build:client

SET DEVELOPMENT_HOME=%CD%
echo Launching Server

start /min cmd /c "cd %DEVELOPMENT_HOME%\ && npm run start:example:server"

REM sleep for 30 seconds
timeout /t 30

echo Launching Client

start /min cmd /c "cd %DEVELOPMENT_HOME%\ && npm run dev"

start /min cmd /c "cd C:\Temp\code-arena-server && node server.js"

REM sleep for 30 seconds
timeout /t 30

start http://localhost:8080/packages/examples/react-client/index.html


