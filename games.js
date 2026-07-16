/* ═══════════════════════════════════════════════════════════
   LORD AI — Games Hub (11 games)
   Standalone module (no dependency on app.js at load time).
   Exposes window.LordGames = { list, open, match }.
   app.js integrates via [GAME:name] tags and LORD.openGame().
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

    /* ═══════ CATALOG ═══════ */
    var GAMES = [
        { id: 'xo', name: 'إكس أو', en: 'Tic-Tac-Toe', emoji: '⭕', desc: 'تحدَّ ذكاءً لا يُهزم', descEn: 'Face an unbeatable AI', aliases: ['اكس او', 'xo', 'x o', 'tic tac', 'تيك تاك'] },
        { id: 'rps', name: 'حجر ورقة مقص', en: 'Rock Paper Scissors', emoji: '✂️', desc: 'الكلاسيكية ضد الكمبيوتر', descEn: 'The classic vs computer', aliases: ['حجر', 'ورقة', 'مقص', 'rock', 'rps'] },
        { id: 'memory', name: 'الذاكرة', en: 'Memory', emoji: '🧠', desc: 'طابق الأزواج بأقل نقلات', descEn: 'Match pairs in fewest moves', aliases: ['ذاكرة', 'memory', 'كوتشينة', 'مطابقة'] },
        { id: 'simon', name: 'سلسلة الألوان', en: 'Simon', emoji: '🎨', desc: 'احفظ التسلسل وكرّره', descEn: 'Memorize and repeat the sequence', aliases: ['سايمون', 'simon', 'الوان', 'ألوان', 'تسلسل'] },
        { id: 'reaction', name: 'رد الفعل', en: 'Reaction Time', emoji: '⚡', desc: 'قيس سرعتك بالملي ثانية', descEn: 'Measure your speed in ms', aliases: ['رد فعل', 'سرعة', 'reaction', 'رياكشن'] },
        { id: 'math', name: 'سباق الحساب', en: 'Math Sprint', emoji: '➗', desc: 'أكبر عدد إجابات في 30 ثانية', descEn: 'Solve as many as you can in 30s', aliases: ['حساب', 'رياضيات', 'math', 'جمع', 'ضرب'] },
        { id: 'snake', name: 'الثعبان', en: 'Snake', emoji: '🐍', desc: 'كُل التفاح واحذر من نفسك', descEn: 'Eat apples, don\'t bite yourself', aliases: ['ثعبان', 'snake', 'سنيك'] },
        { id: '2048', name: '2048', en: '2048', emoji: '🔢', desc: 'ادمج الأرقام ووصّل لـ 2048', descEn: 'Merge numbers to reach 2048', aliases: ['٢٠٤٨', '2048'] },
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

    /* ═══════ MODAL SHELL ═══════ */
    var modal = null;
    var current = null; // { destroy: fn } of the running game

    function buildModal() {
        if (modal) return;
        modal = document.createElement('div');
        modal.className = 'gm-modal none';
        modal.id = 'gmModal';
        modal.innerHTML =
            '<div class="gm-box">'
            + '<div class="gm-head">'
            + '<button class="gm-back hid" id="gmBack">‹</button>'
            + '<span class="gm-title" id="gmTitle">🎮</span>'
            + '<button class="gm-close" id="gmClose">✕</button>'
            + '</div>'
            + '<div class="gm-body" id="gmBody"></div>'
            + '</div>';
        document.body.appendChild(modal);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
        document.getElementById('gmClose').addEventListener('click', close);
        document.getElementById('gmBack').addEventListener('click', function () { renderHub(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && !modal.classList.contains('none')) close();
        });
    }

    function destroyCurrent() {
        if (current && current.destroy) { try { current.destroy(); } catch (e) { } }
        current = null;
    }

    function close() {
        destroyCurrent();
        if (modal) modal.classList.add('none');
    }

    function open(id) {
        buildModal();
        modal.classList.remove('none');
        var g = id ? matchGame(id) : null;
        if (g) openGame(g); else renderHub();
    }

    /* ═══════ HUB ═══════ */
    function bestLine(g) {
        var s = score(g.id);
        if (g.id === 'xo' || g.id === 'rps') {
            if (s.w === undefined && s.l === undefined) return '';
            return '🏆 ' + (s.w || 0) + ' — ' + (s.l || 0) + ' 💀';
        }
        if (g.id === 'reaction') return s.best ? '⚡ ' + s.best + 'ms' : '';
        if (g.id === 'mines') return s.best ? '⏱ ' + s.best + 's' : '';
        return s.best ? '🏆 ' + s.best : '';
    }

    function renderHub() {
        destroyCurrent();
        document.getElementById('gmTitle').textContent = '🎮 ' + gt('الألعاب', 'Games');
        document.getElementById('gmBack').classList.add('hid');
        var h = '<div class="gm-grid">';
        for (var i = 0; i < GAMES.length; i++) {
            var g = GAMES[i];
            var best = bestLine(g);
            h += '<button class="gm-card" data-game="' + g.id + '">'
                + '<span class="gm-emoji">' + g.emoji + '</span>'
                + '<span class="gm-name">' + esc(lang() === 'en' ? g.en : g.name) + '</span>'
                + '<span class="gm-desc">' + esc(lang() === 'en' ? g.descEn : g.desc) + '</span>'
                + (best ? '<span class="gm-best">' + best + '</span>' : '')
                + '</button>';
        }
        h += '</div>';
        var body = document.getElementById('gmBody');
        body.innerHTML = h;
        body.querySelectorAll('.gm-card').forEach(function (c) {
            c.addEventListener('click', function () {
                var g = matchGame(c.getAttribute('data-game'));
                if (g) openGame(g);
            });
        });
    }

    function openGame(g) {
        destroyCurrent();
        document.getElementById('gmTitle').textContent = g.emoji + ' ' + (lang() === 'en' ? g.en : g.name);
        document.getElementById('gmBack').classList.remove('hid');
        var body = document.getElementById('gmBody');
        body.innerHTML = '';
        try { if (window.LORD && window.LORD.trackGame) window.LORD.trackGame(g.name); } catch (e) { }
        current = STARTERS[g.id](body);
    }

    /* Shared W/L/D score painter */
    function wldHTML(id) {
        var s = score(id);
        return gt('فوز', 'W') + ' <b>' + (s.w || 0) + '</b> · '
            + gt('خسارة', 'L') + ' <b>' + (s.l || 0) + '</b> · '
            + gt('تعادل', 'D') + ' <b>' + (s.d || 0) + '</b>';
    }
    function bumpWLD(id, key) {
        var s = score(id);
        s[key] = (s[key] || 0) + 1;
        saveScore(id, s);
    }

    /* ═══════ 1) TIC-TAC-TOE (vs AI) ═══════ */
    function startXO(root) {
        var board, over, lock = false, hard = true, humanStarts = true;
        var HU = 'X', AI = 'O';
        var WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

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

        function winner(b) {
            for (var i = 0; i < WINS.length; i++) {
                var w = WINS[i];
                if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) return { p: b[w[0]], line: w };
            }
            return null;
        }
        function empties(b) {
            var out = [];
            for (var i = 0; i < 9; i++) if (!b[i]) out.push(i);
            return out;
        }
        function minimax(b, player, depth) {
            var w = winner(b);
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
            var w = winner(board);
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
                            lock = true; // block input while the AI "thinks"
                            statusEl.textContent = '🤖 …';
                            setTimeout(aiMove, 250);
                        }
                    });
                })(i);
                boardEl.appendChild(c);
            }
            // fairness: alternate who opens each round
            if (humanStarts) {
                statusEl.textContent = gt('دورك — أنت X تبدأ', 'Your turn — you (X) start');
            } else {
                statusEl.textContent = gt('الكمبيوتر يبدأ…', 'Computer starts…');
                lock = true;
                setTimeout(function () {
                    // opening book: center or a corner keeps it interesting
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

    /* ═══════ 2) ROCK PAPER SCISSORS ═══════ */
    function startRPS(root) {
        var OPTS = [
            { id: 'rock', e: '✊', ar: 'حجر', en: 'Rock' },
            { id: 'paper', e: '✋', ar: 'ورقة', en: 'Paper' },
            { id: 'scissors', e: '✌️', ar: 'مقص', en: 'Scissors' }
        ];
        var BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
        var revealing = false, revealTimer = null;

        root.innerHTML =
            '<div class="gm-score" id="rpsScore"></div>'
            + '<div class="rps-arena"><span id="rpsYou">❔</span><span class="rps-vs">VS</span><span id="rpsCpu">❔</span></div>'
            + '<div class="gm-status" id="rpsStatus">' + gt('اختار سلاحك 👇', 'Pick your weapon 👇') + '</div>'
            + '<div class="rps-row" id="rpsRow">'
            + OPTS.map(function (o) {
                return '<button data-id="' + o.id + '"><span>' + o.e + '</span><small>' + gt(o.ar, o.en) + '</small></button>';
            }).join('')
            + '</div>';

        function paintScore() { root.querySelector('#rpsScore').innerHTML = wldHTML('rps'); }
        function play(mine) {
            if (revealing) return; // ignore clicks while the previous round resolves
            revealing = true;
            var cpu = OPTS[rnd(3)];
            var me = null;
            for (var i = 0; i < OPTS.length; i++) if (OPTS[i].id === mine) me = OPTS[i];
            root.querySelector('#rpsYou').textContent = me.e;
            var cpuEl = root.querySelector('#rpsCpu');
            cpuEl.textContent = '🤔';
            var statusEl = root.querySelector('#rpsStatus');
            statusEl.textContent = '…';
            revealTimer = setTimeout(function () {
                cpuEl.textContent = cpu.e;
                if (me.id === cpu.id) { bumpWLD('rps', 'd'); statusEl.textContent = '🤝 ' + gt('تعادل!', 'Draw!'); }
                else if (BEATS[me.id] === cpu.id) { bumpWLD('rps', 'w'); statusEl.textContent = '🎉 ' + gt('كسبت!', 'You win!'); }
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

    /* ═══════ 3) MEMORY MATCH ═══════ */
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

    /* ═══════ 4) SIMON (color sequence) ═══════ */
    function startSimon(root) {
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

    /* ═══════ 5) REACTION TIME ═══════ */
    function startReaction(root) {
        var ROUNDS = 5;
        var state = 'idle'; // idle | waiting | cooldown | go | done
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

    /* ═══════ 6) MATH SPRINT ═══════ */
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
            // one correct + three unique near-miss distractors
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
                btn.classList.add('bad'); // visual penalty, question stays
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

    /* ═══════ 7) SNAKE ═══════ */
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
            // theme-aware board colors (fallbacks per theme, since not every var exists)
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
            // compare against the last queued direction so quick double-taps can't reverse
            var last = dirQueue.length ? dirQueue[dirQueue.length - 1] : dir;
            if (d === last || d === OPP[last]) return;
            if (dirQueue.length < 3) dirQueue.push(d);
        }

        function onKey(e) {
            var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
            var d = map[e.key];
            if (d) { e.preventDefault(); turn(d); }
        }
        document.addEventListener('keydown', onKey);

        // auto-pause when the tab is hidden
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

        // initial preview frame
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

    /* ═══════ 8) 2048 ═══════ */
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
        // slide+merge one line of 4 values toward index 0
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
                won = false; // announce once
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

    /* ═══════ 9) WHACK-A-MOLE ═══════ */
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
            // stays up for less time as the score grows
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

    /* ═══════ 10) FLAPPY ═══════ */
    function startFlappy(root) {
        var W, H, cv, ctx, raf = null, running = false;
        var bird, pipes, scoreNow, frame;
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
        H = Math.round(W * 1.25);
        cv.width = W;
        cv.height = H;

        function reset() {
            bird = { x: W * 0.28, y: H * 0.45, vy: 0, r: 11 };
            pipes = [];
            scoreNow = 0;
            frame = 0;
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
        function drawBg() {
            ctx.fillStyle = cssVar('--code-bg', isDark() ? '#121413' : '#f3f3ee');
            ctx.fillRect(0, 0, W, H);
        }
        function drawAll() {
            drawBg();
            var acc = cssVar('--accent', '#3e8e7e');
            ctx.fillStyle = acc;
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
            frame++;
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
            // collisions: floor/ceiling + pipes
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
            if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); }
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

    /* ═══════ 11) MINESWEEPER ═══════ */
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
            // first click is always safe (and clears its neighborhood)
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
            // iterative flood fill for zero-cells
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
                if (wantFlag) return; // no flagging before the board exists
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
        rps: startRPS,
        memory: startMemory,
        simon: startSimon,
        reaction: startReaction,
        math: startMath,
        snake: startSnake,
        '2048': start2048,
        mole: startMole,
        flappy: startFlappy,
        mines: startMines
    };

    window.LordGames = {
        list: GAMES,
        open: open,
        match: matchGame
    };
})();
