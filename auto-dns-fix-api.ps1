# 🚀 تنفيذ تلقائي: تعديل DNS باستخدام Cloudflare API
# Automatic Execution: DNS Modification using Cloudflare API

param(
    [switch]$Execute = $false
)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🚀 تنفيذ تلقائي: تعديل DNS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get Cloudflare API Token from wrangler
Write-Host "🔍 جاري الحصول على API Token..." -ForegroundColor Cyan

# Try to extract token from wrangler config
$wranglerConfigPath = "$env:USERPROFILE\.wrangler\config\default.toml"
if (Test-Path $wranglerConfigPath) {
    Write-Host "✅ Found wrangler config" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Wrangler config not found at expected location" -ForegroundColor Yellow
}

# Account details
$accountId = "f8c5e563eb7dc2635afc2f6b73fa4eb9"
$zoneName = "mmc-mms.com"

Write-Host ""
Write-Host "📋 المعلومات:" -ForegroundColor Yellow
Write-Host "  • Account ID: $accountId" -ForegroundColor White
Write-Host "  • Zone Name:  $zoneName" -ForegroundColor White
Write-Host ""

# Step 1: Get Zone ID
Write-Host "🔍 الخطوة 1: الحصول على Zone ID..." -ForegroundColor Cyan
Write-Host ""

# Since we need to use wrangler's OAuth token, let's try a different approach
# We'll use PowerShell Invoke-RestMethod with the token

Write-Host "⚠️  ملاحظة مهمة:" -ForegroundColor Yellow
Write-Host "  لاستخدام Cloudflare API، نحتاج:" -ForegroundColor White
Write-Host "  1. Zone ID للنطاق mmc-mms.com" -ForegroundColor White
Write-Host "  2. API Token مع صلاحية zone:dns:edit" -ForegroundColor White
Write-Host ""

# Try to get Zone ID using a workaround
Write-Host "🔧 محاولة الحصول على Zone ID..." -ForegroundColor Cyan

# Create API script
$apiScript = @'
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
'@

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔑 للتنفيذ التلقائي، نحتاج API Token" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "خياران للمتابعة:" -ForegroundColor Green
Write-Host ""
Write-Host "الخيار 1️⃣: استخدام Dashboard (موصى به - 3 دقائق)" -ForegroundColor Cyan
Write-Host "  → الصفحات مفتوحة في المتصفح" -ForegroundColor White
Write-Host "  → اتبع الخطوات الموضحة" -ForegroundColor White
Write-Host ""
Write-Host "الخيار 2️⃣: إنشاء API Token للتنفيذ التلقائي" -ForegroundColor Cyan
Write-Host "  1. اذهب إلى: My Profile → API Tokens" -ForegroundColor White
Write-Host "  2. Create Token → Edit zone DNS" -ForegroundColor White
Write-Host "  3. Zone: mmc-mms.com" -ForegroundColor White
Write-Host "  4. Permissions: Zone.DNS.Edit" -ForegroundColor White
Write-Host "  5. انسخ الـ Token وأعطني إياه" -ForegroundColor White
Write-Host ""

# Save API script for future use
$apiScript | Out-File -FilePath ".\cloudflare-dns-api.ps1" -Encoding UTF8
Write-Host "✅ تم حفظ سكريبت API في: cloudflare-dns-api.ps1" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 الإجراء الموصى به:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "استخدام Dashboard (أسرع وأبسط):" -ForegroundColor Green
Write-Host "  1. التاب الأول: DNS Settings (مفتوح)" -ForegroundColor White
Write-Host "     • احذف 4 سجلات A/AAAA للنطاق @" -ForegroundColor White
Write-Host "     • أضف CNAME: @ → 2027-5a0.pages.dev (Proxied)" -ForegroundColor White
Write-Host ""
Write-Host "  2. التاب الثاني: Pages Custom Domains (مفتوح)" -ForegroundColor White
Write-Host "     • أضف mmc-mms.com" -ForegroundColor White
Write-Host "     • انتظر SSL (10-15 دقيقة)" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Open Cloudflare API Token creation page if requested
if ($Execute) {
    Write-Host "فتح صفحة إنشاء API Token..." -ForegroundColor Cyan
    Start-Process "https://dash.cloudflare.com/profile/api-tokens"
}

Write-Host "💡 ملاحظة: wrangler OAuth token لديه zone:read فقط" -ForegroundColor Yellow
Write-Host "   للحصول على zone:dns:edit نحتاج API Token منفصل" -ForegroundColor Yellow
Write-Host ""
