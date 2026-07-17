$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

$env:NODE_ENV = "development"
$env:VITE_DEV_SERVER_HOST = "0.0.0.0"
$env:VITE_DEV_SERVER_PORT = "5173"

npx.cmd vite --config vite.config.ts --host 0.0.0.0 --port 5173
