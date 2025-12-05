Param(
  [switch]$withDocker
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Root is one level above the scripts directory (the repository root)
$root = Split-Path -Parent $scriptDir
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Starting development environment from: $root" -ForegroundColor Cyan

if ($withDocker) {
  Write-Host "Starting docker-compose..." -ForegroundColor Yellow
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$root`"; docker-compose up -d"
  Start-Sleep -Seconds 3
}

Write-Host "Launching backend (new window)..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","npm install; npm run start:dev" -WorkingDirectory $backend

Start-Sleep -Milliseconds 500

Write-Host "Launching frontend (new window)..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","npm install; npm run dev" -WorkingDirectory $frontend

Write-Host "Started frontend and backend in new terminals." -ForegroundColor Cyan

exit 0
