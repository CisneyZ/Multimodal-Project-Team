$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$npmCommand = Get-Command npm -ErrorAction SilentlyContinue

if (-not $nodeCommand -or -not $npmCommand) {
  Write-Host "未找到 Node.js 或 npm。请先安装 Node.js 22 LTS，然后重新打开 PowerShell。" -ForegroundColor Red
  exit 1
}

$nodeVersion = (& node -v).Trim()
$npmVersion = (& npm -v).Trim()
$nodeMajor = [int]($nodeVersion.TrimStart("v").Split(".")[0])

if ($nodeMajor -lt 22) {
  Write-Host "当前 Node.js 版本为 $nodeVersion，项目要求 Node.js 22 或更高版本。" -ForegroundColor Red
  exit 1
}

Write-Host "Node.js: $nodeVersion"
Write-Host "npm: $npmVersion"
Write-Host "开始安装生产依赖..."

npm ci --omit=dev --ignore-scripts

Write-Host "生产依赖安装完成。" -ForegroundColor Green
