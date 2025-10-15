# 🌐 معلومات الرابط العام للتطبيق

**التاريخ:** 15 أكتوبر 2025  
**الحالة:** ⏳ في انتظار النشر على Cloudflare

---

## 📍 الروابط الحالية

### 🏠 المحلي (Local Development):
```
http://localhost:5173/
```
- **الحالة:** ✅ يعمل الآن
- **الاستخدام:** للتطوير والاختبار المحلي فقط
- **الوصول:** من نفس الجهاز فقط

### 🌐 الشبكة المحلية (Local Network):
```
http://10.48.74.53:5173/
http://172.29.32.1:5173/
```
- **الحالة:** ✅ يعمل الآن
- **الاستخدام:** يمكن الوصول من أجهزة أخرى في نفس الشبكة
- **الوصول:** داخل الشبكة المحلية فقط

---

## 🚀 الرابط العام (بعد النشر)

### لنشر التطبيق على الإنترنت، ستحصل على:

#### 1️⃣ Cloudflare Pages (Frontend):
```
https://mmc-mms-2026.pages.dev
```
أو مع domain مخصص:
```
https://your-custom-domain.com
```

#### 2️⃣ Cloudflare Worker (API):
```
https://mmc-mms-worker.your-subdomain.workers.dev
```

---

## 📝 خطوات الحصول على الرابط العام

### المرحلة 1: النشر على Cloudflare Pages (~5 دقائق)

1. **اذهب إلى Cloudflare Dashboard:**
   ```
   https://dash.cloudflare.com/
   ```

2. **أنشئ Pages Project:**
   - Workers & Pages → Create → Pages
   - Connect to Git → GitHub
   - اختر: `Bomussa/MMC-MMS-2026`

3. **إعدادات Build:**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   ```

4. **Deploy:**
   - اضغط: Save and Deploy
   - انتظر 2-3 دقائق

5. **احصل على الرابط:**
   ```
   https://mmc-mms-2026.pages.dev
   ```
   (أو الاسم الذي اخترته)

---

## 📱 استخدام QR Code

### بعد الحصول على الرابط العام:

1. **افتح مولّد QR:**
   ```
   File: public/qr.html
   ```

2. **أدخل الرابط:**
   ```
   https://mmc-mms-2026.pages.dev
   ```

3. **توليد وحفظ:**
   - اضغط: Generate QR Code
   - احفظ الصورة
   - استخدمها في الطباعة أو المشاركة

---

## 🎯 الخطوات التفصيلية

للحصول على دليل كامل خطوة بخطوة، راجع:
```
CLOUDFLARE_DEPLOYMENT_PLAN.md
```

---

## 📊 مقارنة الروابط

| النوع | الرابط | الوصول | الحالة |
|------|--------|--------|---------|
| **Local** | `http://localhost:5173/` | جهازك فقط | ✅ يعمل |
| **Network** | `http://10.48.74.53:5173/` | الشبكة المحلية | ✅ يعمل |
| **Public** | `https://mmc-mms-2026.pages.dev` | الإنترنت | ⏳ بعد النشر |

---

## ⚡ نشر سريع (Quick Deploy)

### الأمر السريع للنشر:
```bash
# في مجلد 2026:
npm run deploy:cloudflare
```

أو اتبع الخطوات اليدوية في `CLOUDFLARE_DEPLOYMENT_PLAN.md`

---

## 🔗 روابط مفيدة

- **GitHub Repository:** https://github.com/Bomussa/MMC-MMS-2026
- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Documentation:** راجع `CLOUDFLARE_DEPLOYMENT_PLAN.md`

---

**ملاحظة:** حالياً التطبيق يعمل محلياً فقط على `http://localhost:5173/`  
لجعله متاحاً على الإنترنت، اتبع خطوات النشر على Cloudflare أعلاه.
