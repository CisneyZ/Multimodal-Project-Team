$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".runtime")) {
  New-Item -ItemType Directory -Force -Path ".runtime" | Out-Null
}

if (-not $env:SERVER_PORT) {
  $env:SERVER_PORT = "3000"
}

$env:NODE_ENV = "production"
$env:SERVER_HOST = "0.0.0.0"

$mainFile = Join-Path (Get-Location) "dist\server\main.js"
if (-not (Test-Path $mainFile)) {
  throw "dist\server\main.js not found. Run .\deployment\build-windows.ps1 first."
}

node --enable-source-maps $mainFile
