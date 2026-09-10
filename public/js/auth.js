/* Autenticación: login, registro, sesión (BD en el servidor) */
const Auth = {
  token: null,
  user: null,
  progress: [],

  init() {
    this.token = localStorage.getItem('fx_token');
    this.bindUI();
    if (this.token) this.restoreSession();
  },

  get isLogged() { return !!this.token; },

  bindUI() {
    document.getElementById('loginBtn').addEventListener('click', () => Modal.open('login'));
    document.getElementById('authClose').addEventListener('click', Modal.close);
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => Modal.switchTab(tab.dataset.tab));
    });
    document.getElementById('authForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitForm();
    });
    const modal = document.getElementById('authModal');
    modal.addEventListener('click', (e) => { if (e.target === modal) Modal.close(); });
    document.addEventListener('click',e=>{
      const btn=e.target.closest('.pass-toggle');
      if(!btn) return;
      const inp=document.getElementById(btn.dataset.target);
      if(!inp) return;
      const show=inp.type==='password';
      inp.type=show?'text':'password';
      btn.textContent=show?'🙈':'👁️';
    });
  },

  async restoreSession() {
    try {
      const data = await API.me();
      this.user = data.user;
      this.progress = data.progress || [];
      this.render();
      if (typeof Game !== 'undefined' && Game.refreshSession) Game.refreshSession();
      if (typeof Game !== 'undefined' && Game.loadProgress) Game.loadProgress();
      // Show leaderboard after login
      const lb=document.querySelector('.leaderboard'); if(lb) lb.classList.remove('hidden');
    } catch (e) {
      this.logoutLocal();
    }
  },

  async submitForm() {
    const username = document.getElementById('authUser').value.trim();
    const password = document.getElementById('authPass').value;
    const isRegister = document.getElementById('authTitle').textContent.includes('Registro');
    const errEl = document.getElementById('authError');
    errEl.classList.add('hidden');
    try {
      const data = isRegister ? await API.register(username, password) : await API.login(username, password);
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('fx_token', data.token);
      await this.restoreSession();
      Modal.close();
      Notifications.sync();
      Toast.success(`¡Hola, ${data.user.username}!`);
      Notifications.sendBrowser('Sesión iniciada', `Bienvenido de nuevo, ${data.user.username}`);
      if (typeof Game !== 'undefined' && Game.refreshSession) Game.refreshSession();
      if (typeof Game !== 'undefined') Game.loadProgress();
    } catch (e) {
      errEl.textContent = e.message;
      errEl.classList.remove('hidden');
    }
  },

  async logout() {
    try { await API.logout(); } catch (e) { /* ignorar */ }
    this.logoutLocal();
    Toast.info('Sesión cerrada');
  },

  logoutLocal() {
    this.token = null;
    this.user = null;
    this.progress = [];
    localStorage.removeItem('fx_token');
    this.render();
    if (typeof Game !== 'undefined' && Game.onLogoutCleanup) Game.onLogoutCleanup();
    else if (typeof Game !== 'undefined' && Game.clearGuestSession) Game.clearGuestSession();
    // Toggle leaderboard visibility for guest session clear
    const lb=document.querySelector('.leaderboard'); if(lb) lb.classList.add('hidden');
    if (typeof Game !== 'undefined') Game.loadProgress();
  },

  render() {
    const box = document.getElementById('userBox');
    if (this.isLogged && this.user) {
      box.innerHTML = `<span class="user-chip">👤 ${this.user.username}</span>
        <button class="btn btn-ghost btn-sm" id="logoutBtn">Salir</button>`;
      document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    } else {
      box.innerHTML = '<button class="btn btn-primary btn-sm" id="loginBtn">Iniciar sesión</button>';
      document.getElementById('loginBtn').addEventListener('click', () => Modal.open('login'));
    }
  },

  isSolved(level) {
    return this.progress.some(p => p.level === level && p.solved);
  }
};

const Modal = {
  mode: 'login',
  open(mode) {
    this.mode = mode || 'login';
    document.getElementById('authModal').classList.remove('hidden');
    this.switchTab(this.mode);
  },
  close() {
    document.getElementById('authModal').classList.add('hidden');
  },
  switchTab(mode) {
    this.mode = mode;
    document.getElementById('authTitle').textContent = mode === 'register' ? 'Registro' : 'Iniciar sesión';
    document.getElementById('authSubmit').textContent = mode === 'register' ? 'Crear cuenta' : 'Entrar';
    document.querySelectorAll('.tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === mode));
    document.getElementById('authError').classList.add('hidden');
  }
};

const Toast = {
  show(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 3200);
    setTimeout(() => el.remove(), 3700);
  },
  success: (m) => Toast.show(m, 'success'),
  error: (m) => Toast.show(m, 'error'),
  info: (m) => Toast.show(m, 'info')
};

// FIX: sincronizar Profile con Auth para que horas/perfil no se pierdan al loguear por el modal
(function(){
  function syncP(){
    try{
      if(typeof Profile!=='undefined'&&typeof Auth!=='undefined'){
        if(Auth.token) Profile.token=Auth.token;
        if(Auth.user&&typeof Profile.syncAuth==='function') Profile.syncAuth();
        else if(Auth.user){ Profile.user=JSON.parse(JSON.stringify(Auth.user)); Profile.active=true; }
        if(Profile.renderProfile) Profile.renderProfile();
        if(Profile.loadFrames&&Auth.user) Profile.loadFrames();
      }
    }catch(e){}
  }
  function clearP(){
    try{
      if(typeof Profile!=='undefined'){
        Profile.token=null; Profile.user=null; Profile.active=false; Profile.pendingTime=0;
        if(Profile.renderProfile) Profile.renderProfile();
      }
    }catch(e){}
  }
  if(typeof Auth!=='undefined'){
    const _rs=Auth.restoreSession.bind(Auth);
    Auth.restoreSession=async function(){ const r=await _rs.apply(this,arguments); syncP(); return r; };
    const _ll=Auth.logoutLocal.bind(Auth);
    Auth.logoutLocal=function(){ const r=_ll.apply(this,arguments); clearP(); return r; };
  }
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(syncP,800); });
})();

