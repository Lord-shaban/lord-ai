/* ═══════════════════════════════════════════════════════════
   LORD AI — Games Hub
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
    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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
        { id: 'xo', name: 'إكس أو', en: 'Tic-Tac-Toe', emoji: '⭕', desc: 'العب ضد الذكاء الاصطناعي', descEn: 'Play against the AI', aliases: ['اكس او', 'xo', 'x o', 'tic tac', 'تيك تاك'] },
        { id: 'snake', name: 'الثعبان', en: 'Snake', emoji: '🐍', desc: 'كُل التفاح واحذر من نفسك!', descEn: 'Eat apples, don\'t bite yourself!', aliases: ['ثعبان', 'snake', 'سنيك'] },
        { id: 'memory', name: 'الذاكرة', en: 'Memory', emoji: '🧠', desc: 'اقلب الكروت وطابق الأزواج', descEn: 'Flip cards and match pairs', aliases: ['ذاكرة', 'memory', 'كوتشينة', 'مطابقة'] },
        { id: '2048', name: '2048', en: '2048', emoji: '🔢', desc: 'ادمج الأرقام ووصّل لـ 2048', descEn: 'Merge numbers to reach 2048', aliases: ['٢٠٤٨', '2048'] },
        { id: 'rps', name: 'حجر ورقة مقص', en: 'Rock Paper Scissors', emoji: '✂️', desc: 'تحدى الكمبيوتر في اللعبة الكلاسيكية', descEn: 'Challenge the computer', aliases: ['حجر', 'ورقة', 'مقص', 'rock', 'rps'] },
        { id: 'reaction', name: 'رد الفعل', en: 'Reaction Time', emoji: '⚡', desc: 'قيس سرعة رد فعلك بالملي ثانية', descEn: 'Measure your reaction speed', aliases: ['رد فعل', 'سرعة', 'reaction', 'رياكشن'] }
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
            if (s.w === undefined) return '';
            return '🏆 ' + (s.w || 0) + ' — ' + (s.l || 0) + ' 💀';
        }
        if (g.id === 'reaction') return s.best ? '⚡ ' + s.best + 'ms' : '';
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

    /* ═══════ 1) TIC-TAC-TOE (vs AI) ═══════ */
    function startXO(root) {
        var board, over, hard = true;
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

        function paintScore() {
            var s = score('xo');
            root.querySelector('#xoScore').innerHTML =
                gt('فوز', 'W') + ' <b>' + (s.w || 0) + '</b> · '
                + gt('خسارة', 'L') + ' <b>' + (s.l || 0) + '</b> · '
                + gt('تعادل', 'D') + ' <b>' + (s.d || 0) + '</b>';
        }

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
            if (!free.length || over) return;
            var mv;
            if (!hard && Math.random() < 0.7) mv = free[Math.floor(Math.random() * free.length)];
            else mv = minimax(board.slice(), AI, 0).move;
            board[mv] = AI;
            paint();
            check();
        }
        function check() {
            var w = winner(board);
            if (w) {
                over = true;
                var s = score('xo');
                if (w.p === HU) { s.w = (s.w || 0) + 1; statusEl.textContent = '🎉 ' + gt('مبروك! كسبت', 'You win!'); }
                else { s.l = (s.l || 0) + 1; statusEl.textContent = '💀 ' + gt('الكمبيوتر كسب!', 'Computer wins!'); }
                saveScore('xo', s);
                paintScore();
                w.line.forEach(function (i) { boardEl.children[i].classList.add('win'); });
            } else if (!empties(board).length) {
                over = true;
                var s2 = score('xo');
                s2.d = (s2.d || 0) + 1;
                saveScore('xo', s2);
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
            statusEl.textContent = gt('دورك — أنت X', 'Your turn — you are X');
            boardEl.innerHTML = '';
            for (var i = 0; i < 9; i++) {
                var c = document.createElement('button');
                c.className = 'xo-cell';
                (function (idx) {
                    c.addEventListener('click', function () {
                        if (over || board[idx]) return;
                        board[idx] = HU;
                        paint();
                        check();
                        if (!over) setTimeout(aiMove, 200);
                    });
                })(i);
                boardEl.appendChild(c);
            }
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

    /* ═══════ 2) SNAKE ═══════ */
    function startSnake(root) {
        var N = 18;                 // grid cells per side
        var timer = null, snake, dir, nextDir, food, scoreNow, speed, running = false, dead = false;

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

        function placeFood() {
            while (true) {
                var f = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
                var hit = false;
                for (var i = 0; i < snake.length; i++) {
                    if (snake[i][0] === f[0] && snake[i][1] === f[1]) { hit = true; break; }
                }
                if (!hit) return f;
            }
        }
        function draw() {
            var bg = cssVar('--bg-input') || '#222';
            var acc = cssVar('--accent') || '#3e8e7e';
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
            dead = true;
            var s = score('snake');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('snake', s); root.querySelector('#snBest').textContent = scoreNow; }
            root.querySelector('#snStatus').textContent = '💀 ' + gt('خسرت! النقاط: ', 'Game over! Score: ') + scoreNow;
            root.querySelector('#snStart').textContent = gt('العب تاني', 'Play again');
        }
        function tick() {
            dir = nextDir;
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
            dir = 'right'; nextDir = 'right';
            scoreNow = 0; speed = 140; dead = false; running = true;
            food = placeFood();
            root.querySelector('#snScore').textContent = '0';
            root.querySelector('#snStatus').textContent = gt('كُل التفاح الأحمر 🍎', 'Eat the red apples 🍎');
            draw();
            restartTimer();
        }
        function turn(d) {
            if (!running) return;
            // no 180° turns
            if ((d === 'up' && dir === 'down') || (d === 'down' && dir === 'up')
                || (d === 'left' && dir === 'right') || (d === 'right' && dir === 'left')) return;
            nextDir = d;
        }

        function onKey(e) {
            var map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
            var d = map[e.key];
            if (d) { e.preventDefault(); turn(d); }
        }
        document.addEventListener('keydown', onKey);

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
            }
        };
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
            var deck = shuffle(EMOJI.concat(EMOJI).slice());
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
            if (lock || c.classList.contains('open') || c.classList.contains('ok')) return;
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
                }, 750);
            }
        }
        root.querySelector('#mmReset').addEventListener('click', reset);
        reset();
        return { destroy: stopTimer };
    }

    /* ═══════ 4) 2048 ═══════ */
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
            if (!free.length) return;
            grid[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4;
        }
        function paint(newIdx) {
            gridEl.innerHTML = '';
            for (var i = 0; i < 16; i++) {
                var d = document.createElement('div');
                var v = grid[i];
                d.className = 'g4-cell' + (v ? ' t' + (v > 2048 ? 'big' : v) : '');
                if (v) d.textContent = v;
                if (newIdx && newIdx.indexOf(i) !== -1) d.classList.add('pop');
                gridEl.appendChild(d);
            }
            root.querySelector('#g4Score').textContent = scoreNow;
        }
        // slide+merge one row of 4 values toward index 0; returns {row, gain, moved}
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
        // index helpers per direction: build each line as array of grid indexes ordered toward the move direction
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
            addTile();
            paint();
            var s = score('2048');
            if (scoreNow > (s.best || 0)) { s.best = scoreNow; saveScore('2048', s); root.querySelector('#g4Best').textContent = scoreNow; }
            if (won) {
                root.querySelector('#g4Status').textContent = '🎉 ' + gt('وصلت 2048! كمّل لو عايز', 'You reached 2048! Keep going');
                won = false; // announce once
            }
            if (isStuck()) {
                over = true;
                root.querySelector('#g4Status').textContent = '💀 ' + gt('انتهت اللعبة! النقاط: ', 'Game over! Score: ') + scoreNow;
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

    /* ═══════ 5) ROCK PAPER SCISSORS ═══════ */
    function startRPS(root) {
        var OPTS = [
            { id: 'rock', e: '✊', ar: 'حجر', en: 'Rock' },
            { id: 'paper', e: '✋', ar: 'ورقة', en: 'Paper' },
            { id: 'scissors', e: '✌️', ar: 'مقص', en: 'Scissors' }
        ];
        var BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

        root.innerHTML =
            '<div class="gm-score" id="rpsScore"></div>'
            + '<div class="rps-arena"><span id="rpsYou">❔</span><span class="rps-vs">VS</span><span id="rpsCpu">❔</span></div>'
            + '<div class="gm-status" id="rpsStatus">' + gt('اختار سلاحك 👇', 'Pick your weapon 👇') + '</div>'
            + '<div class="rps-row" id="rpsRow">'
            + OPTS.map(function (o) {
                return '<button data-id="' + o.id + '"><span>' + o.e + '</span><small>' + gt(o.ar, o.en) + '</small></button>';
            }).join('')
            + '</div>';

        function paintScore() {
            var s = score('rps');
            root.querySelector('#rpsScore').innerHTML =
                gt('فوز', 'W') + ' <b>' + (s.w || 0) + '</b> · '
                + gt('خسارة', 'L') + ' <b>' + (s.l || 0) + '</b> · '
                + gt('تعادل', 'D') + ' <b>' + (s.d || 0) + '</b>';
        }
        function play(mine) {
            var cpu = OPTS[Math.floor(Math.random() * 3)];
            var me = null;
            for (var i = 0; i < OPTS.length; i++) if (OPTS[i].id === mine) me = OPTS[i];
            root.querySelector('#rpsYou').textContent = me.e;
            var cpuEl = root.querySelector('#rpsCpu');
            cpuEl.textContent = '🤔';
            var statusEl = root.querySelector('#rpsStatus');
            statusEl.textContent = '…';
            setTimeout(function () {
                cpuEl.textContent = cpu.e;
                var s = score('rps');
                if (me.id === cpu.id) { s.d = (s.d || 0) + 1; statusEl.textContent = '🤝 ' + gt('تعادل!', 'Draw!'); }
                else if (BEATS[me.id] === cpu.id) { s.w = (s.w || 0) + 1; statusEl.textContent = '🎉 ' + gt('كسبت!', 'You win!'); }
                else { s.l = (s.l || 0) + 1; statusEl.textContent = '💀 ' + gt('خسرت!', 'You lose!'); }
                saveScore('rps', s);
                paintScore();
            }, 550);
        }
        root.querySelector('#rpsRow').addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (b) play(b.getAttribute('data-id'));
        });
        paintScore();
        return { destroy: function () { } };
    }

    /* ═══════ 6) REACTION TIME ═══════ */
    function startReaction(root) {
        var ROUNDS = 5;
        var state = 'idle'; // idle | waiting | go | done
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
                state = 'idle2';
                setTimeout(schedule, 900);
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

    /* ═══════ REGISTRY & EXPORT ═══════ */
    var STARTERS = {
        xo: startXO,
        snake: startSnake,
        memory: startMemory,
        '2048': start2048,
        rps: startRPS,
        reaction: startReaction
    };

    window.LordGames = {
        list: GAMES,
        open: open,
        match: matchGame
    };
})();
