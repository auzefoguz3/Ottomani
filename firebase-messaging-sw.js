console.log('FCM Service Worker loaded');

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBB-PEtapGv0S6B_Xt1A-6dTMjvO5ASrNc",
  authDomain: "osmanlicaogren-57ff0.firebaseapp.com",
  projectId: "osmanlicaogren-57ff0",
  storageBucket: "osmanlicaogren-57ff0.appspot.com",
  messagingSenderId: "55078200434",
  appId: "1:55078200434:web:f933fe5178daaf63210eeb",
  measurementId: "G-58MD9BL1TY"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message received:', payload);
  if (payload.notification) {
    const notificationTitle = payload.notification.title || 'Bildirim';
    const notificationOptions = {
      body: payload.notification.body || '',
      icon: payload.notification.icon || '/icon-192.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});