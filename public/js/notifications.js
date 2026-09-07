/* Notificaciones: centro de notificaciones (BD) + Notifications API del navegador */
const Notifications = {
  list: [],
  unread: 0,
  permission: 'default',

  init() {
    this.bindUI();
    if ('Notification' in window) {
      this.permission = Notification.permission;
      if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
        setTimeout(() => this.requestPermission(), 3000);
      }
    }
  },

  bindUI() {
    const bell = document.getElementById('bellBtn');
    const panel = document.getElementById('notifPanel');
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      if (isHidden) { this.render(); this.markAllRead(); }
    });
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !bell.contains(e.target)) panel.classList.add('hidden');
    });
  },

  async requestPermission() {
    try {
      this.permission = await Notification.requestPermission();
      if (this.permission === 'granted') {
        Toast.success('Notificaciones del navegador activadas 🔔');
        this.sendBrowser('Code Invaders', '¡Notificaciones activadas! Te avisaré de tus logros.');
      }
    } catch (e) { /* no soportado */ }
  },

  sendBrowser(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return;
    try {
      const n = new Notification(title, { body, icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🐸</text></svg>' });
      setTimeout(() => n.close(), 6000);
      n.onclick = () => { window.focus(); n.close(); };
    } catch (e) { /* algunos navegadores requieren SW */ }
  },

  async sync() {
    if (!Auth.isLogged) { this.renderLocal(); return; }
    try {
      const data = await API.getNotifications();
      this.list = data.notifications;
      this.unread = data.unread;
    } catch (e) {
      this.renderLocal();
    }
    this.render();
  },

  renderLocal() {
    const local = JSON.parse(localStorage.getItem('fx_notifications') || '[]');
    this.list = local;
    this.unread = local.filter(n => !n.read).length;
  },

  addLocal(title, body, type) {
    const local = JSON.parse(localStorage.getItem('fx_notifications') || '[]');
    local.unshift({ id: 'l' + Date.now(), title, body, type, read: false, createdAt: new Date().toISOString() });
    localStorage.setItem('fx_notifications', JSON.stringify(local));
    this.list = local;
    this.unread = local.filter(n => !n.read).length;
    this.render();
  },

  async markAllRead() {
    if (Auth.isLogged) {
      try { await API.markNotificationsRead(); } catch (e) { /* ignore */ }
    } else {
      this.list.forEach(n => n.read = true);
      localStorage.setItem('fx_notifications', JSON.stringify(this.list));
    }
    this.unread = 0;
    this.render();
  },

  render() {
    const badge = document.getElementById('bellBadge');
    badge.textContent = this.unread;
    badge.classList.toggle('hidden', this.unread === 0);

    const panel = document.getElementById('notifPanel');
    if (this.list.length === 0) {
      panel.innerHTML = '<div class="notif-empty">🔔 Sin notificaciones todavía</div>';
      return;
    }
    panel.innerHTML = this.list.slice(0, 25).map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <div style="font-size:1.1rem">${n.type === 'success' ? '🎉' : n.type === 'error' ? '⚠️' : 'ℹ️'}</div>
        <div>
          <div class="n-title">${n.title}</div>
          <div class="n-body">${n.body}</div>
          <div class="n-time">${new Date(n.createdAt).toLocaleString('es')}</div>
        </div>
      </div>`).join('');
  }
};