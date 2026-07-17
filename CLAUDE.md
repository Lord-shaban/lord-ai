# CLAUDE.md — LORD AI

مساعد ذكاء اصطناعي عربي (شات) بواجهة RTL، بيشغّل موسيقى وأفلام وألعاب جوه الشات. صفحة مستخدم + صفحة أدمن للتحليلات.

## Stack & هيكل المشروع
- **Vanilla JS، بدون build/framework/npm.** ملفات ثابتة تتفتح مباشرة في المتصفح.
- **الردود بالعربي** للمستخدم (هو مصري، بيفضّل العامية). التعليقات في الكود بالإنجليزي.
- الملفات الأساسية:
  - `index.html` — واجهة الشات (RTL). Firebase compat SDK + firebase-config.js + app.js في الآخر.
  - `app.js` — **كل منطق الشات** (~2700 سطر، IIFE واحد `(function(){...})()`، `'use strict'`). كل شيء هنا.
  - `games.js` — **موديول الألعاب داخل الشات** (مستقل، يُحمَّل قبل app.js). **مفيش مودال** — الألعاب تترندر جوه رسائل الشات كـ`.game-frame` (زي مشغل الموسيقى). يعرّف `window.LordGames = {list, match, mount, mountJoin, sweep, hubFrameHTML, posterFrameHTML, joinFrameHTML, normalizeCode, hasNet, copyCode}`.
    - **15 لعبة سولو**: إكس أو (minimax)، أربعة في صف (AI heuristic: اكسب/بلوك/تجنب الهدية)، حجر ورقة مقص، الذاكرة، سايمون (بأصوات WebAudio)، ذاكرة الأرقام، رد الفعل، سباق الحساب، الثعبان، 2048، تتريس (rotation + kicks + next preview)، كسر الطوب، اضرب الخلد، الطير النطاط، كاسحة الألغام. كل starter يرجع `{destroy}`؛ `sweep()` يدمّر أي لعبة إطارها اتشال من الـDOM (renderChat يناديها قبل كل rerender).
    - **قواعد بصرية (طلب المستخدم الصريح)**: **ممنوع الإيموجي في UI الألعاب** — كل الأيقونات SVG مخصوصة من خريطة `ICONS` + `ic()`، أشكال الذاكرة `MEM_SHAPES` SVG، الخلد/العصفورة مرسومين (SVG/canvas)، الستاتس نص + كلاس (`gm-status.ok/.bad`) عبر `stat()`.
    - **RTL fix حرج**: كل اللوحات وأزرار التحكم مفروض عليها `direction:ltr` في CSS (قاعدة مجمّعة في style.css) — من غيرها أزرار ◀/▶ بتنعكس لأن الصفحة RTL. أي لعبة جديدة لازم تدخل القاعدة دي.
    - **تحكم موبايل**: `bindHold()` (ضغط مستمر) لأزرار الثعبان/تتريس، إيماءات على كانفاس تتريس (سحب أفقي = تحريك، نقرة = لف، سحب سريع لتحت = إسقاط)، لمس الكانفاس يبدأ اللعبة (ثعبان/عصفورة)، كسر الطوب بيتحكم فيه من كل الـgf-body، ضغطة مطوّلة = علم في الألغام.
    - **أونلاين (إكس أو / أربعة في صف / حجر ورقة مقص)**: Firestore collection `lord_rooms` — doc واحد صغير لكل روم (كود شكله `G-ABCD`، حروف بدون 0/O/1/I). host ينشئ → guest يكتب الكود في شات موقعه → `onSnapshot` يزامن الحالة (turn-based، الحالة كلها في حقل `st`). سباق rps المتزامن يحلّه الـhost (`res === rnd`). لو قواعد Firestore منعت الكتابة على `lord_rooms` هتظهر رسالة خطأ نظيفة — راجع الـrules عند الحاجة.
  - `style.css` — التصميم. نظام ألوان "Calm Sage" (أخضر `--accent`)، ثيم فاتح/غامق عبر `data-theme` على `<html>`، متغيرات CSS في `:root` و`[data-theme="dark"]`.
  - `x7admin.html` — لوحة الأدمن (HTML+CSS+JS مضمّنين، مستقلة تمامًا عن app.js). باسورد: `lord2026` (في firebase-config.js كـ `ADMIN_PASSWORD`).
  - `firebase-config.js` — إعدادات Firebase + باسورد الأدمن. (المفاتيح مقسّمة نصيًا بالقصد.)
  - `assets/music/` — ملفات mp3 (تُرفع على R2؛ راجع "الميديا").

## API (الذكاء الاصطناعي)
- Gemini عبر endpoint متوافق مع OpenAI: `API_URL` = generativelanguage…/openai/chat/completions
- `MODEL = 'gemini-3.1-flash-lite'`، streaming (SSE، `data: ` lines).
- **مصفوفة مفاتيح `API_KEYS`** (مقسّمة نصيًا بالقصد): أي 429/quota على مفتاح → `rotateKey()` وإعادة المحاولة فورًا بالمفتاح التالي بشفافية (مرة واحدة لكل مفتاح إضافي)، وآخر مفتاح شغال محفوظ في `lord_key_i` فالجلسات الجاية تبدأ بيه. **شرط مهم**: المفاتيح لازم تكون من مشاريع Google مختلفة (الكوتا المجانية بتتحسب على المشروع). الكول-داون المحلي (30ث) لا يتفعّل إلا لو كل المفاتيح استنفدت.
- `callAPI(msgs)` يبني الرسائل، `readStream()` يقرأ البث ويعمل render تدريجي.

## توفير التوكنز (مهم — تم تحسينه)
البرومبت **modular**: `CORE_PROMPT` مضغوط ومرقّم (قواعد ملزمة + قسم "أدوات الموقع" يمنع كشف التاجات) يُرسل دائمًا، و`buildSystemPrompt` يحقن تاريخ اليوم (سياق حي). أدلة الموسيقى/الأفلام **ثقيلة وتُلحق فقط عند الحاجة**:
- `buildSystemPrompt(recent)` يفحص آخر 6 رسائل: كلمات مفتاحية للمستخدم (`MUSIC_RE`/`MOVIE_RE`) أو تاجات `[MUSIC:]/[MOVIE:]/[PLAYLIST:]` في ردود سابقة → يلحق `musicGuide()`/`movieGuide()`.
- `musicGuide()`/`movieGuide()` **تتولّد تلقائيًا من مصفوفتي MUSIC/MOVIES** (cached). أي أغنية/فيلم جديد يُعرف تلقائيًا بدون تعديل البرومبت.
- `callAPI`: يرسل آخر `MAX_HISTORY=16` رسالة فقط، يقصّ الرسائل الأطول من `MAX_MSG_CHARS=6000`، ويتخطّى رسائل الأخطاء المخزّنة (تبدأ بـ ⚠️/⏳).
- **ليميتر لكل مستخدم** (مفتاح جوجل المجاني مشترك: 15 RPM / 500 RPD للموقع كله): `RL_PER_MIN=4` و`RL_PER_DAY=40` لكل متصفح (ثوابت سهلة التعديل جنب `MAX_HISTORY`). الحالة في `lord_rl` (تتصفّر بعد منتصف الليل المحلي). `rlGate()` يحرس `send()` و`regen` — الحظر = توست فقط والنص يفضل في الصندوق؛ تحذير عند آخر 5 رسائل. `rlBump()` جوه `callAPI` يعدّ كل طلب فعلي. `aiAutoTitle` يتخطى نفسه لو الرصيد < 8 (`rlHeadroom`). أي 429 حقيقي من جوجل → `rlCoolUntil` كول-داون 30 ثانية. أول حظر من كل نوع يوميًا يتسجل في Analytics كـ`rl_block_min/day` (يظهر في أخطاء الأدمن).
- **لا ترجع لبرومبت واحد ضخم.** لو أضفت قواعد، حطها في CORE (لو دايمة) أو في الدليل المناسب (لو خاصة بالميديا).

## الميديا (موسيقى/أفلام) — R2
- `MUSIC` (88) و`MOVIES` (56) مصفوفتان في أول app.js. كل عنصر: `{id, name, file, artist/genre, tags}`.
- **الموسيقى كلها على Cloudflare R2**: `var R2 = 'https://pub-2021705f66434f5da4babc84df1667a7.r2.dev/'`؛ `file: R2 + 'اسم-نظيف.mp3'`.
- **قاعدة تسمية الملفات (صارمة):** kebab-case إنجليزي فقط، بلا عربي/مسافات/أقواس/رموز — عشان روابط R2 ما تتعطلش. النمط: `artist-song.mp3` (مثال: `cairokee-roma.mp3`).
- **⚠️ Workflow عند إضافة أغاني:** (1) أعِد تسمية ملفات `assets/music/` لأسماء نظيفة عبر سكربت Node يطابق substring فريد، (2) أضِف عناصر للكتالوج بروابط R2، (3) **المستخدم لازم يرفع الملفات على R2 يدويًا** — لحد ما يرفع، الأغاني الجديدة ما تشتغلش.
- الأفلام: Google Drive أو YouTube (embed)، مش على R2.
- التاجات في ردود الـAI: `[MUSIC:اسم]`، `[PLAYLIST:عنوان|...]`، `[MOVIE:اسم]`، `[GAME:اسم]` (بوستر لعبة داخل الشات)، `[GAMEHUB]` (شبكة كل الألعاب داخل الشات)، `[GAMEJOIN:G-XXXX]` (انضمام لروم — يولده `send()` محليًا)، `[SUGGEST:س1|س2|س3]`. `md()` يحوّلها لمشغّلات/إطارات. المطابقة عبر `matchMusic()`/`matchMovie()`/`LordGames.match()`.
- **رسائل محلية**: رسائل الهَب/الانضمام تتخزن بـ`local:true` → `callAPI` يتخطاها، و`msgHTML` لا يعرض لها شريط أكشنز. كتابة كود روم (`G-ABCD`) في الشات يعترضها `send()` وينضم فورًا بدون نداء API.

## ميزات UX (متبنية على ChatGPT/Claude 2026)
- **Command Palette** (Ctrl+K): بحث في المحادثات + full-text داخل الرسائل + أوامر سريعة.
- **Personalize** (Custom Instructions): اسم/معلومات/أسلوب المستخدم → تُحقن في البرومبت. مخزّنة في `lord_custom`.
- **أنماط الرد**: شرائح مختصر/متوازن/مفصّل تحت المدخل (`lord_style`) → تعدّل البرومبت.
- **عناوين ذكية**: `aiAutoTitle()` يطلب عنوان قصير من الـAI بعد أول رد (fire-and-forget).
- **تثبيت محادثات** (pin)، **تراجع عن الحذف** (`toastUndo`)، **اقتباس النص المحدّد** (quote popover)، **سكرول ذكي أثناء البث** (`stickBottom`)، زر نسخ لرسائل المستخدم.
- **بلايليست**: panel عائم، تشغيل/تكرار، `plHiddenAudio` للأغاني غير الظاهرة. حالة في `lord_playlist`.
- i18n عربي/إنجليزي عبر `I18N`/`t()` وattributes `data-ar`/`data-en`. Voice input عبر Web Speech.
- **توب بار مبسّط** (4 أزرار فقط): بحث، ألعاب، ثيم، وقائمة **⋯** (`#moreMenu`) فيها: محادثة مؤقتة/تخصيص/لغة/حجم خط/تصدير/اختصارات — بأسماء ظاهرة بدل أيقونات كثيرة.
- **ألعاب داخل الشات** (Ctrl+G / زر 🎮 / كارت الترحيب / أوامر الـpalette → `openGamesHub()` يضيف رسالة `[GAMEHUB]` محلية): كل شيء يلعب inline، تفاصيل فوق.
- **محادثة مؤقتة** (👻 من قائمة ⋯): `c.temp = true` → `saveAll()` لا يحفظها أبدًا، بانر في الشات، أيقونة 👻 في القائمة. تختفي مع إغلاق الصفحة.
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
- **أداء**: كل السكربتات `defer` + preconnect للـAPI/Firebase/R2، خطوط Google مقلّمة (بدون Lora/أوزان 300)، `content-visibility:auto` على `.msg`، debounce لبحث الـpalette، throttle 30ms لرندر البث. حافظ عليها.
- **UI مريح أولًا**: المستخدم رفض ازدحام التوب بار — أي زر جديد يروح لقائمة ⋯ أو الـpalette، مش أيقونة جديدة في الهيدر.

## حالة العمل (آخر سيشن)
اكتمل (لسه **بدون commit** — المستخدم لم يطلب): سيشن مزدوج كبير:
1. **إعادة تصميم الألعاب premium**: canvas بجودة DPR (`fitCanvas`)، تدرجات/توهج/ghost piece في تتريس، كونفيتي `burst()` عند الفوز، ثيمات لكل لعبة عبر `data-active` + `--gc*`، خلفيات صور اختيارية (Picsum مع fallback). **إصلاح باجين حقيقيين**: تتريس كان بيكسر عند الفتح (board undefined)، وكونكت-4 مكانتش بتفتح أصلًا (`matchGame('c4')` كان null — اتصلح بـpass 0 يطابق الـid). ملف `games-preview.html` للمعاينة السريعة (آمن للحذف).
2. **تجديد شامل لديزاين الموقع "Calm Sage Evolved"** (الخطة في `~/.claude/plans/sunny-riding-wombat.md`): توكنز جديدة فاتح/غامق (accent `#337e6d`/`#5cb8a0`، `--grad` بقى gradient حقيقي، `--on-accent`، أحمر واحد `--red-rgb/--red-soft`، `--accent-ink`)، **سلم z-index مُرمَّز** (توست فوق المودالات — كان باج)، **safe-area** كامل للآيفون (`--safe-t/--safe-b` + viewport-fit=cover)، توب بار **زجاجي absolute** والمحتوى بيسكرول تحته (`.main > .chat-area{padding-top}`)، سايدبار premium بزر CTA متدرج وأهداف لمس 26×26، ويلكم جديد (`.welcome-mark` بدل orb + كروت بثيمات `pc-*` وstagger)، كومبوزر مرفوع + شرائح أسلوب segmented، كروت أخطاء `.msg-error` بدل نص ⚠️.
3. **إزالة كل الإيموجي من الواجهة** → أيقونات SVG: خريطة `ICONS` + `icon(n,s)` في app.js (مستقلة عن games.js)، `toast(msg, iconName)`، تنظيف قاموس `t()`، أيقونات `mi-ico` في index.html. **عقد محفوظ**: بادئات `⚠️/⏳` في *التخزين* كما هي (فلتر `/^[⚠⏳]/` في callAPI + توافق المحادثات القديمة) — العرض فقط بينظفها (msgHTML → `.msg-error`، itemHTML بيشيل بادئات العناوين القديمة `🎮/👻/📌`).
- كل الاختبارات ناجحة: smoke ألعاب 15/15، deep 3/3، integration jsdom للتطبيق 9/9 + rate-limiter 12/12 + key-failover 6/6 (صفر أخطاء)، auditالإيموجي = الناجين المسموحين فقط، قسم الألعاب في style.css **مالمسوش** (git diff نظيف).
4. **ليميتر + مجمع مفاتيح**: `API_KEYS[]` (3 مفاتيح، failover تلقائي على 429، آخر مفتاح شغال في `lord_key_i`)، وليميتر لكل مستخدم `RL_PER_MIN=4`/`RL_PER_DAY=40` في `lord_rl`. تفاصيل في قسم API.
5. **تجديد الريدمي بالكامل**: بانر بستايل تيرمنال (`assets/banner.svg` — نافذة terminal + wordmark متدرج، بدّل `banner.png` المحذوف)، لقطات جديدة (`assets/shots/01..11`، اتحذفت القديمة)، مخطط mermaid لمسار الطلب، أرقام مضبوطة (88 أغنية/56 فيلم/18 لعبة)، وترحيل ذكر Gemini بدل Llama/Groq. CHANGELOG اتضاف له إصدار [3.0.0]. **طريقة اللقطات**: puppeteer-core + Chrome النظام (`C:\Program Files\Google\Chrome`) في scratchpad — يزرع محادثات ديمو في localStorage ويصوّر الواجهة الحقيقية فاتح/غامق/موبايل.
- تذكيرات مفتوحة: رفع ملفات R2، قواعد Firestore لـ`lord_rooms`، تجديد `x7admin.html` بنفس الهوية في سيشن قادم، ومعاينة المستخدم في المتصفح (فاتح/غامق/موبايل).
