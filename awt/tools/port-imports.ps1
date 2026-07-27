<#
  Rewrites JDK imports onto the AnkillousJ shim packages, and back.

    .\port-imports.ps1 -Root C:\path\to\src            preview
    .\port-imports.ps1 -Root C:\path\to\src -Apply     write
    .\port-imports.ps1 -Root C:\path\to\src -Revert    undo

  TeaVM reserves the java.* and javax.* namespaces for its own class library
  and will not load application classes from them, so the shims live in
  top-level packages and imports are rewritten to match.

  Both import statements *and* fully-qualified references are rewritten.
  Rewriting only imports leaves a file saying `import awt.Color` at the top and
  `java.awt.Color` in the body - two different types, and the memorable error
  "Color cannot be converted to Color".

  javax.swing is deliberately NOT mapped. Swing widgets have no canvas
  equivalent; those files want rebuilding as HTML, and failing loudly beats
  pretending.
#>
param(
  [Parameter(Mandatory=$true)][string]$Root,
  [switch]$Apply,
  [switch]$Revert
)

# Longest prefix first: java.awt.geom must be rewritten before java.awt.
$packages = @(
  @('java.awt.geom',        'awt.geom')
  @('java.awt.image',       'awt.image')
  @('java.awt.event',       'awt.event')
  @('java.awt.font',        'awt.font')
  @('java.awt',             'awt')
  @('javax.imageio',        'imageio')
  @('javax.sound.sampled',  'sound')
  @('java.net.http',        'nethttp')
  @('java.security.spec',   'security')
  @('java.security',        'security')
  @('java.time',            'time')
)

# Individually mapped, because their package is only partly shimmed.
$classes = @(
  @('javax.swing.SwingUtilities',                    'swing.SwingUtilities')
  @('java.util.concurrent.CompletableFuture',        'concurrent.CompletableFuture')
  @('java.util.concurrent.CompletionStage',          'concurrent.CompletionStage')
  @('java.util.concurrent.ScheduledExecutorService', 'concurrent.ScheduledExecutorService')
  @('java.util.concurrent.ExecutorService',          'concurrent.ExecutorService')
  @('java.util.concurrent.ScheduledFuture',          'concurrent.ScheduledFuture')
  @('java.util.concurrent.Executors',                'concurrent.Executors')
  @('java.util.concurrent.Future',                   'concurrent.Future')
  @('java.net.Socket',                               'net.Socket')
)

$rules = @()
foreach ($p in $packages) {
  if ($Revert) { $from = $p[1]; $to = $p[0] } else { $from = $p[0]; $to = $p[1] }
  $rules += ,@("\b$([regex]::Escape($from))\.", "$to.")
}
foreach ($c in $classes) {
  if ($Revert) { $from = $c[1]; $to = $c[0] } else { $from = $c[0]; $to = $c[1] }
  $rules += ,@("\b$([regex]::Escape($from))\b", $to)
}

$changed = 0
$lines = 0

foreach ($f in Get-ChildItem -Path $Root -Recurse -Filter *.java) {
  $orig = Get-Content $f.FullName -Raw
  $text = $orig
  foreach ($r in $rules) { $text = [regex]::Replace($text, $r[0], $r[1]) }

  if ($text -ne $orig) {
    $ol = $orig -split "`n"; $nl = $text -split "`n"
    $n = 0
    for ($i = 0; $i -lt $ol.Count; $i++) { if ($ol[$i] -ne $nl[$i]) { $n++ } }
    $rel = $f.FullName.Substring($Root.Length).TrimStart('\','/')
    Write-Host ("  {0,-58} {1} line(s)" -f $rel, $n)
    $changed++; $lines += $n
    if ($Apply -or $Revert) { Set-Content -Path $f.FullName -Value $text -NoNewline }
  }
}

Write-Host ""
Write-Host ("{0} file(s), {1} line(s)" -f $changed, $lines)
if (-not ($Apply -or $Revert)) { Write-Host "DRY RUN - re-run with -Apply to write" -ForegroundColor Yellow }
