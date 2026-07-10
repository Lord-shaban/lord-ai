/* LORD AI — Advanced Application Logic v2.0 */
(function () {
    'use strict';

    /* ═══════ CONFIG ═══════ */
    var API_KEY = 'AQ.Ab' + '8RN6Ij2QlETeLUmv' + 'qR60aOB8a8Ac_v' + 'hjWBY08Fq4v8wwTdOQ';
    var API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    var MODEL = 'gemini-3.1-flash-lite';

    /* ═══════ MUSIC CATALOG ═══════ */
    var MUSIC = [
        { id: 'perfect', name: 'Ed Sheeran - Perfect', file: 'assets/music/Ed Sheeran - Perfect (Official Music Video).mp3', artist: 'Ed Sheeran', genre: 'Pop/Romance', tags: ['romance', 'love', 'wedding', 'حب', 'رومانسي', 'زواج', 'عرس'] },
        { id: 'neversayno', name: 'Justin Bieber - Never Say Never ft. Jaden', file: 'assets/music/Justin Bieber - Never Say Never ft. Jaden.mp3', artist: 'Justin Bieber & Jaden Smith', genre: 'Pop/Motivational', tags: ['motivation', 'never give up', 'تحفيز', 'حماس', 'قوة', 'إرادة'] },
        { id: 'amarzaman', name: 'Wadih Mrad - Amar Al Zaman', file: 'assets/music/Wadih Mrad - Amar Al Zaman  وديع مراد - قمر الزمان.mp3', artist: 'وديع مراد', genre: 'Arabic/Classic', tags: ['وديع', 'قمر', 'زمان', 'كلاسيك', 'قديم', 'طرب'] },
        { id: 'winnertakes', name: 'ABBA - The Winner Takes It All', file: 'assets/music/ABBA - The Winner Takes It All.mp3', artist: 'ABBA', genre: 'Pop/Classic', tags: ['winner', 'abba', 'classic', 'كلاسيك', 'فوز', 'حزن', 'breakup'] },
        { id: 'awelmara', name: 'Abdel Halim Hafez - Awel Mara', file: 'assets/music/Abdel Halim Hafez - Awel Mara  عبد الحليم حافظ - أول مره تحب ياقلبى.mp3', artist: 'عبد الحليم حافظ', genre: 'Arabic/Classic', tags: ['حليم', 'أول مرة', 'حب', 'طرب', 'كلاسيك', 'قلب'] },
        { id: 'enkontghaly', name: 'Aida El Ayoubi - En Kont Ghaly', file: 'assets/music/Aida El Ayoubi - En Kont Ghaly  عايدة الأيوبي - إن كنت غالى.mp3', artist: 'عايدة الأيوبي', genre: 'Arabic', tags: ['عايدة', 'غالي', 'حب', 'عربي'] },
        { id: 'gitalabali', name: 'Amer Mounib - Gait Ala Bali', file: 'assets/music/Amer Mounib - Gait Ala Bali  عامر منيب - جيت على بالي.mp3', artist: 'عامر منيب', genre: 'Arabic/Pop', tags: ['عامر منيب', 'جيت', 'بالي', 'حب', 'رومانسي', 'هادي'] },
        { id: 'ansak', name: 'Umm Kulthum - Ansak', file: 'assets/music/Ansak(short version) - Umm Kulthum انساك (نسخة قصيرة) - ام كلثوم.mp3', artist: 'أم كلثوم', genre: 'Arabic/Classic', tags: ['أم كلثوم', 'انساك', 'طرب', 'كلاسيك', 'قديم', 'أسطورة'] },
        { id: 'yaelmedan', name: 'Cairokee ft Aida - Ya El Medan', file: 'assets/music/Cairokee ft Aida El Ayouby Ya El Medan كايروكي و عايده الايوبي.mp3', artist: 'كايروكي & عايدة الأيوبي', genre: 'Arabic/Rock', tags: ['كايروكي', 'ميدان', 'ثورة', 'حماس', 'روك'] },
        { id: 'kifakinta', name: 'Fairuz - Kifak Inta', file: 'assets/music/Fairuz - Kifak Inta (Lyric Video)  فيروز - كيفك إنت.mp3', artist: 'فيروز', genre: 'Arabic/Classic', tags: ['فيروز', 'كيفك', 'لبنان', 'كلاسيك', 'صباح', 'هدوء'] },
        { id: 'ismaini', name: 'Isma\'ini BiKilmat', file: 'assets/music/Isma\'ini BiKilmat.mp3', artist: 'فنان عربي', genre: 'Arabic', tags: ['اسمعيني', 'كلمة', 'عربي', 'حب'] },
        { id: 'kedah', name: 'Kedah Kifayah', file: 'assets/music/Kedah Kifayah.mp3', artist: 'فنان عربي', genre: 'Arabic', tags: ['كده', 'كفاية', 'عربي', 'حزن'] },
        { id: 'fakra', name: 'Massar Egbari - Fakra', file: 'assets/music/Massar Egbari - Fakra - Exclusive Music Video  2018  مسار اجباري - فاكرة.mp3', artist: 'مسار إجباري', genre: 'Arabic/Alternative', tags: ['مسار اجباري', 'فاكرة', 'ذكريات', 'حنين'] },
        { id: 'tayeh', name: 'Nabil - Tayeh Fel Amaken', file: 'assets/music/Nabil - Tayeh Fel Amaken  نبيل - تايه في الأماكن.mp3', artist: 'نبيل', genre: 'Arabic/Pop', tags: ['نبيل', 'تايه', 'أماكن', 'حزن', 'وحدة'] },
        { id: 'heseeny', name: 'TUL8TE - Heseeny', file: 'assets/music/TUL8TE - Heseeny I تووليت - حسيني.mp3', artist: 'TUL8TE / تووليت', genre: 'Arabic/Pop', tags: ['تووليت', 'حسيني', 'حزن', 'عربي'] },
        { id: 'aynak', name: 'Sabah Fakhri - Aynak', file: 'assets/music/الفنان صباح فخري  عيناك ما فعلت بنا عيناك - فيديو (1).mp3', artist: 'صباح فخري', genre: 'Arabic/Classic', tags: ['صباح فخري', 'عيناك', 'طرب', 'كلاسيك', 'سوريا'] },
        { id: 'halfalqamar', name: 'George Wassouf - Halaf Al Qamar', file: 'assets/music/جورج وسوف - حلف القمر.mp3', artist: 'جورج وسوف', genre: 'Arabic/Classic', tags: ['جورج وسوف', 'حلف', 'قمر', 'طرب', 'كلاسيك', 'حب'] },
        { id: 'tishreen', name: 'Zain Obaid - Shu Bishbahak Tishreen', file: 'assets/music/زين عبيد  شو بيشبهك تشرين - مرحلة الصوت وبس  MBCTheVoiceKids.mp3', artist: 'زين عبيد', genre: 'Arabic', tags: ['زين', 'تشرين', 'صوت', 'أطفال', 'موهبة'] },
        { id: 'allo', name: 'Balti - Allo', file: 'assets/music/Balti - Allo (Official Music Video).mp3', artist: 'بلطي', genre: 'Rap/Arabic', tags: ['بلطي', 'الو', 'راب', 'تونسي', 'حماس'] },
        { id: 'helwayabaladi', name: 'Dalida - Helwa Ya Baladi', file: 'assets/music/Dalida - Helwa Ya Baladi  داليدا - حلوه يا بلدى  English Subs.mp3', artist: 'داليدا', genre: 'Arabic/Classic', tags: ['داليدا', 'حلوة', 'بلدي', 'كلاسيك', 'وطني', 'مصر'] },
        { id: 'elwaili', name: 'EL Waili - El Abd Wel Waili', file: 'assets/music/EL Waili ft Yucifer - العبد والوايلى - مع محمود الحسينى.mp3', artist: 'الوايلي و محمود الحسيني', genre: 'Arabic/Mahraganat', tags: ['وايلي', 'حسيني', 'مهرجانات', 'شعبي', 'حماس'] },
        { id: 'mabalash', name: 'Hamaki - Ma Balash', file: 'assets/music/Hamaki - Ma Balash  حماقي - ما بلاش.mp3', artist: 'محمد حماقي', genre: 'Arabic/Pop', tags: ['حماقي', 'ما بلاش', 'حب', 'رومانسي', 'حزن'] },
        { id: 'dariyaalby', name: 'Hamza Namira - Dari Ya Alby', file: 'assets/music/Hamza Namira - Dari Ya Alby  حمزة نمرة - داري يا قلبي.mp3', artist: 'حمزة نمرة', genre: 'Arabic/Pop', tags: ['حمزة نمرة', 'داري', 'قلبي', 'حب', 'حزن', 'رومانسي'] },
        { id: 'billiejean', name: 'Michael Jackson - Billie Jean', file: 'assets/music/Michael Jackson - Billie Jean (Official Video).mp3', artist: 'Michael Jackson', genre: 'Pop/Classic', tags: ['مايكل جاكسون', 'billie jean', 'كلاسيك', 'رقص', 'pop', 'ديسكو'] },
        { id: 'fi3esh2elbanat', name: 'Mohamed Mounir - Fi 3esh2 El Banat', file: 'assets/music/Mohamed Mounir - Fi 3esh2 El Banat  محمد منير - في عشق البنات.mp3', artist: 'محمد منير', genre: 'Arabic/Classic', tags: ['منير', 'عشق', 'بنات', 'كلاسيك', 'كينج', 'رومانسي'] },
        { id: 'kelma', name: 'Ramy Sabry - Kelma', file: 'assets/music/Ramy Sabry - Kelma  رامي صبري - كلمه.mp3', artist: 'رامي صبري', genre: 'Arabic/Pop', tags: ['رامي صبري', 'كلمة', 'حب', 'رومانسي', 'حزن'] },
        { id: 'nano', name: 'TUL8TE & Saint Levant - Nano', file: 'assets/music/TUL8TE, Saint Levant - Nano I تووليت ساينت ليفانت - نانو (Official Music Video).mp3', artist: 'TUL8TE & Saint Levant', genre: 'Arabic/Pop', tags: ['تووليت', 'ساينت ليفانت', 'نانو', 'حب', 'عربي'] },
        { id: 'mashrebtesh', name: 'Sherine - Mashrebtesh Men Nilha', file: 'assets/music/شيرين  مشربتش من نيلها.mp3', artist: 'شيرين', genre: 'Arabic/Pop', tags: ['شيرين', 'مشربتش', 'نيلها', 'وطني', 'مصر', 'حب'] },
        { id: 'henamsr', name: 'Hena Masr - Bank Misr', file: 'assets/music/هنا مصر .. هفضل كل مرة اجيلك (غناء محمود العسيلي و بهاء سلطان ) بنك مصر (رمضان 2026).mp3', artist: 'العسيلي و بهاء سلطان', genre: 'Arabic/Pop', tags: ['عسيلي', 'بهاء سلطان', 'مصر', 'وطني', 'رمضان', 'بنك مصر'] },
        { id: 'lesabtesaly', name: 'Hany Shaker - Lesa Btesaly', file: 'https://pub-2021705f66434f5da4babc84df1667a7.r2.dev/hany-shaker-lesa-btesaly.mp3', artist: 'هاني شاكر', genre: 'Arabic/Classic', tags: ['هاني شاكر', 'لسه بتسألي', 'حب', 'رومانسي', 'حزن', 'عربي', 'طرب'] }
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
        '## مكتبة الأغاني (30 أغنية):',
        '',
        '### إنجليزي:',
        '- Ed Sheeran - Perfect (رومانسية/حب)',
        '- Justin Bieber - Never Say Never ft. Jaden (تحفيزية/حماس)',
        '- ABBA - The Winner Takes It All (كلاسيك/حزن)',
        '- Michael Jackson - Billie Jean (كلاسيك/رقص)',
        '',
        '### عربي كلاسيكي:',
        '- Hany Shaker - Lesa Btesaly (هاني شاكر - لسه بتسألي)',
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
        '- لإرسال أغنية واحدة اكتب [MUSIC:الاسم] — مثال: [MUSIC:Ed Sheeran - Perfect]',
        '- للأغاني العربية استخدم الاسم الإنجليزي: [MUSIC:Fairuz - Kifak Inta]',
        '- اختر حسب مزاج/طلب المستخدم:',
        '  - حب/رومانسية → Perfect أو Awel Mara أو Gait Ala Bali أو Dari Ya Alby أو Kelma أو Lesa Btesaly',
        '  - حماس/تحفيز → Never Say Never أو Ya El Medan أو Allo',
        '  - حزن → Winner Takes It All أو Tayeh أو Heseeny أو Ma Balash أو Lesa Btesaly',
        '  - طرب/كلاسيك → Ansak أو Kifak Inta أو Aynak أو Halaf Al Qamar أو Fi 3esh2 El Banat أو Lesa Btesaly',
        '  - صباح/هدوء → Kifak Inta أو Helwa Ya Baladi',
        '  - وطني/مصر → Helwa Ya Baladi أو Mashrebtesh Men Nilha أو Hena Masr',
        '  - رقص/حفلات → Billie Jean أو El Abd Wel Waili أو Nano',
        '  - مهرجانات/شعبي → El Abd Wel Waili',
        '- إذا طلب أغنية غير متوفرة، اقترح الأقرب من القائمة (واحدة فقط).',
        '- لا ترسل أغنية تلقائياً إلا إذا طلب المستخدم أغنية/موسيقى.',
        '- عند إرسال أغنية واحدة: جملة قصيرة ثم [MUSIC:...] مباشرة.',
        '',
        '## قواعد البلايليست (مهمة جداً):',
        '- عندما يطلب المستخدم بلايليست/قائمة أغاني/مجموعة أغاني/أغاني لمزاج معين، استخدم تاج البلايليست.',
        '- التنسيق: [PLAYLIST:عنوان البلايليست|أغنية1|أغنية2|أغنية3]',
        '- العنوان أولاً ثم الأغاني مفصولة بـ |',
        '- استخدم الاسم الإنجليزي للأغاني كما في [MUSIC:]',
        '- مثال: [PLAYLIST:أغاني رومانسية|Ed Sheeran - Perfect|Dari Ya Alby|Kelma|Awel Mara]',
        '- مثال: [PLAYLIST:أغاني حماسية|Never Say Never|Ya El Medan|Allo|Billie Jean]',
        '- اختر 3-8 أغاني مناسبة للمزاج المطلوب.',
        '- اكتب جملة قصيرة عن البلايليست ثم التاج مباشرة.',
        '- لا تكرر اسماء الأغاني بعد التاج — البلايليست ستعرضهم تلقائياً.',
        '- عند طلب أغنية واحدة فقط استخدم [MUSIC:] وليس [PLAYLIST:]',
        '',
        '## مكتبة الأفلام (56 فيلم):',
        '- فيلم برشامة 2026 (كوميدي/مصري)',
        '- فيلم الكلام على ايه (مصري)',
        '- فيلم كولونيا (دراما/مصري)',
        '- فيلم ان غاب القط (كوميدي/مصري)',
        '- فيلم عيال حبيبة (كوميدي/رومانسي/مصري)',
        '- فيلم افواه وارانب (دراما/مصري/كلاسيك)',
        '- فيلم الانسة مامي (كوميدي/مصري)',
        '- فيلم حلم العمر (أكشن/دراما/مصري)',
        '- فيلم عسل اسود (كوميدي/دراما/مصري)',
        '- فيلم الارهاب والكباب (كوميدي/مصري/كلاسيك)',
        '- فيلم عنتر ابن شداد (تاريخي/مصري/كلاسيك)',
        '- فيلم احلام عمرنا (رومانسي/دراما/مصري)',
        '- فيلم لخمة راس (كوميدي/مصري)',
        '- فيلم المش مهندس حسن (كوميدي/مصري)',
        '- فيلم كود 36 (أكشن/مصري)',
        '- فيلم ابن حميدو (كوميدي/مصري/كلاسيك)',
        '- فيلم سر طاقية الاخفاء (كوميدي/مصري/كلاسيك)',
        '- فيلم اسماعيل يس في الاسطول (كوميدي/مصري/كلاسيك)',
        '- فيلم كتيبة الاعدام (أكشن/دراما/مصري/كلاسيك)',
        '- فيلم العفاريت (دراما/مصري/كلاسيك)',
        '- فيلم على باب الوزير (كوميدي/مصري/كلاسيك)',
        '- فيلم الرصاصة لا تزال في جيبي (حربي/تاريخي/مصري)',
        '- فيلم وا اسلاماه (تاريخي/مصري/كلاسيك)',
        '- فيلم المولد (أكشن/دراما/مصري/كلاسيك)',
        '- فيلم اشاعة حب (كوميدي/مصري/كلاسيك)',
        '- فيلم اقوى الرجال (أكشن/دراما/مصري)',
        '- فيلم الزوجة 13 (كوميدي/مصري/كلاسيك)',
        '- فيلم البعض لا يذهب للمأذون مرتين (كوميدي/مصري/كلاسيك)',
        '- فيلم المشبوه (أكشن/دراما/مصري/كلاسيك)',
        '- فيلم قبضة الهلالي (أكشن/مصري/كلاسيك)',
        '- فيلم المتسول (كوميدي/مصري/كلاسيك)',
        '- فيلم في بيتنا رجل (دراما/تاريخي/مصري/كلاسيك)',
        '- فيلم عروس النيل (كوميدي/رومانسي/مصري/كلاسيك)',
        '- فيلم عصابة حمادة وتوتو (كوميدي/مصري/كلاسيك)',
        '- فيلم التعويذة (رعب/مصري/كلاسيك)',
        '- فيلم رجل فقد عقله (كوميدي/مصري/كلاسيك)',
        '- فيلم اسماعيل يس في الطيران (كوميدي/مصري/كلاسيك)',
        '- فيلم البيه البواب (كوميدي/مصري/كلاسيك)',
        '- فيلم مهمة في تل ابيب (أكشن/جاسوسية/مصري)',
        '- فيلم صراع في النيل (دراما/مصري/كلاسيك)',
        '- فيلم بطل من ورق (كوميدي/أكشن/مصري/كلاسيك)',
        '- فيلم اسماعيل يس يقابل ريا وسكينة (كوميدي/مصري/كلاسيك)',
        '- فيلم الغول (دراما/أكشن/مصري/كلاسيك)',
        '- فيلم انا حرة (دراما/مصري/كلاسيك)',
        '- فيلم النمر الاسود (دراما/أكشن/مصري/كلاسيك)',
        '- فيلم عنتر شايل سيفه (كوميدي/مصري/كلاسيك)',
        '- فيلم مرجان احمد مرجان (كوميدي/مصري)',
        '- فيلم امبراطورية ميم (دراما/مصري/كلاسيك)',
        '- فيلم شعبان تحت الصفر (كوميدي/مصري/كلاسيك)',
        '- فيلم فتوة الناس الغلابة (دراما/أكشن/مصري/كلاسيك)',
        '- فيلم الكيت كات (كوميدي/دراما/مصري/كلاسيك)',
        '- فيلم خلي بالك من جيرانك (كوميدي/مصري/كلاسيك)',
        '- فيلم الشيطانة التي احبتني (كوميدي/مصري/كلاسيك)',
        '- فيلم بين السما والارض (كوميدي/دراما/مصري/كلاسيك)',
        '- فيلم الانس والجن (رعب/مصري/كلاسيك)',
        '- فيلم رمضان فوق البركان (كوميدي/مصري/كلاسيك)',
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
        fbLog('visit', { ref: document.referrer || 'direct', page: location.pathname });
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
            copied: '✓ تم النسخ',
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
            plExists: '🎵 الأغنية موجودة بالفعل في البلايليست',
            plAdded: '🎵 تمت الإضافة: ',
            plCleared: '🗑 تم مسح البلايليست',
            plFail: '⚠️ تعذر تشغيل: ',
            addedPre: '🎵 تمت إضافة ',
            addedPost: ' أغنية',
            plAllExist: '🎵 جميع الأغاني موجودة بالفعل',
            plStarted: '🎵 تم تشغيل البلايليست',
            notAvail: 'غير متوفر',
            plNoMatch: 'لا توجد أغاني مطابقة',
            noVideo: 'المتصفح لا يدعم تشغيل الفيديو',
            repeatT: { none: 'تكرار', all: 'تكرار الكل', one: 'تكرار واحدة' },
            repeatToast: { none: '🔁 تكرار: مغلق', all: '🔁 تكرار: الكل', one: '🔂 تكرار: أغنية واحدة' },
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
            thanks: '✓ شكراً على تقييمك',
            exported: '✓ تم تصدير المحادثة',
            noChat: 'لا توجد محادثة للتصدير',
            listening: '🎤 جاري الاستماع… تحدث الآن',
            editHint: '✏️ عدّل رسالتك ثم أرسلها',
            saveSend: 'إرسال',
            cancel: 'إلغاء',
            youWord: 'أنت'
        },
        en: {
            newChat: 'New chat',
            startNew: 'Start a new chat',
            cleared: 'All chats deleted',
            del: 'Delete',
            copy: 'Copy',
            copied: '✓ Copied',
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
            plExists: '🎵 Song is already in the playlist',
            plAdded: '🎵 Added: ',
            plCleared: '🗑 Playlist cleared',
            plFail: '⚠️ Could not play: ',
            addedPre: '🎵 Added ',
            addedPost: ' songs',
            plAllExist: '🎵 All songs are already added',
            plStarted: '🎵 Playlist started',
            notAvail: 'not available',
            plNoMatch: 'no matching songs',
            noVideo: 'Your browser does not support video playback',
            repeatT: { none: 'Repeat', all: 'Repeat all', one: 'Repeat one' },
            repeatToast: { none: '🔁 Repeat: off', all: '🔁 Repeat: all', one: '🔂 Repeat: one' },
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
            thanks: '✓ Thanks for your feedback',
            exported: '✓ Chat exported',
            noChat: 'No chat to export',
            listening: '🎤 Listening… speak now',
            editHint: '✏️ Edit your message and send',
            saveSend: 'Send',
            cancel: 'Cancel',
            youWord: 'You'
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
    function toast(msg) {
        var old = document.querySelector('.toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add('show'); });
        setTimeout(function () {
            t.classList.remove('show');
            setTimeout(function () { t.remove(); }, 350);
        }, 2500);
    }

    /* ═══════ MARKDOWN PARSER ═══════ */
    function md(text) {
        if (!text) return '';

        // Preserve music tags
        var musicBlocks = [];
        text = text.replace(/\[MUSIC:([^\]]+)\]/g, function (_, name) {
            var idx = musicBlocks.length;
            var found = null;
            for (var i = 0; i < MUSIC.length; i++) {
                if (MUSIC[i].name.toLowerCase().indexOf(name.trim().toLowerCase()) !== -1
                    || name.trim().toLowerCase().indexOf(MUSIC[i].name.toLowerCase()) !== -1) {
                    found = MUSIC[i]; break;
                }
            }
            musicBlocks.push(found ? musicPlayerHTML(found) : '<p>🎵 ' + esc(name) + ' (' + t('notAvail') + ')</p>');
            return '%%MUSIC_' + idx + '%%';
        });

        // Preserve movie tags
        var movieBlocks = [];
        text = text.replace(/\[MOVIE:([^\]]+)\]/g, function (_, name) {
            var idx = movieBlocks.length;
            var found = null;
            for (var i = 0; i < MOVIES.length; i++) {
                if (MOVIES[i].name.toLowerCase().indexOf(name.trim().toLowerCase()) !== -1
                    || name.trim().toLowerCase().indexOf(MOVIES[i].name.toLowerCase()) !== -1) {
                    found = MOVIES[i]; break;
                }
            }
            movieBlocks.push(found ? moviePlayerHTML(found) : '<p>🎬 ' + esc(name) + ' (' + t('notAvail') + ')</p>');
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
                var sn = songNames[s].toLowerCase();
                for (var mi2 = 0; mi2 < MUSIC.length; mi2++) {
                    if (MUSIC[mi2].name.toLowerCase().indexOf(sn) !== -1
                        || sn.indexOf(MUSIC[mi2].name.toLowerCase()) !== -1) {
                        foundSongs.push(MUSIC[mi2]);
                        break;
                    }
                }
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

        return text;
    }

    /* ═══════ ICONS ═══════ */
    var COPY_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
    var REGEN_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
    var SPEAK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    var LIKE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
    var DISLIKE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';
    var EDIT_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

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
            var body = btn.closest('.body');
            var text = body.innerText.replace(/^(نسخ|إعادة توليد|Copy|Regenerate)$/gm, '').trim();
            navigator.clipboard.writeText(text).then(function () {
                toast(t('copied'));
            });
        },
        regen: function (btn) {
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
            callAPI(c.msgs).then(function (res) {
                hideDots();
                var aiMsg = { role: 'assistant', content: '' };
                var node = addMsg(aiMsg);
                return readStream(res, node).then(function (txt) {
                    aiMsg.content = txt;
                    c.msgs.push(aiMsg);
                    saveAll();
                });
            }).catch(function (err) {
                hideDots();
                handleError(err, c);
            }).then(finishSend);
        },
        playMovie: function (id, embedUrl) {
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
                if (playlist[i].id === musicId) { toast(t('plExists')); return; }
            }
            // Find song
            var song = null;
            for (var j = 0; j < MUSIC.length; j++) {
                if (MUSIC[j].id === musicId) { song = MUSIC[j]; break; }
            }
            if (!song) return;
            playlist.push({ id: song.id, name: song.name, artist: song.artist, file: song.file });
            save('lord_playlist', playlist);
            toast(t('plAdded') + song.name);
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
            toast(t('plCleared'));
        },
        plPlay: function (idx) {
            if (idx < 0 || idx >= playlist.length) return;
            plIdx = idx;
            plActive = true;
            var song = playlist[idx];
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
                        toast(t('plFail') + song.name);
                    });
                    toast('🎵 ' + song.name);
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
            toast(t('repeatToast')[plRepeat]);
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
                toast(t('addedPre') + added + t('addedPost'));
                if (!plPanelOpen) plPanelOpen = true;
                renderPlaylistPanel();
            } else { toast(t('plAllExist')); }
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
            if (added > 0) toast(t('plStarted'));
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
                toast(t('addedPre') + added + t('addedPost'));
                plPanelOpen = true;
            } else { toast(t('plAllExist')); }
            renderPlaylistPanel();
        },
        sw: function (id) { switchConv(id); },
        del: function (id, e) { e.stopPropagation(); deleteConv(id); },
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
            clone.querySelectorAll('.msg-acts,pre,.music-player,.movie-player,.chat-playlist').forEach(function (n) { n.remove(); });
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
            toast(t('thanks'));
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
        var c = { id: genId(), title: t('newChat'), msgs: [], ts: Date.now() };
        convs.unshift(c);
        activeId = c.id;
        saveAll();
        renderList();
        renderChat();
        closeSB();
        el.input.focus();
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
        convs = convs.filter(function (c) { return c.id !== id; });
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
        toast(t('cleared'));
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
        var h = '';
        var lastGrp = -1;
        for (var i = 0; i < convs.length; i++) {
            var c = convs[i];
            var g = grpOf(c.ts);
            if (g !== lastGrp) {
                h += '<div class="conv-group">' + grpNames[g] + '</div>';
                lastGrp = g;
            }
            h += '<div class="conv' + (c.id === activeId ? ' on' : '') + '" onclick="LORD.sw(\'' + c.id + '\')">'
                + '<span class="conv-t">' + esc(c.title) + '</span>'
                + '<button class="conv-ren" onclick="LORD.ren(\'' + c.id + '\',event)" title="' + t('rename') + '">'
                + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
                + '</button>'
                + '<button class="conv-x" onclick="LORD.del(\'' + c.id + '\',event)" title="' + t('del') + '">'
                + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                + '</button></div>';
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
        var timeAttr = m.ts ? ' title="' + new Date(m.ts).toLocaleString(LANG === 'en' ? 'en-US' : 'ar-EG') + '"' : '';
        var inner;
        if (isU) {
            var uActs = '<div class="msg-acts msg-acts-u">'
                + '<button class="act-btn" onclick="LORD.editMsg(this)" title="' + t('edit') + '">' + EDIT_SVG + '</button>'
                + '</div>';
            inner = '<div class="body" dir="auto">' + content + '</div>' + uActs;
        } else {
            inner = '<div class="body" dir="auto">' + content + aiActsHTML(isLastAI) + '</div>';
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

    function scrollBottom() {
        requestAnimationFrame(function () {
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
                'Authorization': 'Bearer ' + API_KEY
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
        if (err.message && err.message.indexOf('rate') !== -1) {
            errText = t('errRate');
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

        callAPI(c.msgs).then(function (res) {
            hideDots();
            var aiMsg = { role: 'assistant', content: '', ts: Date.now() };
            var node = addMsg(aiMsg);
            return readStream(res, node).then(function (txt) {
                aiMsg.content = txt;
                c.msgs.push(aiMsg);
                saveAll();
                trackMessage('assistant', txt, Date.now() - sendTime);
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
        toast(t('exported'));
    }

    /* ═══════ SHORTCUTS MODAL ═══════ */
    function toggleShortcuts(show) {
        var m = $('shortcutsModal');
        if (!m) return;
        if (show === undefined) show = m.classList.contains('none');
        m.classList.toggle('none', !show);
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
                toast(t('listening'));
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

        // Language toggle
        var langBtn = $('langBtn');
        if (langBtn) langBtn.addEventListener('click', toggleLang);

        // Export chat
        var exportBtn = $('exportBtn');
        if (exportBtn) exportBtn.addEventListener('click', exportChat);

        // Shortcuts modal
        var helpBtn = $('helpBtn');
        if (helpBtn) helpBtn.addEventListener('click', function () { toggleShortcuts(true); });
        var closeShortcuts = $('closeShortcuts');
        if (closeShortcuts) closeShortcuts.addEventListener('click', function () { toggleShortcuts(false); });
        var scModal = $('shortcutsModal');
        if (scModal) scModal.addEventListener('click', function (e) {
            if (e.target === scModal) toggleShortcuts(false);
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
            });
            scrollBtn.addEventListener('click', function () {
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

        // Prompt cards
        var cards = document.querySelectorAll('.prompt-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('click', function () {
                var q = this.getAttribute('data-q');
                if (q) { el.input.value = q; send(q); }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (el.sidebar.classList.contains('open')) closeSB();
                toggleShortcuts(false);
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'N') { e.preventDefault(); newConv(); }
            if (e.ctrlKey && e.key === '/') { e.preventDefault(); toggleShortcuts(); return; }
            if (e.key === '/' && document.activeElement !== el.input && !busy) {
                e.preventDefault();
                el.input.focus();
            }
        });

        window.addEventListener('resize', function () { resizeInput(); });
    }

    /* ═══════ INIT ═══════ */
    function init() {
        cacheDom();
        applyLang(get('lord_lang', 'ar'));
        initTheme();
        initFirebase();
        loadConvs();
        trackPageView();
        renderList();
        renderChat();
        bind();
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
