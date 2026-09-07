const Profile = {
  token: null,
  user: null,
  expLevel: 1,
  pendingTime: 0,
  active: false,
  framesCatalog: [
    { id: 'none', name: 'Ninguno', price: 0 },
    { id: 'bronce', name: 'Bronce', price: 200 },
    { id: 'plata', name: 'Plata', price: 400 },
    { id: 'oro', name: 'Oro', price: 700 },
    { id: 'neon', name: 'Neón', price: 1000 },
    { id: 'diamante', name: 'Diamante', price: 1500 }
  ],

  async api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  },

  async init() {
    this.token = localStorage.getItem('fx_token');
    this.bindUI();
    const savedTheme = localStorage.getItem('ci_theme');
    if (savedTheme) this.applyTheme(savedTheme);
    if (this.token) await this.restoreSession();
  },

  async restoreSession() {
    try {
      const data = await this.api('/api/me');
      this.user = data.user;
      this.expLevel = data.expLevel || 1;
      this.active = true;
      this.applyTheme(this.user.theme || 'dark');
      this.renderProfile();
      await this.loadFrames();
    } catch (e) {
      this.token = null;
      this.user = null;
      this.active = false;
    }
  },

  isLogged() {
    return this.active && !!this.user;
  },

  bindUI() {
    const settingsNavBtn = document.getElementById('settingsNavBtn');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const settingsLoginBtn = document.getElementById('settingsLoginBtn');
    const settingsRegisterBtn = document.getElementById('settingsRegisterBtn');
    const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
    const themeDarkBtn = document.getElementById('themeDarkBtn');
    const themeLightBtn = document.getElementById('themeLightBtn');
    const uploadPicBtn = document.getElementById('uploadPicBtn');
    const picInput = document.getElementById('picInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const changeNameInput = document.getElementById('changeNameInput');

    if (settingsNavBtn) settingsNavBtn.addEventListener('click', () => {
      settingsOverlay.classList.remove('hidden');
      this.renderProfile();
    });
    if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', () => settingsOverlay.classList.add('hidden'));
    if (settingsOverlay) settingsOverlay.addEventListener('click', (e) => {
      if (e.target === settingsOverlay) settingsOverlay.classList.add('hidden');
    });

    if (settingsLoginBtn) settingsLoginBtn.addEventListener('click', async () => {
      const u = document.getElementById('settingsUser').value.trim();
      const p = document.getElementById('settingsPass').value;
      const errEl = document.getElementById('settingsError');
      errEl.classList.add('hidden');
      try {
        const data = await this.api('/api/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
        this.token = data.token;
        this.user = data.user;
        this.expLevel = data.expLevel || 1;
        localStorage.setItem('fx_token', data.token);
        this.active = true;
        this.applyTheme(this.user.theme || 'dark');
        this.renderProfile();
        await this.loadFrames();
        if (typeof Auth !== 'undefined' && Auth.restoreSession) await Auth.restoreSession();
        this.renderProfile();
      } catch (e) {
        errEl.textContent = e.message;
        errEl.classList.remove('hidden');
      }
    });

    if (settingsRegisterBtn) settingsRegisterBtn.addEventListener('click', async () => {
      const u = document.getElementById('settingsUser').value.trim();
      const p = document.getElementById('settingsPass').value;
      const errEl = document.getElementById('settingsError');
      errEl.classList.add('hidden');
      try {
        const data = await this.api('/api/register', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
        this.token = data.token;
        this.user = data.user;
        this.expLevel = data.expLevel || 1;
        localStorage.setItem('fx_token', data.token);
        this.active = true;
        this.applyTheme(this.user.theme || 'dark');
        this.renderProfile();
        await this.loadFrames();
        if (typeof Auth !== 'undefined' && Auth.restoreSession) await Auth.restoreSession();
      } catch (e) {
        errEl.textContent = e.message;
        errEl.classList.remove('hidden');
      }
    });

    if (settingsLogoutBtn) settingsLogoutBtn.addEventListener('click', async () => {
      this.flushTime(true);
      try { await this.api('/api/logout', { method: 'POST' }); } catch (e) { }
      this.token = null;
      this.user = null;
      this.active = false;
      this.pendingTime = 0;
      localStorage.removeItem('fx_token');
      this.renderProfile();
      if (typeof Auth !== 'undefined' && Auth.logoutLocal) Auth.logoutLocal();
    });

    if (themeDarkBtn) themeDarkBtn.addEventListener('click', () => this.setTheme('dark'));
    if (themeLightBtn) themeLightBtn.addEventListener('click', () => this.setTheme('light'));
    if (uploadPicBtn) uploadPicBtn.addEventListener('click', () => picInput && picInput.click());
    if (picInput) picInput.addEventListener('change', (e) => this.savePicture(e));
    if (saveNameBtn) saveNameBtn.addEventListener('click', () => this.saveName());
  },

  applyTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    const darkBtn = document.getElementById('themeDarkBtn');
    const lightBtn = document.getElementById('themeLightBtn');
    if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
    if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
    try { localStorage.setItem('ci_theme', theme); } catch (e) {}
  },

  async setTheme(theme) {
    this.applyTheme(theme);
    if (this.isLogged()) {
      try { await this.api('/api/settings', { method: 'PUT', body: JSON.stringify({ theme }) }); } catch (e) { }
    }
  },

  async savePicture(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        const avatarImg = document.getElementById('avatarImg');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImg) { avatarImg.src = base64; avatarImg.style.display = 'block'; }
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        if (this.isLogged()) {
          try { await this.api('/api/settings', { method: 'PUT', body: JSON.stringify({ profilePic: base64 }) }); } catch (e) { }
          if (this.user) this.user.profilePic = base64;
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  },

  async saveName() {
    const nameInput = document.getElementById('changeNameInput');
    const name = nameInput && nameInput.value.trim();
    if (!name || name.length < 3) return;
    if (this.isLogged()) {
      try {
        await this.api('/api/settings', { method: 'PUT', body: JSON.stringify({ username: name }) });
        if (this.user) this.user.username = name;
        nameInput.value = '';
        this.renderProfile();
      } catch (e) { }
    }
  },

  addPlaytime(seconds) {
    if (!this.isLogged()) return;
    this.pendingTime += seconds;
    if (this.pendingTime >= 60) this.flushTime();
  },

  async flushTime(force) {
    if (!this.isLogged() || this.pendingTime < 10 && !force) return;
    const seconds = this.pendingTime;
    this.pendingTime = 0;
    try {
      await this.api('/api/stats', { method: 'POST', body: JSON.stringify({ seconds }) });
    } catch (e) { }
  },

  async addExp(amount, coins) {
    if (!this.isLogged()) return false;
    try {
      const data = await this.api('/api/stats', { method: 'POST', body: JSON.stringify({ seconds: 0, exp: amount, coins: coins || 0 }) });
      if (data.exp !== undefined) this.user.exp = data.exp;
      if (data.coins !== undefined) this.user.coins = data.coins;
      const newLevel = data.expLevel || this.expLevel;
      const leveled = newLevel > this.expLevel;
      this.expLevel = newLevel;
      this.renderProfile();
      return leveled;
    } catch (e) { return false; }
  },

  async loadFrames() {
    try {
      const data = await this.api('/api/frames');
      if (data.frames) this.framesCatalog = data.frames;
    } catch (e) { }
    this.renderFrames();
  },

  async buyFrame(id) {
    if (!this.isLogged()) return;
    try {
      const data = await this.api('/api/frames/buy', { method: 'POST', body: JSON.stringify({ frameId: id }) });
      if (this.user) { this.user.frames = data.frames; this.user.coins = data.coins; }
      this.renderFrames();
      this.renderProfile();
    } catch (e) { }
  },

  async equipFrame(id) {
    if (!this.isLogged()) return;
    try {
      await this.api('/api/frames/equip', { method: 'POST', body: JSON.stringify({ frameId: id }) });
      if (this.user) this.user.equippedFrame = id;
      this.renderFrames();
    } catch (e) { }
  },

  renderProfile() {
    const nameEl = document.getElementById('profileName');
    const levelEl = document.getElementById('profileLevel');
    const hoursEl = document.getElementById('profileHours');
    const coinsEl = document.getElementById('profileCoins');
    const avatarImg = document.getElementById('avatarImg');
    const avatarPH = document.getElementById('avatarPlaceholder');
    const avatarFrame = document.getElementById('avatarFrame');
    const loginFields = document.getElementById('loginFields');
    const guestNote = document.getElementById('settingsGuestNote');
    const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
    const settingsLoginBtn = document.getElementById('settingsLoginBtn');
    const settingsRegisterBtn = document.getElementById('settingsRegisterBtn');
    const settingsLoggedIn = document.getElementById('settingsLoggedIn');
    const framesSection = document.getElementById('framesSection');

    if (this.isLogged()) {
      if (nameEl) nameEl.textContent = this.user.username || 'Invitado';
      if (levelEl) levelEl.textContent = `Nivel ${this.expLevel} · ${this.user.exp || 0} EXP`;
      if (hoursEl) hoursEl.textContent = `⏱ ${this.user.hoursPlayed || 0} horas jugadas`;
      if (coinsEl) coinsEl.textContent = `🪙 ${this.user.coins || 0} puntos`;
      if (avatarImg && this.user.profilePic) { avatarImg.src = this.user.profilePic; avatarImg.style.display = 'block'; }
      if (avatarPH && this.user.profilePic) avatarPH.style.display = 'none';
      if (avatarFrame) {
        avatarFrame.className = 'avatar-frame';
        if (this.user.equippedFrame && this.user.equippedFrame !== 'none') avatarFrame.classList.add('frame-' + this.user.equippedFrame);
      }
      if (loginFields) loginFields.classList.add('hidden');
      if (guestNote) guestNote.classList.add('hidden');
      if (settingsLogoutBtn) settingsLogoutBtn.classList.remove('hidden');
      if (settingsLoginBtn) settingsLoginBtn.classList.add('hidden');
      if (settingsRegisterBtn) settingsRegisterBtn.classList.add('hidden');
      if (settingsLoggedIn) settingsLoggedIn.classList.remove('hidden');
      if (framesSection) framesSection.classList.remove('hidden');
    } else {
      if (nameEl) nameEl.textContent = 'Invitado';
      if (levelEl) levelEl.textContent = '';
      if (hoursEl) hoursEl.textContent = '';
      if (coinsEl) coinsEl.textContent = '';
      if (avatarImg) { avatarImg.src = ''; avatarImg.style.display = 'none'; }
      if (avatarPH) avatarPH.style.display = '';
      if (avatarFrame) avatarFrame.className = 'avatar-frame';
      if (loginFields) loginFields.classList.remove('hidden');
      if (guestNote) guestNote.classList.remove('hidden');
      if (settingsLogoutBtn) settingsLogoutBtn.classList.add('hidden');
      if (settingsLoginBtn) settingsLoginBtn.classList.remove('hidden');
      if (settingsRegisterBtn) settingsRegisterBtn.classList.remove('hidden');
      if (settingsLoggedIn) settingsLoggedIn.classList.add('hidden');
      if (framesSection) framesSection.classList.add('hidden');
    }
  },

  renderFrames() {
    const grid = document.getElementById('framesGrid');
    if (!grid) return;
    const userFrames = (this.user && this.user.frames) || ['none'];
    const equipped = (this.user && this.user.equippedFrame) || 'none';
    const coins = (this.user && this.user.coins) || 0;
    grid.innerHTML = this.framesCatalog.map(f => {
      const owned = userFrames.includes(f.id);
      const isActive = f.id === equipped;
      const canBuy = !owned && coins >= f.price;
      let btn = '';
      if (isActive) btn = '<button class="btn btn-ghost btn-sm" disabled>Equipado</button>';
      else if (owned) btn = `<button class="btn btn-primary btn-sm frame-equip" data-frame="${f.id}">Equipar</button>`;
      else if (canBuy) btn = `<button class="btn btn-primary btn-sm frame-buy" data-frame="${f.id}">Comprar (${f.price})</button>`;
      else btn = `<button class="btn btn-ghost btn-sm" disabled>${f.price} EXP</button>`;
      return `<div class="frame-card${isActive ? ' active' : ''}"><div class="frame-preview frame-${f.id}"></div><p>${f.name}</p>${btn}</div>`;
    }).join('');
    grid.querySelectorAll('.frame-buy').forEach(btn => btn.addEventListener('click', () => this.buyFrame(btn.dataset.frame)));
    grid.querySelectorAll('.frame-equip').forEach(btn => btn.addEventListener('click', () => this.equipFrame(btn.dataset.frame)));
  }
};
