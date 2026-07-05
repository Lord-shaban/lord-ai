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
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

/* كلمة مرور الأدمن — غيّرها لكلمة سرية خاصة بك */
var ADMIN_PASSWORD = "lord2026";
