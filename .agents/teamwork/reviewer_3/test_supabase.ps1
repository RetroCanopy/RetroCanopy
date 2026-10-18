$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4YXZ2cnF5enB3c2N6cGl3bXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTA4MDksImV4cCI6MjEwNzU4NjgwOX0.XvOWwBlOBjGYxkQrD8eZvnaWaKb0qMW9HVtWhlnI6Yo'
$headers = @{
    'apikey' = $key
    'Authorization' = "Bearer $key"
}
foreach ($table in @('creator_applications', 'organization_orders', 'products', 'preorders')) {
    $url = "https://axavvrqyzpwsczpiwmua.supabase.co/rest/v1/$table"
    try {
        $res = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -TimeoutSec 5
        Write-Host "Table $table : Success! Rows: $($res.Count)"
    } catch {
        Write-Host "Table $table : Error! $($_.Exception.Message)"
    }
}
