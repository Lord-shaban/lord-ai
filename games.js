/* ═══════════════════════════════════════════════════════════
   LORD AI — Games (inline-in-chat system)
   Games render INSIDE chat messages as .game-frame blocks:
   - [GAMEHUB]      → hub grid (solo + online sections)
   - [GAME:name]    → poster → click mounts the game in place
   - [GAMEJOIN:G-X] → joins an online room by code
   Online multiplayer (XO / Connect-4 / RPS) rides on Firestore
   ('lord_rooms' collection, one tiny doc per room, onSnapshot).
   Visuals: custom SVG icons only (no emojis), LTR boards/controls.
   Exposes window.LordGames — app.js calls it from md()/send().
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ═══════ HELPERS ═══════ */
    function lang() {
        try { return JSON.parse(localStorage.getItem('lord_lang')) === 'en' ? 'en' : 'ar'; }
        catch (e) { return 'ar'; }
    }
    function gt(ar, en) { return lang() === 'en' ? en : ar; }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }
    function rnd(n) { return Math.floor(Math.random() * n); }
    function cssVar(name, fallback) {
        var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    }
    function isDark() {
        return (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    }
    function vid() {
        try { return JSON.parse(localStorage.getItem('lord_visitor_id')) || ('v' + Date.now()); }
        catch (e) { return 'v' + Date.now(); }
    }
    function gToast(msg) {
        var old = document.querySelector('.toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.className = 'toast show';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 2000);
    }
    /* status line with a state color: '' (info) | 'ok' | 'bad' */
    function stat(el, text, kind) {
        el.textContent = text;
        el.className = 'gm-status' + (kind ? ' ' + kind : '');
    }
    /* press-and-hold repeat for control buttons (mobile-friendly) */
    function bindHold(btn, fn, firstDelay, repeatEvery) {
        var t = null, iv = null;
        function stop() {
            if (t) { clearTimeout(t); t = null; }
            if (iv) { clearInterval(iv); iv = null; }
        }
        btn.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            fn();
            stop();
            t = setTimeout(function () { iv = setInterval(fn, repeatEvery || 85); }, firstDelay || 280);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
            btn.addEventListener(ev, stop);
        });
    }

    /* tiny sfx — WebAudio beeps, no assets needed */
    var audioCtx = null;
    function beep(freq, dur, type, vol) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.type = type || 'sine';
            o.frequency.value = freq;
            o.connect(g);
            g.connect(audioCtx.destination);
            var t0 = audioCtx.currentTime;
            g.gain.setValueAtTime(vol || 0.06, t0);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + (dur || 0.15));
            o.start(t0);
            o.stop(t0 + (dur || 0.15));
        } catch (e) { }
    }

    /* ═══════ SVG ICON SYSTEM (no emojis) ═══════ */
    var ICONS = {
        hub: '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15.2" cy="13.2" r=".6" fill="currentColor"/><circle cx="17.8" cy="10.8" r=".6" fill="currentColor"/><path d="M17.3 6H6.7a4 4 0 0 0-4 3.6C2.6 10.4 2 14.5 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.4-1.4a2 2 0 0 1 1.4-.6h4.4a2 2 0 0 1 1.4.6L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.5-.6-5.6-.7-6.4a4 4 0 0 0-4-3.6z"/>',
        xo: '<path d="M4 4l6 6M10 4l-6 6"/><circle cx="17" cy="17" r="3.6"/>',
        c4: '<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="18" r="2" fill="currentColor"/><circle cx="12" cy="18" r="2" fill="currentColor"/><circle cx="18" cy="18" r="2"/>',
        rps: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
        memory: '<rect x="3" y="3" width="12" height="15" rx="2"/><path d="M9 21h8a2 2 0 0 0 2-2V8"/><path d="M9 8.6a2 2 0 1 1 2.7 1.9c-.4.15-.7.5-.7.9v.1"/><line x1="11" y1="14" x2="11" y2="14.01"/>',
        simon: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/>',
        digits: '<rect x="3" y="4" width="18" height="16" rx="3"/><text x="12" y="15.5" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">123</text>',
        reaction: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        math: '<line x1="7" y1="4" x2="7" y2="10"/><line x1="4" y1="7" x2="10" y2="7"/><line x1="14.5" y1="4.5" x2="19.5" y2="9.5"/><line x1="19.5" y1="4.5" x2="14.5" y2="9.5"/><line x1="4" y1="15.5" x2="10" y2="15.5"/><line x1="4" y1="18.5" x2="10" y2="18.5"/><line x1="14" y1="17" x2="20" y2="17"/><circle cx="17" cy="14" r=".5" fill="currentColor"/><circle cx="17" cy="20" r=".5" fill="currentColor"/>',
        snake: '<path d="M20 7c0 2.8-3.6 2.8-8 2.8S4 9.8 4 12.6s3.6 2.8 8 2.8 8 0 8 2.8"/><circle cx="20" cy="5.6" r="1.4" fill="currentColor" stroke="none"/>',
        g2048: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor"/>',
        tetris: '<rect x="4" y="4" width="5.2" height="5.2"/><rect x="9.4" y="4" width="5.2" height="5.2"/><rect x="14.8" y="4" width="5.2" height="5.2"/><rect x="9.4" y="9.4" width="5.2" height="5.2"/><rect x="4" y="14.8" width="5.2" height="5.2" fill="currentColor"/><rect x="14.8" y="14.8" width="5.2" height="5.2" fill="currentColor"/>',
        breakout: '<line x1="4" y1="4" x2="20" y2="4"/><line x1="4" y1="8" x2="20" y2="8"/><circle cx="12" cy="13.5" r="1.8" fill="currentColor" stroke="none"/><rect x="8" y="18" width="8" height="2.6" rx="1.3" fill="currentColor" stroke="none"/>',
        mole: '<path d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6A5.56 5.56 0 0 0 12.07 3H9l.92.82A6.18 6.18 0 0 1 12 8.4v.56l2 2h2.47l2.26 1.91"/>',
        flappy: '<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="M20 7l2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/>',
        mines: '<circle cx="11" cy="13" r="7"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z"/>',
        play: '<polygon points="7 4 20 12 7 20 7 4" fill="currentColor" stroke="none"/>',
        trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M17 5h3a1 1 0 0 1 1 1 4 4 0 0 1-4 4"/><path d="M7 5H4a1 1 0 0 0-1 1 4 4 0 0 0 4 4"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        heart: '<path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7z"/>',
        flag: '<path d="M4 21V4"/><path d="M4 4h12l-2 4 2 4H4"/>',
        copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
        star: '<polygon points="12 3 14.5 9 21 9.5 16 13.8 17.7 20 12 16.5 6.3 20 8 13.8 3 9.5 9.5 9"/>',
        move: '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>'
    };
    function ic(name, size) {
        return '<svg class="gi" width="' + (size || 18) + '" height="' + (size || 18)
            + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            + (ICONS[name] || ICONS.hub) + '</svg>';
    }
    /* one item of a score row: icon + label + <b id> value */
    function srItem(iconName, label, id, initVal) {
        return '<span class="sr">' + ic(iconName, 13) + '<span class="sr-l">' + label + '</span><b id="' + id + '">' + initVal + '</b></span>';
    }

    /* ═══════ SCORES (localStorage) ═══════ */
    var SCORE_KEY = 'lord_games_v1';
    function loadScores() {
        try { return JSON.parse(localStorage.getItem(SCORE_KEY)) || {}; }
        catch (e) { return {}; }
    }
    function saveScore(id, data) {
        var all = loadScores();
        all[id] = data;
        try { localStorage.setItem(SCORE_KEY, JSON.stringify(all)); } catch (e) { }
    }
    function score(id) { return loadScores()[id] || {}; }
    function bumpWLD(id, key) {
        var s = score(id);
        s[key] = (s[key] || 0) + 1;
        saveScore(id, s);
    }
    function wldHTML(id) {
        var s = score(id);
        return gt('فوز', 'W') + ' <b>' + (s.w || 0) + '</b> · '
            + gt('خسارة', 'L') + ' <b>' + (s.l || 0) + '</b> · '
            + gt('تعادل', 'D') + ' <b>' + (s.d || 0) + '</b>';
    }

    /* ═══════ CATALOG ═══════ */
    var GAMES = [
        { id: 'xo', name: 'إكس أو', en: 'Tic-Tac-Toe', desc: 'تحدَّ ذكاءً لا يُهزم', descEn: 'Face an unbeatable AI', net: true, aliases: ['اكس او', 'xo', 'x o', 'tic tac', 'تيك تاك'] },
        { id: 'c4', name: 'أربعة في صف', en: 'Connect 4', desc: 'اصطف أربع قطع قبل الخصم', descEn: 'Line up four before your rival', net: true, aliases: ['كونكت', 'connect', 'اربعة في صف', 'اربعه'] },
        { id: 'rps', name: 'حجر ورقة مقص', en: 'Rock Paper Scissors', desc: 'الكلاسيكية — ضد الكمبيوتر', descEn: 'The classic vs computer', net: true, aliases: ['حجر', 'ورقة', 'مقص', 'rock', 'rps'] },
        { id: 'memory', name: 'الذاكرة', en: 'Memory', desc: 'طابق الأزواج بأقل نقلات', descEn: 'Match pairs in fewest moves', aliases: ['ذاكرة', 'memory', 'كوتشينة', 'مطابقة'] },
        { id: 'simon', name: 'سلسلة الألوان', en: 'Simon', desc: 'احفظ التسلسل وكرّره — بأصوات', descEn: 'Memorize and repeat — with sound', aliases: ['سايمون', 'simon', 'الوان', 'ألوان', 'تسلسل'] },
        { id: 'digits', name: 'ذاكرة الأرقام', en: 'Number Memory', desc: 'كم رقماً تحفظ في نظرة؟', descEn: 'How many digits can you hold?', aliases: ['ارقام', 'أرقام', 'digit', 'رقم'] },
        { id: 'reaction', name: 'رد الفعل', en: 'Reaction Time', desc: 'قيس سرعتك بالملي ثانية', descEn: 'Measure your speed in ms', aliases: ['رد فعل', 'سرعة', 'reaction', 'رياكشن'] },
        { id: 'math', name: 'سباق الحساب', en: 'Math Sprint', desc: 'أكبر عدد إجابات في 30 ثانية', descEn: 'Solve as many as you can in 30s', aliases: ['حساب', 'رياضيات', 'math', 'جمع', 'ضرب'] },
        { id: 'snake', name: 'الثعبان', en: 'Snake', desc: 'كُل التفاح واحذر من نفسك', descEn: 'Eat apples, don\'t bite yourself', aliases: ['ثعبان', 'snake', 'سنيك'] },
        { id: '2048', name: '2048', en: '2048', ico: 'g2048', desc: 'ادمج الأرقام ووصّل لـ 2048', descEn: 'Merge numbers to reach 2048', aliases: ['٢٠٤٨', '2048'] },
        { id: 'tetris', name: 'تتريس', en: 'Tetris', desc: 'الكلاسيكية الخالدة — رتّب القطع', descEn: 'The timeless classic', aliases: ['tetris', 'مكعبات', 'تترس'] },
        { id: 'breakout', name: 'كسر الطوب', en: 'Breakout', desc: 'حطّم كل الطوب بالكرة', descEn: 'Smash all the bricks', aliases: ['طوب', 'بريك', 'breakout', 'اركانويد'] },
        { id: 'mole', name: 'اضرب الخلد', en: 'Whack-a-Mole', desc: 'اضرب أكبر عدد في 30 ثانية', descEn: 'Whack as many as you can in 30s', aliases: ['خلد', 'whack', 'mole', 'اضرب'] },
        { id: 'flappy', name: 'الطير النطاط', en: 'Flappy Bird', desc: 'اضغط للطيران وتجنب الأعمدة', descEn: 'Tap to fly, dodge the pipes', aliases: ['فلابي', 'flappy', 'طير', 'عصفور', 'العصفورة'] },
        { id: 'mines', name: 'كاسحة الألغام', en: 'Minesweeper', desc: 'اكشف الخانات وتجنب الألغام', descEn: 'Clear the board, avoid the mines', aliases: ['الغام', 'ألغام', 'لغم', 'minesweeper', 'mines'] }
    ];
    function gameIcon(g, size) { return ic(g.ico || g.id, size); }

    function matchGame(name) {
        var q = (name || '').trim().toLowerCase();
        if (!q) return null;
        var i, j, g, names;
        // pass 1: exact match wins ("ذاكرة الأرقام" must not fall into "الذاكرة")
        for (i = 0; i < GAMES.length; i++) {
            g = GAMES[i];
            names = [g.name.toLowerCase(), g.en.toLowerCase()].concat(g.aliases || []);
            for (j = 0; j < names.length; j++) {
                if (names[j].toLowerCase() === q) return g;
            }
        }
        // pass 2: substring match (both directions)
        for (i = 0; i < GAMES.length; i++) {
            g = GAMES[i];
            names = [g.name.toLowerCase(), g.en.toLowerCase()].concat(g.aliases || []);
            for (j = 0; j < names.length; j++) {
                var n = names[j].toLowerCase();
                if (n.indexOf(q) !== -1 || q.indexOf(n) !== -1) return g;
            }
        }
        return null;
    }

    /* ═══════ SHARED GAME LOGIC (used by local + online modes) ═══════ */
    var XO_WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    function xoWin(b) {
        for (var i = 0; i < XO_WINS.length; i++) {
            var w = XO_WINS[i];
            if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) return { p: b[w[0]], line: w };
        }
        return null;
    }
    function xoFull(b) {
        for (var i = 0; i < 9; i++) if (!b[i]) return false;
        return true;
    }

    function c4DropRow(b, col) {
        for (var r = 5; r >= 0; r--) if (!b[r * 7 + col]) return r;
        return -1;
    }
    function c4Win(b) {
        var r, c, i, v;
        for (r = 0; r < 6; r++) for (c = 0; c <= 3; c++) {
            i = r * 7 + c; v = b[i];
            if (v && v === b[i + 1] && v === b[i + 2] && v === b[i + 3]) return { p: v, line: [i, i + 1, i + 2, i + 3] };
        }
        for (c = 0; c < 7; c++) for (r = 0; r <= 2; r++) {
            i = r * 7 + c; v = b[i];
            if (v && v === b[i + 7] && v === b[i + 14] && v === b[i + 21]) return { p: v, line: [i, i + 7, i + 14, i + 21] };
        }
        for (r = 0; r <= 2; r++) for (c = 0; c <= 3; c++) {
            i = r * 7 + c; v = b[i];
            if (v && v === b[i + 8] && v === b[i + 16] && v === b[i + 24]) return { p: v, line: [i, i + 8, i + 16, i + 24] };
        }
        for (r = 0; r <= 2; r++) for (c = 3; c < 7; c++) {
            i = r * 7 + c; v = b[i];
            if (v && v === b[i + 6] && v === b[i + 12] && v === b[i + 18]) return { p: v, line: [i, i + 6, i + 12, i + 18] };
        }
        return null;
    }
    function c4Full(b) {
        for (var c = 0; c < 7; c++) if (c4DropRow(b, c) >= 0) return false;
        return true;
    }
    function c4AiPick(b, me, foe) {
        function winsAfter(col, who) {
            var r = c4DropRow(b, col);
            if (r < 0) return false;
            b[r * 7 + col] = who;
            var w = c4Win(b);
            b[r * 7 + col] = '';
            return !!(w && w.p === who);
        }
        var order = [3, 2, 4, 1, 5, 0, 6], c;
        for (c = 0; c < 7; c++) if (winsAfter(c, me)) return c;
        for (c = 0; c < 7; c++) if (winsAfter(c, foe)) return c;
        for (var oi = 0; oi < order.length; oi++) {
            c = order[oi];
            var r = c4DropRow(b, c);
            if (r < 0) continue;
            b[r * 7 + c] = me;
            var bad = false;
            var r2 = c4DropRow(b, c);
            if (r2 >= 0) {
                b[r2 * 7 + c] = foe;
                var w = c4Win(b);
                if (w && w.p === foe) bad = true;
                b[r2 * 7 + c] = '';
            }
            b[r * 7 + c] = '';
            if (!bad) return c;
        }
        for (var oj = 0; oj < order.length; oj++) if (c4DropRow(b, order[oj]) >= 0) return order[oj];
        return -1;
    }

    /* RPS shared: custom SVG hands (stone / paper / scissors) */
    var RPS_SVGS = {
        rock: '<path d="M9 4h6.5L20 9l-1.6 8.6A2 2 0 0 1 16.4 19H7.6a2 2 0 0 1-2-1.4L4 9z"/><path d="M9 4L8 11l3.5 7.5"/>',
        paper: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="16.5" x2="15" y2="16.5"/>',
        scissors: ICONS.rps
    };
    var RPS_OPTS = [
        { id: 'rock', ar: 'حجر', en: 'Rock' },
        { id: 'paper', ar: 'ورقة', en: 'Paper' },
        { id: 'scissors', ar: 'مقص', en: 'Scissors' }
    ];
    var RPS_BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    function rpsIcon(id, size) {
        if (!id || !RPS_SVGS[id]) {
            return '<span class="rps-unknown">؟</span>';
        }
        return '<svg width="' + (size || 34) + '" height="' + (size || 34)
            + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
            + RPS_SVGS[id] + '</svg>';
    }

    /* ═══════ FRAME SYSTEM (inline in chat messages) ═══════ */
    var fidSeq = 0;
    var mounts = []; // { el: frameEl, inst: {destroy} }

    function frameId() { return 'gf_' + (++fidSeq) + '_' + Math.random().toString(36).slice(2, 6); }

    function sweep() {
        for (var i = mounts.length - 1; i >= 0; i--) {
            if (!document.contains(mounts[i].el)) {
                try { if (mounts[i].inst && mounts[i].inst.destroy) mounts[i].inst.destroy(); } catch (e) { }
                mounts.splice(i, 1);
            }
        }
    }
    function unmountFrame(frame) {
        for (var i = mounts.length - 1; i >= 0; i--) {
            if (mounts[i].el === frame) {
                try { if (mounts[i].inst && mounts[i].inst.destroy) mounts[i].inst.destroy(); } catch (e) { }
                mounts.splice(i, 1);
            }
        }
    }

    function bestLine(g) {
        var s = score(g.id);
        if (g.id === 'xo' || g.id === 'rps' || g.id === 'c4') {
            if (s.w === undefined && s.l === undefined) return '';
            return (s.w || 0) + ' — ' + (s.l || 0);
        }
        if (g.id === 'reaction') return s.best ? s.best + 'ms' : '';
        if (g.id === 'mines') return s.best ? s.best + 's' : '';
        return s.best ? '' + s.best : '';
    }

    function posterInner(fid, g) {
        return '<button class="gf-poster" onclick="LordGames.mount(\'' + fid + '\',\'' + g.id + '\',false)">'
            + '<span class="gf-ico">' + gameIcon(g, 22) + '</span>'
            + '<span class="gf-info"><span class="gf-name">' + esc(lang() === 'en' ? g.en : g.name) + '</span>'
            + '<span class="gf-sub">' + esc(lang() === 'en' ? g.descEn : g.desc) + '</span></span>'
            + '<span class="gf-play">' + ic('play', 11) + ' ' + gt('العب', 'Play') + '</span></button>';
    }
    function joinPosterInner(fid, code) {
        return '<button class="gf-poster" onclick="LordGames.mountJoin(\'' + fid + '\')">'
            + '<span class="gf-ico">' + ic('globe', 22) + '</span>'
            + '<span class="gf-info"><span class="gf-name">' + gt('انضمام لروم ', 'Join room ') + esc(code) + '</span>'
            + '<span class="gf-sub">' + gt('لعب أونلاين مع صاحبك', 'Online multiplayer') + '</span></span>'
            + '<span class="gf-play">' + ic('play', 11) + '</span></button>';
    }
    function hubInner(fid) {
        function card(g, net) {
            var best = bestLine(g);
            return '<button class="gm-card" onclick="LordGames.mount(\'' + fid + '\',\'' + g.id + '\',' + (net ? 'true' : 'false') + ')">'
                + '<span class="gm-ico">' + (net ? ic('globe', 20) : gameIcon(g, 20)) + '</span>'
                + '<span class="gm-name">' + esc(lang() === 'en' ? g.en : g.name) + '</span>'
                + '<span class="gm-desc">' + esc(net ? gt('العب مع صاحبك بكود', 'Play a friend via code') : (lang() === 'en' ? g.descEn : g.desc)) + '</span>'
                + (best && !net ? '<span class="gm-best">' + ic('trophy', 10) + ' ' + best + '</span>' : '')
                + '</button>';
        }
        var h = '<div class="gf-sec">' + ic('hub', 14) + ' ' + gt('العب لوحدك', 'Play solo') + '</div><div class="gm-grid">';
        for (var i = 0; i < GAMES.length; i++) h += card(GAMES[i], false);
        h += '</div>';
        if (netDb()) {
            h += '<div class="gf-sec">' + ic('globe', 14) + ' ' + gt('مع صاحبك أونلاين — اعمل روم وابعتله الكود', 'Online with a friend — create a room, share the code') + '</div><div class="gm-grid">';
            for (var j = 0; j < GAMES.length; j++) if (GAMES[j].net) h += card(GAMES[j], true);
            h += '</div>';
        }
        return h;
    }

    /* frame HTML factories — called from app.js md() */
    function posterFrameHTML(g) {
        var fid = frameId();
        return '<div class="game-frame" id="' + fid + '" data-gid="' + g.id + '">' + posterInner(fid, g) + '</div>';
    }
    function hubFrameHTML() {
        var fid = frameId();
        return '<div class="game-frame gf-hubframe" id="' + fid + '" data-gid="__hub__">' + hubInner(fid) + '</div>';
    }
    function joinFrameHTML(code) {
        var fid = frameId();
        return '<div class="game-frame" id="' + fid + '" data-gid="__join__" data-code="' + esc(code) + '">' + joinPosterInner(fid, code) + '</div>';
    }

    function restoreFrame(frame) {
        var gid = frame.getAttribute('data-gid');
        if (gid === '__hub__') { frame.classList.add('gf-hubframe'); frame.innerHTML = hubInner(frame.id); return; }
        if (gid === '__join__') { frame.innerHTML = joinPosterInner(frame.id, frame.getAttribute('data-code') || ''); return; }
        var g = matchGame(gid);
        frame.innerHTML = g ? posterInner(frame.id, g) : '';
    }

    function buildChrome(frame, titleHTML) {
        var isHub = frame.getAttribute('data-gid') === '__hub__';
        frame.classList.remove('gf-hubframe');
        frame.innerHTML =
            '<div class="gf-head"><span class="gf-title">' + titleHTML + '</span>'
            + '<span class="gf-acts">'
            + (isHub ? '<button class="gf-hbtn" data-act="hub" title="' + gt('كل الألعاب', 'All games') + '">' + ic('hub', 15) + '</button>' : '')
            + '<button class="gf-hbtn" data-act="close" title="' + gt('إغلاق', 'Close') + '">✕</button>'
            + '</span></div>'
            + '<div class="gf-body"></div>';
        frame.querySelector('.gf-acts').addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (!b) return;
            unmountFrame(frame);
            if (b.getAttribute('data-act') === 'hub') {
                frame.classList.add('gf-hubframe');
                frame.innerHTML = hubInner(frame.id);
            } else restoreFrame(frame);
        });
    }

    function mount(fidOrEl, gid, net) {
        var frame = typeof fidOrEl === 'string' ? document.getElementById(fidOrEl) : fidOrEl;
        if (!frame) return;
        var g = matchGame(gid);
        if (!g) return;
        sweep();
        unmountFrame(frame);
        buildChrome(frame, (net ? ic('globe', 15) : gameIcon(g, 15)) + ' <span>' + esc(lang() === 'en' ? g.en : g.name) + '</span>');
        var body = frame.querySelector('.gf-body');
        try { if (window.LORD && window.LORD.trackGame) window.LORD.trackGame(g.name + (net ? ' أونلاين' : '')); } catch (e) { }
        var inst = net ? startNetGame(body, g, null) : STARTERS[g.id](body);
        mounts.push({ el: frame, inst: inst || { destroy: function () { } } });
    }

    function mountJoin(fidOrEl, code) {
        var frame = typeof fidOrEl === 'string' ? document.getElementById(fidOrEl) : fidOrEl;
        if (!frame) return;
        code = code || frame.getAttribute('data-code') || '';
        sweep();
        unmountFrame(frame);
        buildChrome(frame, ic('globe', 15) + ' <span>' + esc(code) + '</span>');
        var body = frame.querySelector('.gf-body');
        try { if (window.LORD && window.LORD.trackGame) window.LORD.trackGame('انضمام أونلاين'); } catch (e) { }
        var inst = startNetGame(body, null, { code: code });
        mounts.push({ el: frame, inst: inst || { destroy: function () { } } });
    }

    /* ═══════ ONLINE ENGINE (Firestore rooms) ═══════ */
    function netDb() {
        try {
            if (window.firebase && firebase.apps && firebase.apps.length && firebase.firestore) return firebase.firestore();
        } catch (e) { }
        return null;
    }
    var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    function genCode() {
        var s = 'G-';
        for (var i = 0; i < 4; i++) s += CODE_CHARS[rnd(CODE_CHARS.length)];
        return s;
    }
    function normalizeCode(s) {
        s = (s || '').toUpperCase().replace(/[^A-Z2-9]/g, '');
        if (s.charAt(0) === 'G' && s.length === 5) s = s.slice(1);
        return /^[A-Z2-9]{4}$/.test(s) ? 'G-' + s : null;
    }
    var NET_INIT = {
        xo: function () { return { b: ['', '', '', '', '', '', '', '', ''], n: 'h', s: 'h', hw: 0, gw: 0, d: 0 }; },
        c4: function () {
            var b = [];
            for (var i = 0; i < 42; i++) b.push('');
            return { b: b, n: 'h', s: 'h', hw: 0, gw: 0, d: 0 };
        },
        rps: function () { return { h: null, g: null, hs: 0, gs: 0, res: 0, rnd: 1 }; }
    };
    function createRoom(gid) {
        var code = genCode();
        return netDb().collection('lord_rooms').doc(code)
            .set({ g: gid, host: vid(), guest: null, st: NET_INIT[gid](), seq: 0, t: Date.now() })
            .then(function () { return code; });
    }
    function joinRoom(code) {
        var ref = netDb().collection('lord_rooms').doc(code);
        return ref.get().then(function (snap) {
            if (!snap.exists) throw new Error(gt('الكود ده مش موجود — اتأكد منه', 'Room not found — check the code'));
            var d = snap.data();
            var me = vid();
            if (d.host === me || d.guest === me) return d;
            if (d.guest) throw new Error(gt('الروم ده مليان بالفعل', 'This room is already full'));
            return ref.update({ guest: me, t: Date.now() }).then(function () { return d; });
        });
    }
    function waitingHTML(code) {
        return '<div class="net-wait">'
            + '<div class="gm-status">' + gt('ابعت الكود ده لصاحبك:', 'Send this code to your friend:') + '</div>'
            + '<div class="net-code" dir="ltr">' + esc(code) + '</div>'
            + '<button class="gm-btn" onclick="LordGames.copyCode(\'' + code + '\')">' + ic('copy', 13) + ' ' + gt('نسخ الكود', 'Copy code') + '</button>'
            + '<div class="gm-status net-hint">' + gt('صاحبك يكتب الكود في شات LORD AI عنده — اللعبة هتبدأ أول ما يدخل', 'Your friend types this code in their LORD AI chat — the game starts once they join') + '</div>'
            + '<div class="net-pulse"></div>'
            + '</div>';
    }

    function startNetGame(body, g, pre) {
        var db = netDb();
        var unsub = null, alive = true, code = null, gid = g ? g.id : null;
        function cleanup() {
            alive = false;
            if (unsub) { try { unsub(); } catch (e) { } unsub = null; }
        }
        if (!db) {
            body.innerHTML = '<div class="gm-status bad">' + gt('الأونلاين غير متاح دلوقتي', 'Online play is unavailable right now') + '</div>';
            return { destroy: cleanup };
        }
        function ref() { return db.collection('lord_rooms').doc(code); }
        function write(patch) {
            patch.t = Date.now();
            ref().update(patch).catch(function () { });
        }
        function fail(msg) {
            if (!alive) return;
            body.innerHTML = '<div class="gm-status bad">' + esc(msg) + '</div>'
                + (gid ? '<button class="gm-btn" id="netBack">' + gt('رجوع', 'Back') + '</button>' : '');
            var b = body.querySelector('#netBack');
            if (b) b.addEventListener('click', lobby);
        }
        function begin(c) {
            code = c;
            unsub = ref().onSnapshot(function (snap) {
                if (!alive) return;
                var d = snap.data();
                if (!d) { fail(gt('الروم اتقفل', 'Room was closed')); return; }
                if (gid !== d.g) {
                    gid = d.g;
                    var frame = body.closest('.game-frame');
                    var gg = matchGame(gid);
                    if (frame && gg) {
                        var tt = frame.querySelector('.gf-title');
                        if (tt) tt.innerHTML = ic('globe', 15) + ' <span>' + esc(lang() === 'en' ? gg.en : gg.name) + '</span>';
                    }
                }
                var role = d.host === vid() ? 'h' : 'g';
                if (!d.guest) { body.innerHTML = waitingHTML(code); return; }
                var render = NET_RENDER[gid];
                if (!render) { fail(gt('لعبة غير معروفة', 'Unknown game')); return; }
                render(body, d, { role: role, write: write });
            }, function () { if (alive) fail(gt('حصل خطأ في الاتصال', 'Connection error')); });
        }
        function lobby() {
            body.innerHTML =
                '<div class="gm-status">' + gt('العب مع صاحبك من أي جهاز', 'Play with a friend on any device') + '</div>'
                + '<button class="gm-btn" id="netCreate">' + gt('إنشاء روم جديد', 'Create a room') + '</button>'
                + '<div class="net-or">' + gt('— أو —', '— or —') + '</div>'
                + '<div class="net-row"><input class="net-input" id="netCode" maxlength="6" placeholder="G-ABCD" dir="ltr" autocomplete="off">'
                + '<button class="gm-btn" id="netJoin">' + gt('انضم', 'Join') + '</button></div>'
                + '<div class="gm-status" id="netMsg"></div>';
            body.querySelector('#netCreate').addEventListener('click', function () {
                body.innerHTML = '<div class="gm-status">' + gt('جاري إنشاء الروم…', 'Creating room…') + '</div>';
                createRoom(gid).then(begin).catch(function () { fail(gt('معرفناش نعمل الروم — جرب تاني', 'Could not create the room — try again')); });
            });
            function doJoin() {
                var norm = normalizeCode(body.querySelector('#netCode').value);
                if (!norm) { body.querySelector('#netMsg').textContent = gt('اكتب كود صحيح زي G-ABCD', 'Enter a valid code like G-ABCD'); return; }
                body.innerHTML = '<div class="gm-status">' + gt('جاري الانضمام…', 'Joining…') + '</div>';
                joinRoom(norm).then(function () { begin(norm); }).catch(function (e) { fail(e.message); });
            }
            body.querySelector('#netJoin').addEventListener('click', doJoin);
            body.querySelector('#netCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') doJoin(); });
        }
        if (pre && pre.code) {
            var norm = normalizeCode(pre.code);
            if (!norm) { fail(gt('كود غير صالح', 'Invalid code')); return { destroy: cleanup }; }
            body.innerHTML = '<div class="gm-status">' + gt('جاري الانضمام…', 'Joining…') + '</div>';
            joinRoom(norm).then(function () { begin(norm); }).catch(function (e) { fail(e.message); });
        } else {
            lobby();
        }
        return { destroy: cleanup };
    }

    /* ── online renderers (rebuilt on every snapshot — boards are tiny) ── */
    function netScoreRow(st, my) {
        var mine = my === 'h' ? st.hw : st.gw;
        var theirs = my === 'h' ? st.gw : st.hw;
        return '<div class="gm-score">' + gt('أنت', 'You') + ' <b>' + (mine || 0) + '</b> · '
            + gt('خصمك', 'Rival') + ' <b>' + (theirs || 0) + '</b> · '
            + gt('تعادل', 'Draws') + ' <b>' + (st.d || 0) + '</b></div>';
    }

    var NET_RENDER = {
        xo: function (body, d, ctx) {
            var st = d.st, my = ctx.role, opp = my === 'h' ? 'g' : 'h';
            var SYM = { h: 'X', g: 'O' };
            var win = xoWin(st.b);
            var over = win || xoFull(st.b);
            var h = netScoreRow(st, my) + '<div class="xo-board">';
            for (var i = 0; i < 9; i++) {
                var cls = 'xo-cell' + (st.b[i] === 'h' ? ' x' : st.b[i] === 'g' ? ' o' : '')
                    + (win && win.line.indexOf(i) !== -1 ? ' win' : '');
                h += '<button class="' + cls + '" data-i="' + i + '">' + (st.b[i] ? SYM[st.b[i]] : '') + '</button>';
            }
            h += '</div><div class="gm-status" id="netSt"></div>';
            if (over) h += '<button class="gm-btn" id="netAgain">' + gt('جولة جديدة', 'Rematch') + '</button>';
            body.innerHTML = h;
            var stEl = body.querySelector('#netSt');
            if (win) stat(stEl, win.p === my ? gt('كسبت!', 'You win!') : gt('خصمك كسب!', 'Rival wins!'), win.p === my ? 'ok' : 'bad');
            else if (over) stat(stEl, gt('تعادل!', 'Draw!'));
            else stat(stEl, st.n === my ? gt('دورك — أنت ', 'Your turn — you are ') + SYM[my] : gt('دور خصمك…', 'Rival\'s turn…'));
            if (!over && st.n === my) {
                body.querySelectorAll('.xo-cell').forEach(function (cell) {
                    cell.addEventListener('click', function () {
                        var i2 = +cell.getAttribute('data-i');
                        if (st.b[i2]) return;
                        var ns = JSON.parse(JSON.stringify(st));
                        ns.b[i2] = my;
                        var w2 = xoWin(ns.b);
                        if (w2) ns[my + 'w'] = (ns[my + 'w'] || 0) + 1;
                        else if (xoFull(ns.b)) ns.d = (ns.d || 0) + 1;
                        else ns.n = opp;
                        ctx.write({ st: ns, seq: (d.seq || 0) + 1 });
                    });
                });
            }
            var again = body.querySelector('#netAgain');
            if (again) again.addEventListener('click', function () {
                var ns = JSON.parse(JSON.stringify(st));
                ns.b = ['', '', '', '', '', '', '', '', ''];
                ns.s = st.s === 'h' ? 'g' : 'h';
                ns.n = ns.s;
                ctx.write({ st: ns, seq: (d.seq || 0) + 1 });
            });
        },

        c4: function (body, d, ctx) {
            var st = d.st, my = ctx.role, opp = my === 'h' ? 'g' : 'h';
            var win = c4Win(st.b);
            var over = win || c4Full(st.b);
            var myCls = my === 'h' ? 'red' : 'yel';
            var h = netScoreRow(st, my) + '<div class="c4-grid">';
            for (var i = 0; i < 42; i++) {
                var cls = 'c4-cell' + (st.b[i] === 'h' ? ' red' : st.b[i] === 'g' ? ' yel' : '')
                    + (win && win.line.indexOf(i) !== -1 ? ' win' : '');
                h += '<button class="' + cls + '" data-c="' + (i % 7) + '"></button>';
            }
            h += '</div><div class="gm-status" id="netSt"></div>';
            if (over) h += '<button class="gm-btn" id="netAgain">' + gt('جولة جديدة', 'Rematch') + '</button>';
            body.innerHTML = h;
            var stEl = body.querySelector('#netSt');
            if (win) stat(stEl, win.p === my ? gt('كسبت!', 'You win!') : gt('خصمك كسب!', 'Rival wins!'), win.p === my ? 'ok' : 'bad');
            else if (over) stat(stEl, gt('تعادل!', 'Draw!'));
            else if (st.n === my) { stEl.innerHTML = gt('دورك — قطعتك ', 'Your turn — your disc ') + '<span class="c4-dot ' + myCls + '"></span>'; stEl.className = 'gm-status'; }
            else stat(stEl, gt('دور خصمك…', 'Rival\'s turn…'));
            if (!over && st.n === my) {
                body.querySelectorAll('.c4-cell').forEach(function (cell) {
                    cell.addEventListener('click', function () {
                        var col = +cell.getAttribute('data-c');
                        var r = c4DropRow(st.b, col);
                        if (r < 0) return;
                        var ns = JSON.parse(JSON.stringify(st));
                        ns.b[r * 7 + col] = my;
                        var w2 = c4Win(ns.b);
                        if (w2) ns[my + 'w'] = (ns[my + 'w'] || 0) + 1;
                        else if (c4Full(ns.b)) ns.d = (ns.d || 0) + 1;
                        else ns.n = opp;
                        ctx.write({ st: ns, seq: (d.seq || 0) + 1 });
                    });
                });
            }
            var again = body.querySelector('#netAgain');
            if (again) again.addEventListener('click', function () {
                var ns = JSON.parse(JSON.stringify(st));
                ns.b = [];
                for (var k = 0; k < 42; k++) ns.b.push('');
                ns.s = st.s === 'h' ? 'g' : 'h';
                ns.n = ns.s;
                ctx.write({ st: ns, seq: (d.seq || 0) + 1 });
            });
        },

        rps: function (body, d, ctx) {
            var st = d.st, my = ctx.role, opp = my === 'h' ? 'g' : 'h';
            var myPick = st[my], oppPick = st[opp];
            var resolved = st.res === st.rnd;
            if (myPick && oppPick && !resolved && my === 'h') {
                var fix = JSON.parse(JSON.stringify(st));
                if (fix.h !== fix.g) {
                    if (RPS_BEATS[fix.h] === fix.g) fix.hs++; else fix.gs++;
                }
                fix.res = fix.rnd;
                ctx.write({ st: fix, seq: (d.seq || 0) + 1 });
                return;
            }
            var myScore = my === 'h' ? st.hs : st.gs;
            var oppScore = my === 'h' ? st.gs : st.hs;
            var h = '<div class="gm-score">' + gt('أنت', 'You') + ' <b>' + myScore + '</b> · '
                + gt('خصمك', 'Rival') + ' <b>' + oppScore + '</b> · '
                + gt('الجولة', 'Round') + ' <b>' + st.rnd + '</b></div>';
            var oppShow = resolved ? rpsIcon(oppPick) : (oppPick ? '<span class="rps-unknown rps-picked">✓</span>' : rpsIcon(null));
            h += '<div class="rps-arena"><span class="rps-side">' + rpsIcon(myPick) + '</span><span class="rps-vs">VS</span><span class="rps-side">' + oppShow + '</span></div>';
            h += '<div class="gm-status" id="netSt"></div>';
            if (!myPick && !resolved) {
                h += '<div class="rps-row" id="netRps">';
                for (var i = 0; i < 3; i++) {
                    var o = RPS_OPTS[i];
                    h += '<button data-id="' + o.id + '"><span class="rps-bico">' + rpsIcon(o.id, 26) + '</span><small>' + gt(o.ar, o.en) + '</small></button>';
                }
                h += '</div>';
            }
            if (resolved) h += '<button class="gm-btn" id="netAgain">' + gt('الجولة الجاية', 'Next round') + '</button>';
            body.innerHTML = h;
            var stEl = body.querySelector('#netSt');
            if (resolved) {
                if (myPick === oppPick) stat(stEl, gt('تعادل!', 'Draw!'));
                else if (RPS_BEATS[myPick] === oppPick) stat(stEl, gt('كسبت الجولة!', 'You win the round!'), 'ok');
                else stat(stEl, gt('خصمك كسب الجولة!', 'Rival wins the round!'), 'bad');
            } else if (myPick) stat(stEl, gt('مستني خصمك يختار…', 'Waiting for your rival…'));
            else stat(stEl, gt('اختار سلاحك', 'Pick your weapon'));
            var row = body.querySelector('#netRps');
            if (row) row.addEventListener('click', function (e) {
                var b = e.target.closest('button');
                if (!b) return;
                var pick = b.getAttribute('data-id');
                var ns = JSON.parse(JSON.stringify(st));
                ns[my] = pick;
                if (ns[opp]) {
                    if (ns.h !== ns.g) {
                        if (RPS_BEATS[ns.h] === ns.g) ns.hs++; else ns.gs++;
                    }
                    ns.res = ns.rnd;
                }
                ctx.write({ st: ns, seq: (d.seq || 0) + 1 });
            });
            var again = body.querySelector('#netAgain');
            if (again) again.addEventListener('click', function () {
                var ns = JSON.parse(JSON.stringify(st));
                ns.h = null; ns.g = null; ns.rnd++;
                ctx.write({ st: ns, seq: (d.seq || 0) + 1 });
            });
        }
    };

    /* ═══════ 1) TIC-TAC-TOE (vs AI) ═══════ */
    function startXO(root) {
        var board, over, lock = false, hard = true, humanStarts = true;
        var HU = 'X', AI = 'O';

        root.innerHTML =
            '<div class="xo-top">'
            + '<div class="gm-seg" id="xoDiff">'
            + '<button data-d="easy">' + gt('سهل', 'Easy') + '</button>'
            + '<button data-d="hard" class="on">' + gt('مستحيل', 'Unbeatable') + '</button>'
            + '</div>'
            + '<div class="gm-score" id="xoScore"></div>'
            + '</div>'
            + '<div class="xo-board" id="xoBoard"></div>'
            + '<div class="gm-status" id="xoStatus"></div>'
            + '<button class="gm-btn" id="xoReset">' + gt('جولة جديدة', 'New round') + '</button>';

        var boardEl = root.querySelector('#xoBoard');
        var statusEl = root.querySelector('#xoStatus');

        function paintScore() { root.querySelector('#xoScore').innerHTML = wldHTML('xo'); }
        function empties(b) {
            var out = [];
            for (var i = 0; i < 9; i++) if (!b[i]) out.push(i);
            return out;
        }
        function minimax(b, player, depth) {
            var w = xoWin(b);
            if (w) return { score: w.p === AI ? 10 - depth : depth - 10 };
            var free = empties(b);
            if (!free.length) return { score: 0 };
            var best = null;
            for (var i = 0; i < free.length; i++) {
                b[free[i]] = player;
                var r = minimax(b, player === AI ? HU : AI, depth + 1);
                b[free[i]] = '';
                if (!best
                    || (player === AI && r.score > best.score)
                    || (player === HU && r.score < best.score)) {
                    best = { score: r.score, move: free[i] };
                }
            }
            return best;
        }
        function aiMove() {
            var free = empties(board);
            if (!free.length || over) { lock = false; return; }
            var mv;
            if (!hard && Math.random() < 0.7) mv = free[rnd(free.length)];
            else mv = minimax(board.slice(), AI, 0).move;
            board[mv] = AI;
            paint();
            check();
            lock = false;
            if (!over) stat(statusEl, gt('دورك — أنت X', 'Your turn — you are X'));
        }
        function check() {
            var w = xoWin(board);
            if (w) {
                over = true;
                if (w.p === HU) { bumpWLD('xo', 'w'); stat(statusEl, gt('مبروك! كسبت', 'You win!'), 'ok'); }
                else { bumpWLD('xo', 'l'); stat(statusEl, gt('الكمبيوتر كسب!', 'Computer wins!'), 'bad'); }
                paintScore();
                w.line.forEach(function (i) { boardEl.children[i].classList.add('win'); });
            } else if (!empties(board).length) {
                over = true;
                bumpWLD('xo', 'd');
                paintScore();
                stat(statusEl, gt('تعادل!', 'Draw!'));
            }
        }
        function paint() {
            for (var i = 0; i < 9; i++) {
                var c = boardEl.children[i];
                c.textContent = board[i];
                c.classList.toggle('x', board[i] === HU);
                c.classList.toggle('o', board[i] === AI);
            }
        }
        function reset() {
            board = ['', '', '', '', '', '', '', '', ''];
            over = false;
            lock = false;
            boardEl.innerHTML = '';
            for (var i = 0; i < 9; i++) {
                var c = document.createElement('button');
                c.className = 'xo-cell';
                (function (idx) {
                    c.addEventListener('click', function () {
                        if (over || lock || board[idx]) return;
                        board[idx] = HU;
                        paint();
                        check();
                        if (!over) {
                            lock = true;
                            stat(statusEl, gt('الكمبيوتر بيفكر…', 'Computer is thinking…'));
                            setTimeout(aiMove, 250);
                        }
                    });
                })(i);
                boardEl.appendChild(c);
            }
            if (humanStarts) {
                stat(statusEl, gt('دورك — أنت X تبدأ', 'Your turn — you (X) start'));
            } else {
                stat(statusEl, gt('الكمبيوتر يبدأ…', 'Computer starts…'));
                lock = true;
                setTimeout(function () {
                    var opens = [4, 0, 2, 6, 8];
                    board[hard ? opens[rnd(2) === 0 ? 0 : 1 + rnd(4)] : opens[rnd(5)]] = AI;
                    paint();
                    lock = false;
                    stat(statusEl, gt('دورك — أنت X', 'Your turn — you are X'));
                }, 350);
            }
            humanStarts = !humanStarts;
        }

        root.querySelector('#xoDiff').addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (!b) return;
            hard = b.getAttribute('data-d') === 'hard';
            root.querySelectorAll('#xoDiff button').forEach(function (x) { x.classList.toggle('on', x === b); });
            reset();
        });
        root.querySelector('#xoReset').addEventListener('click', reset);
        paintScore();
        reset();
        return { destroy: function () { } };
    }

    /* ═══════ 2) CONNECT 4 (vs AI) ═══════ */
    function startC4(root) {
        var board, over, lock = false, humanStarts = true;
        var HU = 'p', AI = 'a';

        root.innerHTML =
            '<div class="gm-score" id="c4Score"></div>'
            + '<div class="c4-grid" id="c4Grid"></div>'
            + '<div class="gm-status" id="c4Status"></div>'
            + '<button class="gm-btn" id="c4Reset">' + gt('جولة جديدة', 'New round') + '</button>';

        var gridEl = root.querySelector('#c4Grid');
        var statusEl = root.querySelector('#c4Status');

        function yourTurn() {
            statusEl.innerHTML = gt('دورك — قطعتك ', 'Your turn — your disc ') + '<span class="c4-dot red"></span>';
            statusEl.className = 'gm-status';
        }
        function paintScore() { root.querySelector('#c4Score').innerHTML = wldHTML('c4'); }
        function paint(winLine) {
            for (var i = 0; i < 42; i++) {
                var cell = gridEl.children[i];
                cell.classList.toggle('red', board[i] === HU);
                cell.classList.toggle('yel', board[i] === AI);
                cell.classList.toggle('win', !!(winLine && winLine.indexOf(i) !== -1));
            }
        }
        function finish(w) {
            over = true;
            if (w) {
                if (w.p === HU) { bumpWLD('c4', 'w'); stat(statusEl, gt('كسبت!', 'You win!'), 'ok'); }
                else { bumpWLD('c4', 'l'); stat(statusEl, gt('الكمبيوتر كسب!', 'Computer wins!'), 'bad'); }
                paint(w.line);
            } else {
                bumpWLD('c4', 'd');
                stat(statusEl, gt('تعادل!', 'Draw!'));
            }
            paintScore();
        }
        function drop(col, who) {
            var r = c4DropRow(board, col);
            if (r < 0) return false;
            board[r * 7 + col] = who;
            paint();
            var w = c4Win(board);
            if (w) { finish(w); return true; }
            if (c4Full(board)) { finish(null); return true; }
            return true;
        }
        function aiTurn() {
            if (over) { lock = false; return; }
            var col = c4AiPick(board, AI, HU);
            if (col >= 0) drop(col, AI);
            lock = false;
            if (!over) yourTurn();
        }
        function reset() {
            board = [];
            for (var i = 0; i < 42; i++) board.push('');
            over = false;
            lock = false;
            gridEl.innerHTML = '';
            for (var j = 0; j < 42; j++) {
                var cell = document.createElement('button');
                cell.className = 'c4-cell';
                (function (col) {
                    cell.addEventListener('click', function () {
                        if (over || lock) return;
                        if (c4DropRow(board, col) < 0) return;
                        drop(col, HU);
                        if (!over) {
                            lock = true;
                            stat(statusEl, gt('الكمبيوتر بيفكر…', 'Computer is thinking…'));
                            setTimeout(aiTurn, 300);
                        }
                    });
                })(j % 7);
                gridEl.appendChild(cell);
            }
            if (humanStarts) {
                yourTurn();
            } else {
                stat(statusEl, gt('الكمبيوتر يبدأ…', 'Computer starts…'));
                lock = true;
                setTimeout(function () {
                    drop(3, AI);
                    lock = false;
                    if (!over) yourTurn();
                }, 350);
            }
            humanStarts = !humanStarts;
        }
        root.querySelector('#c4Reset').addEventListener('click', reset);
        paintScore();
        reset();
        return { destroy: function () { } };
    }

    /* ═══════ 3) ROCK PAPER SCISSORS (vs computer) ═══════ */
    function startRPS(root) {
        var revealing = false, revealTimer = null;

        root.innerHTML =
            '<div class="gm-score" id="rpsScore"></div>'
            + '<div class="rps-arena"><span class="rps-side" id="rpsYou">' + rpsIcon(null) + '</span><span class="rps-vs">VS</span><span class="rps-side" id="rpsCpu">' + rpsIcon(null) + '</span></div>'
            + '<div class="gm-status" id="rpsStatus"></div>'
            + '<div class="rps-row" id="rpsRow">'
            + RPS_OPTS.map(function (o) {
                return '<button data-id="' + o.id + '"><span class="rps-bico">' + rpsIcon(o.id, 26) + '</span><small>' + gt(o.ar, o.en) + '</small></button>';
            }).join('')
            + '</div>';

        var statusEl = root.querySelector('#rpsStatus');
        stat(statusEl, gt('اختار سلاحك', 'Pick your weapon'));

        function paintScore() { root.querySelector('#rpsScore').innerHTML = wldHTML('rps'); }
        function play(mine) {
            if (revealing) return;
            revealing = true;
            var cpu = RPS_OPTS[rnd(3)];
            root.querySelector('#rpsYou').innerHTML = rpsIcon(mine);
            var cpuEl = root.querySelector('#rpsCpu');
            cpuEl.innerHTML = '<span class="rps-unknown rps-think">…</span>';
            stat(statusEl, '…');
            revealTimer = setTimeout(function () {
                cpuEl.innerHTML = rpsIcon(cpu.id);
                if (mine === cpu.id) { bumpWLD('rps', 'd'); stat(statusEl, gt('تعادل!', 'Draw!')); }
                else if (RPS_BEATS[mine] === cpu.id) { bumpWLD('rps', 'w'); stat(statusEl, gt('كسبت!', 'You win!'), 'ok'); }
                else { bumpWLD('rps', 'l'); stat(statusEl, gt('خسرت!', 'You lose!'), 'bad'); }
                paintScore();
                revealing = false;
            }, 550);
        }
        root.querySelector('#rpsRow').addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (b) play(b.getAttribute('data-id'));
        });
        paintScore();
        return { destroy: function () { if (revealTimer) clearTimeout(revealTimer); } };
    }

    /* ═══════ 4) MEMORY MATCH (SVG shape pairs) ═══════ */
    var MEM_SHAPES = [
        { c: '#d9534f', s: '<circle cx="12" cy="12" r="7"/>' },
        { c: '#4a90d9', s: '<rect x="5" y="5" width="14" height="14" rx="2.5"/>' },
        { c: '#2f9e6e', s: '<polygon points="12 4.5 20 19 4 19"/>' },
        { c: '#e8b93d', s: '<polygon points="12 3 14.5 9 21 9.5 16 13.8 17.7 20 12 16.5 6.3 20 8 13.8 3 9.5 9.5 9"/>' },
        { c: '#9d4edd', s: '<polygon points="12 3.5 20.5 12 12 20.5 3.5 12"/>' },
        { c: '#f2913d', s: '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>' },
        { c: '#e0629a', s: '<path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>' },
        { c: '#4ab8c4', s: '<path d="M20 13A8 8 0 1 1 11 4a6.5 6.5 0 0 0 9 9z"/>' }
    ];
    function memShapeSVG(i) {
        var sh = MEM_SHAPES[i];
        return '<svg width="30" height="30" viewBox="0 0 24 24" fill="' + sh.c + '22" stroke="' + sh.c + '" stroke-width="1.8" stroke-linejoin="round">' + sh.s + '</svg>';
    }
    function startMemory(root) {
        var moves, matched, first, lock, secs, timer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('move', gt('نقلات', 'Moves'), 'mmMoves', '0')
            + srItem('clock', gt('الوقت', 'Time'), 'mmTime', '0s')
            + srItem('trophy', gt('الأفضل', 'Best'), 'mmBest', score('memory').best || '—')
            + '</div>'
            + '<div class="mm-grid" id="mmGrid"></div>'
            + '<div class="gm-status" id="mmStatus"></div>'
            + '<button class="gm-btn" id="mmReset">' + gt('لعبة جديدة', 'New game') + '</button>';

        var grid = root.querySelector('#mmGrid');
        var statusEl = root.querySelector('#mmStatus');

        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        function reset() {
            stopTimer();
            moves = 0; matched = 0; first = null; lock = false; secs = 0;
            root.querySelector('#mmMoves').textContent = '0';
            root.querySelector('#mmTime').textContent = '0s';
            stat(statusEl, gt('طابق كل الأزواج بأقل نقلات', 'Match all pairs in fewest moves'));
            var idxs = [];
            for (var k = 0; k < MEM_SHAPES.length; k++) { idxs.push(k); idxs.push(k); }
            shuffle(idxs);
            grid.innerHTML = '';
            idxs.forEach(function (si) {
                var c = document.createElement('button');
                c.className = 'mm-card';
                c.innerHTML = '<span class="mm-front">?</span><span class="mm-back">' + memShapeSVG(si) + '</span>';
                c.setAttribute('data-e', si);
                c.addEventListener('click', function () { flip(c); });
                grid.appendChild(c);
            });
        }
        function flip(c) {
            if (lock || c === first || c.classList.contains('open') || c.classList.contains('ok')) return;
            if (!timer) timer = setInterval(function () {
                secs++;
                root.querySelector('#mmTime').textContent = secs + 's';
            }, 1000);
            c.classList.add('open');
            if (!first) { first = c; return; }
            moves++;
            root.querySelector('#mmMoves').textContent = moves;
            if (first.getAttribute('data-e') === c.getAttribute('data-e')) {
                first.classList.add('ok'); c.classList.add('ok');
                first = null;
                matched++;
                beep(520 + matched * 40, 0.08);
                if (matched === MEM_SHAPES.length) {
                    stopTimer();
                    var s = score('memory');
                    if (!s.best || moves < s.best) { s.best = moves; saveScore('memory', s); root.querySelector('#mmBest').textContent = moves; }
                    stat(statusEl, gt('كسبت في ', 'You won in ') + moves + ' ' + gt('نقلة خلال ', 'moves in ') + secs + 's', 'ok');
                }
            } else {
                lock = true;
                var f = first; first = null;
                setTimeout(function () {
                    f.classList.remove('open');
                    c.classList.remove('open');
                    lock = false;
                }, 700);
            }
        }
        root.querySelector('#mmReset').addEventListener('click', reset);
        reset();
        return { destroy: stopTimer };
    }

    /* ═══════ 5) SIMON (color sequence, with tones) ═══════ */
    function startSimon(root) {
        var TONES = [330, 262, 220, 165];
        var seq = [], pos = 0, playing = false, over = false;
        var timers = [];

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('الجولة', 'Round'), 'siRound', '0')
            + srItem('trophy', gt('الأفضل', 'Best'), 'siBest', score('simon').best || 0)
            + '</div>'
            + '<div class="si-grid" id="siGrid">'
            + '<button class="si-pad si-g" data-p="0"></button>'
            + '<button class="si-pad si-r" data-p="1"></button>'
            + '<button class="si-pad si-y" data-p="2"></button>'
            + '<button class="si-pad si-b" data-p="3"></button>'
            + '</div>'
            + '<div class="gm-status" id="siStatus"></div>'
            + '<button class="gm-btn" id="siStart">' + gt('ابدأ', 'Start') + '</button>';

        var pads = root.querySelectorAll('.si-pad');
        var statusEl = root.querySelector('#siStatus');
        stat(statusEl, gt('اضغط "ابدأ" واحفظ التسلسل', 'Press "Start" and memorize the sequence'));

        function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
        function clearTimers() { timers.forEach(clearTimeout); timers = []; }
        function speed() { return Math.max(240, 560 - seq.length * 22); }

        function flash(p, ms) {
            pads[p].classList.add('lit');
            beep(TONES[p], (ms || speed() * 0.6) / 1000 + 0.05);
            later(function () { pads[p].classList.remove('lit'); }, ms || speed() * 0.6);
        }
        function playback() {
            playing = true;
            stat(statusEl, gt('ركّز واحفظ…', 'Watch closely…'));
            for (var i = 0; i < seq.length; i++) {
                (function (i2) {
                    later(function () {
                        flash(seq[i2]);
                        if (i2 === seq.length - 1) {
                            later(function () {
                                playing = false;
                                stat(statusEl, gt('دورك — كرّر التسلسل', 'Your turn — repeat the sequence'));
                            }, speed() * 0.7);
                        }
                    }, i2 * speed());
                })(i);
            }
        }
        function nextRound() {
            seq.push(rnd(4));
            pos = 0;
            root.querySelector('#siRound').textContent = seq.length;
            playback();
        }
        function tap(p) {
            if (playing || over || !seq.length) return;
            flash(p, 200);
            if (p === seq[pos]) {
                pos++;
                if (pos === seq.length) {
                    var done = seq.length;
                    var s = score('simon');
                    if (done > (s.best || 0)) { s.best = done; saveScore('simon', s); root.querySelector('#siBest').textContent = done; }
                    stat(statusEl, gt('صح! الجولة ', 'Correct! Round ') + (done + 1), 'ok');
                    later(nextRound, 800);
                }
            } else {
                over = true;
                beep(110, 0.35, 'square');
                stat(statusEl, gt('غلط! وصلت لجولة ', 'Wrong! You reached round ') + seq.length, 'bad');
                root.querySelector('#siStart').textContent = gt('العب تاني', 'Play again');
            }
        }
        function start() {
            clearTimers();
            seq = []; pos = 0; over = false; playing = false;
            root.querySelector('#siRound').textContent = '0';
            nextRound();
        }

        pads.forEach(function (pad) {
            pad.addEventListener('click', function () { tap(+pad.getAttribute('data-p')); });
        });
        root.querySelector('#siStart').addEventListener('click', start);
        return { destroy: clearTimers };
    }

    /* ═══════ 6) NUMBER MEMORY (digit span) ═══════ */
    function startDigits(root) {
        var level, num, state = 'idle', showTimer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('digits', gt('الأرقام', 'Digits'), 'dgLvl', '—')
            + srItem('trophy', gt('الأفضل', 'Best'), 'dgBest', score('digits').best || 0)
            + '</div>'
            + '<div class="dg-display" id="dgDisp" dir="ltr">…</div>'
            + '<div class="net-row none" id="dgRow">'
            + '<input class="net-input" id="dgInput" inputmode="numeric" autocomplete="off" dir="ltr" placeholder="…">'
            + '<button class="gm-btn" id="dgOk">✓</button>'
            + '</div>'
            + '<div class="gm-status" id="dgStatus"></div>'
            + '<button class="gm-btn" id="dgStart">' + gt('ابدأ', 'Start') + '</button>';

        var disp = root.querySelector('#dgDisp');
        var row = root.querySelector('#dgRow');
        var input = root.querySelector('#dgInput');
        var statusEl = root.querySelector('#dgStatus');
        stat(statusEl, gt('هيظهر رقم لثواني — احفظه واكتبه', 'A number flashes for seconds — memorize and type it'));

        function clearShow() { if (showTimer) { clearTimeout(showTimer); showTimer = null; } }
        function genNum(len) {
            var s = '' + (1 + rnd(9));
            for (var i = 1; i < len; i++) s += rnd(10);
            return s;
        }
        function round() {
            state = 'show';
            num = genNum(level);
            root.querySelector('#dgLvl').textContent = level;
            disp.textContent = num;
            row.classList.add('none');
            stat(statusEl, gt('احفظ…', 'Memorize…'));
            clearShow();
            showTimer = setTimeout(function () {
                state = 'input';
                disp.textContent = '•'.repeat(Math.min(level, 12));
                row.classList.remove('none');
                input.value = '';
                input.focus();
                stat(statusEl, gt('اكتب الرقم اللي شفته', 'Type the number you saw'));
            }, 700 + level * 320);
        }
        function submit() {
            if (state !== 'input') return;
            var v = input.value.trim();
            if (!v) return;
            if (v === num) {
                beep(600, 0.08);
                level++;
                stat(statusEl, gt('صح!', 'Correct!'), 'ok');
                setTimeout(round, 600);
            } else {
                state = 'over';
                beep(110, 0.35, 'square');
                row.classList.add('none');
                disp.textContent = num;
                var reached = level - 1;
                stat(statusEl, gt('غلط — كتبت ', 'Wrong — you typed ') + v + ' · ' + gt('وصلت لـ ', 'you reached ') + reached + ' ' + gt('أرقام', 'digits'), 'bad');
                var s = score('digits');
                if (reached > (s.best || 0)) { s.best = reached; saveScore('digits', s); root.querySelector('#dgBest').textContent = reached; }
                root.querySelector('#dgStart').textContent = gt('العب تاني', 'Play again');
            }
        }
        root.querySelector('#dgOk').addEventListener('click', submit);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
        root.querySelector('#dgStart').addEventListener('click', function () {
            level = 3;
            round();
        });
        return { destroy: clearShow };
    }

    /* ═══════ 7) REACTION TIME ═══════ */
    function startReaction(root) {
        var ROUNDS = 5;
        var state = 'idle';
        var round, times, t0, waitTimer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('الجولة', 'Round'), 'rcRound', '—')
            + srItem('trophy', gt('أفضل متوسط', 'Best avg'), 'rcBest', score('reaction').best ? score('reaction').best + 'ms' : '—')
            + '</div>'
            + '<button class="rc-pad" id="rcPad">' + gt('اضغط للبدء', 'Tap to start') + '</button>'
            + '<div class="gm-status" id="rcStatus"></div>';

        var pad = root.querySelector('#rcPad');
        var statusEl = root.querySelector('#rcStatus');
        stat(statusEl, gt('لما اللون يبقى أخضر اضغط بأسرع ما يمكن — 5 جولات', 'When it turns green tap as fast as you can — 5 rounds'));

        function clearWait() { if (waitTimer) { clearTimeout(waitTimer); waitTimer = null; } }
        function schedule() {
            state = 'waiting';
            pad.className = 'rc-pad wait';
            pad.textContent = gt('استنى الأخضر…', 'Wait for green…');
            root.querySelector('#rcRound').textContent = (round + 1) + '/' + ROUNDS;
            clearWait();
            waitTimer = setTimeout(function () {
                state = 'go';
                t0 = performance.now();
                pad.className = 'rc-pad go';
                pad.textContent = gt('دوس!', 'TAP!');
            }, 1200 + Math.random() * 2300);
        }
        function tap() {
            if (state === 'idle' || state === 'done') {
                round = 0; times = [];
                schedule();
            } else if (state === 'waiting') {
                clearWait();
                pad.className = 'rc-pad early';
                pad.textContent = gt('بدري أوي!', 'Too soon!');
                stat(statusEl, gt('استنى الأخضر — الجولة هتتعاد', 'Wait for green — round restarts'));
                state = 'cooldown';
                waitTimer = setTimeout(schedule, 900);
            } else if (state === 'go') {
                var ms = Math.round(performance.now() - t0);
                times.push(ms);
                stat(statusEl, ms + 'ms');
                round++;
                if (round >= ROUNDS) {
                    state = 'done';
                    var sum = 0;
                    times.forEach(function (x) { sum += x; });
                    var avg = Math.round(sum / times.length);
                    pad.className = 'rc-pad';
                    pad.textContent = gt('متوسطك: ', 'Your avg: ') + avg + 'ms — ' + gt('اضغط للإعادة', 'tap to retry');
                    var s = score('reaction');
                    if (!s.best || avg < s.best) {
                        s.best = avg;
                        saveScore('reaction', s);
                        root.querySelector('#rcBest').textContent = avg + 'ms';
                        stat(statusEl, gt('رقم قياسي جديد!', 'New record!'), 'ok');
                    } else {
                        stat(statusEl, gt('أفضل متوسط: ', 'Best avg: ') + s.best + 'ms');
                    }
                } else {
                    schedule();
                }
            }
        }
        pad.addEventListener('click', tap);
        return { destroy: clearWait };
    }

    /* ═══════ 8) MATH SPRINT ═══════ */
    function startMath(root) {
        var DURATION = 30;
        var scoreNow, left, timer = null, answer, running = false;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'maScore', '0')
            + srItem('clock', gt('الوقت', 'Time'), 'maTime', DURATION + 's')
            + srItem('trophy', gt('الأفضل', 'Best'), 'maBest', score('math').best || 0)
            + '</div>'
            + '<div class="ma-q" id="maQ" dir="ltr">—</div>'
            + '<div class="ma-grid" id="maGrid"></div>'
            + '<div class="gm-status" id="maStatus"></div>'
            + '<button class="gm-btn" id="maStart">' + gt('ابدأ', 'Start') + '</button>';

        var qEl = root.querySelector('#maQ');
        var gridEl = root.querySelector('#maGrid');
        var statusEl = root.querySelector('#maStatus');
        stat(statusEl, gt('30 ثانية — جاوب بأسرع ما يمكن', '30 seconds — answer as fast as you can'));

        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        function nextQ() {
            var kind = rnd(3);
            var a, b, txt;
            if (kind === 0) { a = 3 + rnd(60); b = 3 + rnd(60); answer = a + b; txt = a + ' + ' + b; }
            else if (kind === 1) { a = 10 + rnd(70); b = 1 + rnd(a - 1); answer = a - b; txt = a + ' − ' + b; }
            else { a = 2 + rnd(11); b = 2 + rnd(11); answer = a * b; txt = a + ' × ' + b; }
            qEl.textContent = txt + ' = ?';
            var opts = [answer];
            while (opts.length < 4) {
                var d = answer + (rnd(2) ? 1 : -1) * (1 + rnd(9));
                if (d >= 0 && opts.indexOf(d) === -1) opts.push(d);
            }
            shuffle(opts);
            gridEl.innerHTML = '';
            opts.forEach(function (v) {
                var btn = document.createElement('button');
                btn.className = 'ma-opt';
                btn.textContent = v;
                btn.addEventListener('click', function () { pick(btn, v); });
                gridEl.appendChild(btn);
            });
        }
        function pick(btn, v) {
            if (!running) return;
            if (v === answer) {
                scoreNow++;
                root.querySelector('#maScore').textContent = scoreNow;
                beep(520, 0.05);
                nextQ();
            } else {
                btn.classList.add('bad');
            }
        }
        function finish() {
            stopTimer();
            running = false;
            qEl.textContent = '—';
            gridEl.innerHTML = '';
            var s = score('math');
            if (scoreNow > (s.best || 0)) {
                s.best = scoreNow; saveScore('math', s);
                root.querySelector('#maBest').textContent = scoreNow;
                stat(statusEl, gt('رقم قياسي: ', 'New record: ') + scoreNow, 'ok');
            } else {
                stat(statusEl, gt('انتهى الوقت! النتيجة: ', 'Time\'s up! Score: ') + scoreNow);
            }
            root.querySelector('#maStart').textContent = gt('العب تاني', 'Play again');
        }
        function start() {
            stopTimer();
            scoreNow = 0; left = DURATION; running = true;
            root.querySelector('#maScore').textContent = '0';
            root.querySelector('#maTime').textContent = left + 's';
            stat(statusEl, gt('يلا!', 'Go!'));
            nextQ();
            timer = setInterval(function () {
                left--;
                root.querySelector('#maTime').textContent = left + 's';
                if (left <= 0) finish();
            }, 1000);
        }
        root.querySelector('#maStart').addEventListener('click', start);
        return { destroy: stopTimer };
    }

    /* ═══════ 9) SNAKE ═══════ */
    function startSnake(root) {
        var N = 18;
        var timer = null, snake, dir, dirQueue, food, scoreNow, speed, running = false, paused = false;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'snScore', '0')
            + srItem('trophy', gt('الأفضل', 'Best'), 'snBest', score('snake').best || 0)
            + '</div>'
            + '<canvas id="snCanvas" class="sn-canvas"></canvas>'
            + '<div class="gm-status" id="snStatus"></div>'
            + '<div class="sn-pad" id="snPad">'
            + '<button data-d="up">▲</button>'
            + '<div><button data-d="left">◀</button><button data-d="down">▼</button><button data-d="right">▶</button></div>'
            + '</div>'
            + '<button class="gm-btn" id="snStart">' + gt('ابدأ', 'Start') + '</button>';

        var cv = root.querySelector('#snCanvas');
        var ctx = cv.getContext('2d');
        var size = Math.min(340, (root.clientWidth || 320) - 8);
        var cell = Math.floor(size / N);
        cv.width = cell * N;
        cv.height = cell * N;
        var statusEl = root.querySelector('#snStatus');
        stat(statusEl, gt('الأسهم أو السحب أو الأزرار للتحكم', 'Arrows, swipe, or buttons to steer'));

        var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        var OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

        function placeFood() {
            while (true) {
                var f = [rnd(N), rnd(N)];
                var hit = false;
                for (var i = 0; i < snake.length; i++) {
                    if (snake[i][0] === f[0] && snake[i][1] === f[1]) { hit = true; break; }
                }
                if (!hit) return f;
            }
        }
        function draw() {
            var bg = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            var acc = cssVar('--accent', '#3e8e7e');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, cv.width, cv.height);
            // apple
            ctx.fillStyle = '#e05d5d';
            ctx.beginPath();
            ctx.arc(food[0] * cell + cell / 2, food[1] * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2f9e6e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(food[0] * cell + cell / 2, food[1] * cell + 3);
            ctx.lineTo(food[0] * cell + cell / 2 + 3, food[1] * cell);
            ctx.stroke();
            // body
            for (var i = 0; i < snake.length; i++) {
                ctx.fillStyle = i === 0 ? acc : acc + 'cc';
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(snake[i][0] * cell + 1, snake[i][1] * cell + 1, cell - 2, cell - 2, 4);
                    ctx.fill();
                } else {
                    ctx.fillRect(snake[i][0] * cell + 1, snake[i][1] * cell + 1, cell - 2, cell - 2);
                }
            }
            // eyes on the head, offset toward the travel direction
            var hx = snake[0][0] * cell + cell / 2, hy = snake[0][1] * cell + cell / 2;
            var dv = DIRS[dir] || [1, 0];
            var px = -dv[1], py = dv[0]; // perpendicular
            ctx.fillStyle = isDark() ? '#121413' : '#fff';
            ctx.beginPath();
            ctx.arc(hx + dv[0] * cell * 0.18 + px * cell * 0.18, hy + dv[1] * cell * 0.18 + py * cell * 0.18, cell * 0.1, 0, Math.PI * 2);
            ctx.arc(hx + dv[0] * cell * 0.18 - px * cell * 0.18, hy + dv[1] * cell * 0.18 - py * cell * 0.18, cell * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
        function gameOver() {
            stopTimer();
            running = false;
            var s = score('snake');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('snake', s); root.querySelector('#snBest').textContent = scoreNow; }
            stat(statusEl, gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow, 'bad');
            root.querySelector('#snStart').textContent = gt('العب تاني', 'Play again');
        }
        function tick() {
            if (dirQueue.length) dir = dirQueue.shift();
            var head = [snake[0][0] + DIRS[dir][0], snake[0][1] + DIRS[dir][1]];
            if (head[0] < 0 || head[0] >= N || head[1] < 0 || head[1] >= N) return gameOver();
            for (var i = 0; i < snake.length - 1; i++) {
                if (snake[i][0] === head[0] && snake[i][1] === head[1]) return gameOver();
            }
            snake.unshift(head);
            if (head[0] === food[0] && head[1] === food[1]) {
                scoreNow++;
                root.querySelector('#snScore').textContent = scoreNow;
                beep(540, 0.05);
                food = placeFood();
                if (speed > 65) { speed -= 3; restartTimer(); }
            } else {
                snake.pop();
            }
            draw();
        }
        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        function restartTimer() { stopTimer(); timer = setInterval(tick, speed); }
        function start() {
            snake = [[9, 9], [8, 9], [7, 9]];
            dir = 'right'; dirQueue = [];
            scoreNow = 0; speed = 140; running = true; paused = false;
            food = placeFood();
            root.querySelector('#snScore').textContent = '0';
            stat(statusEl, gt('كُل التفاح الأحمر', 'Eat the red apples'));
            root.querySelector('#snStart').textContent = gt('إعادة', 'Restart');
            draw();
            restartTimer();
        }
        function turn(d) {
            if (!running || paused) return;
            var last = dirQueue.length ? dirQueue[dirQueue.length - 1] : dir;
            if (d === last || d === OPP[last]) return;
            if (dirQueue.length < 3) dirQueue.push(d);
        }

        function onKey(e) {
            var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
            var d = map[e.key];
            if (d && running) { e.preventDefault(); turn(d); }
        }
        document.addEventListener('keydown', onKey);

        function onVis() {
            if (!running) return;
            if (document.hidden) {
                paused = true;
                stopTimer();
                stat(statusEl, gt('إيقاف مؤقت', 'Paused'));
            } else if (paused) {
                paused = false;
                stat(statusEl, gt('كمّل!', 'Go on!'));
                restartTimer();
            }
        }
        document.addEventListener('visibilitychange', onVis);

        var tsX = 0, tsY = 0;
        function onTS(e) { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; }
        function onTE(e) {
            var dx = e.changedTouches[0].clientX - tsX;
            var dy = e.changedTouches[0].clientY - tsY;
            if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
                if (!running) start(); // tap the board to start
                return;
            }
            if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');
            else turn(dy > 0 ? 'down' : 'up');
        }
        cv.addEventListener('touchstart', onTS, { passive: true });
        cv.addEventListener('touchend', onTE, { passive: true });
        cv.addEventListener('click', function () { if (!running) start(); });

        root.querySelectorAll('#snPad button').forEach(function (b) {
            bindHold(b, function () { turn(b.getAttribute('data-d')); }, 260, 120);
        });
        root.querySelector('#snStart').addEventListener('click', start);

        snake = [[9, 9], [8, 9], [7, 9]];
        dir = 'right';
        food = [13, 9];
        draw();

        return {
            destroy: function () {
                stopTimer();
                document.removeEventListener('keydown', onKey);
                document.removeEventListener('visibilitychange', onVis);
            }
        };
    }

    /* ═══════ 10) 2048 ═══════ */
    function start2048(root) {
        var grid, scoreNow, over, won;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'g4Score', '0')
            + srItem('trophy', gt('الأفضل', 'Best'), 'g4Best', score('2048').best || 0)
            + '</div>'
            + '<div class="g4-grid" id="g4Grid"></div>'
            + '<div class="gm-status" id="g4Status"></div>'
            + '<button class="gm-btn" id="g4Reset">' + gt('لعبة جديدة', 'New game') + '</button>';

        var gridEl = root.querySelector('#g4Grid');
        var statusEl = root.querySelector('#g4Status');
        stat(statusEl, gt('الأسهم أو السحب لدمج الأرقام', 'Arrows or swipe to merge tiles'));

        function addTile() {
            var free = [];
            for (var i = 0; i < 16; i++) if (!grid[i]) free.push(i);
            if (!free.length) return -1;
            var at = free[rnd(free.length)];
            grid[at] = Math.random() < 0.9 ? 2 : 4;
            return at;
        }
        function paint(popIdx) {
            gridEl.innerHTML = '';
            for (var i = 0; i < 16; i++) {
                var d = document.createElement('div');
                var v = grid[i];
                d.className = 'g4-cell' + (v ? ' t' + (v > 2048 ? 'big' : v) : '');
                if (v) d.textContent = v;
                if (popIdx === i) d.classList.add('pop');
                gridEl.appendChild(d);
            }
            root.querySelector('#g4Score').textContent = scoreNow;
        }
        function slideRow(row) {
            var vals = row.filter(function (v) { return v; });
            var out = [], gain = 0;
            for (var i = 0; i < vals.length; i++) {
                if (vals[i] === vals[i + 1]) {
                    out.push(vals[i] * 2);
                    gain += vals[i] * 2;
                    if (vals[i] * 2 === 2048) won = true;
                    i++;
                } else out.push(vals[i]);
            }
            while (out.length < 4) out.push(0);
            var moved = false;
            for (var j = 0; j < 4; j++) if (out[j] !== row[j]) moved = true;
            return { row: out, gain: gain, moved: moved };
        }
        var LINES = {
            left: [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]],
            right: [[3, 2, 1, 0], [7, 6, 5, 4], [11, 10, 9, 8], [15, 14, 13, 12]],
            up: [[0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15]],
            down: [[12, 8, 4, 0], [13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3]]
        };
        function move(dirName) {
            if (over) return;
            var lines = LINES[dirName];
            var movedAny = false;
            for (var li = 0; li < 4; li++) {
                var idxs = lines[li];
                var row = idxs.map(function (ix) { return grid[ix]; });
                var r = slideRow(row);
                if (r.moved) {
                    movedAny = true;
                    scoreNow += r.gain;
                    for (var k = 0; k < 4; k++) grid[idxs[k]] = r.row[k];
                }
            }
            if (!movedAny) return;
            var newIdx = addTile();
            paint(newIdx);
            var s = score('2048');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('2048', s); root.querySelector('#g4Best').textContent = scoreNow; }
            if (isStuck()) {
                over = true;
                stat(statusEl, gt('انتهت اللعبة! النقاط: ', 'Game over! Score: ') + scoreNow, 'bad');
            } else if (won) {
                won = false;
                stat(statusEl, gt('وصلت 2048! كمّل لو عايز', 'You reached 2048! Keep going'), 'ok');
            }
        }
        function isStuck() {
            for (var i = 0; i < 16; i++) {
                if (!grid[i]) return false;
                var r = (i % 4 < 3) ? grid[i + 1] : null;
                var b = (i < 12) ? grid[i + 4] : null;
                if (grid[i] === r || grid[i] === b) return false;
            }
            return true;
        }
        function reset() {
            grid = [];
            for (var i = 0; i < 16; i++) grid.push(0);
            scoreNow = 0; over = false; won = false;
            addTile(); addTile();
            stat(statusEl, gt('الأسهم أو السحب لدمج الأرقام', 'Arrows or swipe to merge tiles'));
            paint();
        }

        function onKey(e) {
            var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
            var d = map[e.key];
            if (d) { e.preventDefault(); move(d); }
        }
        document.addEventListener('keydown', onKey);

        var tsX = 0, tsY = 0;
        function onTS(e) { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; }
        function onTE(e) {
            var dx = e.changedTouches[0].clientX - tsX;
            var dy = e.changedTouches[0].clientY - tsY;
            if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
            if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
            else move(dy > 0 ? 'down' : 'up');
        }
        gridEl.addEventListener('touchstart', onTS, { passive: true });
        gridEl.addEventListener('touchend', onTE, { passive: true });

        root.querySelector('#g4Reset').addEventListener('click', reset);
        reset();
        return {
            destroy: function () { document.removeEventListener('keydown', onKey); }
        };
    }

    /* ═══════ 11) TETRIS ═══════ */
    function startTetris(root) {
        var COLS = 10, ROWS = 18;
        var SHAPES = [
            { m: [[1, 1, 1, 1]], c: '#4a90d9' },
            { m: [[1, 1], [1, 1]], c: '#e8b93d' },
            { m: [[0, 1, 0], [1, 1, 1]], c: '#9d4edd' },
            { m: [[0, 1, 1], [1, 1, 0]], c: '#2f9e6e' },
            { m: [[1, 1, 0], [0, 1, 1]], c: '#d9534f' },
            { m: [[1, 0, 0], [1, 1, 1]], c: '#3e8e7e' },
            { m: [[0, 0, 1], [1, 1, 1]], c: '#f2913d' }
        ];
        var timer = null, board, cur, next, scoreNow, lines, level, over, running = false;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'tzScore', '0')
            + srItem('g2048', gt('صفوف', 'Lines'), 'tzLines', '0')
            + srItem('trophy', gt('الأفضل', 'Best'), 'tzBest', score('tetris').best || 0)
            + '</div>'
            + '<div class="tz-wrap"><canvas id="tzCanvas" class="sn-canvas"></canvas>'
            + '<canvas id="tzNext" class="tz-next"></canvas></div>'
            + '<div class="gm-status" id="tzStatus"></div>'
            + '<div class="tz-controls" id="tzCtl">'
            + '<button data-a="left">◀</button><button data-a="rot">⟳</button><button data-a="right">▶</button>'
            + '<button data-a="down">▼</button><button data-a="drop">⤓</button>'
            + '</div>'
            + '<button class="gm-btn" id="tzStart">' + gt('ابدأ', 'Start') + '</button>';

        var cv = root.querySelector('#tzCanvas');
        var ctx = cv.getContext('2d');
        var ncv = root.querySelector('#tzNext');
        var nctx = ncv.getContext('2d');
        var cell = 19;
        cv.width = COLS * cell;
        cv.height = ROWS * cell;
        ncv.width = 4 * 13;
        ncv.height = 4 * 13;
        var statusEl = root.querySelector('#tzStatus');
        stat(statusEl, gt('حرّك بالأزرار أو اسحب على اللوحة — نقرة = لف', 'Use the buttons or swipe the board — tap rotates'));

        function randShape() {
            var s = SHAPES[rnd(SHAPES.length)];
            return { m: s.m.map(function (r) { return r.slice(); }), c: s.c };
        }
        function rotate(m) {
            var h = m.length, w = m[0].length, out = [];
            for (var x = 0; x < w; x++) {
                var row = [];
                for (var y = h - 1; y >= 0; y--) row.push(m[y][x]);
                out.push(row);
            }
            return out;
        }
        function collide(px, py, m) {
            for (var y = 0; y < m.length; y++) {
                for (var x = 0; x < m[y].length; x++) {
                    if (!m[y][x]) continue;
                    var bx = px + x, by = py + y;
                    if (bx < 0 || bx >= COLS || by >= ROWS) return true;
                    if (by >= 0 && board[by * COLS + bx]) return true;
                }
            }
            return false;
        }
        function spawn() {
            cur = next || randShape();
            next = randShape();
            cur.x = Math.floor((COLS - cur.m[0].length) / 2);
            cur.y = 0;
            drawNext();
            if (collide(cur.x, cur.y, cur.m)) gameOver();
        }
        function merge() {
            for (var y = 0; y < cur.m.length; y++) {
                for (var x = 0; x < cur.m[y].length; x++) {
                    if (cur.m[y][x]) {
                        var by = cur.y + y;
                        if (by < 0) { gameOver(); return; }
                        board[by * COLS + cur.x + x] = cur.c;
                    }
                }
            }
        }
        function clearLines() {
            var cleared = 0;
            for (var r = ROWS - 1; r >= 0; r--) {
                var full = true;
                for (var c = 0; c < COLS; c++) if (!board[r * COLS + c]) { full = false; break; }
                if (full) {
                    board.splice(r * COLS, COLS);
                    for (var k = 0; k < COLS; k++) board.unshift('');
                    cleared++;
                    r++;
                }
            }
            if (cleared) {
                beep(400 + cleared * 120, 0.12);
                scoreNow += [0, 100, 300, 500, 800][cleared] * (level + 1);
                lines += cleared;
                var nl = Math.floor(lines / 10);
                if (nl !== level) { level = nl; restartTimer(); }
                root.querySelector('#tzScore').textContent = scoreNow;
                root.querySelector('#tzLines').textContent = lines;
                var s = score('tetris');
                if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('tetris', s); root.querySelector('#tzBest').textContent = scoreNow; }
            }
        }
        function speedMs() { return Math.max(110, 520 - level * 40); }
        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        function restartTimer() { stopTimer(); timer = setInterval(step, speedMs()); }
        function gameOver() {
            stopTimer();
            running = false;
            over = true;
            stat(statusEl, gt('انتهت! النقاط: ', 'Game over! Score: ') + scoreNow, 'bad');
            root.querySelector('#tzStart').textContent = gt('العب تاني', 'Play again');
        }
        function step() {
            if (over) return;
            if (!collide(cur.x, cur.y + 1, cur.m)) cur.y++;
            else {
                merge();
                if (over) return;
                clearLines();
                spawn();
            }
            draw();
        }
        function act(a) {
            if (!running || over) return;
            if (a === 'left' && !collide(cur.x - 1, cur.y, cur.m)) cur.x--;
            else if (a === 'right' && !collide(cur.x + 1, cur.y, cur.m)) cur.x++;
            else if (a === 'down') step();
            else if (a === 'rot') {
                var rm = rotate(cur.m);
                var kicks = [0, -1, 1, -2, 2];
                for (var i = 0; i < kicks.length; i++) {
                    if (!collide(cur.x + kicks[i], cur.y, rm)) {
                        cur.x += kicks[i];
                        cur.m = rm;
                        break;
                    }
                }
            } else if (a === 'drop') {
                while (!collide(cur.x, cur.y + 1, cur.m)) cur.y++;
                step();
            }
            draw();
        }
        function draw() {
            ctx.fillStyle = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            ctx.fillRect(0, 0, cv.width, cv.height);
            for (var i = 0; i < board.length; i++) {
                if (board[i]) {
                    ctx.fillStyle = board[i];
                    ctx.fillRect((i % COLS) * cell + 1, Math.floor(i / COLS) * cell + 1, cell - 2, cell - 2);
                }
            }
            if (cur && running) {
                ctx.fillStyle = cur.c;
                for (var y = 0; y < cur.m.length; y++) {
                    for (var x = 0; x < cur.m[y].length; x++) {
                        if (cur.m[y][x] && cur.y + y >= 0) {
                            ctx.fillRect((cur.x + x) * cell + 1, (cur.y + y) * cell + 1, cell - 2, cell - 2);
                        }
                    }
                }
            }
        }
        function drawNext() {
            nctx.fillStyle = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            nctx.fillRect(0, 0, ncv.width, ncv.height);
            if (!next) return;
            nctx.fillStyle = next.c;
            var offX = Math.floor((4 - next.m[0].length) / 2);
            var offY = Math.floor((4 - next.m.length) / 2);
            for (var y = 0; y < next.m.length; y++) {
                for (var x = 0; x < next.m[y].length; x++) {
                    if (next.m[y][x]) nctx.fillRect((offX + x) * 13 + 1, (offY + y) * 13 + 1, 11, 11);
                }
            }
        }
        function start() {
            board = [];
            for (var i = 0; i < COLS * ROWS; i++) board.push('');
            scoreNow = 0; lines = 0; level = 0; over = false; running = true;
            next = null;
            root.querySelector('#tzScore').textContent = '0';
            root.querySelector('#tzLines').textContent = '0';
            stat(statusEl, gt('يلا!', 'Go!'));
            root.querySelector('#tzStart').textContent = gt('إعادة', 'Restart');
            spawn();
            draw();
            restartTimer();
        }
        function onKey(e) {
            if (!running) return;
            var map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rot', ' ': 'drop' };
            var a = map[e.key];
            if (a) { e.preventDefault(); act(a); }
        }
        document.addEventListener('keydown', onKey);

        // touch gestures on the board: drag horizontally to move,
        // tap to rotate, fast swipe down to hard-drop
        var pd = null, movedCols = 0;
        cv.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            if (!running) { start(); pd = null; return; }
            pd = { x: e.clientX, y: e.clientY, t: Date.now(), lastX: e.clientX };
            movedCols = 0;
        });
        cv.addEventListener('pointermove', function (e) {
            if (!pd || !running) return;
            var dx = e.clientX - pd.lastX;
            var stepPx = 22;
            while (dx >= stepPx) { act('right'); pd.lastX += stepPx; dx -= stepPx; movedCols++; }
            while (dx <= -stepPx) { act('left'); pd.lastX -= stepPx; dx += stepPx; movedCols++; }
        });
        cv.addEventListener('pointerup', function (e) {
            if (!pd || !running) { pd = null; return; }
            var dy = e.clientY - pd.y;
            var dt = Date.now() - pd.t;
            var dx = Math.abs(e.clientX - pd.x);
            if (!movedCols && dx < 12 && Math.abs(dy) < 12) act('rot');       // tap
            else if (dy > 55 && dt < 300) act('drop');                        // flick down
            pd = null;
        });

        root.querySelectorAll('#tzCtl button').forEach(function (b) {
            var a = b.getAttribute('data-a');
            if (a === 'left' || a === 'right' || a === 'down') {
                bindHold(b, function () { act(a); }, 260, 80);
            } else {
                b.addEventListener('click', function () { act(a); });
            }
        });
        root.querySelector('#tzStart').addEventListener('click', start);
        draw();
        return {
            destroy: function () {
                stopTimer();
                document.removeEventListener('keydown', onKey);
            }
        };
    }

    /* ═══════ 12) BREAKOUT ═══════ */
    function startBreakout(root) {
        var W, H, raf = null, running = false;
        var paddle, ball, bricks, scoreNow, livesNow, levelNow;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'bkScore', '0')
            + srItem('heart', gt('محاولات', 'Lives'), 'bkLives', '3')
            + srItem('trophy', gt('الأفضل', 'Best'), 'bkBest', score('breakout').best || 0)
            + '</div>'
            + '<canvas id="bkCanvas" class="sn-canvas"></canvas>'
            + '<div class="gm-status" id="bkStatus"></div>'
            + '<button class="gm-btn" id="bkStart">' + gt('ابدأ', 'Start') + '</button>';

        var cv = root.querySelector('#bkCanvas');
        var ctx = cv.getContext('2d');
        W = Math.min(340, (root.clientWidth || 320) - 8);
        H = Math.round(W * 0.88);
        cv.width = W;
        cv.height = H;
        var statusEl = root.querySelector('#bkStatus');
        stat(statusEl, gt('حرّك صباعك أو الماوس في أي مكان باللوحة', 'Slide your finger or mouse anywhere on the board'));

        var BR_COLS = 7, BR_ROWS = 5, BR_H = 14, BR_GAP = 5, BR_TOP = 32, BR_PAD = 8;
        var BR_W = (W - BR_PAD * 2 - BR_GAP * (BR_COLS - 1)) / BR_COLS;
        var ROW_COLORS = ['#d9534f', '#f2913d', '#e8b93d', '#2f9e6e', '#4a90d9'];

        function buildBricks() {
            bricks = [];
            for (var r = 0; r < BR_ROWS; r++) {
                for (var c = 0; c < BR_COLS; c++) {
                    bricks.push({ x: BR_PAD + c * (BR_W + BR_GAP), y: BR_TOP + r * (BR_H + BR_GAP), c: ROW_COLORS[r], alive: true });
                }
            }
        }
        function resetBall() {
            ball = { x: paddle.x + paddle.w / 2, y: H - 26, vx: 0, vy: 0, r: 5.5, stuck: true };
        }
        function launch() {
            if (!ball.stuck) return;
            ball.stuck = false;
            var sp = 3 + levelNow * 0.4;
            ball.vx = (Math.random() < 0.5 ? -1 : 1) * sp * 0.6;
            ball.vy = -sp;
        }
        function loseLife() {
            livesNow--;
            root.querySelector('#bkLives').textContent = livesNow;
            if (livesNow <= 0) {
                running = false;
                if (raf) { cancelAnimationFrame(raf); raf = null; }
                root.style.touchAction = '';
                var s = score('breakout');
                if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('breakout', s); root.querySelector('#bkBest').textContent = scoreNow; }
                stat(statusEl, gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow, 'bad');
                root.querySelector('#bkStart').textContent = gt('العب تاني', 'Play again');
            } else {
                resetBall();
            }
        }
        function loop() {
            if (!running) return;
            if (ball.stuck) {
                ball.x = paddle.x + paddle.w / 2;
                ball.y = H - 26;
            } else {
                ball.x += ball.vx;
                ball.y += ball.vy;
                if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
                if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
                if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
                if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h + 6
                    && ball.x >= paddle.x - ball.r && ball.x <= paddle.x + paddle.w + ball.r) {
                    var rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                    var sp = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                    ball.vx = rel * sp * 0.85;
                    ball.vy = -Math.abs(Math.sqrt(Math.max(sp * sp - ball.vx * ball.vx, 1)));
                }
                var aliveCount = 0;
                for (var i = 0; i < bricks.length; i++) {
                    var b = bricks[i];
                    if (!b.alive) continue;
                    aliveCount++;
                    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + BR_W
                        && ball.y + ball.r > b.y && ball.y - ball.r < b.y + BR_H) {
                        b.alive = false;
                        aliveCount--;
                        scoreNow += 10;
                        root.querySelector('#bkScore').textContent = scoreNow;
                        ball.vy = -ball.vy;
                        beep(500 + rnd(200), 0.04);
                        break;
                    }
                }
                if (!aliveCount) {
                    levelNow++;
                    stat(statusEl, gt('مستوى ', 'Level ') + levelNow + '!', 'ok');
                    buildBricks();
                    resetBall();
                }
                if (ball.y - ball.r > H) loseLife();
            }
            drawAll();
            raf = requestAnimationFrame(loop);
        }
        function drawAll() {
            ctx.fillStyle = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            ctx.fillRect(0, 0, W, H);
            for (var i = 0; i < bricks.length; i++) {
                var b = bricks[i];
                if (!b.alive) continue;
                ctx.fillStyle = b.c;
                ctx.fillRect(b.x, b.y, BR_W, BR_H);
            }
            ctx.fillStyle = cssVar('--accent', '#3e8e7e');
            ctx.beginPath();
            if (ctx.roundRect) { ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5); ctx.fill(); }
            else ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fillStyle = '#e05d5d';
            ctx.fill();
        }
        function start() {
            if (raf) cancelAnimationFrame(raf);
            paddle = { x: W / 2 - 40, y: H - 16, w: 80, h: 9 };
            scoreNow = 0; livesNow = 3; levelNow = 1; running = true;
            root.style.touchAction = 'none'; // the whole game area steers the paddle
            root.querySelector('#bkScore').textContent = '0';
            root.querySelector('#bkLives').textContent = '3';
            stat(statusEl, gt('اضغط في أي مكان لإطلاق الكرة', 'Tap anywhere to launch the ball'));
            root.querySelector('#bkStart').textContent = gt('إعادة', 'Restart');
            buildBricks();
            resetBall();
            raf = requestAnimationFrame(loop);
        }
        function movePaddle(clientX) {
            var rect = cv.getBoundingClientRect();
            var x = (clientX - rect.left) * (W / rect.width);
            paddle.x = Math.max(0, Math.min(x - paddle.w / 2, W - paddle.w));
        }
        // steer from the whole game body — the finger doesn't cover the paddle
        function onMove(e) {
            if (!running) return;
            movePaddle(e.clientX);
        }
        function onDown(e) {
            if (!running) return;
            if (e.target.closest('button')) return; // let buttons work
            e.preventDefault();
            movePaddle(e.clientX);
            launch();
        }
        root.addEventListener('pointermove', onMove);
        root.addEventListener('pointerdown', onDown);

        paddle = { x: W / 2 - 40, y: H - 16, w: 80, h: 9 };
        buildBricks();
        resetBall();
        drawAll();

        root.querySelector('#bkStart').addEventListener('click', start);
        return {
            destroy: function () {
                running = false;
                if (raf) cancelAnimationFrame(raf);
                root.style.touchAction = '';
            }
        };
    }

    /* ═══════ 13) WHACK-A-MOLE (custom SVG mole) ═══════ */
    var MOLE_HOLE_SVG = '<svg width="46" height="46" viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="8.5" ry="3.4" fill="rgba(0,0,0,.28)"/><ellipse cx="12" cy="15.4" rx="8.5" ry="3.4" fill="rgba(0,0,0,.45)"/></svg>';
    var MOLE_UP_SVG = '<svg width="46" height="46" viewBox="0 0 24 24">'
        + '<ellipse cx="12" cy="19" rx="8.5" ry="3" fill="rgba(0,0,0,.35)"/>'
        + '<path d="M5 19v-7a7 7 0 0 1 14 0v7z" fill="#b98a5e" stroke="#8a6544" stroke-width="1"/>'
        + '<circle cx="9.4" cy="11.5" r="1.1" fill="#33261a"/>'
        + '<circle cx="14.6" cy="11.5" r="1.1" fill="#33261a"/>'
        + '<ellipse cx="12" cy="14.8" rx="1.7" ry="1.2" fill="#e8a0a0"/>'
        + '<path d="M10.6 16.5c.9.7 1.9.7 2.8 0" stroke="#33261a" stroke-width=".9" fill="none" stroke-linecap="round"/>'
        + '</svg>';
    var MOLE_HIT_SVG = '<svg width="46" height="46" viewBox="0 0 24 24"><polygon points="12 2 14 8.5 21 6 16.5 11.5 22 15 15 15.5 16 22 12 17 8 22 9 15.5 2 15 7.5 11.5 3 6 10 8.5" fill="#e8b93d" stroke="#c99a1e" stroke-width=".8"/></svg>';
    function startMole(root) {
        var DURATION = 30;
        var scoreNow, left, moleAt = -1, running = false;
        var clockTimer = null, popTimer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'moScore', '0')
            + srItem('clock', gt('الوقت', 'Time'), 'moTime', DURATION + 's')
            + srItem('trophy', gt('الأفضل', 'Best'), 'moBest', score('mole').best || 0)
            + '</div>'
            + '<div class="mo-grid" id="moGrid"></div>'
            + '<div class="gm-status" id="moStatus"></div>'
            + '<button class="gm-btn" id="moStart">' + gt('ابدأ', 'Start') + '</button>';

        var gridEl = root.querySelector('#moGrid');
        var statusEl = root.querySelector('#moStatus');
        stat(statusEl, gt('اضرب الخلد قبل ما يختفي', 'Whack the mole before it hides'));
        var holes = [];
        for (var i = 0; i < 9; i++) {
            var b = document.createElement('button');
            b.className = 'mo-hole';
            b.innerHTML = MOLE_HOLE_SVG;
            (function (idx, btn) {
                btn.addEventListener('pointerdown', function (e) {
                    e.preventDefault();
                    if (!running || idx !== moleAt) return;
                    scoreNow++;
                    root.querySelector('#moScore').textContent = scoreNow;
                    btn.innerHTML = MOLE_HIT_SVG;
                    beep(600, 0.05);
                    hideMole(btn);
                    popTimer = setTimeout(popMole, 180);
                });
            })(i, b);
            gridEl.appendChild(b);
            holes.push(b);
        }

        function hideMole(exceptBtn) {
            if (moleAt >= 0 && holes[moleAt] !== exceptBtn) holes[moleAt].innerHTML = MOLE_HOLE_SVG;
            moleAt = -1;
            if (popTimer) { clearTimeout(popTimer); popTimer = null; }
        }
        function popMole() {
            if (!running) return;
            hideMole();
            for (var k = 0; k < 9; k++) holes[k].innerHTML = MOLE_HOLE_SVG;
            var next = rnd(9);
            moleAt = next;
            holes[next].innerHTML = MOLE_UP_SVG;
            var upFor = Math.max(450, 900 - scoreNow * 18);
            popTimer = setTimeout(function () {
                hideMole();
                popTimer = setTimeout(popMole, 150 + rnd(250));
            }, upFor);
        }
        function finish() {
            running = false;
            if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
            hideMole();
            var s = score('mole');
            if (scoreNow > (s.best || 0)) {
                s.best = scoreNow; saveScore('mole', s);
                root.querySelector('#moBest').textContent = scoreNow;
                stat(statusEl, gt('رقم قياسي: ', 'New record: ') + scoreNow, 'ok');
            } else {
                stat(statusEl, gt('انتهى الوقت! النتيجة: ', 'Time\'s up! Score: ') + scoreNow);
            }
            root.querySelector('#moStart').textContent = gt('العب تاني', 'Play again');
        }
        function start() {
            if (clockTimer) clearInterval(clockTimer);
            hideMole();
            scoreNow = 0; left = DURATION; running = true;
            root.querySelector('#moScore').textContent = '0';
            root.querySelector('#moTime').textContent = left + 's';
            stat(statusEl, gt('يلا!', 'Go!'));
            popMole();
            clockTimer = setInterval(function () {
                left--;
                root.querySelector('#moTime').textContent = left + 's';
                if (left <= 0) finish();
            }, 1000);
        }
        root.querySelector('#moStart').addEventListener('click', start);
        return {
            destroy: function () {
                running = false;
                if (clockTimer) clearInterval(clockTimer);
                if (popTimer) clearTimeout(popTimer);
            }
        };
    }

    /* ═══════ 14) FLAPPY (custom drawn bird) ═══════ */
    function startFlappy(root) {
        var W, H, cv, ctx, raf = null, running = false;
        var bird, pipes, scoreNow, wingT = 0;
        var GRAV = 0.45, JUMP = -7.4, PIPE_W = 52, GAP = 150, SPEED = 2.6, SPACING = 190;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('star', gt('النقاط', 'Score'), 'flScore', '0')
            + srItem('trophy', gt('الأفضل', 'Best'), 'flBest', score('flappy').best || 0)
            + '</div>'
            + '<canvas id="flCanvas" class="sn-canvas"></canvas>'
            + '<div class="gm-status" id="flStatus"></div>'
            + '<button class="gm-btn" id="flStart">' + gt('ابدأ', 'Start') + '</button>';

        cv = root.querySelector('#flCanvas');
        ctx = cv.getContext('2d');
        W = Math.min(340, (root.clientWidth || 320) - 8);
        H = Math.round(W * 1.15);
        cv.width = W;
        cv.height = H;
        var statusEl = root.querySelector('#flStatus');
        stat(statusEl, gt('اضغط الشاشة أو المسطرة للطيران', 'Tap the screen or press Space to fly'));

        function reset() {
            bird = { x: W * 0.28, y: H * 0.45, vy: 0, r: 11 };
            pipes = [];
            scoreNow = 0;
            root.querySelector('#flScore').textContent = '0';
        }
        function spawnPipe() {
            var top = 40 + rnd(H - GAP - 120);
            pipes.push({ x: W + 10, top: top, passed: false });
        }
        function flap() {
            if (!running) return;
            bird.vy = JUMP;
            wingT = 6;
        }
        function drawBird() {
            var tilt = Math.max(-0.45, Math.min(0.6, bird.vy * 0.06));
            ctx.save();
            ctx.translate(bird.x, bird.y);
            ctx.rotate(tilt);
            // body
            ctx.fillStyle = '#e8b93d';
            ctx.beginPath();
            ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
            ctx.fill();
            // wing (flaps briefly after each tap)
            ctx.fillStyle = '#d9a52e';
            ctx.beginPath();
            ctx.ellipse(-3, wingT > 0 ? -2 : 2, 5.5, 3.4, -0.4, 0, Math.PI * 2);
            ctx.fill();
            // eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(4.2, -3.4, 2.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#26221c';
            ctx.beginPath();
            ctx.arc(4.9, -3.4, 1.3, 0, Math.PI * 2);
            ctx.fill();
            // beak
            ctx.fillStyle = '#f2913d';
            ctx.beginPath();
            ctx.moveTo(bird.r - 2, -1.5);
            ctx.lineTo(bird.r + 6, 0.5);
            ctx.lineTo(bird.r - 2, 2.8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            if (wingT > 0) wingT--;
        }
        function drawAll() {
            ctx.fillStyle = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            ctx.fillRect(0, 0, W, H);
            var acc = cssVar('--accent', '#3e8e7e');
            var accDeep = cssVar('--accent2', '#357a6c');
            for (var i = 0; i < pipes.length; i++) {
                var p = pipes[i];
                ctx.fillStyle = acc;
                ctx.fillRect(p.x, 0, PIPE_W, p.top);
                ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
                ctx.fillStyle = accDeep;
                ctx.fillRect(p.x - 3, p.top - 11, PIPE_W + 6, 11);
                ctx.fillRect(p.x - 3, p.top + GAP, PIPE_W + 6, 11);
            }
            drawBird();
        }
        function gameOver() {
            running = false;
            if (raf) { cancelAnimationFrame(raf); raf = null; }
            beep(150, 0.25, 'square');
            var s = score('flappy');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('flappy', s); root.querySelector('#flBest').textContent = scoreNow; }
            stat(statusEl, gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow, 'bad');
            root.querySelector('#flStart').textContent = gt('العب تاني', 'Play again');
        }
        function loop() {
            if (!running) return;
            bird.vy += GRAV;
            bird.y += bird.vy;
            if (!pipes.length || (W + 10) - pipes[pipes.length - 1].x >= SPACING) spawnPipe();
            for (var i = pipes.length - 1; i >= 0; i--) {
                var p = pipes[i];
                p.x -= SPEED;
                if (!p.passed && p.x + PIPE_W < bird.x - bird.r) {
                    p.passed = true;
                    scoreNow++;
                    beep(700, 0.05);
                    root.querySelector('#flScore').textContent = scoreNow;
                }
                if (p.x + PIPE_W < -20) pipes.splice(i, 1);
            }
            if (bird.y + bird.r > H || bird.y - bird.r < 0) return gameOver();
            for (var j = 0; j < pipes.length; j++) {
                var q = pipes[j];
                if (bird.x + bird.r > q.x && bird.x - bird.r < q.x + PIPE_W) {
                    if (bird.y - bird.r < q.top || bird.y + bird.r > q.top + GAP) return gameOver();
                }
            }
            drawAll();
            raf = requestAnimationFrame(loop);
        }
        function start() {
            if (raf) cancelAnimationFrame(raf);
            reset();
            running = true;
            stat(statusEl, gt('طير!', 'Fly!'));
            root.querySelector('#flStart').textContent = gt('إعادة', 'Restart');
            raf = requestAnimationFrame(loop);
        }
        function onKey(e) {
            if (e.key === ' ' || e.key === 'ArrowUp') {
                if (running) { e.preventDefault(); flap(); }
            }
        }
        function onTap(e) {
            e.preventDefault();
            if (!running) { start(); return; } // tap the board to start
            flap();
        }
        document.addEventListener('keydown', onKey);
        cv.addEventListener('pointerdown', onTap);

        reset();
        drawAll();
        root.querySelector('#flStart').addEventListener('click', start);
        return {
            destroy: function () {
                running = false;
                if (raf) cancelAnimationFrame(raf);
                document.removeEventListener('keydown', onKey);
            }
        };
    }

    /* ═══════ 15) MINESWEEPER ═══════ */
    var MINE_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="6" fill="currentColor"/><line x1="12" y1="3.5" x2="12" y2="7"/><line x1="12" y1="19" x2="12" y2="22.5"/><line x1="2.5" y1="13" x2="6" y2="13"/><line x1="18" y1="13" x2="21.5" y2="13"/><line x1="5.3" y1="6.3" x2="7.8" y2="8.8"/><line x1="16.2" y1="17.2" x2="18.7" y2="19.7"/><line x1="18.7" y1="6.3" x2="16.2" y2="8.8"/><line x1="7.8" y1="17.2" x2="5.3" y2="19.7"/></svg>';
    var FLAG_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d9534f" stroke-width="2.2" stroke-linecap="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5" fill="#d9534f"/></svg>';
    function startMines(root) {
        var N = 9, MINES = 10;
        var cells, opened, flagMode, started, over, secs, timer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + srItem('mines', gt('ألغام', 'Mines'), 'mnMines', MINES)
            + srItem('clock', gt('الوقت', 'Time'), 'mnTime', '0s')
            + srItem('trophy', gt('الأفضل', 'Best'), 'mnBest', score('mines').best ? score('mines').best + 's' : '—')
            + '</div>'
            + '<div class="mn-tools">'
            + '<button class="mn-flag" id="mnFlag">' + ic('flag', 13) + ' ' + gt('وضع الأعلام', 'Flag mode') + '</button>'
            + '</div>'
            + '<div class="mn-grid" id="mnGrid"></div>'
            + '<div class="gm-status" id="mnStatus"></div>'
            + '<button class="gm-btn" id="mnReset">' + gt('لعبة جديدة', 'New game') + '</button>';

        var gridEl = root.querySelector('#mnGrid');
        var statusEl = root.querySelector('#mnStatus');
        var flagBtn = root.querySelector('#mnFlag');
        var HINT = gt('اكشف الخانات الآمنة — ضغطة مطوّلة أو وضع الأعلام للتعليم', 'Clear safe cells — long-press or flag mode to mark');
        stat(statusEl, HINT);

        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        function neighbors(i) {
            var out = [];
            var x = i % N, y = Math.floor(i / N);
            for (var dy = -1; dy <= 1; dy++) {
                for (var dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy) continue;
                    var nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < N && ny >= 0 && ny < N) out.push(ny * N + nx);
                }
            }
            return out;
        }
        function plant(safeAt) {
            var banned = {};
            banned[safeAt] = true;
            neighbors(safeAt).forEach(function (n) { banned[n] = true; });
            var placed = 0;
            while (placed < MINES) {
                var at = rnd(N * N);
                if (banned[at] || cells[at].mine) continue;
                cells[at].mine = true;
                placed++;
            }
            for (var i = 0; i < N * N; i++) {
                if (cells[i].mine) continue;
                var cnt = 0;
                neighbors(i).forEach(function (n) { if (cells[n].mine) cnt++; });
                cells[i].n = cnt;
            }
        }
        function paintCell(i) {
            var c = cells[i];
            var btn = gridEl.children[i];
            btn.className = 'mn-cell' + (c.open ? ' open n' + Math.min(c.n, 4) : '') + (over && c.mine ? ' boom' : '');
            if (c.open) btn.innerHTML = c.mine ? MINE_SVG : (c.n || '');
            else btn.innerHTML = c.flag ? FLAG_SVG : '';
        }
        function paintAll() { for (var i = 0; i < N * N; i++) paintCell(i); }
        function reveal(i) {
            var stack = [i];
            while (stack.length) {
                var at = stack.pop();
                var c = cells[at];
                if (c.open || c.flag) continue;
                c.open = true;
                opened++;
                if (c.n === 0 && !c.mine) {
                    neighbors(at).forEach(function (n) {
                        if (!cells[n].open && !cells[n].flag) stack.push(n);
                    });
                }
            }
        }
        function lose(atIdx) {
            over = true;
            stopTimer();
            for (var i = 0; i < N * N; i++) if (cells[i].mine) cells[i].open = true;
            paintAll();
            gridEl.children[atIdx].classList.add('hit');
            beep(110, 0.4, 'square');
            stat(statusEl, gt('لغم! حظ أوفر المرة الجاية', 'Boom! Better luck next time'), 'bad');
        }
        function checkWin() {
            if (opened === N * N - MINES) {
                over = true;
                stopTimer();
                var s = score('mines');
                if (!s.best || secs < s.best) {
                    s.best = secs; saveScore('mines', s);
                    root.querySelector('#mnBest').textContent = secs + 's';
                    stat(statusEl, gt('كسبت في ', 'You won in ') + secs + 's — ' + gt('رقم قياسي!', 'new record!'), 'ok');
                } else {
                    stat(statusEl, gt('كسبت في ', 'You won in ') + secs + 's', 'ok');
                }
            }
        }
        function clickCell(i, wantFlag) {
            if (over) return;
            var c = cells[i];
            if (!started) {
                if (wantFlag) return;
                started = true;
                plant(i);
                timer = setInterval(function () {
                    secs++;
                    root.querySelector('#mnTime').textContent = secs + 's';
                }, 1000);
            }
            if (wantFlag) {
                if (!c.open) { c.flag = !c.flag; paintCell(i); }
                return;
            }
            if (c.flag || c.open) return;
            if (c.mine) return lose(i);
            reveal(i);
            paintAll();
            checkWin();
        }
        function reset() {
            stopTimer();
            cells = [];
            for (var i = 0; i < N * N; i++) cells.push({ mine: false, open: false, flag: false, n: 0 });
            opened = 0; flagMode = false; started = false; over = false; secs = 0;
            flagBtn.classList.remove('on');
            root.querySelector('#mnTime').textContent = '0s';
            stat(statusEl, HINT);
            gridEl.innerHTML = '';
            for (var j = 0; j < N * N; j++) {
                var btn = document.createElement('button');
                btn.className = 'mn-cell';
                (function (idx, b) {
                    // long-press = flag (mobile), right-click = flag (desktop)
                    var lpTimer = null, lpFired = false;
                    b.addEventListener('pointerdown', function () {
                        lpFired = false;
                        lpTimer = setTimeout(function () {
                            lpFired = true;
                            clickCell(idx, true);
                        }, 420);
                    });
                    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
                        b.addEventListener(ev, function () { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } });
                    });
                    b.addEventListener('click', function () {
                        if (lpFired) { lpFired = false; return; }
                        clickCell(idx, flagMode);
                    });
                    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
                })(j, btn);
                gridEl.appendChild(btn);
            }
        }
        flagBtn.addEventListener('click', function () {
            flagMode = !flagMode;
            flagBtn.classList.toggle('on', flagMode);
        });
        root.querySelector('#mnReset').addEventListener('click', reset);
        reset();
        return { destroy: stopTimer };
    }

    /* ═══════ REGISTRY & EXPORT ═══════ */
    var STARTERS = {
        xo: startXO,
        c4: startC4,
        rps: startRPS,
        memory: startMemory,
        simon: startSimon,
        digits: startDigits,
        reaction: startReaction,
        math: startMath,
        snake: startSnake,
        '2048': start2048,
        tetris: startTetris,
        breakout: startBreakout,
        mole: startMole,
        flappy: startFlappy,
        mines: startMines
    };

    window.LordGames = {
        list: GAMES,
        match: matchGame,
        mount: mount,
        mountJoin: mountJoin,
        sweep: sweep,
        hubFrameHTML: hubFrameHTML,
        posterFrameHTML: posterFrameHTML,
        joinFrameHTML: joinFrameHTML,
        normalizeCode: normalizeCode,
        hasNet: function () { return !!netDb(); },
        copyCode: function (code) {
            try {
                navigator.clipboard.writeText(code).then(function () {
                    gToast('✓ ' + gt('اتنسخ — ابعته لصاحبك', 'Copied — send it to your friend'));
                });
            } catch (e) { }
        }
    };
})();
