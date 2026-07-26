<#
  Rewrites java.awt / java.awt.geom / java.awt.image imports onto the
  AnkillousJ shim package. TeaVM reserves the java.* namespace for its own
  class library and will not load application classes from it.

    .\port-imports.ps1 -Root C:\path\to\src            # preview
    .\port-imports.ps1 -Root C:\path\to\src -Apply     # write
    .\port-imports.ps1 -Root C:\path\to\src -Revert    # undo
#>
param(
  [Parameter(Mandatory=$true)][string]$Root,
  [switch]$Apply,
  [switch]$Revert
)

$rules = if ($Revert) {
  @(
    @{ From='^import awt\.geom\.';  To='import java.awt.geom.'  }
    @{ From='^import awt\.image\.'; To='import java.awt.image.' }
    @{ From='^import awt\.event\.'; To='import java.awt.event.' }
    @{ From='^import awt\.';        To='import java.awt.'       }
    @{ From='\bawt\.geom\.';        To='java.awt.geom.'         }
    @{ From='\bawt\.image\.';       To='java.awt.image.'        }
    @{ From='(?<!java\.)\bawt\.(Color|Font|Graphics2D|Shape|Rectangle|Composite|Paint|Stroke)\b'; To='java.awt.$1' }
  )
} else {
  @(
    @{ From='^import java\.awt\.geom\.';  To='import awt.geom.'  }
    @{ From='^import java\.awt\.image\.'; To='import awt.image.' }
    @{ From='^import java\.awt\.event\.'; To='import awt.event.' }
    @{ From='^import java\.awt\.';        To='import awt.'       }
    @{ From='\bjava\.awt\.geom\.';        To='awt.geom.'         }
    @{ From='\bjava\.awt\.image\.';       To='awt.image.'        }
    @{ From='\bjava\.awt\.(Color|Font|Graphics2D|Shape|Rectangle|Composite|Paint|Stroke)\b'; To='awt.$1' }
  )
}

$files = Get-ChildItem -Path $Root -Recurse -Filter *.java
$touched = 0; $edits = 0

foreach ($f in $files) {
  $orig = Get-Content $f.FullName -Raw
  $text = $orig
  foreach ($r in $rules) {
    $text = [regex]::Replace($text, $r.From, $r.To, 'Multiline')
  }
  if ($text -ne $orig) {
    $touched++
    $n = ($orig -split "`n").Count
    $changed = 0
    $ol = $orig -split "`n"; $nl = $text -split "`n"
    for ($i=0; $i -lt $ol.Count; $i++) { if ($ol[$i] -ne $nl[$i]) { $changed++ } }
    $edits += $changed
    $rel = $f.FullName.Substring($Root.Length).TrimStart('\','/')
    Write-Host ("  {0,-58} {1} line(s)" -f $rel, $changed)
    if ($Apply) { Set-Content -Path $f.FullName -Value $text -NoNewline }
  }
}

Write-Host ""
Write-Host ("{0} file(s), {1} line(s)" -f $touched, $edits)
if (-not $Apply) { Write-Host "DRY RUN - re-run with -Apply to write changes" -ForegroundColor Yellow }
else { Write-Host "written. -Revert undoes it." -ForegroundColor Green }
