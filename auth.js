// Oturum açma, kayıt, çıkış, premium kontrol

async function register() {
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  if (!emailEl || !passwordEl) return alert("E-posta veya şifre alanı bulunamadı!");
  const email = emailEl.value;
  const password = passwordEl.value;
  if (!email || !password) return alert("E-posta ve şifre boş olamaz!");
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("users").doc(userCredential.user.uid).set({
      premium: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Kayıt başarılı!');
  } catch (error) {
    alert(error.message);
  }
}

async function login() {
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  if (!emailEl || !passwordEl) return alert("E-posta veya şifre alanı bulunamadı!");
  const email = emailEl.value;
  const password = passwordEl.value;
  if (!email || !password) return alert("E-posta ve şifre boş olamaz!");
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert('Giriş başarılı!');
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  auth.signOut().then(() => {
    alert('Çıkış yapıldı!');
    window.location.reload();
  });
}

// Premium durumu kontrol et ve ekrana yansıt
async function checkPremiumStatus(user) {
  const userInfoEl = document.getElementById('user-info');
  if (!user) {
    if (userInfoEl) userInfoEl.innerText = "Giriş yok";
    hidePremiumBadge();
    return;
  }
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists && userDoc.data().premium) {
      showPremiumBadge();
      if (userInfoEl) userInfoEl.innerText = "Giriş yapan (Premium): " + user.email;
    } else {
      hidePremiumBadge();
      if (userInfoEl) userInfoEl.innerText = "Giriş yapan: " + user.email;
    }
  } catch (err) {
    if (userInfoEl) userInfoEl.innerText = "Giriş yapan: " + user.email;
    hidePremiumBadge();
  }
}

function showPremiumBadge() {
  const badge = document.getElementById('premiumBadge');
  if (badge) badge.classList.remove('d-none');
}

function hidePremiumBadge() {
  const badge = document.getElementById('premiumBadge');
  if (badge) badge.classList.add('d-none');
}

// Premium şifre kontrolü (örnek: 1234567890)
async function activatePremium() {
  const passwordEl = document.getElementById('premiumPassword');
  if (!passwordEl) return alert("Premium şifre alanı bulunamadı!");
  const password = passwordEl.value;
  const user = auth.currentUser;
  if (!user) return alert("Önce giriş yapmalısın!");
  if (password === "1234567890") {
    await db.collection("users").doc(user.uid).update({ premium: true });
    alert("Premium aktif edildi!");
    showPremiumBadge();
    // Premium modalı kapat (Bootstrap 5.2+ için güvenli yöntem)
    const premiumModal = document.getElementById('premiumModal');
    if (premiumModal && typeof bootstrap !== "undefined") {
      const modal = bootstrap.Modal.getOrCreateInstance(premiumModal);
      modal.hide();
    }
    // Premium avantajları gösterilebilir
  } else {
    alert("Hatalı şifre!");
  }
}

async function deactivatePremium() {
  const user = auth.currentUser;
  if (!user) return alert("Önce giriş yapmalısın!");
  await db.collection("users").doc(user.uid).update({ premium: false });
  alert("Premium üyeliğiniz sonlandırıldı.");
  hidePremiumBadge();
}

// Giriş durumu değiştikçe arayüze yansıt
auth.onAuthStateChanged(async user => {
  const userInfoEl = document.getElementById('user-info');
  if (user) {
    if (userInfoEl) userInfoEl.innerText = "Giriş yapan: " + user.email;
    checkPremiumStatus(user);
    window.currentUser = user; // app.js için
    if (window.osmanlicaApp) window.osmanlicaApp.firebaseReady();
  } else {
    if (userInfoEl) userInfoEl.innerText = "Giriş yok";
    hidePremiumBadge();
    window.currentUser = null;
    if (window.osmanlicaApp) window.osmanlicaApp.firebaseReady();
  }
});

// Premium giriş/çıkış butonları auth.js'de DOMContentLoaded ile bağlandı
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('premiumLoginBtn');
  const logoutBtn = document.getElementById('premiumLogoutBtn');
  if (loginBtn) loginBtn.onclick = activatePremium;
  if (logoutBtn) logoutBtn.onclick = deactivatePremium;
});