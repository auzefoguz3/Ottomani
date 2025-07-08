let messaging;

async function initializeFirebaseMessaging() {
  try {
    // Firebase kontrolü
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase yüklenmedi!');
    }

    // Firebase uygulaması kontrolü
    if (!firebase.apps.length) {
      throw new Error('Firebase başlatılmadı! firebase-init.js yüklendi mi?');
    }

    // Messaging desteği kontrolü
    if (!firebase.messaging || typeof firebase.messaging.isSupported !== 'function' || !firebase.messaging.isSupported()) {
      throw new Error('Bu tarayıcı FCM desteklemiyor!');
    }

    messaging = firebase.messaging();
    
    // Yeni Firebase sürümlerinde VAPID key doğrudan getToken içinde veriliyor
    return true;
  } catch (error) {
    console.error('Firebase Messaging başlatma hatası:', error);
    showAlert(`Bildirim hatası: ${error.message}`, 'danger');
    return false;
  }
}

async function requestNotificationPermission() {
  try {
    const isInitialized = await initializeFirebaseMessaging();
    if (!isInitialized) return null;

    // Önce bildirim izni iste
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Bildirim izni verilmedi!');
    }

    // Service Worker kaydı
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js');
        console.log('Service Worker kaydedildi:', registration);
      } catch (swError) {
        console.error('Service Worker kaydı başarısız:', swError);
        throw new Error('Service Worker kaydı başarısız oldu!');
      }
    }

    // Token alırken VAPID key'i doğrudan parametre olarak veriyoruz
    const vapidKey = "BO30v0q-0yHSQ5ueutmx5cNc3HH1gdSNF5kNhVyM9xN1UL4GmT_ywAUVqnaI24zX93eqAd0F_hsq3YibUTwJMcI";
    const token = await messaging.getToken({ vapidKey });
    
    if (!token) {
      throw new Error('Token alınamadı!');
    }

    // Token'ı göster
    const tokenInput = document.getElementById('fcm-token-box');
    if (tokenInput) {
      tokenInput.value = token;
      showAlert('Token başarıyla alındı!', 'success');
    }
    
    return token;
  } catch (error) {
    console.error('Bildirim izni hatası:', error);
    showAlert(`Bildirim izni alınamadı: ${error.message}`, 'danger');
    return null;
  }
}

function listenForMessages() {
  if (!messaging) return;

  messaging.onMessage((payload) => {
    console.log('Ön planda mesaj alındı:', payload);
    
    if (Notification.permission === "granted") {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon-192.png'
      });
    } else {
      showAlert(`${payload.notification.title}\n${payload.notification.body}`, 'info');
    }
  });
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
  alertDiv.style.zIndex = '2000';
  alertDiv.textContent = message;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Global fonksiyonlar
window.requestNotificationPermission = requestNotificationPermission;
window.listenForMessages = listenForMessages;

// Sayfa yüklendiğinde otomatik başlat
document.addEventListener('DOMContentLoaded', () => {
  listenForMessages();
});