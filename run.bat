REM npm i
REM npm run build --workspace packages/vscode-ws-jsonrpc
REM npm run build:client

SET DEVELOPMENT_HOME=%CD%
echo Launching Server

start /min cmd /c "cd %DEVELOPMENT_HOME%\ && npm run start:example:server"


echo Launching Client

start /min cmd /c "cd %DEVELOPMENT_HOME%\ && npm run dev"

