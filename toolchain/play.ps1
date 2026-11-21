<#
  Plays the web build on this computer.

    .\play.ps1 [-Web <folder>] [-GameServer localhost:5555] [-Backend localhost:9090]

  Starts the two things a browser tab needs beside the game's own servers:
    - the gateway, which carries the tab's WebSocket to the game server's TCP port
    - a local web server for the built page, on port 8080
  then opens the page. Ctrl+C stops both.

  The game's backend and game server must already be running (for Futura: the
  usual dev services). This script only warns when they are not.
#>
param(
  [string]$Web,
  [string]$GameServer = 'localhost:5555',
  [string]$Backend = 'localhost:9090',
  [int]$GatewayPort = 5556,
  [int]$Port = 8080,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Web) { $Web = Join-Path $Here 'build\web' }
if (-not (Test-Path (Join-Path $Web 'futura.js'))) {
  throw "nothing built in $Web - run build.ps1 or build-futura.ps1 first"
}

function Test-Listening([string]$hostAndPort) {
  $parts = $hostAndPort.Split(':')
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $wait = $client.BeginConnect($parts[0], [int]$parts[1], $null, $null)
    if (-not $wait.AsyncWaitHandle.WaitOne(1500)) { return $false }
    $client.EndConnect($wait)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

if (-not (Test-Listening $GameServer)) { Write-Host "WARNING: no game server answers on $GameServer" -ForegroundColor Yellow }
if (-not (Test-Listening $Backend))    { Write-Host "WARNING: no backend answers on $Backend" -ForegroundColor Yellow }
if (Test-Listening "localhost:$Port")  { throw "port $Port is already in use - close what uses it, or pass -Port" }

# The gateway is one Java file with no dependency: compiled here on first use.
$gatewaySource = Join-Path $Here '..\gateway\src\main\java\ankillousj\gateway\AnkillousGateway.java'
$gatewayOut = Join-Path $Here 'build\gateway'
$gatewayClass = Join-Path $gatewayOut 'ankillousj\gateway\AnkillousGateway.class'
if (-not (Test-Path $gatewayClass) -or (Get-Item $gatewaySource).LastWriteTime -gt (Get-Item $gatewayClass).LastWriteTime) {
  New-Item -ItemType Directory -Force -Path $gatewayOut | Out-Null
  & javac -encoding UTF-8 -d $gatewayOut $gatewaySource
  if ($LASTEXITCODE -ne 0) { throw 'the gateway did not compile' }
}

$gateway = $null
$server = $null
try {
  $gateway = Start-Process -FilePath 'java' -NoNewWindow -PassThru -ArgumentList @(
      '-cp', "`"$gatewayOut`"", 'ankillousj.gateway.AnkillousGateway',
      '--listen', $GatewayPort, '--target', $GameServer)
  $server = Start-Process -FilePath 'node' -NoNewWindow -PassThru -ArgumentList @(
      "`"$(Join-Path $Here 'serve.mjs')`"", "`"$Web`"", $Port)
  Start-Sleep -Seconds 1
  Write-Host ""
  Write-Host "Futura in a tab:  http://localhost:$Port/      (Ctrl+C here stops it)"
  if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }
  Wait-Process -Id $server.Id
} finally {
  foreach ($p in @($gateway, $server)) {
    if ($p -and -not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
  }
}
