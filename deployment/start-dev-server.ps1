$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

$env:NODE_ENV = "development"
$env:SERVER_HOST = "0.0.0.0"
$env:SERVER_PORT = "3000"

npx.cmd nest start --watch
