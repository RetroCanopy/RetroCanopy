$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9222
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_profile_emulation"

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$proc = Start-Process -FilePath $edgePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=$port",
    "--user-data-dir=$tmpDir",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-fre",
    "http://localhost:8080/creators.html"
) -PassThru

Start-Sleep -Seconds 3

try {
    $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
    $target = $pages | Where-Object { $_.type -eq "page" -and $_.url -like "*creators*" } | Select-Object -First 1
    $wsUrl = $target.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ws.ConnectAsync([System.Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

    # Emulate iPhone SE: 375x667
    $override = @{
        id = 1
        method = "Emulation.setDeviceMetricsOverride"
        params = @{
            width = 375
            height = 667
            deviceScaleFactor = 2
            mobile = $true
        }
    } | ConvertTo-Json -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($override)
    $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

    Start-Sleep -Milliseconds 500

    $evalExpr = @"
JSON.stringify({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    banner: (function() {
        var b = document.querySelector('.drop-banner');
        return {
            scrollWidth: b.scrollWidth,
            clientWidth: b.clientWidth,
            overflows: b.scrollWidth > b.clientWidth
        };
    })()
})
"@
    $payload = @{ id = 2; method = "Runtime.evaluate"; params = @{ expression = $evalExpr; returnByValue = $true } } | ConvertTo-Json -Compress
    $bytes2 = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $ws.SendAsync([System.ArraySegment[byte]]::new($bytes2), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

    $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
    $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
    $res.Wait(5000)
    $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
    $obj = $str | ConvertFrom-Json
    Write-Host "Emulated 375px result: $($obj.result.result.value)"
} finally {
    if ($proc -and -not $proc.HasExited) { $proc.Kill() }
    Start-Sleep -Milliseconds 300
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
}
