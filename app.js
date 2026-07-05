/* LORD AI — Advanced Application Logic v2.0 */
(function() {
    'use strict';

    /* ═══════ CONFIG ═══════ */
    var API_KEY = 'sk-or-v1-' + '2578b59779f88226913' + '722f04bfbc633f91e2ebc0' + '9532e85f3fb137180f77e2f';
    var API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    var MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

    /* ═══════ MUSIC CATALOG ═══════ */
    var MUSIC = [
        { name: 'Ed Sheeran - Perfect', file: 'assets/music/Ed Sheeran - Perfect (Official Music Video).mp3', artist: 'Ed Sheeran', genre: 'Pop/Romance' },
        { name: 'Justin Bieber - Never Say Never ft. Jaden', file: 'assets/music/Justin Bieber - Never Say Never ft. Jaden.mp3', artist: 'Justin Bieber & Jaden Smith', genre: 'Pop/Motivational' }
    ];

    function findMusic(text) {
        var t = (text || '').toLowerCase();
        var results = [];
        for (var i = 0; i < MUSIC.length; i++) {
            var m = MUSIC[i];
            if (t.indexOf(m.name.toLowerCase()) !== -1
                || t.indexOf(m.artist.toLowerCase().split(' ')[0].toLowerCase()) !== -1
                || t.indexOf(m.file.toLowerCase()) !== -1) {
                results.push(m);
            }
        }
        return results;
    }

    function musicPlayerHTML(m) {
        var id = 'audio_' + Math.random().toString(36).substr(2,9);
        return '<div class="music-player" id="' + id + '">'
            + '<audio src="' + m.file + '" preload="metadata" ontimeupdate="LORD.audioUpdate(\'' + id + '\')" onloadedmetadata="LORD.audioLoaded(\'' + id + '\')" onended="LORD.audioEnded(\'' + id + '\')"></audio>'
            + '<div class="mp-art"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>'
            + '<div class="mp-body">'
            +   '<div class="mp-head">'
            +     '<div class="mp-info"><div class="mp-title">' + esc(m.name) + '</div><div class="mp-artist">' + esc(m.artist) + '</div></div>'
            +     '<a href="' + m.file + '" download class="mp-dl" title="تحميل"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>'
            +   '</div>'
            +   '<div class="mp-ctrls">'
            +     '<button class="mp-play" onclick="LORD.audioToggle(\'' + id + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>'
            +     '<div class="mp-progress" onclick="LORD.audioSeek(event, \'' + id + '\')"><div class="mp-bar"></div></div>'
            +     '<div class="mp-time">0:00 / 0:00</div>'
            +   '</div>'
            + '</div>'
            + '</div>';
    }

    var SYSTEM_PROMPT = [
        'أنت LORD AI، مساعد ذكاء اصطناعي متقدم وعالي الأداء.',
        '',
        '## قواعد الرد:',
        '- أجب دائماً بنفس لغة المستخدم (إذا سأل بالعربية أجب بالعربية، إذا سأل بالإنجليزية أجب بالإنجليزية).',
        '- كن دقيقاً وموثوقاً ولا تختلق معلومات.',
        '- نظّم إجاباتك بشكل جيد باستخدام Markdown:',
        '  - استخدم **عناوين** (## و ###) لتقسيم الإجابات الطويلة.',
        '  - استخدم **القوائم** النقطية والمرقمة للتعداد.',
        '  - استخدم **الأكواد** مع تحديد اللغة (```python مثلاً).',
        '  - استخدم **الجداول** عند المقارنة بين عناصر.',
        '  - استخدم **النص العريض** للمصطلحات المهمة.',
        '- إذا لم تكن متأكداً من إجابة، اذكر ذلك بوضوح.',
        '- كن ودوداً ومحترفاً في نفس الوقت.',
        '- عند كتابة الأكواد البرمجية، اكتب كوداً نظيفاً مع تعليقات توضيحية.',
        '- قدّم إجابات شاملة ومفصلة لكن بدون حشو زائد.',
        '- إذا كان السؤال غامضاً، اطلب توضيحاً قبل الإجابة.',
        '',
        '## الأغاني المتوفرة لديك:',
        'لديك أغاني يمكنك تقديمها للمستخدم. عندما يطلب أغنية أو موسيقى، تحقق مما يلي:',
        '1. Ed Sheeran - Perfect (Pop/Romance) — أغنية رومانسية رائعة',
        '2. Justin Bieber - Never Say Never ft. Jaden (Pop/Motivational) — أغنية تحفيزية',
        '',
        'إذا طلب المستخدم أغنية متوفرة، اكتب [MUSIC:اسم_الأغنية] في ردك.',
        'مثال: إذا طلب أغنية Ed Sheeran اكتب [MUSIC:Ed Sheeran - Perfect]',
        'مثال: إذا طلب أغنية Justin Bieber اكتب [MUSIC:Justin Bieber - Never Say Never ft. Jaden]',
        'إذا طلب أغنية غير متوفرة، أخبره بالأغاني المتاحة واقترح عليه إحداها.',
        'يمكنك أيضاً تقديم الأغاني بشكل تلقائي عندما يكون السياق مناسباً.'
    ].join('\n');

    /* ═══════ STATE ═══════ */
    var convs = [];
    var activeId = null;
    var busy = false;
    var ctrl = null;

    /* ═══════ STORAGE ═══════ */
    function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
    function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e) { return d; } }
    function saveAll() { save('lord_convs', convs); save('lord_active', activeId); }

    /* ═══════ FIREBASE ANALYTICS ═══════ */
    var db = null;
    var visitorId = null;

    function initFirebase() {
        try {
            if (typeof firebase !== 'undefined' && typeof FIREBASE_CONFIG !== 'undefined'
                && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) {
                if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
                db = firebase.firestore();
                console.log('[LORD] Firebase connected:', FIREBASE_CONFIG.projectId);
            } else {
                console.log('[LORD] Firebase not configured');
            }
        } catch(e) { console.error('[LORD] Firebase init error:', e); db = null; }
    }

    function getVisitorId() {
        var id = get('lord_visitor_id', null);
        if (!id) {
            id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
            save('lord_visitor_id', id);
        }
        visitorId = id;
        return id;
    }

    function fbLog(action, data) {
        if (!db) return;
        var doc = {
            type: action,
            vid: visitorId || 'unknown',
            t: Date.now(),
            ua: navigator.userAgent.substring(0, 150),
            scr: screen.width + 'x' + screen.height,
            lang: navigator.language || ''
        };
        if (data) { for (var k in data) doc[k] = data[k]; }
        db.collection('lord_logs').add(doc).then(function() {
            console.log('[LORD] Logged:', action);
        }).catch(function(e) {
            console.error('[LORD] Log error:', e.message);
        });
    }

    function trackPageView() {
        getVisitorId();
        fbLog('visit', { ref: document.referrer || 'direct', page: location.pathname });
    }

    function trackMessage(role, text, responseTime) {
        var words = (text || '').split(/\s+/).filter(function(w){return w}).length;
        var isAr = /[\u0600-\u06FF]/.test(text);
        var data = { role: role, words: words, mlang: isAr ? 'ar' : 'en' };
        if (responseTime) data.rt = responseTime;
        fbLog('msg', data);
    }

    function trackError(msg) {
        fbLog('error', { err: (msg || '').substring(0, 200) });
    }

    /* ═══════ DOM ═══════ */
    function $(id) { return document.getElementById(id); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    var el = {};
    function cacheDom() {
        var ids = ['sidebar','overlay','closeSidebar','openSidebar','newChatBtn','convList',
            'clearBtn','themeBtn','themeIcon','chatArea','welcome','messages',
            'input','sendBtn','stopBtn','inputBox','prompts'];
        for (var i = 0; i < ids.length; i++) el[ids[i]] = $(ids[i]);
    }

    /* ═══════ TOAST ═══════ */
    function toast(msg) {
        var old = document.querySelector('.toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(function() { t.classList.add('show'); });
        setTimeout(function() {
            t.classList.remove('show');
            setTimeout(function() { t.remove(); }, 350);
        }, 2500);
    }

    /* ═══════ MARKDOWN PARSER ═══════ */
    function md(text) {
        if (!text) return '';

        // Preserve music tags
        var musicBlocks = [];
        text = text.replace(/\[MUSIC:([^\]]+)\]/g, function(_, name) {
            var idx = musicBlocks.length;
            var found = null;
            for (var i = 0; i < MUSIC.length; i++) {
                if (MUSIC[i].name.toLowerCase().indexOf(name.trim().toLowerCase()) !== -1
                    || name.trim().toLowerCase().indexOf(MUSIC[i].name.toLowerCase()) !== -1) {
                    found = MUSIC[i]; break;
                }
            }
            musicBlocks.push(found ? musicPlayerHTML(found) : '<p>🎵 ' + esc(name) + ' (غير متوفرة)</p>');
            return '%%MUSIC_' + idx + '%%';
        });

        // Preserve code blocks first
        var codeBlocks = [];
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
            var idx = codeBlocks.length;
            var l = lang || 'code';
            codeBlocks.push(
                '<pre><div class="code-h"><span>' + esc(l) + '</span>'
                + '<button class="copy-btn" onclick="LORD.copyCode(this)">'
                + COPY_SVG + ' نسخ</button></div>'
                + '<code>' + esc(code.trim()) + '</code></pre>'
            );
            return '%%CODE_BLOCK_' + idx + '%%';
        });

        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headings
        text = text.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Bold & Italic
        text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Blockquote
        text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // Horizontal rule
        text = text.replace(/^---$/gm, '<hr>');

        // Unordered lists
        text = text.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
        text = text.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Ordered lists
        text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Tables
        text = text.replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)*)/gm, function(_, hdr, sep, body) {
            var ths = hdr.split('|').filter(function(c){return c.trim()}).map(function(c){return '<th>'+c.trim()+'</th>'}).join('');
            var rows = body.trim().split('\n').map(function(r) {
                var tds = r.split('|').filter(function(c){return c.trim()}).map(function(c){return '<td>'+c.trim()+'</td>'}).join('');
                return '<tr>' + tds + '</tr>';
            }).join('');
            return '<table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table>';
        });

        // Paragraphs
        text = text.replace(/^(?!<[a-z/])((?!<\/)[^\n]+)$/gm, '<p>$1</p>');
        text = text.replace(/<p>\s*<\/p>/g, '');

        // Restore code blocks
        for (var i = 0; i < codeBlocks.length; i++) {
            text = text.replace('%%CODE_BLOCK_' + i + '%%', codeBlocks[i]);
        }

        // Restore music blocks
        for (var j = 0; j < musicBlocks.length; j++) {
            text = text.replace('%%MUSIC_' + j + '%%', musicBlocks[j]);
        }

        return text;
    }

    /* ═══════ ICONS ═══════ */
    var COPY_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
    var REGEN_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';

    /* ═══════ GLOBAL ACTIONS ═══════ */
    window.LORD = {
        audioToggle: function(id) {
            var p = document.getElementById(id);
            if (!p) return;
            var a = p.querySelector('audio');
            var btn = p.querySelector('.mp-play');
            if (a.paused) {
                // Pause all others
                document.querySelectorAll('.music-player audio').forEach(function(o) {
                    if(o !== a) { 
                        o.pause(); 
                        var ob = o.parentElement.querySelector('.mp-play');
                        if (ob) ob.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; 
                    }
                });
                a.play();
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            } else {
                a.pause();
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            }
        },
        audioUpdate: function(id) {
            var p = document.getElementById(id);
            if (!p) return;
            var a = p.querySelector('audio');
            var bar = p.querySelector('.mp-bar');
            var time = p.querySelector('.mp-time');
            if (!a.duration) return;
            var pct = (a.currentTime / a.duration) * 100;
            bar.style.width = pct + '%';
            
            var fm = function(s) { var m = Math.floor(s/60); var ss = Math.floor(s%60); return m+':'+(ss<10?'0'+ss:ss); };
            time.textContent = fm(a.currentTime) + ' / ' + fm(a.duration);
        },
        audioLoaded: function(id) {
            this.audioUpdate(id);
        },
        audioEnded: function(id) {
            var p = document.getElementById(id);
            if (!p) return;
            p.querySelector('.mp-play').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            p.querySelector('audio').currentTime = 0;
            this.audioUpdate(id);
        },
        audioSeek: function(e, id) {
            var p = document.getElementById(id);
            if (!p) return;
            var a = p.querySelector('audio');
            var prog = p.querySelector('.mp-progress');
            var rect = prog.getBoundingClientRect();
            var x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            var pct = x / rect.width;
            if (a.duration) {
                a.currentTime = pct * a.duration;
                this.audioUpdate(id);
            }
        },
        copyCode: function(btn) {
            var code = btn.closest('pre').querySelector('code');
            navigator.clipboard.writeText(code.textContent).then(function() {
                var orig = btn.innerHTML;
                btn.innerHTML = CHECK_SVG + ' تم!';
                btn.classList.add('copied');
                setTimeout(function() { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800);
            });
        },
        copyMsg: function(btn) {
            var body = btn.closest('.body');
            var text = body.innerText.replace(/نسخ|إعادة توليد$/gm, '').trim();
            navigator.clipboard.writeText(text).then(function() {
                toast('✓ تم النسخ');
            });
        },
        regen: function(btn) {
            if (busy) return;
            var c = active();
            if (!c || c.msgs.length < 2) return;

            // Remove last AI message
            c.msgs.pop();
            saveAll();
            renderChat();

            // Resend
            busy = true;
            el.sendBtn.classList.add('none');
            el.stopBtn.classList.remove('none');
            showDots();

            callAPI(c.msgs).then(function(res) {
                hideDots();
                var aiMsg = { role: 'assistant', content: '' };
                var node = addMsg(aiMsg);
                return readStream(res, node).then(function(txt) {
                    aiMsg.content = txt;
                    c.msgs.push(aiMsg);
                    saveAll();
                });
            }).catch(function(err) {
                hideDots();
                handleError(err, c);
            }).then(finishSend);
        },
        sw: function(id) { switchConv(id); },
        del: function(id, e) { e.stopPropagation(); deleteConv(id); }
    };

    /* ═══════ THEME ═══════ */
    function initTheme() {
        var t = get('lord_theme', 'dark');
        document.documentElement.setAttribute('data-theme', t);
        setThemeIcon(t);
    }

    function toggleTheme() {
        var c = document.documentElement.getAttribute('data-theme') || 'dark';
        var n = c === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', n);
        save('lord_theme', n);
        setThemeIcon(n);
    }

    function setThemeIcon(t) {
        if (!el.themeIcon) return;
        el.themeIcon.innerHTML = t === 'light'
            ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
            : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }

    /* ═══════ SIDEBAR ═══════ */
    function openSB() { el.sidebar.classList.add('open'); el.overlay.classList.add('on'); }
    function closeSB() { el.sidebar.classList.remove('open'); el.overlay.classList.remove('on'); }

    /* ═══════ CONVERSATIONS ═══════ */
    function loadConvs() {
        convs = get('lord_convs', []);
        activeId = get('lord_active', null);
    }

    function active() {
        for (var i = 0; i < convs.length; i++) {
            if (convs[i].id === activeId) return convs[i];
        }
        return null;
    }

    function genId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function newConv() {
        var c = { id: genId(), title: 'محادثة جديدة', msgs: [], ts: Date.now() };
        convs.unshift(c);
        activeId = c.id;
        saveAll();
        renderList();
        renderChat();
        closeSB();
        el.input.focus();
    }

    function switchConv(id) {
        activeId = id;
        saveAll();
        renderList();
        renderChat();
        closeSB();
    }

    function deleteConv(id) {
        convs = convs.filter(function(c) { return c.id !== id; });
        if (activeId === id) activeId = convs.length ? convs[0].id : null;
        saveAll();
        renderList();
        renderChat();
    }

    function clearAll() {
        if (!convs.length) return;
        convs = []; activeId = null;
        saveAll();
        renderList();
        renderChat();
        toast('تم حذف جميع المحادثات');
    }

    /* ═══════ AUTO TITLE ═══════ */
    function generateTitle(text) {
        text = text.trim();
        // Remove markdown formatting for cleaner title
        text = text.replace(/[#*`>\[\]()]/g, '').trim();
        if (text.length <= 35) return text;
        // Try to cut at word boundary
        var cut = text.substring(0, 35);
        var lastSpace = cut.lastIndexOf(' ');
        if (lastSpace > 15) cut = cut.substring(0, lastSpace);
        return cut + '…';
    }

    /* ═══════ RENDER ═══════ */
    function renderList() {
        if (!convs.length) {
            el.convList.innerHTML = '<div class="sidebar-empty">'
                + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3">'
                + '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
                + '<span>ابدأ محادثة جديدة</span></div>';
            return;
        }
        var h = '';
        for (var i = 0; i < convs.length; i++) {
            var c = convs[i];
            h += '<div class="conv' + (c.id === activeId ? ' on' : '') + '" onclick="LORD.sw(\'' + c.id + '\')">'
                + '<span class="conv-t">' + esc(c.title) + '</span>'
                + '<button class="conv-x" onclick="LORD.del(\'' + c.id + '\',event)" title="حذف">'
                + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                + '</button></div>';
        }
        el.convList.innerHTML = h;
    }

    function renderChat() {
        var c = active();
        if (!c || !c.msgs.length) {
            el.welcome.style.display = '';
            el.welcome.classList.remove('none');
            el.messages.innerHTML = '';
            return;
        }
        el.welcome.style.display = 'none';
        var h = '';
        for (var i = 0; i < c.msgs.length; i++) {
            h += msgHTML(c.msgs[i], i === c.msgs.length - 1 && c.msgs[i].role === 'assistant');
        }
        el.messages.innerHTML = h;
        scrollBottom();
    }

    function msgHTML(m, isLastAI) {
        var isU = m.role === 'user';
        var content = isU ? '<p>' + esc(m.content) + '</p>' : md(m.content);
        var av = isU ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' : 'L';
        var acts = '';
        if (!isU) {
            acts = '<div class="msg-acts">'
                + '<button class="act-btn" onclick="LORD.copyMsg(this)">' + COPY_SVG + ' نسخ</button>';
            if (isLastAI) {
                acts += '<button class="act-btn" onclick="LORD.regen(this)">' + REGEN_SVG + ' إعادة توليد</button>';
            }
            acts += '</div>';
        }
        return '<div class="msg ' + (isU ? 'msg-u' : 'msg-a') + '">'
            + '<div class="msg-in">'
            + '<div class="avatar">' + av + '</div>'
            + '<div class="body">' + content + acts + '</div>'
            + '</div></div>';
    }

    function addMsg(m) {
        el.welcome.style.display = 'none';
        var d = document.createElement('div');
        d.innerHTML = msgHTML(m, false);
        var node = d.firstElementChild;
        el.messages.appendChild(node);
        scrollBottom();
        return node;
    }

    function showDots() {
        var d = document.createElement('div');
        d.className = 'msg msg-a';
        d.id = 'dotsMsg';
        d.innerHTML = '<div class="msg-in"><div class="avatar">L</div><div class="body"><div class="dots"><i></i><i></i><i></i></div></div></div>';
        el.messages.appendChild(d);
        scrollBottom();
    }

    function hideDots() {
        var d = $('dotsMsg');
        if (d) d.remove();
    }

    function scrollBottom() {
        requestAnimationFrame(function() {
            el.chatArea.scrollTop = el.chatArea.scrollHeight;
        });
    }

    /* ═══════ API ═══════ */
    function callAPI(msgs) {
        var contents = [{ role: 'system', content: SYSTEM_PROMPT }];
        for (var i = 0; i < msgs.length; i++) {
            contents.push({
                role: msgs[i].role === 'user' ? 'user' : 'assistant',
                content: msgs[i].content
            });
        }

        ctrl = new AbortController();

        return fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY,
                'HTTP-Referer': 'https://lord-shaban.github.io/lord-ai/',
                'X-Title': 'LORD AI'
            },
            signal: ctrl.signal,
            body: JSON.stringify({
                model: MODEL,
                messages: contents,
                stream: true,
                temperature: 0.7,
                max_tokens: 4096,
                top_p: 0.9
            })
        }).then(function(res) {
            if (!res.ok) {
                return res.json().catch(function() { return {}; }).then(function(err) {
                    var msg = err && err.error ? err.error.message : 'خطأ في الاتصال (HTTP ' + res.status + ')';
                    throw new Error(msg);
                });
            }
            return res;
        });
    }

    function readStream(res, msgEl) {
        var reader = res.body.getReader();
        var dec = new TextDecoder();
        var full = '';
        var buf = '';
        var bodyEl = msgEl.querySelector('.body');
        var renderTimer = null;
        bodyEl.classList.add('typing');

        function renderContent() {
            bodyEl.innerHTML = md(full);
            bodyEl.classList.add('typing');
            scrollBottom();
        }

        function pump() {
            return reader.read().then(function(result) {
                if (result.done) {
                    if (renderTimer) clearTimeout(renderTimer);
                    bodyEl.classList.remove('typing');
                    bodyEl.innerHTML = md(full) + '<div class="msg-acts">'
                        + '<button class="act-btn" onclick="LORD.copyMsg(this)">' + COPY_SVG + ' نسخ</button>'
                        + '<button class="act-btn" onclick="LORD.regen(this)">' + REGEN_SVG + ' إعادة توليد</button>'
                        + '</div>';
                    return full;
                }

                buf += dec.decode(result.value, { stream: true });
                var lines = buf.split('\n');
                buf = lines.pop() || '';
                var changed = false;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.indexOf('data: ') !== 0) continue;
                    var json = line.slice(6).trim();
                    if (!json || json === '[DONE]') continue;
                    try {
                        var data = JSON.parse(json);
                        var t = data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content
                            ? data.choices[0].delta.content : '';
                        if (t) { full += t; changed = true; }
                    } catch(e) {}
                }

                // Throttle rendering for performance
                if (changed && !renderTimer) {
                    renderTimer = setTimeout(function() {
                        renderTimer = null;
                        renderContent();
                    }, 30);
                }

                return pump();
            });
        }

        return pump().catch(function(e) {
            if (renderTimer) clearTimeout(renderTimer);
            bodyEl.classList.remove('typing');
            if (e.name === 'AbortError') {
                full += '\n\n*(تم الإيقاف)*';
            } else {
                throw e;
            }
            bodyEl.innerHTML = md(full) + '<div class="msg-acts">'
                + '<button class="act-btn" onclick="LORD.copyMsg(this)">' + COPY_SVG + ' نسخ</button></div>';
            return full;
        });
    }

    /* ═══════ ERROR HANDLING ═══════ */
    function handleError(err, c) {
        var errText = '⚠️ ' + (err.message || 'حدث خطأ غير متوقع');
        if (err.message && err.message.indexOf('rate') !== -1) {
            errText = '⏳ تم تجاوز الحد المسموح. انتظر قليلاً وحاول مرة أخرى.';
        }
        var aiMsg = { role: 'assistant', content: errText };
        c.msgs.push(aiMsg);
        saveAll();
        addMsg(aiMsg);
    }

    function finishSend() {
        busy = false;
        ctrl = null;
        el.sendBtn.classList.remove('none');
        el.stopBtn.classList.add('none');
    }

    /* ═══════ SEND ═══════ */
    function send(text) {
        text = text.trim();
        if (!text || busy) return;

        var c = active();
        if (!c) { newConv(); c = active(); }

        var userMsg = { role: 'user', content: text, ts: Date.now() };
        c.msgs.push(userMsg);

        if (c.msgs.length === 1) {
            c.title = generateTitle(text);
            renderList();
        }

        saveAll();
        addMsg(userMsg);
        trackMessage('user', text);

        el.input.value = '';
        resizeInput();
        updateSend();

        busy = true;
        el.sendBtn.classList.add('none');
        el.stopBtn.classList.remove('none');
        showDots();
        var sendTime = Date.now();

        callAPI(c.msgs).then(function(res) {
            hideDots();
            var aiMsg = { role: 'assistant', content: '', ts: Date.now() };
            var node = addMsg(aiMsg);
            return readStream(res, node).then(function(txt) {
                aiMsg.content = txt;
                c.msgs.push(aiMsg);
                saveAll();
                trackMessage('assistant', txt, Date.now() - sendTime);
            });
        }).catch(function(err) {
            hideDots();
            handleError(err, c);
            trackError(err.message);
        }).then(finishSend);
    }

    /* ═══════ INPUT ═══════ */
    function resizeInput() {
        el.input.style.height = 'auto';
        el.input.style.height = Math.min(el.input.scrollHeight, 160) + 'px';
    }

    function updateSend() {
        el.sendBtn.disabled = !el.input.value.trim();
    }

    /* ═══════ EVENTS ═══════ */
    function bind() {
        el.openSidebar.addEventListener('click', openSB);
        el.closeSidebar.addEventListener('click', closeSB);
        el.overlay.addEventListener('click', closeSB);
        el.newChatBtn.addEventListener('click', newConv);
        el.clearBtn.addEventListener('click', clearAll);
        el.themeBtn.addEventListener('click', toggleTheme);

        el.sendBtn.addEventListener('click', function() { send(el.input.value); });
        el.stopBtn.addEventListener('click', function() { if (ctrl) ctrl.abort(); });

        el.input.addEventListener('input', function() { resizeInput(); updateSend(); });
        el.input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (el.input.value.trim() && !busy) send(el.input.value);
            }
        });

        // Prompt cards
        var cards = document.querySelectorAll('.prompt-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('click', function() {
                var q = this.getAttribute('data-q');
                if (q) { el.input.value = q; send(q); }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && el.sidebar.classList.contains('open')) closeSB();
            if (e.ctrlKey && e.shiftKey && e.key === 'N') { e.preventDefault(); newConv(); }
            // Focus input with /
            if (e.key === '/' && document.activeElement !== el.input && !busy) {
                e.preventDefault();
                el.input.focus();
            }
        });

        // Auto-resize on window resize
        window.addEventListener('resize', function() { resizeInput(); });
    }

    /* ═══════ INIT ═══════ */
    function init() {
        cacheDom();
        initTheme();
        initFirebase();
        loadConvs();
        trackPageView();
        renderList();
        renderChat();
        bind();
        updateSend();
        setTimeout(function() { if (el.input) el.input.focus(); }, 200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
