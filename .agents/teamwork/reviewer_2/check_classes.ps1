$css = Get-Content 'style.css' -Raw
$pages = @('creators.html', 'organizations.html', 'index.html')

foreach ($page in $pages) {
    $content = Get-Content $page -Raw
    $matches = [regex]::Matches($content, 'class=\s*["'']([^"'']+)["'']') | ForEach-Object { 
        $_.Groups[1].Value -split '\s+' 
    } | Where-Object { $_ -ne '' } | Select-Object -Unique

    Write-Host "`nPage: $page" -ForegroundColor Cyan
    foreach ($c in $matches) {
        $pattern = '\.' + [regex]::Escape($c) + '\b'
        if ($css -notmatch $pattern) {
            Write-Host "  MISSING: $c" -ForegroundColor Red
        } else {
            Write-Host "  OK: $c" -ForegroundColor Green
        }
    }
}
