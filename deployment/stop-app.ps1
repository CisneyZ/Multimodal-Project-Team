$ErrorActionPreference = "Stop"

$processes = Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq "node.exe" -and $_.CommandLine -like "*dist\server\main.js*" }

if (-not $processes) {
  Write-Host "没有检测到正在运行的 MPT平台服务。"
  exit 0
}

foreach ($process in $processes) {
  Stop-Process -Id $process.ProcessId -Force
  Write-Host "已停止服务进程: $($process.ProcessId)"
}
