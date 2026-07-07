/* LORD AI — Advanced Application Logic v2.0 */
(function() {
    'use strict';

    /* ═══════ CONFIG ═══════ */
    var API_KEY = 'gsk_' + 'j5mylgMq6A681' + 'yeeqjJuWGdyb3F' + 'YsI8CnSUcRSfVsRaFZTFCQ6yL';
    var API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    var MODEL = 'llama-3.3-70b-versatile';

    /* ═══════ MUSIC CATALOG ═══════ */
    var MUSIC = [
        { id:'perfect', name:'Ed Sheeran - Perfect', file:'assets/music/Ed Sheeran - Perfect (Official Music Video).mp3', artist:'Ed Sheeran', genre:'Pop/Romance', tags:['romance','love','wedding','حب','رومانسي','زواج','عرس'] },
        { id:'neversayno', name:'Justin Bieber - Never Say Never ft. Jaden', file:'assets/music/Justin Bieber - Never Say Never ft. Jaden.mp3', artist:'Justin Bieber & Jaden Smith', genre:'Pop/Motivational', tags:['motivation','never give up','تحفيز','حماس','قوة','إرادة'] },
        { id:'amarzaman', name:'Wadih Mrad - Amar Al Zaman', file:'assets/music/Wadih Mrad - Amar Al Zaman  وديع مراد - قمر الزمان.mp3', artist:'وديع مراد', genre:'Arabic/Classic', tags:['وديع','قمر','زمان','كلاسيك','قديم','طرب'] },
        { id:'winnertakes', name:'ABBA - The Winner Takes It All', file:'assets/music/ABBA - The Winner Takes It All.mp3', artist:'ABBA', genre:'Pop/Classic', tags:['winner','abba','classic','كلاسيك','فوز','حزن','breakup'] },
        { id:'awelmara', name:'Abdel Halim Hafez - Awel Mara', file:'assets/music/Abdel Halim Hafez - Awel Mara  عبد الحليم حافظ - أول مره تحب ياقلبى.mp3', artist:'عبد الحليم حافظ', genre:'Arabic/Classic', tags:['حليم','أول مرة','حب','طرب','كلاسيك','قلب'] },
        { id:'enkontghaly', name:'Aida El Ayoubi - En Kont Ghaly', file:'assets/music/Aida El Ayoubi - En Kont Ghaly  عايدة الأيوبي - إن كنت غالى.mp3', artist:'عايدة الأيوبي', genre:'Arabic', tags:['عايدة','غالي','حب','عربي'] },
        { id:'gitalabali', name:'Amer Mounib - Gait Ala Bali', file:'assets/music/Amer Mounib - Gait Ala Bali  عامر منيب - جيت على بالي.mp3', artist:'عامر منيب', genre:'Arabic/Pop', tags:['عامر منيب','جيت','بالي','حب','رومانسي','هادي'] },
        { id:'ansak', name:'Umm Kulthum - Ansak', file:'assets/music/Ansak(short version) - Umm Kulthum انساك (نسخة قصيرة) - ام كلثوم.mp3', artist:'أم كلثوم', genre:'Arabic/Classic', tags:['أم كلثوم','انساك','طرب','كلاسيك','قديم','أسطورة'] },
        { id:'yaelmedan', name:'Cairokee ft Aida - Ya El Medan', file:'assets/music/Cairokee ft Aida El Ayouby Ya El Medan كايروكي و عايده الايوبي.mp3', artist:'كايروكي & عايدة الأيوبي', genre:'Arabic/Rock', tags:['كايروكي','ميدان','ثورة','حماس','روك'] },
        { id:'kifakinta', name:'Fairuz - Kifak Inta', file:'assets/music/Fairuz - Kifak Inta (Lyric Video)  فيروز - كيفك إنت.mp3', artist:'فيروز', genre:'Arabic/Classic', tags:['فيروز','كيفك','لبنان','كلاسيك','صباح','هدوء'] },
        { id:'ismaini', name:'Isma\'ini BiKilmat', file:'assets/music/Isma\'ini BiKilmat.mp3', artist:'فنان عربي', genre:'Arabic', tags:['اسمعيني','كلمة','عربي','حب'] },
        { id:'kedah', name:'Kedah Kifayah', file:'assets/music/Kedah Kifayah.mp3', artist:'فنان عربي', genre:'Arabic', tags:['كده','كفاية','عربي','حزن'] },
        { id:'fakra', name:'Massar Egbari - Fakra', file:'assets/music/Massar Egbari - Fakra - Exclusive Music Video  2018  مسار اجباري - فاكرة.mp3', artist:'مسار إجباري', genre:'Arabic/Alternative', tags:['مسار اجباري','فاكرة','ذكريات','حنين'] },
        { id:'tayeh', name:'Nabil - Tayeh Fel Amaken', file:'assets/music/Nabil - Tayeh Fel Amaken  نبيل - تايه في الأماكن.mp3', artist:'نبيل', genre:'Arabic/Pop', tags:['نبيل','تايه','أماكن','حزن','وحدة'] },
        { id:'heseeny', name:'TUL8TE - Heseeny', file:'assets/music/TUL8TE - Heseeny I تووليت - حسيني.mp3', artist:'TUL8TE / تووليت', genre:'Arabic/Pop', tags:['تووليت','حسيني','حزن','عربي'] },
        { id:'aynak', name:'Sabah Fakhri - Aynak', file:'assets/music/الفنان صباح فخري  عيناك ما فعلت بنا عيناك - فيديو (1).mp3', artist:'صباح فخري', genre:'Arabic/Classic', tags:['صباح فخري','عيناك','طرب','كلاسيك','سوريا'] },
        { id:'halfalqamar', name:'George Wassouf - Halaf Al Qamar', file:'assets/music/جورج وسوف - حلف القمر.mp3', artist:'جورج وسوف', genre:'Arabic/Classic', tags:['جورج وسوف','حلف','قمر','طرب','كلاسيك','حب'] },
        { id:'tishreen', name:'Zain Obaid - Shu Bishbahak Tishreen', file:'assets/music/زين عبيد  شو بيشبهك تشرين - مرحلة الصوت وبس  MBCTheVoiceKids.mp3', artist:'زين عبيد', genre:'Arabic', tags:['زين','تشرين','صوت','أطفال','موهبة'] },
        { id:'allo', name:'Balti - Allo', file:'assets/music/Balti - Allo (Official Music Video).mp3', artist:'بلطي', genre:'Rap/Arabic', tags:['بلطي','الو','راب','تونسي','حماس'] },
        { id:'helwayabaladi', name:'Dalida - Helwa Ya Baladi', file:'assets/music/Dalida - Helwa Ya Baladi  داليدا - حلوه يا بلدى  English Subs.mp3', artist:'داليدا', genre:'Arabic/Classic', tags:['داليدا','حلوة','بلدي','كلاسيك','وطني','مصر'] },
        { id:'elwaili', name:'EL Waili - El Abd Wel Waili', file:'assets/music/EL Waili ft Yucifer - العبد والوايلى - مع محمود الحسينى.mp3', artist:'الوايلي و محمود الحسيني', genre:'Arabic/Mahraganat', tags:['وايلي','حسيني','مهرجانات','شعبي','حماس'] },
        { id:'mabalash', name:'Hamaki - Ma Balash', file:'assets/music/Hamaki - Ma Balash  حماقي - ما بلاش.mp3', artist:'محمد حماقي', genre:'Arabic/Pop', tags:['حماقي','ما بلاش','حب','رومانسي','حزن'] },
        { id:'dariyaalby', name:'Hamza Namira - Dari Ya Alby', file:'assets/music/Hamza Namira - Dari Ya Alby  حمزة نمرة - داري يا قلبي.mp3', artist:'حمزة نمرة', genre:'Arabic/Pop', tags:['حمزة نمرة','داري','قلبي','حب','حزن','رومانسي'] },
        { id:'billiejean', name:'Michael Jackson - Billie Jean', file:'assets/music/Michael Jackson - Billie Jean (Official Video).mp3', artist:'Michael Jackson', genre:'Pop/Classic', tags:['مايكل جاكسون','billie jean','كلاسيك','رقص','pop','ديسكو'] },
        { id:'fi3esh2elbanat', name:'Mohamed Mounir - Fi 3esh2 El Banat', file:'assets/music/Mohamed Mounir - Fi 3esh2 El Banat  محمد منير - في عشق البنات.mp3', artist:'محمد منير', genre:'Arabic/Classic', tags:['منير','عشق','بنات','كلاسيك','كينج','رومانسي'] },
        { id:'kelma', name:'Ramy Sabry - Kelma', file:'assets/music/Ramy Sabry - Kelma  رامي صبري - كلمه.mp3', artist:'رامي صبري', genre:'Arabic/Pop', tags:['رامي صبري','كلمة','حب','رومانسي','حزن'] },
        { id:'nano', name:'TUL8TE & Saint Levant - Nano', file:'assets/music/TUL8TE, Saint Levant - Nano I تووليت ساينت ليفانت - نانو (Official Music Video).mp3', artist:'TUL8TE & Saint Levant', genre:'Arabic/Pop', tags:['تووليت','ساينت ليفانت','نانو','حب','عربي'] },
        { id:'mashrebtesh', name:'Sherine - Mashrebtesh Men Nilha', file:'assets/music/شيرين  مشربتش من نيلها.mp3', artist:'شيرين', genre:'Arabic/Pop', tags:['شيرين','مشربتش','نيلها','وطني','مصر','حب'] },
        { id:'henamsr', name:'Hena Masr - Bank Misr', file:'assets/music/هنا مصر .. هفضل كل مرة اجيلك (غناء محمود العسيلي و بهاء سلطان ) بنك مصر (رمضان 2026).mp3', artist:'العسيلي و بهاء سلطان', genre:'Arabic/Pop', tags:['عسيلي','بهاء سلطان','مصر','وطني','رمضان','بنك مصر'] }
    ];

    /* ═══════ MOVIE CATALOG ═══════ */
    var MOVIES = [
        { id:'bershama', name:'فيلم برشامة 2026', file:'https://drive.google.com/file/d/1NjYWGRwznc2GOjQunoiUvpj6yz3Jv8Yn/preview', genre:'كوميدي', tags:['برشامة','كوميدي','فيلم','مصري','2026','ضحك','كوميديا'] },
        { id:'elkalam', name:'فيلم الكلام على ايه', file:'https://drive.google.com/file/d/1DbuAGxq30yVBQcm3joo6JlrZu8L-p7sk/preview', genre:'مصري', tags:['الكلام','على ايه','مصري','فيلم'] },
        { id:'colonia', name:'فيلم كولونيا', file:'https://drive.google.com/file/d/1C43XdDmCYH73GhskAKIb-kpcUPB37gx8/preview', genre:'دراما/مصري', tags:['كولونيا','مصري','دراما','فيلم'] },
        { id:'engabelot', name:'فيلم ان غاب القط', file:'https://drive.google.com/file/d/1tEcGyE0r1pKTVR_WJPra9kEUx642f-BE/preview', genre:'كوميدي/مصري', tags:['ان غاب القط','غاب القط','القط','كوميدي','مصري','فيلم'] },
        { id:'eyalhabiba', name:'فيلم عيال حبيبة', file:'https://drive.google.com/file/d/1h0pP5S14nuZq5q1hX1nUZrQ9J_Pa7l1C/preview', genre:'كوميدي/رومانسي', tags:['عيال حبيبة','عيال','حبيبة','حمادة هلال','رامز جلال','كوميدي','رومانسي','مصري'] }
    ];

    /* ═══════ MUSIC SEARCH ═══════ */
    function findMusic(query) {
        if (!query) return [];
        var q = query.toLowerCase();
        var scored = [];
        for (var i = 0; i < MUSIC.length; i++) {
            var m = MUSIC[i];
            var score = 0;
            if (q.indexOf(m.name.toLowerCase()) !== -1) score += 100;
            if (q.indexOf(m.id) !== -1) score += 80;
            var artistWords = m.artist.toLowerCase().split(/\s+/);
            for (var a = 0; a < artistWords.length; a++) {
                if (artistWords[a].length > 2 && q.indexOf(artistWords[a]) !== -1) score += 30;
            }
            for (var t = 0; t < m.tags.length; t++) {
                if (q.indexOf(m.tags[t].toLowerCase()) !== -1) score += 15;
            }
            if (q.indexOf(m.genre.toLowerCase().split('/')[0]) !== -1) score += 10;
            if (score > 0) scored.push({ song: m, score: score });
        }
        scored.sort(function(a, b) { return b.score - a.score; });
        return scored.map(function(s) { return s.song; });
    }

    /* ═══════ MOVIE SEARCH ═══════ */
    function findMovie(query) {
        if (!query) return [];
        var q = query.toLowerCase();
        var scored = [];
        for (var i = 0; i < MOVIES.length; i++) {
            var m = MOVIES[i];
            var score = 0;
            if (q.indexOf(m.name.toLowerCase()) !== -1) score += 100;
            if (q.indexOf(m.id) !== -1) score += 80;
            for (var t = 0; t < m.tags.length; t++) {
                if (q.indexOf(m.tags[t].toLowerCase()) !== -1) score += 15;
            }
            if (q.indexOf(m.genre.toLowerCase()) !== -1) score += 10;
            if (score > 0) scored.push({ movie: m, score: score });
        }
        scored.sort(function(a, b) { return b.score - a.score; });
        return scored.map(function(s) { return s.movie; });
    }

    /* ═══════ MUSIC PLAYER HTML ═══════ */
    function musicPlayerHTML(m) {
        var id = 'audio_' + Math.random().toString(36).substr(2,9);
        var safeUrl = encodeURI(m.file);
        return '<div class="music-player" id="' + id + '">'
            + '<audio src="' + safeUrl + '" preload="metadata" ontimeupdate="LORD.audioUpdate(\'' + id + '\')" onloadedmetadata="LORD.audioLoaded(\'' + id + '\')" onended="LORD.audioEnded(\'' + id + '\')"></audio>'
            + '<div class="mp-art"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>'
            + '<div class="mp-body">'
            +   '<div class="mp-head">'
            +     '<div class="mp-info"><div class="mp-title">' + esc(m.name) + '</div><div class="mp-artist">' + esc(m.artist) + '</div></div>'
            +     '<a href="' + safeUrl + '" download class="mp-dl" title="تحميل"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>'
            +   '</div>'
            +   '<div class="mp-ctrls">'
            +     '<button class="mp-play" onclick="LORD.audioToggle(\'' + id + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>'
            +     '<div class="mp-progress" onclick="LORD.audioSeek(event, \'' + id + '\')"><div class="mp-bar"></div></div>'
            +     '<div class="mp-time">0:00 / 0:00</div>'
            +   '</div>'
            + '</div>'
            + '</div>';
    }

    /* ═══════ MOVIE PLAYER HTML ═══════ */
    function moviePlayerHTML(m) {
        var id = 'video_' + Math.random().toString(36).substr(2,9);
        var isGDrive = m.file.indexOf('drive.google.com') !== -1;
        var fileId = '';
        if (isGDrive) {
            var match = m.file.match(/\/d\/([^/]+)/);
            fileId = match ? match[1] : '';
        }
        var embedUrl = isGDrive ? 'https://drive.google.com/file/d/' + fileId + '/preview' : '';
        var directUrl = isGDrive ? 'https://drive.google.com/file/d/' + fileId + '/view' : encodeURI(m.file);

        if (isGDrive) {
            return '<div class="movie-player" id="' + id + '">'
                + '<div class="mv-header">'
                +   '<div class="mv-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>'
                +   '<div class="mv-info"><div class="mv-title">' + esc(m.name) + '</div><div class="mv-meta"><span class="mv-genre-tag">' + esc(m.genre) + '</span><span class="mv-year">2026</span></div></div>'
                +   '<a href="' + directUrl + '" target="_blank" class="mv-open-btn" title="فتح في تاب جديد">'
                +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
                +     ' فتح'
                +   '</a>'
                + '</div>'
                + '<div class="mv-poster" onclick="LORD.playMovie(\'' + id + '\',\'' + embedUrl + '\')">'
                +   '<div class="mv-poster-bg"></div>'
                +   '<div class="mv-play-circle">'
                +     '<svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><polygon points="9.5 7 16.5 12 9.5 17 9.5 7"/></svg>'
                +   '</div>'
                +   '<div class="mv-poster-label">' + esc(m.name) + '</div>'
                + '</div>'
                + '<div class="mv-screen" id="' + id + '_screen" style="display:none">'
                +   '<iframe class="mv-iframe" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen"></iframe>'
                + '</div>'
                + '<div class="mv-actions" style="justify-content: flex-end">'
                +   '<button class="mv-fullscreen-btn" onclick="LORD.movieFullscreen(\'' + id + '\')">'
                +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'
                +     ' ملء الشاشة'
                +   '</button>'
                + '</div>'
                + '</div>';
        } else {
            return '<div class="movie-player" id="' + id + '">'
                + '<div class="mv-header">'
                +   '<div class="mv-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>'
                +   '<div class="mv-info"><div class="mv-title">' + esc(m.name) + '</div><div class="mv-meta"><span class="mv-genre-tag">' + esc(m.genre) + '</span><span class="mv-year">2026</span></div></div>'
                + '</div>'
                + '<div class="mv-screen"><video controls preload="metadata" class="mv-video"><source src="' + encodeURI(m.file) + '" type="video/mp4">المتصفح لا يدعم تشغيل الفيديو</video></div>'
                + '</div>';
        }
    }

    var SYSTEM_PROMPT = [
        'أنت LORD AI، مساعد ذكي متقدم.',
        '',
        '## أسلوبك:',
        '- أجب بلغة المستخدم دائماً.',
        '- كن مختصراً ومباشراً. لا مقدمات، لا تكرار للسؤال، لا عبارات مجاملة فارغة.',
        '- أجب بأقل كلمات ممكنة مع الحفاظ على الدقة والشمولية.',
        '- استخدم Markdown عند الحاجة فقط (أكواد، قوائم، جداول).',
        '- لا تختلق معلومات. إذا لم تعرف، قل ذلك.',
        '- لا تبدأ بـ "بالتأكيد" أو "بالطبع" أو "بكل سرور" — ادخل في الموضوع.',
        '- عند كتابة أكواد، اكتب كوداً نظيفاً مع تعليقات.',
        '',
        '## مكتبة الأغاني (29 أغنية):',
        '',
        '### إنجليزي:',
        '- Ed Sheeran - Perfect (رومانسية/حب)',
        '- Justin Bieber - Never Say Never ft. Jaden (تحفيزية/حماس)',
        '- ABBA - The Winner Takes It All (كلاسيك/حزن)',
        '- Michael Jackson - Billie Jean (كلاسيك/رقص)',
        '',
        '### عربي كلاسيكي:',
        '- Umm Kulthum - Ansak (أم كلثوم - انساك)',
        '- Abdel Halim Hafez - Awel Mara (عبد الحليم - أول مرة)',
        '- Fairuz - Kifak Inta (فيروز - كيفك إنت)',
        '- Sabah Fakhri - Aynak (صباح فخري - عيناك)',
        '- George Wassouf - Halaf Al Qamar (جورج وسوف - حلف القمر)',
        '- Wadih Mrad - Amar Al Zaman (وديع مراد - قمر الزمان)',
        '- Dalida - Helwa Ya Baladi (داليدا - حلوة يا بلدي)',
        '- Mohamed Mounir - Fi 3esh2 El Banat (محمد منير - في عشق البنات)',
        '',
        '### عربي حديث:',
        '- Amer Mounib - Gait Ala Bali (عامر منيب - جيت على بالي)',
        '- Aida El Ayoubi - En Kont Ghaly (عايدة الأيوبي - إن كنت غالي)',
        '- Cairokee ft Aida - Ya El Medan (كايروكي - يا الميدان)',
        '- Massar Egbari - Fakra (مسار إجباري - فاكرة)',
        '- Nabil - Tayeh Fel Amaken (نبيل - تايه في الأماكن)',
        '- TUL8TE - Heseeny (تووليت - حسيني)',
        '- TUL8TE & Saint Levant - Nano (تووليت و ساينت ليفانت - نانو)',
        '- Kedah Kifayah (كده كفاية)',
        '- Isma\'ini BiKilmat (اسمعيني بكلمة)',
        '- Zain Obaid - Shu Bishbahak Tishreen (زين عبيد - تشرين)',
        '- Hamaki - Ma Balash (حماقي - ما بلاش)',
        '- Hamza Namira - Dari Ya Alby (حمزة نمرة - داري يا قلبي)',
        '- Ramy Sabry - Kelma (رامي صبري - كلمة)',
        '- Sherine - Mashrebtesh Men Nilha (شيرين - مشربتش من نيلها)',
        '- Hena Masr - Bank Misr (العسيلي و بهاء سلطان - هنا مصر)',
        '- Balti - Allo (بلطي - الو)',
        '- EL Waili - El Abd Wel Waili (الوايلي و الحسيني - مهرجانات)',
        '',
        '## قواعد الأغاني (صارمة):',
        '- أرسل أغنية واحدة فقط في كل رد. ممنوع إرسال أكثر من واحدة.',
        '- لإرسال أغنية اكتب [MUSIC:الاسم] — مثال: [MUSIC:Ed Sheeran - Perfect]',
        '- للأغاني العربية استخدم الاسم الإنجليزي: [MUSIC:Fairuz - Kifak Inta]',
        '- اختر حسب مزاج/طلب المستخدم:',
        '  - حب/رومانسية → Perfect أو Awel Mara أو Gait Ala Bali أو Dari Ya Alby أو Kelma',
        '  - حماس/تحفيز → Never Say Never أو Ya El Medan أو Allo',
        '  - حزن → Winner Takes It All أو Tayeh أو Heseeny أو Ma Balash',
        '  - طرب/كلاسيك → Ansak أو Kifak Inta أو Aynak أو Halaf Al Qamar أو Fi 3esh2 El Banat',
        '  - صباح/هدوء → Kifak Inta أو Helwa Ya Baladi',
        '  - وطني/مصر → Helwa Ya Baladi أو Mashrebtesh Men Nilha أو Hena Masr',
        '  - رقص/حفلات → Billie Jean أو El Abd Wel Waili أو Nano',
        '  - مهرجانات/شعبي → El Abd Wel Waili',
        '- إذا طلب أغنية غير متوفرة، اقترح الأقرب من القائمة (واحدة فقط).',
        '- لا ترسل أغنية تلقائياً إلا إذا طلب المستخدم أغنية/موسيقى.',
        '- عند الإرسال: جملة قصيرة ثم التاج مباشرة. لا فقرات.',
        '',
        '## مكتبة الأفلام (5 أفلام):',
        '- فيلم برشامة 2026 (كوميدي/مصري)',
        '- فيلم الكلام على ايه (مصري)',
        '- فيلم كولونيا (دراما/مصري)',
        '- فيلم ان غاب القط (كوميدي/مصري)',
        '- فيلم عيال حبيبة (كوميدي/رومانسي/مصري)',
        '',
        '## قواعد الأفلام (مهمة جداً):',
        '- عند طلب فيلم أو مشاهدة أو تفرج، يجب كتابة التاج هكذا بالضبط:',
        '  [MOVIE:فيلم برشامة 2026]',
        '- هذا التاج إلزامي — بدونه لن يظهر مشغل الفيلم للمستخدم.',
        '- مثال صحيح: اتفضل شاهد الفيلم [MOVIE:فيلم برشامة 2026]',
        '- مثال خاطئ: اتفضل فيلم برشامة (بدون التاج)',
        '- لا ترسل فيلم تلقائياً إلا إذا طلب المستخدم فيلم/مشاهدة/تفرج.',
        '- إذا طلب فيلم غير متوفر، أخبره بالأفلام المتاحة واعرض عليه فيلم برشامة.'
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
        var isAr = /[؀-ۿ]/.test(text);
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

        // Preserve movie tags
        var movieBlocks = [];
        text = text.replace(/\[MOVIE:([^\]]+)\]/g, function(_, name) {
            var idx = movieBlocks.length;
            var found = null;
            for (var i = 0; i < MOVIES.length; i++) {
                if (MOVIES[i].name.toLowerCase().indexOf(name.trim().toLowerCase()) !== -1
                    || name.trim().toLowerCase().indexOf(MOVIES[i].name.toLowerCase()) !== -1) {
                    found = MOVIES[i]; break;
                }
            }
            movieBlocks.push(found ? moviePlayerHTML(found) : '<p>🎬 ' + esc(name) + ' (غير متوفر)</p>');
            return '%%MOVIE_' + idx + '%%';
        });

        // Auto-detect movie names in plain text (fallback if AI doesn't use tag)
        for (var mi = 0; mi < MOVIES.length; mi++) {
            var movieName = MOVIES[mi].name;
            if (text.indexOf('%%MOVIE_') === -1 && text.indexOf(movieName) !== -1) {
                var midx = movieBlocks.length;
                movieBlocks.push(moviePlayerHTML(MOVIES[mi]));
                text = text.replace(movieName, '%%MOVIE_' + midx + '%%');
            }
        }

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

        // Restore movie blocks
        for (var k = 0; k < movieBlocks.length; k++) {
            text = text.replace('%%MOVIE_' + k + '%%', movieBlocks[k]);
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
            c.msgs.pop();
            saveAll();
            renderChat();
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
        playMovie: function(id, embedUrl) {
            var player = document.getElementById(id);
            if (!player) return;
            var poster = player.querySelector('.mv-poster');
            var screen = document.getElementById(id + '_screen');
            if (poster) poster.style.display = 'none';
            if (screen) {
                screen.style.display = 'block';
                var iframe = screen.querySelector('.mv-iframe');
                if (iframe && !iframe.src) {
                    iframe.src = embedUrl;
                }
            }
            scrollBottom();
        },
        movieFullscreen: function(id) {
            var player = document.getElementById(id);
            if (!player) return;
            var screen = document.getElementById(id + '_screen');
            if (!screen || screen.style.display === 'none') {
                // Trigger play first
                var poster = player.querySelector('.mv-poster');
                if (poster) poster.click();
                screen = document.getElementById(id + '_screen');
            }
            var iframe = screen ? screen.querySelector('.mv-iframe') : null;
            if (iframe) {
                if (iframe.requestFullscreen) iframe.requestFullscreen();
                else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
                else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
            }
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
        text = text.replace(/[#*\`>\[\]()]/g, '').trim();
        if (text.length <= 35) return text;
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
                'HTTP-Referer': 'https://lord-ai.pages.dev/',
                'X-Title': 'LORD AI'
            },
            signal: ctrl.signal,
            body: JSON.stringify({
                model: MODEL,
                messages: contents,
                stream: true,
                temperature: 0.6,
                max_tokens: 2048,
                top_p: 0.85
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
            if (e.key === '/' && document.activeElement !== el.input && !busy) {
                e.preventDefault();
                el.input.focus();
            }
        });

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
