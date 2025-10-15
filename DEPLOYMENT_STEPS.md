# 🚀 الخطوات التالية لنشر التحديثات على Cloudflare

## ✅ ما تم إنجازه

- ✅ نسخ Cloudflare Worker المحدّث إلى مجلد `2026/infra/`
- ✅ نسخ نظام Recovery للـ auto-healing
- ✅ إنشاء توثيق شامل للتحديثات
- ✅ عمل commit ورفع إلى GitHub

**رابط المستودع:** https://github.com/Bomussa/MMC-MMS-2026

---

## 📋 الخطوات المتبقية (يدوياً)

### 1️⃣ تثبيت Dependencies للـ Worker

```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"
npm install
```

**المتوقع:** تثبيت wrangler و@cloudflare/workers-types

---

### 2️⃣ تحديث wrangler.toml بنطاقك

افتح ملف: `2026/infra/wrangler.toml`

**عدّل هذه الأسطر:**

```toml
# قبل:
routes = [
  { pattern = "api.mmc-mms.com/*", zone_name = "mmc-mms.com" },
  { pattern = "mmc-mms.com/api/*", zone_name = "mmc-mms.com" }
]

# بعد (غيّر mmc-mms.com إلى نطاقك):
routes = [
  { pattern = "api.YOUR-DOMAIN.com/*", zone_name = "YOUR-DOMAIN.com" },
  { pattern = "YOUR-DOMAIN.com/api/*", zone_name = "YOUR-DOMAIN.com" }
]
```

**أيضاً عدّل:**

```toml
SITE_ORIGIN = "https://YOUR-PAGES.pages.dev"
PRIMARY_ORIGIN = "https://api.YOUR-DOMAIN.com"
SECONDARY_ORIGIN = "https://app.YOUR-DOMAIN.com"
FALLBACK_ORIGIN = "https://YOUR-WORKER.workers.dev"
```

---

### 3️⃣ تسجيل الدخول إلى Cloudflare

```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"
npx wrangler login
```

**سيفتح متصفح للمصادقة** → وافق على الأذونات

---

### 4️⃣ إنشاء D1 Database (إذا لم يكن موجوداً)

```powershell
npx wrangler d1 create mms_database
```

**انسخ database_id من الناتج وضعه في wrangler.toml:**

```toml
[[d1_databases]]
binding = "DB"
database_name = "mms_database"
database_id = "paste-id-here"
```

---

### 5️⃣ إنشاء KV Namespace (إذا لم يكن موجوداً)

```powershell
npx wrangler kv:namespace create MMS_CACHE
```

**انسخ id من الناتج وضعه في wrangler.toml:**

```toml
[[kv_namespaces]]
binding = "MMS_CACHE"
id = "paste-id-here"
```

---

### 6️⃣ إعداد Secrets

```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"

# Backend Origin (عنوان السيرفر الخلفي)
npx wrangler secret put BACKEND_ORIGIN
# أدخل: https://your-backend-server.com

# Admin Username
npx wrangler secret put ADMIN_BASIC_USER
# أدخل: admin

# Admin Password
npx wrangler secret put ADMIN_BASIC_PASS
# أدخل: كلمة-مرور-قوية-جداً

# JWT Secret
npx wrangler secret put JWT_SECRET
# أدخل: secret-key-طويل-ومعقد
```

---

### 7️⃣ اختبار Worker محلياً

```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"
npm run dev
```

**افتح في المتصفح:**
- http://localhost:8787/health

**يجب أن ترى:**
```json
{
  "ok": true,
  "worker": "up",
  "backend": "down",
  "probes": [...]
}
```

**اضغط Ctrl+C للإيقاف**

---

### 8️⃣ نشر Worker إلى Cloudflare

```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"
npm run deploy
```

**الناتج المتوقع:**
```
Published mms-api-proxy
  https://mms-api-proxy.workers.dev
  api.YOUR-DOMAIN.com/*
  YOUR-DOMAIN.com/api/*
```

---

### 9️⃣ اختبار Worker على Cloudflare

```powershell
# اختبر Health Endpoint
curl https://YOUR-WORKER.workers.dev/health

# اختبر Proxy للـ Backend
curl https://YOUR-WORKER.workers.dev/api/health
```

**يجب أن ترى:**
```json
{
  "ok": true,
  "worker": "up",
  "backend": "up",
  "probes": [...]
}
```

---

### 🔟 ربط Worker مع النطاق

في **Cloudflare Dashboard:**

1. اذهب إلى **Workers & Pages**
2. اختر `mms-api-proxy`
3. اذهب إلى **Triggers** → **Routes**
4. تأكد من وجود:
   - `api.YOUR-DOMAIN.com/*`
   - `YOUR-DOMAIN.com/api/*`

---

## 🧪 اختبار شامل

### Test 1: Worker Health
```bash
curl https://YOUR-WORKER.workers.dev/health
```
✅ المتوقع: `{"ok": true, "worker": "up"}`

---

### Test 2: Backend Proxy
```bash
curl https://YOUR-WORKER.workers.dev/api/health
```
✅ المتوقع: `{"ok": true, "backend": "up"}`

---

### Test 3: Rate Limiting
```bash
# أرسل أكثر من 60 طلب في دقيقة
for i in {1..65}; do curl https://YOUR-WORKER.workers.dev/health; done
```
✅ المتوقع: بعد 60 طلب، ستحصل على `429 Too Many Requests`

---

### Test 4: Admin Protection
```bash
# بدون authorization
curl https://YOUR-WORKER.workers.dev/api/admin/settings
```
❌ المتوقع: `401 Unauthorized`

```bash
# مع Basic Auth
curl -u admin:password https://YOUR-WORKER.workers.dev/api/admin/settings
```
✅ المتوقع: response من backend

---

### Test 5: CORS
```bash
curl -H "Origin: https://other-domain.com" \
     https://YOUR-WORKER.workers.dev/api/health
```
✅ المتوقع: Headers تحتوي على `Access-Control-Allow-Origin`

---

## 📊 مراقبة Worker

### عرض Logs الحية:
```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"
npx wrangler tail
```

### في Cloudflare Dashboard:
1. **Workers & Pages** → `mms-api-proxy`
2. **Logs** → عرض real-time logs
3. **Metrics** → عرض performance metrics

---

## 🔄 Rollback (إذا حدثت مشكلة)

```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026\infra"
npx wrangler rollback
```

أو العودة لـ commit سابق:
```powershell
cd "c:\Users\USER\OneDrive\Desktop\تجميع من 3\2026"
git checkout 4c25028  # الـ commit قبل التحديثات
cd infra
npm run deploy
```

---

## ⚠️ ملاحظات مهمة

### 🔒 الأمان:
- ✅ لا تضع secrets في `wrangler.toml`
- ✅ استخدم `wrangler secret put` دائماً
- ✅ غيّر `ADMIN_BASIC_PASS` لشيء قوي
- ✅ JWT_SECRET يجب أن يكون طويل ومعقد (32+ حرف)

### 🎨 الواجهة الأمامية:
- ✅ **لم تتغير أي ملفات frontend**
- ✅ **نفس الواجهة والألوان**
- ✅ **نفس تجربة المستخدم**
- ✅ التحديثات **backend فقط**

### 🔗 API Compatibility:
- ✅ جميع endpoints القديمة تعمل
- ✅ نفس request/response format
- ✅ backward compatible

---

## 📞 الدعم

إذا واجهت مشاكل:

1. **راجع Logs:**
   ```powershell
   npx wrangler tail
   ```

2. **تحقق من Secrets:**
   ```powershell
   npx wrangler secret list
   ```

3. **اختبر Health:**
   ```bash
   curl https://YOUR-WORKER.workers.dev/health -v
   ```

4. **راجع Documentation:**
   - `CLOUDFLARE_UPDATE_PLAN.md`
   - `BACKEND_UPDATES.md`

---

## ✅ Checklist النهائي

- [ ] تثبيت `npm install` في مجلد infra
- [ ] تحديث wrangler.toml بنطاقك
- [ ] تسجيل دخول wrangler
- [ ] إنشاء D1 database
- [ ] إنشاء KV namespace
- [ ] إعداد جميع Secrets (4 secrets)
- [ ] اختبار محلياً (`npm run dev`)
- [ ] نشر على Cloudflare (`npm run deploy`)
- [ ] اختبار health endpoint
- [ ] اختبار proxy للـ backend
- [ ] اختبار rate limiting
- [ ] اختبار admin protection
- [ ] مراقبة logs للتأكد من عدم وجود أخطاء

---

**تاريخ:** 15 أكتوبر 2025
**الحالة:** ✅ جاهز للنشر
**المستوى:** 🟢 آمن (Backend فقط)
**التأثير:** 🎨 صفر تأثير على الواجهة الأمامية
