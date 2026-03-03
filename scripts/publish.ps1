param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$status = git status --porcelain
if ($status) {
  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  }
  git add .
  git commit -m $Message
} else {
  Write-Host "No local changes to commit."
}

git push origin main
Write-Host "Done. Pushed to origin/main."
