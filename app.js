/* LORD AI — Advanced Application Logic v2.0 */
(function () {
    'use strict';

    /* ═══════ CONFIG ═══════ */
    // Key pool: on a 429/quota error the request retries transparently with the
    // next key (keys must belong to DIFFERENT Google projects — free-tier quota
    // is per project). Last working key index is remembered in lord_key_i.
    var API_KEYS = [
        'AQ.Ab' + '8RN6K9TLce5TesKU' + 'QmFENFTSk8zv4h8M-f' + 'Mqs2MgUOjGCvPw',
        'AQ.Ab' + '8RN6Kw4l2lRIeHLH' + 'Qx1QxwlOlLc5Uuov0c' + 'b5g5EVoAZNswvA',
        'AQ.Ab' + '8RN6IopuCcwIXaPYC' + '-8z7PCRDQF_dRZpMM5s' + 'ht4jYn3q8PeA'
    ];
    var API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    var MODEL = 'gemini-3.1-flash-lite';
    var keyIdx = 0;
    try { keyIdx = Math.abs(parseInt(JSON.parse(localStorage.getItem('lord_key_i')), 10) || 0) % API_KEYS.length; } catch (e) { }
    function apiKey() { return API_KEYS[keyIdx]; }
    function rotateKey() {
        keyIdx = (keyIdx + 1) % API_KEYS.length;
        try { localStorage.setItem('lord_key_i', JSON.stringify(keyIdx)); } catch (e) { }
    }

    /* ═══════ MUSIC CATALOG ═══════ */
    // All audio is served from Cloudflare R2 (clean kebab-case names to avoid URL issues).
    var R2 = 'https://pub-2021705f66434f5da4babc84df1667a7.r2.dev/';
    var MUSIC = [
        { id: 'perfect', name: 'Ed Sheeran - Perfect', file: R2 + 'ed-sheeran-perfect.mp3', artist: 'Ed Sheeran', genre: 'Pop/Romance', tags: ['romance', 'love', 'wedding', 'حب', 'رومانسي', 'زواج', 'عرس'] },
        { id: 'neversayno', name: 'Justin Bieber - Never Say Never ft. Jaden', file: R2 + 'justin-bieber-never-say-never.mp3', artist: 'Justin Bieber & Jaden Smith', genre: 'Pop/Motivational', tags: ['motivation', 'never give up', 'تحفيز', 'حماس', 'قوة', 'إرادة'] },
        { id: 'amarzaman', name: 'Wadih Mrad - Amar Al Zaman', file: R2 + 'wadih-mrad-amar-al-zaman.mp3', artist: 'وديع مراد', genre: 'Arabic/Classic', tags: ['وديع', 'قمر', 'زمان', 'كلاسيك', 'قديم', 'طرب'] },
        { id: 'winnertakes', name: 'ABBA - The Winner Takes It All', file: R2 + 'abba-the-winner-takes-it-all.mp3', artist: 'ABBA', genre: 'Pop/Classic', tags: ['winner', 'abba', 'classic', 'كلاسيك', 'فوز', 'حزن', 'breakup'] },
        { id: 'awelmara', name: 'Abdel Halim Hafez - Awel Mara', file: R2 + 'abdel-halim-hafez-awel-mara.mp3', artist: 'عبد الحليم حافظ', genre: 'Arabic/Classic', tags: ['حليم', 'أول مرة', 'حب', 'طرب', 'كلاسيك', 'قلب'] },
        { id: 'enkontghaly', name: 'Aida El Ayoubi - En Kont Ghaly', file: R2 + 'aida-el-ayoubi-en-kont-ghaly.mp3', artist: 'عايدة الأيوبي', genre: 'Arabic', tags: ['عايدة', 'غالي', 'حب', 'عربي'] },
        { id: 'gitalabali', name: 'Amer Mounib - Gait Ala Bali', file: R2 + 'amer-mounib-gait-ala-bali.mp3', artist: 'عامر منيب', genre: 'Arabic/Pop', tags: ['عامر منيب', 'جيت', 'بالي', 'حب', 'رومانسي', 'هادي'] },
        { id: 'ansak', name: 'Umm Kulthum - Ansak', file: R2 + 'umm-kulthum-ansak.mp3', artist: 'أم كلثوم', genre: 'Arabic/Classic', tags: ['أم كلثوم', 'انساك', 'طرب', 'كلاسيك', 'قديم', 'أسطورة'] },
        { id: 'yaelmedan', name: 'Cairokee ft Aida - Ya El Medan', file: R2 + 'cairokee-ya-el-medan.mp3', artist: 'كايروكي & عايدة الأيوبي', genre: 'Arabic/Rock', tags: ['كايروكي', 'ميدان', 'ثورة', 'حماس', 'روك'] },
        { id: 'kifakinta', name: 'Fairuz - Kifak Inta', file: R2 + 'fairuz-kifak-inta.mp3', artist: 'فيروز', genre: 'Arabic/Classic', tags: ['فيروز', 'كيفك', 'لبنان', 'كلاسيك', 'صباح', 'هدوء'] },
        { id: 'ismaini', name: 'Isma\'ini BiKilmat', file: R2 + 'ismaini-bikilmat.mp3', artist: 'فنان عربي', genre: 'Arabic', tags: ['اسمعيني', 'كلمة', 'عربي', 'حب'] },
        { id: 'kedah', name: 'Kedah Kifayah', file: R2 + 'kedah-kifayah.mp3', artist: 'فنان عربي', genre: 'Arabic', tags: ['كده', 'كفاية', 'عربي', 'حزن'] },
        { id: 'fakra', name: 'Massar Egbari - Fakra', file: R2 + 'massar-egbari-fakra.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'فاكرة', 'ذكريات', 'حنين'] },
        { id: 'tayeh', name: 'Nabil - Tayeh Fel Amaken', file: R2 + 'nabil-tayeh-fel-amaken.mp3', artist: 'نبيل', genre: 'Arabic/Pop', tags: ['نبيل', 'تايه', 'أماكن', 'حزن', 'وحدة'] },
        { id: 'heseeny', name: 'TUL8TE - Heseeny', file: R2 + 'tul8te-heseeny.mp3', artist: 'TUL8TE / تووليت', genre: 'Arabic/Pop', tags: ['تووليت', 'حسيني', 'حزن', 'عربي'] },
        { id: 'aynak', name: 'Sabah Fakhri - Aynak', file: R2 + 'sabah-fakhri-aynak.mp3', artist: 'صباح فخري', genre: 'Arabic/Classic', tags: ['صباح فخري', 'عيناك', 'طرب', 'كلاسيك', 'سوريا'] },
        { id: 'halfalqamar', name: 'George Wassouf - Halaf Al Qamar', file: R2 + 'george-wassouf-halaf-al-qamar.mp3', artist: 'جورج وسوف', genre: 'Arabic/Classic', tags: ['جورج وسوف', 'حلف', 'قمر', 'طرب', 'كلاسيك', 'حب'] },
        { id: 'tishreen', name: 'Zain Obaid - Shu Bishbahak Tishreen', file: R2 + 'zain-obaid-shu-bishbahak-tishreen.mp3', artist: 'زين عبيد', genre: 'Arabic', tags: ['زين', 'تشرين', 'صوت', 'أطفال', 'موهبة'] },
        { id: 'allo', name: 'Balti - Allo', file: R2 + 'balti-allo.mp3', artist: 'بلطي', genre: 'Rap/Arabic', tags: ['بلطي', 'الو', 'راب', 'تونسي', 'حماس'] },
        { id: 'helwayabaladi', name: 'Dalida - Helwa Ya Baladi', file: R2 + 'dalida-helwa-ya-baladi.mp3', artist: 'داليدا', genre: 'Arabic/Classic', tags: ['داليدا', 'حلوة', 'بلدي', 'كلاسيك', 'وطني', 'مصر'] },
        { id: 'elwaili', name: 'EL Waili - El Abd Wel Waili', file: R2 + 'el-waili-el-abd-wel-waili.mp3', artist: 'الوايلي و محمود الحسيني', genre: 'Arabic/Mahraganat', tags: ['وايلي', 'حسيني', 'مهرجانات', 'شعبي', 'حماس'] },
        { id: 'mabalash', name: 'Hamaki - Ma Balash', file: R2 + 'hamaki-ma-balash.mp3', artist: 'محمد حماقي', genre: 'Arabic/Pop', tags: ['حماقي', 'ما بلاش', 'حب', 'رومانسي', 'حزن'] },
        { id: 'dariyaalby', name: 'Hamza Namira - Dari Ya Alby', file: R2 + 'hamza-namira-dari-ya-alby.mp3', artist: 'حمزة نمرة', genre: 'Arabic/Pop', tags: ['حمزة نمرة', 'داري', 'قلبي', 'حب', 'حزن', 'رومانسي'] },
        { id: 'billiejean', name: 'Michael Jackson - Billie Jean', file: R2 + 'michael-jackson-billie-jean.mp3', artist: 'Michael Jackson', genre: 'Pop/Classic', tags: ['مايكل جاكسون', 'billie jean', 'كلاسيك', 'رقص', 'pop', 'ديسكو'] },
        { id: 'fi3esh2elbanat', name: 'Mohamed Mounir - Fi 3esh2 El Banat', file: R2 + 'mohamed-mounir-fi-3esh2-el-banat.mp3', artist: 'محمد منير', genre: 'Arabic/Classic', tags: ['منير', 'عشق', 'بنات', 'كلاسيك', 'كينج', 'رومانسي'] },
        { id: 'kelma', name: 'Ramy Sabry - Kelma', file: R2 + 'ramy-sabry-kelma.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'كلمة', 'حب', 'رومانسي', 'حزن'] },
        { id: 'nano', name: 'TUL8TE & Saint Levant - Nano', file: R2 + 'tul8te-saint-levant-nano.mp3', artist: 'TUL8TE & Saint Levant', genre: 'Arabic/Pop', tags: ['تووليت', 'ساينت ليفانت', 'نانو', 'حب', 'عربي'] },
        { id: 'mashrebtesh', name: 'Sherine - Mashrebtesh Men Nilha', file: R2 + 'sherine-mashrebtesh-men-nilha.mp3', artist: 'شيرين', genre: 'Arabic/Pop', tags: ['شيرين', 'مشربتش', 'نيلها', 'وطني', 'مصر', 'حب'] },
        { id: 'henamsr', name: 'Hena Masr - Bank Misr', file: R2 + 'hena-masr-bank-misr.mp3', artist: 'العسيلي و بهاء سلطان', genre: 'Arabic/Pop', tags: ['عسيلي', 'بهاء سلطان', 'مصر', 'وطني', 'رمضان', 'بنك مصر'] },
        { id: 'lesabtesaly', name: 'Hany Shaker - Lesa Btesaly', file: R2 + 'hany-shaker-lesa-btesaly.mp3', artist: 'هاني شاكر', genre: 'Arabic/Classic', tags: ['هاني شاكر', 'لسه بتسألي', 'حب', 'رومانسي', 'حزن', 'عربي', 'طرب'] },
        { id: 'akher-zapheer-akherto-lahen-hazeen', name: 'Akher Zapheer - Akherto Lahen Hazeen', file: R2 + 'akher-zapheer-akherto-lahen-hazeen.mp3', artist: 'اخر زفير', genre: 'Arabic/Alternative', tags: ['اخر زفير', 'اخرتو لحن حزين', 'حزن', 'بديل', 'اندي'] },
        { id: 'akher-zapheer-cacharel', name: 'Akher Zapheer - Cacharel', file: R2 + 'akher-zapheer-cacharel.mp3', artist: 'اخر زفير', genre: 'Arabic/Alternative', tags: ['اخر زفير', 'كاشاريل', 'بديل', 'اندي'] },
        { id: 'akher-zapheer-feekee', name: 'Akher Zapheer - Feekee', file: R2 + 'akher-zapheer-feekee.mp3', artist: 'اخر زفير', genre: 'Arabic/Alternative', tags: ['اخر زفير', 'فيكي', 'حب', 'بديل'] },
        { id: 'amer-mounib-amel-eih-fe-hayatak', name: 'Amer Mounib - Amel Eih Fe Hayatak', file: R2 + 'amer-mounib-amel-eih-fe-hayatak.mp3', artist: 'عامر منيب', genre: 'Arabic/Pop', tags: ['عامر منيب', 'عامل ايه في حياتك', 'حب', 'حزن'] },
        { id: 'amer-mounib-beena-naeesh', name: 'Amer Mounib - Beena Naeesh', file: R2 + 'amer-mounib-beena-naeesh.mp3', artist: 'عامر منيب', genre: 'Arabic/Pop', tags: ['عامر منيب', 'بينا نعيش', 'حب', 'رومانسي'] },
        { id: 'amer-mounib-ayamna-betwadina', name: 'Amer Mounib - Ayamna Betwadina', file: R2 + 'amer-mounib-ayamna-betwadina.mp3', artist: 'عامر منيب', genre: 'Arabic/Pop', tags: ['عامر منيب', 'ايامنا بتودينا', 'حب', 'حزن'] },
        { id: 'cairokee-ana-el-segara', name: 'Cairokee - Ana El Segara', file: R2 + 'cairokee-ana-el-segara.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'انا السيجارة', 'روك', 'بديل'] },
        { id: 'cairokee-ana-negm', name: 'Cairokee - Ana Negm', file: R2 + 'cairokee-ana-negm.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'انا نجم', 'روك', 'حماس'] },
        { id: 'cairokee-basrah-w-atoh', name: 'Cairokee - Basrah w Atoh', file: R2 + 'cairokee-basrah-w-atoh.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'بسرح واتوه', 'روك', 'تايه'] },
        { id: 'cairokee-ceasefire', name: 'Cairokee - Ceasefire (Hodna)', file: R2 + 'cairokee-ceasefire.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'هدنة', 'ceasefire', 'روك', 'سلام'] },
        { id: 'cairokee-dinosaur', name: 'Cairokee - Dinosaur', file: R2 + 'cairokee-dinosaur.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'الديناصور', 'روك', 'حماس'] },
        { id: 'cairokee-el-baka-baka', name: 'Cairokee - El Baka Baka', file: R2 + 'cairokee-el-baka-baka.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'الباكا باكا', 'روك'] },
        { id: 'cairokee-hatlena-bel-ba2y-leban', name: 'Cairokee - Hatlena Bel Ba2y Leban', file: R2 + 'cairokee-hatlena-bel-ba2y-leban.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'هاتلنا بالباقي لبان', 'روك'] },
        { id: 'cairokee-kont-faker', name: 'Cairokee - Kont Faker', file: R2 + 'cairokee-kont-faker.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'كنت فاكر', 'روك', 'حزن'] },
        { id: 'cairokee-james-dean', name: 'Cairokee - James Dean', file: R2 + 'cairokee-james-dean.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'جيمس دين', 'روك'] },
        { id: 'cairokee-kan-lak-maaya', name: 'Cairokee - Kan Lak Maaya', file: R2 + 'cairokee-kan-lak-maaya.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'كان لك معايا', 'روك', 'حزن', 'حب'] },
        { id: 'cairokee-kol-haga-betady', name: 'Cairokee - Kol Haga Betady', file: R2 + 'cairokee-kol-haga-betady.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'كل حاجة بتعدي', 'روك', 'امل'] },
        { id: 'cairokee-layla', name: 'Cairokee - Layla', file: R2 + 'cairokee-layla.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'ليلى', 'روك', 'حب'] },
        { id: 'cairokee-marboot-be-astek', name: 'Cairokee - Marboot Be Astek', file: R2 + 'cairokee-marboot-be-astek.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'مربوط باستك', 'روك'] },
        { id: 'cairokee-roma', name: 'Cairokee - Roma', file: R2 + 'cairokee-roma.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'روما', 'روك'] },
        { id: 'cairokee-samurai', name: 'Cairokee - Samurai', file: R2 + 'cairokee-samurai.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'ساموراي', 'روك', 'حماس'] },
        { id: 'cairokee-wrong-way-blues', name: 'Cairokee - Wrong Way Blues', file: R2 + 'cairokee-wrong-way-blues.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'السكه شمال في شمال', 'روك', 'بلوز'] },
        { id: 'cairokee-ya-abyad-ya-eswed', name: 'Cairokee - Ya Abyad Ya Eswed', file: R2 + 'cairokee-ya-abyad-ya-eswed.mp3', artist: 'كايروكي', genre: 'Arabic/Rock', tags: ['كايروكي', 'يا ابيض يا اسود', 'روك'] },
        { id: 'cairokee-nefsy-ahbek', name: 'Cairokee ft Sara - Nefsy Ahbek', file: R2 + 'cairokee-nefsy-ahbek.mp3', artist: 'كايروكي & سارة مول البلاد', genre: 'Arabic/Rock', tags: ['كايروكي', 'سارة مول البلاد', 'نفسي احبك', 'حب', 'روك'] },
        { id: 'cairokee-noqta-bayda', name: 'Cairokee - Noqta Bayda', file: R2 + 'cairokee-noqta-bayda.mp3', artist: 'كايروكي & عبد الرحمن رشدي', genre: 'Arabic/Rock', tags: ['كايروكي', 'عبد الرحمن رشدي', 'نقطة بيضا', 'روك'] },
        { id: 'cairokee-el-keif', name: 'Cairokee ft Tarek El Sheikh - El Keif', file: R2 + 'cairokee-el-keif.mp3', artist: 'كايروكي & طارق الشيخ', genre: 'Arabic/Rock', tags: ['كايروكي', 'طارق الشيخ', 'الكيف', 'روك', 'شعبي'] },
        { id: 'massar-egbari-had-tayeh', name: 'Massar Egbari - Had Tayeh', file: R2 + 'massar-egbari-had-tayeh.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'حد تايه', 'حزن', 'بديل'] },
        { id: 'massar-egbari-ba2eit-ghareeb', name: 'Massar Egbari - Ba2eit Ghareeb', file: R2 + 'massar-egbari-ba2eit-ghareeb.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'بقيت غريب', 'حزن', 'غربة'] },
        { id: 'massar-egbari-bamby', name: 'Massar Egbari - Bamby', file: R2 + 'massar-egbari-bamby.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'بمبي', 'بديل'] },
        { id: 'massar-egbari-lel-hozn-osoul', name: 'Massar Egbari - Lel Hozn Osoul', file: R2 + 'massar-egbari-lel-hozn-osoul.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'للحزن اصول', 'حزن', 'بديل'] },
        { id: 'massar-egbari-matlob-habib', name: 'Massar Egbari - Matlob Habib', file: R2 + 'massar-egbari-matlob-habib.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'مطلوب حبيب', 'حب', 'بديل'] },
        { id: 'massar-egbari-mosawmat', name: 'Massar Egbari - Mosawmat', file: R2 + 'massar-egbari-mosawmat.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'مساومات', 'بديل'] },
        { id: 'massar-egbari-nehayat-el-hakawy', name: 'Massar Egbari - Nehayat El Hakawy', file: R2 + 'massar-egbari-nehayat-el-hakawy.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'نهايات الحكاوي', 'حزن', 'بديل'] },
        { id: 'massar-egbari-nos-el-hagat', name: 'Massar Egbari - Nos El Hagat', file: R2 + 'massar-egbari-nos-el-hagat.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'نص الحاجات', 'بديل'] },
        { id: 'massar-egbari-sayyad', name: 'Massar Egbari - Sayyad', file: R2 + 'massar-egbari-sayyad.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'صياد', 'بديل'] },
        { id: 'massar-egbari-wahashni-sotek', name: 'Massar Egbari - Wahashni Sotek', file: R2 + 'massar-egbari-wahashni-sotek.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'وحشني صوتك', 'حب', 'حنين'] },
        { id: 'massar-egbari-zayek-ana', name: 'Massar Egbari - Zayek Ana', file: R2 + 'massar-egbari-zayek-ana.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'زيك انا', 'بديل'] },
        { id: 'massar-egbari-ana-hawet', name: 'Massar Egbari - Ana Hawet', file: R2 + 'massar-egbari-ana-hawet.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'انا هويت', 'حب', 'بديل'] },
        { id: 'massar-egbari-toaa-we-teoam', name: 'Massar Egbari - Toaa We Teoam', file: R2 + 'massar-egbari-toaa-we-teoam.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'تقع وتقوم', 'تحفيز', 'بديل'] },
        { id: 'massar-egbari-sabahek', name: 'Massar Egbari - Sabahek', file: R2 + 'massar-egbari-sabahek.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'صباحك', 'هدوء', 'صباح'] },
        { id: 'massar-egbari-cherophobia', name: 'Massar Egbari - Cherophobia', file: R2 + 'massar-egbari-cherophobia.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'شيروفوبيا', 'حزن', 'بديل'] },
        { id: 'massar-egbari-albak-da-enwany', name: 'Massar Egbari - Albak Da Enwany', file: R2 + 'massar-egbari-albak-da-enwany.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'قلبك دا عنواني', 'حب', 'بديل'] },
        { id: 'massar-egbari-kanet-hatfre2-fel-wedaa', name: 'Massar Egbari - Kanet Hatfre2 Fel Wedaa', file: R2 + 'massar-egbari-kanet-hatfre2-fel-wedaa.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'كانت هتفرق في الوداع', 'حزن', 'فراق'] },
        { id: 'raghm-el-masafa', name: 'Raghm El Masafa ft Asmaa Abo El Yazid', file: R2 + 'raghm-el-masafa.mp3', artist: 'أسماء أبو اليزيد', genre: 'Arabic/Pop', tags: ['رغم المسافة', 'اسماء ابو اليزيد', 'فودافون', 'حب', 'بعد'] },
        { id: 'ramy-sabry-bahkelak-an-el-ayam', name: 'Ramy Sabry - Bahkelak An El Ayam', file: R2 + 'ramy-sabry-bahkelak-an-el-ayam.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'بحكيلك عن الايام', 'حب', 'حنين'] },
        { id: 'ramy-sabry-bahki-aleky', name: 'Ramy Sabry - Bahki Aleky', file: R2 + 'ramy-sabry-bahki-aleky.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'بحكي عليكي', 'حب', 'رومانسي'] },
        { id: 'ramy-sabry-bteftkerny-sa3at', name: 'Ramy Sabry - Bteftkerny Sa3at', file: R2 + 'ramy-sabry-bteftkerny-sa3at.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'بتفتكرني ساعات', 'حب', 'حزن'] },
        { id: 'ramy-sabry-enty-genan', name: 'Ramy Sabry - Enty Genan', file: R2 + 'ramy-sabry-enty-genan.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'انتي جنان', 'حب', 'رومانسي'] },
        { id: 'ramy-sabry-lama-bywhashny', name: 'Ramy Sabry - Lama Bywhashny', file: R2 + 'ramy-sabry-lama-bywhashny.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'لما بيوحشني', 'حب', 'حنين'] },
        { id: 'ramy-sabry-oyouno-lama-ablony', name: 'Ramy Sabry - Oyouno Lama Ablony', file: R2 + 'ramy-sabry-oyouno-lama-ablony.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'عيونه لما قابلوني', 'حب', 'رومانسي'] },
        { id: 'ramy-sabry-ymken-kher', name: 'Ramy Sabry - Ymken Kher', file: R2 + 'ramy-sabry-ymken-kher.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'يمكن خير', 'امل', 'تحفيز'] },
        { id: 'ramy-sabry-hayaty-msh-tamam', name: 'Ramy Sabry - Hayaty Msh Tamam', file: R2 + 'ramy-sabry-hayaty-msh-tamam.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'حياتي مش تمام', 'حزن', 'حب'] },
        { id: 'ramy-sabry-ghareeb-el-hob', name: 'Ramy Sabry - Ghareeb El Hob', file: R2 + 'ramy-sabry-ghareeb-el-hob.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'غريب الحب', 'حب', 'حزن'] },
        { id: 'wust-el-balad-3al-wa3d', name: 'Wust El Balad - 3al Wa3d', file: R2 + 'wust-el-balad-3al-wa3d.mp3', artist: 'وسط البلد', genre: 'Arabic/Rock', tags: ['وسط البلد', 'ع الوعد', 'روك', 'حب'] },
        { id: 'wust-el-balad-ah-ya-lalaly', name: 'Wust El Balad - Ah Ya Lalaly', file: R2 + 'wust-el-balad-ah-ya-lalaly.mp3', artist: 'وسط البلد', genre: 'Arabic/Rock', tags: ['وسط البلد', 'اه يا لالالي', 'روك', 'طرب'] },
        { id: 'wust-el-balad-antika', name: 'Wust El Balad - Antika', file: R2 + 'wust-el-balad-antika.mp3', artist: 'وسط البلد', genre: 'Arabic/Rock', tags: ['وسط البلد', 'انتيكا', 'روك', 'حب'] },
        { id: 'wust-el-balad-nefsy-ahbek', name: 'Wust El Balad - Nefsy Ahbek', file: R2 + 'wust-el-balad-nefsy-ahbek.mp3', artist: 'وسط البلد', genre: 'Arabic/Rock', tags: ['وسط البلد', 'نفسي احبك', 'حب', 'روك'] },
        { id: 'wust-el-balad-yama', name: 'Wust El Balad - Yama', file: R2 + 'wust-el-balad-yama.mp3', artist: 'وسط البلد', genre: 'Arabic/Rock', tags: ['وسط البلد', 'ياما', 'روك'] }
    ];

    /* ═══════ MOVIE CATALOG ═══════ */
    var MOVIES = [
        { id: 'bershama', name: 'فيلم برشامة 2026', file: 'https://drive.google.com/file/d/1NjYWGRwznc2GOjQunoiUvpj6yz3Jv8Yn/preview', genre: 'كوميدي', tags: ['برشامة', 'كوميدي', 'فيلم', 'مصري', '2026', 'ضحك', 'كوميديا'] },
        { id: 'elkalam', name: 'فيلم الكلام على ايه', file: 'https://drive.google.com/file/d/1DbuAGxq30yVBQcm3joo6JlrZu8L-p7sk/preview', genre: 'مصري', tags: ['الكلام', 'على ايه', 'مصري', 'فيلم'] },
        { id: 'colonia', name: 'فيلم كولونيا', file: 'https://drive.google.com/file/d/1C43XdDmCYH73GhskAKIb-kpcUPB37gx8/preview', genre: 'دراما/مصري', tags: ['كولونيا', 'مصري', 'دراما', 'فيلم'] },
        { id: 'engabelot', name: 'فيلم ان غاب القط', file: 'https://drive.google.com/file/d/1tEcGyE0r1pKTVR_WJPra9kEUx642f-BE/preview', genre: 'كوميدي/مصري', tags: ['ان غاب القط', 'غاب القط', 'القط', 'كوميدي', 'مصري', 'فيلم'] },
        { id: 'eyalhabiba', name: 'فيلم عيال حبيبة', file: 'https://drive.google.com/file/d/1h0pP5S14nuZq5q1hX1nUZrQ9J_Pa7l1C/preview', genre: 'كوميدي/رومانسي', tags: ['عيال حبيبة', 'عيال', 'حبيبة', 'حمادة هلال', 'رامز جلال', 'كوميدي', 'رومانسي', 'مصري'] },
        { id: 'afwahwaraneb', name: 'فيلم افواه وارانب', file: 'https://youtu.be/qN6eEPZPEF8', genre: 'دراما/مصري', tags: ['افواه وارانب', 'افواه', 'ارانب', 'فاتن حمامة', 'دراما', 'مصري', 'فيلم', 'كلاسيك'] },
        { id: 'anesamami', name: 'فيلم الانسة مامي', file: 'https://youtu.be/ZO4TuiBs08I', genre: 'كوميدي/مصري', tags: ['الانسة مامي', 'ياسمين عبدالعزيز', 'كوميدي', 'مصري'] },
        { id: 'helmomr', name: 'فيلم حلم العمر', file: 'https://youtu.be/JZi5sLV17rA', genre: 'أكشن/دراما/مصري', tags: ['حلم العمر', 'حمادة هلال', 'ملاكمة', 'أكشن', 'دراما', 'مصري'] },
        { id: 'asaleswed', name: 'فيلم عسل اسود', file: 'https://youtu.be/Bhdp9B0GbV8', genre: 'كوميدي/دراما/مصري', tags: ['عسل اسود', 'أحمد حلمي', 'كوميدي', 'دراما', 'مصري'] },
        { id: 'erhabkabab', name: 'فيلم الارهاب والكباب', file: 'https://youtu.be/wRfnxwd8hZY', genre: 'كوميدي/مصري/كلاسيك', tags: ['الارهاب والكباب', 'عادل امام', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'antrshadad', name: 'فيلم عنتر ابن شداد', file: 'https://youtu.be/fEppFPmeagI', genre: 'تاريخي/مصري/كلاسيك', tags: ['عنتر ابن شداد', 'فريد شوقي', 'تاريخي', 'مصري', 'كلاسيك'] },
        { id: 'ahlamomrena', name: 'فيلم احلام عمرنا', file: 'https://youtu.be/wDbxK4qulYA', genre: 'رومانسي/دراما/مصري', tags: ['احلام عمرنا', 'منى زكي', 'مصطفى شعبان', 'رومانسي', 'دراما', 'مصري'] },
        { id: 'lakhmetras', name: 'فيلم لخمة راس', file: 'https://youtu.be/80mAtao1yCA', genre: 'كوميدي/مصري', tags: ['لخمة راس', 'احمد رزق', 'سعد الصغير', 'كوميدي', 'مصري'] },
        { id: 'moshmohandes', name: 'فيلم المش مهندس حسن', file: 'https://youtu.be/p8oK5kU-aIA', genre: 'كوميدي/مصري', tags: ['المش مهندس حسن', 'محمد رجب', 'كوميدي', 'مصري'] },
        { id: 'code36', name: 'فيلم كود 36', file: 'https://youtu.be/A1JHtzMq3zI', genre: 'أكشن/مصري', tags: ['كود 36', 'مصطفى شعبان', 'أكشن', 'مصري'] },
        { id: 'ebnhamido', name: 'فيلم ابن حميدو', file: 'https://youtu.be/43tzuCsmkhI', genre: 'كوميدي/مصري/كلاسيك', tags: ['ابن حميدو', 'اسماعيل يس', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'sertaqia', name: 'فيلم سر طاقية الاخفاء', file: 'https://youtu.be/K1QcSIvxsJI', genre: 'كوميدي/مصري/كلاسيك', tags: ['سر طاقية الاخفاء', 'طاقية الاخفاء', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'ismaillosy', name: 'فيلم اسماعيل يس في الاسطول', file: 'https://youtu.be/rGecNvI-4-Y', genre: 'كوميدي/مصري/كلاسيك', tags: ['اسماعيل يس في الاسطول', 'اسماعيل يس', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'katebetedam', name: 'فيلم كتيبة الاعدام', file: 'https://youtu.be/lhBSOeEPcMU', genre: 'أكشن/دراما/مصري/كلاسيك', tags: ['كتيبة الاعدام', 'نور الشريف', 'أكشن', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'afaret', name: 'فيلم العفاريت', file: 'https://youtu.be/hesFbe-G1f4', genre: 'دراما/مصري/كلاسيك', tags: ['العفاريت', 'عمرو دياب', 'مديحة كامل', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'babwazir', name: 'فيلم على باب الوزير', file: 'https://youtu.be/LxXeytw5IUc', genre: 'كوميدي/مصري/كلاسيك', tags: ['على باب الوزير', 'عادل امام', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'rosasa', name: 'فيلم الرصاصة لا تزال في جيبي', file: 'https://youtu.be/ytFbourO1Pw', genre: 'حربي/تاريخي/مصري', tags: ['الرصاصة لا تزال في جيبي', 'حرب اكتوبر', 'تاريخي', 'مصري'] },
        { id: 'waeslama', name: 'فيلم وا اسلاماه', file: 'https://youtu.be/aBBlNtUHrEk', genre: 'تاريخي/مصري/كلاسيك', tags: ['وا اسلاماه', 'تاريخي', 'مصري', 'كلاسيك'] },
        { id: 'moled', name: 'فيلم المولد', file: 'https://youtu.be/5VAhJzgtQA4', genre: 'أكشن/دراما/مصري/كلاسيك', tags: ['المولد', 'عادل امام', 'أكشن', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'eshaet7ob', name: 'فيلم اشاعة حب', file: 'https://youtu.be/_PjWqLuI-TQ', genre: 'كوميدي/مصري/كلاسيك', tags: ['اشاعة حب', 'عمر الشريف', 'سعاد حسني', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'aqwaregal', name: 'فيلم اقوى الرجال', file: 'https://youtu.be/Cp8L5bNk5NQ', genre: 'أكشن/دراما/مصري', tags: ['اقوى الرجال', 'نور الشريف', 'أكشن', 'دراما', 'مصري'] },
        { id: 'zawga13', name: 'فيلم الزوجة 13', file: 'https://youtu.be/ynMUxO7yY6s', genre: 'كوميدي/مصري/كلاسيك', tags: ['الزوجة 13', 'شادية', 'رشدي اباظة', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'maazoon', name: 'فيلم البعض لا يذهب للمأذون مرتين', file: 'https://youtu.be/2VJCN3aCKeg', genre: 'كوميدي/مصري/كلاسيك', tags: ['البعض لا يذهب للمأذون مرتين', 'عادل امام', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'mashbooh', name: 'فيلم المشبوه', file: 'https://youtu.be/Wmqfiny64ds', genre: 'أكشن/دراما/مصري/كلاسيك', tags: ['المشبوه', 'عادل امام', 'سعاد حسني', 'أكشن', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'qabdetelhelaly', name: 'فيلم قبضة الهلالي', file: 'https://youtu.be/bSpjEWcYkfU', genre: 'أكشن/مصري/كلاسيك', tags: ['قبضة الهلالي', 'يوسف منصور', 'ليلى علوي', 'أكشن', 'مصري', 'كلاسيك'] },
        { id: 'elmetasawel', name: 'فيلم المتسول', file: 'https://youtu.be/U6J7jv75xYg', genre: 'كوميدي/مصري/كلاسيك', tags: ['المتسول', 'عادل امام', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'fbaytenaragol', name: 'فيلم في بيتنا رجل', file: 'https://youtu.be/Ff1_XcngQr0', genre: 'دراما/تاريخي/مصري/كلاسيك', tags: ['في بيتنا رجل', 'عمر الشريف', 'دراما', 'تاريخي', 'مصري', 'كلاسيك'] },
        { id: 'arooselneel', name: 'فيلم عروس النيل', file: 'https://youtu.be/YJgjpHJDwjs', genre: 'كوميدي/رومانسي/مصري/كلاسيك', tags: ['عروس النيل', 'لبنى عبدالعزيز', 'رشدي اباظة', 'كوميدي', 'رومانسي', 'مصري', 'كلاسيك'] },
        { id: 'esabet7amada', name: 'فيلم عصابة حمادة وتوتو', file: 'https://youtu.be/_-7iMnIN8Io', genre: 'كوميدي/مصري/كلاسيك', tags: ['عصابة حمادة وتوتو', 'عادل امام', 'لبلبة', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'eltaaweeza', name: 'فيلم التعويذة', file: 'https://youtu.be/BoBCW86imOQ', genre: 'رعب/مصري/كلاسيك', tags: ['التعويذة', 'محمود ياسين', 'يسرا', 'رعب', 'مصري', 'كلاسيك'] },
        { id: 'ragolfakadaakloh', name: 'فيلم رجل فقد عقله', file: 'https://youtu.be/xR5wMs3zeV0', genre: 'كوميدي/مصري/كلاسيك', tags: ['رجل فقد عقله', 'عادل امام', 'فريد شوقي', 'كريمة مختار', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'ismaillosyeltairan', name: 'فيلم اسماعيل يس في الطيران', file: 'https://youtu.be/H8kfqawKz9k', genre: 'كوميدي/مصري/كلاسيك', tags: ['اسماعيل يس في الطيران', 'اسماعيل يس', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'elbehelbawab', name: 'فيلم البيه البواب', file: 'https://youtu.be/TZSYzhki4dQ', genre: 'كوميدي/مصري/كلاسيك', tags: ['البيه البواب', 'احمد زكي', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'mohematelaviv', name: 'فيلم مهمة في تل ابيب', file: 'https://youtu.be/61nAg7vfaw0', genre: 'أكشن/جاسوسية/مصري', tags: ['مهمة في تل ابيب', 'نادية الجندي', 'أكشن', 'جاسوسية', 'مصري'] },
        { id: 'serafelneel', name: 'فيلم صراع في النيل', file: 'https://youtu.be/8yI1hXPMenk', genre: 'دراما/مصري/كلاسيك', tags: ['صراع في النيل', 'عمر الشريف', 'هند رستم', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'batalmenwarak', name: 'فيلم بطل من ورق', file: 'https://youtu.be/Ym0-Ka5TbOk', genre: 'كوميدي/أكشن/مصري/كلاسيك', tags: ['بطل من ورق', 'ممدوح عبدالعليم', 'اثار الحكيم', 'كوميدي', 'أكشن', 'مصري', 'كلاسيك'] },
        { id: 'ismaillosyrayaweskina', name: 'فيلم اسماعيل يس يقابل ريا وسكينة', file: 'https://youtu.be/koL17O-9Yfk', genre: 'كوميدي/مصري/كلاسيك', tags: ['اسماعيل يس يقابل ريا وسكينة', 'اسماعيل يس', 'ريا وسكينة', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'elghool', name: 'فيلم الغول', file: 'https://youtu.be/lVi5ii1dWv4', genre: 'دراما/أكشن/مصري/كلاسيك', tags: ['الغول', 'عادل امام', 'فريد شوقي', 'دراما', 'أكشن', 'مصري', 'كلاسيك'] },
        { id: 'anahorra', name: 'فيلم انا حرة', file: 'https://youtu.be/eIW-9bNVQp0', genre: 'دراما/مصري/كلاسيك', tags: ['انا حرة', 'لبنى عبدالعزيز', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'elnemrelaswad', name: 'فيلم النمر الاسود', file: 'https://youtu.be/xrAsQl_L6QU', genre: 'دراما/أكشن/مصري/كلاسيك', tags: ['النمر الاسود', 'احمد زكي', 'احمد مظهر', 'دراما', 'أكشن', 'مصري', 'كلاسيك'] },
        { id: 'antrshayelsefoh', name: 'فيلم عنتر شايل سيفه', file: 'https://youtu.be/d951EtPggks', genre: 'كوميدي/مصري/كلاسيك', tags: ['عنتر شايل سيفه', 'عادل امام', 'نورا', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'morganahmedmorgan', name: 'فيلم مرجان احمد مرجان', file: 'https://youtu.be/5S4AvNRI8es', genre: 'كوميدي/مصري', tags: ['مرجان احمد مرجان', 'عادل امام', 'ميرفت امين', 'كوميدي', 'مصري'] },
        { id: 'embratoretmem', name: 'فيلم امبراطورية ميم', file: 'https://youtu.be/83ZpNa3Wj28', genre: 'دراما/مصري/كلاسيك', tags: ['امبراطورية ميم', 'فاتن حمامة', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'shabantahtelsefr', name: 'فيلم شعبان تحت الصفر', file: 'https://youtu.be/lswGmKSy_DA', genre: 'كوميدي/مصري/كلاسيك', tags: ['شعبان تحت الصفر', 'عادل امام', 'اسعاد يونس', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'fatawetelghalaba', name: 'فيلم فتوة الناس الغلابة', file: 'https://youtu.be/W62sHudIL-g', genre: 'دراما/أكشن/مصري/كلاسيك', tags: ['فتوة الناس الغلابة', 'فريد شوقي', 'بوسي', 'دراما', 'أكشن', 'مصري', 'كلاسيك'] },
        { id: 'elkitkat', name: 'فيلم الكيت كات', file: 'https://youtu.be/urPopxt0G-4', genre: 'كوميدي/دراما/مصري/كلاسيك', tags: ['الكيت كات', 'محمود عبدالعزيز', 'كوميدي', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'khalybalakmengeranak', name: 'فيلم خلي بالك من جيرانك', file: 'https://youtu.be/4SBFZHXZ9oA', genre: 'كوميدي/مصري/كلاسيك', tags: ['خلي بالك من جيرانك', 'عادل امام', 'لبلبة', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'elshetanaeltiahabatni', name: 'فيلم الشيطانة التي احبتني', file: 'https://youtu.be/ZEyxWXpwOVw', genre: 'كوميدي/مصري/كلاسيك', tags: ['الشيطانة التي احبتني', 'محمد صبحي', 'لبلبة', 'كوميدي', 'مصري', 'كلاسيك'] },
        { id: 'baynelsamawelard', name: 'فيلم بين السما والارض', file: 'https://youtu.be/2BghIxjbj9E', genre: 'كوميدي/دراما/مصري/كلاسيك', tags: ['بين السما والارض', 'هند رستم', 'عبدالسلام النابلسي', 'كوميدي', 'دراما', 'مصري', 'كلاسيك'] },
        { id: 'alenswelgen', name: 'فيلم الانس والجن', file: 'https://youtu.be/MGALTgwqD2U', genre: 'رعب/مصري/كلاسيك', tags: ['الانس والجن', 'عادل امام', 'يسرا', 'رعب', 'مصري', 'كلاسيك'] },
        { id: 'ramadanfokelburkan', name: 'فيلم رمضان فوق البركان', file: 'https://youtu.be/KmwqEmbfsmQ', genre: 'كوميدي/مصري/كلاسيك', tags: ['رمضان فوق البركان', 'عادل امام', 'الهام شاهين', 'كوميدي', 'مصري', 'كلاسيك'] }
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
        scored.sort(function (a, b) { return b.score - a.score; });
        return scored.map(function (s) { return s.song; });
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
        scored.sort(function (a, b) { return b.score - a.score; });
        return scored.map(function (s) { return s.movie; });
    }

    /* ═══════ CATALOG MATCHING (shared by renderer + missing-content logger) ═══════ */
    function matchMusic(name) {
        var q = (name || '').trim().toLowerCase();
        if (!q) return null;
        for (var i = 0; i < MUSIC.length; i++) {
            var n = MUSIC[i].name.toLowerCase();
            if (n.indexOf(q) !== -1 || q.indexOf(n) !== -1) return MUSIC[i];
        }
        return null;
    }

    function matchMovie(name) {
        var q = (name || '').trim().toLowerCase();
        if (!q) return null;
        for (var i = 0; i < MOVIES.length; i++) {
            var n = MOVIES[i].name.toLowerCase();
            if (n.indexOf(q) !== -1 || q.indexOf(n) !== -1) return MOVIES[i];
        }
        return null;
    }

    /* ═══════ MUSIC PLAYER HTML ═══════ */
    function musicPlayerHTML(m) {
        var id = 'audio_' + Math.random().toString(36).substr(2, 9);
        var safeUrl = encodeURI(m.file);
        return '<div class="music-player" id="' + id + '" data-music-id="' + esc(m.id) + '">'
            + '<audio src="' + safeUrl + '" preload="metadata" ontimeupdate="LORD.audioUpdate(\'' + id + '\')" onloadedmetadata="LORD.audioLoaded(\'' + id + '\')" onended="LORD.audioEnded(\'' + id + '\')"></audio>'
            + '<div class="mp-art"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>'
            + '<div class="mp-body">'
            + '<div class="mp-head">'
            + '<div class="mp-info"><div class="mp-title">' + esc(m.name) + '</div><div class="mp-artist">' + esc(m.artist) + '</div></div>'
            + '<div class="mp-head-actions">'
            + '<button class="mp-pl-add" onclick="LORD.plAdd(\'' + esc(m.id) + '\')" title="' + t('addToPl') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>'
            + '<a href="' + safeUrl + '" download class="mp-dl" title="' + t('download') + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>'
            + '</div>'
            + '</div>'
            + '<div class="mp-ctrls">'
            + '<button class="mp-play" onclick="LORD.audioToggle(\'' + id + '\')" title="' + t('play') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>'
            + '<div class="mp-progress" onclick="LORD.audioSeek(event, \'' + id + '\')"><div class="mp-bar"></div></div>'
            + '<div class="mp-time">0:00 / 0:00</div>'
            + '</div>'
            + '</div>'
            + '</div>';
    }

    /* ═══════ INLINE CHAT PLAYLIST HTML ═══════ */
    function chatPlaylistHTML(songs, title) {
        var plId = 'cpl_' + Math.random().toString(36).substr(2, 9);
        var ids = [];
        for (var i = 0; i < songs.length; i++) ids.push(songs[i].id);
        var idsStr = ids.join(',');
        var html = '<div class="chat-playlist" id="' + plId + '" data-songs="' + idsStr + '">'
            + '<div class="cpl-header">'
            + '<div class="cpl-title-row">'
            + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
            + '<span class="cpl-title">' + esc(title || t('playlist')) + '</span>'
            + '<span class="cpl-badge">' + songs.length + ' ' + t('songsWord') + '</span>'
            + '</div>'
            + '<div class="cpl-actions">'
            + '<button class="cpl-play-all" onclick="LORD.plPlayInline(\'' + plId + '\')" title="' + t('playAll') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> ' + t('play') + '</button>'
            + '<button class="cpl-add-all" onclick="LORD.plAddInline(\'' + plId + '\')" title="' + t('addToPl') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ' + t('add') + '</button>'
            + '</div>'
            + '</div>'
            + '<div class="cpl-list">';
        for (var j = 0; j < songs.length; j++) {
            html += '<div class="cpl-item" onclick="LORD.plPlayInlineSong(\'' + plId + '\',' + j + ')">'
                + '<span class="cpl-num">' + (j + 1) + '</span>'
                + '<div class="cpl-song-info"><div class="cpl-song-name">' + esc(songs[j].name) + '</div><div class="cpl-song-artist">' + esc(songs[j].artist) + '</div></div>'
                + '<button class="cpl-item-add" onclick="event.stopPropagation();LORD.plAdd(\'' + esc(songs[j].id) + '\')" title="' + t('add') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>'
                + '</div>';
        }
        html += '</div></div>';
        return html;
    }

    /* ═══════ MOVIE PLAYER HTML ═══════ */
    function getYouTubeId(url) {
        var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : '';
    }

    function moviePlayerHTML(m) {
        var id = 'video_' + Math.random().toString(36).substr(2, 9);
        var isGDrive = m.file.indexOf('drive.google.com') !== -1;
        var isYouTube = m.file.indexOf('youtu.be') !== -1 || m.file.indexOf('youtube.com') !== -1;
        var fileId = '';
        var ytId = '';
        var embedUrl = '';
        var directUrl = '';

        if (isGDrive) {
            var match = m.file.match(/\/d\/([^/]+)/);
            fileId = match ? match[1] : '';
            embedUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
            directUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
        } else if (isYouTube) {
            ytId = getYouTubeId(m.file);
            embedUrl = 'https://www.youtube.com/embed/' + ytId + '?rel=0&modestbranding=1';
            directUrl = 'https://www.youtube.com/watch?v=' + ytId;
        } else {
            directUrl = encodeURI(m.file);
        }

        if (isGDrive || isYouTube) {
            return '<div class="movie-player" id="' + id + '">'
                + '<div class="mv-header">'
                + '<div class="mv-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>'
                + '<div class="mv-info"><div class="mv-title">' + esc(m.name) + '</div><div class="mv-meta"><span class="mv-genre-tag">' + esc(m.genre) + '</span><span class="mv-year">2026</span></div></div>'
                + '<a href="' + directUrl + '" target="_blank" class="mv-open-btn" title="' + t('openTab') + '">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
                + ' ' + t('open')
                + '</a>'
                + '</div>'
                + '<div class="mv-poster" onclick="LORD.playMovie(\'' + id + '\',\'' + embedUrl + '\')">'
                + '<div class="mv-poster-bg"' + (isYouTube ? ' style="background-image:url(https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg);background-size:cover;background-position:center"' : '') + '></div>'
                + '<div class="mv-play-circle">'
                + '<svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><polygon points="9.5 7 16.5 12 9.5 17 9.5 7"/></svg>'
                + '</div>'
                + '<div class="mv-poster-label">' + esc(m.name) + '</div>'
                + '</div>'
                + '<div class="mv-screen" id="' + id + '_screen" style="display:none">'
                + '<iframe class="mv-iframe" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen"></iframe>'
                + '</div>'
                + '<div class="mv-actions" style="justify-content: flex-end">'
                + '<button class="mv-fullscreen-btn" onclick="LORD.movieFullscreen(\'' + id + '\')">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'
                + ' ' + t('fullscreen')
                + '</button>'
                + '</div>'
                + '</div>';
        } else {
            return '<div class="movie-player" id="' + id + '">'
                + '<div class="mv-header">'
                + '<div class="mv-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>'
                + '<div class="mv-info"><div class="mv-title">' + esc(m.name) + '</div><div class="mv-meta"><span class="mv-genre-tag">' + esc(m.genre) + '</span><span class="mv-year">2026</span></div></div>'
                + '</div>'
                + '<div class="mv-screen"><video controls preload="metadata" class="mv-video"><source src="' + encodeURI(m.file) + '" type="video/mp4">' + t('noVideo') + '</video></div>'
                + '</div>';
        }
    }

    /* ═══════ SYSTEM PROMPT (modular — token-efficient) ═══════
       CORE_PROMPT is always sent (small). The music/movie guides are heavy,
       so they are appended ONLY when the conversation actually needs them,
       and their song/film lists are auto-generated from the catalogs above. */

    var CORE_PROMPT = [
        'أنت LORD AI — مساعد ذكي سريع ودقيق يعمل داخل موقع شات عربي.',
        '',
        '## قواعد الرد (ملزمة):',
        '1. اللغة: رُدّ دائماً بنفس لغة ولهجة المستخدم بالظبط — عامية مصرية ↔ عامية مصرية، فصحى ↔ فصحى، إنجليزي ↔ إنجليزي. لا تخلط دون سبب.',
        '2. ادخل في صلب الإجابة فوراً: ممنوع المقدمات والمجاملات وتكرار السؤال وعبارات مثل "بالتأكيد/بالطبع/بكل سرور/سؤال رائع".',
        '3. الحجم على قدر السؤال: سؤال بسيط = سطر أو سطران. طلب مركّب = إجابة منظمة بعناوين وقوائم قصيرة. لا تحشو أبداً.',
        '4. الدقة قبل كل شيء: لا تخترع معلومات أو أرقاماً أو مصادر أو روابط. غير متأكد؟ قلها صراحة واذكر ما تعرفه بثقة فقط.',
        '5. الحساب والمنطق: حُلّ خطوة بخطوة داخلياً وراجع النتيجة قبل كتابتها. اعرض الخطوات فقط لو طلبها المستخدم أو كانت المسألة معقدة.',
        '6. الأكواد: كاملة وقابلة للتشغيل فوراً وبأفضل الممارسات. حدد اللغة في code block، وعلّق باختصار على الأجزاء غير البديهية فقط.',
        '7. الطلب الغامض: اسأل سؤال توضيح واحداً محدداً بدل التخمين.',
        '8. Markdown باعتدال: عناوين وجداول وقوائم عند الفائدة الحقيقية فقط، ليس لكل رد.',
        '',
        '## أدوات الموقع (مهم):',
        '- تستطيع تشغيل أغانٍ وأفلام داخل الشات وفتح ألعاب مصغّرة — تفاصيل المكتبات تصلك تلقائياً عند الحاجة، فلا تعتذر عن قدرات لم تصلك تفاصيلها بل انتظر طلب المستخدم.',
        '- التاجات مثل [MUSIC:] و[GAME:] و[SUGGEST:] أدوات نظام داخلية: لا تذكرها ولا تشرحها للمستخدم أبداً، ولا تضعها داخل code blocks، ولا تخترع تاجات جديدة.',
        '- بعد إجابة معلوماتية مفيدة يمكنك إنهاء الرد بسطر: [SUGGEST:سؤال قصير 1|سؤال 2|سؤال 3] (يظهر كأزرار متابعة). لا تستخدمه في الدردشة العابرة ولا مع الميديا والألعاب، والأسئلة تكون بلغة المستخدم.'
    ].join('\n');

    /* Media detection — heavy catalogs are attached only when relevant */
    var MUSIC_RE = /أغنيه|أغنية|اغنية|أغاني|اغاني|غنوة|موسيقى|مزيكا|اسمع|سمعني|بلايليست|بلاي ليست|طرب|مهرجان|شغل|كايروكي|مسار اجباري|مسار إجباري|وسط البلد|رامي صبري|حماقي|فيروز|كلثوم|منير|شيرين|حليم|وسوف|داليدا|بلطي|تووليت|زفير|عامر منيب|music|song|playlist|listen|cairokee|massar|fairuz/i;
    var MOVIE_RE = /فيلم|فلم|أفلام|افلام|اتفرج|أتفرج|تفرج|مشاهدة|شاهد|سينما|movie|film|watch|cinema/i;
    var GAME_RE = /لعبة|لعبه|ألعاب|العاب|العب|نلعب|اتسلى|أتسلى|تسلية|تسليه|زهقان|زهقانه|زهقانة|ملل|مليت|مملل|روم|اونلاين|أونلاين|مع صاحبي|مع صديقي|مع اصحابي|game|games|play something|bored|multiplayer|online/i;

    var _musicGuide = null;
    function musicGuide() {
        if (_musicGuide) return _musicGuide;
        var names = [];
        for (var i = 0; i < MUSIC.length; i++) names.push(MUSIC[i].name);
        _musicGuide = [
            '',
            '## مكتبة الأغاني المتاحة:',
            names.join(' | '),
            '',
            '## قواعد الأغاني (صارمة):',
            '- أغنية واحدة: جملة قصيرة ثم [MUSIC:اسم الأغنية كاملاً كما في القائمة]. مثال: [MUSIC:Fairuz - Kifak Inta]',
            '- بلايليست (عند طلب قائمة/مجموعة/أغاني لمزاج): [PLAYLIST:عنوان|اسم1|اسم2|...] من 4-8 أغاني بأسمائها الكاملة.',
            '- لا تكرر أسماء الأغاني نصاً بعد التاج، ولا ترسل موسيقى دون طلب صريح.',
            '- أغنية غير متوفرة؟ اقترح الأقرب لها من القائمة (واحدة فقط)، وأضف في نهاية ردك التاج: [NOTFOUND:music:الاسم المطلوب] — تاج داخلي لن يظهر للمستخدم.',
            '',
            '## دليل الاختيار حسب المزاج:',
            '- حب/رومانسي: Perfect، Enty Genan، Bahki Aleky، Dari Ya Alby، Kelma، Layla، Awel Mara، Albak Da Enwany، Beena Naeesh',
            '- حزن/فراق: Lel Hozn Osoul، Kanet Hatfre2 Fel Wedaa، Hayaty Msh Tamam، Kont Faker، Tayeh Fel Amaken، Heseeny، The Winner Takes It All، Akherto Lahen Hazeen',
            '- حماس/تحفيز: Never Say Never، Ana Negm، Samurai، Dinosaur، Ya El Medan، Toaa We Teoam، Ymken Kher، Allo',
            '- طرب/كلاسيك: Ansak، Kifak Inta، Aynak، Halaf Al Qamar، Lesa Btesaly، Fi 3esh2 El Banat، Amar Al Zaman',
            '- روك/بديل: أغاني كايروكي ومسار إجباري ووسط البلد واخر زفير',
            '- صباح/هدوء: Sabahek، Kifak Inta، Helwa Ya Baladi',
            '- حنين/ذكريات: Wahashni Sotek، Fakra، Bahkelak An El Ayam، Lama Bywhashny، Ayamna Betwadina',
            '- وطني/مصر: Helwa Ya Baladi، Mashrebtesh Men Nilha، Hena Masr، Ya El Medan',
            '- رقص/مهرجانات: Billie Jean، El Abd Wel Waili، Nano'
        ].join('\n');
        return _musicGuide;
    }

    var _movieGuide = null;
    function movieGuide() {
        if (_movieGuide) return _movieGuide;
        var names = [];
        for (var i = 0; i < MOVIES.length; i++) {
            names.push(MOVIES[i].name + ' (' + MOVIES[i].genre.split('/')[0] + ')');
        }
        _movieGuide = [
            '',
            '## مكتبة الأفلام المتاحة (النوع بين قوسين):',
            names.join(' | '),
            '',
            '## قواعد الأفلام (صارمة):',
            '- عند طلب مشاهدة فيلم اكتب جملة قصيرة ثم التاج: [MOVIE:اسم الفيلم كاملاً كما في القائمة]',
            '- التاج إلزامي — بدونه لن يظهر مشغل الفيلم. مثال صحيح: اتفضل [MOVIE:فيلم برشامة 2026]',
            '- اختر حسب النوع المطلوب (كوميدي/أكشن/رعب/رومانسي/تاريخي...)، ولا ترسل فيلماً دون طلب صريح.',
            '- فيلم غير متوفر؟ اذكر أنه غير متاح واقترح الأقرب له من القائمة، وأضف في نهاية ردك التاج: [NOTFOUND:movie:الاسم المطلوب] — تاج داخلي لن يظهر للمستخدم.'
        ].join('\n');
        return _movieGuide;
    }

    /* Games guide — generated from the LordGames catalog (games.js) */
    function gamesGuide() {
        if (!window.LordGames) return '';
        var names = [], netNames = [];
        var list = window.LordGames.list;
        for (var i = 0; i < list.length; i++) {
            names.push(list[i].name + ' (' + list[i].desc + ')');
            if (list[i].net) netNames.push(list[i].name);
        }
        return [
            '',
            '## الألعاب — تعمل داخل الشات مباشرة (الوصف بين قوسين):',
            names.join(' | '),
            '',
            '## قواعد الألعاب (صارمة):',
            '- طلب لعبة محددة: جملة قصيرة ثم [GAME:اسم اللعبة كما في القائمة] — التاج يفتح اللعبة داخل الشات نفسه. مثال: يلا نلعب! [GAME:إكس أو]',
            '- طلب تسلية عامة أو "عايز ألعب" أو استعراض الألعاب: جملة قصيرة ثم [GAMEHUB] في سطر مستقل — يعرض كل الألعاب داخل الشات.',
            '- اللعب أونلاين مع صديق (المتاح: ' + netNames.join('، ') + '): وجّهه أن يفتح [GAMEHUB] ويختار من قسم الأونلاين، ينشئ روم ويبعت الكود لصاحبه، وصاحبه يكتب الكود (شكله G-ABCD) في شات LORD AI عنده فينضم فوراً.',
            '- لا تخترع أكواد روم أبداً — الأكواد يولّدها الموقع فقط.',
            '- لعبة غير متوفرة؟ اقترح الأقرب من القائمة، وأضف في نهاية ردك: [NOTFOUND:game:الاسم المطلوب] — تاج داخلي لن يظهر للمستخدم.'
        ].join('\n');
    }

    /* ═══════ STATE ═══════ */
    var convs = [];
    var activeId = null;
    var busy = false;
    var ctrl = null;
    var customCfg = { name: '', about: '', extra: '' };
    var replyStyle = 'normal';   // 'concise' | 'normal' | 'detailed'
    var stickBottom = true;      // Smart auto-scroll: follow stream only while user is near the bottom

    /* ═══════ PERSONALIZED SYSTEM PROMPT ═══════ */
    function buildSystemPrompt(recent) {
        var p = CORE_PROMPT;

        // Live context: today's date (cheap, answers "النهاردة كام" correctly)
        p += '\n\n## سياق حي:\n- تاريخ اليوم: '
            + new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        if (replyStyle === 'concise') {
            p += '\n\n## أسلوب مطلوب من المستخدم (له الأولوية):\n- أقصر إجابة صحيحة ممكنة: سطر واحد أو نقاط سريعة. صفر تفاصيل إضافية إلا لو طُلبت صراحة.';
        } else if (replyStyle === 'detailed') {
            p += '\n\n## أسلوب مطلوب من المستخدم (له الأولوية):\n- إجابة متعمقة: الخلفية باختصار، ثم الخطوات أو التفاصيل، ثم مثال عملي، ثم الأخطاء الشائعة أو الحالات الخاصة إن وُجدت.';
        }
        var c = [];
        if (customCfg.name) c.push('- اسم المستخدم: ' + customCfg.name + '. خاطبه باسمه أحياناً بشكل طبيعي غير متكلف.');
        if (customCfg.about) c.push('- معلومات عن المستخدم (استخدمها لتخصيص الأمثلة والمستوى): ' + customCfg.about);
        if (customCfg.extra) c.push('- تعليمات المستخدم لطريقة الرد: ' + customCfg.extra);
        if (c.length) {
            p += '\n\n## تخصيص المستخدم (أولويته أعلى من القواعد العامة، ما عدا قواعد الدقة):\n' + c.join('\n');
        }

        // Attach the heavy media guides only when the recent conversation needs them:
        // user keywords, or media tags in previous assistant replies (covers follow-ups)
        var wantMusic = false, wantMovie = false, wantGame = false;
        var tail = (recent || []).slice(-6);
        for (var i = 0; i < tail.length; i++) {
            var txt = tail[i].content || '';
            if (tail[i].role === 'user') {
                if (!wantMusic && MUSIC_RE.test(txt)) wantMusic = true;
                if (!wantMovie && MOVIE_RE.test(txt)) wantMovie = true;
                if (!wantGame && GAME_RE.test(txt)) wantGame = true;
            } else {
                if (!wantMusic && (txt.indexOf('[MUSIC:') !== -1 || txt.indexOf('[PLAYLIST:') !== -1)) wantMusic = true;
                if (!wantMovie && txt.indexOf('[MOVIE:') !== -1) wantMovie = true;
                if (!wantGame && txt.indexOf('[GAME') !== -1) wantGame = true; // matches [GAME:], [GAMEHUB], [GAMEJOIN:]
            }
            if (wantMusic && wantMovie && wantGame) break;
        }
        if (wantMusic) p += '\n' + musicGuide();
        if (wantMovie) p += '\n' + movieGuide();
        if (wantGame) p += '\n' + gamesGuide();
        return p;
    }

    /* ═══════ PLAYLIST STATE ═══════ */
    var playlist = [];       // [{id, name, artist, file}]
    var plIdx = -1;
    var plRepeat = 'none';   // 'none' | 'all' | 'one'
    var plActive = false;
    var plPanelOpen = false;
    var plHiddenAudio = null; // Hidden audio element for playing songs not visible in chat

    /* ═══════ STORAGE ═══════ */
    function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
    function saveAll() {
        // Temporary (incognito) chats are never persisted
        var persist = [];
        for (var i = 0; i < convs.length; i++) if (!convs[i].temp) persist.push(convs[i]);
        save('lord_convs', persist);
        var a = active();
        save('lord_active', (a && a.temp) ? null : activeId);
    }

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
        } catch (e) { console.error('[LORD] Firebase init error:', e); db = null; }
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
        db.collection('lord_logs').add(doc).then(function () {
            console.log('[LORD] Logged:', action);
        }).catch(function (e) {
            console.error('[LORD] Log error:', e.message);
        });
    }

    function trackPageView() {
        getVisitorId();
        var data = { ref: document.referrer || 'direct', page: location.pathname };
        try {
            data.loadMs = Math.round(performance.now());
            if (navigator.connection && navigator.connection.effectiveType) {
                data.net = navigator.connection.effectiveType;
            }
        } catch (e) { }
        fbLog('visit', data);
    }

    function trackMessage(role, text, responseTime) {
        var words = (text || '').split(/\s+/).filter(function (w) { return w }).length;
        var isAr = /[؀-ۿ]/.test(text);
        var data = { role: role, words: words, mlang: isAr ? 'ar' : 'en' };
        if (responseTime) data.rt = responseTime;
        fbLog('msg', data);
    }

    function trackError(msg) {
        fbLog('error', { err: (msg || '').substring(0, 200) });
    }

    /* ═══════ MISSING-CONTENT TRACKING ═══════
       Runs once per completed AI reply (not on re-renders):
       - [NOTFOUND:kind:name] — the model reports an unavailable request
       - [MUSIC:]/[MOVIE:]/[PLAYLIST:] tags that don't match the catalogs */
    function logMissingFromReply(txt) {
        if (!txt) return;
        var seen = {};
        function report(kind, q) {
            q = (q || '').trim().slice(0, 120);
            if (!q) return;
            var key = kind + '|' + q.toLowerCase();
            if (seen[key]) return;
            seen[key] = true;
            fbLog('missing', { kind: kind, q: q });
        }
        var m;
        var reNF = /\[NOTFOUND:(music|movie|game)\s*:\s*([^\]]+)\]/gi;
        while ((m = reNF.exec(txt))) report(m[1].toLowerCase(), m[2]);
        var reMu = /\[MUSIC:([^\]]+)\]/g;
        while ((m = reMu.exec(txt))) { if (!matchMusic(m[1])) report('music', m[1]); }
        var reMv = /\[MOVIE:([^\]]+)\]/g;
        while ((m = reMv.exec(txt))) { if (!matchMovie(m[1])) report('movie', m[1]); }
        var reGm = /\[GAME:([^\]]+)\]/g;
        while ((m = reGm.exec(txt))) {
            if (!window.LordGames || !window.LordGames.match(m[1])) report('game', m[1]);
        }
        var rePl = /\[PLAYLIST:([^\]]+)\]/g;
        while ((m = rePl.exec(txt))) {
            var parts = m[1].split('|');
            for (var i = 1; i < parts.length; i++) {
                if (parts[i].trim() && !matchMusic(parts[i])) report('music', parts[i]);
            }
        }
    }

    /* Media play tracking — powers the "most played" admin stats */
    function trackMedia(kind, name) {
        if (!name) return;
        fbLog('media', { kind: kind, name: ('' + name).trim().slice(0, 120) });
    }

    /* ═══════ DOM ═══════ */
    function $(id) { return document.getElementById(id); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    /* ═══════ LANGUAGE SYSTEM (AR / EN) ═══════ */
    var LANG = 'ar';
    var I18N = {
        ar: {
            newChat: 'محادثة جديدة',
            startNew: 'ابدأ محادثة جديدة',
            cleared: 'تم حذف جميع المحادثات',
            del: 'حذف',
            copy: 'نسخ',
            copied: 'تم النسخ',
            done: 'تم!',
            regen: 'إعادة توليد',
            stopped: '*(تم الإيقاف)*',
            errUnknown: 'حدث خطأ غير متوقع',
            errRate: '⏳ تم تجاوز الحد المسموح. انتظر قليلاً وحاول مرة أخرى.',
            errConn: 'خطأ في الاتصال',
            playlist: 'بلايليست',
            close: 'إغلاق',
            prev: 'السابق',
            next: 'التالي',
            play: 'تشغيل',
            add: 'إضافة',
            addToPl: 'إضافة للبلايليست',
            playAll: 'تشغيل الكل',
            clearList: 'مسح الكل',
            download: 'تحميل',
            open: 'فتح',
            openTab: 'فتح في تاب جديد',
            fullscreen: 'ملء الشاشة',
            songsWord: 'أغنية',
            plExists: 'الأغنية موجودة بالفعل في البلايليست',
            plAdded: 'تمت الإضافة: ',
            plCleared: 'تم مسح البلايليست',
            plFail: 'تعذر تشغيل: ',
            addedPre: 'تمت إضافة ',
            addedPost: ' أغنية',
            plAllExist: 'جميع الأغاني موجودة بالفعل',
            plStarted: 'تم تشغيل البلايليست',
            notAvail: 'غير متوفر',
            plNoMatch: 'لا توجد أغاني مطابقة',
            noVideo: 'المتصفح لا يدعم تشغيل الفيديو',
            repeatT: { none: 'تكرار', all: 'تكرار الكل', one: 'تكرار واحدة' },
            repeatToast: { none: 'تكرار: مغلق', all: 'تكرار: الكل', one: 'تكرار: أغنية واحدة' },
            langToast: 'اللغة: العربية',
            grpToday: 'اليوم',
            grpYest: 'أمس',
            grpWeek: 'آخر 7 أيام',
            grpOlder: 'أقدم',
            rename: 'إعادة تسمية',
            edit: 'تعديل',
            speak: 'استماع',
            good: 'رد مفيد',
            bad: 'رد غير مفيد',
            thanks: 'شكراً على تقييمك',
            exported: 'تم تصدير المحادثة',
            noChat: 'لا توجد محادثة للتصدير',
            listening: 'جاري الاستماع… تحدث الآن',
            editHint: 'عدّل رسالتك ثم أرسلها',
            saveSend: 'إرسال',
            cancel: 'إلغاء',
            youWord: 'أنت',
            grpPinned: 'مثبتة',
            pin: 'تثبيت',
            unpin: 'إلغاء التثبيت',
            pinned: 'تم تثبيت المحادثة',
            unpinned: 'تم إلغاء التثبيت',
            undo: 'تراجع',
            convDeleted: 'تم حذف المحادثة',
            ckActions: 'إجراءات',
            ckChats: 'المحادثات',
            ckEmpty: 'لا توجد نتائج',
            actTheme: 'تبديل المظهر',
            actLang: 'تغيير اللغة',
            actExport: 'تصدير المحادثة',
            actPersonalize: 'تخصيص LORD AI',
            actShortcuts: 'اختصارات لوحة المفاتيح',
            actClearAll: 'حذف جميع المحادثات',
            quote: 'اقتباس',
            styleToast: { concise: 'أسلوب الرد: مختصر', normal: 'أسلوب الرد: متوازن', detailed: 'أسلوب الرد: مفصّل' },
            ciSaved: 'تم حفظ التخصيص',
            ciClearedT: 'تم مسح التخصيص',
            playWord: 'العب',
            actGames: 'الألعاب',
            actTemp: 'محادثة مؤقتة',
            tempOn: 'محادثة مؤقتة — لن يتم حفظها',
            tempAlready: 'أنت بالفعل في محادثة مؤقتة',
            tempBanner: 'محادثة مؤقتة — تُحذف عند إغلاق الصفحة ولا تُحفظ في السجل',
            actFont: 'تغيير حجم الخط',
            fontToast: { normal: 'حجم الخط: عادي', lg: 'حجم الخط: كبير', sm: 'حجم الخط: صغير' },
            actDupe: 'إنشاء نسخة من المحادثة',
            copyWord: 'نسخة',
            duped: 'تم إنشاء نسخة من المحادثة',
            rlMin: 'رسائل كتير ورا بعض — استنى {s} ثانية وابعت تاني',
            rlDay: 'خلّصت رسائل النهارده ({n}) — بترجع بعد منتصف الليل',
            rlNear: 'فاضل لك {n} رسائل النهارده'
        },
        en: {
            newChat: 'New chat',
            startNew: 'Start a new chat',
            cleared: 'All chats deleted',
            del: 'Delete',
            copy: 'Copy',
            copied: 'Copied',
            done: 'Done!',
            regen: 'Regenerate',
            stopped: '*(Stopped)*',
            errUnknown: 'An unexpected error occurred',
            errRate: '⏳ Rate limit exceeded. Please wait a moment and try again.',
            errConn: 'Connection error',
            playlist: 'Playlist',
            close: 'Close',
            prev: 'Previous',
            next: 'Next',
            play: 'Play',
            add: 'Add',
            addToPl: 'Add to playlist',
            playAll: 'Play all',
            clearList: 'Clear all',
            download: 'Download',
            open: 'Open',
            openTab: 'Open in new tab',
            fullscreen: 'Fullscreen',
            songsWord: 'songs',
            plExists: 'Song is already in the playlist',
            plAdded: 'Added: ',
            plCleared: 'Playlist cleared',
            plFail: 'Could not play: ',
            addedPre: 'Added ',
            addedPost: ' songs',
            plAllExist: 'All songs are already added',
            plStarted: 'Playlist started',
            notAvail: 'not available',
            plNoMatch: 'no matching songs',
            noVideo: 'Your browser does not support video playback',
            repeatT: { none: 'Repeat', all: 'Repeat all', one: 'Repeat one' },
            repeatToast: { none: 'Repeat: off', all: 'Repeat: all', one: 'Repeat: one' },
            langToast: 'Language: English',
            grpToday: 'Today',
            grpYest: 'Yesterday',
            grpWeek: 'Previous 7 days',
            grpOlder: 'Older',
            rename: 'Rename',
            edit: 'Edit',
            speak: 'Read aloud',
            good: 'Good response',
            bad: 'Bad response',
            thanks: 'Thanks for your feedback',
            exported: 'Chat exported',
            noChat: 'No chat to export',
            listening: 'Listening… speak now',
            editHint: 'Edit your message and send',
            saveSend: 'Send',
            cancel: 'Cancel',
            youWord: 'You',
            grpPinned: 'Pinned',
            pin: 'Pin',
            unpin: 'Unpin',
            pinned: 'Chat pinned',
            unpinned: 'Chat unpinned',
            undo: 'Undo',
            convDeleted: 'Chat deleted',
            ckActions: 'Actions',
            ckChats: 'Chats',
            ckEmpty: 'No results',
            actTheme: 'Toggle theme',
            actLang: 'Switch language',
            actExport: 'Export chat',
            actPersonalize: 'Personalize LORD AI',
            actShortcuts: 'Keyboard shortcuts',
            actClearAll: 'Delete all chats',
            quote: 'Quote',
            styleToast: { concise: 'Reply style: concise', normal: 'Reply style: balanced', detailed: 'Reply style: detailed' },
            ciSaved: 'Personalization saved',
            ciClearedT: 'Personalization cleared',
            playWord: 'Play',
            actGames: 'Games',
            actTemp: 'Temporary chat',
            tempOn: 'Temporary chat — it won\'t be saved',
            tempAlready: 'You are already in a temporary chat',
            tempBanner: 'Temporary chat — deleted when you close the page, never saved to history',
            actFont: 'Change font size',
            fontToast: { normal: 'Font size: normal', lg: 'Font size: large', sm: 'Font size: small' },
            actDupe: 'Duplicate this chat',
            copyWord: 'copy',
            duped: 'Chat duplicated',
            rlMin: 'Too many messages at once — wait {s}s and try again',
            rlDay: 'Daily message limit reached ({n}) — resets after midnight',
            rlNear: '{n} messages left for today'
        }
    };

    function t(k) {
        var d = I18N[LANG] || I18N.ar;
        return d[k] !== undefined ? d[k] : I18N.ar[k];
    }

    function applyLang(l) {
        LANG = (l === 'en') ? 'en' : 'ar';
        save('lord_lang', LANG);
        var root = document.documentElement;
        root.setAttribute('lang', LANG);
        root.setAttribute('dir', LANG === 'en' ? 'ltr' : 'rtl');
        var attr = 'data-' + LANG;
        document.querySelectorAll('[data-ar]').forEach(function (n) {
            var v = n.getAttribute(attr);
            if (v !== null) n.textContent = v;
        });
        document.querySelectorAll('[data-ar-ph]').forEach(function (n) {
            var v = n.getAttribute(attr + '-ph');
            if (v !== null) n.setAttribute('placeholder', v);
        });
        document.querySelectorAll('[data-ar-title]').forEach(function (n) {
            var v = n.getAttribute(attr + '-title');
            if (v !== null) n.setAttribute('title', v);
        });
        document.querySelectorAll('[data-q-ar]').forEach(function (n) {
            var v = n.getAttribute('data-q-' + LANG);
            if (v !== null) n.setAttribute('data-q', v);
        });
        var lb = $('langBtn');
        if (lb) lb.textContent = LANG === 'en' ? 'ع' : 'EN';
    }

    function toggleLang() {
        applyLang(LANG === 'en' ? 'ar' : 'en');
        renderList();
        renderChat();
        renderPlaylistPanel();
        toast(t('langToast'));
    }

    var el = {};
    function cacheDom() {
        var ids = ['sidebar', 'overlay', 'closeSidebar', 'openSidebar', 'newChatBtn', 'convList',
            'clearBtn', 'themeBtn', 'themeIcon', 'chatArea', 'welcome', 'messages',
            'input', 'sendBtn', 'stopBtn', 'inputBox', 'prompts'];
        for (var i = 0; i < ids.length; i++) el[ids[i]] = $(ids[i]);
    }

    /* ═══════ TOAST ═══════ */
    /* toast(msg[, iconName]) — icon is a trusted ICONS key; msg stays textContent (XSS-safe) */
    function toast(msg, iconName) {
        var old = document.querySelector('.toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.className = 'toast';
        if (iconName) {
            var ic = document.createElement('span');
            ic.className = 'toast-ic';
            ic.innerHTML = icon(iconName, 15);
            t.appendChild(ic);
        }
        var tx = document.createElement('span');
        tx.className = 'toast-tx';
        tx.textContent = msg;
        t.appendChild(tx);
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add('show'); });
        setTimeout(function () {
            t.classList.remove('show');
            setTimeout(function () { t.remove(); }, 350);
        }, 2500);
    }

    /* Toast with an Undo action (used for destructive operations) */
    function toastUndo(msg, onUndo) {
        var old = document.querySelector('.toast');
        if (old) old.remove();
        var box = document.createElement('div');
        box.className = 'toast undoable';
        var span = document.createElement('span');
        span.textContent = msg;
        var btn = document.createElement('button');
        btn.className = 'toast-undo';
        btn.textContent = t('undo');
        box.appendChild(span);
        box.appendChild(btn);
        document.body.appendChild(box);
        function hide() {
            box.classList.remove('show');
            setTimeout(function () { box.remove(); }, 350);
        }
        var timer = setTimeout(hide, 6000);
        btn.addEventListener('click', function () {
            clearTimeout(timer);
            hide();
            onUndo();
        });
        requestAnimationFrame(function () { box.classList.add('show'); });
    }

    /* ═══════ MARKDOWN PARSER ═══════ */
    /* ═══════ SYNTAX HIGHLIGHTING ═══════
       Tiny tokenizer: comments/strings are extracted first (placeholders)
       so keywords inside them never get styled. Works on esc()-ed code. */
    var HL_KW = {
        c: 'var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|interface|import|export|from|default|try|catch|finally|throw|typeof|instanceof|in|of|this|super|async|await|yield|delete|void|null|undefined|true|false|public|private|protected|static|int|float|double|char|bool|boolean|long|struct|enum|namespace|using|package|func|fn|mut|pub',
        hash: 'def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|class|try|except|finally|raise|with|pass|break|continue|lambda|yield|global|nonlocal|assert|del|self|print|echo|fi|then|do|done|esac|local|export|function',
        sql: 'SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|CREATE|TABLE|DROP|ALTER|INDEX|PRIMARY|KEY|FOREIGN|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MIN|MAX|LIKE|BETWEEN|EXISTS|UNION'
    };
    function hlFamily(lang) {
        if (/^(js|javascript|ts|typescript|jsx|tsx|json|java|c|cpp|c\+\+|cs|csharp|go|rust|php|swift|kotlin|dart)$/.test(lang)) return 'c';
        if (/^(py|python|rb|ruby|sh|bash|shell|zsh|yaml|yml)$/.test(lang)) return 'hash';
        if (/^sql$/.test(lang)) return 'sql';
        if (/^(html|xml)$/.test(lang)) return 'html';
        if (/^css$/.test(lang)) return 'css';
        return null;
    }
    function hl(code, lang) {
        var s = esc(code);
        var fam = hlFamily((lang || '').toLowerCase());
        if (!fam) return s;
        var toks = [];
        function hold(cls) {
            return function (m2) {
                toks.push('<span class="' + cls + '">' + m2 + '</span>');
                return '%%T' + (toks.length - 1) + '%%';
            };
        }
        // comments first, then strings, so quotes inside comments stay comments
        if (fam === 'c' || fam === 'css') s = s.replace(/\/\*[\s\S]*?\*\//g, hold('tok-c'));
        if (fam === 'c') s = s.replace(/\/\/[^\n]*/g, hold('tok-c'));
        if (fam === 'hash') s = s.replace(/#[^\n]*/g, hold('tok-c'));
        if (fam === 'sql') s = s.replace(/--[^\n]*/g, hold('tok-c'));
        if (fam === 'html') s = s.replace(/&lt;!--[\s\S]*?--&gt;/g, hold('tok-c'));
        s = s.replace(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g, hold('tok-s'));
        s = s.replace(/\b\d+(\.\d+)?\b/g, hold('tok-n'));
        if (HL_KW[fam]) {
            s = s.replace(new RegExp('\\b(' + HL_KW[fam] + ')\\b', fam === 'sql' ? 'gi' : 'g'), hold('tok-k'));
        }
        if (fam === 'c' || fam === 'hash') s = s.replace(/\b([A-Za-z_]\w*)(?=\()/g, hold('tok-f'));
        if (fam === 'html') s = s.replace(/(&lt;\/?)([\w-]+)/g, function (_, p, tag) { return p + hold('tok-k')(tag); });
        for (var i = toks.length - 1; i >= 0; i--) s = s.replace('%%T' + i + '%%', toks[i]);
        return s;
    }

    function md(text) {
        if (!text) return '';

        // [NOTFOUND:kind:name] is an internal reporting tag — never displayed
        // (\]? also hides a partially-streamed tag at the end of the text)
        text = text.replace(/\[NOTFOUND:[^\]]*\]?/g, '').trim();

        // [SUGGEST:q1|q2|q3] → follow-up chips appended after the message body
        var suggestHtml = '';
        text = text.replace(/\[SUGGEST:([^\]]+)\]/g, function (_, content) {
            var parts = content.split('|').map(function (s) { return s.trim(); }).filter(function (s) { return s; }).slice(0, 3);
            if (parts.length) {
                suggestHtml = '<div class="suggest-row">' + parts.map(function (s) {
                    return '<button class="suggest-chip" onclick="LORD.suggest(this)">' + esc(s) + '</button>';
                }).join('') + '</div>';
            }
            return '';
        });
        // hide a partially-streamed suggest tag at the end of the text
        text = text.replace(/\[SUGGEST:[^\]]*$/, '').trim();

        // Game tags — playable frames inline in the chat
        var gameBlocks = [];
        text = text.replace(/\[GAMEHUB\]/g, function () {
            var idx = gameBlocks.length;
            gameBlocks.push(window.LordGames ? window.LordGames.hubFrameHTML() : '<p>' + icon('gamepad') + '</p>');
            return '%%GAME_' + idx + '%%';
        });
        text = text.replace(/\[GAMEJOIN:([A-Z0-9-]+)\]/gi, function (_, code) {
            var idx = gameBlocks.length;
            gameBlocks.push(window.LordGames ? window.LordGames.joinFrameHTML(code.toUpperCase()) : '<p>' + icon('globe') + ' ' + esc(code) + '</p>');
            return '%%GAME_' + idx + '%%';
        });
        text = text.replace(/\[GAME:([^\]]+)\]/g, function (_, name) {
            var idx = gameBlocks.length;
            var g = window.LordGames ? window.LordGames.match(name) : null;
            gameBlocks.push(g && window.LordGames ? window.LordGames.posterFrameHTML(g) : '<p>' + icon('gamepad') + ' ' + esc(name) + ' (' + t('notAvail') + ')</p>');
            return '%%GAME_' + idx + '%%';
        });

        // Preserve music tags
        var musicBlocks = [];
        text = text.replace(/\[MUSIC:([^\]]+)\]/g, function (_, name) {
            var idx = musicBlocks.length;
            var found = matchMusic(name);
            musicBlocks.push(found ? musicPlayerHTML(found) : '<p>' + icon('music') + ' ' + esc(name) + ' (' + t('notAvail') + ')</p>');
            return '%%MUSIC_' + idx + '%%';
        });

        // Preserve movie tags
        var movieBlocks = [];
        text = text.replace(/\[MOVIE:([^\]]+)\]/g, function (_, name) {
            var idx = movieBlocks.length;
            var found = matchMovie(name);
            movieBlocks.push(found ? moviePlayerHTML(found) : '<p>' + icon('film') + ' ' + esc(name) + ' (' + t('notAvail') + ')</p>');
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

        // Preserve playlist tags [PLAYLIST:title|song1|song2|...]
        var playlistBlocks = [];
        text = text.replace(/\[PLAYLIST:([^\]]+)\]/g, function (_, content) {
            var pidx = playlistBlocks.length;
            var parts = content.split('|').map(function (s) { return s.trim(); });
            var plTitle = parts[0] || t('playlist');
            var songNames = parts.slice(1);
            var foundSongs = [];
            for (var s = 0; s < songNames.length; s++) {
                var fs = matchMusic(songNames[s]);
                if (fs) foundSongs.push(fs);
            }
            if (foundSongs.length > 0) {
                playlistBlocks.push(chatPlaylistHTML(foundSongs, plTitle));
            } else {
                playlistBlocks.push('<p>\ud83c\udfb5 ' + esc(plTitle) + ' (' + t('plNoMatch') + ')</p>');
            }
            return '%%PLAYLIST_' + pidx + '%%';
        });

        // Preserve code blocks first
        var codeBlocks = [];
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
            var idx = codeBlocks.length;
            var l = lang || 'code';
            codeBlocks.push(
                '<pre><div class="code-h"><span>' + esc(l) + '</span>'
                + '<button class="copy-btn" onclick="LORD.copyCode(this)">'
                + COPY_SVG + ' ' + t('copy') + '</button></div>'
                + '<code>' + hl(code.trim(), lang) + '</code></pre>'
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

        // Ordered lists first, via a temp tag so the <ul> pass below can't grab them
        text = text.replace(/^\d+[.)] (.+)$/gm, '<oli>$1</oli>');
        text = text.replace(/((?:<oli>.*<\/oli>\n?)+)/g, '<ol>$1</ol>');

        // Unordered lists
        text = text.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
        text = text.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Materialize ordered items now that the <ul> pass is done
        text = text.replace(/<(\/?)oli>/g, '<$1li>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Tables
        text = text.replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)*)/gm, function (_, hdr, sep, body) {
            var ths = hdr.split('|').filter(function (c) { return c.trim() }).map(function (c) { return '<th>' + c.trim() + '</th>' }).join('');
            var rows = body.trim().split('\n').map(function (r) {
                var tds = r.split('|').filter(function (c) { return c.trim() }).map(function (c) { return '<td>' + c.trim() + '</td>' }).join('');
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

        // Restore playlist blocks
        for (var pl = 0; pl < playlistBlocks.length; pl++) {
            text = text.replace('%%PLAYLIST_' + pl + '%%', playlistBlocks[pl]);
        }

        // Restore game blocks
        for (var gb = 0; gb < gameBlocks.length; gb++) {
            text = text.replace('%%GAME_' + gb + '%%', gameBlocks[gb]);
        }

        return text + suggestHtml;
    }

    /* ═══════ ICONS ═══════ */
    var COPY_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
    var REGEN_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
    var SPEAK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    var LIKE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
    var DISLIKE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';
    var EDIT_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

    /* Named icon map (no emojis in UI) — Feather-style strokes, currentColor */
    var ICONS = {
        check: '<polyline points="20 6 9 17 4 12"/>',
        ghost: '<path d="M12 2a8 8 0 0 0-8 8v11l3-2.4 2.5 2.4L12 18.6 14.5 21l2.5-2.4 3 2.4V10a8 8 0 0 0-8-8z"/><circle cx="9" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".8" fill="currentColor" stroke="none"/>',
        gamepad: '<line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
        globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
        film: '<rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>',
        warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
        repeat1: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="14.5" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none">1</text>',
        mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
        pencil: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
        pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>',
        bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        scale: '<line x1="12" y1="3" x2="12" y2="21"/><path d="M5 7l7-4 7 4"/><path d="M2 13l3-6 3 6a3.5 3.5 0 0 1-6 0z"/><path d="M16 13l3-6 3 6a3.5 3.5 0 0 1-6 0z"/>',
        book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
        type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>'
    };
    function icon(n, s) {
        return '<svg width="' + (s || 14) + '" height="' + (s || 14)
            + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            + (ICONS[n] || '') + '</svg>';
    }

    /* Shared action bar for assistant messages */
    var speaking = null;
    function aiActsHTML(includeRegen) {
        var h = '<div class="msg-acts">'
            + '<button class="act-btn" onclick="LORD.copyMsg(this)" title="' + t('copy') + '">' + COPY_SVG + ' ' + t('copy') + '</button>';
        if (includeRegen) {
            h += '<button class="act-btn" onclick="LORD.regen(this)" title="' + t('regen') + '">' + REGEN_SVG + ' ' + t('regen') + '</button>';
        }
        h += '<button class="act-btn" onclick="LORD.speak(this)" title="' + t('speak') + '">' + SPEAK_SVG + '</button>'
            + '<button class="act-btn" onclick="LORD.rate(this,1)" title="' + t('good') + '">' + LIKE_SVG + '</button>'
            + '<button class="act-btn" onclick="LORD.rate(this,-1)" title="' + t('bad') + '">' + DISLIKE_SVG + '</button>'
            + '</div>';
        return h;
    }

    /* ═══════ GLOBAL ACTIONS ═══════ */
    window.LORD = {
        audioToggle: function (id) {
            var p = document.getElementById(id);
            if (!p) return;
            var a = p.querySelector('audio');
            var btn = p.querySelector('.mp-play');
            if (a.paused) {
                document.querySelectorAll('.music-player audio').forEach(function (o) {
                    if (o !== a) {
                        o.pause();
                        var ob = o.parentElement.querySelector('.mp-play');
                        if (ob) ob.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                    }
                });
                // Stop hidden audio to avoid two songs playing
                if (plHiddenAudio) { plHiddenAudio.pause(); }
                a.play();
                var mpTitle = p.querySelector('.mp-title');
                trackMedia('music', mpTitle ? mpTitle.textContent : '');
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            } else {
                a.pause();
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            }
        },
        audioUpdate: function (id) {
            var p = document.getElementById(id);
            if (!p) return;
            var a = p.querySelector('audio');
            var bar = p.querySelector('.mp-bar');
            var time = p.querySelector('.mp-time');
            if (!a.duration) return;
            var pct = (a.currentTime / a.duration) * 100;
            bar.style.width = pct + '%';
            var fm = function (s) { var m = Math.floor(s / 60); var ss = Math.floor(s % 60); return m + ':' + (ss < 10 ? '0' + ss : ss); };
            time.textContent = fm(a.currentTime) + ' / ' + fm(a.duration);
        },
        audioLoaded: function (id) {
            this.audioUpdate(id);
        },
        audioEnded: function (id) {
            var p = document.getElementById(id);
            if (!p) return;
            var PLAY_ICO = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            p.querySelector('.mp-play').innerHTML = PLAY_ICO;
            p.querySelector('audio').currentTime = 0;
            this.audioUpdate(id);
            // Playlist auto-play logic — use shared handler
            if (plActive && playlist.length > 0 && plIdx >= 0) {
                var curMusicId = p.getAttribute('data-music-id');
                if (curMusicId && playlist[plIdx] && playlist[plIdx].id === curMusicId) {
                    plHandleEnded();
                }
            }
        },
        audioSeek: function (e, id) {
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
        copyCode: function (btn) {
            var code = btn.closest('pre').querySelector('code');
            navigator.clipboard.writeText(code.textContent).then(function () {
                var orig = btn.innerHTML;
                btn.innerHTML = CHECK_SVG + ' ' + t('done');
                btn.classList.add('copied');
                setTimeout(function () { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800);
            });
        },
        copyMsg: function (btn) {
            var body = btn.closest('.body') || btn.closest('.msg').querySelector('.body');
            var clone = body.cloneNode(true);
            clone.querySelectorAll('.msg-acts,.suggest-row,.game-frame').forEach(function (n) { n.remove(); });
            var text = clone.innerText.trim();
            navigator.clipboard.writeText(text).then(function () {
                toast(t('copied'), 'check');
            });
        },
        regen: function (btn) {
            if (busy) return;
            var c = active();
            if (!c || c.msgs.length < 2) return;
            if (!rlGate()) return;
            c.msgs.pop();
            saveAll();
            renderChat();
            busy = true;
            el.sendBtn.classList.add('none');
            el.stopBtn.classList.remove('none');
            showDots();
            callAPI(c.msgs).then(function (res) {
                hideDots();
                var aiMsg = { role: 'assistant', content: '' };
                var node = addMsg(aiMsg);
                return readStream(res, node).then(function (txt) {
                    aiMsg.content = txt;
                    c.msgs.push(aiMsg);
                    saveAll();
                    logMissingFromReply(txt);
                });
            }).catch(function (err) {
                hideDots();
                handleError(err, c);
            }).then(finishSend);
        },
        playMovie: function (id, embedUrl) {
            var player = document.getElementById(id);
            if (!player) return;
            var mvTitle = player.querySelector('.mv-title');
            trackMedia('movie', mvTitle ? mvTitle.textContent : '');
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
        movieFullscreen: function (id) {
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
        /* ═══════ PLAYLIST METHODS ═══════ */
        plAdd: function (musicId) {
            // Check if already in playlist
            for (var i = 0; i < playlist.length; i++) {
                if (playlist[i].id === musicId) { toast(t('plExists'), 'music'); return; }
            }
            // Find song
            var song = null;
            for (var j = 0; j < MUSIC.length; j++) {
                if (MUSIC[j].id === musicId) { song = MUSIC[j]; break; }
            }
            if (!song) return;
            playlist.push({ id: song.id, name: song.name, artist: song.artist, file: song.file });
            save('lord_playlist', playlist);
            toast(t('plAdded') + song.name, 'music');
            if (!plPanelOpen) { plPanelOpen = true; }
            renderPlaylistPanel();
        },
        plRemove: function (idx) {
            if (idx < 0 || idx >= playlist.length) return;
            var wasPlaying = (plIdx === idx && plActive);
            playlist.splice(idx, 1);
            if (plIdx >= playlist.length) plIdx = playlist.length - 1;
            if (plIdx === idx && wasPlaying) plActive = false;
            if (plIdx > idx) plIdx--;
            save('lord_playlist', playlist);
            renderPlaylistPanel();
            if (playlist.length === 0) { plIdx = -1; plActive = false; }
        },
        plClear: function () {
            // Stop current audio
            document.querySelectorAll('.music-player audio').forEach(function (a) {
                a.pause(); a.currentTime = 0;
            });
            document.querySelectorAll('.mp-play').forEach(function (b) {
                b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            });
            // Stop hidden audio
            if (plHiddenAudio) { plHiddenAudio.pause(); plHiddenAudio.removeAttribute('src'); plHiddenAudio.load(); }
            playlist = []; plIdx = -1; plActive = false;
            save('lord_playlist', playlist);
            renderPlaylistPanel();
            toast(t('plCleared'), 'trash');
        },
        plPlay: function (idx) {
            if (idx < 0 || idx >= playlist.length) return;
            plIdx = idx;
            plActive = true;
            var song = playlist[idx];
            trackMedia('music', song.name);
            // Stop all visible audio players
            document.querySelectorAll('.music-player audio').forEach(function (a) {
                a.pause();
                var btn = a.parentElement.querySelector('.mp-play');
                if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            });
            // Stop hidden audio if playing
            if (plHiddenAudio) { plHiddenAudio.pause(); }
            // Find player with this music id in chat DOM
            var players = document.querySelectorAll('.music-player[data-music-id="' + song.id + '"]');
            if (players.length > 0) {
                // Use visible player in chat
                var p = players[0];
                var a = p.querySelector('audio');
                var btn = p.querySelector('.mp-play');
                a.currentTime = 0;
                a.play();
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
                p.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // No visible player — use hidden audio (fixes skip bug)
                if (plHiddenAudio) {
                    plHiddenAudio.src = encodeURI(song.file);
                    plHiddenAudio.currentTime = 0;
                    plHiddenAudio.play().catch(function(e) {
                        console.error('[LORD] Hidden audio play error:', e);
                        toast(t('plFail') + song.name, 'warn');
                    });
                    toast(song.name, 'music');
                }
            }
            renderPlaylistPanel();
        },
        plNext: function () {
            if (playlist.length === 0) return;
            var next = plIdx + 1;
            if (next >= playlist.length) next = (plRepeat === 'all') ? 0 : playlist.length - 1;
            this.plPlay(next);
        },
        plPrev: function () {
            if (playlist.length === 0) return;
            var prev = plIdx - 1;
            if (prev < 0) prev = (plRepeat === 'all') ? playlist.length - 1 : 0;
            this.plPlay(prev);
        },
        plToggleRepeat: function () {
            if (plRepeat === 'none') plRepeat = 'all';
            else if (plRepeat === 'all') plRepeat = 'one';
            else plRepeat = 'none';
            save('lord_pl_repeat', plRepeat);
            renderPlaylistPanel();
            toast(t('repeatToast')[plRepeat], plRepeat === 'one' ? 'repeat1' : 'repeat');
        },
        plTogglePanel: function () {
            plPanelOpen = !plPanelOpen;
            renderPlaylistPanel();
        },
        plAddAll: function () {
            var added = 0;
            for (var i = 0; i < MUSIC.length; i++) {
                var exists = false;
                for (var j = 0; j < playlist.length; j++) {
                    if (playlist[j].id === MUSIC[i].id) { exists = true; break; }
                }
                if (!exists) {
                    playlist.push({ id: MUSIC[i].id, name: MUSIC[i].name, artist: MUSIC[i].artist, file: MUSIC[i].file });
                    added++;
                }
            }
            if (added > 0) {
                save('lord_playlist', playlist);
                toast(t('addedPre') + added + t('addedPost'), 'music');
                if (!plPanelOpen) plPanelOpen = true;
                renderPlaylistPanel();
            } else { toast(t('plAllExist'), 'music'); }
        },
        plPlayInline: function (plId) {
            var panel = document.getElementById(plId);
            if (!panel) return;
            var ids = panel.getAttribute('data-songs').split(',');
            // Add all to playlist panel and start playing
            var added = 0;
            for (var i = 0; i < ids.length; i++) {
                var exists = false;
                for (var j = 0; j < playlist.length; j++) {
                    if (playlist[j].id === ids[i]) { exists = true; break; }
                }
                if (!exists) {
                    for (var k = 0; k < MUSIC.length; k++) {
                        if (MUSIC[k].id === ids[i]) {
                            playlist.push({ id: MUSIC[k].id, name: MUSIC[k].name, artist: MUSIC[k].artist, file: MUSIC[k].file });
                            added++;
                            break;
                        }
                    }
                }
            }
            save('lord_playlist', playlist);
            plPanelOpen = true;
            // Start playing from first song of this inline playlist
            var firstIdx = -1;
            for (var f = 0; f < playlist.length; f++) {
                if (playlist[f].id === ids[0]) { firstIdx = f; break; }
            }
            if (firstIdx >= 0) this.plPlay(firstIdx);
            renderPlaylistPanel();
            if (added > 0) toast(t('plStarted'), 'music');
        },
        plPlayInlineSong: function (plId, idx) {
            var panel = document.getElementById(plId);
            if (!panel) return;
            var ids = panel.getAttribute('data-songs').split(',');
            if (idx < 0 || idx >= ids.length) return;
            var songId = ids[idx];
            // Add to playlist if not there
            var exists = false;
            for (var j = 0; j < playlist.length; j++) {
                if (playlist[j].id === songId) { exists = true; break; }
            }
            if (!exists) {
                for (var k = 0; k < MUSIC.length; k++) {
                    if (MUSIC[k].id === songId) {
                        playlist.push({ id: MUSIC[k].id, name: MUSIC[k].name, artist: MUSIC[k].artist, file: MUSIC[k].file });
                        save('lord_playlist', playlist);
                        break;
                    }
                }
            }
            // Find and play
            for (var f = 0; f < playlist.length; f++) {
                if (playlist[f].id === songId) { this.plPlay(f); break; }
            }
            plPanelOpen = true;
            renderPlaylistPanel();
        },
        plAddInline: function (plId) {
            var panel = document.getElementById(plId);
            if (!panel) return;
            var ids = panel.getAttribute('data-songs').split(',');
            var added = 0;
            for (var i = 0; i < ids.length; i++) {
                var exists = false;
                for (var j = 0; j < playlist.length; j++) {
                    if (playlist[j].id === ids[i]) { exists = true; break; }
                }
                if (!exists) {
                    for (var k = 0; k < MUSIC.length; k++) {
                        if (MUSIC[k].id === ids[i]) {
                            playlist.push({ id: MUSIC[k].id, name: MUSIC[k].name, artist: MUSIC[k].artist, file: MUSIC[k].file });
                            added++;
                            break;
                        }
                    }
                }
            }
            save('lord_playlist', playlist);
            if (added > 0) {
                toast(t('addedPre') + added + t('addedPost'), 'music');
                plPanelOpen = true;
            } else { toast(t('plAllExist'), 'music'); }
            renderPlaylistPanel();
        },
        sw: function (id) { switchConv(id); },
        del: function (id, e) { e.stopPropagation(); deleteConv(id); },
        pin: function (id, e) {
            e.stopPropagation();
            for (var i = 0; i < convs.length; i++) {
                if (convs[i].id === id) {
                    convs[i].pin = !convs[i].pin;
                    toast(convs[i].pin ? t('pinned') : t('unpinned'), convs[i].pin ? 'pin' : null);
                    break;
                }
            }
            saveAll();
            renderList();
        },
        ren: function (id, e) {
            e.stopPropagation();
            var item = e.target.closest('.conv');
            var tEl = item ? item.querySelector('.conv-t') : null;
            var conv = null;
            for (var i = 0; i < convs.length; i++) {
                if (convs[i].id === id) { conv = convs[i]; break; }
            }
            if (!conv || !tEl) return;
            var inp = document.createElement('input');
            inp.type = 'text';
            inp.className = 'conv-edit';
            inp.value = conv.title;
            tEl.replaceWith(inp);
            inp.focus();
            inp.select();
            inp.addEventListener('click', function (ev) { ev.stopPropagation(); });
            var done = false;
            function commit() {
                if (done) return;
                done = true;
                var v = inp.value.trim();
                if (v) conv.title = v;
                saveAll();
                renderList();
            }
            inp.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter') commit();
                if (ev.key === 'Escape') { done = true; renderList(); }
            });
            inp.addEventListener('blur', commit);
        },
        editMsg: function (btn) {
            if (busy) return;
            var c = active();
            if (!c) return;
            var node = btn.closest('.msg');
            var idx = [].indexOf.call(el.messages.children, node);
            if (idx < 0 || !c.msgs[idx] || c.msgs[idx].role !== 'user') return;
            // Already editing? do nothing
            if (node.querySelector('.edit-wrap')) return;

            var body = node.querySelector('.body');
            var actsU = node.querySelector('.msg-acts-u');
            var original = c.msgs[idx].content;

            // Inline editor in place of the bubble (nothing is deleted until confirmed)
            var wrap = document.createElement('div');
            wrap.className = 'edit-wrap';

            var ta = document.createElement('textarea');
            ta.className = 'edit-ta';
            ta.value = original;
            ta.dir = 'auto';
            ta.rows = 1;

            var actions = document.createElement('div');
            actions.className = 'edit-actions';
            var saveB = document.createElement('button');
            saveB.className = 'edit-save';
            saveB.textContent = t('saveSend');
            var cancelB = document.createElement('button');
            cancelB.className = 'edit-cancel';
            cancelB.textContent = t('cancel');
            actions.appendChild(saveB);
            actions.appendChild(cancelB);
            wrap.appendChild(ta);
            wrap.appendChild(actions);

            body.style.display = 'none';
            if (actsU) actsU.style.display = 'none';
            body.parentElement.insertBefore(wrap, body);

            function fit() {
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
            }
            fit();
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
            ta.addEventListener('input', fit);

            function cancel() {
                wrap.remove();
                body.style.display = '';
                if (actsU) actsU.style.display = '';
            }
            cancelB.addEventListener('click', cancel);

            function confirmSend() {
                var v = ta.value.trim();
                if (!v || busy) return;
                if (v === original) { cancel(); return; }
                // Recompute index at confirm time, then truncate from this message onward and resend
                var idx2 = [].indexOf.call(el.messages.children, node);
                if (idx2 < 0 || !c.msgs[idx2]) { cancel(); return; }
                c.msgs = c.msgs.slice(0, idx2);
                saveAll();
                renderChat();
                send(v);
            }
            saveB.addEventListener('click', confirmSend);
            ta.addEventListener('keydown', function (ev) {
                if (ev.key === 'Escape') cancel();
                if (ev.key === 'Enter' && !ev.shiftKey) {
                    ev.preventDefault();
                    confirmSend();
                }
            });
        },
        speak: function (btn) {
            if (!window.speechSynthesis) return;
            if (speaking === btn) {
                speechSynthesis.cancel();
                speaking = null;
                btn.classList.remove('speaking');
                return;
            }
            speechSynthesis.cancel();
            if (speaking) speaking.classList.remove('speaking');
            var body = btn.closest('.body');
            var clone = body.cloneNode(true);
            clone.querySelectorAll('.msg-acts,pre,.music-player,.movie-player,.chat-playlist,.suggest-row,.game-frame').forEach(function (n) { n.remove(); });
            var text = clone.innerText.trim();
            if (!text) return;
            var u = new SpeechSynthesisUtterance(text);
            u.lang = /[؀-ۿ]/.test(text) ? 'ar-EG' : 'en-US';
            u.onend = function () {
                btn.classList.remove('speaking');
                if (speaking === btn) speaking = null;
            };
            speaking = btn;
            btn.classList.add('speaking');
            speechSynthesis.speak(u);
        },
        rate: function (btn, v) {
            fbLog('feedback', { val: v });
            btn.parentElement.querySelectorAll('.rated').forEach(function (b) { b.classList.remove('rated'); });
            btn.classList.add('rated');
            toast(t('thanks'), 'check');
        },
        trackGame: function (name) {
            if (!name) return;
            fbLog('game', { name: ('' + name).trim().slice(0, 60) });
        },
        suggest: function (btn) {
            if (busy) return;
            send(btn.textContent);
        }
    };

    /* ═══════ PLAYLIST PANEL ═══════ */
    function renderPlaylistPanel() {
        var panel = document.getElementById('playlistPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'playlistPanel';
            document.body.appendChild(panel);
        }
        if (!plPanelOpen || playlist.length === 0) {
            panel.className = 'pl-panel pl-hidden';
            // Show floating button if playlist has items
            renderPlaylistBtn();
            return;
        }
        var repeatIcons = {
            none: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
            all: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
            one: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="10" y="14" font-size="8" fill="var(--accent)" stroke="none" font-weight="bold">1</text></svg>'
        };
        var repeatLabel = t('repeatT');
        var html = '<div class="pl-header">'
            + '<div class="pl-header-left"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> ' + t('playlist') + ' <span class="pl-count">' + playlist.length + '</span></div>'
            + '<button class="pl-close" onclick="LORD.plTogglePanel()" title="' + t('close') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
            + '</div>';
        // Controls
        html += '<div class="pl-controls">'
            + '<button class="pl-ctrl-btn" onclick="LORD.plPrev()" title="' + t('prev') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg></button>'
            + '<button class="pl-ctrl-btn pl-ctrl-main" onclick="LORD.plPlay(' + Math.max(plIdx, 0) + ')" title="' + t('play') + '">' + (plActive ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>') + '</button>'
            + '<button class="pl-ctrl-btn" onclick="LORD.plNext()" title="' + t('next') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg></button>'
            + '<button class="pl-ctrl-btn pl-repeat' + (plRepeat !== 'none' ? ' active' : '') + '" onclick="LORD.plToggleRepeat()" title="' + repeatLabel[plRepeat] + '">' + repeatIcons[plRepeat] + '</button>'
            + '</div>';
        // Song list
        html += '<div class="pl-list">';
        for (var i = 0; i < playlist.length; i++) {
            var isActive = (i === plIdx && plActive);
            html += '<div class="pl-item' + (isActive ? ' pl-active' : '') + '" onclick="LORD.plPlay(' + i + ')">'
                + '<span class="pl-item-num">' + (isActive ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)"><polygon points="5 3 19 12 5 21 5 3"/></svg>' : (i + 1)) + '</span>'
                + '<div class="pl-item-info"><div class="pl-item-name">' + esc(playlist[i].name) + '</div><div class="pl-item-artist">' + esc(playlist[i].artist) + '</div></div>'
                + '<button class="pl-item-del" onclick="event.stopPropagation();LORD.plRemove(' + i + ')" title="' + t('del') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
                + '</div>';
        }
        html += '</div>';
        // Footer
        html += '<div class="pl-footer">'
            + '<button class="pl-footer-btn" onclick="LORD.plClear()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> ' + t('clearList') + '</button>'
            + '</div>';
        panel.className = 'pl-panel';
        panel.innerHTML = html;
        renderPlaylistBtn();
    }

    function renderPlaylistBtn() {
        var btn = document.getElementById('playlistFloatBtn');
        if (playlist.length === 0) {
            if (btn) btn.style.display = 'none';
            return;
        }
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'playlistFloatBtn';
            btn.className = 'pl-float-btn';
            btn.onclick = function () { LORD.plTogglePanel(); };
            document.body.appendChild(btn);
        }
        btn.style.display = plPanelOpen ? 'none' : 'flex';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><span class="pl-float-count">' + playlist.length + '</span>';
    }

    /* ═══════ PLAYLIST AUTO-ADVANCE ═══════ */
    function plHandleEnded() {
        if (!plActive || playlist.length === 0 || plIdx < 0) return;
        if (plRepeat === 'one') {
            // Repeat same song
            LORD.plPlay(plIdx);
        } else if (plIdx < playlist.length - 1) {
            // Next song
            LORD.plPlay(plIdx + 1);
        } else if (plRepeat === 'all') {
            // Loop back to first
            LORD.plPlay(0);
        } else {
            // End of playlist, no repeat
            plActive = false;
            plIdx = -1;
            renderPlaylistPanel();
        }
    }

    function initPlaylist() {
        playlist = get('lord_playlist', []);
        plRepeat = get('lord_pl_repeat', 'none');
        // Create hidden audio element for playing songs not visible in chat
        plHiddenAudio = document.createElement('audio');
        plHiddenAudio.id = 'plHiddenAudio';
        plHiddenAudio.preload = 'metadata';
        plHiddenAudio.style.display = 'none';
        plHiddenAudio.addEventListener('ended', function () {
            plHandleEnded();
        });
        document.body.appendChild(plHiddenAudio);
        if (playlist.length > 0) {
            renderPlaylistPanel();
        }
    }


    /* ═══════ FONT SIZE (normal / large / small) ═══════ */
    var fontSize = 'normal';
    function applyFontSize(fs) {
        fontSize = (fs === 'sm' || fs === 'lg') ? fs : 'normal';
        save('lord_fontsize', fontSize);
        var root = document.documentElement;
        root.classList.toggle('fs-sm', fontSize === 'sm');
        root.classList.toggle('fs-lg', fontSize === 'lg');
    }
    function cycleFontSize() {
        var next = fontSize === 'normal' ? 'lg' : (fontSize === 'lg' ? 'sm' : 'normal');
        applyFontSize(next);
        toast(t('fontToast')[next], 'type');
    }

    /* ═══════ DUPLICATE CONVERSATION ═══════ */
    function duplicateConv() {
        var c = active();
        if (!c || !c.msgs.length) { toast(t('noChat')); return; }
        var copy = {
            id: genId(),
            title: c.title + ' • ' + t('copyWord'),
            msgs: JSON.parse(JSON.stringify(c.msgs)),
            ts: Date.now()
        };
        convs.unshift(copy);
        activeId = copy.id;
        saveAll();
        renderList();
        renderChat();
        toast(t('duped'), 'check');
    }

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
        // keep the browser chrome color in sync with the JS-controlled theme
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', t === 'light' ? '#f7f8f4' : '#101413');
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
        var c = { id: genId(), title: t('newChat'), msgs: [], ts: Date.now() };
        convs.unshift(c);
        activeId = c.id;
        saveAll();
        renderList();
        renderChat();
        closeSB();
        el.input.focus();
    }

    /* Games hub — inserted as a local message inside the chat itself */
    function openGamesHub() {
        if (!window.LordGames) return;
        var c = active();
        if (!c) { newConv(); c = active(); }
        var m = { role: 'assistant', content: '[GAMEHUB]', ts: Date.now(), local: true };
        c.msgs.push(m);
        if (c.msgs.length === 1) { c.title = t('actGames'); renderList(); }
        saveAll();
        addMsg(m);
        stickBottom = true;
        scrollBottom(true);
        closeSB();
    }

    /* Temporary (incognito) chat — lives only until the page is closed */
    function newTempConv() {
        var cur = active();
        if (cur && cur.temp && !cur.msgs.length) { toast(t('tempAlready')); return; }
        newConv();
        active().temp = true;
        saveAll();
        renderList();
        renderChat();
        toast(t('tempOn'), 'ghost');
    }

    function switchConv(id) {
        if (window.speechSynthesis) speechSynthesis.cancel();
        activeId = id;
        saveAll();
        renderList();
        renderChat();
        closeSB();
    }

    function deleteConv(id) {
        var idx = -1;
        for (var i = 0; i < convs.length; i++) {
            if (convs[i].id === id) { idx = i; break; }
        }
        if (idx < 0) return;
        var removed = convs[idx];
        convs.splice(idx, 1);
        if (activeId === id) activeId = convs.length ? convs[0].id : null;
        saveAll();
        renderList();
        renderChat();
        toastUndo(t('convDeleted'), function () {
            convs.splice(Math.min(idx, convs.length), 0, removed);
            activeId = removed.id;
            saveAll();
            renderList();
            renderChat();
        });
    }

    function clearAll() {
        if (!convs.length) return;
        var snapConvs = convs, snapActive = activeId;
        convs = []; activeId = null;
        saveAll();
        renderList();
        renderChat();
        toastUndo(t('cleared'), function () {
            convs = snapConvs;
            activeId = snapActive;
            saveAll();
            renderList();
            renderChat();
        });
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

    /* ═══════ AI AUTO TITLE ═══════
       After the first exchange, ask the model for a short smart title
       (fire-and-forget: any failure silently keeps the truncated title) */
    function aiAutoTitle(c, userText, aiText) {
        // nice-to-have request — skip it entirely when the budget is tight
        if (!rlHeadroom(8)) return;
        try {
            rlBump();
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey()
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: 'اكتب عنواناً قصيراً جداً (2 إلى 5 كلمات) يلخص موضوع المحادثة. بنفس لغة المستخدم. أجب بالعنوان فقط — بدون علامات اقتباس أو ترقيم أو شرح.' },
                        { role: 'user', content: (userText || '').slice(0, 500) + '\n---\n' + (aiText || '').slice(0, 400) }
                    ],
                    stream: false,
                    temperature: 0.3,
                    max_tokens: 30
                })
            }).then(function (r) {
                return r.ok ? r.json() : null;
            }).then(function (d) {
                if (!d) return;
                var title = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
                if (!title) return;
                title = title.replace(/["'«»`#*_\n]/g, '').trim();
                if (!title || title.length > 60) return;
                // The conversation may have been deleted meanwhile
                for (var i = 0; i < convs.length; i++) {
                    if (convs[i].id === c.id) {
                        convs[i].title = title;
                        saveAll();
                        renderList();
                        break;
                    }
                }
            }).catch(function () { });
        } catch (e) { }
    }

    /* ═══════ RENDER ═══════ */
    function renderList() {
        if (!convs.length) {
            el.convList.innerHTML = '<div class="sidebar-empty">'
                + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3">'
                + '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
                + '<span>' + t('startNew') + '</span></div>';
            return;
        }
        // Date groups (Today / Yesterday / Last 7 days / Older)
        var now = new Date();
        var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        var startYest = startToday - 86400000;
        var startWeek = startToday - 6 * 86400000;
        function grpOf(ts) {
            if (!ts) return 3;
            if (ts >= startToday) return 0;
            if (ts >= startYest) return 1;
            if (ts >= startWeek) return 2;
            return 3;
        }
        var grpNames = [t('grpToday'), t('grpYest'), t('grpWeek'), t('grpOlder')];

        function itemHTML(c) {
            var pinTitle = c.pin ? t('unpin') : t('pin');
            var pinIco = c.pin
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg>'
                : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/></svg>';
            return '<div class="conv' + (c.id === activeId ? ' on' : '') + (c.temp ? ' conv-ghost' : '') + '" data-cid="' + c.id + '" onclick="LORD.sw(\'' + c.id + '\')">'
                + '<span class="conv-t">' + (c.temp ? icon('ghost', 12) + ' ' : '') + esc(String(c.title).replace(/^(🎮|👻|📌)\s*/, '')) + '</span>'
                + '<button class="conv-pin' + (c.pin ? ' pinned' : '') + '" onclick="LORD.pin(\'' + c.id + '\',event)" title="' + pinTitle + '">' + pinIco + '</button>'
                + '<button class="conv-ren" onclick="LORD.ren(\'' + c.id + '\',event)" title="' + t('rename') + '">'
                + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
                + '</button>'
                + '<button class="conv-x" onclick="LORD.del(\'' + c.id + '\',event)" title="' + t('del') + '">'
                + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                + '</button></div>';
        }

        var pinned = [], rest = [];
        for (var i = 0; i < convs.length; i++) {
            (convs[i].pin ? pinned : rest).push(convs[i]);
        }
        var h = '';
        if (pinned.length) {
            h += '<div class="conv-group">' + icon('pin', 11) + ' ' + t('grpPinned') + '</div>';
            for (var p = 0; p < pinned.length; p++) h += itemHTML(pinned[p]);
        }
        var lastGrp = -1;
        for (var j = 0; j < rest.length; j++) {
            var c = rest[j];
            var g = grpOf(c.ts);
            if (g !== lastGrp) {
                h += '<div class="conv-group">' + grpNames[g] + '</div>';
                lastGrp = g;
            }
            h += itemHTML(c);
        }
        el.convList.innerHTML = h;
        applyConvFilter();
    }

    /* ═══════ CONVERSATION SEARCH ═══════ */
    function applyConvFilter() {
        var cs = $('convSearch');
        if (!cs || !el.convList) return;
        var q = cs.value.trim().toLowerCase();
        el.convList.querySelectorAll('.conv').forEach(function (item) {
            var tEl = item.querySelector('.conv-t');
            var match = !q || (tEl && tEl.textContent.toLowerCase().indexOf(q) !== -1);
            item.style.display = match ? '' : 'none';
        });
        // Hide date labels while searching (flat results)
        el.convList.querySelectorAll('.conv-group').forEach(function (lbl) {
            lbl.style.display = q ? 'none' : '';
        });
    }

    function renderChat() {
        if (window.LordGames) window.LordGames.sweep(); // stop games whose frames are about to be wiped
        var c = active();
        paintTempState(c);
        if (!c || !c.msgs.length) {
            el.welcome.style.display = '';
            el.welcome.classList.remove('none');
            el.messages.innerHTML = (c && c.temp) ? tempBannerHTML() : '';
            return;
        }
        el.welcome.style.display = 'none';
        var h = c.temp ? tempBannerHTML() : '';
        for (var i = 0; i < c.msgs.length; i++) {
            h += msgHTML(c.msgs[i], i === c.msgs.length - 1 && c.msgs[i].role === 'assistant');
        }
        el.messages.innerHTML = h;
        stickBottom = true;
        scrollBottom(true);
    }

    function tempBannerHTML() {
        return '<div class="temp-banner">' + icon('ghost', 14) + ' ' + t('tempBanner') + '</div>';
    }

    function paintTempState(c) {
        var b = $('tempBtn');
        if (b) b.classList.toggle('on', !!(c && c.temp));
    }

    function msgHTML(m, isLastAI) {
        var isU = m.role === 'user';
        var content = isU ? '<p>' + esc(m.content) + '</p>' : md(m.content);
        var av = isU ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' : 'L';
        var timeAttr = m.ts ? ' title="' + new Date(m.ts).toLocaleString(LANG === 'en' ? 'en-US' : 'ar-EG') + '"' : '';
        var inner;
        if (isU) {
            var uActs = '<div class="msg-acts msg-acts-u">'
                + '<button class="act-btn" onclick="LORD.copyMsg(this)" title="' + t('copy') + '">' + COPY_SVG + '</button>'
                + '<button class="act-btn" onclick="LORD.editMsg(this)" title="' + t('edit') + '">' + EDIT_SVG + '</button>'
                + '</div>';
            inner = '<div class="body" dir="auto">' + content + '</div>' + uActs;
        } else if (/^[⚠⏳]/.test(m.content)) {
            // stored error toasts keep their prefix in storage (API-filter contract) but render clean
            var isRate = m.content.charAt(0) === '⏳';
            inner = '<div class="body" dir="auto"><div class="msg-error">' + icon(isRate ? 'clock' : 'warn', 16)
                + '<span>' + esc(m.content.replace(/^[⚠⏳]\uFE0F?\s*/, '')) + '</span></div></div>';
        } else {
            // local system messages (games hub / room join) get no copy/regen/rate bar
            inner = '<div class="body" dir="auto">' + content + (m.local ? '' : aiActsHTML(isLastAI)) + '</div>';
        }
        return '<div class="msg ' + (isU ? 'msg-u' : 'msg-a') + '"' + timeAttr + '>'
            + '<div class="msg-in">'
            + '<div class="avatar">' + av + '</div>'
            + inner
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

    function scrollBottom(force) {
        if (!force && !stickBottom) return;
        requestAnimationFrame(function () {
            el.chatArea.scrollTop = el.chatArea.scrollHeight;
        });
    }

    /* ═══════ API ═══════ */
    var MAX_HISTORY = 16;      // send at most the last N messages (older context rarely helps)
    var MAX_MSG_CHARS = 6000;  // trim pathologically long single messages

    function trimForApi(text) {
        if (!text || text.length <= MAX_MSG_CHARS) return text;
        // Keep the head (context/question) and the tail (latest details)
        return text.slice(0, 3400) + '\n[…تم اختصار جزء طويل من الرسالة…]\n' + text.slice(-2200);
    }

    /* ── Per-user rate limiting ──
       The whole site shares ONE Google free-tier key (15 RPM / 500 RPD total),
       so each browser gets a local budget to keep one heavy user from burning
       the shared day quota. State in lord_rl, resets at local midnight. */
    var RL_PER_MIN = 4;    // user requests per rolling minute
    var RL_PER_DAY = 40;   // user requests per local day
    var rlCoolUntil = 0;   // hard cooldown after a real 429 from Google

    function rlToday() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }
    function rlLoad() {
        var s = get('lord_rl', null);
        if (!s || s.d !== rlToday()) s = { d: rlToday(), n: 0, m: [] };
        if (!s.m) s.m = [];
        return s;
    }
    function rlBump() {
        var s = rlLoad();
        s.n++;
        s.m.push(Date.now());
        while (s.m.length && Date.now() - s.m[0] > 60000) s.m.shift();
        save('lord_rl', s);
    }
    function rlCheck() {
        var now = Date.now();
        if (now < rlCoolUntil) return { ok: false, wait: Math.ceil((rlCoolUntil - now) / 1000) };
        var s = rlLoad();
        if (s.n >= RL_PER_DAY) return { ok: false, day: true };
        var recent = [];
        for (var i = 0; i < s.m.length; i++) if (now - s.m[i] <= 60000) recent.push(s.m[i]);
        if (recent.length >= RL_PER_MIN) {
            return { ok: false, wait: Math.max(1, Math.ceil((60000 - (now - recent[0])) / 1000)) };
        }
        return { ok: true, left: RL_PER_DAY - s.n };
    }
    /* one analytics write per block-kind per day (visible in the admin errors) */
    function rlLogBlock(kind) {
        var s = rlLoad();
        var flag = 'b_' + kind;
        if (s[flag]) return;
        s[flag] = 1;
        save('lord_rl', s);
        try { trackError('rl_block_' + kind); } catch (e) { }
    }
    /* gate user-facing sends: blocked → toast, typed text stays in the box */
    function rlGate() {
        var r = rlCheck();
        if (r.ok) {
            // heads-up shortly before the daily wall (left counts BEFORE this send)
            if (r.left === 6) toast(t('rlNear').replace('{n}', '5'), 'warn');
            return true;
        }
        if (r.day) {
            toast(t('rlDay').replace('{n}', '' + RL_PER_DAY), 'clock');
            rlLogBlock('day');
        } else {
            toast(t('rlMin').replace('{s}', '' + r.wait), 'clock');
            rlLogBlock('min');
        }
        return false;
    }
    /* headroom for optional background calls (auto-title) — never spend the
       user's last messages or the shared quota on nice-to-haves */
    function rlHeadroom(min) {
        var r = rlCheck();
        return !!(r.ok && r.left > (min || 8));
    }

    function callAPI(msgs) {
        var recent = msgs.slice(-MAX_HISTORY);
        var contents = [{ role: 'system', content: buildSystemPrompt(recent) }];
        for (var i = 0; i < recent.length; i++) {
            var m = recent[i];
            if (!m.content) continue;
            // Local UI messages (games hub / room join) are not conversation content
            if (m.local) continue;
            // Stored error toasts (⚠️/⏳) waste tokens and confuse the model — skip them
            if (m.role === 'assistant' && /^[⚠⏳]/.test(m.content)) continue;
            contents.push({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: trimForApi(m.content)
            });
        }

        rlBump(); // one user action = one budget unit (key-failover retries are free)

        var triedKeys = 0;
        function attempt() {
            ctrl = new AbortController();
            return fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey()
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
            }).then(function (res) {
                if (!res.ok) {
                    return res.json().catch(function () { return {}; }).then(function (err) {
                        var msg = err && err.error ? err.error.message : t('errConn') + ' (HTTP ' + res.status + ')';
                        // quota hit on this key → fail over to the next key transparently
                        if (triedKeys < API_KEYS.length - 1
                            && (res.status === 429 || /rate|quota|exhaust/i.test(msg))) {
                            triedKeys++;
                            rotateKey();
                            return attempt();
                        }
                        throw new Error(msg);
                    });
                }
                return res;
            });
        }
        return attempt();
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
            return reader.read().then(function (result) {
                if (result.done) {
                    if (renderTimer) clearTimeout(renderTimer);
                    bodyEl.classList.remove('typing');
                    bodyEl.innerHTML = md(full) + aiActsHTML(true);
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
                    } catch (e) { }
                }

                if (changed && !renderTimer) {
                    renderTimer = setTimeout(function () {
                        renderTimer = null;
                        renderContent();
                    }, 30);
                }

                return pump();
            });
        }

        return pump().catch(function (e) {
            if (renderTimer) clearTimeout(renderTimer);
            bodyEl.classList.remove('typing');
            if (e.name === 'AbortError') {
                full += '\n\n' + t('stopped');
            } else {
                throw e;
            }
            bodyEl.innerHTML = md(full) + aiActsHTML(false);
            return full;
        });
    }

    /* ═══════ ERROR HANDLING ═══════ */
    function handleError(err, c) {
        var errText = '⚠️ ' + (err.message || t('errUnknown'));
        // Google rate/quota errors → friendly message + 30s local cooldown so
        // rapid retries don't keep burning the shared key
        if (err.message && /rate|429|quota|exhaust/i.test(err.message)) {
            errText = t('errRate');
            rlCoolUntil = Date.now() + 30000;
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
        if (window.speechSynthesis) speechSynthesis.cancel();

        var c = active();
        if (!c) { newConv(); c = active(); }

        // Smart room-code handling: typing a game code (G-ABCD) joins the room
        // right inside the chat — no API call needed.
        // The dash is required so normal words (e.g. "games") never match.
        var joinM = /^(?:انضم\s*|ادخل\s*|join\s*)?(G-[A-Z2-9]{4})$/i.exec(text);
        if (joinM && window.LordGames) {
            var code = window.LordGames.normalizeCode(joinM[1]);
            if (code) {
                var uMsg = { role: 'user', content: text, ts: Date.now() };
                c.msgs.push(uMsg);
                addMsg(uMsg);
                var jMsg = { role: 'assistant', content: '[GAMEJOIN:' + code + ']', ts: Date.now(), local: true };
                c.msgs.push(jMsg);
                if (c.msgs.length === 2) { c.title = code; renderList(); }
                saveAll();
                var jNode = addMsg(jMsg);
                el.input.value = '';
                resizeInput();
                updateSend();
                stickBottom = true;
                scrollBottom(true);
                // the user explicitly asked to join — mount immediately
                var fr = jNode.querySelector('.game-frame');
                if (fr) window.LordGames.mountJoin(fr, code);
                return;
            }
        }

        // per-user budget: blocked → toast only, the typed text stays in the box
        if (!rlGate()) return;

        var userMsg = { role: 'user', content: text, ts: Date.now() };
        c.msgs.push(userMsg);
        stickBottom = true;

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

        callAPI(c.msgs).then(function (res) {
            hideDots();
            var aiMsg = { role: 'assistant', content: '', ts: Date.now() };
            var node = addMsg(aiMsg);
            return readStream(res, node).then(function (txt) {
                aiMsg.content = txt;
                c.msgs.push(aiMsg);
                saveAll();
                trackMessage('assistant', txt, Date.now() - sendTime);
                logMissingFromReply(txt);
                if (c.msgs.length === 2) aiAutoTitle(c, text, txt);
            });
        }).catch(function (err) {
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

    /* ═══════ EXPORT CHAT ═══════ */
    function exportChat() {
        var c = active();
        if (!c || !c.msgs.length) { toast(t('noChat')); return; }
        var lines = ['# ' + c.title, ''];
        for (var i = 0; i < c.msgs.length; i++) {
            var m = c.msgs[i];
            lines.push('**' + (m.role === 'user' ? t('youWord') : 'LORD AI') + ':**');
            lines.push(m.content);
            lines.push('');
        }
        var blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'lord-chat-' + new Date().toISOString().slice(0, 10) + '.md';
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        toast(t('exported'), 'check');
    }

    /* ═══════ SHORTCUTS MODAL ═══════ */
    function toggleShortcuts(show) {
        var m = $('shortcutsModal');
        if (!m) return;
        if (show === undefined) show = m.classList.contains('none');
        m.classList.toggle('none', !show);
    }

    /* ═══════ PERSONALIZE (CUSTOM INSTRUCTIONS) ═══════ */
    function toggleCi(show) {
        var m = $('ciModal');
        if (!m) return;
        if (show === undefined) show = m.classList.contains('none');
        m.classList.toggle('none', !show);
        if (show) {
            $('ciName').value = customCfg.name || '';
            $('ciAbout').value = customCfg.about || '';
            $('ciExtra').value = customCfg.extra || '';
            setTimeout(function () { $('ciName').focus(); }, 60);
        }
    }

    function saveCi() {
        customCfg = {
            name: $('ciName').value.trim(),
            about: $('ciAbout').value.trim(),
            extra: $('ciExtra').value.trim()
        };
        save('lord_custom', customCfg);
        toggleCi(false);
        toast(t('ciSaved'), 'check');
    }

    /* ═══════ REPLY STYLE (concise / balanced / detailed) ═══════ */
    function paintStyleChips() {
        document.querySelectorAll('.style-chip').forEach(function (b) {
            b.classList.toggle('on', b.getAttribute('data-style') === replyStyle);
        });
    }

    function setStyle(s) {
        replyStyle = s;
        save('lord_style', s);
        paintStyleChips();
        toast(t('styleToast')[s], s === 'concise' ? 'bolt' : s === 'detailed' ? 'book' : 'scale');
    }

    /* ═══════ COMMAND PALETTE (Ctrl+K) ═══════ */
    var ckItems = [];
    var ckSel = 0;

    var CK_CHAT_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var CK_BOLT_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

    function ckActionList() {
        return [
            { label: t('newChat'), run: newConv },
            { label: t('actTemp'), run: newTempConv },
            { label: t('actGames'), run: openGamesHub },
            { label: t('actTheme'), run: toggleTheme },
            { label: t('actLang'), run: toggleLang },
            { label: t('actFont'), run: cycleFontSize },
            { label: t('actExport'), run: exportChat },
            { label: t('actDupe'), run: duplicateConv },
            { label: t('actPersonalize'), run: function () { toggleCi(true); } },
            { label: t('actShortcuts'), run: function () { toggleShortcuts(true); } },
            { label: t('actClearAll'), run: clearAll, danger: true }
        ];
    }

    function ckToggle(show) {
        var m = $('ckModal');
        if (!m) return;
        if (show === undefined) show = m.classList.contains('none');
        m.classList.toggle('none', !show);
        if (show) {
            var inp = $('ckInput');
            inp.value = '';
            ckBuild('');
            setTimeout(function () { inp.focus(); }, 40);
        }
    }

    function ckBuild(q) {
        q = q.trim().toLowerCase();
        ckItems = [];
        ckSel = 0;
        var list = $('ckList');
        if (!list) return;

        // Matching chats: by title, or full-text inside messages when a query exists
        var matches = [];
        for (var i = 0; i < convs.length && matches.length < 10; i++) {
            var c = convs[i];
            var snippet = '';
            var hit = !q || c.title.toLowerCase().indexOf(q) !== -1;
            if (!hit && q) {
                for (var m = 0; m < c.msgs.length; m++) {
                    var body = (c.msgs[m].content || '');
                    var at = body.toLowerCase().indexOf(q);
                    if (at !== -1) {
                        hit = true;
                        snippet = body.substring(Math.max(0, at - 18), at + 62).replace(/\s+/g, ' ').trim();
                        break;
                    }
                }
            }
            if (hit) matches.push({ conv: c, snippet: snippet });
        }
        var actions = ckActionList().filter(function (a) {
            return !q || a.label.toLowerCase().indexOf(q) !== -1;
        });
        if (!q) matches = matches.slice(0, 5);

        var html = '';
        function pushItem(icon, title, sub, run, danger) {
            ckItems.push({ run: run });
            html += '<button class="ck-item' + (danger ? ' ck-danger' : '') + '" data-i="' + (ckItems.length - 1) + '">'
                + '<span class="ck-ico">' + icon + '</span>'
                + '<span class="ck-item-t">' + esc(title)
                + (sub ? '<small>' + esc(sub) + '</small>' : '')
                + '</span></button>';
        }

        // With a query, chats come first (search feel); otherwise actions first
        function chatsSection() {
            if (!matches.length) return;
            html += '<div class="ck-sec">' + t('ckChats') + '</div>';
            matches.forEach(function (m2) {
                pushItem(CK_CHAT_SVG, m2.conv.title, m2.snippet, (function (id) {
                    return function () { switchConv(id); };
                })(m2.conv.id));
            });
        }
        function actionsSection() {
            if (!actions.length) return;
            html += '<div class="ck-sec">' + t('ckActions') + '</div>';
            actions.forEach(function (a) {
                pushItem(CK_BOLT_SVG, a.label, '', a.run, a.danger);
            });
        }
        if (q) { chatsSection(); actionsSection(); }
        else { actionsSection(); chatsSection(); }

        if (!ckItems.length) html = '<div class="ck-empty">' + t('ckEmpty') + '</div>';
        list.innerHTML = html;
        ckPaint();
    }

    function ckPaint() {
        var items = document.querySelectorAll('.ck-item');
        items.forEach(function (n, i) {
            n.classList.toggle('sel', i === ckSel);
        });
        var cur = items[ckSel];
        if (cur) cur.scrollIntoView({ block: 'nearest' });
    }

    function ckRun(i) {
        if (!ckItems[i]) return;
        ckToggle(false);
        ckItems[i].run();
    }

    /* ═══════ QUOTE SELECTED TEXT ═══════ */
    var quotePop = null;
    var QUOTE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>';

    function hideQuotePop() {
        if (quotePop) { quotePop.remove(); quotePop = null; }
    }

    function maybeShowQuote() {
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;
        var txt = sel.toString().trim();
        if (txt.length < 2 || txt.length > 1500) return;
        var n = sel.anchorNode;
        var elem = n && (n.nodeType === 1 ? n : n.parentElement);
        if (!elem || !elem.closest || !elem.closest('.msg .body')) return;
        var rect = sel.getRangeAt(0).getBoundingClientRect();

        hideQuotePop();
        quotePop = document.createElement('div');
        quotePop.className = 'quote-pop';

        var qb = document.createElement('button');
        qb.innerHTML = QUOTE_SVG + ' ' + t('quote');
        qb.addEventListener('click', function () {
            var quoted = txt.split('\n').map(function (l) { return '> ' + l; }).join('\n') + '\n\n';
            el.input.value = quoted + el.input.value;
            resizeInput();
            updateSend();
            el.input.focus();
            el.input.setSelectionRange(el.input.value.length, el.input.value.length);
            hideQuotePop();
            window.getSelection().removeAllRanges();
        });

        var cb = document.createElement('button');
        cb.innerHTML = COPY_SVG + ' ' + t('copy');
        cb.addEventListener('click', function () {
            navigator.clipboard.writeText(txt).then(function () { toast(t('copied'), 'check'); });
            hideQuotePop();
            window.getSelection().removeAllRanges();
        });

        quotePop.appendChild(qb);
        quotePop.appendChild(cb);
        document.body.appendChild(quotePop);

        var w = quotePop.offsetWidth;
        var left = rect.left + rect.width / 2 - w / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
        var top = rect.top - quotePop.offsetHeight - 8;
        if (top < 8) top = rect.bottom + 8;
        quotePop.style.left = left + 'px';
        quotePop.style.top = top + 'px';
    }

    function initQuote() {
        document.addEventListener('mouseup', function (e) {
            if (quotePop && quotePop.contains(e.target)) return;
            setTimeout(maybeShowQuote, 10);
        });
        document.addEventListener('mousedown', function (e) {
            if (quotePop && !quotePop.contains(e.target)) hideQuotePop();
        });
        el.chatArea.addEventListener('scroll', hideQuotePop);
    }

    /* ═══════ VOICE INPUT ═══════ */
    var recog = null, recActive = false;
    function initMic() {
        var micBtn = $('micBtn');
        if (!micBtn) return;
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { micBtn.style.display = 'none'; return; }
        recog = new SR();
        recog.interimResults = false;
        recog.maxAlternatives = 1;
        recog.onresult = function (e) {
            var txt = e.results[0][0].transcript;
            el.input.value = (el.input.value ? el.input.value + ' ' : '') + txt;
            resizeInput();
            updateSend();
            el.input.focus();
        };
        recog.onend = function () { recActive = false; micBtn.classList.remove('rec'); };
        recog.onerror = function () { recActive = false; micBtn.classList.remove('rec'); };
        micBtn.addEventListener('click', function () {
            if (recActive) { recog.stop(); return; }
            recog.lang = LANG === 'en' ? 'en-US' : 'ar-EG';
            try {
                recog.start();
                recActive = true;
                micBtn.classList.add('rec');
                toast(t('listening'), 'mic');
            } catch (e) { }
        });
    }

    /* ═══════ EVENTS ═══════ */
    function bind() {
        el.openSidebar.addEventListener('click', openSB);
        el.closeSidebar.addEventListener('click', closeSB);
        el.overlay.addEventListener('click', closeSB);
        el.newChatBtn.addEventListener('click', newConv);
        el.clearBtn.addEventListener('click', clearAll);
        el.themeBtn.addEventListener('click', toggleTheme);

        // Games hub — opens inline inside the chat
        var gamesBtn = $('gamesBtn');
        if (gamesBtn) gamesBtn.addEventListener('click', openGamesHub);

        // "More" overflow menu (temp chat / personalize / lang / font / export / shortcuts)
        var moreBtn = $('moreBtn'), moreMenu = $('moreMenu');
        function closeMore() { if (moreMenu) moreMenu.classList.add('none'); }
        if (moreBtn && moreMenu) {
            moreBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                moreMenu.classList.toggle('none');
            });
            document.addEventListener('click', function (e) {
                if (!moreMenu.classList.contains('none') && !moreMenu.contains(e.target)) closeMore();
            });
            var miMap = {
                miTemp: newTempConv,
                miPersonalize: function () { toggleCi(true); },
                miLang: toggleLang,
                miFont: cycleFontSize,
                miExport: exportChat,
                miShortcuts: function () { toggleShortcuts(true); }
            };
            Object.keys(miMap).forEach(function (id) {
                var b = $(id);
                if (b) b.addEventListener('click', function () { closeMore(); miMap[id](); });
            });
        }

        // Shortcuts modal
        var closeShortcuts = $('closeShortcuts');
        if (closeShortcuts) closeShortcuts.addEventListener('click', function () { toggleShortcuts(false); });
        var scModal = $('shortcutsModal');
        if (scModal) scModal.addEventListener('click', function (e) {
            if (e.target === scModal) toggleShortcuts(false);
        });

        // Personalize modal
        var closeCi = $('closeCi');
        if (closeCi) closeCi.addEventListener('click', function () { toggleCi(false); });
        var ciModal = $('ciModal');
        if (ciModal) ciModal.addEventListener('click', function (e) {
            if (e.target === ciModal) toggleCi(false);
        });
        var ciSave = $('ciSave');
        if (ciSave) ciSave.addEventListener('click', saveCi);
        var ciClear = $('ciClear');
        if (ciClear) ciClear.addEventListener('click', function () {
            $('ciName').value = ''; $('ciAbout').value = ''; $('ciExtra').value = '';
            customCfg = { name: '', about: '', extra: '' };
            save('lord_custom', customCfg);
            toast(t('ciClearedT'));
        });

        // Reply style chips
        document.querySelectorAll('.style-chip').forEach(function (b) {
            b.addEventListener('click', function () {
                setStyle(b.getAttribute('data-style'));
            });
        });

        // Command palette
        var searchBtn = $('searchBtn');
        if (searchBtn) searchBtn.addEventListener('click', function () { ckToggle(true); });
        var ckModal = $('ckModal');
        if (ckModal) ckModal.addEventListener('click', function (e) {
            if (e.target === ckModal) ckToggle(false);
        });
        var ckInput = $('ckInput');
        if (ckInput) {
            // debounce: full-text search over all messages is too heavy per keystroke
            var ckDeb = null;
            ckInput.addEventListener('input', function () {
                if (ckDeb) clearTimeout(ckDeb);
                ckDeb = setTimeout(function () { ckBuild(ckInput.value); }, 110);
            });
            ckInput.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowDown') { e.preventDefault(); if (ckSel < ckItems.length - 1) ckSel++; ckPaint(); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); if (ckSel > 0) ckSel--; ckPaint(); }
                else if (e.key === 'Enter') { e.preventDefault(); ckRun(ckSel); }
            });
        }
        var ckList = $('ckList');
        if (ckList) ckList.addEventListener('click', function (e) {
            var it = e.target.closest('.ck-item');
            if (it) ckRun(+it.getAttribute('data-i'));
        });

        // Conversation search
        var convSearch = $('convSearch');
        if (convSearch) convSearch.addEventListener('input', applyConvFilter);

        // Scroll-to-bottom button
        var scrollBtn = $('scrollBtn');
        if (scrollBtn) {
            el.chatArea.addEventListener('scroll', function () {
                var gap = el.chatArea.scrollHeight - el.chatArea.scrollTop - el.chatArea.clientHeight;
                scrollBtn.classList.toggle('show', gap > 240);
                // Smart auto-scroll: stop following the stream once the user scrolls up
                stickBottom = gap < 140;
            });
            scrollBtn.addEventListener('click', function () {
                stickBottom = true;
                el.chatArea.scrollTo({ top: el.chatArea.scrollHeight, behavior: 'smooth' });
            });
        }

        el.sendBtn.addEventListener('click', function () { send(el.input.value); });
        el.stopBtn.addEventListener('click', function () { if (ctrl) ctrl.abort(); });

        el.input.addEventListener('input', function () { resizeInput(); updateSend(); });
        el.input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (el.input.value.trim() && !busy) send(el.input.value);
            }
        });

        // Prompt cards (a data-game card opens the games hub instead of sending)
        var cards = document.querySelectorAll('.prompt-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('click', function () {
                if (this.hasAttribute('data-game')) {
                    openGamesHub();
                    return;
                }
                var q = this.getAttribute('data-q');
                if (q) { el.input.value = q; send(q); }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (el.sidebar.classList.contains('open')) closeSB();
                toggleShortcuts(false);
                toggleCi(false);
                ckToggle(false);
                hideQuotePop();
                closeMore();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'N') { e.preventDefault(); newConv(); }
            if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); ckToggle(); return; }
            if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
                e.preventDefault();
                openGamesHub();
                return;
            }
            if (e.ctrlKey && e.key === '/') { e.preventDefault(); toggleShortcuts(); return; }
            if (e.key === '/' && document.activeElement !== el.input && !busy) {
                var typing = document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
                if (!typing) {
                    e.preventDefault();
                    el.input.focus();
                }
            }
        });

        window.addEventListener('resize', function () { resizeInput(); });
    }

    /* ═══════ INIT ═══════ */
    function init() {
        cacheDom();
        applyLang(get('lord_lang', 'ar'));
        initTheme();
        applyFontSize(get('lord_fontsize', 'normal'));
        initFirebase();
        loadConvs();
        customCfg = get('lord_custom', { name: '', about: '', extra: '' });
        replyStyle = get('lord_style', 'normal');
        trackPageView();
        renderList();
        renderChat();
        bind();
        paintStyleChips();
        initQuote();
        initPlaylist();
        initMic();
        updateSend();
        setTimeout(function () { if (el.input) el.input.focus(); }, 200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
