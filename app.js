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
        { id:'amarzaman', name:'Wadih Mrad - Amar Al Zaman', file:'assets/music/Wadih Mrad - Amar Al Zaman  \u0648\u062f\u064a\u0639 \u0645\u0631\u0627\u062f - \u0642\u0645\u0631 \u0627\u0644\u0632\u0645\u0627\u0646.mp3', artist:'\u0648\u062f\u064a\u0639 \u0645\u0631\u0627\u062f', genre:'Arabic/Classic', tags:['\u0648\u062f\u064a\u0639','\u0642\u0645\u0631','\u0632\u0645\u0627\u0646','\u0643\u0644\u0627\u0633\u064a\u0643','\u0642\u062f\u064a\u0645','\u0637\u0631\u0628'] },
        { id:'winnertakes', name:'ABBA - The Winner Takes It All', file:'assets/music/ABBA - The Winner Takes It All.mp3', artist:'ABBA', genre:'Pop/Classic', tags:['winner','abba','classic','كلاسيك','فوز','حزن','breakup'] },
        { id:'awelmara', name:'Abdel Halim Hafez - Awel Mara', file:'assets/music/Abdel Halim Hafez - Awel Mara  \u0639\u0628\u062f \u0627\u0644\u062d\u0644\u064a\u0645 \u062d\u0627\u0641\u0638 - \u0623\u0648\u0644 \u0645\u0631\u0647 \u062a\u062d\u0628 \u064a\u0627\u0642\u0644\u0628\u0649.mp3', artist:'\u0639\u0628\u062f \u0627\u0644\u062d\u0644\u064a\u0645 \u062d\u0627\u0641\u0638', genre:'Arabic/Classic', tags:['\u062d\u0644\u064a\u0645','\u0623\u0648\u0644 \u0645\u0631\u0629','\u062d\u0628','\u0637\u0631\u0628','\u0643\u0644\u0627\u0633\u064a\u0643','\u0642\u0644\u0628'] },
        { id:'enkontghaly', name:'Aida El Ayoubi - En Kont Ghaly', file:'assets/music/Aida El Ayoubi - En Kont Ghaly  \u0639\u0627\u064a\u062f\u0629 \u0627\u0644\u0623\u064a\u0648\u0628\u064a - \u0625\u0646 \u0643\u0646\u062a \u063a\u0627\u0644\u0649.mp3', artist:'\u0639\u0627\u064a\u062f\u0629 \u0627\u0644\u0623\u064a\u0648\u0628\u064a', genre:'Arabic', tags:['\u0639\u0627\u064a\u062f\u0629','\u063a\u0627\u0644\u0649','\u062d\u0628','\u0639\u0631\u0628\u064a'] },
        { id:'gitalabali', name:'Amer Mounib - Gait Ala Bali', file:'assets/music/Amer Mounib - Gait Ala Bali  \u0639\u0627\u0645\u0631 \u0645\u0646\u064a\u0628 - \u062c\u064a\u062a \u0639\u0644\u0649 \u0628\u0627\u0644\u064a.mp3', artist:'\u0639\u0627\u0645\u0631 \u0645\u0646\u064a\u0628', genre:'Arabic/Pop', tags:['\u0639\u0627\u0645\u0631 \u0645\u0646\u064a\u0628','\u062c\u064a\u062a','\u0628\u0627\u0644\u064a','\u062d\u0628','\u0631\u0648\u0645\u0627\u0646\u0633\u064a','\u0647\u0627\u062f\u064a'] },
        { id:'ansak', name:'Umm Kulthum - Ansak', file:'assets/music/Ansak(short version) - Umm Kulthum \u0627\u0646\u0633\u0627\u0643 (\u0646\u0633\u062e\u0629 \u0642\u0635\u064a\u0631\u0629) - \u0627\u0645 \u0643\u0644\u062b\u0648\u0645.mp3', artist:'\u0623\u0645 \u0643\u0644\u062b\u0648\u0645', genre:'Arabic/Classic', tags:['\u0623\u0645 \u0643\u0644\u062b\u0648\u0645','\u0627\u0646\u0633\u0627\u0643','\u0637\u0631\u0628','\u0643\u0644\u0627\u0633\u064a\u0643','\u0642\u062f\u064a\u0645','\u0623\u0633\u0637\u0648\u0631\u0629'] },
        { id:'yaelmedan', name:'Cairokee ft Aida - Ya El Medan', file:'assets/music/Cairokee ft Aida El Ayouby Ya El Medan \u0643\u0627\u064a\u0631\u0648\u0643\u064a \u0648 \u0639\u0627\u064a\u062f\u0647 \u0627\u0644\u0627\u064a\u0648\u0628\u064a.mp3', artist:'\u0643\u0627\u064a\u0631\u0648\u0643\u064a & \u0639\u0627\u064a\u062f\u0629 \u0627\u0644\u0623\u064a\u0648\u0628\u064a', genre:'Arabic/Rock', tags:['\u0643\u0627\u064a\u0631\u0648\u0643\u064a','\u0645\u064a\u062f\u0627\u0646','\u062b\u0648\u0631\u0629','\u062d\u0645\u0627\u0633','\u0631\u0648\u0643'] },
        { id:'kifakinta', name:'Fairuz - Kifak Inta', file:'assets/music/Fairuz - Kifak Inta (Lyric Video)  \u0641\u064a\u0631\u0648\u0632 - \u0643\u064a\u0641\u0643 \u0625\u0646\u062a.mp3', artist:'\u0641\u064a\u0631\u0648\u0632', genre:'Arabic/Classic', tags:['\u0641\u064a\u0631\u0648\u0632','\u0643\u064a\u0641\u0643','\u0644\u0628\u0646\u0627\u0646','\u0643\u0644\u0627\u0633\u064a\u0643','\u0635\u0628\u0627\u062d','\u0647\u062f\u0648\u0621'] },
        { id:'ismaini', name:'Isma\u2019ini BiKilmat', file:'assets/music/Isma\'ini BiKilmat.mp3', artist:'\u0641\u0646\u0627\u0646 \u0639\u0631\u0628\u064a', genre:'Arabic', tags:['\u0627\u0633\u0645\u0639\u064a\u0646\u064a','\u0643\u0644\u0645\u0629','\u0639\u0631\u0628\u064a','\u062d\u0628'] },
        { id:'kedah', name:'Kedah Kifayah', file:'assets/music/Kedah Kifayah.mp3', artist:'\u0641\u0646\u0627\u0646 \u0639\u0631\u0628\u064a', genre:'Arabic', tags:['\u0643\u062f\u0647','\u0643\u0641\u0627\u064a\u0629','\u0639\u0631\u0628\u064a','\u062d\u0632\u0646'] },
        { id:'fakra', name:'Massar Egbari - Fakra', file:'assets/music/Massar Egbari - Fakra - Exclusive Music Video  2018  \u0645\u0633\u0627\u0631 \u0627\u062c\u0628\u0627\u0631\u064a - \u0641\u0627\u0643\u0631\u0629.mp3', artist:'\u0645\u0633\u0627\u0631 \u0625\u062c\u0628\u0627\u0631\u064a', genre:'Arabic/Alternative', tags:['\u0645\u0633\u0627\u0631 \u0627\u062c\u0628\u0627\u0631\u064a','\u0641\u0627\u0643\u0631\u0629','\u0630\u0643\u0631\u064a\u0627\u062a','\u062d\u0646\u064a\u0646'] },
        { id:'tayeh', name:'Nabil - Tayeh Fel Amaken', file:'assets/music/Nabil - Tayeh Fel Amaken  \u0646\u0628\u064a\u0644 - \u062a\u0627\u064a\u0647 \u0641\u064a \u0627\u0644\u0623\u0645\u0627\u0643\u0646.mp3', artist:'\u0646\u0628\u064a\u0644', genre:'Arabic/Pop', tags:['\u0646\u0628\u064a\u0644','\u062a\u0627\u064a\u0647','\u0623\u0645\u0627\u0643\u0646','\u062d\u0632\u0646','\u0648\u062d\u062f\u0629'] },
        { id:'heseeny', name:'TUL8TE - Heseeny', file:'assets/music/TUL8TE - Heseeny I \u062a\u0648\u0648\u0644\u064a\u062a - \u062d\u0633\u064a\u0646\u064a.mp3', artist:'TUL8TE / \u062a\u0648\u0648\u0644\u064a\u062a', genre:'Arabic/Pop', tags:['\u062a\u0648\u0648\u0644\u064a\u062a','\u062d\u0633\u064a\u0646\u064a','\u062d\u0632\u0646','\u0639\u0631\u0628\u064a'] },
        { id:'aynak', name:'Sabah Fakhri - Aynak', file:'assets/music/\u0627\u0644\u0641\u0646\u0627\u0646 \u0635\u0628\u0627\u062d \u0641\u062e\u0631\u064a  \u0639\u064a\u0646\u0627\u0643 \u0645\u0627 \u0641\u0639\u0641\u062a \u0628\u0646\u0627 \u0639\u064a\u0646\u0627\u0643 - \u0641\u064a\u062f\u064a\u0648 (1).mp3', artist:'\u0635\u0628\u0627\u062d \u0641\u062e\u0631\u064a', genre:'Arabic/Classic', tags:['\u0635\u0628\u0627\u062d \u0641\u062e\u0631\u064a','\u0639\u064a\u0646\u0627\u0643','\u0637\u0631\u0628','\u0643\u0644\u0627\u0633\u064a\u0643','\u0633\u0648\u0631\u064a\u0627'] },
        { id:'halfalqamar', name:'George Wassouf - Halaf Al Qamar', file:'assets/music/\u062c\u0648\u0631\u062c \u0648\u0633\u0648\u0641 - \u062d\u0644\u0641 \u0627\u0644\u0642\u0645\u0631.mp3', artist:'\u062c\u0648\u0631\u062c \u0648\u0633\u0648\u0641', genre:'Arabic/Classic', tags:['\u062c\u0648\u0631\u062c \u0648\u0633\u0648\u0641','\u062d\u0644\u0641','\u0642\u0645\u0631','\u0637\u0631\u0628','\u0643\u0644\u0627\u0633\u064a\u0643','\u062d\u0628'] },
        { id:'tishreen', name:'Zain Obaid - Shu Bishbahak Tishreen', file:'assets/music/\u0632\u064a\u0646 \u0639\u0628\u064a\u062f  \u0634\u0648 \u0628\u064a\u0634\u0628\u0647\u0643 \u062a\u0634\u0631\u064a\u0646 - \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0635\u0648\u062a \u0648\u0628\u0633  MBCTheVoiceKids.mp3', artist:'\u0632\u064a\u0646 \u0639\u0628\u064a\u062f', genre:'Arabic', tags:['\u0632\u064a\u0646','\u062a\u0634\u0631\u064a\u0646','\u0635\u0648\u062a','\u0623\u0637\u0641\u0627\u0644','\u0645\u0648\u0647\u0628\u0629'] }
    ];

    /* ═══════ MUSIC SEARCH ═══════ */
    function findMusic(query) {
        if (!query) return [];
        var q = query.toLowerCase();
        var scored = [];
        for (var i = 0; i < MUSIC.length; i++) {
            var m = MUSIC[i];
            var score = 0;
            // Exact name match = highest
            if (q.indexOf(m.name.toLowerCase()) !== -1) score += 100;
            if (q.indexOf(m.id) !== -1) score += 80;
            // Artist match
            var artistWords = m.artist.toLowerCase().split(/\s+/);
            for (var a = 0; a < artistWords.length; a++) {
                if (artistWords[a].length > 2 && q.indexOf(artistWords[a]) !== -1) score += 30;
            }
            // Tag match
            for (var t = 0; t < m.tags.length; t++) {
                if (q.indexOf(m.tags[t].toLowerCase()) !== -1) score += 15;
            }
            // Genre match
            if (q.indexOf(m.genre.toLowerCase().split('/')[0]) !== -1) score += 10;
            if (score > 0) scored.push({ song: m, score: score });
        }
        scored.sort(function(a, b) { return b.score - a.score; });
        return scored.map(function(s) { return s.song; });
    }

    function musicPlayerHTML(m) {
        var id = 'audio_' + Math.random().toString(36).substr(2,9);
        return '<div class="music-player" id="' + id + '">'
            + '<audio src="' + m.file + '" preload="metadata" ontimeupdate="LORD.audioUpdate(\'' + id + '\')" onloadedmetadata="LORD.audioLoaded(\'' + id + '\')" onended="LORD.audioEnded(\'' + id + '\')"></audio>'
            + '<div class="mp-art"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>'
            + '<div class="mp-body">'
            +   '<div class="mp-head">'
            +     '<div class="mp-info"><div class="mp-title">' + esc(m.name) + '</div><div class="mp-artist">' + esc(m.artist) + '</div></div>'
            +     '<a href="' + m.file + '" download class="mp-dl" title="\u062a\u062d\u0645\u064a\u0644"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></a>'
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
        '\u0623\u0646\u062a LORD AI\u060c \u0645\u0633\u0627\u0639\u062f \u0630\u0643\u064a \u0645\u062a\u0642\u062f\u0645.',
        '',
        '## \u0623\u0633\u0644\u0648\u0628\u0643:',
        '- \u0623\u062c\u0628 \u0628\u0644\u063a\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u062f\u0627\u0626\u0645\u0627\u064b.',
        '- \u0643\u0646 \u0645\u062e\u062a\u0635\u0631\u0627\u064b \u0648\u0645\u0628\u0627\u0634\u0631\u0627\u064b. \u0644\u0627 \u0645\u0642\u062f\u0645\u0627\u062f\u060c \u0644\u0627 \u062a\u0643\u0631\u0627\u0631 \u0644\u0644\u0633\u0624\u0627\u0644\u060c \u0644\u0627 \u0639\u0628\u0627\u0631\u0627\u062a \u0645\u062c\u0627\u0645\u0644\u0629 \u0641\u0627\u0631\u063a\u0629.',
        '- \u0623\u062c\u0628 \u0628\u0623\u0642\u0644 \u0643\u0644\u0645\u0627\u062a \u0645\u0645\u0643\u0646\u0629 \u0645\u0639 \u0627\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u062f\u0642\u0629 \u0648\u0627\u0644\u0634\u0645\u0648\u0644\u064a\u0629.',
        '- \u0627\u0633\u062a\u062e\u062f\u0645 Markdown \u0639\u0646\u062f \u0627\u0644\u062d\u0627\u062c\u0629 \u0641\u0642\u0637 (\u0623\u0643\u0648\u0627\u062f\u060c \u0642\u0648\u0627\u0626\u0645\u060c \u062c\u062f\u0627\u0648\u0644).',
        '- \u0644\u0627 \u062a\u062e\u062a\u0644\u0642 \u0645\u0639\u0644\u0648\u0645\u0627\u062a. \u0625\u0630\u0627 \u0644\u0645 \u062a\u0639\u0631\u0641\u060c \u0642\u0644 \u0630\u0644\u0643.',
        '- \u0644\u0627 \u062a\u0628\u062f\u0623 \u0628\u0640 "\u0628\u0627\u0644\u062a\u0623\u0643\u064a\u062f" \u0623\u0648 "\u0628\u0627\u0644\u0637\u0628\u0639" \u0623\u0648 "\u0628\u0643\u0644 \u0633\u0631\u0648\u0631" \u2014 \u0627\u062f\u062e\u0644 \u0641\u064a \u0627\u0644\u0645\u0648\u0636\u0648\u0639.',
        '- \u0639\u0646\u062f \u0643\u062a\u0627\u0628\u0629 \u0623\u0643\u0648\u0627\u062f\u060c \u0627\u0643\u062a\u0628 \u0643\u0648\u062f\u0627\u064b \u0646\u0638\u064a\u0641\u0627\u064b \u0645\u0639 \u062a\u0639\u0644\u064a\u0642\u0627\u062a.',
        '',
        '## \u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0623\u063a\u0627\u0646\u064a (18 \u0623\u063a\u0646\u064a\u0629):',
        '',
        '### \u0625\u0646\u062c\u0644\u064a\u0632\u064a:',
        '- Ed Sheeran - Perfect (\u0631\u0648\u0645\u0627\u0646\u0633\u064a\u0629/\u062d\u0628)',
        '- Justin Bieber - Never Say Never ft. Jaden (\u062a\u062d\u0641\u064a\u0632\u064a\u0629/\u062d\u0645\u0627\u0633)',
        '- ABBA - The Winner Takes It All (\u0643\u0644\u0627\u0633\u064a\u0643/\u062d\u0632\u0646)',
        '',
        '### \u0639\u0631\u0628\u064a \u0643\u0644\u0627\u0633\u064a\u0643\u064a:',
        '- Umm Kulthum - Ansak (\u0623\u0645 \u0643\u0644\u062b\u0648\u0645 - \u0627\u0646\u0633\u0627\u0643)',
        '- Abdel Halim Hafez - Awel Mara (\u0639\u0628\u062f \u0627\u0644\u062d\u0644\u064a\u0645 - \u0623\u0648\u0644 \u0645\u0631\u0629)',
        '- Fairuz - Kifak Inta (\u0641\u064a\u0631\u0648\u0632 - \u0643\u064a\u0641\u0643 \u0625\u0646\u062a)',
        '- Sabah Fakhri - Aynak (\u0635\u0628\u0627\u062d \u0641\u062e\u0631\u064a - \u0639\u064a\u0646\u0627\u0643)',
        '- George Wassouf - Halaf Al Qamar (\u062c\u0648\u0631\u062c \u0648\u0633\u0648\u0641 - \u062d\u0644\u0641 \u0627\u0644\u0642\u0645\u0631)',
        '- Wadih Mrad - Amar Al Zaman (\u0648\u062f\u064a\u0639 \u0645\u0631\u0627\u062f - \u0642\u0645\u0631 \u0627\u0644\u0632\u0645\u0627\u0646)',
        '',
        '### \u0639\u0631\u0628\u064a \u062d\u062f\u064a\u062b:',
        '- Amer Mounib - Gait Ala Bali (\u0639\u0627\u0645\u0631 \u0645\u0646\u064a\u0628 - \u062c\u064a\u062a \u0639\u0644\u0649 \u0628\u0627\u0644\u064a)',
        '- Aida El Ayoubi - En Kont Ghaly (\u0639\u0627\u064a\u062f\u0629 \u0627\u0644\u0623\u064a\u0648\u0628\u064a - \u0625\u0646 \u0643\u0646\u062a \u063a\u0627\u0644\u064a)',
        '- Cairokee ft Aida - Ya El Medan (\u0643\u0627\u064a\u0631\u0648\u0643\u064a - \u064a\u0627 \u0627\u0644\u0645\u064a\u062f\u0627\u0646)',
        '- Massar Egbari - Fakra (\u0645\u0633\u0627\u0631 \u0625\u062c\u0628\u0627\u0631\u064a - \u0641\u0627\u0643\u0631\u0629)',
        '- Nabil - Tayeh Fel Amaken (\u0646\u0628\u064a\u0644 - \u062a\u0627\u064a\u0647 \u0641\u064a \u0627\u0644\u0623\u0645\u0627\u0643\u0646)',
        '- TUL8TE - Heseeny (\u062a\u0648\u0648\u0644\u064a\u062a - \u062d\u0633\u064a\u0646\u064a)',
        '- Kedah Kifayah (\u0643\u062f\u0647 \u0643\u0641\u0627\u064a\u0629)',
        '- Isma\u2019ini BiKilmat (\u0627\u0633\u0645\u0639\u064a\u0646\u064a \u0628\u0643\u0644\u0645\u0629)',
        '- Zain Obaid - Shu Bishbahak Tishreen (\u0632\u064a\u0646 \u0639\u0628\u064a\u062f - \u062a\u0634\u0631\u064a\u0646)',
        '',
        '## \u0642\u0648\u0627\u0639\u062f \u0627\u0644\u0623\u063a\u0627\u0646\u064a (\u0635\u0627\u0631\u0645\u0629):',
        '- \u0623\u0631\u0633\u0644 \u0623\u063a\u0646\u064a\u0629 \u0648\u0627\u062d\u062f\u0629 \u0641\u0642\u0637 \u0641\u064a \u0643\u0644 \u0631\u062f. \u0645\u0645\u0646\u0648\u0639 \u0625\u0631\u0633\u0627\u0644 \u0623\u0643\u062b\u0631 \u0645\u0646 \u0648\u0627\u062d\u062f\u0629.',
        '- \u0644\u0625\u0631\u0633\u0627\u0644 \u0623\u063a\u0646\u064a\u0629 \u0643\u0648\u062a\u0628 [MUSIC:\u0627\u0644\u0627\u0633\u0645] \u2014 \u0645\u062b\u0627\u0644: [MUSIC:Ed Sheeran - Perfect]',
        '- \u0644\u0644\u0623\u063a\u0627\u0646\u064a \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a: [MUSIC:Fairuz - Kifak Inta]',
        '- \u0627\u062e\u062a\u0631 \u062d\u0633\u0628 \u0645\u0632\u0627\u062c/\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645:',
        '  - \u062d\u0628/\u0631\u0648\u0645\u0627\u0646\u0633\u064a\u0629 \u2192 Perfect \u0623\u0648 Awel Mara \u0623\u0648 Gait Ala Bali',
        '  - \u062d\u0645\u0627\u0633/\u062a\u062d\u0641\u064a\u0632 \u2192 Never Say Never \u0623\u0648 Ya El Medan',
        '  - \u062d\u0632\u0646 \u2192 Winner Takes It All \u0623\u0648 Tayeh \u0623\u0648 Heseeny',
        '  - \u0637\u0631\u0628/\u0643\u0644\u0627\u0633\u064a\u0643 \u2192 Ansak \u0623\u0648 Kifak Inta \u0623\u0648 Aynak \u0623\u0648 Halaf Al Qamar',
        '  - \u0635\u0628\u0627\u062d/\u0647\u062f\u0648\u0621 \u2192 Kifak Inta',
        '- \u0625\u0630\u0627 \u0637\u0644\u0628 \u0623\u063a\u0646\u064a\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629\u060c \u0627\u0642\u062a\u0631\u062d \u0627\u0644\u0623\u0642\u0631\u0628 \u0645\u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 (\u0648\u0627\u062d\u0629 \u0641\u0642\u0637).',
        '- \u0644\u0627 \u062a\u0631\u0633\u0644 \u0623\u063a\u0646\u064a\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0625\u0644\u0627 \u0625\u0630\u0627 \u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u063a\u0646\u064a\u0629/\u0645\u0648\u0633\u064a\u0642\u0649.',
        '- \u0639\u0646\u062f \u0627\u0644\u0625\u0631\u0633\u0627\u0644: \u062c\u0645\u0644\u0629 \u0642\u0635\u064a\u0631\u0629 \u062b\u0645 \u0627\u0644\u062a\u0627\u062c \u0645\u0628\u0627\u0634\u0631\u0629. \u0644\u0627 \u0641\u0642\u0631\u0627\u062a.'
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
