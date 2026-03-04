param(
  [string]$Message = "",
  [string]$Proxy = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  if ([string]::IsNullOrWhiteSpace($Proxy)) {
    git @Args
  } else {
    git -c "http.proxy=$Proxy" -c "https.proxy=$Proxy" @Args
  }

  return ($LASTEXITCODE -eq 0)
}

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

# Keep local main up to date before pushing to avoid non-fast-forward errors.
$synced = $false
$maxRetries = 3
for ($i = 1; $i -le $maxRetries; $i++) {
  Write-Host "Sync attempt $i/$maxRetries (pull --rebase) ..."
  $fetched = Invoke-Git -Args @("fetch", "origin", "main")
  $rebased = $false
  if ($fetched) {
    $rebased = Invoke-Git -Args @("pull", "--rebase", "origin", "main")
  }

  if ($fetched -and $rebased) {
    $synced = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $synced) {
  Write-Host "Sync failed after $maxRetries attempts."
  Write-Host "Please resolve conflicts (if any), then run again."
  exit 1
}

for ($i = 1; $i -le $maxRetries; $i++) {
  Write-Host "Push attempt $i/$maxRetries ..."
  $pushed = Invoke-Git -Args @("push", "origin", "main")

  if ($pushed) {
    if ([string]::IsNullOrWhiteSpace($Proxy)) {
      Write-Host "Done. Pushed to origin/main."
    } else {
      Write-Host "Done. Pushed to origin/main (via proxy $Proxy)."
    }
    exit 0
  }
  Start-Sleep -Seconds 2
}

Write-Host "Push failed after $maxRetries attempts."
Write-Host 'Tip: .\scripts\publish.ps1 -Message "msg" -Proxy "http://127.0.0.1:7890"'
exit 1
