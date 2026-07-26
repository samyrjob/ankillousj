<#
  Rewrites JDK imports onto the AnkillousJ shim packages. TeaVM reserves the
  java.* and javax.* namespaces for its own class library and will not load
  application classes from them.

    java.awt.*                -> awt.*
    javax.swing.SwingUtilities-> swing.SwingUtilities
    java.net.http.*           -> nethttp.*
    java.time.Duration/Instant/Clock -> time.*
    java.util.concurrent      -> concurrent.*   (only the classes TeaVM lacks:
                                 Executors, ExecutorService,
                                 ScheduledExecutorService, Future,
                                 ScheduledFuture, CompletableFuture.
                                 TimeUnit and ConcurrentHashMap are left alone
                                 because TeaVM already ships them.)

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
    @{ From='^import swing\.SwingUtilities;'; To='import javax.swing.SwingUtilities;' }
    @{ From='^import concurrent\.(Executors|ExecutorService|ScheduledExecutorService|CompletableFuture|CompletionStage|ScheduledFuture|Future);'; To='import java.util.concurrent.$1;' }
    @{ From='^import nethttp\.(HttpClient|WebSocket);'; To='import java.net.http.$1;' }
    @{ From='^import net\.Socket;'; To='import java.net.Socket;' }
    @{ From='^import time\.(Duration|Instant|Clock);'; To='import java.time.$1;' }
    @{ From='^import imageio\.ImageIO;'; To='import javax.imageio.ImageIO;' }
    @{ From='^import sound\.(Clip|AudioSystem|AudioInputStream|FloatControl);'; To='import javax.sound.sampled.$1;' }
    @{ From='^import security\.(X509EncodedKeySpec|InvalidKeySpecException);'; To='import java.security.spec.$1;' }
    @{ From='^import security\.(Signature|KeyFactory|PublicKey|InvalidKeyException|SignatureException);'; To='import java.security.$1;' }
    @{ From='(?<!java\.)\btime\.(Duration|Instant|Clock)\b'; To='java.time.$1' }
    @{ From='\bnethttp\.(HttpClient|WebSocket)\b'; To='java.net.http.$1' }
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
    @{ From='^import javax\.swing\.SwingUtilities;'; To='import swing.SwingUtilities;' }
    @{ From='^import java\.util\.concurrent\.(Executors|ExecutorService|ScheduledExecutorService|CompletableFuture|CompletionStage|ScheduledFuture|Future);'; To='import concurrent.$1;' }
    @{ From='^import java\.net\.http\.(HttpClient|WebSocket);'; To='import nethttp.$1;' }
    @{ From='^import java\.net\.Socket;'; To='import net.Socket;' }
    @{ From='^import java\.time\.(Duration|Instant|Clock);'; To='import time.$1;' }
    @{ From='^import javax\.imageio\.ImageIO;'; To='import imageio.ImageIO;' }
    @{ From='^import javax\.sound\.sampled\.(Clip|AudioSystem|AudioInputStream|FloatControl);'; To='import sound.$1;' }
    @{ From='^import java\.security\.spec\.(X509EncodedKeySpec|InvalidKeySpecException);'; To='import security.$1;' }
    @{ From='^import java\.security\.(Signature|KeyFactory|PublicKey|InvalidKeyException|SignatureException);'; To='import security.$1;' }
    @{ From='\bjava\.time\.(Duration|Instant|Clock)\b'; To='time.$1' }
    @{ From='\bjava\.net\.http\.(HttpClient|WebSocket)\b'; To='nethttp.$1' }
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
