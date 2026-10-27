$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$page = Join-Path $root 'web\index.html'
if (-not (Test-Path $page)) { throw "web\index.html not found. Keep apply_ui.ps1 inside the claimsense folder." }

# one-time backup of the page as it is before this upgrade
$bak = Join-Path $root 'web\index.before-ui.html'
if (-not (Test-Path $bak)) { Copy-Item $page $bak }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$css  = [IO.File]::ReadAllText((Join-Path $root 'ui\ui-patch.css'), $utf8)
$js   = [IO.File]::ReadAllText((Join-Path $root 'ui\ui-patch.js'), $utf8)
$html = [IO.File]::ReadAllText($page, $utf8)

# remove earlier patches (tabs, chat, and any previous run of this one)
$html = [regex]::Replace($html, '(?s)<script id="(tabs-patch|chat-patch|ui-patch)">.*?</script>\s*', '')
$html = [regex]::Replace($html, '(?s)<style id="(chat-style|ui-style)">.*?</style>\s*', '')

# Hindi and Marathi need UTF-8 declared
if ($html -notmatch '(?i)<meta[^>]+charset') {
  $html = ([regex]'(?i)<head>').Replace($html, '<head><meta charset="utf-8">', 1)
}

$block = "<style id=`"ui-style`">`n" + $css + "`n</style>`n<script id=`"ui-patch`">`n" + $js + "`n</script>`n"
$i = $html.LastIndexOf('</body>')
if ($i -lt 0) { throw "</body> not found in web\index.html" }
$html = $html.Insert($i, $block)

[IO.File]::WriteAllText($page, $html, $utf8)
Write-Host "Done. Start the server and press Ctrl+F5 in the browser." -ForegroundColor Green
Write-Host "To undo: Copy-Item web\index.before-ui.html web\index.html -Force"
