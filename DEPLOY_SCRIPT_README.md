# 🚀 Smart Auto-Deploy System

## 📋 الوصف

سكريبت PowerShell ذكي ومتطور للنشر التلقائي إلى Cloudflare Pages مع GitHub Integration وتوليد QR Code.

---

## ✨ المزايا

### 1. ✅ فحص تلقائي شامل
- يتحقق من كل خطوة قبل تنفيذها
- يكتشف المشاكل مبكراً ويوقف التنفيذ
- يعرض معلومات تفصيلية عن كل مرحلة

### 2. 🔄 منع التكرار
- لا يعيد البناء إلا عند الحاجة
- يكتشف المشاريع الموجودة مسبقاً
- يستخدم النشرات السابقة بذكاء

### 3. 🎯 تكامل كامل
- Cloudflare Pages
- GitHub Repository
- Custom Domain
- QR Code Generation
- Build Optimization

### 4. 🛡️ آمن للإعادة
- يمكن تشغيله عدة مرات بأمان
- لا يحذف أو يخرب أي شيء
- يحافظ على البيئة الحالية

### 5. 📊 واجهة احترافية
- ألوان واضحة
- رسائل مفصلة
- تقارير شاملة
- مؤشرات التقدم

---

## 🔧 المتطلبات

### البرامج الأساسية:
- ✅ PowerShell 5.1+ أو PowerShell Core 7+
- ✅ Node.js 18+
- ✅ npm أو yarn
- ✅ Git

### الحسابات المطلوبة:
- ✅ Cloudflare Account (مجاني)
- ✅ GitHub Account (مجاني)
- ✅ النطاق مضاف في Cloudflare

---

## 📥 التثبيت

### 1. نسخ السكريبت
```powershell
# السكريبت موجود في:
deploy-cloudflare-smart.ps1
```

### 2. السماح بتنفيذ السكريبتات (مرة واحدة فقط)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🚀 الاستخدام

### التشغيل الأساسي:
```powershell
.\deploy-cloudflare-smart.ps1
```

### مع خيارات متقدمة:

#### تخطي البناء (إذا كان dist جاهز):
```powershell
.\deploy-cloudflare-smart.ps1 -SkipBuild
```

#### إعادة البناء بالقوة:
```powershell
.\deploy-cloudflare-smart.ps1 -ForceRebuild
```

#### مع معلومات تفصيلية:
```powershell
.\deploy-cloudflare-smart.ps1 -Verbose
```

#### جميع الخيارات معاً:
```powershell
.\deploy-cloudflare-smart.ps1 -ForceRebuild -Verbose
```

---

## 📊 المراحل

### المرحلة 1: فحص بيئة المشروع ✅
- التحقق من وجود package.json
- فحص مسار المشروع
- التحقق من node_modules

### المرحلة 2: بناء المشروع 🏗️
- تثبيت الحزم (إن لزم)
- تشغيل `npm run build`
- التحقق من dist/index.html
- حساب حجم dist

### المرحلة 3: Cloudflare CLI ⚙️
- فحص وتثبيت wrangler
- التحقق من تسجيل الدخول
- فتح المتصفح للمصادقة (إن لزم)

### المرحلة 4: إعداد Pages 🌐
- البحث عن مشروع موجود
- عرض تعليمات الإنشاء (إن لزم)
- التحقق من الإعدادات

### المرحلة 5: النشر الذكي 📤
- فحص النشرات السابقة
- نشر التغييرات الجديدة فقط
- عرض تفاصيل النشر

### المرحلة 6: Custom Domain 🔗
- التحقق من النطاق المخصص
- عرض تعليمات الربط (إن لزم)

### المرحلة 7: QR Code 📱
- توليد QR Code تلقائياً
- حفظ في public/qr-mmc-mms-com.png
- فتح الصورة للمعاينة

### المرحلة 8: النتائج 🎉
- عرض ملخص شامل
- روابط الموقع
- معلومات QR Code
- خيار فتح الموقع

---

## 🎯 الثوابت المعدة

يمكنك تعديل هذه القيم في السكريبت حسب الحاجة:

```powershell
$PROJECT_NAME = "mmc-mms"           # اسم المشروع في Cloudflare
$DOMAIN = "mmc-mms.com"             # النطاق المخصص
$REPO = "Bomussa/MMC-MMS-2026"      # مستودع GitHub
$QR_PATH = "public/qr-mmc-mms-com.png"  # مسار QR Code
```

---

## 🔍 استكشاف الأخطاء

### مشكلة: "package.json not found"
**الحل:** تأكد من تشغيل السكريبت من مجلد المشروع الصحيح

### مشكلة: "فشل البناء"
**الحل:**
```powershell
npm install
npm run build
```

### مشكلة: "not authenticated"
**الحل:** سيفتح المتصفح تلقائياً للمصادقة

### مشكلة: "Project not found"
**الحل:** اتبع التعليمات لإنشاء المشروع عبر Dashboard

### مشكلة: "DNS Error"
**الحل:** انتظر 5-10 دقائق لـ DNS propagation

---

## 📚 الأوامر المفيدة

### عرض معلومات الحساب:
```powershell
wrangler whoami
```

### عرض المشاريع:
```powershell
wrangler pages project list
```

### عرض النشرات:
```powershell
wrangler pages deployment list mmc-mms
```

### تسجيل الخروج:
```powershell
wrangler logout
```

---

## 🔄 سير العمل الموصى به

### النشر الأول:
1. تأكد من إنشاء المشروع في Cloudflare Dashboard
2. شغّل: `.\deploy-cloudflare-smart.ps1`
3. اتبع التعليمات المعروضة
4. انتظر اكتمال النشر
5. تحقق من الموقع

### النشرات التالية:
1. قم بالتعديلات في الكود
2. Commit & Push إلى GitHub
3. النشر سيحدث تلقائياً!

**أو** شغّل السكريبت يدوياً:
```powershell
.\deploy-cloudflare-smart.ps1 -ForceRebuild
```

---

## 🎨 الألوان المستخدمة

- 🔵 **Cyan**: العناوين الرئيسية
- 🟢 **Green**: النجاح
- 🔴 **Red**: الأخطاء
- 🟡 **Yellow**: التحذيرات والمعلومات
- ⚪ **White**: البيانات العامة
- ⚫ **Gray**: التفاصيل الإضافية

---

## 📝 الملفات المنتجة

بعد التشغيل الناجح:
```
dist/                           # البناء النهائي
public/qr-mmc-mms-com.png      # QR Code عادي
public/qr-mmc-mms-com-print.png # QR Code للطباعة
```

---

## 🌟 المميزات الإضافية

### 1. معلومات تفصيلية:
```powershell
.\deploy-cloudflare-smart.ps1 -Verbose
```
- عرض قائمة النشرات السابقة
- معلومات تسجيل الدخول
- تفاصيل المشاريع

### 2. تحكم في البناء:
```powershell
# تخطي البناء
.\deploy-cloudflare-smart.ps1 -SkipBuild

# إعادة البناء
.\deploy-cloudflare-smart.ps1 -ForceRebuild
```

### 3. فتح تلقائي:
- يسأل إذا كنت تريد فتح الموقع
- يفتح كل من الرابط المخصص ورابط Pages

---

## 🚦 رموز الخروج

- `0`: نجاح
- `1`: خطأ في البناء أو النشر

---

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من الأخطاء المعروضة
2. راجع قسم استكشاف الأخطاء
3. شغّل مع `-Verbose` لمزيد من المعلومات
4. تحقق من Cloudflare Dashboard

---

## 🎉 النتيجة المتوقعة

بعد التشغيل الناجح:

```
✅ https://mmc-mms.com - يعمل
✅ https://mmc-mms.pages.dev - يعمل
✅ QR Code جاهز للاستخدام
✅ Auto-deploy مفعّل من GitHub
✅ SSL تلقائي
✅ CDN عالمي
```

---

## 📄 الترخيص

هذا السكريبت مجاني للاستخدام الشخصي والتجاري.

---

## 👨‍💻 المطور

تم التطوير بواسطة GitHub Copilot AI

---

**🚀 استمتع بالنشر التلقائي الذكي!**
