# 🔧 خطة الإصلاح الآمن الكامل - مشروع 2027
## Safe Full Repair Plan

**تاريخ:** 2025-10-16  
**المشروع:** 2027 (MMC-MMS System)  
**الهدف:** إصلاح الوظائف التفاعلية بدون المساس بالتصميم الحالي

---

## 📋 نظرة عامة

هذه الخطة تضمن إصلاح كل المشاكل الوظيفية في المشروع:
- ✅ إصلاح منطق الكيو والـPIN
- ✅ نظام التعديل العام الموحد
- ✅ إعادة ترتيب واجهة الإدارة
- ✅ اختبارات حية فعلية
- ✅ نسخ احتياطي تلقائي
- ✅ بدون المساس بالتصميم الحالي

---

## 🔹 المرحلة 1 — إصلاح منطق الكيو والـPIN (Backend)

### 📁 الملفات المستهدفة:
```
/server/api/pin.js
/server/api/queue.js
```

### 📝 الكود المطلوب:

#### `server/api/pin.js`:
```javascript
// دالة للحصول على PIN يومي لكل عيادة
export const getClinicPIN = async (clinicId) => {
  const pins = await readJson("data/pins.json");
  const today = new Date().toISOString().split('T')[0];
  
  // إذا لا يوجد PIN أو التاريخ قديم، أنشئ واحد جديد
  if (!pins[clinicId] || pins[clinicId].date !== today) {
    pins[clinicId] = {
      code: generatePIN(),
      date: today,
      issuedAt: new Date().toISOString()
    };
    await writeJson("data/pins.json", pins);
  }
  
  return pins[clinicId];
};

// دالة لتوليد PIN عشوائي
function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// دالة مساعدة لقراءة JSON
async function readJson(path) {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return {};
  }
}

// دالة مساعدة لكتابة JSON
async function writeJson(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}
```

#### `server/api/queue.js`:
```javascript
// دالة لزيادة رقم الدور لعيادة معينة
export const incrementQueue = async (clinicId) => {
  const queues = await readJson("data/queues.json");
  
  // إذا لا يوجد queue للعيادة، ابدأ من 1
  if (!queues[clinicId]) {
    queues[clinicId] = 1;
  } else {
    queues[clinicId]++;
  }
  
  await writeJson("data/queues.json", queues);
  return queues[clinicId];
};

// دالة للحصول على رقم الدور الحالي
export const getCurrentQueue = async (clinicId) => {
  const queues = await readJson("data/queues.json");
  return queues[clinicId] || 0;
};

// دالة لإعادة تعيين الدور (للإدارة)
export const resetQueue = async (clinicId) => {
  const queues = await readJson("data/queues.json");
  queues[clinicId] = 0;
  await writeJson("data/queues.json", queues);
  return 0;
};
```

### 🔌 ربط Frontend بـ Backend:

#### في الواجهة (React/TypeScript):
```typescript
// الحصول على PIN
async function getClinicPIN(clinicId: string) {
  const response = await fetch(`/api/pin/${clinicId}`);
  return response.json();
}

// زيادة رقم الدور
async function incrementQueue(clinicId: string) {
  const response = await fetch(`/api/queue/${clinicId}`, {
    method: 'POST'
  });
  return response.json();
}

// الحصول على رقم الدور الحالي
async function getCurrentQueue(clinicId: string) {
  const response = await fetch(`/api/queue/${clinicId}`);
  return response.json();
}
```

### 📊 مراقبة مباشرة في لوحة الإدارة:

```tsx
// في AdminDashboard.tsx
function QueueMonitor() {
  const [queues, setQueues] = useState({});
  const [pins, setPins] = useState({});

  useEffect(() => {
    // تحديث كل 5 ثوان
    const interval = setInterval(async () => {
      const clinics = ['general', 'dental', 'eye']; // قائمة العيادات
      
      for (const clinic of clinics) {
        const queueData = await fetch(`/api/queue/${clinic}`).then(r => r.json());
        const pinData = await fetch(`/api/pin/${clinic}`).then(r => r.json());
        
        setQueues(prev => ({ ...prev, [clinic]: queueData.number }));
        setPins(prev => ({ ...prev, [clinic]: pinData.code }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="queue-monitor">
      {Object.keys(queues).map(clinic => (
        <div key={clinic} className="clinic-status">
          <h3>{clinic}</h3>
          <p>الدور الحالي: {queues[clinic]}</p>
          <p>PIN اليوم: {pins[clinic]}</p>
          <button onClick={() => incrementQueue(clinic)}>
            زيادة الدور
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔹 المرحلة 2 — نظام التعديل العام (Global Update System)

### 📁 إنشاء الملف:
```
src/utils/applyGlobalUpdate.ts
```

### 📝 الكود:
```typescript
/**
 * نظام موحد لتطبيق التعديلات على كل الصفحات
 * يضمن أن أي تعديل ينعكس فوراً على كل الواجهات
 */

interface UpdateData {
  [key: string]: any;
  updatedAt?: string;
}

export function applyGlobalUpdate(
  stateUpdater: Function,
  data: UpdateData
): boolean {
  try {
    // إضافة timestamp للتعديل
    const update: UpdateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    // تحديث الـ state
    stateUpdater((prev: any) => ({ ...prev, ...update }));

    // حفظ في localStorage للاستمرارية
    const storageKey = `globalUpdate_${Date.now()}`;
    localStorage.setItem(storageKey, JSON.stringify(update));

    // إرسال حدث مخصص لإخطار باقي الصفحات
    window.dispatchEvent(new CustomEvent('globalUpdate', {
      detail: update
    }));

    console.log('✅ Global update applied:', update);
    return true;
  } catch (error) {
    console.error('❌ Global update failed:', error);
    return false;
  }
}

/**
 * Hook للاستماع للتحديثات العامة
 */
export function useGlobalUpdate(callback: (data: UpdateData) => void) {
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('globalUpdate', handleUpdate as any);
    return () => window.removeEventListener('globalUpdate', handleUpdate as any);
  }, [callback]);
}
```

### 🔌 الاستخدام في الصفحات:

```typescript
// في أي صفحة إدارة أو إعدادات
import { applyGlobalUpdate, useGlobalUpdate } from '../utils/applyGlobalUpdate';

function AdminSettings() {
  const [formData, setFormData] = useState({});

  // الاستماع للتحديثات من صفحات أخرى
  useGlobalUpdate((data) => {
    console.log('تحديث جديد من صفحة أخرى:', data);
    setFormData(prev => ({ ...prev, ...data }));
  });

  const handleSave = () => {
    const newData = {
      clinicName: 'عيادة جديدة',
      maxQueue: 50,
      // ... باقي البيانات
    };

    // تطبيق التعديل على كل الصفحات
    const success = applyGlobalUpdate(setFormData, newData);
    
    if (success) {
      alert('✅ تم حفظ التعديلات بنجاح');
    }
  };

  return (
    <div>
      <button onClick={handleSave}>
        حفظ التعديلات
      </button>
    </div>
  );
}
```

---

## 🔹 المرحلة 3 — إعادة ترتيب واجهة الإدارة

### 📁 الملف المستهدف:
```
src/pages/AdminDashboard.tsx
```

### 📝 الهيكل الجديد المقترح:

```tsx
import React, { useState, useEffect } from 'react';
import QueueMonitor from '../components/QueueMonitor';
import PinMonitor from '../components/PinMonitor';
import FeatureRegistry from '../components/FeatureRegistry';
import NotificationControl from '../components/NotificationControl';
import ReportsView from '../components/ReportsView';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <main className="admin-dashboard">
      {/* رأس الصفحة */}
      <header className="admin-header">
        <h1>لوحة الإدارة</h1>
        <div className="admin-actions">
          <button className="btn-primary">إعدادات النظام</button>
          <button className="btn-secondary">إدارة المستخدمين</button>
        </div>
      </header>

      {/* الأقسام الرئيسية */}
      <section className="admin-sections">
        {/* قسم العيادات والدور */}
        <div className="admin-card">
          <h2>العيادات والدور</h2>
          <QueueMonitor />
          <PinMonitor />
        </div>

        {/* قسم الإشعارات والميزات */}
        <div className="admin-card">
          <h2>الإشعارات والميزات</h2>
          <FeatureRegistry />
          <NotificationControl />
        </div>

        {/* قسم الإحصائيات والتقارير */}
        <div className="admin-card">
          <h2>الإحصائيات والتقارير</h2>
          <ReportsView />
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
```

### 🎨 CSS المرافق:

```css
/* src/pages/AdminDashboard.css */
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.admin-actions {
  display: flex;
  gap: 1rem;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.admin-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.admin-card h2 {
  margin-bottom: 1rem;
  color: #1f2937;
}
```

**⚠️ ملاحظة مهمة:** هذا الترتيب فقط، لا حذف لأي مكون!

---

## 🔹 المرحلة 4 — فحص فعلي حي (Integration Tests)

### 📁 إنشاء الملف:
```
tools/test-live-system.ps1
```

### 📝 الكود:

```powershell
# اختبار حي للنظام
Write-Host "🧪 بدء الاختبارات الحية..." -ForegroundColor Cyan

# بناء المشروع
Write-Host "`n1️⃣ بناء المشروع..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل البناء!" -ForegroundColor Red
    exit 1
}

# تشغيل السيرفر في الخلفية
Write-Host "`n2️⃣ تشغيل السيرفر..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/index.js" -WindowStyle Hidden -PassThru

Start-Sleep -Seconds 5

try {
    # اختبار 1: زيادة الدور
    Write-Host "`n3️⃣ اختبار زيادة الدور..." -ForegroundColor Yellow
    $queueBefore = Invoke-RestMethod http://localhost:3000/api/queue/general
    Write-Host "الدور قبل: $($queueBefore.number)" -ForegroundColor Gray
    
    $queueAfter = Invoke-RestMethod http://localhost:3000/api/queue/general -Method POST
    Write-Host "الدور بعد: $($queueAfter.number)" -ForegroundColor Gray
    
    if ($queueAfter.number -gt $queueBefore.number) {
        Write-Host "✅ اختبار الدور نجح" -ForegroundColor Green
    } else {
        Write-Host "❌ اختبار الدور فشل" -ForegroundColor Red
    }

    # اختبار 2: الحصول على PIN
    Write-Host "`n4️⃣ اختبار PIN..." -ForegroundColor Yellow
    $pin = Invoke-RestMethod http://localhost:3000/api/pin/general
    Write-Host "PIN اليوم: $($pin.code)" -ForegroundColor Gray
    
    if ($pin.code -match '^\d{4}$') {
        Write-Host "✅ اختبار PIN نجح" -ForegroundColor Green
    } else {
        Write-Host "❌ اختبار PIN فشل" -ForegroundColor Red
    }

    # اختبار 3: API الميزات
    Write-Host "`n5️⃣ اختبار API الميزات..." -ForegroundColor Yellow
    $features = Invoke-RestMethod http://localhost:3000/api/admin/features
    Write-Host "عدد الميزات: $($features.Count)" -ForegroundColor Gray
    
    if ($features.Count -gt 0) {
        Write-Host "✅ اختبار الميزات نجح" -ForegroundColor Green
    } else {
        Write-Host "❌ اختبار الميزات فشل" -ForegroundColor Red
    }

    Write-Host "`n✅ اكتملت جميع الاختبارات!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ حدث خطأ: $_" -ForegroundColor Red
} finally {
    # إيقاف السيرفر
    Write-Host "`n6️⃣ إيقاف السيرفر..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "✅ تم إيقاف السيرفر" -ForegroundColor Green
}
```

### ▶️ تشغيل الاختبارات:

```powershell
.\tools\test-live-system.ps1
```

---

## 🔹 المرحلة 5 — نسخ احتياط تلقائي

### 📁 إنشاء الملف:
```
tools/backup-before-edit.ps1
```

### 📝 الكود:

```powershell
# نسخ احتياطي تلقائي قبل أي تعديل
param(
    [string]$Description = "تعديل عام"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$src = "src"
$dest = "backups/src-$timestamp"

Write-Host "📦 إنشاء نسخة احتياطية..." -ForegroundColor Cyan
Write-Host "الوصف: $Description" -ForegroundColor Gray

# إنشاء مجلد الباك أب إذا لم يكن موجود
if (!(Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
}

# نسخ المجلد
Copy-Item $src $dest -Recurse -Force

# حساب الحجم
$size = (Get-ChildItem $dest -Recurse | Measure-Object -Property Length -Sum).Sum
$sizeMB = [Math]::Round($size / 1MB, 2)

# حفظ معلومات الباك أب
$info = @{
    timestamp = $timestamp
    description = $Description
    size = "$sizeMB MB"
    path = $dest
} | ConvertTo-Json

$info | Out-File "backups/backup-$timestamp.json"

Write-Host "✅ تم إنشاء نسخة احتياطية:" -ForegroundColor Green
Write-Host "   📁 المسار: $dest" -ForegroundColor White
Write-Host "   📊 الحجم: $sizeMB MB" -ForegroundColor White
Write-Host "   🕒 الوقت: $timestamp" -ForegroundColor White

# حذف النسخ القديمة (أكثر من 7 أيام)
Get-ChildItem "backups" -Directory | 
    Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-7) } |
    Remove-Item -Recurse -Force

Write-Host "🗑️  تم حذف النسخ الاحتياطية القديمة (أكثر من 7 أيام)" -ForegroundColor Gray
```

### ▶️ الاستخدام:

```powershell
# قبل أي تعديل
.\tools\backup-before-edit.ps1 -Description "إصلاح منطق الكيو"

# ثم نفذ التعديلات
```

---

## 🔹 المرحلة 6 — أمر Copilot النهائي

### 📋 البرومت الشامل:

```markdown
# إصلاح شامل للوظائف التفاعلية بدون المساس بالتصميم

## المهام المطلوبة:

1️⃣  **Backend - إصلاح API:**
   - طبّق إصلاح منطق الكيو في `server/api/queue.js`
   - طبّق إصلاح منطق PIN في `server/api/pin.js`
   - تأكد من وجود ملفات البيانات: `data/queues.json`, `data/pins.json`
   - أضف endpoints: GET/POST لكل من queue و pin

2️⃣  **Frontend - نظام التعديل العام:**
   - أنشئ `src/utils/applyGlobalUpdate.ts`
   - فعّل النظام في كل الصفحات التي تحتوي نماذج تعديل
   - أضف hook للاستماع للتحديثات: `useGlobalUpdate`

3️⃣  **Admin Dashboard - إعادة الترتيب:**
   - أعد ترتيب عناصر `src/pages/AdminDashboard.tsx` فقط
   - بدون حذف أي مكون موجود
   - استخدم الهيكل الموضح في الخطة
   - أضف CSS للتنسيق

4️⃣  **Testing - الاختبارات الحية:**
   - أنشئ `tools/test-live-system.ps1`
   - نفّذ الاختبارات بعد الإصلاح
   - تأكد من نجاح جميع الاختبارات

5️⃣  **Backup - النسخ الاحتياطي:**
   - أنشئ `tools/backup-before-edit.ps1`
   - نفّذه قبل أي تعديل على src
   - احفظ السجلات في مجلد backups

6️⃣  **Verification - التحقق النهائي:**
   بعد الانتهاء، تحقق أن:
   - ✅ الأرقام في الكيو تتغير فعلياً عند الضغط
   - ✅ PIN يظهر في لوحة الإدارة ويتغير يومياً
   - ✅ التعديلات تنعكس مباشرة على كل الصفحات
   - ✅ لوحة الإدارة مرتبة وتعمل بالكامل
   - ✅ التصميم الحالي لم يتأثر

## قواعد التنفيذ:
- ⚠️ **لا تحذف أي ملف موجود**
- ⚠️ **لا تغير التصميم CSS الحالي**
- ⚠️ **خذ نسخة احتياطية قبل كل تعديل**
- ⚠️ **اختبر كل تعديل قبل الانتقال للتالي**

## الأولوية:
1. Backend APIs (الأهم)
2. Global Update System
3. Admin Dashboard Reorder
4. Testing & Verification
```

---

## 📊 الخلاصة

### ✅ ما ستحققه هذه الخطة:

1. **وظائف تعمل 100%:**
   - الكيو يزيد فعلياً
   - PIN يتغير يومياً
   - التعديلات تنعكس فوراً

2. **واجهة منظمة:**
   - لوحة الإدارة مرتبة
   - كل القسم في مكانه الصحيح
   - سهولة الوصول للوظائف

3. **أمان كامل:**
   - نسخ احتياطية تلقائية
   - اختبارات قبل كل نشر
   - لا حذف لأي شيء

4. **تجربة مستخدم ممتازة:**
   - تحديثات فورية
   - استجابة سريعة
   - بدون أخطاء

---

## 🚀 خطوات التنفيذ

### 1. التحضير:
```powershell
cd "C:\Users\USER\OneDrive\Desktop\تجميع من 3\2027"
git checkout -b feature/safe-repair
```

### 2. النسخ الاحتياطي:
```powershell
.\tools\backup-before-edit.ps1 -Description "بداية الإصلاح الآمن"
```

### 3. التنفيذ:
أعط Copilot البرومت النهائي من المرحلة 6

### 4. الاختبار:
```powershell
.\tools\test-live-system.ps1
```

### 5. النشر:
```powershell
git add .
git commit -m "✅ Safe repair: Fixed queue, PIN, and global updates"
git push origin feature/safe-repair
wrangler pages deploy dist --project-name=2027
```

---

**✅ النتيجة النهائية:** 
نظام يعمل بكامل طاقته، واجهة منظمة، بدون أي مشاكل في التصميم! 🎉
