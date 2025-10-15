# تقرير الملفات غير المستخدمة — 2026

تاريخ الإنشاء: ${new Date().toISOString()}

هذا التقرير يُلخّص نتائج تدقيق البنية والمسارات والدوال والملفات غير المُستخدمة بناءً على رسم اعتمادية بسيط انطلاقًا من `src/main.jsx` و`src/index.ts`.

## ملخّص سريع
- نقاط الدخول: `src/main.jsx`, `src/index.ts`
- عدد الملفات ضمن `src/`: 89
- عدد الملفات القابلة للوصول من نقاط الدخول: 18
- عدد الملفات المرشّحة كغير مستخدمة: 71 (يلزم التحقق يدويًا)

ملاحظة: قد تتضمن القائمة ملفات تُحمَّل ديناميكيًا أو تُستخدم عبر alias/إعدادات Vite ولا يلتقطها الفحص. الرجاء التحقق يدويًا قبل أي حذف، والأفضل أرشفة أولًا.

## نتائج تدقيق المسارات (API)
تم استخراج نقاط نهاية من مجلد `src/api/routes/`، ولم تُرصد تعارضات.

## المسارات التي بدت «غير مرتبطة» بمدراء المنظومة
وفق تدقيق `integrationCheck.js` ظهرت العناصر التالية:
`admin.features`, `audit`, `events.pull`, `events`, `pin`, `qr`, `queue`, `report.snapshot`, `route`, `settings`, `stats`, `visual.snapshot`

هذه النتائج لا تعني أنها غير مستخدمة فعليًا، إذ يوضح `src/index.ts` أن جميع هذه الراوترات تُسجَّل على `app.use(...)`، لذا فهي مستخدمة فعليًا.

## عينة من الملفات المُصنّفة «غير مُستخدمة»
راجع الملف التفصيلي: `data/audit/unusedFiles.json`.

- src/api/routes/admin.features.ts
- src/api/routes/audit.ts
- src/api/routes/events.pull.ts
- src/api/routes/events.ts
- src/api/routes/pin.ts
- src/api/routes/qr.ts
- src/api/routes/queue.ts
- src/api/routes/report.snapshot.ts
- src/api/routes/route.ts
- src/api/routes/settings.ts
- src/api/routes/stats.ts
- src/api/routes/visual.snapshot.ts

هذه كلها مسجّلة بوضوح في `src/index.ts` وبالتالي هي مستخدمة. إدراجها في قائمة "غير مستخدمة" ناتج عن محدودية المُحلّل الذي يعتمد فقط على تتبّع الاستيراد وليس تسجيل الراوترات.

## توصيات
- عدم حذف أي ملف تلقائيًا بناءً على هذا التقرير.
- إن رغبت بالتنظيف: سنعتمد الأرشفة أولًا في `backups/_archive_unused_YYYYMMDD/` بعد مراجعة بشرية.
- يمكن تحسين أداة الفحص لاحقًا لدعم تحليل Express Router من `src/index.ts` مباشرةً.

— انتهى —
