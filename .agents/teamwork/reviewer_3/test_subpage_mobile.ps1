$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9222
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_profile_subpages"

function Check-Subpage($url, $w, $h) {
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    $proc = Start-Process -FilePath $edgePath -ArgumentList @(
        "--headless=new",
        "--remote-debugging-port=$port",
        "--user-data-dir=$tmpDir",
        "--window-size=$w,$h",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-fre",
        $url
    ) -PassThru

    Start-Sleep -Seconds 3

    try {
        $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
        $target = $pages | Where-Object { $_.type -eq "page" -and ($_.url -like "*8080*" -or $_.url -like "*creators*" -or $_.url -like "*organizations*") } | Select-Object -First 1
        if (-not $target) { $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }
        $wsUrl = $target.webSocketDebuggerUrl
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ws.ConnectAsync([System.Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

        $evalExpr = @"
JSON.stringify({
    url: window.location.href,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    banner: (function() {
        var b = document.querySelector('.drop-banner');
        if (!b) return null;
        return {
            scrollWidth: b.scrollWidth,
            clientWidth: b.clientWidth,
            overflows: b.scrollWidth > b.clientWidth,
            items: Array.from(b.children).map(function(c) {
                var cr = c.getBoundingClientRect();
                return { cls: c.className, left: Math.round(cr.left), right: Math.round(cr.right), width: Math.round(cr.width) };
            })
        };
    })()
})
"@
        $id = 1
        $payload = @{ id = $id; method = "Runtime.evaluate"; params = @{ expression = $evalExpr; returnByValue = $true } } | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

        $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
        $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
        $res.Wait(5000)
        $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
        $obj = $str | ConvertFrom-Json
        $val = $obj.result.result.value | ConvertFrom-Json
        Write-Host "URL: $($val.url) Viewport: $($val.clientWidth) | ScrollWidth: $($val.scrollWidth) | H-Overflow: $($val.hOverflow)"
        if ($val.banner) {
            Write-Host "  Banner scrollWidth: $($val.banner.scrollWidth) vs clientWidth: $($val.banner.clientWidth) (overflows: $($val.banner.overflows))"
            foreach ($it in $val.banner.items) {
                Write-Host "    - $($it.cls): width=$($it.width), left=$($it.left), right=$($it.right)"
            }
        }
    } finally {
        if ($proc -and -not $proc.HasExited) { $proc.Kill() }
        Start-Sleep -Milliseconds 300
        if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
    }
}

Write-Host "=== Testing creators.html on mobile (390x844) ===" -ForegroundColor Cyan
Check-Subpage "http://localhost:8080/creators.html" 390 844

Write-Host "`n=== Testing organizations.html on mobile (390x844) ===" -ForegroundColor Cyan
Check-Subpage "http://localhost:8080/organizations.html" 390 844

Write-Host "`n=== Testing creators.html on narrow mobile (320x568) ===" -ForegroundColor Cyan
Check-Subpage "http://localhost:8080/creators.html" 320 568
