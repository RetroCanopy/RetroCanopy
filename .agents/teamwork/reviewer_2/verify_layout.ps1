# Comprehensive Layout & Cross-Page Verification Script
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9222
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_profile"

function Run-Viewports-Test($url) {
    $viewports = @(
        @{ w = 1280; h = 800; name = "Desktop 1280x800" },
        @{ w = 390;  h = 844; name = "Mobile 390x844" },
        @{ w = 320;  h = 568; name = "Narrow Mobile 320x568" },
        @{ w = 800;  h = 340; name = "Short Landscape 800x340" }
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
            $url
        ) -PassThru

        Start-Sleep -Milliseconds 1200

        try {
            $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
            $target = $pages | Where-Object { $_.type -eq "page" -and ($_.url -like "*retrocanopy*" -or $_.url -like "*8080*") } | Select-Object -First 1
            if (-not $target) { $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }

            $wsUrl = $target.webSocketDebuggerUrl
            $ws = New-Object System.Net.WebSockets.ClientWebSocket
            $ct = [System.Threading.CancellationToken]::None
            $task = $ws.ConnectAsync([System.Uri]$wsUrl, $ct)
            $task.Wait(5000)

            $script:cmdCounter = 0
            function Send-CDP($ws, $method, $params = $null) {
                $script:cmdCounter++
                $thisId = $script:cmdCounter
                $payload = @{ id = $thisId; method = $method }
                if ($params) { $payload["params"] = $params }
                $json = $payload | ConvertTo-Json -Depth 10 -Compress
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

                $timeout = [DateTime]::UtcNow.AddSeconds(5)
                while ([DateTime]::UtcNow -lt $timeout) {
                    $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
                    $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
                    $res.Wait(5000)
                    $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
                    $obj = $str | ConvertFrom-Json
                    if ($obj.id -eq $thisId) { return $obj }
                }
                throw "Timeout waiting for CDP response id $thisId"
            }

            $evalExpr = @"
JSON.stringify({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
    logoRect: (function() {
        var el = document.querySelector('.logo-container');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
    })(),
    titleRect: (function() {
        var el = document.querySelector('.brand-name');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
    })()
})
"@
            $evalRes = Send-CDP $ws "Runtime.evaluate" @{ expression = $evalExpr }
            $m = $evalRes.result.result.value | ConvertFrom-Json

            $hOverflow = $m.scrollWidth -gt $m.clientWidth
            $vOverflow = $m.scrollHeight -gt $m.clientHeight
            $titleClipped = $m.titleRect -and ($m.titleRect.left -lt 0 -or $m.titleRect.right -gt $m.clientWidth)

            Write-Host "[$($vp.name)] Viewport: $($m.clientWidth)x$($m.clientHeight) | Scroll: $($m.scrollWidth)x$($m.scrollHeight) | H-Overflow: $hOverflow | V-Overflow: $vOverflow | Title Clipped: $titleClipped" -ForegroundColor $(if ($hOverflow -or $titleClipped) { "Red" } else { "Green" })
            if ($m.titleRect) {
                Write-Host "   Title bounds: Left=$($m.titleRect.left), Right=$($m.titleRect.right), Width=$($m.titleRect.width)" -ForegroundColor Gray
            }

        } finally {
            if ($proc -and -not $proc.HasExited) { $proc.Kill() }
            Start-Sleep -Milliseconds 400
        }
    }
}

Write-Host "=== TESTING index.html ===" -ForegroundColor Cyan
Run-Viewports-Test "http://localhost:8080/index.html"

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
