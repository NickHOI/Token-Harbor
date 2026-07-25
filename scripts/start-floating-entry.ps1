$ErrorActionPreference = "Stop"
$taskName = "Token Harbor Floating Entry"
$pluginRoot = Split-Path -Parent $PSScriptRoot
$floatingScript = Join-Path $PSScriptRoot "harbor-floating-entry.ps1"
$powershellPath = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$userId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$arguments = "-NoProfile -ExecutionPolicy Bypass -STA -File `"$floatingScript`" -HideConsole -FollowCodexWindow"

try {
  $action = New-ScheduledTaskAction -Execute $powershellPath -Argument $arguments -WorkingDirectory $pluginRoot
  $principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
  $settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew
  Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Principal $principal `
    -Settings $settings `
    -Description "On-demand Token Harbor UI bridge; the window follows the Codex desktop lifecycle." `
    -Force | Out-Null
  Start-ScheduledTask -TaskName $taskName
} catch {
  $fallbackArguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-STA",
    "-File", "`"$floatingScript`"",
    "-HideConsole",
    "-FollowCodexWindow"
  )
  Start-Process -FilePath $powershellPath -ArgumentList $fallbackArguments -WorkingDirectory $pluginRoot
}
