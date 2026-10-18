$css = Get-Content 'style.css' -Raw
$cssClasses = [regex]::Matches($css, '(?<![0-9\w])\.([a-zA-Z_-][a-zA-Z0-9_-]*)(?=\s*[\{,:\. >+~\[])') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$pages = @('creators.html', 'organizations.html', 'index.html')
$htmlContent = ($pages | ForEach-Object { Get-Content $_ -Raw }) -join ' '

$htmlClasses = [regex]::Matches($htmlContent, 'class=["'']([^"'']+)["'']') | ForEach-Object { 
    $_.Groups[1].Value -split '\s+' 
} | Where-Object { $_ -ne '' } | Select-Object -Unique

$unused = @()
$used = @()
foreach ($c in $cssClasses) {
    if ($htmlClasses -contains $c) {
        $used += $c
    } else {
        $unused += $c
    }
}
Write-Host "Total unique classes in style.css: $($cssClasses.Count)" -ForegroundColor Cyan
Write-Host "Used in HTML: $($used.Count)" -ForegroundColor Green
Write-Host "NOT found in HTML: $($unused.Count)" -ForegroundColor Yellow
foreach ($u in $unused) {
    Write-Host "  - $u"
}
