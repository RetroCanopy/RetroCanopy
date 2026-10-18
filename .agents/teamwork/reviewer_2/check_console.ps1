# Console Errors and Network 404 Checker via CDP
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$port = 9222
$tmpDir = Join-Path $PSScriptRoot "edge_cdp_console_profile"

$urls = @(
    "http://localhost:8080/index.html",
    "http://localhost:8080/creators.html",
    "http://localhost:8080/organizations.html"
)

$allPassed = $true

foreach ($url in $urls) {
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
        $url
    ) -PassThru

    Start-Sleep -Milliseconds 1500

    try {
        $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list" -TimeoutSec 5
        $target = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1
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
            return $thisId
        }

        $errors = [System.Collections.Generic.List[string]]::new()

        $null = Send-CDP $ws "Log.enable"
        $null = Send-CDP $ws "Runtime.enable"
        $null = Send-CDP $ws "Network.enable"

        # Read frames for 2 seconds
        $timeout = [DateTime]::UtcNow.AddSeconds(2.5)
        while ([DateTime]::UtcNow -lt $timeout) {
            $buffer = [System.ArraySegment[byte]]::new((New-Object byte[] 65536))
            $res = $ws.ReceiveAsync($buffer, [System.Threading.CancellationToken]::None)
            if ($res.Wait(500)) {
                $str = [System.Text.Encoding]::UTF8.GetString($buffer.Array, 0, $res.Result.Count)
                $obj = $str | ConvertFrom-Json
                if ($obj.method -eq "Log.entryAdded" -and $obj.params.entry.level -eq "error") {
                    $errors.Add("Log Error: $($obj.params.entry.text) ($($obj.params.entry.url))")
                }
                if ($obj.method -eq "Runtime.exceptionThrown") {
                    $errors.Add("JS Exception: $($obj.params.exceptionDetails.text): $($obj.params.exceptionDetails.exception.description)")
                }
                if ($obj.method -eq "Network.responseReceived" -and $obj.params.response.status -ge 400) {
                    $errors.Add("HTTP $($obj.params.response.status): $($obj.params.response.url)")
                }
            }
        }

        Write-Host "`nTesting Console & Network for $url" -ForegroundColor Cyan
        if ($errors.Count -eq 0) {
            Write-Host "  [PASS] Zero console errors, zero runtime exceptions, zero HTTP 4xx/5xx requests." -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] Errors detected:" -ForegroundColor Red
            foreach ($e in $errors) {
                Write-Host "    - $e" -ForegroundColor Red
            }
            $allPassed = $false
        }
    } finally {
        if ($proc -and -not $proc.HasExited) { $proc.Kill() }
        Start-Sleep -Milliseconds 300
    }
}

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }

if (-not $allPassed) { exit 1 } else { exit 0 }
