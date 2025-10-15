# 🔧 خطوات حذف Cloudflare Tunnel - دليل مصور

**التاريخ:** 15 أكتوبر 2025  
**الهدف:** حذف إعدادات Tunnel وتهيئة Pages

---

## ✅ الخطوة 1: حذف DNS Records

### في صفحة Cloudflare DNS (المفتوحة):

1. **ابحث عن النطاق:** `mmc-mms.com` أو `www.mmc-mms.com`

2. **ابحث عن السجلات التالية للحذف:**

   #### أنواع السجلات المرتبطة بـ Tunnel:
   ```
   Type: CNAME
   Name: www أو @ أو mmc-mms.com
   Content: يحتوي على:
     - cfargotunnel.com
     - tunnel
     - .pages.dev (إذا كان خاطئ)
   ```

3. **كيفية الحذف:**
   - ✅ انقر على السجل
   - ✅ اضغط زر "Edit" أو أيقونة القلم ✏️
   - ✅ اضغط "Delete" (أحمر)
   - ✅ أكد الحذف

4. **احذف جميع السجلات المرتبطة بـ Tunnel**

---

## ✅ الخطوة 2: تحقق من Zero Trust (إذا كان موجوداً)

### افتح Zero Trust Dashboard:

```
https://one.dash.cloudflare.com/
```

1. **اذهب إلى:** Networks → Tunnels
2. **ابحث عن:** أي tunnel مرتبط بـ mmc-mms.com
3. **احذفه:** Delete Tunnel

---

## ✅ الخطوة 3: إنشاء Cloudflare Pages

### الآن أنشئ Pages Project:

1. **ارجع إلى:** https://dash.cloudflare.com/
2. **من القائمة اليسرى:** Workers & Pages
3. **اضغط:** Create Application (زر أزرق)
4. **اختر:** Pages (التبويب العلوي)
5. **اضغط:** Connect to Git

---

## ✅ الخطوة 4: ربط GitHub

1. **اختر:** GitHub
2. **قد يطلب Authorization** - وافق
3. **في قائمة Repositories:**
   - ابحث عن: `Bomussa/MMC-MMS-2026`
   - اضغط: Begin setup

---

## ✅ الخطوة 5: إعدادات Build

### املأ النموذج بالضبط كالتالي:

```
┌─────────────────────────────────────────┐
│ Project name: mmc-mms                   │
├─────────────────────────────────────────┤
│ Production branch: main                 │
├─────────────────────────────────────────┤
│ Framework preset: Vite                  │
├─────────────────────────────────────────┤
│ Build command: npm run build            │
├─────────────────────────────────────────┤
│ Build output directory: dist            │
├─────────────────────────────────────────┤
│ Root directory: (اتركه فارغاً)         │
└─────────────────────────────────────────┘
```

### Environment Variables:

اضغط **Add variable**:
```
Variable name: NODE_VERSION
Value: 18
```

---

## ✅ الخطوة 6: Deploy

1. **اضغط:** Save and Deploy (زر أزرق كبير)
2. **انتظر:** 2-3 دقائق
   - سترى Build logs
   - سيعرض التقدم
3. **عند النجاح:** ستحصل على رابط:
   ```
   https://mmc-mms.pages.dev
   ```

---

## ✅ الخطوة 7: ربط Custom Domain

### بعد نجاح Deploy:

1. **في صفحة المشروع:** اضغط **Custom domains**
2. **اضغط:** Set up a custom domain
3. **أدخل:** `mmc-mms.com`
4. **اضغط:** Continue
5. **سيُضاف DNS تلقائياً** ✅

### لإضافة www (اختياري):

1. **Add another domain**
2. **أدخل:** `www.mmc-mms.com`
3. **Continue**

---

## ✅ الخطوة 8: انتظار DNS Propagation

⏳ **الوقت:** 5-10 دقائق

**تحقق من الانتشار:**
```
https://dnschecker.org/
أدخل: mmc-mms.com
```

---

## ✅ الخطوة 9: اختبار

### بعد 10 دقائق، جرب:

```bash
# في المتصفح:
https://mmc-mms.com
https://www.mmc-mms.com
https://mmc-mms.pages.dev

# يجب أن تعمل جميعها! ✅
```

---

## 📝 ملاحظات مهمة

### ✅ ما يجب أن تراه في DNS:

بعد إضافة Custom Domain، يجب أن ترى:

```
Type: CNAME
Name: mmc-mms.com (أو @)
Content: mmc-mms.pages.dev
Proxy status: Proxied (سحابة برتقالية)
TTL: Auto
```

### ❌ ما يجب حذفه:

```
أي سجل يحتوي على:
- cfargotunnel.com
- tunnel
- أي شيء غير mmc-mms.pages.dev
```

---

## 🆘 حل المشاكل

### إذا لم يعمل Build:

**تحقق من:**
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ NODE_VERSION: `18`
- ✅ راجع Build logs للأخطاء

### إذا لم يعمل Domain:

**تحقق من:**
- ✅ انتظر 10 دقائق إضافية
- ✅ DNS في Cloudflare يشير إلى `mmc-mms.pages.dev`
- ✅ Proxy enabled (سحابة برتقالية)
- ✅ لا توجد سجلات tunnel قديمة

---

## 📸 صور توضيحية (ما يجب أن تراه)

### في DNS Records:
```
✅ CNAME | mmc-mms.com | mmc-mms.pages.dev | Proxied
✅ CNAME | www | mmc-mms.pages.dev | Proxied

❌ CNAME | www | xyz.cfargotunnel.com | (احذفه)
```

### في Pages Dashboard:
```
✅ Project: mmc-mms
✅ Status: Active
✅ Latest deployment: Success
✅ URL: https://mmc-mms.pages.dev
✅ Custom domains: mmc-mms.com, www.mmc-mms.com
```

---

## 🎯 Checklist النهائي

### قبل البدء:
- [ ] Cloudflare Dashboard مفتوح
- [ ] لديك صلاحيات على النطاق mmc-mms.com
- [ ] GitHub repository جاهز

### أثناء العمل:
- [ ] حذف سجلات Tunnel من DNS
- [ ] حذف Tunnel من Zero Trust (إن وجد)
- [ ] إنشاء Pages Project
- [ ] Connect to GitHub: MMC-MMS-2026
- [ ] Build settings صحيحة
- [ ] Deploy ناجح
- [ ] Custom domain مُضاف
- [ ] DNS propagated

### بعد الانتهاء:
- [ ] https://mmc-mms.com يعمل
- [ ] https://www.mmc-mms.com يعمل
- [ ] SSL تلقائي فعّال
- [ ] Build تلقائي من GitHub

---

## 🎊 النتيجة النهائية

بعد إتمام جميع الخطوات:

```
✅ Domain: https://mmc-mms.com
✅ WWW: https://www.mmc-mms.com
✅ Pages: https://mmc-mms.pages.dev
✅ SSL: Auto (Let's Encrypt)
✅ CDN: Cloudflare Global
✅ Auto Deploy: من GitHub
✅ Cost: مجاني 100%
```

---

## 🚀 ابدأ الآن!

**الوقت الإجمالي:** 10-15 دقيقة  
**المهارة المطلوبة:** سهلة  
**التكلفة:** مجاني

**افتح Cloudflare Dashboard وابدأ من الخطوة 1!**

---

**Dashboard:** https://dash.cloudflare.com/  
**DNS:** https://dash.cloudflare.com/?to=/:account/:zone/dns/records  
**Pages:** https://dash.cloudflare.com/?to=/:account/pages
