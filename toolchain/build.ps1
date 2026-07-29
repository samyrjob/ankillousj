<#
  Compiles a Java desktop application for the browser.

    .\build.ps1 -Source C:\path\to\src [-Output C:\path\to\out]

  -Source is the directory holding your packages — the one containing main\,
  view\, model\ and so on. It is never modified; everything happens in a
  working copy.

  Requires: JDK 17+, Maven, and a network connection the first time (Maven
  downloads TeaVM).
#>
param(
  [Parameter(Mandatory=$true)][string]$Source,
  [string]$Output
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Output) { $Output = Join-Path $Here 'build' }

if (-not (Test-Path $Source)) { throw "no such directory: $Source" }

$Work = Join-Path $Output 'work'
$Java = Join-Path $Work 'src\main\java'
$Res  = Join-Path $Work 'src\main\resources'

Write-Host "AnkillousJ"
Write-Host "  source : $Source"
Write-Host "  output : $Output"
Write-Host ""

# 1. working copy
if (Test-Path $Work) { Remove-Item $Work -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Java, $Res | Out-Null
Copy-Item "$Source\*" $Java -Recurse -Force
$n = (Get-ChildItem $Java -Recurse -Filter *.java).Count
Write-Host "1. copied $n source files"

# 2. rewrite imports
Write-Host "2. rewriting JDK imports"
& (Join-Path $Here '..\awt\tools\port-imports.ps1') -Root $Java -Apply | Select-Object -Last 1

# 3. runtime + overlay
Copy-Item (Join-Path $Here 'runtime\src\main\java\*') $Java -Recurse -Force
Copy-Item (Join-Path $Here 'runtime\src\main\resources\*') $Res -Recurse -Force
Write-Host "3. added the AnkillousJ runtime"

# The overlay replaces files, so it goes on AFTER the sources.
$overlayRoot = Join-Path $Here 'overlay'
$count = 0
foreach ($f in Get-ChildItem $overlayRoot -Recurse -Filter *.java) {
  $rel = $f.FullName.Substring($overlayRoot.Length).TrimStart('\')
  $dest = Join-Path $Java $rel
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item $f.FullName $dest -Force
  Write-Host "   replaced $rel"
  $count++
}
Write-Host "   $count file(s) replaced"

# Report anything still on Swing rather than letting the build explode.
$stragglers = Get-ChildItem $Java -Recurse -Filter *.java |
  Where-Object { (Get-Content $_.FullName -Raw) -match '(?m)^import javax\.swing' }
if ($stragglers) {
  Write-Host ""
  Write-Host "   These still use javax.swing and have no replacement in overlay\:" -ForegroundColor Yellow
  foreach ($s in $stragglers) { Write-Host "     $($s.FullName.Substring($Java.Length).TrimStart('\'))" }
  Write-Host "   Add a replacement under overlay\ mirroring the same path."
  Write-Host ""
}

# 4. third-party stand-ins
Copy-Item (Join-Path $Here 'thirdparty\*') $Java -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "4. added third-party stand-ins"

$config = Join-Path $Here 'config'
if (Test-Path $config) {
  New-Item -ItemType Directory -Force -Path (Join-Path $Java 'ankillousj') | Out-Null
  Copy-Item "$config\*.java" (Join-Path $Java 'ankillousj') -Force -ErrorAction SilentlyContinue
}

# 5. compile
Copy-Item (Join-Path $Here 'pom.xml') (Join-Path $Work 'pom.xml') -Force
Write-Host "5. compiling with TeaVM (this takes a minute)"
Write-Host ""

Push-Location $Work
& mvn -B process-classes 2>&1 | Tee-Object -FilePath (Join-Path $Output 'build.log') |
  Select-String -Pattern '^\[ERROR\]' | Select-Object -First 30
Pop-Location

$js = Join-Path $Work 'target\js\futura.js'
if (-not (Test-Path $js) -or (Get-Item $js).Length -eq 0) {
  Write-Host ""
  Write-Host "BUILD FAILED - see $Output\build.log" -ForegroundColor Red
  Write-Host ""
  Write-Host "The two failure modes worth knowing:"
  Write-Host "  'error:'          a source problem. Usually an import the rewrite"
  Write-Host "                    missed, or a file needing an overlay replacement."
  Write-Host "  'was not found'   TeaVM cannot link a JDK class. Its class library"
  Write-Host "                    is not complete; the class needs a stand-in, or"
  Write-Host "                    the code path reaching it needs changing."
  exit 1
}

$web = Join-Path $Output 'web'
New-Item -ItemType Directory -Force -Path $web | Out-Null
Copy-Item $js $web -Force
Copy-Item (Join-Path $Here 'index.html') $web -Force -ErrorAction SilentlyContinue
'{ "type": "commonjs" }' | Set-Content (Join-Path $web 'package.json') -Encoding UTF8

$size = [math]::Round((Get-Item (Join-Path $web 'futura.js')).Length / 1MB, 1)
Write-Host ""
Write-Host "BUILD SUCCESS" -ForegroundColor Green
Write-Host "  $web\futura.js  ($size MB)"
Write-Host ""
Write-Host "Serve it:  npx serve $web"
Write-Host ""
Write-Host "Assets are not copied - put them where index.html expects, and set"
Write-Host "the base in your entry point:"
Write-Host '    Resources.setBase("assets");'
Write-Host '    ImageIO.setResourceBase("assets");'
