# Get Zone ID
$headers = @{
    "Authorization" = "Bearer YOUR_API_TOKEN"
    "Content-Type" = "application/json"
}

try {
    $zones = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=mmc-mms.com" -Headers $headers -Method Get
    $zoneId = $zones.result[0].id
    Write-Host "Zone ID: $zoneId" -ForegroundColor Green
    
    # Get current DNS records
    Write-Host "`nجاري الحصول على DNS records الحالية..." -ForegroundColor Cyan
    $records = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?name=mmc-mms.com" -Headers $headers -Method Get
    
    # Delete old A and AAAA records for apex domain
    Write-Host "`nجاري حذف A/AAAA records القديمة..." -ForegroundColor Yellow
    foreach ($record in $records.result) {
        if ($record.name -eq "mmc-mms.com" -and ($record.type -eq "A" -or $record.type -eq "AAAA")) {
            Write-Host "  حذف: $($record.type) $($record.content)" -ForegroundColor Red
            Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records/$($record.id)" -Headers $headers -Method Delete | Out-Null
        }
    }
    
    # Create CNAME record for apex domain
    Write-Host "`nجاري إضافة CNAME record..." -ForegroundColor Green
    $cnameData = @{
        type = "CNAME"
        name = "@"
        content = "2027-5a0.pages.dev"
        proxied = $true
        ttl = 1
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers -Method Post -Body $cnameData
    Write-Host "✅ CNAME record created successfully!" -ForegroundColor Green
    Write-Host "  @ -> 2027-5a0.pages.dev (Proxied)" -ForegroundColor White
    
} catch {
    Write-Host "❌ خطأ في API: $_" -ForegroundColor Red
}
