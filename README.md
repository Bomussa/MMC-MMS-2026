# MMC-MMS 2026 - نظام إدارة اللجنة الطبية العسكرية

## 📋 نظرة عامة
نظام متكامل لإدارة طوابير المراجعين والمسارات الطبية في المركز الطبي العسكري.

## 🚀 المميزات الجديدة

### Backend TypeScript Stack
- **Express API Server** مع TypeScript و NodeNext
- **خدمات أساسية**:
  - `pinService` - إدارة أرقام PIN
  - `queueManager` - إدارة الطوابير
  - `routeService` - إدارة المسارات الطبية
  - `notificationService` - نظام الإشعارات SSE
  - `validateBeforeDisplay` - التحقق من صحة التذاكر
  - `health-check` - فحص صحة النظام

### Configuration Files
- `config/constants.json` - الإعدادات العامة للنظام
- `config/clinics.json` - بيانات العيادات
- `config/routeMap.json` - خرائط المسارات الطبية

### API Endpoints
- `POST /api/pin/issue` - إصدار رقم PIN جديد
- `POST /api/pin/validate` - التحقق من صحة PIN
- `POST /api/queue/enter` - دخول الطابور
- `POST /api/queue/complete` - إكمال الفحص
- `POST /api/route/assign` - تعيين مسار طبي
- `POST /api/route/next` - الانتقال للعيادة التالية
- `GET /api/events` - Server-Sent Events للإشعارات الحية
- `GET /api/health` - فحص صحة النظام

## 🛠️ التثبيت والتشغيل

### المتطلبات
- Node.js >= 18.0.0
- npm أو yarn

### التثبيت
```bash
npm install
```

### تشغيل التطوير
```bash
# تشغيل الواجهة الأمامية
npm run dev

# تشغيل الخادم الخلفي
npm run server:dev

# أو تشغيل الاثنين معاً
npm run dev & npm run server:dev
```

### البناء للإنتاج
```bash
# بناء الخادم الخلفي
npm run server:build

# بناء الواجهة الأمامية
npm run build

# تشغيل الإنتاج
npm run server:start
```

## 📁 هيكل المشروع

```
2026/
├── config/                 # ملفات التكوين
│   ├── constants.json      # الإعدادات العامة
│   ├── clinics.json        # بيانات العيادات
│   └── routeMap.json       # خرائط المسارات
├── src/
│   ├── api/               # API Routes
│   │   └── routes/        # Express routers
│   ├── core/              # خدمات النظام الأساسية
│   │   ├── monitor/       # مراقبة صحة النظام
│   │   ├── notifications/ # نظام الإشعارات
│   │   ├── routing/       # إدارة المسارات
│   │   └── validation/    # التحقق من البيانات
│   ├── utils/             # أدوات مساعدة
│   │   ├── fs-atomic.ts   # عمليات الملفات الآمنة
│   │   ├── logger.ts      # نظام السجلات
│   │   └── time.ts        # معالجة الوقت والتواريخ
│   ├── types/             # تعريفات TypeScript
│   ├── components/        # مكونات React
│   ├── lib/              # مكتبات الواجهة
│   ├── index.ts          # نقطة دخول الخادم
│   └── main.jsx          # نقطة دخول الواجهة
├── public/               # ملفات ثابتة
├── data/                 # تخزين البيانات
│   ├── pins/            # أرقام PIN المُصدرة
│   ├── queues/          # بيانات الطوابير
│   ├── routes/          # مسارات المراجعين
│   └── audit/           # سجلات التدقيق
├── dist_server/         # الخادم المُترجَم
├── .env.example         # مثال على متغيرات البيئة
├── tsconfig.json        # إعدادات TypeScript
└── package.json         # اعتماديات المشروع
```

## ⚙️ التكوين

### متغيرات البيئة (.env)
```bash
# Frontend
VITE_SITE_URL=https://example.com
VITE_API_ORIGIN=https://api.example.com
VITE_ENABLE_DEBUG=false

# Backend
PORT=3000
NODE_ENV=production
ALLOW_ADMIN=1
```

### إعدادات النظام (config/constants.json)
```json
{
  "TIMEZONE": "Asia/Qatar",
  "SERVICE_DAY_PIVOT": "05:00",
  "QUEUE_INTERVAL_SECONDS": 120,
  "PIN_LATE_MINUTES": 5,
  "PIN_DIGITS": 2,
  "PIN_RANGE_PER_CLINIC": ["01", "20"],
  "MOBILE_QR_ONLY": false,
  "DESKTOP_BASIC_AUTH": true,
  "NOTIFY_NEAR_AHEAD": 3,
  "NOTICE_TTL_SECONDS": 30
}
```

## 🔒 الأمان
- تخزين آمن للبيانات مع عمليات كتابة ذرية
- التحقق من صحة التذاكر قبل العرض
- سجلات تدقيق شاملة لجميع العمليات
- معالجة آمنة للأخطاء

## 📊 المراقبة
- `/api/health` - نقطة فحص صحة النظام
- سجلات تدقيق يومية في `data/audit/`
- تتبع حالة الطوابير في الوقت الفعلي
- إشعارات SSE للتحديثات الحية

## 🧪 الاختبار
```bash
# تشغيل جميع الاختبارات
npm test

# اختبارات محددة
npm run test:unit
npm run test:integration
npm run test:live
```

## 📦 البناء والنشر
```bash
# فحص الأنواع
npm run typecheck

# بناء كامل (خادم + واجهة)
npm run build

# تشغيل الإنتاج
npm run server:start
```

## 🤝 المساهمة
هذا مشروع داخلي للمركز الطبي العسكري.

## 📄 الترخيص
جميع الحقوق محفوظة © 2026 - المركز الطبي العسكري

## 📞 الدعم الفني
للدعم والاستفسارات، يرجى التواصل مع فريق تقنية المعلومات.

---

**نسخة النظام**: 2026.1.0  
**آخر تحديث**: أكتوبر 2025
