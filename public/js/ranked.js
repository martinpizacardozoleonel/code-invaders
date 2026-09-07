const Ranked = {
  clockInterval: null,
  checkInterval: null,
  activeTab: 'normal',
  boards: { normal: [], speedrun: [] },
  tournamentData: null,

  init() {
    this.bindUI();
  },

  bindUI() {
    const inspectClose = document.getElementById('inspectCloseBtn');
    const inspectOverlay = document.getElementById('inspectOverlay');
    if (inspectClose) inspectClose.addEventListener('click', () => inspectOverlay.classList.add('hidden'));
    if (inspectOverlay) inspectOverlay.addEventListener('click', (e) => {
      if (e.target === inspectOverlay) inspectOverlay.classList.add('hidden');
    });
    document.querySelectorAll('.ranked-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        document.querySelectorAll('.ranked-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === this.activeTab));
        this.render();
      });
    });
  },

  formatTime(ms){
    if(ms==null) return '—';
    const s=ms/1000, m=Math.floor(s/60), sec=Math.floor(s%60), cs=Math.floor((ms%1000)/10);
    return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs).padStart(2,'0');
  },

  async loadRanking() {
    const grid = document.getElementById('rankedGrid');
    if (!grid) return;
    grid.innerHTML = '<p class="lead">Cargando ranking...</p>';
    try {
      const [boardData, speedrunData, tournamentData] = await Promise.all([
        API.leaderboard(),
        API.leaderboardSpeedrun().catch(() => ({ board: [] })),
        API.getTournament().catch(() => ({ tournament: null, playerCount: 0, minPlayers: 10 }))
      ]);
      this.tournamentData = tournamentData;
      this.boards.normal = boardData.board || [];
      this.boards.speedrun = speedrunData.board || [];
      this.renderTournamentBanner(tournamentData);
      document.querySelectorAll('.ranked-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === this.activeTab));
      this.render();
    } catch (e) {
      grid.innerHTML = '<p class="lead">Error al cargar el ranking.</p>';
    }
  },

  render(){
    const grid = document.getElementById('rankedGrid');
    if(!grid) return;
    if(this.activeTab==='speedrun') this.renderSpeedrun(grid);
    else this.renderNormal(grid);
  },

  renderNormal(grid){
    const board = this.boards.normal;
    if (board.length === 0) {
      grid.innerHTML = '<p class="lead">No hay jugadores en el ranking todavía. ¡Jugá para aparecer!</p>';
      return;
    }
    const tournament = this.tournamentData && this.tournamentData.tournament;
    const isFinished = tournament && tournament.status === 'finished';
    const results = isFinished ? tournament.results : null;
    grid.innerHTML = board.map((u, i) => {
      const medals = ['🥇', '🥈', '🥉'];
      const medal = i < 3 ? medals[i] : `<span class="ranked-pos">${i + 1}</span>`;
      const frameClass = u.equippedFrame && u.equippedFrame !== 'none' ? ' frame-' + u.equippedFrame : '';
      const picHtml = u.profilePic ? `<img src="${u.profilePic}" alt="${u.username}" class="ranked-avatar">` : `<span class="ranked-avatar-placeholder">👾</span>`;
      let positionBadge = '';
      if (isFinished && results && results[u.id]) {
        const pos = results[u.id].position;
        if (pos <= 3) positionBadge = `<span class="ranked-position-badge ranked-pos-${pos}">#${pos}</span>`;
      }
      const timeBadge = u.speedrunBest ? `<span class="ranked-time">⚡ ${this.formatTime(u.speedrunBest)}</span>` : '';
      return `
          <div class="ranked-card" data-user-id="${u.id}">
            <div class="ranked-medal">${medal}</div>
            <div class="ranked-avatar-wrap${frameClass}">${picHtml}</div>
            <div class="ranked-info">
              <p class="ranked-name">${u.username} ${positionBadge}</p>
              <p class="ranked-stats">❤️ ${u.solved} niveles · ⭐ ${u.exp || 0} EXP · ⏱ ${u.hoursPlayed || 0}h ${timeBadge}</p>
            </div>
            <div class="ranked-coins">🪙 ${u.coins || 0}</div>
            <button class="btn btn-ghost btn-sm ranked-inspect" data-user-id="${u.id}">👤 Ver perfil</button>
          </div>
        `;
    }).join('');
    this.bindCardEvents(grid);
  },

  renderSpeedrun(grid){
    const board = this.boards.speedrun;
    if (board.length === 0) {
      grid.innerHTML = '<p class="lead">⚡ Aún nadie completó un speedrun. ¡Sé el primero! Completa el Nivel 1 en modo SPEEDRUN.</p>';
      return;
    }
    grid.innerHTML = board.map((u, i) => {
      const medals = ['🥇', '🥈', '🥉'];
      const medal = i < 3 ? medals[i] : `<span class="ranked-pos">${i + 1}</span>`;
      const frameClass = u.equippedFrame && u.equippedFrame !== 'none' ? ' frame-' + u.equippedFrame : '';
      const picHtml = u.profilePic ? `<img src="${u.profilePic}" alt="${u.username}" class="ranked-avatar">` : `<span class="ranked-avatar-placeholder">👾</span>`;
      const isTop3 = i < 3 ? ` ranked-pos-${i+1}` : '';
      return `
          <div class="ranked-card ranked-card-speedrun" data-user-id="${u.id}">
            <div class="ranked-medal">${medal}</div>
            <div class="ranked-avatar-wrap${frameClass}">${picHtml}</div>
            <div class="ranked-info">
              <p class="ranked-name">${u.username}</p>
              <p class="ranked-stats">⚡ <span class="ranked-time-main">${this.formatTime(u.speedrunBest)}</span> · ❤️ ${u.solved} niveles</p>
            </div>
            <div class="ranked-coins ranked-time-badge${isTop3}">⏱ ${this.formatTime(u.speedrunBest)}</div>
            <button class="btn btn-ghost btn-sm ranked-inspect" data-user-id="${u.id}">👤 Ver perfil</button>
          </div>
        `;
    }).join('');
    this.bindCardEvents(grid);
  },

  bindCardEvents(grid){
    grid.querySelectorAll('.ranked-inspect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.inspectUser(btn.dataset.userId);
      });
    });
    grid.querySelectorAll('.ranked-card').forEach(card => {
      card.addEventListener('click', () => this.inspectUser(card.dataset.userId));
    });
  },

  renderTournamentBanner(data) {
    const banner = document.getElementById('tournamentBanner');
    if (!banner) return;

    const { tournament, playerCount, minPlayers, canStart } = data;

    if (tournament && tournament.status === 'active') {
      const endDate = new Date(tournament.endDate);
      const now = new Date();
      const diff = endDate - now;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      banner.className = 'tournament-banner tournament-active';
      banner.innerHTML = `
        <div class="tournament-top">
          <div class="tournament-status">
            <span class="tournament-status-dot active"></span>
            <span>🔴 TORNEO EN CURSO</span>
          </div>
          <div class="tournament-clock" id="tournamentClock"></div>
        </div>
        <div class="tournament-countdown">
          <span class="tournament-countdown-label">Tiempo restante:</span>
          <div class="tournament-countdown-timer">
            <div class="countdown-unit"><span class="countdown-val" id="cdDays">${days}</span><span class="countdown-label">Días</span></div>
            <div class="countdown-unit"><span class="countdown-val" id="cdHours">${hours}</span><span class="countdown-label">Horas</span></div>
            <div class="countdown-unit"><span class="countdown-val" id="cdMins">${mins}</span><span class="countdown-label">Min</span></div>
            <div class="countdown-unit"><span class="countdown-val" id="cdSecs">${secs}</span><span class="countdown-label">Seg</span></div>
          </div>
        </div>
        <div class="tournament-end-date">
          📅 Finaliza: <strong>${endDate.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> a las <strong>${endDate.toLocaleTimeString('es-AR')}</strong>
        </div>
        <div class="tournament-rewards">
          <p class="tournament-rewards-title">🎁 Recompensas del Torneo:</p>
          <div class="tournament-rewards-grid">
            <div class="tournament-reward reward-1"><span class="reward-pos">🥇 1°</span><span class="reward-item">Marco Campeón Animado + Nave Silver + 100 pts</span></div>
            <div class="tournament-reward reward-2"><span class="reward-pos">🥈 2°</span><span class="reward-item">Nave Silver Ranked + 60 pts</span></div>
            <div class="tournament-reward reward-3"><span class="reward-pos">🥉 3°</span><span class="reward-item">60 puntos</span></div>
            <div class="tournament-reward reward-4"><span class="reward-pos">🎯 4°+</span><span class="reward-item">40 puntos</span></div>
          </div>
        </div>
      `;
      this.startClock(endDate);
      this.startCountdown(endDate);
    } else {
      this.stopClock();
      banner.className = 'tournament-banner tournament-pending';
      banner.innerHTML = `
        <div class="tournament-top">
          <div class="tournament-status">
            <span class="tournament-status-dot pending"></span>
            <span>⏳ TORNEO PRÓXIMAMENTE</span>
          </div>
        </div>
        <div class="tournament-players-needed">
          <p class="tournament-players-count">${playerCount} / ${minPlayers} jugadores</p>
          <p class="tournament-players-hint">Faltan <strong>${Math.max(0, minPlayers - playerCount)}</strong> jugadores para iniciar el torneo.</p>
          <div class="tournament-progress-bar">
            <div class="tournament-progress-fill" style="width: ${Math.min(100, (playerCount / minPlayers) * 100)}%"></div>
          </div>
        </div>
        <div class="tournament-rewards">
          <p class="tournament-rewards-title">🎁 Recompensas del Torneo:</p>
          <div class="tournament-rewards-grid">
            <div class="tournament-reward reward-1"><span class="reward-pos">🥇 1°</span><span class="reward-item">Marco Campeón Animado + Nave Silver + 100 pts</span></div>
            <div class="tournament-reward reward-2"><span class="reward-pos">🥈 2°</span><span class="reward-item">Nave Silver Ranked + 60 pts</span></div>
            <div class="tournament-reward reward-3"><span class="reward-pos">🥉 3°</span><span class="reward-item">60 puntos</span></div>
            <div class="tournament-reward reward-4"><span class="reward-pos">🎯 4°+</span><span class="reward-item">40 puntos</span></div>
          </div>
        </div>
        ${canStart ? '<p class="tournament-ready">✅ ¡Ya hay suficientes jugadores! El torneo puede comenzar.</p>' : ''}
      `;
    }
  },

  startClock(endDate) {
    this.stopClock();
    const updateClock = () => {
      const clockEl = document.getElementById('tournamentClock');
      if (!clockEl) { this.stopClock(); return; }
      const now = new Date();
      clockEl.textContent = `🕐 ${now.toLocaleTimeString('es-AR')} — ${now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    };
    updateClock();
    this.clockInterval = setInterval(updateClock, 1000);
  },

  stopClock() {
    if (this.clockInterval) { clearInterval(this.clockInterval); this.clockInterval = null; }
  },

  startCountdown(endDate) {
    if (this._cdInterval) clearInterval(this._cdInterval);
    const update = () => {
      const diff = endDate - new Date();
      if (diff <= 0) { clearInterval(this._cdInterval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
      set('cdDays', d); set('cdHours', h); set('cdMins', m); set('cdSecs', s);
    };
    update();
    this._cdInterval = setInterval(update, 1000);
  },

  async inspectUser(userId) {
    const overlay = document.getElementById('inspectOverlay');
    const content = document.getElementById('inspectContent');
    if (!overlay || !content) return;
    content.innerHTML = '<p>Cargando perfil...</p>';
    overlay.classList.remove('hidden');
    try {
      const data = await API.getUserProfile(userId);
      const frameClass = data.equippedFrame && data.equippedFrame !== 'none' ? ' frame-' + data.equippedFrame : '';
      const picHtml = data.profilePic
        ? `<img src="${data.profilePic}" alt="${data.username}" class="inspect-avatar">`
        : `<span class="inspect-avatar-placeholder">👾</span>`;
      const expLevel = Math.floor((data.exp || 0) / 100) + 1;
      const created = data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-AR') : 'Desconocido';
      const speedrunHtml = data.speedrunBest ? `<p class="inspect-speedrun">⚡ Speedrun: <strong>${this.formatTime(data.speedrunBest)}</strong></p>` : '<p class="inspect-speedrun muted">⚡ Sin speedrun aún</p>';
      content.innerHTML = `
        <div class="inspect-head">
          <div class="inspect-avatar-wrap${frameClass}">${picHtml}</div>
          <div class="inspect-stats">
            <p class="inspect-name">${data.username}</p>
            <p class="inspect-level">Nivel ${expLevel} · ${data.exp || 0} EXP</p>
            <p class="inspect-hours">⏱ ${data.hoursPlayed || 0} horas jugadas</p>
            <p class="inspect-coins">🪙 ${data.coins || 0} puntos</p>
            ${speedrunHtml}
          </div>
        </div>
        <div class="inspect-details">
          <div class="inspect-detail"><span class="inspect-detail-label">Niveles completados</span><span class="inspect-detail-val">${data.solved}</span></div>
          <div class="inspect-detail"><span class="inspect-detail-label">Intentos totales</span><span class="inspect-detail-val">${data.attempts}</span></div>
          <div class="inspect-detail"><span class="inspect-detail-label">Miembro desde</span><span class="inspect-detail-val">${created}</span></div>
        </div>
      `;
    } catch (e) {
      content.innerHTML = '<p>Error al cargar el perfil.</p>';
    }
  }
};
