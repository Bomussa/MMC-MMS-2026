# الملفات الجديدة المضافة للمشروع

## Backend TypeScript Stack

### 📂 ملفات التكوين (config/)
- ✅ `constants.json` - الإعدادات العامة (المنطقة الزمنية، فترات الطوابير، إعدادات PIN)
- ✅ `clinics.json` - بيانات العيادات (12 عيادة مع معلومات الطوابق)
- ✅ `routeMap.json` - خرائط المسارات الطبية بالعربية (دورات، تجنيد، ترفيع، إلخ)

### 📂 الخادم الخلفي (src/)

#### نقطة الدخول
- ✅ `src/index.ts` - Express server bootstrap مع جميع الموجهات والجدولة

#### API Routes (src/api/routes/)
- ✅ `pin.ts` - إصدار والتحقق من أرقام PIN
- ✅ `queue.ts` - دخول وإكمال الطوابير
- ✅ `route.ts` - تعيين المسارات والانتقال بين العيادات
- ✅ `events.ts` - Server-Sent Events للإشعارات الحية

#### الخدمات الأساسية (src/core/)
- ✅ `pinService.ts` - إدارة أرقام PIN مع تخزين يومي
- ✅ `queueManager.ts` - إدارة الطوابير والنداء الآلي
- ✅ `routing/routeService.ts` - إنشاء وإدارة المسارات الطبية
- ✅ `notifications/notificationService.ts` - نظام الإشعارات SSE
- ✅ `validation/validateBeforeDisplay.ts` - التحقق من صحة التذاكر
- ✅ `monitor/health-check.ts` - فحص صحة النظام

#### الأدوات المساعدة (src/utils/)
- ✅ `fs-atomic.ts` - عمليات قراءة/كتابة آمنة للملفات
- ✅ `logger.ts` - نظام السجلات والتدقيق
- ✅ `time.ts` - معالجة التوقيت مع المنطقة الزمنية (Asia/Qatar)

#### التعريفات (src/types/)
- ✅ `cors.d.ts` - تعريفات TypeScript لـ CORS

### 📂 التكوين (جذر المشروع)
- ✅ `tsconfig.json` - إعدادات TypeScript (NodeNext, ES2020)
- ✅ `.env.example` - مثال على متغيرات البيئة

### 📂 الواجهة الأمامية المحدثة
- ✅ `src/App.jsx` - محدث مع نظام SSE والإشعارات الصوتية

## 🔄 التحديثات على package.json

### Scripts الجديدة
```json
{
  "server:build": "tsc -p .",
  "server:dev": "node --loader ts-node/esm --no-warnings src/index.ts",
  "server:start": "node dist_server/index.js"
}
```

### Dependencies الجديدة
```json
{
  "body-parser": "^1.20.2",
  "cookie-parser": "^1.4.6"
}
```

### DevDependencies الجديدة
```json
{
  "ts-node": "^10.9.2"
}
```

## 📊 هيكل البيانات

### data/pins/
- تخزين يومي لأرقام PIN المُصدرة
- مثال: `data/pins/2025-10-15.json`

### data/queues/
- طوابير منظمة حسب العيادة والتاريخ
- مثال: `data/queues/LAB/2025-10-15.json`

### data/routes/
- مسارات المراجعين الفردية
- مثال: `data/routes/V12345.json`

### data/audit/
- سجلات التدقيق اليومية
- مثال: `data/audit/2025-10-15.log`

## 🎯 الميزات المضافة

### 1. نظام PIN المحسّن
- إصدار تسلسلي آمن
- نطاق قابل للتكوين لكل عيادة
- تخزين يومي منفصل
- التحقق من الصلاحية

### 2. إدارة الطوابير الذكية
- جدولة آلية للنداء
- تتبع حالة المراجعين (منتظر/مناداة/مكتمل)
- إحصائيات الوقت الحقيقي

### 3. المسارات الطبية المرنة
- دعم مسارات متعددة (دورات، تجنيد، إلخ)
- تخصيص حسب الجنس
- تتبع التقدم خطوة بخطوة
- فتح العيادة التالية تلقائياً

### 4. الإشعارات الحية
- SSE لتحديثات فورية
- إشعارات قبل الدور بـ3 أشخاص
- إشعار عند حلول الدور
- صوت تنبيه للإشعارات

### 5. التحقق من الصحة
- فحص التذكرة قبل العرض
- كشف التأخيرات (> 5 دقائق)
- التحقق من الحالة النشطة
- منع التكرارات

### 6. المراقبة والصحة
- نقطة `/api/health` للفحص
- سجلات تدقيق تفصيلية
- تتبع جميع العمليات
- تقارير الأخطاء

## 🔧 كيفية الاستخدام

### تشغيل الخادم الخلفي
```bash
# Development mode with hot reload
npm run server:dev

# Build for production
npm run server:build

# Run production server
npm run server:start
```

### تشغيل التطوير الكامل
```powershell
# في نافذة PowerShell واحدة
npm run dev

# في نافذة أخرى
npm run server:dev
```

### API Examples

#### إصدار PIN
```bash
curl -X POST http://localhost:3000/api/pin/issue \
  -H "Content-Type: application/json" \
  -d '{"clinicId": "LAB"}'
```

#### دخول الطابور
```bash
curl -X POST http://localhost:3000/api/queue/enter \
  -H "Content-Type: application/json" \
  -d '{"clinicId": "LAB", "visitId": "V12345"}'
```

#### تعيين مسار
```bash
curl -X POST http://localhost:3000/api/route/assign \
  -H "Content-Type: application/json" \
  -d '{"visitId": "V12345", "examType": "تجنيد", "gender": "M"}'
```

#### الاستماع للإشعارات
```javascript
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Notice:', data);
};
```

## 📝 ملاحظات مهمة

1. **TypeScript Configuration**: استخدام NodeNext لدعم ESM الأصلي
2. **Import Extensions**: يجب إضافة `.js` في imports حتى لملفات `.ts`
3. **JSON Imports**: استخدام `with { type: 'json' }` للتوافق
4. **Atomic Writes**: جميع عمليات الكتابة تستخدم ملفات مؤقتة لضمان السلامة
5. **Time Zones**: المنطقة الزمنية الافتراضية Asia/Qatar مع pivot الساعة 5 صباحاً
6. **Audit Logs**: سجلات يومية منفصلة لسهولة المراجعة

## 🚀 الخطوات التالية

- [ ] إضافة اختبارات للخدمات الجديدة
- [ ] توثيق API مع Swagger
- [ ] إضافة مصادقة JWT
- [ ] تحسين معالجة الأخطاء
- [ ] إضافة قاعدة بيانات (PostgreSQL/Redis)
- [ ] إعداد Docker container
- [ ] CI/CD pipeline

---

**تاريخ الإنشاء**: أكتوبر 2025  
**الإصدار**: 1.0.0
