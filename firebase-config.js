/* LORD AI — Firebase Configuration */
/* ═══════════════════════════════════════════════════════════════
   📌 خطوات إعداد Firebase:
   
   1. اذهب إلى https://console.firebase.google.com
   2. أنشئ مشروع جديد (اسمه مثلاً "lord-ai")
   3. أضف تطبيق ويب (Web App)
   4. انسخ كائن firebaseConfig من الكونسول
   5. استبدل القيم أدناه بقيمك الخاصة
   6. اذهب إلى Firestore Database → إنشاء قاعدة بيانات
   7. اختر "Start in test mode" (أو ضع القواعد أدناه)
   
   قواعد Firestore المقترحة:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /lord_events/{doc} { allow create: if true; allow read: if true; }
       match /lord_visitors/{doc} { allow read, write: if true; }
       match /lord_stats/{doc} { allow read, write: if true; }
     }
   }
═══════════════════════════════════════════════════════════════ */

var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBvLuzL" + "Ia4qivyTwJtLWVCd5Ajnmlmzl2I",
    authDomain: "lordai-cc805.firebaseapp.com",
    projectId: "lordai-cc805",
    storageBucket: "lordai-cc805.firebasestorage.app",
    messagingSenderId: "459768372952",
    appId: "1:459768372952:web:c5c7cd00e4f28656cf01ad",
    measurementId: "G-DM2RKYV8Q4"
};

/* كلمة مرور الأدمن — غيّرها لكلمة سرية خاصة بك */
var ADMIN_PASSWORD = "lord2026";
