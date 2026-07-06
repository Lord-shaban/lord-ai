# المساهمة في LORD AI

<div align="center">

شكراً لاهتمامك بالمساهمة في **LORD AI**! 🎉

نرحب بجميع أنواع المساهمات: إصلاح أخطاء، إضافة ميزات، تحسين التوثيق، أو حتى الإبلاغ عن مشاكل.

</div>

---

## 📋 جدول المحتويات

- [قواعد السلوك](#-قواعد-السلوك)
- [كيف أساهم؟](#-كيف-أساهم)
- [إعداد بيئة التطوير](#-إعداد-بيئة-التطوير)
- [أسلوب الكود](#-أسلوب-الكود)
- [رسائل الـ Commit](#-رسائل-الـ-commit)
- [مراجعة الكود](#-مراجعة-الكود)

---

## 📜 قواعد السلوك

بالمشاركة في هذا المشروع، أنت توافق على الالتزام بـ [قواعد السلوك](CODE_OF_CONDUCT.md).

## 🚀 كيف أساهم؟

### 🐛 الإبلاغ عن مشكلة (Bug Report)

1. تأكد أن المشكلة غير مبلغ عنها مسبقاً في [Issues](https://github.com/Lord-shaban/lord-ai/issues)
2. أنشئ Issue جديد مع:
   - **وصف واضح** للمشكلة
   - **خطوات إعادة الإنتاج** (Steps to reproduce)
   - **النتيجة المتوقعة** vs **النتيجة الفعلية**
   - **لقطة شاشة** (إن أمكن)
   - **المتصفح والجهاز** المستخدم

### 💡 اقتراح ميزة (Feature Request)

1. افتح Issue جديد بعنوان يبدأ بـ `[Feature]`
2. اشرح الميزة المقترحة بالتفصيل
3. وضح لماذا ستكون مفيدة للمستخدمين

### 🔧 إرسال تعديلات (Pull Request)

```bash
# 1. Fork المستودع من GitHub

# 2. استنسخ نسختك
git clone https://github.com/YOUR_USERNAME/lord-ai.git
cd lord-ai

# 3. أنشئ فرع جديد
git checkout -b feature/my-amazing-feature

# 4. أضف تعديلاتك
# ... اكتب الكود ...

# 5. Commit التغييرات
git add .
git commit -m "feat: add amazing feature"

# 6. ارفع الفرع
git push origin feature/my-amazing-feature

# 7. افتح Pull Request من GitHub
```

## 🛠 إعداد بيئة التطوير

```bash
# استنساخ المشروع
git clone https://github.com/Lord-shaban/lord-ai.git
cd lord-ai

# تشغيل خادم محلي
python -m http.server 8080
# أو
npx serve .

# افتح http://localhost:8080
```

> **ملاحظة:** لا يحتاج المشروع لأي تثبيت حزم — كل شيء Vanilla JS/CSS.

## 📝 أسلوب الكود

### JavaScript
- استخدم `var` بدلاً من `let`/`const` (للتوافقية مع المتصفحات القديمة)
- استخدم `function` بدلاً من Arrow Functions
- أضف تعليقات توضيحية للدوال المعقدة
- استخدم `'use strict'` دائماً

### CSS
- استخدم CSS Variables للألوان والقيم المتكررة
- اتبع تسمية BEM-like للـ Classes
- أضف تعليقات لكل قسم رئيسي
- تأكد من التجاوب مع جميع الشاشات

### HTML
- استخدم عناصر HTML5 الدلالية
- أضف `id` فريد لكل عنصر تفاعلي
- حافظ على بنية RTL/LTR

## 💬 رسائل الـ Commit

نستخدم [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: إضافة ميزة جديدة
fix: إصلاح مشكلة
docs: تحديث التوثيق
style: تغييرات تنسيقية (لا تؤثر على المنطق)
refactor: إعادة هيكلة الكود
perf: تحسين الأداء
test: إضافة أو تعديل اختبارات
chore: مهام صيانة عامة
```

### أمثلة:
```
feat: add music player volume control
fix: resolve Arabic text rendering in Safari
docs: update README with deployment guide
style: improve music player responsive layout
```

## 🔍 مراجعة الكود

كل Pull Request يجب أن:

- ✅ يعمل بدون أخطاء في Console
- ✅ متجاوب على الموبايل والديسكتوب
- ✅ يدعم الوضع الداكن والفاتح
- ✅ لا يكسر الميزات الموجودة
- ✅ يتضمن وصف واضح للتغييرات

---

<div align="center">

**شكراً لمساهمتك! 🙏**

كل مساهمة مهما كانت صغيرة تصنع فرقاً.

</div>
