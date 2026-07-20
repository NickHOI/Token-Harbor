param(
  [string]$ConfigPath = (Join-Path $HOME ".codex\config.toml")
)

$ErrorActionPreference = "Stop"
$harborPort = if ($env:TOKEN_HARBOR_PORT) { [int]$env:TOKEN_HARBOR_PORT } else { 47831 }
if ($harborPort -lt 1 -or $harborPort -gt 65535) { throw "TOKEN_HARBOR_PORT must be between 1 and 65535." }
$telemetryEndpoint = "http://127.0.0.1:$harborPort/v1/logs"
$configDirectory = Split-Path -Parent $ConfigPath
if (-not (Test-Path -LiteralPath $configDirectory)) {
  New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null
}

$existing = if (Test-Path -LiteralPath $ConfigPath) {
  [IO.File]::ReadAllText($ConfigPath)
} else {
  ""
}

if ($existing -match '(?m)^\s*\[otel\]\s*$') {
  Write-Host "Codex config already contains an [otel] section. It was not changed." -ForegroundColor Yellow
  Write-Host "Set its exporter endpoint to $telemetryEndpoint with protocol=json."
  exit 2
}

if (Test-Path -LiteralPath $ConfigPath) {
  $backup = "$ConfigPath.token-harbor-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $ConfigPath -Destination $backup
  Write-Host "Backup created: $backup"
}

$otelBlock = @"

[otel]
environment = "token-harbor"
log_user_prompt = false
exporter = { otlp-http = { endpoint = "$telemetryEndpoint", protocol = "json" } }
"@

[IO.File]::WriteAllText($ConfigPath, ($existing.TrimEnd() + $otelBlock + "`n"), [Text.UTF8Encoding]::new($false))
Write-Host "Token Harbor telemetry is configured." -ForegroundColor Green
Write-Host "Restart Codex so new Token usage can become sailing power."
