# Check console errors via Edge debug log
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$tmpDir = Join-Path $PSScriptRoot "edge_log_profile"

$urls = @(
    "http://localhost:8080/index.html",
    "http://localhost:8080/creators.html",
    "http://localhost:8080/organizations.html"
)

foreach ($url in $urls) {
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    $logFile = Join-Path $tmpDir "chrome_debug.log"

    $proc = Start-Process -FilePath $edgePath -ArgumentList @(
        "--headless=new",
        "--enable-logging",
        "--v=1",
        "--user-data-dir=$tmpDir",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        $url
    ) -PassThru

    Start-Sleep -Seconds 2
    if ($proc -and -not $proc.HasExited) { $proc.Kill() }
    Start-Sleep -Milliseconds 400

    Write-Host "`n=== Console Log Check for $url ===" -ForegroundColor Cyan
    if (Test-Path $logFile) {
        $logContent = Get-Content $logFile -Raw
        $jsErrors = ($logContent -split "`n") | Where-Object { $_ -match "CONSOLE.*error" -or $_ -match "Uncaught" }
        if ($jsErrors) {
            Write-Host "Errors found:" -ForegroundColor Red
            $jsErrors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        } else {
            Write-Host "Zero console errors detected in browser log." -ForegroundColor Green
        }
    } else {
        Write-Host "Log file not created (clean execution)." -ForegroundColor Green
    }
}

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
