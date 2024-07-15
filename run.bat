REM check if any command line parameters passed

IF NOT "%~1"=="" (
	npm i
	npm run build --workspace packages/vscode-ws-jsonrpc
	npm run build:client
)

SET DEVELOPMENT_HOME=%CD%
echo Launching Server

start /min cmd /c "cd %DEVELOPMENT_HOME%\ && npm run start:example:server"

REM sleep for 30 seconds
timeout /t 45

echo Launching Client

start /min cmd /c "cd %DEVELOPMENT_HOME%\ && npm run dev"

start /min cmd /c "cd C:\Temp\code-arena-server && node server.js"

REM sleep for 30 seconds
timeout /t 45

start http://localhost:8080/packages/examples/react-client/index.html


