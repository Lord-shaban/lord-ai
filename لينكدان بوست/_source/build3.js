// LORD AI — LinkedIn carousel v3 "editorial studio". Bilingual, screenshot-rich.
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, 'slides3');
fs.mkdirSync(OUT, { recursive: true });
const PROJ = 'c:/Users/miar4/Desktop/lord ai';
const shot = f => 'file:///' + (PROJ + '/assets/shots/' + f).replace(/ /g, '%20');
const W = 1080, H = 1350;

const GRAIN = "data:image/svg+xml," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --paper:#eef1ec;--ink:#f3f5f0;--mut:#9aa39c;--faint:#69726b;
  --bg:#080b0a;--acc:#4bbd9c;--acc-hi:#7ce4c4;--line:rgba(255,255,255,.09);
  --grad:linear-gradient(140deg,#84e8cd,#43a98f 55%,#215a4c);
}
html,body{width:${W}px;height:${H}px}
body{font-family:'Inter','Segoe UI',sans-serif;background:var(--bg);color:var(--ink);position:relative;overflow:hidden;
  -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
[dir="rtl"]{font-family:'IBM Plex Sans Arabic','Inter',sans-serif}
.bg{position:absolute;inset:0;z-index:0}
.base{background:radial-gradient(120% 80% at 82% 6%, #0e1613 0%, #080b0a 46%, #05100c 100%)}
.beam{background:radial-gradient(680px 520px at 100% 0%, rgba(75,189,156,.14), transparent 62%)}
.grain{background-image:url("${GRAIN}");background-size:180px 180px;opacity:.05;mix-blend-mode:overlay}
.mat{position:absolute;inset:42px;border:1px solid rgba(255,255,255,.08);z-index:5;pointer-events:none}
.cnr{position:absolute;width:15px;height:15px;z-index:6;border:0 solid rgba(124,228,196,.55);pointer-events:none}
.cnr.tl{top:35px;left:35px;border-top-width:1.5px;border-left-width:1.5px}
.cnr.tr{top:35px;right:35px;border-top-width:1.5px;border-right-width:1.5px}
.cnr.bl{bottom:35px;left:35px;border-bottom-width:1.5px;border-left-width:1.5px}
.cnr.br{bottom:35px;right:35px;border-bottom-width:1.5px;border-right-width:1.5px}
.frame{position:relative;z-index:3;width:${W}px;height:${H}px;padding:78px 76px;display:flex;flex-direction:column}
/* header / footer */
.hd{display:flex;align-items:center;justify-content:space-between}
[dir="rtl"] .hd{direction:ltr}
.bl{display:flex;align-items:center;gap:13px}
.lmk{width:34px;height:34px;border-radius:10px;background:var(--grad);display:flex;align-items:center;justify-content:center;
  font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:19px;color:#06130e;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.bn{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:17px;letter-spacing:.03em}
.lv{display:flex;align-items:center;gap:7px;margin-left:6px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.16em;color:var(--acc-hi)}
.lv i{width:7px;height:7px;border-radius:50%;background:var(--acc-hi);box-shadow:0 0 9px var(--acc-hi)}
.ix{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.12em;color:var(--faint)}
.ix b{color:var(--ink);font-weight:700}
.ft{display:flex;align-items:center;justify-content:space-between;padding-top:22px;margin-top:auto;position:relative}
[dir="rtl"] .ft{direction:ltr}
.ft::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(124,228,196,.35),rgba(255,255,255,.05),transparent)}
.ft span{font-family:'Space Mono',monospace;font-size:12.5px;letter-spacing:.04em;color:var(--faint)}
.ft b{color:var(--mut);font-weight:400}
/* type */
.kick{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.28em;color:var(--acc-hi);text-transform:uppercase;display:flex;align-items:center;gap:12px}
.kick::before{content:"";width:26px;height:1.5px;background:var(--acc-hi)}
[dir="rtl"] .kick{font-family:'IBM Plex Sans Arabic',sans-serif;font-weight:600;letter-spacing:.02em}
.disp{font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:-.03em;line-height:.98}
[dir="rtl"] .disp{font-family:'IBM Plex Sans Arabic',sans-serif;font-weight:700;letter-spacing:-.01em;line-height:1.18}
.ser{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;letter-spacing:0}
[dir="rtl"] .ser{font-family:'IBM Plex Sans Arabic',sans-serif;font-style:normal}
.acc{color:var(--acc-hi)}
.body{font-family:'Inter',sans-serif;color:#cdd4cd;font-weight:400}
[dir="rtl"] .body{font-family:'IBM Plex Sans Arabic',sans-serif;line-height:1.7}
.body b{color:#fff;font-weight:600}
.tags{display:flex;gap:10px;flex-wrap:wrap;font-family:'Space Mono',monospace}
[dir="rtl"] .tags{direction:rtl;font-family:'IBM Plex Sans Arabic',sans-serif}
.tag{font-size:13.5px;letter-spacing:.02em;color:#c4ccc5;border:1px solid var(--line);padding:9px 15px;border-radius:6px;background:rgba(255,255,255,.02)}
/* device chrome */
.win{border-radius:12px;overflow:hidden;background:#0a0e0d;border:1px solid rgba(255,255,255,.1);
  box-shadow:0 40px 80px rgba(0,0,0,.6),0 2px 0 rgba(255,255,255,.04) inset}
.wbar{height:34px;background:#0c1211;display:flex;align-items:center;gap:7px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.05)}
.wbar i{width:9px;height:9px;border-radius:50%;background:#28322e;display:block}
.wbar .u{margin-left:12px;font-family:'Space Mono',monospace;font-size:11px;color:#7c857e;letter-spacing:.02em}
[dir="rtl"] .wbar{direction:ltr}
.phone{border-radius:30px;padding:7px;background:#141c19;border:1px solid rgba(255,255,255,.09);
  box-shadow:0 40px 80px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.06)}
.phone .scr{border-radius:23px;overflow:hidden;background:#0a0e0d}
.phone .scr img{display:block;width:100%}
.cap{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.1em;color:var(--faint);text-transform:uppercase}
[dir="rtl"] .cap{font-family:'IBM Plex Sans Arabic',sans-serif;letter-spacing:0}
`;

// crop a screenshot: original ow×oh, show rect (x0,y0)->(x1,y1), rendered at pixel width Wpx.
function crop(file, ow, oh, x0, y0, x1, y1, Wpx, radius=10){
  const rw = x1 - x0, rh = y1 - y0, k = Wpx / rw;
  const box = Math.round(rh * k), iw = Math.round(ow * k);
  return `<div style="position:relative;width:${Wpx}px;height:${box}px;overflow:hidden;border-radius:${radius}px">
    <img src="${shot(file)}" style="position:absolute;width:${iw}px;left:${Math.round(-x0*k)}px;top:${Math.round(-y0*k)}px;display:block">
  </div>`;
}

function page(dir, inner, deco=true){
  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="bg base"></div><div class="bg beam"></div><div class="bg grain"></div>
${deco?'<div class="mat"></div><div class="cnr tl"></div><div class="cnr tr"></div><div class="cnr bl"></div><div class="cnr br"></div>':''}
${inner}</body></html>`;
}

function build(lang){
  const ar = lang==='ar';
  const dir = ar?'rtl':'ltr';
  const L = (en,arv)=>ar?arv:en;
  const header = n => `<div class="hd">
    <div class="bl"><span class="lmk">L</span><span class="bn">LORD AI</span><span class="lv"><i></i>LIVE</span></div>
    <div class="ix"><b>0${n}</b> / 07</div></div>`;
  const footer = `<div class="ft"><span>lord-ai.pages.dev</span><span><b>built by</b> Ahmed Sha'ban</span></div>`;

  // 1 — COVER
  const cover = page(dir, `<div class="frame">
    ${header(1)}
    <div style="margin-top:58px">
      <div class="kick">${L('AN AI THAT DOES MORE THAN TALK','ذكاء اصطناعي بيعمل أكتر من الكلام')}</div>
      <div class="disp" style="font-size:${ar?'90':'100'}px;margin-top:28px">
        ${L(`The conversation<br><span class="ser acc">is</span> the app.`,`المحادثة نفسها<br><span class="acc">هي</span> التطبيق.`)}</div>
      <div class="body" style="font-size:21px;line-height:1.55;margin-top:26px;max-width:600px">
        ${L(`<b>LORD AI</b> — an Arabic-first assistant. Chat, music, movies, and games, living in one thread.`,
             `<b>LORD AI</b> — مساعد عربي أول. محادثة وموسيقى وأفلام وألعاب، عايشين كلهم في محادثة واحدة.`)}</div>
    </div>
    <div class="win" style="position:absolute;${ar?'left':'right'}:56px;bottom:66px;width:806px;z-index:2">
      <div class="wbar"><i></i><i></i><i></i><span class="u">lord-ai.pages.dev</span></div>
      <img src="${shot('01-welcome-dark.png')}" style="display:block;width:100%">
    </div>
    <div class="phone" style="position:absolute;${ar?'right':'left'}:48px;bottom:26px;width:232px;z-index:3;transform:rotate(${ar?2:-2}deg)">
      <div class="scr"><img src="${shot('09-mobile-welcome.png')}"></div>
    </div>
  </div>`);

  // 2 — HOOK (pure type)
  const hook = page(dir, `<div class="frame">
    ${header(2)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div class="kick">${L('THE IDEA','الفكرة')}</div>
      <div class="disp" style="font-size:82px;margin-top:34px;line-height:1.04">
        ${L(`It doesn't just<br><span class="ser">talk.</span> It <span class="ser acc">plays.</span>`,
             `مش بس <span class="acc">بيتكلم.</span><br>ده بيشتغل <span class="acc">ويلعب.</span>`)}</div>
      <div class="body" style="font-size:27px;line-height:1.5;margin-top:40px;max-width:800px">
        ${L(`Every AI hands you words. This one hands you the whole experience — <b>music, movies, and real games</b>, right inside the chat.`,
             `كل ذكاء اصطناعي بيديك كلام. ده بيديك التجربة كاملة — <b>موسيقى وأفلام وألعاب حقيقية</b>، جوّه الشات مباشرة.`)}</div>
      <div class="body" style="font-size:20px;color:var(--faint);margin-top:22px">
        ${L('No tabs. No pop-ups. Nothing to install.','لا تابات. لا نوافذ. ولا حاجة تتنصّب.')}</div>
    </div>
    ${footer}
  </div>`);

  // 3 — INTERFACE (light theme + code on mobile; mirrors cover on opposite side)
  const iface = page(dir, `<div class="frame">
    ${header(3)}
    <div style="margin-top:58px">
      <div class="kick">${L('THE INTERFACE','الواجهة')}</div>
      <div class="disp" style="font-size:${ar?'58':'62'}px;margin-top:26px">${L('Designed like a product.','مصمّم زي منتج حقيقي.')}</div>
      <div class="body" style="font-size:21px;line-height:1.55;margin-top:24px;max-width:600px">
        ${L(`Light and dark, tuned for reading — Arabic prose and code alike. Every icon hand-drawn, not one emoji.`,
             `فاتح وغامق، مظبوط للقراءة — نص عربي وكود بنفس الراحة. وكل أيقونة مرسومة بالإيد، ولا إيموجي واحد.`)}</div>
    </div>
    <div class="win" style="position:absolute;${ar?'right':'left'}:56px;bottom:66px;width:806px;z-index:2;transform:rotate(${ar?-1:1}deg)">
      <div class="wbar"><i></i><i></i><i></i><span class="u">lord-ai.pages.dev</span></div>
      <img src="${shot('02-welcome-light.png')}" style="display:block;width:100%">
    </div>
    <div class="phone" style="position:absolute;${ar?'left':'right'}:48px;bottom:26px;width:232px;z-index:3;transform:rotate(${ar?-2:2}deg)">
      <div class="scr"><img src="${shot('10-mobile-chat.png')}"></div>
    </div>
  </div>`);

  // 4 — MEDIA (real music player)
  const media = page(dir, `<div class="frame">
    ${header(4)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div class="kick">${L('MUSIC & MOVIES','موسيقى وأفلام')}</div>
      <div class="disp" style="font-size:56px;margin-top:18px;line-height:1.05">
        ${L(`Ask for a song.<br>It <span class="ser acc">plays.</span>`,`اطلب أغنية.<br><span class="acc">تشتغل.</span>`)}</div>
      <div class="body" style="font-size:21px;line-height:1.5;margin-top:26px;max-width:760px">
        ${L(`A real player, built into the message — play, seek, download. Films stream the same way, right where you asked.`,
             `مشغّل حقيقي، مدمج في الرسالة — تشغيل، تنقّل، تحميل. والأفلام بتتفرّج بنفس الطريقة، في نفس المكان.`)}</div>
      <div style="margin-top:36px" class="win">
        <div class="wbar"><i></i><i></i><i></i><span class="u">lord-ai.pages.dev</span></div>
        ${crop('05-music-dark.png',2560,1600, 402,118, 1782,656, 928, 0)}
      </div>
    </div>
    ${footer}
  </div>`);

  // 5 — GAMES (real connect4 + gallery)
  const games = page(dir, `<div class="frame">
    ${header(5)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div class="kick">${L('PLAY IN THE CHAT','العب في الشات')}</div>
      <div class="disp" style="font-size:52px;margin-top:18px;line-height:1.06">
        ${L(`An arcade inside<br>a <span class="ser acc">chat box.</span>`,`صالة ألعاب جوّه<br><span class="acc">شباك شات.</span>`)}</div>
      <div style="margin-top:38px;display:flex;gap:20px;align-items:flex-start">
        <div class="win" style="width:552px">
          <div class="wbar"><i></i><i></i><i></i><span class="u">lord-ai.pages.dev</span></div>
          ${crop('07-game-connect4-dark.png',2560,1600, 428,556, 1566,1332, 552, 0)}
        </div>
        <div class="win" style="width:356px">
          <div class="wbar"><i></i><i></i><i></i><span class="u">games</span></div>
          ${crop('11-games-gallery.png',2360,1800, 468,74, 1904,1510, 356, 0)}
        </div>
      </div>
      <div class="body" style="font-size:20px;line-height:1.5;margin-top:30px;max-width:820px">
        ${L(`Tic-Tac-Toe, Tetris, Snake and more — or hand a friend a code and <b>play them live.</b>`,
             `إكس أو، تتريس، الثعبان وغيرهم — أو ادّي صاحبك كود و<b>العبوا لايف.</b>`)}</div>
    </div>
    ${footer}
  </div>`);

  // 6 — CRAFT
  const craft = page(dir, `<div class="frame">
    ${header(6)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div class="kick">${L('THE CRAFT','الصنعة')}</div>
      <div class="disp" style="font-size:62px;margin-top:20px;line-height:1.05">
        ${L(`Built by <span class="ser">hand.</span><br>No <span class="ser acc">shortcuts.</span>`,`متبني <span class="acc">بالإيد.</span><br>بدون <span class="acc">اختصارات.</span>`)}</div>
      <div class="body" style="font-size:23px;line-height:1.55;margin-top:32px;max-width:800px">
        ${L(`Pure JavaScript — no framework, no build step. Every screen, every motion, every icon. Steady enough that one free key quietly serves everyone.`,
             `جافاسكربت خام — بدون framework، بدون build. كل شاشة، كل حركة، كل أيقونة. وثابت لدرجة إن مفتاح مجاني واحد يخدم الكل بهدوء.`)}</div>
      <div class="tags" style="margin-top:40px">
        <span class="tag">Vanilla&nbsp;JS</span><span class="tag">Gemini</span><span class="tag">Firebase</span><span class="tag">Cloudflare&nbsp;Pages</span>
      </div>
    </div>
    ${footer}
  </div>`);

  // 7 — CTA
  const cta = page(dir, `<div class="frame">
    ${header(7)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:${ar?'flex-end':'flex-start'};text-align:${ar?'right':'left'}">
      <div class="lmk" style="width:74px;height:74px;border-radius:20px;font-size:40px;margin-bottom:36px">L</div>
      <div class="disp" style="font-size:74px;line-height:1.02">${L(`See it for <span class="ser acc">yourself.</span>`,`شوفه <span class="acc">بنفسك.</span>`)}</div>
      <div class="body" style="font-size:24px;line-height:1.5;margin-top:26px;max-width:720px">
        ${L(`It's live and open source. Go break it — then tell me what you'd build next.`,`الموقع شغّال ومفتوح المصدر. جرّبه وكسّره — وقوللي إنت كنت هتبني إيه بعده.`)}</div>
      <div style="display:flex;gap:14px;margin-top:40px;flex-wrap:wrap" class="tags">
        <span class="tag" style="font-size:17px;padding:14px 24px;border-color:rgba(124,228,196,.4);color:#dff5ee">→&nbsp;&nbsp;lord-ai.pages.dev</span>
        <span class="tag" style="font-size:14px;padding:14px 20px">github.com/Lord-shaban/lord-ai · MIT</span>
      </div>
    </div>
    ${footer}
  </div>`);

  return {'1-cover':cover,'2-hook':hook,'3-interface':iface,'4-media':media,'5-games':games,'6-craft':craft,'7-cta':cta};
}

for (const lang of ['en','ar']){
  const s = build(lang);
  for (const [k,html] of Object.entries(s)) fs.writeFileSync(path.join(OUT, `${lang}-${k}.html`), html);
}
console.log('wrote', fs.readdirSync(OUT).length, 'files');
