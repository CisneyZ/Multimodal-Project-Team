@echo off
cd /d "%~dp0.."
set NODE_ENV=production
set SERVER_HOST=0.0.0.0
set SERVER_PORT=3000
if not exist ".runtime" mkdir ".runtime"
node --enable-source-maps dist/server/main.js >> ".runtime\server.stdout.log" 2>> ".runtime\server.stderr.log"
