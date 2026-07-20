param(
  [switch]$Probe
)

$ErrorActionPreference = "Stop"
$pluginRoot = Split-Path -Parent $PSScriptRoot
$harborPort = if ($env:TOKEN_HARBOR_PORT) { [int]$env:TOKEN_HARBOR_PORT } else { 47831 }
if ($harborPort -lt 1 -or $harborPort -gt 65535) { throw "TOKEN_HARBOR_PORT must be between 1 and 65535." }
$harborUrl = "http://127.0.0.1:$harborPort/"
$healthUrl = "${harborUrl}health"
$dataDir = if ($env:TOKEN_HARBOR_DATA_DIR) {
  $env:TOKEN_HARBOR_DATA_DIR
} elseif ($env:PLUGIN_DATA) {
  $env:PLUGIN_DATA
} else {
  Join-Path $pluginRoot ".token-harbor-data"
}
$dataDir = [IO.Path]::GetFullPath($dataDir)
$positionPath = Join-Path $dataDir "floating-entry.json"

if ($Probe) {
  [pscustomobject]@{
    harborUrl = $harborUrl
    pluginRoot = $pluginRoot
    positionPath = $positionPath
    platform = "windows"
  } | ConvertTo-Json -Compress
  exit 0
}

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName WindowsBase

$createdNew = $false
$mutex = [Threading.Mutex]::new($true, "Local\TokenHarborFloatingEntry", [ref]$createdNew)
if (-not $createdNew) {
  $mutex.Dispose()
  exit 0
}

function Test-HarborServer {
  try {
    $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1
    $healthDataDir = [IO.Path]::GetFullPath([string]$health.dataDir)
    return [bool]($health.ok -and $health.service -eq "token-harbor" -and $health.version -eq "0.1.0" -and [int]$health.port -eq $harborPort -and $healthDataDir -eq $dataDir)
  } catch {
    return $false
  }
}

function Open-Harbor {
  if (-not (Test-HarborServer)) {
    Start-Process -FilePath "node" -ArgumentList "scripts/harbor-server.mjs" -WorkingDirectory $pluginRoot -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 10; $attempt += 1) {
      Start-Sleep -Milliseconds 150
      if (Test-HarborServer) { break }
    }
  }

  if (Test-HarborServer) {
    $appBrowser = @(
      (Join-Path ${env:ProgramFiles(x86)} "Microsoft\Edge\Application\msedge.exe"),
      (Join-Path $env:ProgramFiles "Microsoft\Edge\Application\msedge.exe"),
      (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe"),
      (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe")
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1

    if ($appBrowser) {
      Start-Process -FilePath $appBrowser -ArgumentList "--app=$harborUrl", "--start-maximized"
    } else {
      Start-Process $harborUrl
    }
  } else {
    [System.Windows.MessageBox]::Show(
      "Token Harbor could not start. Check that Node.js is installed and try again.",
      "Token Harbor",
      [System.Windows.MessageBoxButton]::OK,
      [System.Windows.MessageBoxImage]::Warning
    ) | Out-Null
  }
}

function Read-SavedPosition {
  if (-not (Test-Path -LiteralPath $positionPath)) { return $null }
  try {
    return Get-Content -Raw -LiteralPath $positionPath | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Save-Position([double]$Left, [double]$Top) {
  New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
  [pscustomobject]@{ left = [Math]::Round($Left, 1); top = [Math]::Round($Top, 1) } |
    ConvertTo-Json -Compress |
    Set-Content -LiteralPath $positionPath -Encoding UTF8
}

[xml]$xaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Token Harbor"
        Width="132" Height="126"
        WindowStyle="None" ResizeMode="NoResize"
        AllowsTransparency="True" Background="Transparent"
        ShowInTaskbar="False" Topmost="True"
        Focusable="True">
  <Grid x:Name="Launcher" ToolTip="Token Harbor - click to open, drag to move" RenderTransformOrigin="0.5,0.5">
    <Ellipse x:Name="Pulse" Width="104" Height="104" Margin="14,0,14,22"
             Stroke="#E8B64B" StrokeThickness="2" Opacity="0.18">
      <Ellipse.RenderTransform>
        <ScaleTransform x:Name="PulseScale" ScaleX="0.82" ScaleY="0.82" />
      </Ellipse.RenderTransform>
    </Ellipse>
    <Grid x:Name="ButtonShell" Width="116" Height="116" Cursor="Hand"
          RenderTransformOrigin="0.5,0.42">
      <Grid.Effect>
        <DropShadowEffect x:Name="ShellShadow" Color="#00151B" BlurRadius="18" ShadowDepth="5" Opacity="0.88" />
      </Grid.Effect>
      <Grid.RenderTransform>
        <TransformGroup>
          <ScaleTransform x:Name="ShellScale" ScaleX="1" ScaleY="1" />
          <TranslateTransform x:Name="BobTransform" Y="0" />
        </TransformGroup>
      </Grid.RenderTransform>

      <Ellipse Width="88" Height="88" VerticalAlignment="Top" Stroke="#142F35" StrokeThickness="6">
        <Ellipse.Fill>
          <RadialGradientBrush Center="0.36,0.28" GradientOrigin="0.28,0.2" RadiusX="0.8" RadiusY="0.8">
            <GradientStop Color="#163F47" Offset="0" />
            <GradientStop Color="#06252D" Offset="0.72" />
            <GradientStop Color="#03191F" Offset="1" />
          </RadialGradientBrush>
        </Ellipse.Fill>
      </Ellipse>
      <Ellipse Width="88" Height="88" VerticalAlignment="Top" Stroke="#E1AF46" StrokeThickness="3" />
      <Ellipse Width="76" Height="76" Margin="20,6,20,34" VerticalAlignment="Top"
               Stroke="#6B8F8F" StrokeThickness="1" StrokeDashArray="1 3" Opacity="0.8" />

      <Grid Width="72" Height="72" Margin="22,7,22,37" VerticalAlignment="Top">
        <Ellipse x:Name="BeaconGlow" Width="32" Height="32" Margin="0,1,0,0"
                 VerticalAlignment="Top" Fill="#E8B64B" Opacity="0.14">
          <Ellipse.Effect>
            <BlurEffect Radius="10" />
          </Ellipse.Effect>
          <Ellipse.RenderTransform>
            <ScaleTransform x:Name="BeaconScale" ScaleX="0.8" ScaleY="0.8" />
          </Ellipse.RenderTransform>
        </Ellipse>
        <Canvas Width="72" Height="72">
          <Path x:Name="BeaconBeam" Fill="#F2C961" Opacity="0.18"
                Data="M36,18 L2,7 L2,28 Z M36,18 L70,7 L70,28 Z"
                RenderTransformOrigin="0.5,0.28">
            <Path.RenderTransform>
              <RotateTransform x:Name="BeamRotate" Angle="-5" />
            </Path.RenderTransform>
          </Path>
          <Image x:Name="LighthouseArt" Canvas.Left="5" Canvas.Top="2" Width="62" Height="62"
                 Stretch="Uniform" RenderOptions.BitmapScalingMode="NearestNeighbor" />
          <Path Stroke="#54BFC0" StrokeThickness="3" StrokeStartLineCap="Round" StrokeEndLineCap="Round"
                Data="M5,63 C15,57 25,68 36,63 C47,58 56,68 67,62" />
          <Path Stroke="#2B7E84" StrokeThickness="2" StrokeStartLineCap="Round" StrokeEndLineCap="Round"
                Data="M9,69 C18,64 27,72 37,68 C47,64 55,72 64,67" />
        </Canvas>
      </Grid>

      <Border Width="112" Height="28" Margin="2,88,2,0" VerticalAlignment="Top"
              CornerRadius="4" Background="#071B20" BorderBrush="#6A8C8C" BorderThickness="1">
        <Grid Margin="9,0">
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto" />
            <ColumnDefinition Width="Auto" />
            <ColumnDefinition Width="*" />
            <ColumnDefinition Width="Auto" />
          </Grid.ColumnDefinitions>
          <Path Width="10" Height="10" Stretch="Uniform" Fill="#E5B54F"
                Data="M2,8 A7,7 0 0 1 16,8 L13,8 A4,4 0 0 0 5,8 Z M7,10 L11,10 L9,3 Z" />
          <TextBlock x:Name="PowerLabel" Grid.Column="1" Margin="4,0,0,0" VerticalAlignment="Center"
                     Foreground="#8FB0AE" FontFamily="Segoe UI" FontSize="8" FontWeight="SemiBold" Text="SAIL" />
          <TextBlock x:Name="PowerValue" Grid.Column="2" Margin="5,0,4,0" VerticalAlignment="Center"
                     Foreground="#F2E7C5" FontFamily="Consolas" FontSize="11" FontWeight="Bold" Text="--" />
          <Grid Grid.Column="3" Width="10" Height="10">
            <Ellipse x:Name="StatusHalo" Fill="#63C69B" Opacity="0.18" />
            <Ellipse x:Name="StatusLight" Width="5" Height="5" Fill="#63C69B" />
          </Grid>
        </Grid>
      </Border>
    </Grid>
  </Grid>
</Window>
'@

$reader = [System.Xml.XmlNodeReader]::new($xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)
$launcher = $window.FindName("Launcher")
$buttonShell = $window.FindName("ButtonShell")
$shellScale = $window.FindName("ShellScale")
$bobTransform = $window.FindName("BobTransform")
$pulse = $window.FindName("Pulse")
$pulseScale = $window.FindName("PulseScale")
$beaconGlow = $window.FindName("BeaconGlow")
$beaconScale = $window.FindName("BeaconScale")
$beaconBeam = $window.FindName("BeaconBeam")
$beamRotate = $window.FindName("BeamRotate")
$lighthouseArt = $window.FindName("LighthouseArt")
$powerLabel = $window.FindName("PowerLabel")
$powerValue = $window.FindName("PowerValue")
$statusHalo = $window.FindName("StatusHalo")
$statusLight = $window.FindName("StatusLight")

$lighthouseAssetPath = Join-Path $pluginRoot "assets\guia-lighthouse-pixel.png"
if (-not (Test-Path -LiteralPath $lighthouseAssetPath)) {
  throw "Guia lighthouse artwork is missing: $lighthouseAssetPath"
}
$lighthouseBitmap = [System.Windows.Media.Imaging.BitmapImage]::new()
$lighthouseBitmap.BeginInit()
$lighthouseBitmap.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
$lighthouseBitmap.UriSource = [Uri]::new($lighthouseAssetPath, [UriKind]::Absolute)
$lighthouseBitmap.EndInit()
$lighthouseBitmap.Freeze()
$lighthouseArt.Source = $lighthouseBitmap

function Get-WindowsLanguage {
  try {
    return [string](Get-WinUserLanguageList | Select-Object -First 1).LanguageTag
  } catch {
    return [System.Globalization.CultureInfo]::CurrentUICulture.Name
  }
}

function Set-PowerLabel([string]$Language) {
  $normalized = if ($Language) { $Language.ToLowerInvariant() } else { "en" }
  $powerLabel.Text = switch -Regex ($normalized) {
  '^pt' { 'FOR' + [char]0x00C7 + 'A'; break }
  '^de' { 'KRAFT'; break }
  '^fr' { [string]([char]0x00C9) + 'NERGIE'; break }
  '^ja' { [string]([char]0x822A) + [char]0x529B; break }
  '^ko' { [string]([char]0xD56D) + [char]0xD574 + [char]0xB825; break }
  '^zh' { [string]([char]0x822A) + [char]0x529B; break }
  default { 'POWER' }
  }
}

$windowsLanguage = Get-WindowsLanguage
Set-PowerLabel $windowsLanguage

$workLeft = [System.Windows.SystemParameters]::VirtualScreenLeft
$workTop = [System.Windows.SystemParameters]::VirtualScreenTop
$workWidth = [System.Windows.SystemParameters]::VirtualScreenWidth
$workHeight = [System.Windows.SystemParameters]::VirtualScreenHeight
$saved = Read-SavedPosition
$defaultLeft = $workLeft + $workWidth - $window.Width - 24
$defaultTop = $workTop + $workHeight - $window.Height - 96
$window.Left = if ($null -ne $saved -and $null -ne $saved.left) {
  [Math]::Max($workLeft + 8, [Math]::Min([double]$saved.left, $workLeft + $workWidth - $window.Width - 8))
} else { $defaultLeft }
$window.Top = if ($null -ne $saved -and $null -ne $saved.top) {
  [Math]::Max($workTop + 8, [Math]::Min([double]$saved.top, $workTop + $workHeight - $window.Height - 48))
} else { $defaultTop }

$bob = [System.Windows.Media.Animation.DoubleAnimation]::new()
$bob.From = -1.5
$bob.To = 2.5
$bob.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(1.7))
$bob.AutoReverse = $true
$bob.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$bobTransform.BeginAnimation([System.Windows.Media.TranslateTransform]::YProperty, $bob)

$pulseOpacity = [System.Windows.Media.Animation.DoubleAnimation]::new()
$pulseOpacity.From = 0.10
$pulseOpacity.To = 0.38
$pulseOpacity.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(1.9))
$pulseOpacity.AutoReverse = $true
$pulseOpacity.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$pulse.BeginAnimation([System.Windows.UIElement]::OpacityProperty, $pulseOpacity)

$pulseSize = [System.Windows.Media.Animation.DoubleAnimation]::new()
$pulseSize.From = 0.86
$pulseSize.To = 1.02
$pulseSize.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(1.9))
$pulseSize.AutoReverse = $true
$pulseSize.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$pulseScale.BeginAnimation([System.Windows.Media.ScaleTransform]::ScaleXProperty, $pulseSize)
$pulseScale.BeginAnimation([System.Windows.Media.ScaleTransform]::ScaleYProperty, $pulseSize)

$beaconPulse = [System.Windows.Media.Animation.DoubleAnimation]::new()
$beaconPulse.From = 0.12
$beaconPulse.To = 0.72
$beaconPulse.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(1.25))
$beaconPulse.AutoReverse = $true
$beaconPulse.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$beaconGlow.BeginAnimation([System.Windows.UIElement]::OpacityProperty, $beaconPulse)

$beaconSize = [System.Windows.Media.Animation.DoubleAnimation]::new()
$beaconSize.From = 0.72
$beaconSize.To = 1.18
$beaconSize.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(1.25))
$beaconSize.AutoReverse = $true
$beaconSize.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$beaconScale.BeginAnimation([System.Windows.Media.ScaleTransform]::ScaleXProperty, $beaconSize)
$beaconScale.BeginAnimation([System.Windows.Media.ScaleTransform]::ScaleYProperty, $beaconSize)

$beamOpacity = [System.Windows.Media.Animation.DoubleAnimation]::new()
$beamOpacity.From = 0.10
$beamOpacity.To = 0.34
$beamOpacity.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(2.4))
$beamOpacity.AutoReverse = $true
$beamOpacity.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$beaconBeam.BeginAnimation([System.Windows.UIElement]::OpacityProperty, $beamOpacity)

$beamSweep = [System.Windows.Media.Animation.DoubleAnimation]::new()
$beamSweep.From = -7
$beamSweep.To = 7
$beamSweep.Duration = [System.Windows.Duration]::new([TimeSpan]::FromSeconds(2.4))
$beamSweep.AutoReverse = $true
$beamSweep.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
$beamRotate.BeginAnimation([System.Windows.Media.RotateTransform]::AngleProperty, $beamSweep)

function Update-HarborReadout {
  try {
    $state = Invoke-RestMethod -Uri "${harborUrl}api/state" -TimeoutSec 1
    $sharedLanguage = [string]$state.preferences.language
    Set-PowerLabel $(if ($sharedLanguage) { $sharedLanguage } else { $windowsLanguage })
    $power = [double]$state.sailingPower
    $powerValue.Text = if ($power -ge 10000) {
      "{0:0.#}K" -f ($power / 1000)
    } else {
      "{0:0.#}" -f $power
    }
    $statusLight.Fill = [System.Windows.Media.Brushes]::LightGreen
    $statusHalo.Fill = [System.Windows.Media.Brushes]::LightGreen
    $launcher.ToolTip = "Token Harbor - $($powerLabel.Text) $($powerValue.Text)`nClick to open; drag to move"
  } catch {
    $powerValue.Text = "OFF"
    $statusLight.Fill = [System.Windows.Media.Brushes]::DarkGray
    $statusHalo.Fill = [System.Windows.Media.Brushes]::DarkGray
    $launcher.ToolTip = "Token Harbor is offline`nClick to start; drag to move"
  }
}

$readoutTimer = [System.Windows.Threading.DispatcherTimer]::new()
$readoutTimer.Interval = [TimeSpan]::FromSeconds(8)
$readoutTimer.Add_Tick({ Update-HarborReadout })
$readoutTimer.Start()
Update-HarborReadout

$window.Opacity = 0.94
$buttonShell.Add_MouseEnter({
  $window.Opacity = 1
  $shellScale.ScaleX = 1.06
  $shellScale.ScaleY = 1.06
})
$buttonShell.Add_MouseLeave({
  $window.Opacity = 0.94
  $shellScale.ScaleX = 1
  $shellScale.ScaleY = 1
})

$window.Add_MouseLeftButtonDown({
  $startLeft = $window.Left
  $startTop = $window.Top
  try { $window.DragMove() } catch {}
  $distance = [Math]::Abs($window.Left - $startLeft) + [Math]::Abs($window.Top - $startTop)
  if ($distance -lt 4) {
    Open-Harbor
    return
  }

  $center = $window.Left + ($window.Width / 2)
  if ($center -lt ($workLeft + ($workWidth / 2))) {
    $window.Left = $workLeft + 12
  } else {
    $window.Left = $workLeft + $workWidth - $window.Width - 12
  }
  $window.Top = [Math]::Max($workTop + 8, [Math]::Min($window.Top, $workTop + $workHeight - $window.Height - 48))
  Save-Position $window.Left $window.Top
})

$menu = [System.Windows.Controls.ContextMenu]::new()
$openItem = [System.Windows.Controls.MenuItem]::new()
$openItem.Header = "Open Token Harbor"
$openItem.Add_Click({ Open-Harbor })
$exitItem = [System.Windows.Controls.MenuItem]::new()
$exitItem.Header = "Exit floating entry"
$exitItem.Add_Click({ $window.Close() })
[void]$menu.Items.Add($openItem)
[void]$menu.Items.Add([System.Windows.Controls.Separator]::new())
[void]$menu.Items.Add($exitItem)
$window.ContextMenu = $menu

$window.Add_KeyDown({
  if ($_.Key -eq [System.Windows.Input.Key]::Enter -or $_.Key -eq [System.Windows.Input.Key]::Space) {
    Open-Harbor
  }
})
$window.Add_Closed({
  $readoutTimer.Stop()
  Save-Position $window.Left $window.Top
})

$application = [System.Windows.Application]::new()
$application.ShutdownMode = [System.Windows.ShutdownMode]::OnMainWindowClose
try {
  [void]$application.Run($window)
} finally {
  if ($createdNew) { [void]$mutex.ReleaseMutex() }
  $mutex.Dispose()
}
