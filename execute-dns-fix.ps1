# 🚀 تنفيذ سريع: تعديل DNS لـ mmc-mms.com
# Quick Execute: DNS Fix for mmc-mms.com

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🚀 تنفيذ تلقائي: إصلاح DNS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  التوكن الحالي لديه صلاحية قراءة فقط (zone:read)" -ForegroundColor Red
Write-Host "    ولا يملك صلاحية تعديل DNS (zone:dns:edit)" -ForegroundColor Red
Write-Host ""

Write-Host "✅ الحل: استخدام Cloudflare Dashboard" -ForegroundColor Green
Write-Host ""

# فتح DNS Settings
Write-Host "🌐 فتح DNS Settings..." -ForegroundColor Cyan
Start-Process "https://dash.cloudflare.com/f8c5e563eb7dc2635afc2f6b73fa4eb9/mmc-mms.com/dns"
Start-Sleep -Seconds 2

# فتح Pages Custom Domains في تاب جديد
Write-Host "🌐 فتح Pages Custom Domains..." -ForegroundColor Cyan
Start-Process "https://dash.cloudflare.com/f8c5e563eb7dc2635afc2f6b73fa4eb9/pages/view/2027/domains"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 الخطوات (في DNS Settings):" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "التاب الأول: DNS Settings" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "1️⃣  ابحث عن سجلات النطاق الجذر '@' أو 'mmc-mms.com':" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ❌ احذف هذه السجلات (اضغط Edit → Delete):" -ForegroundColor Red
Write-Host "      ┌─────────────────────────────────────┐" -ForegroundColor Gray
Write-Host "      │ Type: A                            │" -ForegroundColor White
Write-Host "      │ Name: @                            │" -ForegroundColor White
Write-Host "      │ IPv4: 188.114.96.7                 │" -ForegroundColor White
Write-Host "      └─────────────────────────────────────┘" -ForegroundColor Gray
Write-Host ""
Write-Host "      ┌─────────────────────────────────────┐" -ForegroundColor Gray
Write-Host "      │ Type: A                            │" -ForegroundColor White
Write-Host "      │ Name: @                            │" -ForegroundColor White
Write-Host "      │ IPv4: 188.114.97.7                 │" -ForegroundColor White
Write-Host "      └─────────────────────────────────────┘" -ForegroundColor Gray
Write-Host ""
Write-Host "      ┌─────────────────────────────────────┐" -ForegroundColor Gray
Write-Host "      │ Type: AAAA                         │" -ForegroundColor White
Write-Host "      │ Name: @                            │" -ForegroundColor White
Write-Host "      │ IPv6: 2a06:98c1:3121::7            │" -ForegroundColor White
Write-Host "      └─────────────────────────────────────┘" -ForegroundColor Gray
Write-Host ""
Write-Host "      ┌─────────────────────────────────────┐" -ForegroundColor Gray
Write-Host "      │ Type: AAAA                         │" -ForegroundColor White
Write-Host "      │ Name: @                            │" -ForegroundColor White
Write-Host "      │ IPv6: 2a06:98c1:3120::7            │" -ForegroundColor White
Write-Host "      └─────────────────────────────────────┘" -ForegroundColor Gray
Write-Host ""
Write-Host "   ⚠️  احذف فقط السجلات للنطاق الجذر '@'" -ForegroundColor Yellow
Write-Host "   ⚠️  لا تحذف سجلات 'www' - اتركها كما هي!" -ForegroundColor Yellow
Write-Host ""

Write-Host "2️⃣  أضف CNAME جديد (اضغط 'Add record'):" -ForegroundColor Cyan
Write-Host ""
Write-Host "      ┌─────────────────────────────────────┐" -ForegroundColor Green
Write-Host "      │ Type:   CNAME                      │" -ForegroundColor White
Write-Host "      │ Name:   @                          │" -ForegroundColor White
Write-Host "      │ Target: 2027-5a0.pages.dev         │" -ForegroundColor White
Write-Host "      │ Proxy:  🟠 Proxied (ON)            │" -ForegroundColor White
Write-Host "      │ TTL:    Auto                       │" -ForegroundColor White
Write-Host "      └─────────────────────────────────────┘" -ForegroundColor Green
Write-Host ""
Write-Host "   ✅ اضغط 'Save'" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "التاب الثاني: Pages Custom Domains" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  أضف النطاق الجذر:" -ForegroundColor Cyan
Write-Host "   • اضغط 'Set up a custom domain'" -ForegroundColor White
Write-Host "   • أدخل: mmc-mms.com" -ForegroundColor White
Write-Host "   • اضغط: Continue → Activate domain" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  انتظر SSL Certificate:" -ForegroundColor Cyan
Write-Host "   • الحالة ستتغير من: Initializing → Active" -ForegroundColor White
Write-Host "   • الوقت: 10-15 دقيقة" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ النتيجة المتوقعة:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "DNS Records:" -ForegroundColor Yellow
Write-Host "  • CNAME @ → 2027-5a0.pages.dev (Proxied) ✅" -ForegroundColor White
Write-Host "  • CNAME www → 2027-5a0.pages.dev (Proxied) ✅" -ForegroundColor White
Write-Host ""
Write-Host "Pages Domains:" -ForegroundColor Yellow
Write-Host "  • 2027-5a0.pages.dev ✅" -ForegroundColor White
Write-Host "  • mmc-mms.com (SSL Active) ✅" -ForegroundColor White
Write-Host "  • www.mmc-mms.com (SSL Active) ✅" -ForegroundColor White
Write-Host ""
Write-Host "Working URLs:" -ForegroundColor Yellow
Write-Host "  • https://mmc-mms.com ✅" -ForegroundColor White
Write-Host "  • https://www.mmc-mms.com ✅" -ForegroundColor White
Write-Host "  • https://2027-5a0.pages.dev ✅" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏰ الوقت المتوقع: 5 دقائق (+ 10-15 دقيقة للـ SSL)" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ الصفحتان مفتوحتان في المتصفح - نفذ الخطوات!" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
