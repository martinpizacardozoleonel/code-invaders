/* ============================================================
   ESQUIVA ACADÉMICA — PERFIL, AJUSTES Y PROGRESIÓN
   Maneja sesión, tema, foto de perfil, horas jugadas, EXP
   y marcos de perfil. Todo se guarda en la cuenta.
   ============================================================ */

const Profile = {
  token: null,
  user: null,
  expLevel: { level: 1, into: 0, need: 100 },
  pendingTime: 0,
  active: false,
  framesCatalog: [
    { id: 'none', name: 'Sin marco', price: 0, css: '' },
    { id: 'bronce', name: 'Marco Bronce', price: 200, css: 'frame-bronce' },
    { id: 'plata', name: 'Marco Plata', price: 400, css: 'frame-plata' },
    { id: 'oro', name: 'Marco Oro', price: 700, css: 'frame-oro' },
    { id: 'neon', name: 'Marco Neón', price: 1000, css: 'frame-neon' },
    { id: 'diamante', name: 'Marco Diamante', price: 1500, css: 'frame-diamante' }
  ],

  get isLogged() { return !!this.token; },
  get username() { return this.user ? this.user.username : 'Invitado'; },

  init() {
    this.token = localStorage.getItem('fx_token');
    this.bindUI();
    this.applyTheme();
    if (this.token) {
      this.active = true;
      this.restoreSession();
    }
    // Sincroniza el tiempo cada 15 segundos mientras el juego esté activo
    setInterval(() => this.flushTime(), 15000);
  },

  /* ---------- PETICIONES AL SERVIDOR ---------- */
  async api(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = this.token || localStorage.getItem('fx_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(path, Object.assign({}, options, { headers }));
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(data.error || 'Error en la petición');
    return data;
  },

  /* ---------- SESIÓN ---------- */
  async restoreSession() {
    try {
      const data = await this.api('/api/me');
      this.user = data.user;
      this.expLevel = data.expLevel || { level: 1, into: 0, need: 100 };
      this.applyTheme();
      this.renderProfile();
    } catch (e) {
      this.logoutLocal();
    }
  },

  async login(username, password, isRegister) {
    const path = isRegister ? '/api/register' : '/api/login';
    const data = await this.api(path, { method: 'POST', body: JSON.stringify({ username, password }) });
    this.token = data.token;
    this.user = data.user;
    this.expLevel = data.expLevel || { level: 1, into: 0, need: 100 };
    localStorage.setItem('fx_token', data.token);
    this.active = true;
    this.applyTheme();
    this.renderProfile();
    Toast.success(isRegister ? '¡Cuenta creada! 🎉' : '¡Hola de nuevo! 👋');
  },

  async logout() {
    try { await this.api('/api/logout', { method: 'POST' }); } catch (e) {}
    localStorage.removeItem('fx_token');
    this.logoutLocal();
    Toast.info('Sesión cerrada');
  },

  logoutLocal() {
    this.token = null;
    this.user = null;
    this.active = false;
    this.applyTheme();
    this.renderProfile();
  },

  /* ---------- TEMA ---------- */
  applyTheme() {
    const theme = (this.user && this.user.theme) || 'dark';
    document.body.classList.toggle('light', theme === 'light');
    const darkBtn = document.getElementById('themeDarkBtn');
    const lightBtn = document.getElementById('themeLightBtn');
    if (darkBtn && lightBtn) {
      darkBtn.classList.toggle('active', theme === 'dark');
      lightBtn.classList.toggle('active', theme === 'light');
    }
    return theme;
  },

  async setTheme(theme) {
    this.applyTheme();
    if (!this.isLogged) { this.user = { ...(this.user || {}), theme }; return; }
    try {
      const data = await this.api('/api/settings', { method: 'PUT', body: JSON.stringify({ theme }) });
      this.user = data.user;
      this.renderProfile();
    } catch (e) {
      Toast.error(e.message);
    }
  },

  /* ---------- PERFIL ---------- */
  async saveName(name) {
    if (!this.isLogged) { Toast.error('Primero inicia sesión en Ajustes'); return; }
    try {
      const data = await this.api('/api/settings', { method: 'PUT', body: JSON.stringify({ username: name }) });
      this.user = data.user;
      this.renderProfile();
      Toast.success('¡Nombre actualizado! ✓');
    } catch (e) {
      Toast.error(e.message);
    }
  },

  async savePicture(dataUrl) {
    if (!this.isLogged) { Toast.error('Primero inicia sesión en Ajustes'); return; }
    try {
      const data = await this.api('/api/settings', { method: 'PUT', body: JSON.stringify({ profilePic: dataUrl }) });
      this.user = data.user;
      this.renderProfile();
      Toast.success('¡Foto de perfil actualizada! 📷');
    } catch (e) {
      Toast.error(e.message);
    }
  },

  /* ---------- ESTADÍSTICAS (tiempo + EXP) ---------- */
  addPlaytime(seconds) {
    if (seconds > 0) this.pendingTime += seconds;
    if (this.pendingTime >= 60 || seconds < 0) this.flushTime();
  },

  async flushTime() {
    if (!this.isLogged) return;
    const seconds = Math.floor(this.pendingTime);
    if (seconds <= 0) return;
    this.pendingTime -= seconds;
    try {
      const data = await this.api('/api/stats', { method: 'POST', body: JSON.stringify({ seconds }) });
      if (data.user) {
        const was = this.expLevel ? this.expLevel.level : 1;
        this.user = data.user;
        this.expLevel = data.expLevel;
        this.renderProfile();
        if (data.expLevel && data.expLevel.level > was) {
          Toast.success(`¡Subiste al nivel ${data.expLevel.level}! 🎉`);
        }
      }
    } catch (e) {
      this.pendingTime += seconds; // reintenta luego
    }
  },

  async addExp(amount, coins = 0) {
    if (!this.isLogged) return false;
    try {
      const before = this.expLevel ? this.expLevel.level : 1;
      const data = await this.api('/api/stats', { method: 'POST', body: JSON.stringify({ exp: amount, coins }) });
      this.user = data.user;
      this.expLevel = data.expLevel;
      this.renderProfile();
      if (data.expLevel && data.expLevel.level > before) {
        Toast.success(`💎 ¡Subiste a nivel ${data.expLevel.level}! ¡Revisa los marcos!`, 3200);
        return true;
      }
    } catch (e) {}
    return false;
  },

  /* ---------- MARCOS ---------- */
  async loadFrames() {
    try {
      const data = await this.api('/api/frames');
      this.framesCatalog = data.frames.map(f => {
        const known = { none: '', bronce: 'frame-bronce', plata: 'frame-plata', oro: 'frame-oro', neon: 'frame-neon', diamante: 'frame-diamante' };
        return { ...f, css: known[f.id] || '' };
      });
      this.renderFrames();
    } catch (e) {
      this.renderFrames();
    }
  },

  async buyFrame(id) {
    if (!this.isLogged) { Toast.error('Inicia sesión para comprar'); return; }
    try {
      const data = await this.api('/api/frames/buy', { method: 'POST', body: JSON.stringify({ frameId: id }) });
      this.user = { ...this.user, coins: data.coins, frames: data.frames };
      this.renderProfile();
      this.renderFrames();
      Toast.success('¡Marco comprado! 🖼️');
    } catch (e) {
      Toast.error(e.message);
    }
  },

  async equipFrame(id) {
    if (!this.isLogged) { Toast.error('Inicia sesión para equipar'); return; }
    try {
      const data = await this.api('/api/frames/equip', { method: 'POST', body: JSON.stringify({ frameId: id }) });
      this.user = { ...this.user, equippedFrame: data.equippedFrame };
      this.renderProfile();
      this.renderFrames();
      Toast.success('¡Marco equipado! ✨');
    } catch (e) {
      Toast.error(e.message);
    }
  },

  /* ---------- RENDER ---------- */
  renderProfile() {
    const isLogged = this.isLogged && this.user;
    const nameEl = document.getElementById('profileName');
    const levelEl = document.getElementById('profileLevel');
    const hoursEl = document.getElementById('profileHours');
    const coinsEl = document.getElementById('profileCoins');
    const avatarImg = document.getElementById('avatarImg');
    const avatarPh = document.getElementById('avatarPlaceholder');
    const frame = document.getElementById('avatarFrame');
    const guestNote = document.getElementById('settingsGuestNote');
    const loginBtn = document.getElementById('settingsLoginBtn');
    const registerBtn = document.getElementById('settingsRegisterBtn');
    const logoutBtn = document.getElementById('settingsLogoutBtn');

    if (isLogged && this.user) {
      const u = this.user;
      nameEl.textContent = u.username;
      levelEl.textContent = `Nivel ${this.expLevel.level} · ${this.expLevel.into}/${this.expLevel.need} EXP`;
      hoursEl.textContent = `⏱ ${u.hoursPlayed || 0} horas jugadas`;
      coinsEl.textContent = `🪙 ${u.coins || 0} puntos`;
      avatarImg.src = u.profilePic || '';
      avatarImg.classList.toggle('hidden', !u.profilePic);
      avatarPh.classList.toggle('hidden', !!u.profilePic);
      const frameCss = this.framesCatalog.find(f => f.id === u.equippedFrame);
      frame.className = 'avatar-frame' + (frameCss && frameCss.css ? ' ' + frameCss.css : '');
      guestNote.textContent = 'Mi perfil guardado en la cuenta. ¡Todo se sincroniza!';
      loginBtn.classList.add('hidden');
      registerBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
    } else {
      nameEl.textContent = 'Invitado';
      levelEl.textContent = 'Nivel 1 · 0 EXP';
      hoursEl.textContent = '⏱ 0 horas jugadas';
      coinsEl.textContent = '🪙 0 puntos';
      avatarImg.classList.add('hidden');
      avatarPh.classList.remove('hidden');
      frame.className = 'avatar-frame';
      guestNote.textContent = 'Inicia sesión para guardar tu perfil en tu cuenta.';
      loginBtn.classList.remove('hidden');
      registerBtn.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
    }
    if (this.user) this.applyTheme();
  },

  renderFrames() {
    const grid = document.getElementById('framesGrid');
    if (!grid) return;
    const owned = (this.user && this.user.frames) || ['none'];
    const equipped = (this.user && this.user.equippedFrame) || 'none';
    grid.innerHTML = '';
    this.framesCatalog.forEach(f => {
      const div = document.createElement('div');
      div.className = 'frame-card' + (owned.includes(f.id) ? ' owned' : '') + (equipped === f.id ? ' equipped' : '');
      div.innerHTML = `
        <div class="frame-preview ${f.css || ''}"><span>👾</span></div>
        <p class="frame-name">${f.name}</p>
        <p class="frame-price">${owned.includes(f.id) ? (equipped === f.id ? '✓ Equipado' : 'Comprado') : '🪙 ' + f.price}</p>
        <button class="btn btn-sm ${f.price === 0 || owned.includes(f.id) ? 'btn-primary' : 'btn-ghost'}" data-frame="${f.id}">
          ${equipped === f.id ? 'Equipado' : owned.includes(f.id) ? 'Equipar' : 'Comprar'}
        </button>`;
      div.querySelector('button').addEventListener('click', () => {
        if (owned.includes(f.id)) this.equipFrame(f.id);
        else this.buyFrame(f.id);
      });
      grid.appendChild(div);
    });
  },

  /* ---------- UI EVENTS ---------- */
  bindUI() {
    // Ajustes (menú)
    document.getElementById('settingsMenuBtn').addEventListener('click', (e) => {
      e.preventDefault();
      const overlay = document.getElementById('settingsOverlay');
      overlay.classList.remove('hidden');
      this.renderProfile();
      this.loadFrames();
    });
    document.getElementById('settingsCloseBtn').addEventListener('click', () => {
      document.getElementById('settingsOverlay').classList.add('hidden');
    });

    // Guía (menú)
    document.querySelector('.nav a[href="#guia"]').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('guiaOverlay').classList.remove('hidden');
    });

    // Tema
    document.getElementById('themeDarkBtn').addEventListener('click', () => this.setTheme('dark'));
    document.getElementById('themeLightBtn').addEventListener('click', () => this.setTheme('light'));

    // Login / Registro
    const loginBtn = document.getElementById('settingsLoginBtn');
    const registerBtn = document.getElementById('settingsRegisterBtn');
    const doAuth = async (isRegister) => {
      if (this.isLogged) { this.logout(); return; }
      const userEl = document.getElementById('settingsUser');
      const passEl = document.getElementById('settingsPass');
      const errEl = document.getElementById('settingsError');
      const username = userEl.value.trim();
      const password = passEl.value;
      errEl.classList.add('hidden');
      if (!username || !password) { errEl.textContent = 'Completa usuario y contraseña'; errEl.classList.remove('hidden'); return; }
      try {
        await this.login(username, password, isRegister);
        userEl.value = ''; passEl.value = '';
      } catch (e) {
        errEl.textContent = e.message;
        errEl.classList.remove('hidden');
      }
      this.renderProfile();
    };
    loginBtn.addEventListener('click', () => doAuth(false));
    registerBtn.addEventListener('click', () => doAuth(true));

    // Botón de cerrar sesión (visible cuando hay cuenta)
    const handleLogout = document.getElementById('settingsLogoutBtn');
    handleLogout.addEventListener('click', () => this.logout());

    // Cambiar nombre
    document.getElementById('saveNameBtn').addEventListener('click', () => {
      const input = document.getElementById('changeNameInput');
      const name = input.value.trim();
      if (name.length >= 3) { this.saveName(name); input.value = ''; }
      else Toast.error('El nombre debe tener al menos 3 caracteres');
    });

    // Foto de perfil
    document.getElementById('uploadPicBtn').addEventListener('click', () => {
      document.getElementById('picInput').click();
    });
    document.getElementById('picInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { Toast.error('La imagen es muy grande (máx 5MB)'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const size = 200;
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const ctx2 = canvas.getContext('2d');
          const scale = Math.max(size / img.width, size / img.height);
          const w = img.width * scale, h = img.height * scale;
          ctx2.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          this.savePicture(dataUrl);
          // Vista previa inmediata
          const av = document.getElementById('avatarImg');
          av.src = dataUrl; av.classList.remove('hidden');
          document.getElementById('avatarPlaceholder').classList.add('hidden');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    // Cerrar overlays al hacer clic en el fondo
    ['settingsOverlay', 'guiaOverlay'].forEach(id => {
      document.getElementById(id).addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
      });
    });
  }
};

/* Inicializar cuando el DOM esté listo */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Profile.init());
} else {
  Profile.init();
}