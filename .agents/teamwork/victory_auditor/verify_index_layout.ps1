# Independent Victory Auditor Viewport & Layout Test for index.html
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

$port = 9228
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_layout_profile"

$viewports = @(
    @{ name = "Desktop 1920x1080"; w = 1920; h = 1080 },
    @{ name = "Laptop 1366x768";   w = 1366; h = 768 },
    @{ name = "Tablet 768x1024";   w = 768;  h = 1024 },
    @{ name = "Mobile 375x667";    w = 375;  h = 667 }
)

$allPassed = $true

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
        function Send-CDP($ws, $method, $params = $null) {
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

        $evalExpr = @"
JSON.stringify({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
    logo: (function() {
        var el = document.querySelector('.brand-logo-image');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height), naturalWidth: el.naturalWidth };
    })(),
    title: (function() {
        var el = document.querySelector('.brand-name');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height), text: el.innerText };
    })()
})
"@
        $res = Send-CDP $ws "Runtime.evaluate" @{ expression = $evalExpr }
        $data = $res.result.result.value | ConvertFrom-Json

        Write-Host "Viewport: $($vp.name)" -ForegroundColor Cyan
        Write-Host "  Window Inner: $($data.windowWidth)x$($data.windowHeight) | Scroll: $($data.scrollWidth)x$($data.scrollHeight)"
        Write-Host "  Logo: $($data.logo.width)x$($data.logo.height) at top=$($data.logo.top), left=$($data.logo.left) (naturalWidth=$($data.logo.naturalWidth))"
        Write-Host "  Title: '$($data.title.text)' ($($data.title.width)x$($data.title.height)) at top=$($data.title.top), left=$($data.title.left)"

        $hasHorizScroll = $data.scrollWidth -gt $data.clientWidth
        $logoAboveTitle = $data.logo.top -lt $data.title.top
        $logoLoaded = $data.logo.naturalWidth -gt 0
        $titleMid = $data.title.left + ($data.title.width / 2.0)
        $winMid = $data.windowWidth / 2.0
        $titleCentered = [Math]::Abs($titleMid - $winMid) -lt 8
        $noHorizScroll = -not $hasHorizScroll

        Write-Host "  H-Overflow: $hasHorizScroll | Logo Above Title: $logoAboveTitle | Title Centered: $titleCentered (mid=$titleMid, winMid=$winMid)"

        if ($logoAboveTitle -and $logoLoaded -and $titleCentered -and $noHorizScroll) {
            Write-Host "  [PASS] Clean minimal centering verified.`n" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Layout check failed.`n" -ForegroundColor Red
            $allPassed = $false
        }

    } finally {
        if ($proc -and -not $proc.HasExited) { $proc.Kill() }
        Start-Sleep -Milliseconds 300
    }
}

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }

if (-not $allPassed) { exit 1 } else { exit 0 }
