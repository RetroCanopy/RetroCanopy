$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$url = "http://localhost:8080/index.html"

$viewports = @(
    @{ w = 1920; h = 1080; name = "Desktop 1080p" },
    @{ w = 1280; h = 800;  name = "Desktop 1280x800" },
    @{ w = 768;  h = 1024; name = "Tablet Portrait" },
    @{ w = 390;  h = 844;  name = "iPhone 12/13/14" },
    @{ w = 320;  h = 568;  name = "iPhone SE / Small" },
    @{ w = 800;  h = 320;  name = "Short Landscape" }
)

Write-Host "Checking index.html layout across viewports..." -ForegroundColor Cyan

foreach ($vp in $viewports) {
    # Run headless edge and evaluate DOM metrics via script
    $js = "console.log(JSON.stringify({clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, clientHeight: document.documentElement.clientHeight, scrollHeight: document.documentElement.scrollHeight, logo: document.querySelector('.logo-container')?.getBoundingClientRect(), title: document.querySelector('.brand-name')?.getBoundingClientRect()}))"
    
    # We can create a test html that evaluates this and dumps to console or use devtools/eval
    Write-Host "`nTesting $($vp.name) ($($vp.w)x$($vp.h))..." -ForegroundColor Yellow
}
