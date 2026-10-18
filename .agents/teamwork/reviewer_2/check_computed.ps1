# Subpage Elements & Computed Style Check
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9222
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_profile"
if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$proc = Start-Process -FilePath $edgePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=$port",
    "--user-data-dir=$tmpDir",
    "--window-size=1280,900",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:8080/creators.html"
) -PassThru

Start-Sleep -Milliseconds 1500

try {
    $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
    $target = $pages | Where-Object { $_.type -eq "page" -and $_.url -like "*creators.html*" } | Select-Object -First 1
    if (-not $target) { $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }
    Write-Host "Target URL: $($target.url)" -ForegroundColor Cyan
    $wsUrl = $target.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ws.ConnectAsync([System.Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

    function Send-CDP($ws, $method, $params = $null) {
        $msg = @{ id = 1; method = $method }
        if ($params) { $msg["params"] = $params }
        $json = $msg | ConvertTo-Json -Depth 10 -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

        $timeout = [DateTime]::UtcNow.AddSeconds(5)
        while ([DateTime]::UtcNow -lt $timeout) {
            $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
            $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
            $res.Wait(5000)
            $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
            $obj = $str | ConvertFrom-Json
            if ($obj.id -eq 1) { return $obj }
        }
    }

    $evalExpr = @"
(function() {
    function getStyle(sel, prop) {
        var el = document.querySelector(sel);
        if (!el) return 'ELEMENT NOT FOUND: ' + sel;
        return window.getComputedStyle(el)[prop];
    }
    return JSON.stringify({
        heroBtnDisplay: getStyle('.hero-btn.primary-btn', 'display'),
        heroBtnBg: getStyle('.hero-btn.primary-btn', 'backgroundImage'),
        heroBtnColor: getStyle('.hero-btn.primary-btn', 'color'),
        calcResultsDisplay: getStyle('.calc-results', 'display'),
        calcRetroBoxBg: getStyle('.calc-result-box.retrocanopy', 'backgroundColor'),
        calcRetroBoxBorder: getStyle('.calc-result-box.retrocanopy', 'borderColor'),
        creatorBadgeBorder: getStyle('.creator-badge', 'borderColor'),
        creatorBadgeDisplay: getStyle('.creator-badge', 'display'),
        creatorCollabBorder: getStyle('.creator-collab-section', 'borderColor')
    });
})()
"@
    $res = Send-CDP $ws "Runtime.evaluate" @{ expression = $evalExpr }
    Write-Host "`nCDP Response:" -ForegroundColor Yellow
    Write-Host ($res | ConvertTo-Json -Depth 6)
} finally {
    if ($proc -and -not $proc.HasExited) { $proc.Kill() }
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
}
