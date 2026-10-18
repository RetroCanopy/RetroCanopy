$endpoints = @('', 'index.html', 'assets/logo.png', 'style.css', 'script.js', 'favicon.ico', 'creators.html', 'organizations.html')

foreach ($ep in $endpoints) {
    $url = "http://localhost:8080/$ep"
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Host "[$($resp.StatusCode)] $url -> $($resp.Headers['Content-Type']) ($($resp.RawContentLength) bytes)"
    } catch {
        Write-Host "[FAIL] $url -> $_" -ForegroundColor Red
    }
}
