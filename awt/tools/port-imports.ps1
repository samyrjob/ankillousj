<#
  Rewrites JDK imports to the AnkillousJ runtime's packages.

    .\port-imports.ps1 -Root C:\path\to\src            dry run: lists what would change
    .\port-imports.ps1 -Root C:\path\to\src -Apply     writes the changes
    .\port-imports.ps1 -Root C:\path\to\src -Revert    puts the JDK names back

  The rewrite itself is port-imports.sh: one implementation, the same on every
  system (mappings, wildcard imports, the JPanel-to-canvas rewrite, resources).
  This script finds bash (Git for Windows installs it) and hands over.

  TeaVM reserves the java.* and javax.* namespaces for its own class library,
  which is why the runtime lives in awt.*, swing.*, json.* and so on, and why
  the imports have to move.
#>
param(
  [Parameter(Mandatory=$true)][string]$Root,
  [switch]$Apply,
  [switch]$Revert
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path $Root)) { throw "no such directory: $Root" }

function Find-GitBash {
  # Git's own bash first: "bash" on a Windows PATH is often WSL's, in another file system.
  $candidates = @()
  $git = Get-Command git -ErrorAction SilentlyContinue
  if ($git) {
    $gitRoot = Split-Path (Split-Path $git.Source)
    $candidates += (Join-Path $gitRoot 'bin\bash.exe')
    $candidates += (Join-Path (Split-Path $gitRoot) 'bin\bash.exe')
  }
  $candidates += (Join-Path $env:ProgramFiles 'Git\bin\bash.exe')
  if (${env:ProgramFiles(x86)}) { $candidates += (Join-Path ${env:ProgramFiles(x86)} 'Git\bin\bash.exe') }
  if ($env:LOCALAPPDATA) { $candidates += (Join-Path $env:LOCALAPPDATA 'Programs\Git\bin\bash.exe') }
  foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
  throw "Git's bash was not found. Install Git for Windows, or run port-imports.sh from a bash shell."
}

function ConvertTo-BashPath([string]$path) {
  return ([System.IO.Path]::GetFullPath($path)) -replace '\\', '/'
}

$mode = ''
if ($Revert) { $mode = '--revert' } elseif ($Apply) { $mode = '--apply' }

$bash = Find-GitBash
if ($mode) {
  & $bash (ConvertTo-BashPath (Join-Path $Here 'port-imports.sh')) (ConvertTo-BashPath $Root) $mode
} else {
  & $bash (ConvertTo-BashPath (Join-Path $Here 'port-imports.sh')) (ConvertTo-BashPath $Root)
}
exit $LASTEXITCODE
