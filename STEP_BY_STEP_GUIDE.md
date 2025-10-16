# 🎯 دليل التنفيذ المباشر - خطوة بخطوة بالصور

**مدة التنفيذ: 3 دقائق فقط!**

---

## 📍 أنت الآن في: Cloudflare Dashboard

---

## الخطوة 1️⃣: افتح النطاق mmc-mms.com

### في الصفحة الحالية:
```
1. ابحث عن: "mmc-mms.com" في قائمة Websites
2. اضغط عليه
```

### أو افتح مباشرة:
```
في القائمة اليسرى:
→ Websites
→ ابحث عن: mmc-mms.com
→ اضغط عليه
```

---

## الخطوة 2️⃣: افتح DNS Records

### في صفحة mmc-mms.com:
```
في القائمة العلوية أو الجانبية:
→ اضغط على: DNS
→ ستفتح صفحة: DNS Records
```

---

## الخطوة 3️⃣: احذف السجلات القديمة

### ستجد سجلات IPv6 القديمة:

#### السجل الأول:
```
Type: AAAA
Name: @ (أو mmc-mms.com)
Content: 2a06:98c1:3121::7
```
**اضغط:** Edit (أو القلم ✏️) → ثم Delete → Confirm

#### السجل الثاني:
```
Type: AAAA
Name: @ (أو mmc-mms.com)
Content: 2a06:98c1:3120::7
```
**اضغط:** Edit (أو القلم ✏️) → ثم Delete → Confirm

---

## الخطوة 4️⃣: أضف CNAME للنطاق الأساسي

### اضغط: "Add record"

```
Type: CNAME (اختر من القائمة المنسدلة)
Name: @ (أو اترك فارغ - سيصبح mmc-mms.com)
Target: 2027-5a0.pages.dev (انسخ والصق بالضبط!)
Proxy status: Proxied (☁️ Orange cloud - مهم جداً!)
TTL: Auto

اضغط: Save
```

### مهم جداً:
- ✅ تأكد أن Proxy status = **Proxied** (☁️ سحابة برتقالية)
- ✅ تأكد من كتابة Target بشكل صحيح: **2027-5a0.pages.dev**

---

## الخطوة 5️⃣: أضف CNAME لـ www

### اضغط: "Add record" مرة أخرى

```
Type: CNAME
Name: www (اكتب www بالضبط)
Target: 2027-5a0.pages.dev (نفس الهدف!)
Proxy status: Proxied (☁️ Orange cloud - مهم جداً!)
TTL: Auto

اضغط: Save
```

---

## الخطوة 6️⃣: اذهب إلى Workers & Pages

### في Cloudflare Dashboard:
```
في القائمة اليسرى:
→ اضغط على: Workers & Pages
→ ستظهر قائمة المشاريع
→ ابحث عن: 2027
→ اضغط عليه
```

---

## الخطوة 7️⃣: افتح Custom Domains

### في صفحة مشروع 2027:
```
في الأعلى، اضغط على Tab:
→ Custom domains

ستظهر القائمة الحالية:
✅ 2027-5a0.pages.dev
✅ www.mmc-mms.com (موجود بالفعل)
```

---

## الخطوة 8️⃣: أضف mmc-mms.com

### اضغط: "Set up a custom domain" (أو "Add a domain")

```
في الحقل:
→ اكتب: mmc-mms.com (بدون www)
→ اضغط: Continue

Cloudflare سيتحقق من DNS:
→ إذا كان كل شيء صحيح، سيقول: "DNS records configured"
→ اضغط: Activate domain

انتظر قليلاً... (5-30 ثانية)
```

---

## الخطوة 9️⃣: تحقق من النتيجة

### يجب أن تظهر القائمة هكذا:

```
Custom Domains:

✅ 2027-5a0.pages.dev
   Status: Active

✅ mmc-mms.com
   Status: Active (أو Initializing → سيصبح Active بعد دقائق)

✅ www.mmc-mms.com
   Status: Active
```

---

## الخطوة 🔟: انتظر قليلاً

```
⏰ الوقت المتوقع: 5-15 دقيقة
🔄 انتشار DNS عالمياً: قد يأخذ حتى ساعة
☕ خذ استراحة قصيرة!
```

---

## الخطوة 1️⃣1️⃣: اختبر الموقع

### بعد 10 دقائق، جرب:

```
Test 1: https://mmc-mms.com
→ يجب أن يفتح الموقع! ✅

Test 2: https://www.mmc-mms.com
→ يجب أن يفتح الموقع! ✅

Test 3: http://mmc-mms.com
→ يجب أن يحول إلى https تلقائياً! ✅
```

---

## ✅ علامات النجاح:

### 1. في DNS Records:
```
✅ CNAME @ → 2027-5a0.pages.dev (Proxied ☁️)
✅ CNAME www → 2027-5a0.pages.dev (Proxied ☁️)
❌ لا يوجد AAAA Records
```

### 2. في Custom Domains:
```
✅ mmc-mms.com - Active
✅ www.mmc-mms.com - Active
✅ SSL: Active
```

### 3. في المتصفح:
```
✅ https://mmc-mms.com يفتح
✅ شهادة SSL صالحة 🔒
✅ صفحة تسجيل الدخول تظهر
```

---

## ⚠️ إذا واجهت مشكلة:

### المشكلة: "CNAME @ not allowed"
**الحل:**
```
بعض مزودي DNS لا يسمحون بـ CNAME للـ @
استخدم بدلاً منه:
→ Name: mmc-mms.com (بدلاً من @)
```

### المشكلة: "Custom domain status: Pending"
**الحل:**
```
→ تحقق من DNS صحيح
→ تحقق من Proxy = Proxied
→ انتظر 10-30 دقيقة
```

### المشكلة: "Error 1014"
**الحل:**
```
→ تأكد أن mmc-mms.com في نفس حساب Cloudflare
→ تأكد من Proxy Status = Proxied
```

---

## 📋 Checklist النهائي:

قبل الإغلاق، تأكد من:

- [ ] ✅ حذفت AAAA Records القديمة
- [ ] ✅ أضفت CNAME @ → 2027-5a0.pages.dev
- [ ] ✅ أضفت CNAME www → 2027-5a0.pages.dev
- [ ] ✅ Proxy Status = Proxied لكلاهما
- [ ] ✅ أضفت mmc-mms.com في Custom Domains
- [ ] ✅ Status أصبح Active (أو Initializing)

---

## 🎉 انتهيت!

### الآن فقط:
```
⏰ انتظر 10 دقائق
☕ اشرب قهوة
✅ افتح https://mmc-mms.com
🎉 استمتع بموقعك!
```

---

**ملاحظة:** هذه الخطوات يجب تنفيذها يدوياً في Cloudflare Dashboard لأنها تتطلب تسجيل دخولك وصلاحياتك.

**لا يمكنني تنفيذها تلقائياً بدون API Token من حسابك!**
