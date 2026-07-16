/* ═══════════════════════════════════════════════════════════
   LORD AI — Games (inline-in-chat system)
   Games render INSIDE chat messages as .game-frame blocks:
   - [GAMEHUB]      → hub grid (solo + online sections)
   - [GAME:name]    → poster → click mounts the game in place
   - [GAMEJOIN:G-X] → joins an online room by code
   Online multiplayer (XO / Connect-4 / RPS) rides on Firestore
   ('lord_rooms' collection, one tiny doc per room, onSnapshot).
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
        { id: 'xo', name: 'إكس أو', en: 'Tic-Tac-Toe', emoji: '⭕', desc: 'تحدَّ ذكاءً لا يُهزم', descEn: 'Face an unbeatable AI', net: true, aliases: ['اكس او', 'xo', 'x o', 'tic tac', 'تيك تاك'] },
        { id: 'c4', name: 'أربعة في صف', en: 'Connect 4', emoji: '🔴', desc: 'اصطف أربع قطع قبل الخصم', descEn: 'Line up four before your rival', net: true, aliases: ['كونكت', 'connect', 'اربعة في صف', 'اربعه'] },
        { id: 'rps', name: 'حجر ورقة مقص', en: 'Rock Paper Scissors', emoji: '✂️', desc: 'الكلاسيكية — ضد الكمبيوتر', descEn: 'The classic vs computer', net: true, aliases: ['حجر', 'ورقة', 'مقص', 'rock', 'rps'] },
        { id: 'memory', name: 'الذاكرة', en: 'Memory', emoji: '🧠', desc: 'طابق الأزواج بأقل نقلات', descEn: 'Match pairs in fewest moves', aliases: ['ذاكرة', 'memory', 'كوتشينة', 'مطابقة'] },
        { id: 'simon', name: 'سلسلة الألوان', en: 'Simon', emoji: '🎨', desc: 'احفظ التسلسل وكرّره — بأصوات', descEn: 'Memorize and repeat — with sound', aliases: ['سايمون', 'simon', 'الوان', 'ألوان', 'تسلسل'] },
        { id: 'digits', name: 'ذاكرة الأرقام', en: 'Number Memory', emoji: '💭', desc: 'كم رقماً تحفظ في نظرة؟', descEn: 'How many digits can you hold?', aliases: ['ارقام', 'أرقام', 'digit', 'رقم'] },
        { id: 'reaction', name: 'رد الفعل', en: 'Reaction Time', emoji: '⚡', desc: 'قيس سرعتك بالملي ثانية', descEn: 'Measure your speed in ms', aliases: ['رد فعل', 'سرعة', 'reaction', 'رياكشن'] },
        { id: 'math', name: 'سباق الحساب', en: 'Math Sprint', emoji: '➗', desc: 'أكبر عدد إجابات في 30 ثانية', descEn: 'Solve as many as you can in 30s', aliases: ['حساب', 'رياضيات', 'math', 'جمع', 'ضرب'] },
        { id: 'snake', name: 'الثعبان', en: 'Snake', emoji: '🐍', desc: 'كُل التفاح واحذر من نفسك', descEn: 'Eat apples, don\'t bite yourself', aliases: ['ثعبان', 'snake', 'سنيك'] },
        { id: '2048', name: '2048', en: '2048', emoji: '🔢', desc: 'ادمج الأرقام ووصّل لـ 2048', descEn: 'Merge numbers to reach 2048', aliases: ['٢٠٤٨', '2048'] },
        { id: 'tetris', name: 'تتريس', en: 'Tetris', emoji: '🧩', desc: 'الكلاسيكية الخالدة — رتّب القطع', descEn: 'The timeless classic', aliases: ['tetris', 'مكعبات', 'تترس'] },
        { id: 'breakout', name: 'كسر الطوب', en: 'Breakout', emoji: '🧱', desc: 'حطّم كل الطوب بالكرة', descEn: 'Smash all the bricks', aliases: ['طوب', 'بريك', 'breakout', 'اركانويد'] },
        { id: 'mole', name: 'اضرب الخلد', en: 'Whack-a-Mole', emoji: '🐹', desc: 'اضرب أكبر عدد في 30 ثانية', descEn: 'Whack as many as you can in 30s', aliases: ['خلد', 'whack', 'mole', 'اضرب'] },
        { id: 'flappy', name: 'الطير النطاط', en: 'Flappy Bird', emoji: '🐤', desc: 'اضغط للطيران وتجنب الأعمدة', descEn: 'Tap to fly, dodge the pipes', aliases: ['فلابي', 'flappy', 'طير', 'عصفور', 'العصفورة'] },
        { id: 'mines', name: 'كاسحة الألغام', en: 'Minesweeper', emoji: '💣', desc: 'اكشف الخانات وتجنب الألغام', descEn: 'Clear the board, avoid the mines', aliases: ['الغام', 'ألغام', 'لغم', 'minesweeper', 'mines'] }
    ];

    function matchGame(name) {
        var q = (name || '').trim().toLowerCase();
        if (!q) return null;
        for (var i = 0; i < GAMES.length; i++) {
            var g = GAMES[i];
            var names = [g.name.toLowerCase(), g.en.toLowerCase()].concat(g.aliases || []);
            for (var j = 0; j < names.length; j++) {
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
            // avoid moves that let the opponent win right on top of ours
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

    var RPS_OPTS = [
        { id: 'rock', e: '✊', ar: 'حجر', en: 'Rock' },
        { id: 'paper', e: '✋', ar: 'ورقة', en: 'Paper' },
        { id: 'scissors', e: '✌️', ar: 'مقص', en: 'Scissors' }
    ];
    var RPS_BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    function rpsEmoji(id) {
        for (var i = 0; i < 3; i++) if (RPS_OPTS[i].id === id) return RPS_OPTS[i].e;
        return '❔';
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
            return '🏆 ' + (s.w || 0) + ' — ' + (s.l || 0) + ' 💀';
        }
        if (g.id === 'reaction') return s.best ? '⚡ ' + s.best + 'ms' : '';
        if (g.id === 'mines') return s.best ? '⏱ ' + s.best + 's' : '';
        return s.best ? '🏆 ' + s.best : '';
    }

    function posterInner(fid, g) {
        return '<button class="gf-poster" onclick="LordGames.mount(\'' + fid + '\',\'' + g.id + '\',false)">'
            + '<span class="gf-emoji">' + g.emoji + '</span>'
            + '<span class="gf-info"><span class="gf-name">' + esc(lang() === 'en' ? g.en : g.name) + '</span>'
            + '<span class="gf-sub">' + esc(lang() === 'en' ? g.descEn : g.desc) + '</span></span>'
            + '<span class="gf-play">▶ ' + gt('العب', 'Play') + '</span></button>';
    }
    function joinPosterInner(fid, code) {
        return '<button class="gf-poster" onclick="LordGames.mountJoin(\'' + fid + '\')">'
            + '<span class="gf-emoji">🌐</span>'
            + '<span class="gf-info"><span class="gf-name">' + gt('انضمام لروم ', 'Join room ') + esc(code) + '</span>'
            + '<span class="gf-sub">' + gt('لعب أونلاين مع صاحبك', 'Online multiplayer') + '</span></span>'
            + '<span class="gf-play">▶</span></button>';
    }
    function hubInner(fid) {
        function card(g, net) {
            var best = bestLine(g);
            return '<button class="gm-card" onclick="LordGames.mount(\'' + fid + '\',\'' + g.id + '\',' + (net ? 'true' : 'false') + ')">'
                + '<span class="gm-emoji">' + g.emoji + '</span>'
                + '<span class="gm-name">' + esc(lang() === 'en' ? g.en : g.name) + (net ? ' 🌐' : '') + '</span>'
                + '<span class="gm-desc">' + esc(net ? gt('العب مع صاحبك بكود', 'Play a friend via code') : (lang() === 'en' ? g.descEn : g.desc)) + '</span>'
                + (best && !net ? '<span class="gm-best">' + best + '</span>' : '')
                + '</button>';
        }
        var h = '<div class="gf-sec">🕹 ' + gt('العب لوحدك', 'Play solo') + '</div><div class="gm-grid">';
        for (var i = 0; i < GAMES.length; i++) h += card(GAMES[i], false);
        h += '</div>';
        if (netDb()) {
            h += '<div class="gf-sec">🌐 ' + gt('مع صاحبك أونلاين — اعمل روم وابعتله الكود', 'Online with a friend — create a room, share the code') + '</div><div class="gm-grid">';
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
        frame.classList.remove('gf-hubframe'); // hub padding is for the grid view only
        frame.innerHTML =
            '<div class="gf-head"><span class="gf-title">' + titleHTML + '</span>'
            + '<span class="gf-acts">'
            + (isHub ? '<button class="gf-hbtn" data-act="hub" title="' + gt('كل الألعاب', 'All games') + '">🎮</button>' : '')
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
        buildChrome(frame, g.emoji + ' ' + esc(lang() === 'en' ? g.en : g.name) + (net ? ' 🌐' : ''));
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
        buildChrome(frame, '🌐 ' + esc(code));
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
            if (d.host === me || d.guest === me) return d;   // rejoin
            if (d.guest) throw new Error(gt('الروم ده مليان بالفعل', 'This room is already full'));
            return ref.update({ guest: me, t: Date.now() }).then(function () { return d; });
        });
    }
    function waitingHTML(code) {
        return '<div class="net-wait">'
            + '<div class="gm-status">' + gt('ابعت الكود ده لصاحبك:', 'Send this code to your friend:') + '</div>'
            + '<div class="net-code" dir="ltr">' + esc(code) + '</div>'
            + '<button class="gm-btn" onclick="LordGames.copyCode(\'' + code + '\')">📋 ' + gt('نسخ الكود', 'Copy code') + '</button>'
            + '<div class="gm-status net-hint">' + gt('صاحبك يكتب الكود في شات LORD AI عنده — اللعبة هتبدأ أول ما يدخل ⏳', 'Your friend types this code in their LORD AI chat — the game starts once they join ⏳') + '</div>'
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
            body.innerHTML = '<div class="gm-status">⚠️ ' + gt('الأونلاين غير متاح دلوقتي', 'Online play is unavailable right now') + '</div>';
            return { destroy: cleanup };
        }
        function ref() { return db.collection('lord_rooms').doc(code); }
        function write(patch) {
            patch.t = Date.now();
            ref().update(patch).catch(function () { });
        }
        function fail(msg) {
            if (!alive) return;
            body.innerHTML = '<div class="gm-status">⚠️ ' + esc(msg) + '</div>'
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
                        if (tt) tt.textContent = gg.emoji + ' ' + (lang() === 'en' ? gg.en : gg.name) + ' 🌐';
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
                '<div class="gm-status">' + gt('العب مع صاحبك من أي جهاز 🌍', 'Play with a friend on any device 🌍') + '</div>'
                + '<button class="gm-btn" id="netCreate">➕ ' + gt('إنشاء روم جديد', 'Create a room') + '</button>'
                + '<div class="net-or">' + gt('— أو —', '— or —') + '</div>'
                + '<div class="net-row"><input class="net-input" id="netCode" maxlength="6" placeholder="G-ABCD" dir="ltr" autocomplete="off">'
                + '<button class="gm-btn" id="netJoin">' + gt('انضم', 'Join') + '</button></div>'
                + '<div class="gm-status" id="netMsg"></div>';
            body.querySelector('#netCreate').addEventListener('click', function () {
                body.innerHTML = '<div class="gm-status">⏳ ' + gt('جاري إنشاء الروم…', 'Creating room…') + '</div>';
                createRoom(gid).then(begin).catch(function () { fail(gt('معرفناش نعمل الروم — جرب تاني', 'Could not create the room — try again')); });
            });
            function doJoin() {
                var norm = normalizeCode(body.querySelector('#netCode').value);
                if (!norm) { body.querySelector('#netMsg').textContent = gt('اكتب كود صحيح زي G-ABCD', 'Enter a valid code like G-ABCD'); return; }
                body.innerHTML = '<div class="gm-status">⏳ ' + gt('جاري الانضمام…', 'Joining…') + '</div>';
                joinRoom(norm).then(function () { begin(norm); }).catch(function (e) { fail(e.message); });
            }
            body.querySelector('#netJoin').addEventListener('click', doJoin);
            body.querySelector('#netCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') doJoin(); });
        }
        if (pre && pre.code) {
            var norm = normalizeCode(pre.code);
            if (!norm) { fail(gt('كود غير صالح', 'Invalid code')); return { destroy: cleanup }; }
            body.innerHTML = '<div class="gm-status">⏳ ' + gt('جاري الانضمام…', 'Joining…') + '</div>';
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
            var h = netScoreRow(st, my) + '<div class="xo-board xo-net">';
            for (var i = 0; i < 9; i++) {
                var cls = 'xo-cell' + (st.b[i] === 'h' ? ' x' : st.b[i] === 'g' ? ' o' : '')
                    + (win && win.line.indexOf(i) !== -1 ? ' win' : '');
                h += '<button class="' + cls + '" data-i="' + i + '">' + (st.b[i] ? SYM[st.b[i]] : '') + '</button>';
            }
            h += '</div><div class="gm-status">';
            if (win) h += win.p === my ? '🎉 ' + gt('كسبت!', 'You win!') : '💀 ' + gt('خصمك كسب!', 'Rival wins!');
            else if (over) h += '🤝 ' + gt('تعادل!', 'Draw!');
            else h += st.n === my ? '👆 ' + gt('دورك — أنت ', 'Your turn — you are ') + SYM[my] : '⏳ ' + gt('دور خصمك…', 'Rival\'s turn…');
            h += '</div>';
            if (over) h += '<button class="gm-btn" id="netAgain">🔁 ' + gt('جولة جديدة', 'Rematch') + '</button>';
            body.innerHTML = h;
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
            var myDisc = my === 'h' ? '🔴' : '🟡';
            var h = netScoreRow(st, my) + '<div class="c4-grid c4-net" dir="ltr">';
            for (var i = 0; i < 42; i++) {
                var cls = 'c4-cell' + (st.b[i] === 'h' ? ' red' : st.b[i] === 'g' ? ' yel' : '')
                    + (win && win.line.indexOf(i) !== -1 ? ' win' : '');
                h += '<button class="' + cls + '" data-c="' + (i % 7) + '"></button>';
            }
            h += '</div><div class="gm-status">';
            if (win) h += win.p === my ? '🎉 ' + gt('كسبت!', 'You win!') : '💀 ' + gt('خصمك كسب!', 'Rival wins!');
            else if (over) h += '🤝 ' + gt('تعادل!', 'Draw!');
            else h += st.n === my ? '👆 ' + gt('دورك — قطعتك ', 'Your turn — your disc ') + myDisc : '⏳ ' + gt('دور خصمك…', 'Rival\'s turn…');
            h += '</div>';
            if (over) h += '<button class="gm-btn" id="netAgain">🔁 ' + gt('جولة جديدة', 'Rematch') + '</button>';
            body.innerHTML = h;
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
            // both picked but round not resolved (simultaneous submit race) → host resolves
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
            var oppShow = resolved ? rpsEmoji(oppPick) : (oppPick ? '🤔' : '❔');
            h += '<div class="rps-arena"><span>' + (myPick ? rpsEmoji(myPick) : '❔') + '</span><span class="rps-vs">VS</span><span>' + oppShow + '</span></div>';
            h += '<div class="gm-status">';
            if (resolved) {
                if (myPick === oppPick) h += '🤝 ' + gt('تعادل!', 'Draw!');
                else if (RPS_BEATS[myPick] === oppPick) h += '🎉 ' + gt('كسبت الجولة!', 'You win the round!');
                else h += '💀 ' + gt('خصمك كسب الجولة!', 'Rival wins the round!');
            } else if (myPick) h += '⏳ ' + gt('مستني خصمك يختار…', 'Waiting for your rival…');
            else h += '👆 ' + gt('اختار سلاحك', 'Pick your weapon');
            h += '</div>';
            if (!myPick && !resolved) {
                h += '<div class="rps-row" id="netRps">';
                for (var i = 0; i < 3; i++) {
                    var o = RPS_OPTS[i];
                    h += '<button data-id="' + o.id + '"><span>' + o.e + '</span><small>' + gt(o.ar, o.en) + '</small></button>';
                }
                h += '</div>';
            }
            if (resolved) h += '<button class="gm-btn" id="netAgain">▶ ' + gt('الجولة الجاية', 'Next round') + '</button>';
            body.innerHTML = h;
            var row = body.querySelector('#netRps');
            if (row) row.addEventListener('click', function (e) {
                var b = e.target.closest('button');
                if (!b) return;
                var pick = b.getAttribute('data-id');
                var ns = JSON.parse(JSON.stringify(st));
                ns[my] = pick;
                if (ns[opp]) { // I'm second — resolve in the same write
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
            if (!over) statusEl.textContent = gt('دورك — أنت X', 'Your turn — you are X');
        }
        function check() {
            var w = xoWin(board);
            if (w) {
                over = true;
                if (w.p === HU) { bumpWLD('xo', 'w'); statusEl.textContent = '🎉 ' + gt('مبروك! كسبت', 'You win!'); }
                else { bumpWLD('xo', 'l'); statusEl.textContent = '💀 ' + gt('الكمبيوتر كسب!', 'Computer wins!'); }
                paintScore();
                w.line.forEach(function (i) { boardEl.children[i].classList.add('win'); });
            } else if (!empties(board).length) {
                over = true;
                bumpWLD('xo', 'd');
                paintScore();
                statusEl.textContent = '🤝 ' + gt('تعادل!', 'Draw!');
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
                            statusEl.textContent = '🤖 …';
                            setTimeout(aiMove, 250);
                        }
                    });
                })(i);
                boardEl.appendChild(c);
            }
            if (humanStarts) {
                statusEl.textContent = gt('دورك — أنت X تبدأ', 'Your turn — you (X) start');
            } else {
                statusEl.textContent = gt('الكمبيوتر يبدأ…', 'Computer starts…');
                lock = true;
                setTimeout(function () {
                    var opens = [4, 0, 2, 6, 8];
                    board[hard ? opens[rnd(2) === 0 ? 0 : 1 + rnd(4)] : opens[rnd(5)]] = AI;
                    paint();
                    lock = false;
                    statusEl.textContent = gt('دورك — أنت X', 'Your turn — you are X');
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
            + '<div class="c4-grid" id="c4Grid" dir="ltr"></div>'
            + '<div class="gm-status" id="c4Status"></div>'
            + '<button class="gm-btn" id="c4Reset">' + gt('جولة جديدة', 'New round') + '</button>';

        var gridEl = root.querySelector('#c4Grid');
        var statusEl = root.querySelector('#c4Status');

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
                if (w.p === HU) { bumpWLD('c4', 'w'); statusEl.textContent = '🎉 ' + gt('كسبت! 🔴', 'You win! 🔴'); }
                else { bumpWLD('c4', 'l'); statusEl.textContent = '💀 ' + gt('الكمبيوتر كسب! 🟡', 'Computer wins! 🟡'); }
                paint(w.line);
            } else {
                bumpWLD('c4', 'd');
                statusEl.textContent = '🤝 ' + gt('تعادل!', 'Draw!');
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
            if (!over) statusEl.textContent = gt('دورك 🔴', 'Your turn 🔴');
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
                            statusEl.textContent = '🤖 …';
                            setTimeout(aiTurn, 300);
                        }
                    });
                })(j % 7);
                gridEl.appendChild(cell);
            }
            if (humanStarts) {
                statusEl.textContent = gt('دورك — قطعتك 🔴', 'Your turn — you are 🔴');
            } else {
                statusEl.textContent = gt('الكمبيوتر يبدأ…', 'Computer starts…');
                lock = true;
                setTimeout(function () {
                    drop(3, AI);
                    lock = false;
                    if (!over) statusEl.textContent = gt('دورك 🔴', 'Your turn 🔴');
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
            + '<div class="rps-arena"><span id="rpsYou">❔</span><span class="rps-vs">VS</span><span id="rpsCpu">❔</span></div>'
            + '<div class="gm-status" id="rpsStatus">' + gt('اختار سلاحك 👇', 'Pick your weapon 👇') + '</div>'
            + '<div class="rps-row" id="rpsRow">'
            + RPS_OPTS.map(function (o) {
                return '<button data-id="' + o.id + '"><span>' + o.e + '</span><small>' + gt(o.ar, o.en) + '</small></button>';
            }).join('')
            + '</div>';

        function paintScore() { root.querySelector('#rpsScore').innerHTML = wldHTML('rps'); }
        function play(mine) {
            if (revealing) return;
            revealing = true;
            var cpu = RPS_OPTS[rnd(3)];
            root.querySelector('#rpsYou').textContent = rpsEmoji(mine);
            var cpuEl = root.querySelector('#rpsCpu');
            cpuEl.textContent = '🤔';
            var statusEl = root.querySelector('#rpsStatus');
            statusEl.textContent = '…';
            revealTimer = setTimeout(function () {
                cpuEl.textContent = cpu.e;
                if (mine === cpu.id) { bumpWLD('rps', 'd'); statusEl.textContent = '🤝 ' + gt('تعادل!', 'Draw!'); }
                else if (RPS_BEATS[mine] === cpu.id) { bumpWLD('rps', 'w'); statusEl.textContent = '🎉 ' + gt('كسبت!', 'You win!'); }
                else { bumpWLD('rps', 'l'); statusEl.textContent = '💀 ' + gt('خسرت!', 'You lose!'); }
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

    /* ═══════ 4) MEMORY MATCH ═══════ */
    function startMemory(root) {
        var EMOJI = ['🍉', '🚀', '🎸', '🐪', '⚽', '🌙', '🍕', '🎁'];
        var moves, matched, first, lock, secs, timer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + '<span>' + gt('نقلات', 'Moves') + ': <b id="mmMoves">0</b></span>'
            + '<span>⏱ <b id="mmTime">0</b>s</span>'
            + '<span>🏆 <b id="mmBest">' + (score('memory').best || '—') + '</b></span>'
            + '</div>'
            + '<div class="mm-grid" id="mmGrid"></div>'
            + '<div class="gm-status" id="mmStatus">' + gt('طابق كل الأزواج بأقل نقلات', 'Match all pairs in fewest moves') + '</div>'
            + '<button class="gm-btn" id="mmReset">' + gt('لعبة جديدة', 'New game') + '</button>';

        var grid = root.querySelector('#mmGrid');

        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        function reset() {
            stopTimer();
            moves = 0; matched = 0; first = null; lock = false; secs = 0;
            root.querySelector('#mmMoves').textContent = '0';
            root.querySelector('#mmTime').textContent = '0';
            root.querySelector('#mmStatus').textContent = gt('طابق كل الأزواج بأقل نقلات', 'Match all pairs in fewest moves');
            var deck = shuffle(EMOJI.concat(EMOJI));
            grid.innerHTML = '';
            deck.forEach(function (em) {
                var c = document.createElement('button');
                c.className = 'mm-card';
                c.innerHTML = '<span class="mm-front">?</span><span class="mm-back">' + em + '</span>';
                c.setAttribute('data-e', em);
                c.addEventListener('click', function () { flip(c); });
                grid.appendChild(c);
            });
        }
        function flip(c) {
            if (lock || c === first || c.classList.contains('open') || c.classList.contains('ok')) return;
            if (!timer) timer = setInterval(function () {
                secs++;
                root.querySelector('#mmTime').textContent = secs;
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
                if (matched === EMOJI.length) {
                    stopTimer();
                    var s = score('memory');
                    if (!s.best || moves < s.best) { s.best = moves; saveScore('memory', s); root.querySelector('#mmBest').textContent = moves; }
                    root.querySelector('#mmStatus').textContent = '🎉 ' + gt('كسبت في ', 'You won in ') + moves + ' ' + gt('نقلة و', 'moves and ') + secs + 's';
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
            + '<span>' + gt('الجولة', 'Round') + ': <b id="siRound">0</b></span>'
            + '<span>🏆 <b id="siBest">' + (score('simon').best || 0) + '</b></span>'
            + '</div>'
            + '<div class="si-grid" id="siGrid">'
            + '<button class="si-pad si-g" data-p="0"></button>'
            + '<button class="si-pad si-r" data-p="1"></button>'
            + '<button class="si-pad si-y" data-p="2"></button>'
            + '<button class="si-pad si-b" data-p="3"></button>'
            + '</div>'
            + '<div class="gm-status" id="siStatus">' + gt('اضغط "ابدأ" واحفظ التسلسل', 'Press "Start" and memorize the sequence') + '</div>'
            + '<button class="gm-btn" id="siStart">' + gt('ابدأ', 'Start') + '</button>';

        var pads = root.querySelectorAll('.si-pad');
        var statusEl = root.querySelector('#siStatus');

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
            statusEl.textContent = '👀 ' + gt('ركّز…', 'Watch…');
            for (var i = 0; i < seq.length; i++) {
                (function (i2) {
                    later(function () {
                        flash(seq[i2]);
                        if (i2 === seq.length - 1) {
                            later(function () {
                                playing = false;
                                statusEl.textContent = '👆 ' + gt('كرّر التسلسل', 'Repeat the sequence');
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
                    statusEl.textContent = '✅ ' + gt('صح! الجولة ', 'Correct! Round ') + (done + 1);
                    later(nextRound, 800);
                }
            } else {
                over = true;
                beep(110, 0.35, 'square');
                statusEl.textContent = '💀 ' + gt('غلط! وصلت لجولة ', 'Wrong! You reached round ') + seq.length;
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
            + '<span>' + gt('الأرقام', 'Digits') + ': <b id="dgLvl">—</b></span>'
            + '<span>🏆 <b id="dgBest">' + (score('digits').best || 0) + '</b></span>'
            + '</div>'
            + '<div class="dg-display" id="dgDisp" dir="ltr">…</div>'
            + '<div class="net-row none" id="dgRow">'
            + '<input class="net-input" id="dgInput" inputmode="numeric" autocomplete="off" dir="ltr" placeholder="…">'
            + '<button class="gm-btn" id="dgOk">✓</button>'
            + '</div>'
            + '<div class="gm-status" id="dgStatus">' + gt('هيظهر رقم لثواني — احفظه واكتبه', 'A number flashes for seconds — memorize and type it') + '</div>'
            + '<button class="gm-btn" id="dgStart">' + gt('ابدأ', 'Start') + '</button>';

        var disp = root.querySelector('#dgDisp');
        var row = root.querySelector('#dgRow');
        var input = root.querySelector('#dgInput');
        var statusEl = root.querySelector('#dgStatus');

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
            disp.classList.remove('none');
            row.classList.add('none');
            statusEl.textContent = '👀 ' + gt('احفظ…', 'Memorize…');
            clearShow();
            showTimer = setTimeout(function () {
                state = 'input';
                disp.textContent = '❓';
                row.classList.remove('none');
                input.value = '';
                input.focus();
                statusEl.textContent = '⌨️ ' + gt('اكتب الرقم', 'Type the number');
            }, 700 + level * 320);
        }
        function submit() {
            if (state !== 'input') return;
            var v = input.value.trim();
            if (!v) return;
            if (v === num) {
                beep(600, 0.08);
                level++;
                statusEl.textContent = '✅ ' + gt('صح!', 'Correct!');
                setTimeout(round, 600);
            } else {
                state = 'over';
                beep(110, 0.35, 'square');
                row.classList.add('none');
                disp.textContent = num;
                var reached = level - 1;
                statusEl.textContent = '💀 ' + gt('غلط — كتبت ', 'Wrong — you typed ') + v + ' · ' + gt('وصلت لـ ', 'you reached ') + reached + ' ' + gt('أرقام', 'digits');
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
            + '<span>' + gt('الجولة', 'Round') + ': <b id="rcRound">—</b></span>'
            + '<span>⚡ ' + gt('أفضل متوسط', 'Best avg') + ': <b id="rcBest">' + (score('reaction').best ? score('reaction').best + 'ms' : '—') + '</b></span>'
            + '</div>'
            + '<button class="rc-pad" id="rcPad">' + gt('اضغط للبدء', 'Tap to start') + '</button>'
            + '<div class="gm-status" id="rcStatus">' + gt('لما اللون يبقى أخضر اضغط بأسرع ما يمكن — 5 جولات', 'When it turns green tap as fast as you can — 5 rounds') + '</div>';

        var pad = root.querySelector('#rcPad');
        var statusEl = root.querySelector('#rcStatus');

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
                pad.textContent = gt('بدري أوي! 😅', 'Too soon! 😅');
                statusEl.textContent = gt('استنى الأخضر — الجولة هتتعاد', 'Wait for green — round restarts');
                state = 'cooldown';
                waitTimer = setTimeout(schedule, 900);
            } else if (state === 'go') {
                var ms = Math.round(performance.now() - t0);
                times.push(ms);
                statusEl.textContent = '⏱ ' + ms + 'ms';
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
                        statusEl.textContent = '🏆 ' + gt('رقم قياسي جديد!', 'New record!');
                    } else {
                        statusEl.textContent = gt('أفضل متوسط: ', 'Best avg: ') + s.best + 'ms';
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
            + '<span>' + gt('النقاط', 'Score') + ': <b id="maScore">0</b></span>'
            + '<span>⏱ <b id="maTime">' + DURATION + '</b>s</span>'
            + '<span>🏆 <b id="maBest">' + (score('math').best || 0) + '</b></span>'
            + '</div>'
            + '<div class="ma-q" id="maQ" dir="ltr">—</div>'
            + '<div class="ma-grid" id="maGrid"></div>'
            + '<div class="gm-status" id="maStatus">' + gt('30 ثانية — جاوب بأسرع ما يمكن', '30 seconds — answer as fast as you can') + '</div>'
            + '<button class="gm-btn" id="maStart">' + gt('ابدأ', 'Start') + '</button>';

        var qEl = root.querySelector('#maQ');
        var gridEl = root.querySelector('#maGrid');
        var statusEl = root.querySelector('#maStatus');

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
                statusEl.textContent = '🏆 ' + gt('رقم قياسي: ', 'New record: ') + scoreNow;
            } else {
                statusEl.textContent = '⏰ ' + gt('انتهى الوقت! النتيجة: ', 'Time\'s up! Score: ') + scoreNow;
            }
            root.querySelector('#maStart').textContent = gt('العب تاني', 'Play again');
        }
        function start() {
            stopTimer();
            scoreNow = 0; left = DURATION; running = true;
            root.querySelector('#maScore').textContent = '0';
            root.querySelector('#maTime').textContent = left;
            statusEl.textContent = gt('يلا!', 'Go!');
            nextQ();
            timer = setInterval(function () {
                left--;
                root.querySelector('#maTime').textContent = left;
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
            + '<span>' + gt('النقاط', 'Score') + ': <b id="snScore">0</b></span>'
            + '<span>🏆 <b id="snBest">' + (score('snake').best || 0) + '</b></span>'
            + '</div>'
            + '<canvas id="snCanvas" class="sn-canvas"></canvas>'
            + '<div class="gm-status" id="snStatus">' + gt('اضغط "ابدأ" — الأسهم أو السحب للتحكم', 'Press "Start" — arrows or swipe to control') + '</div>'
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
            ctx.fillStyle = '#e05d5d';
            ctx.beginPath();
            ctx.arc(food[0] * cell + cell / 2, food[1] * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
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
        }
        function gameOver() {
            stopTimer();
            running = false;
            var s = score('snake');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('snake', s); root.querySelector('#snBest').textContent = scoreNow; }
            root.querySelector('#snStatus').textContent = '💀 ' + gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow;
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
            root.querySelector('#snStatus').textContent = gt('كُل التفاح الأحمر 🍎', 'Eat the red apples 🍎');
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
                root.querySelector('#snStatus').textContent = '⏸ ' + gt('إيقاف مؤقت', 'Paused');
            } else if (paused) {
                paused = false;
                root.querySelector('#snStatus').textContent = gt('كمّل! 🐍', 'Go on! 🐍');
                restartTimer();
            }
        }
        document.addEventListener('visibilitychange', onVis);

        var tsX = 0, tsY = 0;
        function onTS(e) { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; }
        function onTE(e) {
            var dx = e.changedTouches[0].clientX - tsX;
            var dy = e.changedTouches[0].clientY - tsY;
            if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
            if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');
            else turn(dy > 0 ? 'down' : 'up');
        }
        cv.addEventListener('touchstart', onTS, { passive: true });
        cv.addEventListener('touchend', onTE, { passive: true });

        root.querySelector('#snPad').addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (b) turn(b.getAttribute('data-d'));
        });
        root.querySelector('#snStart').addEventListener('click', start);

        snake = [[9, 9], [8, 9], [7, 9]];
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
            + '<span>' + gt('النقاط', 'Score') + ': <b id="g4Score">0</b></span>'
            + '<span>🏆 <b id="g4Best">' + (score('2048').best || 0) + '</b></span>'
            + '</div>'
            + '<div class="g4-grid" id="g4Grid" dir="ltr"></div>'
            + '<div class="gm-status" id="g4Status">' + gt('الأسهم أو السحب لدمج الأرقام', 'Arrows or swipe to merge tiles') + '</div>'
            + '<button class="gm-btn" id="g4Reset">' + gt('لعبة جديدة', 'New game') + '</button>';

        var gridEl = root.querySelector('#g4Grid');

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
                root.querySelector('#g4Status').textContent = '💀 ' + gt('انتهت اللعبة! النقاط: ', 'Game over! Score: ') + scoreNow;
            } else if (won) {
                won = false;
                root.querySelector('#g4Status').textContent = '🎉 ' + gt('وصلت 2048! كمّل لو عايز', 'You reached 2048! Keep going');
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
            root.querySelector('#g4Status').textContent = gt('الأسهم أو السحب لدمج الأرقام', 'Arrows or swipe to merge tiles');
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
            + '<span>' + gt('النقاط', 'Score') + ': <b id="tzScore">0</b></span>'
            + '<span>' + gt('صفوف', 'Lines') + ': <b id="tzLines">0</b></span>'
            + '<span>🏆 <b id="tzBest">' + (score('tetris').best || 0) + '</b></span>'
            + '</div>'
            + '<div class="tz-wrap" dir="ltr"><canvas id="tzCanvas" class="sn-canvas"></canvas>'
            + '<canvas id="tzNext" class="tz-next"></canvas></div>'
            + '<div class="gm-status" id="tzStatus">' + gt('الأسهم للتحريك، ⬆ للف، مسطرة للإسقاط', 'Arrows to move, ⬆ rotates, Space drops') + '</div>'
            + '<div class="tz-controls" id="tzCtl">'
            + '<button data-a="left">◀</button><button data-a="rot">🔄</button><button data-a="right">▶</button>'
            + '<button data-a="down">⬇</button><button data-a="drop">⤓</button>'
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
                    r++; // recheck the same row index after shifting
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
            root.querySelector('#tzStatus').textContent = '💀 ' + gt('انتهت! النقاط: ', 'Game over! Score: ') + scoreNow;
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
            root.querySelector('#tzStatus').textContent = gt('يلا! 🧩', 'Go! 🧩');
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
        root.querySelector('#tzCtl').addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (b) act(b.getAttribute('data-a'));
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
            + '<span>' + gt('النقاط', 'Score') + ': <b id="bkScore">0</b></span>'
            + '<span>❤️ <b id="bkLives">3</b></span>'
            + '<span>🏆 <b id="bkBest">' + (score('breakout').best || 0) + '</b></span>'
            + '</div>'
            + '<canvas id="bkCanvas" class="sn-canvas"></canvas>'
            + '<div class="gm-status" id="bkStatus">' + gt('حرّك المضرب بالماوس أو صباعك — اضغط للإطلاق', 'Move the paddle with mouse or finger — tap to launch') + '</div>'
            + '<button class="gm-btn" id="bkStart">' + gt('ابدأ', 'Start') + '</button>';

        var cv = root.querySelector('#bkCanvas');
        var ctx = cv.getContext('2d');
        W = Math.min(340, (root.clientWidth || 320) - 8);
        H = Math.round(W * 0.88);
        cv.width = W;
        cv.height = H;

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
                var s = score('breakout');
                if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('breakout', s); root.querySelector('#bkBest').textContent = scoreNow; }
                root.querySelector('#bkStatus').textContent = '💀 ' + gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow;
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
                // paddle
                if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + paddle.h + 6
                    && ball.x >= paddle.x - ball.r && ball.x <= paddle.x + paddle.w + ball.r) {
                    var rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                    var sp = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                    ball.vx = rel * sp * 0.85;
                    ball.vy = -Math.abs(Math.sqrt(Math.max(sp * sp - ball.vx * ball.vx, 1)));
                }
                // bricks
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
                    root.querySelector('#bkStatus').textContent = '🎉 ' + gt('مستوى ', 'Level ') + levelNow + '!';
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
            ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fillStyle = '#e05d5d';
            ctx.fill();
        }
        function start() {
            if (raf) cancelAnimationFrame(raf);
            paddle = { x: W / 2 - 35, y: H - 16, w: 70, h: 9 };
            scoreNow = 0; livesNow = 3; levelNow = 1; running = true;
            root.querySelector('#bkScore').textContent = '0';
            root.querySelector('#bkLives').textContent = '3';
            root.querySelector('#bkStatus').textContent = gt('اضغط الشاشة لإطلاق الكرة 🎯', 'Tap to launch the ball 🎯');
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
        function onMove(e) {
            if (!running) return;
            movePaddle(e.clientX);
        }
        function onDown(e) {
            if (!running) return;
            e.preventDefault();
            movePaddle(e.clientX);
            launch();
        }
        cv.addEventListener('pointermove', onMove);
        cv.addEventListener('pointerdown', onDown);

        // static preview
        paddle = { x: W / 2 - 35, y: H - 16, w: 70, h: 9 };
        buildBricks();
        resetBall();
        drawAll();

        root.querySelector('#bkStart').addEventListener('click', start);
        return {
            destroy: function () {
                running = false;
                if (raf) cancelAnimationFrame(raf);
            }
        };
    }

    /* ═══════ 13) WHACK-A-MOLE ═══════ */
    function startMole(root) {
        var DURATION = 30;
        var scoreNow, left, moleAt = -1, running = false;
        var clockTimer = null, popTimer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + '<span>' + gt('النقاط', 'Score') + ': <b id="moScore">0</b></span>'
            + '<span>⏱ <b id="moTime">' + DURATION + '</b>s</span>'
            + '<span>🏆 <b id="moBest">' + (score('mole').best || 0) + '</b></span>'
            + '</div>'
            + '<div class="mo-grid" id="moGrid"></div>'
            + '<div class="gm-status" id="moStatus">' + gt('اضرب الخلد 🐹 قبل ما يختفي', 'Whack the mole 🐹 before it hides') + '</div>'
            + '<button class="gm-btn" id="moStart">' + gt('ابدأ', 'Start') + '</button>';

        var gridEl = root.querySelector('#moGrid');
        var holes = [];
        for (var i = 0; i < 9; i++) {
            var b = document.createElement('button');
            b.className = 'mo-hole';
            b.textContent = '🕳️';
            (function (idx, btn) {
                btn.addEventListener('click', function () {
                    if (!running || idx !== moleAt) return;
                    scoreNow++;
                    root.querySelector('#moScore').textContent = scoreNow;
                    btn.textContent = '💥';
                    beep(600, 0.05);
                    hideMole();
                    popTimer = setTimeout(popMole, 180);
                });
            })(i, b);
            gridEl.appendChild(b);
            holes.push(b);
        }

        function hideMole() {
            if (moleAt >= 0) holes[moleAt].textContent = '🕳️';
            moleAt = -1;
            if (popTimer) { clearTimeout(popTimer); popTimer = null; }
        }
        function popMole() {
            if (!running) return;
            hideMole();
            var next = rnd(9);
            moleAt = next;
            holes[next].textContent = '🐹';
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
                root.querySelector('#moStatus').textContent = '🏆 ' + gt('رقم قياسي: ', 'New record: ') + scoreNow;
            } else {
                root.querySelector('#moStatus').textContent = '⏰ ' + gt('انتهى الوقت! النتيجة: ', 'Time\'s up! Score: ') + scoreNow;
            }
            root.querySelector('#moStart').textContent = gt('العب تاني', 'Play again');
        }
        function start() {
            if (clockTimer) clearInterval(clockTimer);
            hideMole();
            scoreNow = 0; left = DURATION; running = true;
            root.querySelector('#moScore').textContent = '0';
            root.querySelector('#moTime').textContent = left;
            root.querySelector('#moStatus').textContent = gt('يلا! 🔨', 'Go! 🔨');
            popMole();
            clockTimer = setInterval(function () {
                left--;
                root.querySelector('#moTime').textContent = left;
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

    /* ═══════ 14) FLAPPY ═══════ */
    function startFlappy(root) {
        var W, H, cv, ctx, raf = null, running = false;
        var bird, pipes, scoreNow;
        var GRAV = 0.45, JUMP = -7.4, PIPE_W = 52, GAP = 150, SPEED = 2.6, SPACING = 190;

        root.innerHTML =
            '<div class="gm-score-row">'
            + '<span>' + gt('النقاط', 'Score') + ': <b id="flScore">0</b></span>'
            + '<span>🏆 <b id="flBest">' + (score('flappy').best || 0) + '</b></span>'
            + '</div>'
            + '<canvas id="flCanvas" class="sn-canvas"></canvas>'
            + '<div class="gm-status" id="flStatus">' + gt('اضغط الشاشة أو المسطرة للطيران', 'Tap the screen or press Space to fly') + '</div>'
            + '<button class="gm-btn" id="flStart">' + gt('ابدأ', 'Start') + '</button>';

        cv = root.querySelector('#flCanvas');
        ctx = cv.getContext('2d');
        W = Math.min(340, (root.clientWidth || 320) - 8);
        H = Math.round(W * 1.15);
        cv.width = W;
        cv.height = H;

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
        }
        function drawAll() {
            ctx.fillStyle = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = cssVar('--accent', '#3e8e7e');
            for (var i = 0; i < pipes.length; i++) {
                var p = pipes[i];
                ctx.fillRect(p.x, 0, PIPE_W, p.top);
                ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
            }
            ctx.font = (bird.r * 2.2) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐤', bird.x, bird.y);
        }
        function gameOver() {
            running = false;
            if (raf) { cancelAnimationFrame(raf); raf = null; }
            var s = score('flappy');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('flappy', s); root.querySelector('#flBest').textContent = scoreNow; }
            root.querySelector('#flStatus').textContent = '💀 ' + gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow;
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
            root.querySelector('#flStatus').textContent = gt('طير! 🐤', 'Fly! 🐤');
            root.querySelector('#flStart').textContent = gt('إعادة', 'Restart');
            raf = requestAnimationFrame(loop);
        }
        function onKey(e) {
            if (e.key === ' ' || e.key === 'ArrowUp') {
                if (running) { e.preventDefault(); flap(); }
            }
        }
        function onTap(e) { e.preventDefault(); flap(); }
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
    function startMines(root) {
        var N = 9, MINES = 10;
        var cells, opened, flagMode, started, over, secs, timer = null;

        root.innerHTML =
            '<div class="gm-score-row">'
            + '<span>💣 <b>' + MINES + '</b></span>'
            + '<span>⏱ <b id="mnTime">0</b>s</span>'
            + '<span>🏆 <b id="mnBest">' + (score('mines').best ? score('mines').best + 's' : '—') + '</b></span>'
            + '</div>'
            + '<div class="mn-tools">'
            + '<button class="mn-flag" id="mnFlag">🚩 ' + gt('وضع الأعلام', 'Flag mode') + '</button>'
            + '</div>'
            + '<div class="mn-grid" id="mnGrid" dir="ltr"></div>'
            + '<div class="gm-status" id="mnStatus">' + gt('اكشف كل الخانات الآمنة — كليك يمين أو وضع الأعلام للتعليم', 'Clear all safe cells — right-click or flag mode to mark') + '</div>'
            + '<button class="gm-btn" id="mnReset">' + gt('لعبة جديدة', 'New game') + '</button>';

        var gridEl = root.querySelector('#mnGrid');
        var statusEl = root.querySelector('#mnStatus');
        var flagBtn = root.querySelector('#mnFlag');

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
            if (c.open) btn.textContent = c.mine ? '💣' : (c.n || '');
            else btn.textContent = c.flag ? '🚩' : '';
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
            statusEl.textContent = '💥 ' + gt('لغم! حظ أوفر المرة الجاية', 'Boom! Better luck next time');
        }
        function checkWin() {
            if (opened === N * N - MINES) {
                over = true;
                stopTimer();
                statusEl.textContent = '🎉 ' + gt('كسبت في ', 'You won in ') + secs + 's';
                var s = score('mines');
                if (!s.best || secs < s.best) {
                    s.best = secs; saveScore('mines', s);
                    root.querySelector('#mnBest').textContent = secs + 's';
                    statusEl.textContent += ' 🏆';
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
                    root.querySelector('#mnTime').textContent = secs;
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
            root.querySelector('#mnTime').textContent = '0';
            statusEl.textContent = gt('اكشف كل الخانات الآمنة — كليك يمين أو وضع الأعلام للتعليم', 'Clear all safe cells — right-click or flag mode to mark');
            gridEl.innerHTML = '';
            for (var j = 0; j < N * N; j++) {
                var btn = document.createElement('button');
                btn.className = 'mn-cell';
                (function (idx, b) {
                    b.addEventListener('click', function () { clickCell(idx, flagMode); });
                    b.addEventListener('contextmenu', function (e) { e.preventDefault(); clickCell(idx, true); });
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
