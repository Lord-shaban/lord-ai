# CLAUDE.md — LORD AI

مساعد ذكاء اصطناعي عربي (شات) بواجهة RTL، بيشغّل موسيقى وأفلام وألعاب جوه الشات. صفحة مستخدم + صفحة أدمن للتحليلات.

## Stack & هيكل المشروع
- **Vanilla JS، بدون build/framework/npm.** ملفات ثابتة تتفتح مباشرة في المتصفح.
- **الردود بالعربي** للمستخدم (هو مصري، بيفضّل العامية). التعليقات في الكود بالإنجليزي.
- الملفات الأساسية:
  - `index.html` — واجهة الشات (RTL). Firebase compat SDK + firebase-config.js + app.js في الآخر.
  - `app.js` — **كل منطق الشات** (~2700 سطر، IIFE واحد `(function(){...})()`، `'use strict'`). كل شيء هنا.
  - `games.js` — **موديول الألعاب** (مستقل، يُحمَّل قبل app.js). يعرّف `window.LordGames = {list, open, match}`. 6 ألعاب: إكس أو (minimax)، الثعبان (canvas)، الذاكرة، 2048، حجر ورقة مقص، رد الفعل. نتائج/أرقام قياسية في `lord_games_v1`. app.js يتكامل معه عبر تاج `[GAME:اسم]` (يرندر كارت تشغيل في `md()`) و`GAME_RE`/`gamesGuide()` في البرومبت و`LORD.openGame`/`LORD.trackGame`.
  - `style.css` — التصميم. نظام ألوان "Calm Sage" (أخضر `--accent`)، ثيم فاتح/غامق عبر `data-theme` على `<html>`، متغيرات CSS في `:root` و`[data-theme="dark"]`.
  - `x7admin.html` — لوحة الأدمن (HTML+CSS+JS مضمّنين، مستقلة تمامًا عن app.js). باسورد: `lord2026` (في firebase-config.js كـ `ADMIN_PASSWORD`).
  - `firebase-config.js` — إعدادات Firebase + باسورد الأدمن. (المفاتيح مقسّمة نصيًا بالقصد.)
  - `assets/music/` — ملفات mp3 (تُرفع على R2؛ راجع "الميديا").

## API (الذكاء الاصطناعي)
- Gemini عبر endpoint متوافق مع OpenAI: `API_URL` = generativelanguage…/openai/chat/completions
- `MODEL = 'gemini-3.1-flash-lite'`، streaming (SSE، `data: ` lines)، `API_KEY` مقسّم نصيًا في app.js.
- `callAPI(msgs)` يبني الرسائل، `readStream()` يقرأ البث ويعمل render تدريجي.

## توفير التوكنز (مهم — تم تحسينه)
البرومبت **modular**: `CORE_PROMPT` صغير (~950 حرف) يُرسل دائمًا. أدلة الموسيقى/الأفلام **ثقيلة وتُلحق فقط عند الحاجة**:
- `buildSystemPrompt(recent)` يفحص آخر 6 رسائل: كلمات مفتاحية للمستخدم (`MUSIC_RE`/`MOVIE_RE`) أو تاجات `[MUSIC:]/[MOVIE:]/[PLAYLIST:]` في ردود سابقة → يلحق `musicGuide()`/`movieGuide()`.
- `musicGuide()`/`movieGuide()` **تتولّد تلقائيًا من مصفوفتي MUSIC/MOVIES** (cached). أي أغنية/فيلم جديد يُعرف تلقائيًا بدون تعديل البرومبت.
- `callAPI`: يرسل آخر `MAX_HISTORY=16` رسالة فقط، يقصّ الرسائل الأطول من `MAX_MSG_CHARS=6000`، ويتخطّى رسائل الأخطاء المخزّنة (تبدأ بـ ⚠️/⏳).
- **لا ترجع لبرومبت واحد ضخم.** لو أضفت قواعد، حطها في CORE (لو دايمة) أو في الدليل المناسب (لو خاصة بالميديا).

## الميديا (موسيقى/أفلام) — R2
- `MUSIC` (88) و`MOVIES` (56) مصفوفتان في أول app.js. كل عنصر: `{id, name, file, artist/genre, tags}`.
- **الموسيقى كلها على Cloudflare R2**: `var R2 = 'https://pub-2021705f66434f5da4babc84df1667a7.r2.dev/'`؛ `file: R2 + 'اسم-نظيف.mp3'`.
- **قاعدة تسمية الملفات (صارمة):** kebab-case إنجليزي فقط، بلا عربي/مسافات/أقواس/رموز — عشان روابط R2 ما تتعطلش. النمط: `artist-song.mp3` (مثال: `cairokee-roma.mp3`).
- **⚠️ Workflow عند إضافة أغاني:** (1) أعِد تسمية ملفات `assets/music/` لأسماء نظيفة عبر سكربت Node يطابق substring فريد، (2) أضِف عناصر للكتالوج بروابط R2، (3) **المستخدم لازم يرفع الملفات على R2 يدويًا** — لحد ما يرفع، الأغاني الجديدة ما تشتغلش.
- الأفلام: Google Drive أو YouTube (embed)، مش على R2.
- التاجات في ردود الـAI: `[MUSIC:اسم]`، `[PLAYLIST:عنوان|أغنية1|أغنية2]`، `[MOVIE:اسم]`، `[GAME:اسم]`، `[SUGGEST:س1|س2|س3]` (أسئلة متابعة → شرائح تحت آخر رد فقط). `md()` يحوّلها لمشغّلات/كروت. المطابقة عبر `matchMusic()`/`matchMovie()`/`LordGames.match()` (substring، الاتجاهين).

## ميزات UX (متبنية على ChatGPT/Claude 2026)
- **Command Palette** (Ctrl+K): بحث في المحادثات + full-text داخل الرسائل + أوامر سريعة.
- **Personalize** (Custom Instructions): اسم/معلومات/أسلوب المستخدم → تُحقن في البرومبت. مخزّنة في `lord_custom`.
- **أنماط الرد**: شرائح مختصر/متوازن/مفصّل تحت المدخل (`lord_style`) → تعدّل البرومبت.
- **عناوين ذكية**: `aiAutoTitle()` يطلب عنوان قصير من الـAI بعد أول رد (fire-and-forget).
- **تثبيت محادثات** (pin)، **تراجع عن الحذف** (`toastUndo`)، **اقتباس النص المحدّد** (quote popover)، **سكرول ذكي أثناء البث** (`stickBottom`)، زر نسخ لرسائل المستخدم.
- **بلايليست**: panel عائم، تشغيل/تكرار، `plHiddenAudio` للأغاني غير الظاهرة. حالة في `lord_playlist`.
- i18n عربي/إنجليزي عبر `I18N`/`t()` وattributes `data-ar`/`data-en`. Voice input عبر Web Speech.
- **ألعاب** (Ctrl+G / زر 🎮 / كارت في الترحيب / تاج `[GAME:]` من الـAI): hub في games.js، تفاصيل فوق.
- **محادثة مؤقتة** (👻 زر في التوب بار): `c.temp = true` → `saveAll()` لا يحفظها أبدًا، بانر في الشات، أيقونة 👻 في القائمة. تختفي مع إغلاق الصفحة.
- **اقتراحات متابعة**: تاج `[SUGGEST:]` في CORE_PROMPT → شرائح قابلة للضغط تحت آخر رد (CSS يخفيها عن الردود الأقدم).
- **Syntax highlighting**: `hl()` في app.js (comments/strings placeholders أولًا ثم keywords/numbers/functions) — عائلات: c-like/hash/sql/html/css. ألوان عبر `--tok-*`.
- **حجم الخط**: 3 مستويات (`lord_fontsize` → كلاس `fs-sm`/`fs-lg` على `<html>`) من الـpalette. + **نسخ المحادثة** (duplicate) من الـpalette.

## Firebase Analytics
- Firestore، collection `lord_logs`. project: `lordai-cc805`. `fbLog(action, data)` من app.js.
- أنواع الأحداث: `visit` (مع loadMs/net/ref)، `msg` (role/words/mlang/rt)، `error`، `feedback` (val ±1)، **`missing`** (طلب غير متوفر: kind/q)، **`media`** (تشغيل: kind/name)، **`game`** (لعب: name).
- **تتبّع الطلبات الناقصة**: الـAI يضيف تاج داخلي `[NOTFOUND:music|movie|game:اسم]` (يُخفى من العرض في `md()`)، و`logMissingFromReply()` يسجّله + يرصد أي تاج ميديا/لعبة فاشل. يُستدعى مرة واحدة عند اكتمال الرد.

## لوحة الأدمن — توفير reads (تم تحسينه، مهم)
كانت تحرق reads بشراهة (limit 5000 كل دقيقتين). الحل الحالي في x7admin.html:
- **كاش localStorage** (`lord_admin_cache_v1`) — يظهر فورًا بصفر reads.
- **Delta fetch**: كل تحديث يجيب فقط `where('t','>', أحدث وقت مخزّن)`. أول تحميل `FIRST_LIMIT=1500`، بعدها deltas صغيرة.
- تحديث تلقائي كل 3 دقائق، **يتوقف لما التاب مخفي** (`document.hidden`)، ويحدّث عند العودة.
- عدّاد "قراءات الجلسة" ظاهر. زر "🧹 تحديث كامل" يمسح الكاش. Fallback لجلب كامل لو تراكمت فجوة > `DELTA_LIMIT`.
- الأقسام: 12 KPI، الطلبات الناقصة (بأولوية)، نشاط 14 يوم، أكثر تشغيلًا (أغاني/أفلام/ألعاب)، ساعات النشاط، أداء، تقييمات، لغات، أجهزة، مصادر زيارات، أخطاء، مستخدمون. بحث + فلاتر زمنية + تصدير JSON/CSV.

## قواعد وعادات
- **التحقق دائمًا**: `node --check app.js` بعد أي تعديل. لسكربت الأدمن: استخرج الـ`<script>` وافحصه.
- عند تعديلات كبيرة على app.js استخدم سكربت Node في scratchpad (splice/rename) بدل عشرات الـedits.
- **escape دائمًا** لأي بيانات مستخدم معروضة في الأدمن (`esc()`) — حماية XSS.
- كل حالة المستخدم في localStorage بمفتاح `lord_*` (convs/active/theme/lang/playlist/pl_repeat/custom/style/visitor_id/fontsize/games_v1).
- IIFE واحد + `var` + دوال عادية (بدون ES modules/arrow-heavy). حافظ على الأسلوب ده.

## حالة العمل (آخر سيشن)
اكتمل ومتحقق منه (لسه **بدون commit** — المستخدم لم يطلب commit بعد): كل اللي فات + سيشن الألعاب/UX: games.js (6 ألعاب + hub)، تاجات `[GAME:]`/`[SUGGEST:]`، محادثة مؤقتة 👻، syntax highlighting، حجم خط، نسخ محادثة، حدث `game` في الأدمن + قسم "الألعاب الأكثر لعبًا". تذكيرات مفتوحة للمستخدم: رفع ملفات R2 الجديدة، واحتمال حذف mp3 المحلية بعد الرفع.
