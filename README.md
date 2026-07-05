# LORD AI 🤖

<div align="center">

**مساعد ذكاء اصطناعي متقدم — واجهة دردشة احترافية مستوحاة من ChatGPT و Claude**

[![LORD AI](https://img.shields.io/badge/LORD_AI-v2.0-333333?style=for-the-badge&logo=robot&logoColor=white)](https://github.com/miar4/lord-ai)
[![License](https://img.shields.io/badge/License-MIT-444444?style=for-the-badge)](LICENSE)
[![Deploy](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Groq](https://img.shields.io/badge/Powered_by-Groq-555555?style=for-the-badge)](https://groq.com/)

</div>

---

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 🎨 **تصميم عصري** | تصميم رمادي أنيق مستوحى من ChatGPT 2026 مع وضع داكن/فاتح |
| 🤖 **ذكاء اصطناعي** | مدعوم بنموذج Llama 3.3 70B عبر Groq (سرعة فائقة) |
| 💬 **محادثات متعددة** | إنشاء وإدارة وحفظ محادثات منفصلة |
| ⚡ **ردود متدفقة** | عرض الردود بشكل تدريجي في الوقت الحقيقي (Streaming) |
| 🔄 **إعادة التوليد** | إعادة توليد آخر رد بضغطة زر واحدة |
| 📋 **نسخ سريع** | نسخ الردود والأكواد بضغطة واحدة |
| 📱 **متجاوب بالكامل** | يعمل على جميع الأجهزة (موبايل، تابلت، كمبيوتر) |
| 🎭 **Markdown** | دعم كامل للعناوين، القوائم، الأكواد، الجداول |
| 💾 **حفظ تلقائي** | حفظ جميع المحادثات محلياً في المتصفح |
| 🌐 **متعدد اللغات** | يرد تلقائياً بنفس لغة المستخدم |
| 🎯 **أنيميشن متقدمة** | تأثيرات حركية سلسة وعصرية |
| ⌨️ **اختصارات** | اختصارات لوحة مفاتيح للتنقل السريع |

## 🚀 البدء السريع

### تشغيل محلياً

```bash
# استنسخ المشروع
git clone https://github.com/miar4/lord-ai.git
cd lord-ai

# افتح في المتصفح
# يمكنك فتح index.html مباشرة أو استخدام خادم محلي:
npx serve .
```

> **ملاحظة:** لا يحتاج المشروع لأي تثبيت أو بناء — افتح `index.html` مباشرة!

## ☁️ النشر على Cloudflare Pages

1. ارفع المشروع على GitHub
2. اذهب إلى [Cloudflare Pages](https://pages.cloudflare.com/)
3. اختر **Create a project** → **Connect to Git**
4. اختر مستودع `lord-ai`
5. الإعدادات:
   - **Build command**: *(اتركه فارغاً)*
   - **Build output directory**: `/`
6. اضغط **Save and Deploy** ✅

## 📁 هيكل المشروع

```
lord-ai/
├── index.html      # الصفحة الرئيسية
├── style.css       # التصميم (نظام تصميم كامل مع Dark/Light)
├── app.js          # منطق التطبيق (API, Streaming, Markdown)
├── README.md       # التوثيق
├── LICENSE         # رخصة MIT
└── .gitignore      # ملفات مستبعدة من Git
```

## 🛠️ التقنيات المستخدمة

- **HTML5** — هيكل صفحة دلالي (Semantic)
- **CSS3** — متغيرات CSS، أنيميشن، تصميم متجاوب، وضع داكن/فاتح
- **JavaScript (Vanilla)** — بدون أي مكتبات خارجية
- **Groq API** — نموذج Llama 3.3 70B عبر Groq Cloud (سرعة فائقة)
- **Google Fonts** — Inter, Noto Sans Arabic, JetBrains Mono

## ⌨️ اختصارات لوحة المفاتيح

| الاختصار | الوظيفة |
|----------|---------|
| `Enter` | إرسال الرسالة |
| `Shift + Enter` | سطر جديد |
| `Ctrl + Shift + N` | محادثة جديدة |
| `/` | تركيز حقل الإدخال |
| `Escape` | إغلاق القائمة الجانبية |

## 🎨 لقطات الشاشة

<div align="center">

| الوضع المظلم | الوضع الفاتح |
|:---:|:---:|
| 🌙 تصميم داكن أنيق | ☀️ تصميم فاتح نظيف |

</div>

## 📄 الرخصة

هذا المشروع مرخص تحت [رخصة MIT](LICENSE). يمكنك استخدامه، تعديله، وتوزيعه بحرية.

## 🤝 المساهمة

المساهمات مرحب بها! يمكنك:
1. عمل Fork للمشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. عمل Commit للتغييرات (`git commit -m 'إضافة ميزة رائعة'`)
4. رفع الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

<div align="center">

صنع بـ ❤️ بواسطة **LORD AI Team**

⭐ **إذا أعجبك المشروع، لا تنسَ إعطاء نجمة!** ⭐

</div>
