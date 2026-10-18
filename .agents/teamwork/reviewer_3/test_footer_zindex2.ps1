$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9222
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_profile_footer2"

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$proc = Start-Process -FilePath $edgePath -ArgumentList @(
    "--headless=new",
    "--remote-debugging-port=$port",
    "--user-data-dir=$tmpDir",
    "--window-size=1280,800",
    "--disable-gpu",
    "http://localhost:8080/creators.html"
) -PassThru

Start-Sleep -Milliseconds 1500

try {
    $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
    $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1
    $wsUrl = $target.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ws.ConnectAsync([System.Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

    $evalExpr = "(function() { var f = document.querySelector('footer'); var cs = window.getComputedStyle(f); return 'pos=' + cs.position + ', zIndex=' + cs.zIndex; })()"
    $payload = @{ id = 1; method = "Runtime.evaluate"; params = @{ expression = $evalExpr; returnByValue = $true } } | ConvertTo-Json -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

    $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
    $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
    $res.Wait(5000)
    $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
    Write-Host "Raw: $str"
} finally {
    if ($proc -and -not $proc.HasExited) { $proc.Kill() }
    Start-Sleep -Milliseconds 300
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
}
