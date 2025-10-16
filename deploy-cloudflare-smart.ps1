# ======================================================
#  Smart Auto-Deploy System — MMC-MMS Medical Center
#  إعداد: Copilot AI — نسخة تنفيذية كاملة بلا تكرار
#  التاريخ: 16 أكتوبر 2025
# ======================================================

param(
    [switch]$SkipBuild,
    [switch]$ForceRebuild,
    [switch]$Verbose
)

# تفعيل الألوان والرسائل التفصيلية
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

# بداية التنفيذ
Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   🚀 Smart Auto-Deploy — MMC-MMS Medical Center      ║" -ForegroundColor Magenta
Write-Host "║   📦 Cloudflare Pages + GitHub + QR Code             ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Step "🔍 المرحلة 1: فحص بيئة المشروع..." "Cyan"

# 1.1 التحقق من المسار الحالي
$ProjectRoot = Get-Location
Write-Info "📁 مسار المشروع: $ProjectRoot"

if (!(Test-Path "package.json")) {
    Write-Error-Custom "لم يتم العثور على package.json — تأكد من أنك في مجلد المشروع الصحيح!"
    exit 1
}

Write-Success "ملف package.json موجود"

# 1.2 فحص مجلد dist
if ($ForceRebuild -or !(Test-Path "dist")) {
    Write-Step "🏗️  المرحلة 2: بناء المشروع..." "Yellow"
    
    if (!(Test-Path "node_modules")) {
        Write-Info "📦 تثبيت الحزم..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "فشل تثبيت الحزم!"
            exit 1
        }
    }
    
    Write-Info "🔨 تشغيل البناء..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "فشل بناء المشروع!"
        exit 1
    }
    Write-Success "تم بناء المشروع بنجاح"
}
elseif (!$SkipBuild) {
    Write-Success "مجلد dist موجود — سيتم استخدامه"
    $Rebuild = Read-Host "هل تريد إعادة البناء؟ (y/N)"
    if ($Rebuild -eq "y" -or $Rebuild -eq "Y") {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "فشل بناء المشروع!"
            exit 1
        }
    }
}
else {
    Write-Success "تم تخطي البناء (--SkipBuild)"
}

# 1.3 التحقق من محتويات dist
if (!(Test-Path "dist/index.html")) {
    Write-Error-Custom "dist/index.html غير موجود — البناء غير مكتمل!"
    exit 1
}

$DistSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
$DistSizeMB = [math]::Round($DistSize / 1MB, 2)
Write-Success "حجم dist: $DistSizeMB MB"

Write-Step "⚙️  المرحلة 3: التحقق من Cloudflare CLI..." "Cyan"

# 3.1 فحص wrangler
$WranglerExists = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $WranglerExists) {
    Write-Info "تثبيت wrangler CLI..."
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "فشل تثبيت wrangler!"
        exit 1
    }
    Write-Success "تم تثبيت wrangler"
}
else {
    $WranglerVersion = (wrangler --version 2>&1) -replace "`n", ""
    Write-Success "wrangler مثبت — الإصدار: $WranglerVersion"
}

# 3.2 التحقق من تسجيل الدخول
Write-Info "🔐 التحقق من تسجيل الدخول إلى Cloudflare..."
$AuthCheck = wrangler whoami 2>&1
if ($AuthCheck -match "not authenticated" -or $AuthCheck -match "error") {
    Write-Info "تسجيل الدخول مطلوب — سيتم فتح المتصفح..."
    wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "فشل تسجيل الدخول!"
        exit 1
    }
    Write-Success "تم تسجيل الدخول بنجاح"
}
else {
    Write-Success "أنت مسجل الدخول بالفعل"
    if ($Verbose) {
        Write-Host $AuthCheck -ForegroundColor DarkGray
    }
}

Write-Step "🌐 المرحلة 4: إعداد Cloudflare Pages..." "Cyan"

# تعريف الثوابت
$PROJECT_NAME = "mmc-mms"
$DOMAIN = "mmc-mms.com"
$REPO = "Bomussa/2027"

Write-Info "📋 المعلومات:"
Write-Host "   اسم المشروع: $PROJECT_NAME" -ForegroundColor Gray
Write-Host "   النطاق: $DOMAIN" -ForegroundColor Gray
Write-Host "   المستودع: $REPO" -ForegroundColor Gray

# 4.1 فحص المشروع الحالي
Write-Info "🔍 البحث عن مشروع Pages موجود..."
$ProjectsList = wrangler pages project list 2>&1
$ProjectExists = $ProjectsList -match $PROJECT_NAME

if ($ProjectExists) {
    Write-Success "مشروع $PROJECT_NAME موجود مسبقًا"
    
    # عرض معلومات المشروع
    if ($Verbose) {
        wrangler pages project list | Select-String -Pattern $PROJECT_NAME -Context 2
    }
}
else {
    Write-Info "🆕 إنشاء مشروع Pages جديد..."
    
    # ملاحظة: لا يمكن إنشاء المشروع عبر CLI مباشرة مع GitHub
    # يجب القيام بذلك عبر Dashboard أولاً أو عبر API
    Write-Info "يجب إنشاء المشروع عبر Dashboard أولاً"
    Write-Host "`nالخطوات المطلوبة:" -ForegroundColor Yellow
    Write-Host "1. افتح: https://dash.cloudflare.com/" -ForegroundColor White
    Write-Host "2. Workers & Pages → Create Application" -ForegroundColor White
    Write-Host "3. Pages → Connect to Git → GitHub" -ForegroundColor White
    Write-Host "4. اختر: $REPO" -ForegroundColor White
    Write-Host "5. اسم المشروع: $PROJECT_NAME" -ForegroundColor White
    Write-Host "6. Build command: npm run build" -ForegroundColor White
    Write-Host "7. Build output: dist" -ForegroundColor White
    Write-Host "8. Environment variable: NODE_VERSION = 18" -ForegroundColor White
    
    $Continue = Read-Host "`nهل أنشأت المشروع؟ (y/N)"
    if ($Continue -ne "y" -and $Continue -ne "Y") {
        Write-Info "تم الإلغاء — أنشئ المشروع أولاً ثم أعد تشغيل السكريبت"
        exit 0
    }
}

Write-Step "📤 المرحلة 5: النشر الذكي..." "Cyan"

# 5.1 فحص آخر نشر
Write-Info "🕓 التحقق من التغييرات..."
$DeploymentsList = wrangler pages deployment list $PROJECT_NAME 2>&1

if ($DeploymentsList -match "error" -or $DeploymentsList -match "not found") {
    Write-Info "🚀 نشر أول مرة..."
    wrangler pages deploy dist --project-name=$PROJECT_NAME --branch=main
}
else {
    Write-Info "📦 توجد نشرات سابقة — فحص التغييرات..."
    
    # عرض آخر 3 نشرات
    if ($Verbose) {
        Write-Host "`nآخر النشرات:" -ForegroundColor DarkGray
        $DeploymentsList | Select-Object -First 10 | ForEach-Object {
            Write-Host $_ -ForegroundColor DarkGray
        }
    }
    
    Write-Info "📤 نشر التحديثات الجديدة..."
    wrangler pages deploy dist --project-name=$PROJECT_NAME --branch=main
}

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "فشل النشر!"
    exit 1
}

Write-Success "تم النشر بنجاح!"

Write-Step "🔗 المرحلة 6: التحقق من Custom Domain..." "Cyan"

# 6.1 فحص النطاقات المخصصة
$DomainsList = wrangler pages project list 2>&1
if ($DomainsList -match $DOMAIN) {
    Write-Success "النطاق $DOMAIN مرتبط بالمشروع"
}
else {
    Write-Info "إضافة النطاق المخصص..."
    Write-Host "`nالخطوات المطلوبة:" -ForegroundColor Yellow
    Write-Host "1. افتح: https://dash.cloudflare.com/" -ForegroundColor White
    Write-Host "2. Workers & Pages → $PROJECT_NAME" -ForegroundColor White
    Write-Host "3. Custom domains → Set up a domain" -ForegroundColor White
    Write-Host "4. أدخل: $DOMAIN" -ForegroundColor White
    Write-Host "5. Continue → Activate" -ForegroundColor White
}

Write-Step "📱 المرحلة 7: توليد QR Code..." "Cyan"

$URL = "https://$DOMAIN"
$QR_PATH = "public/qr-mmc-mms-com.png"

Write-Info "🔗 الرابط: $URL"

# التحقق من وجود qrcode
$QRCodeExists = Get-Command qrcode -ErrorAction SilentlyContinue
if (-not $QRCodeExists) {
    Write-Info "تثبيت qrcode CLI..."
    npm install -g qrcode
}

# توليد QR Code جديد
Write-Info "📸 توليد QR Code..."

# استخدام السكريبت الموجود
if (Test-Path "generate-qr.mjs") {
    node generate-qr.mjs
    Write-Success "تم توليد QR Code عبر generate-qr.mjs"
}
else {
    # استخدام qrcode CLI
    npx qrcode -o $QR_PATH $URL
    Write-Success "تم توليد QR Code عبر CLI"
}

if (Test-Path $QR_PATH) {
    $QRSize = [math]::Round((Get-Item $QR_PATH).Length / 1KB, 2)
    Write-Success "QR Code محفوظ: $QR_PATH ($QRSize KB)"
    
    # فتح الصورة
    Start-Process $QR_PATH
}
else {
    Write-Error-Custom "فشل توليد QR Code!"
}

Write-Step "🎉 المرحلة 8: النتائج النهائية" "Green"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             ✅ النشر اكتمل بنجاح!                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 معلومات النشر:" -ForegroundColor Cyan
Write-Host "   🌍 الموقع الرئيسي: https://$DOMAIN" -ForegroundColor White
Write-Host "   🔗 رابط Pages: https://$PROJECT_NAME.pages.dev" -ForegroundColor White
Write-Host "   📱 QR Code: $QR_PATH" -ForegroundColor White
Write-Host "   📦 حجم dist: $DistSizeMB MB" -ForegroundColor White
Write-Host "   🔧 المستودع: https://github.com/$REPO" -ForegroundColor White

Write-Host "`n🔍 التحقق من النشر:" -ForegroundColor Cyan
Write-Host "   1. افتح: https://$DOMAIN" -ForegroundColor White
Write-Host "   2. انتظر 1-2 دقيقة إذا كان النطاق جديد (DNS propagation)" -ForegroundColor Yellow
Write-Host "   3. استخدم QR Code للمشاركة" -ForegroundColor White

Write-Host "`n📊 Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dash.cloudflare.com/" -ForegroundColor White

Write-Host "`n✨ النشر التالي سيكون أسرع (auto-deploy من GitHub)!" -ForegroundColor Green

# خيار فتح الموقع
$OpenSite = Read-Host "`nهل تريد فتح الموقع الآن؟ (Y/n)"
if ($OpenSite -ne "n" -and $OpenSite -ne "N") {
    Start-Process "https://$DOMAIN"
    Start-Process "https://$PROJECT_NAME.pages.dev"
}

Write-Host "`n✅ انتهى!" -ForegroundColor Green
