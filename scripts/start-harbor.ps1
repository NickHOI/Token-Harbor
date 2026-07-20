param(
  [switch]$Dev,
  [switch]$NoFloatingEntry
)

$ErrorActionPreference = "Stop"
$pluginRoot = Split-Path -Parent $PSScriptRoot
if ($Dev) { $env:TOKEN_HARBOR_DEV = "1" }
$harborPort = if ($env:TOKEN_HARBOR_PORT) { [int]$env:TOKEN_HARBOR_PORT } else { 47831 }
if ($harborPort -lt 1 -or $harborPort -gt 65535) { throw "TOKEN_HARBOR_PORT must be between 1 and 65535." }
$harborUrl = "http://127.0.0.1:$harborPort/"
$healthUrl = "${harborUrl}health"
$dataDir = if ($env:TOKEN_HARBOR_DATA_DIR) {
  [IO.Path]::GetFullPath($env:TOKEN_HARBOR_DATA_DIR)
} elseif ($env:PLUGIN_DATA) {
  [IO.Path]::GetFullPath($env:PLUGIN_DATA)
} else {
  [IO.Path]::GetFullPath((Join-Path $pluginRoot ".token-harbor-data"))
}

function Get-HarborHealth {
  try { return Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1 } catch { return $null }
}

function Test-HarborIdentity($Health) {
  if (-not $Health) { return $false }
  $healthDataDir = try { [IO.Path]::GetFullPath([string]$Health.dataDir) } catch { "" }
  return $Health.ok -and $Health.service -eq "token-harbor" -and $Health.version -eq "0.1.0" -and [int]$Health.port -eq $harborPort -and $healthDataDir -eq $dataDir
}

if (-not $NoFloatingEntry) {
  $floatingScript = Join-Path $PSScriptRoot "harbor-floating-entry.ps1"
  $floatingArguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-WindowStyle", "Hidden",
    "-STA",
    "-File", "`"$floatingScript`""
  )
  Start-Process -FilePath "powershell.exe" -ArgumentList $floatingArguments -WindowStyle Hidden
}

$health = Get-HarborHealth
if (Test-HarborIdentity $health) {
  Start-Process $harborUrl
  exit 0
}
if ($health) { throw "Port $harborPort is occupied by a different service or Token Harbor data directory." }

Start-Process -FilePath "node" -ArgumentList "scripts/harbor-server.mjs" -WorkingDirectory $pluginRoot -WindowStyle Hidden
for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
  Start-Sleep -Milliseconds 125
  if (Test-HarborIdentity (Get-HarborHealth)) {
    Start-Process $harborUrl
    exit 0
  }
}
throw "Token Harbor did not become ready on port $harborPort."
