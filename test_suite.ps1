# Validation Test Suite for Retrocanopy Minimal Redesign

$testsPassed = 0
$testsFailed = 0

function Assert-Condition($condition, $testName) {
    if ($condition) {
        Write-Host "[PASS] $testName" -ForegroundColor Green
        $global:testsPassed++
    } else {
        Write-Host "[FAIL] $testName" -ForegroundColor Red
        $global:testsFailed++
    }
}

$html = Get-Content (Join-Path $PSScriptRoot "index.html") -Raw
$css = Get-Content (Join-Path $PSScriptRoot "style.css") -Raw
$js = Get-Content (Join-Path $PSScriptRoot "script.js") -Raw

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "      RETROCANOPY REDESIGN TEST SUITE        " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Visual Presentation Requirements
Write-Host "`n--- Requirement R1: Minimal Clean Hero ---" -ForegroundColor Yellow
Assert-Condition ($html -match '<img[^>]+src=["'']assets/logo\.png["'']') "index.html contains official logo assets/logo.png"
Assert-Condition ($html -match 'RETROCAN.*PY') "index.html contains RETROCANOPY brand text"
Assert-Condition ($html -notmatch '<button') "index.html has zero buttons"
Assert-Condition ($html -notmatch '<form') "index.html has zero forms"
Assert-Condition ($html -notmatch '<footer') "index.html has zero footers"
Assert-Condition ($html -notmatch 'drop-banner') "index.html has zero countdown banners"
Assert-Condition ($html -notmatch 'vault-carousel|vault-section') "index.html has zero product carousels or vault sections"
Assert-Condition ($html -notmatch 'portal-section') "index.html has zero portal cards"
Assert-Condition ($html -notmatch 'order-modal|creator-modal') "index.html has zero modal overlays"
Assert-Condition ($html -notmatch 'creators\.html|organizations\.html') "index.html has zero subpage links"

# 2. Viewport Centering & Aesthetic
Write-Host "`n--- Viewport Centering & Synthwave Aesthetic ---" -ForegroundColor Yellow
Assert-Condition ($css -match '\.hero-container\s*\{[^}]*min-height:\s*100vh') "hero-container fills full viewport height (100vh)"
Assert-Condition ($css -match '\.hero-container\s*\{[^}]*display:\s*flex' -and $css -match '\.hero-container\s*\{[^}]*justify-content:\s*center' -and $css -match '\.hero-container\s*\{[^}]*align-items:\s*center') "hero-container is vertically and horizontally centered"
Assert-Condition ($css -match 'synthwave-grid-scroll') "CSS contains perspective synthwave grid animation"
Assert-Condition ($css -match 'title-float') "CSS contains retro synthwave title floating animation"
Assert-Condition ($css -match 'erratic-flicker') "CSS contains neon erratic flicker animation"
Assert-Condition ($css -match 'drop-shadow') "CSS contains neon drop-shadow glow"
Assert-Condition ($css -match 'prefers-reduced-motion') "CSS includes prefers-reduced-motion accessibility support"
Assert-Condition ($css -match 'max-height:\s*520px') "CSS includes short-viewport landscape media query"

# 3. Codebase Cleanliness & Subpage Support
Write-Host "`n--- Requirement R2: Codebase Cleanliness & No Broken Links ---" -ForegroundColor Yellow
Assert-Condition (Test-Path (Join-Path $PSScriptRoot "assets\logo.png")) "assets/logo.png exists"
Assert-Condition (Test-Path (Join-Path $PSScriptRoot "style.css")) "style.css exists"
Assert-Condition (Test-Path (Join-Path $PSScriptRoot "script.js")) "script.js exists"
Assert-Condition (-not (Test-Path (Join-Path $PSScriptRoot "preview.html"))) "Obsolete broken preview.html is deleted"
Assert-Condition ($css -notmatch 'body\s*\{[^}]*overflow:\s*hidden') "body does not lock vertical scroll (allows subpage scrolling)"
Assert-Condition ($css -notmatch 'body\s*\{[^}]*contain:\s*paint') "body does not have contain: paint (prevents 3D perspective overflow)"
Assert-Condition ($css -match '\.trust-highlight-card' -and $css -match '\.trust-pill') "style.css retains partner trust styles for organizations.html"
Assert-Condition ($css -notmatch '\.modal-overlay\s*\{' -and $css -notmatch '\.modal-card\s*\{') "style.css has zero orphaned modal overlay/card container rules"
Assert-Condition ($html -match '<link[^>]+rel=["'']icon["'']') "index.html contains favicon link"
Assert-Condition ($css -match '\.hero-btn' -and $css -match '\.primary-btn') "style.css retains subpage hero button styles"
Assert-Condition ($css -match '\.calc-result-box' -and $css -match '\.calc-results') "style.css retains interactive calculator styles"
Assert-Condition ($css -match '\.creator-badge' -and $css -match '\.org-badge') "style.css retains creator & organization badges"
Assert-Condition ($css -notmatch '\.banner-timer\s*\{' -and $css -notmatch '\.banner-nav-links\s*\{') "style.css has zero orphaned banner-timer or banner-nav-links rules"
Assert-Condition ($css -match 'footer[^{]*\{[^}]*position:\s*relative' -and $css -match 'footer[^{]*\{[^}]*z-index:\s*2') "footer has position: relative and z-index: 2 (prevents floor grid overlay)"
Assert-Condition ($css -match '@media\s*\(max-width:\s*640px\)\s*\{[^\}]*\.banner-cta\s*\{[^\}]*display:\s*none') "style.css includes responsive rule hiding banner-cta on mobile"
Assert-Condition ($css -match '\.brand-name\s*\{[^}]*color:\s*transparent') "brand-name includes standard color: transparent for cross-engine gradients"

$creatorsHtml = Get-Content (Join-Path $PSScriptRoot "creators.html") -Raw
$orgsHtml = Get-Content (Join-Path $PSScriptRoot "organizations.html") -Raw
$clientJs = Get-Content (Join-Path $PSScriptRoot "supabase-client.js") -Raw
Assert-Condition ($creatorsHtml -notmatch '<a[^>]+>Catalog</a>' -and $orgsHtml -notmatch '<a[^>]+>Catalog</a>') "Subpages have zero obsolete Catalog footer links"
Assert-Condition ($creatorsHtml -notmatch 'black-key' -and $orgsHtml -notmatch 'black-key') "Subpages have zero orphaned black-key SVG filter elements"
Assert-Condition ($clientJs -match 'window\.db\s*=') "supabase-client.js explicitly attaches client to window.db"
Assert-Condition ($html -match '<meta\s+name=["'']description["'']') "index.html includes meta description"

# 4. Dev Server Verification (HTTP 200 on port 8080)
Write-Host "`n--- Requirement R3: Dev Server Verification ---" -ForegroundColor Yellow
try {
    $res = Invoke-WebRequest -Uri "http://localhost:8080/index.html" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($res.StatusCode -eq 200) "HTTP 200 returned on http://localhost:8080/index.html"
    Assert-Condition ($res.Headers['Content-Type'] -match 'text/html') "Content-Type is text/html"
} catch {
    Assert-Condition $false "Dev server responded to request on port 8080: $_"
}

try {
    $resRoot = Invoke-WebRequest -Uri "http://localhost:8080/" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resRoot.StatusCode -eq 200) "HTTP 200 returned on root http://localhost:8080/"
} catch {
    Assert-Condition $false "Dev server responded to root request: $_"
}

try {
    $resLogo = Invoke-WebRequest -Uri "http://localhost:8080/assets/logo.png" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resLogo.StatusCode -eq 200 -and $resLogo.Headers['Content-Type'] -match 'image/png') "HTTP 200 image/png on http://localhost:8080/assets/logo.png"
} catch {
    Assert-Condition $false "Dev server responded to logo request: $_"
}

try {
    $resFavicon = Invoke-WebRequest -Uri "http://localhost:8080/favicon.ico" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resFavicon.StatusCode -eq 200) "HTTP 200 on http://localhost:8080/favicon.ico"
} catch {
    Assert-Condition $false "Dev server responded to favicon request: $_"
}

try {
    $resCreators = Invoke-WebRequest -Uri "http://localhost:8080/creators.html" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resCreators.StatusCode -eq 200) "HTTP 200 returned on http://localhost:8080/creators.html"
} catch {
    Assert-Condition $false "Dev server responded to creators page request: $_"
}

try {
    $resOrgs = Invoke-WebRequest -Uri "http://localhost:8080/organizations.html" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resOrgs.StatusCode -eq 200) "HTTP 200 returned on http://localhost:8080/organizations.html"
} catch {
    Assert-Condition $false "Dev server responded to orgs page request: $_"
}

try {
    $resCss = Invoke-WebRequest -Uri "http://localhost:8080/style.css" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resCss.StatusCode -eq 200 -and $resCss.Headers['Content-Type'] -match 'text/css') "HTTP 200 text/css on http://localhost:8080/style.css"
} catch {
    Assert-Condition $false "Dev server responded to css request: $_"
}

try {
    $resJs = Invoke-WebRequest -Uri "http://localhost:8080/script.js" -UseBasicParsing -TimeoutSec 5
    Assert-Condition ($resJs.StatusCode -eq 200 -and $resJs.Headers['Content-Type'] -match 'application/javascript') "HTTP 200 application/javascript on http://localhost:8080/script.js"
} catch {
    Assert-Condition $false "Dev server responded to js request: $_"
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "Results: $testsPassed Passed, $testsFailed Failed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "=============================================" -ForegroundColor Cyan

if ($testsFailed -gt 0) {
    exit 1
} else {
    exit 0
}
