# 🚀 خطة النشر إلى Cloudflare - خطوة بخطوة

**التاريخ:** 15 أكتوبر 2025  
**المشروع:** MMC-MMS-2026  
**الحالة:** ✅ جاهز للنشر

---

## 📋 المتطلبات الأساسية

### ✅ مكتمل:
- [x] الكود مدموج بالكامل
- [x] Build ناجح (Frontend + Backend)
- [x] الاختبارات النظرية والعملية نجحت
- [x] Push إلى GitHub (commit: c6c439c)

### 📝 المطلوب:
- [ ] حساب Cloudflare نشط
- [ ] Cloudflare Pages متصل بـ GitHub
- [ ] Cloudflare Workers مفعّل
- [ ] Domain name (اختياري)

---

## 🎯 مكونات النشر

### 1️⃣ Cloudflare Pages (Frontend)
**الوظيفة:** استضافة تطبيق React

**المواصفات:**
- Framework: React + Vite
- Build Command: `npm run build`
- Build Output: `dist`
- Node Version: 18.x

### 2️⃣ Cloudflare Worker (Backend API)
**الوظيفة:** API Gateway مع Auto-failover

**المواصفات:**
- Runtime: Cloudflare Workers
- Code Location: `infra/worker-api/`
- Features:
  - Auto-failover إلى 3 origins
  - Health checks
  - Rate limiting
  - CORS handling
  - Authentication

### 3️⃣ Backend Server (Origin)
**الوظيفة:** Node.js API Server

**المواصفات:**
- Runtime: Node.js 18+
- Framework: Express + TypeScript
- Port: 3001
- Health: `/health`

---

## 📝 خطوات النشر التفصيلية

### المرحلة 1: نشر Frontend إلى Cloudflare Pages

#### الخطوة 1.1: الدخول إلى Cloudflare Dashboard
```
1. اذهب إلى: https://dash.cloudflare.com/
2. سجّل الدخول بحسابك
3. اختر: Workers & Pages
4. اضغط: Create application
5. اختر: Pages
6. اختر: Connect to Git
```

#### الخطوة 1.2: ربط GitHub Repository
```
1. اختر: GitHub
2. سيطلب منك authorization - وافق
3. ابحث عن: Bomussa/MMC-MMS-2026
4. اضغط: Begin setup
```

#### الخطوة 1.3: إعدادات Build
```
Project name: mmc-mms-2026 (أو اسم آخر)
Production branch: main
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (leave empty)
```

#### الخطوة 1.4: Environment Variables (إذا لزم)
```
NODE_VERSION = 18
```

#### الخطوة 1.5: النشر
```
1. اضغط: Save and Deploy
2. انتظر Build & Deploy (حوالي 2-3 دقائق)
3. احصل على URL: مثل https://mmc-mms-2026.pages.dev
```

#### الخطوة 1.6: التحقق
```
1. افتح الرابط في المتصفح
2. تحقق من تحميل الصفحة الرئيسية
3. تحقق من تحميل الأنماط (Tailwind)
4. تحقق من Theme Selector
```

**URL المتوقع:** `https://mmc-mms-2026.pages.dev` (أو اسمك المختار)

---

### المرحلة 2: نشر Cloudflare Worker

#### الخطوة 2.1: تثبيت Wrangler CLI
```bash
npm install -g wrangler
```

#### الخطوة 2.2: تسجيل الدخول
```bash
wrangler login
```
سيفتح المتصفح للتأكيد - وافق

#### الخطوة 2.3: إعداد wrangler.toml
افتح الملف: `infra/worker-api/wrangler.toml`

```toml
name = "mmc-mms-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
DOMAIN = "mmc-mms-2026.pages.dev"  # ضع URL Pages هنا

# سيتم إضافة Secrets لاحقاً عبر CLI
```

#### الخطوة 2.4: إضافة Secrets
```bash
cd infra/worker-api

# Backend Origin URL (سيرفرك الأساسي)
wrangler secret put BACKEND_ORIGIN
# أدخل: https://your-backend-server.com:3001

# Admin Basic Auth
wrangler secret put ADMIN_BASIC_USER
# أدخل: admin (أو username آخر)

wrangler secret put ADMIN_BASIC_PASS
# أدخل: كلمة مرور قوية

# JWT Secret
wrangler secret put JWT_SECRET
# أدخل: مفتاح عشوائي طويل (استخدم: openssl rand -base64 32)
```

#### الخطوة 2.5: النشر
```bash
cd infra/worker-api
npm run deploy
```

**URL المتوقع:** `https://mmc-mms-worker.your-subdomain.workers.dev`

#### الخطوة 2.6: التحقق
```bash
# Test health endpoint
curl https://mmc-mms-worker.your-subdomain.workers.dev/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-15T12:00:00.000Z",
  "service": "cloudflare-worker",
  "mode": "production"
}
```

---

### المرحلة 3: ربط Frontend بـ Worker

#### الخطوة 3.1: تحديث API Base URL
افتح: `src/lib/api.js`

ابحث عن:
```javascript
const API_BASE_URL = ...
```

استبدل بـ:
```javascript
const API_BASE_URL = 'https://mmc-mms-worker.your-subdomain.workers.dev';
```

#### الخطوة 3.2: إعادة Build & Deploy
```bash
# Commit التغيير
git add src/lib/api.js
git commit -m "Update API URL to Cloudflare Worker"
git push origin main
```

Cloudflare Pages ستعمل auto-deploy تلقائياً

---

### المرحلة 4: نشر Backend Server (Origin)

#### الخيار A: استخدام Cloudflare Workers (موصى به)
Backend موجود في Worker بالفعل - لا حاجة لـ server منفصل في البداية

#### الخيار B: استخدام VPS/Cloud Server
```bash
# على السيرفر
git clone https://github.com/Bomussa/MMC-MMS-2026.git
cd MMC-MMS-2026
npm install
npm run build:backend

# تشغيل
export PORT=3001
export NODE_ENV=production
npm start

# أو استخدام PM2
pm2 start dist_server/index.js --name mmc-backend
```

#### الخطوة 4.1: تحديث Worker Secrets
```bash
# تحديث BACKEND_ORIGIN إلى server الحقيقي
wrangler secret put BACKEND_ORIGIN
# أدخل: https://your-actual-server.com:3001
```

---

## 🔧 إعدادات إضافية

### 1. Custom Domain (اختياري)
```
1. في Cloudflare Pages:
   - اذهب إلى: Custom domains
   - أضف: your-domain.com
   - انتظر DNS propagation

2. في Cloudflare Worker:
   - أضف route في wrangler.toml:
     routes = [
       { pattern = "your-domain.com/api/*", zone_name = "your-domain.com" }
     ]
```

### 2. Environment Variables لـ Pages
```
في Cloudflare Pages Settings → Environment variables:

VITE_API_URL = https://mmc-mms-worker.your-subdomain.workers.dev
NODE_VERSION = 18
```

### 3. CORS Configuration
تأكد من Worker يسمح بـ:
```javascript
// في infra/worker-api/src/index.js
const ALLOWED_ORIGINS = [
  'https://mmc-mms-2026.pages.dev',
  'https://your-custom-domain.com'
];
```

---

## ✅ اختبارات ما بعد النشر

### 1. Frontend Tests
```
✓ زيارة الصفحة الرئيسية
✓ تسجيل الدخول (Admin)
✓ إصدار PIN
✓ عرض الإشعارات
✓ تغيير Theme
✓ PWA (offline mode)
✓ Responsive design
```

### 2. Backend Tests
```bash
# Health Check
curl https://worker-url/health

# PIN Issuance
curl -X POST https://worker-url/api/pin \
  -H "Content-Type: application/json" \
  -d '{"routeId": "1", "patientName": "Test"}'

# Queue Status
curl https://worker-url/api/queue/status
```

### 3. Integration Tests
```
✓ Frontend يتصل بـ Worker
✓ Worker يتصل بـ Backend
✓ Auto-failover يعمل
✓ SSE notifications تعمل
✓ Authentication يعمل
✓ Rate limiting يعمل
```

---

## 📊 Monitoring & Logging

### Cloudflare Pages:
```
Dashboard → Pages → mmc-mms-2026 → Deployments
- Build logs
- Deployment history
- Analytics
```

### Cloudflare Worker:
```
Dashboard → Workers → mmc-mms-worker
- Request analytics
- Error logs
- Performance metrics
```

### Commands للمراقبة:
```bash
# Worker logs (real-time)
wrangler tail mmc-mms-worker

# Pages logs
# (في Dashboard فقط)
```

---

## 🚨 Troubleshooting

### مشكلة: Build fails في Pages
**الحل:**
```
1. تحقق من Node version (يجب 18.x)
2. تحقق من Build command: npm run build
3. تحقق من Output directory: dist
4. راجع Build logs في Dashboard
```

### مشكلة: CORS errors
**الحل:**
```javascript
// في Worker، تأكد من:
response.headers.set('Access-Control-Allow-Origin', frontendURL);
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
```

### مشكلة: Worker لا يصل إلى Backend
**الحل:**
```bash
# تحقق من Secret
wrangler secret list

# تحديث إذا لزم
wrangler secret put BACKEND_ORIGIN
```

---

## 📝 الخطوات التالية (بعد النشر)

1. ✅ احصل على URL النهائي
2. ✅ أنشئ QR Code للـ URL
3. ✅ اختبر جميع Features
4. ✅ وثّق الروابط
5. ✅ إعداد Monitoring
6. ✅ Backup strategy

---

## 🎯 URLs المتوقعة

بعد النشر، ستحصل على:

```
Frontend (Pages):
https://mmc-mms-2026.pages.dev

Worker (API):
https://mmc-mms-worker.your-subdomain.workers.dev

Backend (Origin):
https://your-backend-server.com:3001

Custom Domain (إذا أُضيف):
https://your-domain.com
```

---

## 📞 الدعم

**Cloudflare Docs:**
- Pages: https://developers.cloudflare.com/pages/
- Workers: https://developers.cloudflare.com/workers/

**GitHub Repo:**
- https://github.com/Bomussa/MMC-MMS-2026

**Status:**
- Cloudflare Status: https://www.cloudflarestatus.com/

---

**جاهز للتنفيذ!** 🚀

ابدأ من **المرحلة 1** واتبع الخطوات بالترتيب.
