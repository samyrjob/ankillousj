<#
  Compiles a Java desktop application for the browser.

    .\build.ps1 [-Project C:\path\to\project] -Source C:\path\to\src [-Output C:\path\to\out]

  -Source is the directory holding your packages - the one containing main\,
  view\, model\ and so on. It is never modified; everything happens in a
  working copy.

  -Project is the application's AnkillousJ project folder (its overlay\,
  patches\, page\, ankillousj.conf...; see build.sh). Without it the
  toolchain's own folders are used, as before.

  The build itself is build.sh: one implementation, the same on every system.
  This script finds bash (Git for Windows installs it) and hands over.

  Requires: JDK 17+, Git for Windows, and a network connection the first time
  (TeaVM, and Maven itself when it is not installed, are downloaded once).
#>
param(
  # One folder, or several for a program made of modules:  -Source C:\a\src, C:\b\src
  [Parameter(Mandatory=$true)][string[]]$Source,
  [string]$Output,
  [string]$Project
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
foreach ($s in $Source) { if (-not (Test-Path $s)) { throw "no such directory: $s" } }
if ($Project -and -not (Test-Path $Project)) { throw "no such project directory: $Project" }
if (-not $Output) { $Output = Join-Path $Here 'build' }

function Find-GitBash {
  # Git's own bash first. "bash" on the PATH of a Windows machine is often WSL's,
  # which lives in another file system and would not find these paths.
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
  throw "Git's bash was not found. Install Git for Windows, or run build.sh from a bash shell."
}

# bash takes Windows paths written with forward slashes.
function ConvertTo-BashPath([string]$path) {
  return ([System.IO.Path]::GetFullPath($path)) -replace '\\', '/'
}

$bash = Find-GitBash
$sources = ($Source | ForEach-Object { ConvertTo-BashPath $_ }) -join ','
# --project goes before the sources, where build.sh looks for it. No empty argument is ever
# passed: without -Project the list simply has no --project in it.
$arguments = @()
if ($Project) { $arguments += @('--project', (ConvertTo-BashPath $Project)) }
$arguments += @($sources, (ConvertTo-BashPath $Output))
& $bash (ConvertTo-BashPath (Join-Path $Here 'build.sh')) @arguments
exit $LASTEXITCODE
