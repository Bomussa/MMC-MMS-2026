# 🚀 دليل النشر السريع - MMC-MMS.com

**التاريخ:** 15 أكتوبر 2025  
**Domain:** MMC-MMS.com  
**الحالة:** 🔄 جاري النشر

---

## ✅ الخطوة 1: نشر على Cloudflare Pages

### في Cloudflare Dashboard (المفتوح الآن):

1. **اختر Workers & Pages**
2. **اضغط Create Application**
3. **اختر Pages → Connect to Git**
4. **اختر GitHub → Authorize**
5. **ابحث عن:** `Bomussa/MMC-MMS-2026`
6. **Begin Setup**

### إعدادات Build:
```
Project name: mmc-mms
Production branch: main
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
Environment variables:
  NODE_VERSION = 18
```

7. **اضغط Save and Deploy**
8. **انتظر 2-3 دقائق**

### النتيجة:
ستحصل على رابط مؤقت: `https://mmc-mms.pages.dev`

---

## ✅ الخطوة 2: ربط Domain المخصص (MMC-MMS.com)

### بعد نجاح النشر:

1. **في Cloudflare Pages → mmc-mms**
2. **اذهب إلى Custom domains**
3. **اضغط Set up a custom domain**
4. **أدخل:** `mmc-mms.com`
5. **اضغط Continue**

### إعدادات DNS:
```
Type: CNAME
Name: @ (or www)
Target: mmc-mms.pages.dev
Proxy: Enabled (Orange Cloud)
```

6. **Save** وانتظر DNS Propagation (~5 دقائق)

### النتيجة:
التطبيق سيكون متاح على: `https://mmc-mms.com`

---

## ✅ الخطوة 3: توليد QR Code

### استخدام المولّد المحلي:

1. **افتح:** `public/qr.html` (في المتصفح)
2. **أدخل URL:** `https://mmc-mms.com`
3. **حجم:** 512x512 pixels
4. **اضغط Generate QR Code**
5. **احفظ الصورة:** Right-click → Save Image As
6. **اسم الملف:** `qr-mmc-mms-com.png`

---

## ✅ الخطوة 4: طباعة Poster

### لطباعة Poster مع QR Code:

1. **افتح:** `public/print/qr-poster.html`
2. **سيعرض QR Code كبير + معلومات التطبيق**
3. **اضغط Ctrl+P للطباعة**
4. **أو Save as PDF**

---

## 📊 ملخص الروابط

بعد إتمام الخطوات:

```
Domain الرئيسي: https://mmc-mms.com
Cloudflare Pages: https://mmc-mms.pages.dev
GitHub Repository: https://github.com/Bomussa/MMC-MMS-2026
```

---

## 🎯 الحالة الحالية

- [x] الكود جاهز في GitHub
- [x] Build ناجح محلياً
- [ ] 🔄 النشر على Cloudflare Pages (جاري الآن)
- [ ] ⏳ ربط Domain المخصص
- [ ] ⏳ توليد QR Code
- [ ] ⏳ طباعة Poster

---

## 📱 معلومات QR Code

**URL للـ QR Code:**
```
https://mmc-mms.com
```

**المواصفات:**
- Format: PNG
- Size: 512x512 pixels
- Error Correction: High (H)
- Border: 4 modules
- Color: Black on White

---

## 🔗 روابط سريعة

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **GitHub Repo:** https://github.com/Bomussa/MMC-MMS-2026
- **Local Dev:** http://localhost:5173/

---

**ملاحظة:** تابع الخطوات في Cloudflare Dashboard المفتوح الآن
