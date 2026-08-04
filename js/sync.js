// ============================================================
// Cross-device sync via Firebase (Firestore + Auth).
// Local-only until js/firebase-config.js has a real apiKey — see SYNC-SETUP.md.
// ============================================================

window.HolformSync = (function () {
  let db, auth, uid;
  let onRemoteCb = null;
  let unsubscribeSnapshot = null;
  let lastPushedJSON = null;
  let pushTimer = null;
  let ready = false;

  function configured() {
    return typeof FIREBASE_CONFIG !== 'undefined' && !!FIREBASE_CONFIG.apiKey && typeof firebase !== 'undefined';
  }

  function init(onRemoteState) {
    onRemoteCb = onRemoteState;
    if (!configured()) {
      renderSyncBadge('unconfigured');
      return;
    }
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    auth.onAuthStateChanged((user) => {
      if (user) {
        uid = user.uid;
        ready = true;
        closeOverlay();
        renderSyncBadge('signed-in', user.email);
        subscribeToDoc();
      } else {
        ready = false;
        renderSyncBadge('signed-out');
      }
    });
    renderSyncBadge('signed-out');
  }

  function subscribeToDoc() {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    unsubscribeSnapshot = docRef().onSnapshot((doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      const json = JSON.stringify(data);
      if (json === lastPushedJSON) return; // this is an echo of our own write
      onRemoteCb(data);
    }, (err) => console.error('HolForm sync read error', err));
  }

  function docRef() {
    return db.collection('users').doc(uid).collection('schedule').doc('state');
  }

  function push(state) {
    if (!ready) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      const json = JSON.stringify(state);
      lastPushedJSON = json;
      docRef().set(state).catch((e) => console.error('HolForm sync write failed', e));
    }, 500);
  }

  // ---------- minimal UI: badge + sign-in overlay ----------

  function renderSyncBadge(status, email) {
    let badge = document.getElementById('sync-badge');
    if (!badge) {
      badge = document.createElement('button');
      badge.id = 'sync-badge';
      badge.className = 'sync-badge';
      badge.onclick = onBadgeClick;
      const actions = document.querySelector('.header-actions');
      if (actions) actions.appendChild(badge);
    }
    badge.dataset.status = status;
    if (status === 'unconfigured') { badge.textContent = 'Sync: not set up'; }
    else if (status === 'signed-out') { badge.textContent = 'Sync: off'; }
    else if (status === 'signed-in') { badge.textContent = 'Synced'; badge.title = email || ''; }
  }

  function onBadgeClick() {
    const status = document.getElementById('sync-badge').dataset.status;
    if (status === 'unconfigured') {
      alert('Sync isn’t set up yet.\n\nOpen SYNC-SETUP.md in the app folder for the 5-minute setup, then paste your config into js/firebase-config.js.');
      return;
    }
    if (status === 'signed-in') {
      openAccountPanel();
    } else {
      openSignInOverlay();
    }
  }

  function openOverlay(innerHTML) {
    closeOverlay();
    const overlay = document.createElement('div');
    overlay.id = 'sync-overlay';
    overlay.className = 'sync-overlay';
    overlay.innerHTML = `<div class="sync-box">${innerHTML}</div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
    document.body.appendChild(overlay);
    return overlay;
  }

  function closeOverlay() {
    const overlay = document.getElementById('sync-overlay');
    if (overlay) overlay.remove();
  }

  function openSignInOverlay() {
    const overlay = openOverlay(`
      <h2>Sync across devices</h2>
      <p>Sign in with the same email + password here and on your phone to keep this schedule in sync.</p>
      <input id="sync-email" type="email" placeholder="Email" class="text-input" autocomplete="email" />
      <input id="sync-password" type="password" placeholder="Password (6+ characters)" class="text-input" autocomplete="current-password" />
      <div class="sync-btn-row">
        <button id="sync-signin-btn" class="sync-primary-btn">Sign In</button>
        <button id="sync-signup-btn" class="sync-secondary-btn">Create Account</button>
      </div>
      <div id="sync-error" class="sync-error"></div>
      <button id="sync-close-btn" class="sync-skip">Close</button>
    `);
    overlay.querySelector('#sync-signin-btn').onclick = () => doAuth('signIn');
    overlay.querySelector('#sync-signup-btn').onclick = () => doAuth('signUp');
    overlay.querySelector('#sync-close-btn').onclick = closeOverlay;
  }

  function openAccountPanel() {
    const email = auth.currentUser ? auth.currentUser.email : '';
    const overlay = openOverlay(`
      <h2>Synced</h2>
      <p>Signed in as <strong>${email}</strong>. Sign in with this same account on your phone to see the same schedule there.</p>
      <button id="sync-signout-btn" class="sync-secondary-btn">Sign Out</button>
      <button id="sync-close-btn" class="sync-skip">Close</button>
    `);
    overlay.querySelector('#sync-signout-btn').onclick = () => { auth.signOut(); closeOverlay(); };
    overlay.querySelector('#sync-close-btn').onclick = closeOverlay;
  }

  function doAuth(mode) {
    const email = document.getElementById('sync-email').value.trim();
    const password = document.getElementById('sync-password').value;
    const errEl = document.getElementById('sync-error');
    errEl.textContent = '';
    const promise = mode === 'signIn'
      ? auth.signInWithEmailAndPassword(email, password)
      : auth.createUserWithEmailAndPassword(email, password);
    promise.catch((e) => { errEl.textContent = e.message; });
  }

  return { init, push };
})();
