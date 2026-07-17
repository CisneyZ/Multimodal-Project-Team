$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

$env:NODE_ENV = "production"

Write-Host "Building server..."
npx.cmd nest build

Write-Host "Building client..."
npx.cmd vite build --config vite.config.ts
node .\scripts\fix-client-index.mjs

Write-Host "Build completed."
