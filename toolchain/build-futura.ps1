<#
  The web build of Futura, in one command.

    .\build-futura.ps1 -Futura C:\path\to\Futura [-Env dev|prod] [-Version 1.0.51] [-Output C:\path\to\out]

  Gathers the game's two modules (client, shared), writes the two classes its
  release build stamps (dev or prod addresses, the version), and builds.
  Nothing in the Futura folder is modified.

  The work itself is build-futura.sh, run through Git's bash.
#>
param(
  [Parameter(Mandatory=$true)][string]$Futura,
  [ValidateSet('dev', 'prod')][string]$Env = 'dev',
  [string]$Version = '',
  [string]$Output
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path $Futura)) { throw "no such directory: $Futura" }
if (-not $Output) { $Output = Join-Path $Here 'build' }

function Find-GitBash {
  # Git's own bash first: "bash" on a Windows PATH is often WSL's, in another file system.
  $candidates = @()
  $git = Get-Command git -ErrorAction SilentlyContinue
  if ($git) {
    $root = Split-Path (Split-Path $git.Source)
    $candidates += (Join-Path $root 'bin\bash.exe')
    $candidates += (Join-Path (Split-Path $root) 'bin\bash.exe')
  }
  $candidates += (Join-Path $env:ProgramFiles 'Git\bin\bash.exe')
  if (${env:ProgramFiles(x86)}) { $candidates += (Join-Path ${env:ProgramFiles(x86)} 'Git\bin\bash.exe') }
  if ($env:LOCALAPPDATA) { $candidates += (Join-Path $env:LOCALAPPDATA 'Programs\Git\bin\bash.exe') }
  foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
  throw "Git's bash was not found. Install Git for Windows, or run build-futura.sh from a bash shell."
}

function ConvertTo-BashPath([string]$path) {
  return ([System.IO.Path]::GetFullPath($path)) -replace '\\', '/'
}

$bash = Find-GitBash
& $bash (ConvertTo-BashPath (Join-Path $Here 'build-futura.sh')) (ConvertTo-BashPath $Futura) $Env $Version (ConvertTo-BashPath $Output)
exit $LASTEXITCODE
