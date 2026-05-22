// firebase-messaging-sw.js
// Service Worker للإشعارات - يشتغل حتى لو التطبيق مسكّر

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDzk1Kn1JrCbkIR2TT0x62U-2BoZLZrA40",
  authDomain: "lazurde-notifications.firebaseapp.com",
  projectId: "lazurde-notifications",
  storageBucket: "lazurde-notifications.firebasestorage.app",
  messagingSenderId: "1012981554370",
  appId: "1:1012981554370:web:7dd3956fa23b0622522f5b",
  measurementId: "G-ZGQQV3Y374"
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('إشعار وصل في الخلفية:', payload);
  
  const notificationTitle = payload.notification?.title || '🏪 LAZURDE & MANISA';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك تذكير جديد',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    tag: 'lazurde-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// عند الضغط على الإشعار - يفتح التطبيق
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});

// ==========================================
// الإشعارات المجدولة (تشتغل بالتوقيت المحلي)
// ==========================================

// تذكير ترتيب البضاعة كل 15 دقيقة بين 9 ص و10 م
// تذكير إرسال التقرير في 10 م

let reminderInterval = null;
let reportReminderTimeout = null;

function scheduleReminders() {
  // كل دقيقة نفحص الوقت
  reminderInterval = setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // تذكير ترتيب البضاعة: كل 15 دقيقة بين 9ص و 10م
    if (hours >= 14 && hours < 22) {
      if (minutes % 15 === 0) {
        self.registration.showNotification('📦 تذكير ترتيب البضاعة', {
          body: 'حان وقت تفريغ ستاند الرواجع وإعادة ترتيب المنطقة!',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          dir: 'rtl',
          lang: 'ar',
          tag: 'arrange-reminder',
          renotify: true,
          vibrate: [100, 50, 100],
          silent: false
        });
      }
    }

    // تذكير إرسال التقرير: الساعة 10 مساءً
    if (hours === 22 && minutes === 0) {
      self.registration.showNotification('📋 تذكير إرسال التقرير اليومي', {
        body: 'الساعة 10 مساءً! لا تنسَ إرسال تقرير الأداء اليومي 🕙',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        dir: 'rtl',
        lang: 'ar',
        tag: 'report-reminder',
        renotify: true,
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true
      });
    }
  }, 60000); // كل دقيقة
}

// ابدأ الجدولة عند تفعيل السيرفس ووركر
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  scheduleReminders();
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});
