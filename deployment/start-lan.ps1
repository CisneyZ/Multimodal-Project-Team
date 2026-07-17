$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  Write-Host "未找到 Node.js。请先安装 Node.js 22 LTS，然后重新打开 PowerShell。" -ForegroundColor Red
  exit 1
}

$mainFile = Join-Path $PSScriptRoot "dist\server\main.js"
if (-not (Test-Path $mainFile)) {
  Write-Host "未找到 dist\server\main.js。请确认压缩包完整，或在源码环境重新构建项目。" -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot ".runtime") | Out-Null

if (-not $env:SERVER_PORT) {
  $env:SERVER_PORT = "3000"
}

$env:NODE_ENV = "production"
$env:SERVER_HOST = "0.0.0.0"

$nodePath = $nodeCommand.Source
$stdoutPath = Join-Path $PSScriptRoot ".runtime\server.stdout.log"
$stderrPath = Join-Path $PSScriptRoot ".runtime\server.stderr.log"

$existing = Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq "node.exe" -and $_.CommandLine -like "*dist\server\main.js*" }

if ($existing) {
  Write-Host "检测到服务已经在运行。如需重启，请先执行 .\stop-app.ps1。" -ForegroundColor Yellow
} else {
  Start-Process `
    -FilePath $nodePath `
    -ArgumentList @("--enable-source-maps", $mainFile) `
    -WorkingDirectory $PSScriptRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath
}

$ip = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
  Select-Object -First 1 -ExpandProperty IPAddress

Write-Host "服务已启动。" -ForegroundColor Green
Write-Host "本机访问: http://localhost:$env:SERVER_PORT/app/"
if ($ip) {
  Write-Host "局域网访问: http://$ip`:$env:SERVER_PORT/app/"
}
Write-Host "后台入口: http://localhost:$env:SERVER_PORT/app/admin"
Write-Host "日志目录: .runtime"

