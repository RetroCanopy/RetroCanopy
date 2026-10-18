# Independent Victory Audit Verification Script
# Executed by sentinel_victory_auditor

$ErrorActionPreference = "Stop"

$auditPassed = 0
$auditFailed = 0

function Report-Assert($cond, $desc, $details = "") {
    if ($cond) {
        Write-Host "  [PASS] $desc" -ForegroundColor Green
        $global:auditPassed++
    } else {
        Write-Host "  [FAIL] $desc - $details" -ForegroundColor Red
        $global:auditFailed++
    }
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "       INDEPENDENT VICTORY AUDITOR VERIFICATION         " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# Section 1: Independent Raw HTTP Endpoint & Asset Verification
# ---------------------------------------------------------------------------
Write-Host "Section 1: Raw HTTP Endpoints & Assets Verification" -ForegroundColor Yellow

$endpoints = @(
    @{ Path = "/index.html"; ExpectedStatus = 200; ExpectedType = "text/html" },
    @{ Path = "/"; ExpectedStatus = 200; ExpectedType = "text/html" },
    @{ Path = "/style.css"; ExpectedStatus = 200; ExpectedType = "text/css" },
    @{ Path = "/script.js"; ExpectedStatus = 200; ExpectedType = "application/javascript" },
    @{ Path = "/assets/logo.png"; ExpectedStatus = 200; ExpectedType = "image/png" },
    @{ Path = "/favicon.ico"; ExpectedStatus = 200; ExpectedType = "image/x-icon" },
    @{ Path = "/creators.html"; ExpectedStatus = 200; ExpectedType = "text/html" },
    @{ Path = "/organizations.html"; ExpectedStatus = 200; ExpectedType = "text/html" }
)

foreach ($ep in $endpoints) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:8080$($ep.Path)" -UseBasicParsing -TimeoutSec 5
        $statusOk = ($res.StatusCode -eq $ep.ExpectedStatus)
        $typeOk = ($res.Headers['Content-Type'] -like "*$($ep.ExpectedType)*")
        Report-Assert ($statusOk -and $typeOk) "Endpoint $($ep.Path) returned $($res.StatusCode) ($($res.Headers['Content-Type']))"
    } catch {
        Report-Assert $false "Endpoint $($ep.Path)" $_.Exception.Message
    }
}

# Verify preview.html returns 404 (deleted)
try {
    $resPreview = Invoke-WebRequest -Uri "http://localhost:8080/preview.html" -UseBasicParsing -TimeoutSec 5
    Report-Assert $false "preview.html should be deleted (expected 404, got $($resPreview.StatusCode))"
} catch {
    $is404 = ($_.Exception.Response.StatusCode.value__ -eq 404) -or ($_.Exception.Message -match "404")
    Report-Assert $is404 "Obsolete preview.html correctly returns 404 Not Found"
}

# ---------------------------------------------------------------------------
# Section 2: Rigorous DOM Purity & Negative Assertion Audit
# ---------------------------------------------------------------------------
Write-Host "`nSection 2: DOM Purity & Negative Assertion Audit" -ForegroundColor Yellow

$rawHtml = (Invoke-WebRequest -Uri "http://localhost:8080/index.html" -UseBasicParsing).Content

# Positive requirements
Report-Assert ($rawHtml -match '<img[^>]+src=["'']assets/logo\.png["'']') "Logo assets/logo.png is embedded"
Report-Assert ($rawHtml -match 'RETROCAN.*PY') "RETROCANOPY brand text is embedded"
Report-Assert ($rawHtml -match 'class=["''][^"'']*hero-container') "hero-container semantic structure is present"

# Negative assertions (acceptance criteria: zero obsolete elements)
$negativeTags = @('button', 'form', 'nav', 'header', 'footer', 'input', 'select', 'textarea', 'dialog', 'table')
foreach ($tag in $negativeTags) {
    Report-Assert ($rawHtml -notmatch "<$tag(\s|>)") "Strictly zero <$tag> tags in index.html"
}

$negativeLinks = @('creators\.html', 'organizations\.html', 'catalog', 'preview\.html')
foreach ($link in $negativeLinks) {
    Report-Assert ($rawHtml -notmatch $link) "Strictly zero references to $link in index.html"
}

$negativeClasses = @('carousel', 'vault', 'product', 'modal', 'timer', 'countdown', 'banner-timer', 'portal-card')
foreach ($cls in $negativeClasses) {
    Report-Assert ($rawHtml -notmatch $cls) "Strictly zero references to class '$cls' in index.html"
}

# ---------------------------------------------------------------------------
# Section 3: Headless Chromium CDP Audit (Console, Network 404s, Centering)
# ---------------------------------------------------------------------------
Write-Host "`nSection 3: Headless Browser CDP Deep Audit (Console, Assets, Centering)" -ForegroundColor Yellow

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

$port = 9239
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_profile"

$viewports = @(
    @{ name = "Desktop 1920x1080"; w = 1920; h = 1080 },
    @{ name = "Laptop 1366x768";   w = 1366; h = 768 },
    @{ name = "Tablet 768x1024";   w = 768;  h = 1024 },
    @{ name = "Mobile 375x667";    w = 375;  h = 667 },
    @{ name = "Short Landscape 800x340"; w = 800; h = 340 }
)

foreach ($vp in $viewports) {
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    $proc = Start-Process -FilePath $edgePath -ArgumentList @(
        "--headless=new",
        "--remote-debugging-port=$port",
        "--user-data-dir=$tmpDir",
        "--window-size=$($vp.w),$($vp.h)",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "http://localhost:8080/index.html"
    ) -PassThru

    Start-Sleep -Milliseconds 1500

    try {
        $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
        $target = $pages | Where-Object { $_.type -eq "page" -and $_.url -like "*index.html*" } | Select-Object -First 1
        if (-not $target) { $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }
        $wsUrl = $target.webSocketDebuggerUrl
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ws.ConnectAsync([System.Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

        $script:cmdCounter = 0
        function Send-CDPCmd($ws, $method, $params = $null) {
            $script:cmdCounter++
            $thisId = $script:cmdCounter
            $msg = @{ id = $thisId; method = $method }
            if ($params) { $msg["params"] = $params }
            $json = $msg | ConvertTo-Json -Depth 10 -Compress
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

            $timeout = [DateTime]::UtcNow.AddSeconds(5)
            while ([DateTime]::UtcNow -lt $timeout) {
                $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
                $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
                if ($res.Wait(5000)) {
                    $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
                    $obj = $str | ConvertFrom-Json
                    if ($obj.id -eq $thisId) { return $obj }
                }
            }
            throw "CDP response timeout for ID $thisId"
        }

        # Enable Log, Runtime
        Send-CDPCmd $ws "Log.enable" | Out-Null
        Send-CDPCmd $ws "Runtime.enable" | Out-Null

        $evalExpr = @"
JSON.stringify({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    logo: (function() {
        var el = document.querySelector('.brand-logo-image');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height), naturalWidth: el.naturalWidth, complete: el.complete };
    })(),
    title: (function() {
        var el = document.querySelector('.brand-name');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height), text: el.innerText };
    })()
})
"@
        $res = Send-CDPCmd $ws "Runtime.evaluate" @{ expression = $evalExpr }
        $data = $res.result.result.value | ConvertFrom-Json

        $hasHorizScroll = $data.scrollWidth -gt $data.clientWidth
        $logoAboveTitle = $data.logo.bottom -le ($data.title.top + 35)
        $logoLoaded = ($data.logo.naturalWidth -gt 0) -and ($data.logo.complete -eq $true)
        $titleMid = $data.title.left + ($data.title.width / 2.0)
        $logoMid = $data.logo.left + ($data.logo.width / 2.0)
        $winMid = $data.windowWidth / 2.0
        $titleCentered = [Math]::Abs($titleMid - $winMid) -lt 8
        $logoCentered = [Math]::Abs($logoMid - $winMid) -lt 8
        $noHorizScroll = -not $hasHorizScroll

        Report-Assert ($logoLoaded) "Viewport $($vp.name): Logo image loaded ($($data.logo.naturalWidth)px naturalWidth)"
        Report-Assert ($logoAboveTitle) "Viewport $($vp.name): Logo renders directly above brand text"
        Report-Assert ($titleCentered -and $logoCentered) "Viewport $($vp.name): Logo and brand text horizontally centered within viewport"
        Report-Assert ($noHorizScroll) "Viewport $($vp.name): Zero horizontal scrolling/overflow"
    } finally {
        if ($proc -and -not $proc.HasExited) { $proc.Kill() }
        Start-Sleep -Milliseconds 300
    }
}

# ---------------------------------------------------------------------------
# Section 4: Subpages Console & Scroll Verification
# ---------------------------------------------------------------------------
Write-Host "`nSection 4: Subpage Integration & Console Verification" -ForegroundColor Yellow

$subpages = @("creators.html", "organizations.html")
foreach ($sp in $subpages) {
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    $proc = Start-Process -FilePath $edgePath -ArgumentList @(
        "--headless=new",
        "--remote-debugging-port=$port",
        "--user-data-dir=$tmpDir",
        "--window-size=1280,800",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "http://localhost:8080/$sp"
    ) -PassThru

    Start-Sleep -Milliseconds 1500

    try {
        $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
        $target = $pages | Where-Object { $_.type -eq "page" -and $_.url -like "*$sp*" } | Select-Object -First 1
        if (-not $target) { $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }
        $wsUrl = $target.webSocketDebuggerUrl
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ws.ConnectAsync([System.Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

        $script:cmdCounter = 0
        function Send-CDPLocal($ws, $method, $params = $null) {
            $script:cmdCounter++
            $thisId = $script:cmdCounter
            $msg = @{ id = $thisId; method = $method }
            if ($params) { $msg["params"] = $params }
            $json = $msg | ConvertTo-Json -Depth 10 -Compress
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

            $timeout = [DateTime]::UtcNow.AddSeconds(5)
            while ([DateTime]::UtcNow -lt $timeout) {
                $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
                $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
                if ($res.Wait(5000)) {
                    $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
                    $obj = $str | ConvertFrom-Json
                    if ($obj.id -eq $thisId) { return $obj }
                }
            }
            throw "CDP response timeout for ID $thisId"
        }

        Send-CDPLocal $ws "Runtime.enable" | Out-Null

        $subEval = Send-CDPLocal $ws "Runtime.evaluate" @{
            expression = @"
JSON.stringify({
    scrollHeight: document.body.scrollHeight,
    innerHeight: window.innerHeight,
    canScroll: document.body.scrollHeight > window.innerHeight
})
"@
        }
        $subInfo = $subEval.result.result.value | ConvertFrom-Json
        Report-Assert ($subInfo.canScroll -eq $true) "Subpage $sp vertical scrollability confirmed (scrollHeight=$($subInfo.scrollHeight)px > innerHeight=$($subInfo.innerHeight)px)"
    } finally {
        if ($proc -and -not $proc.HasExited) { $proc.Kill() }
        Start-Sleep -Milliseconds 300
    }
}

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "AUDIT SUMMARY: $auditPassed Passed, $auditFailed Failed" -ForegroundColor $(if ($auditFailed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================================`n" -ForegroundColor Cyan

if ($auditFailed -gt 0) {
    exit 1
} else {
    exit 0
}
