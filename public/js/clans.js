/* ============================================================
   CLANES — UI
   Includes: my clan, clan list, clan tournament.
   ============================================================ */
const Clans = (() => {
  const esc = s => { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  const escAttr = s => esc(s).replace(/"/g, '&quot;');
  const $ = id => document.getElementById(id);

  let open = false;
  let tab = 'mine';
  let data = { clan: null, myRole: '', members: [], chat: [] };
  let emblemList = [];
  let roleLabels = { leader: '👑 Líder', officer: '⭐ Oficial', member: '🛡️ Miembro' };
  let pollTimer = null;
  let rankedPublic = true;
  let lastChatKey = '';

  function rankBadge(r) {
    if (!r || !r.name) return '';
    return '<span class="rank-badge" style="--rc:' + escAttr(r.color || '#cd7f32') + '">' +
      esc(r.icon || '') + ' ' + esc(r.name) + '</span>';
  }

  function bind() {
    const btn = $('menuClans');
    const ov = $('clansOverlay');
    if (btn) btn.addEventListener('click', openPanel);
    if ($('clansClose')) $('clansClose').addEventListener('click', closePanel);
    if ($('clansBack')) $('clansBack').addEventListener('click', closePanel);
    if (ov) ov.addEventListener('click', e => { if (e.target === ov) closePanel(); });

    const tabs = $('clansTabs');
    if (tabs) tabs.querySelectorAll('.clans-tab').forEach(b => b.addEventListener('click', () => {
      tabs.querySelectorAll('.clans-tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      setTab(b.dataset.ctab);
    }));

    if ($('clanCreateBtn')) $('clanCreateBtn').addEventListener('click', createClan);
    if ($('clanLeaveBtn')) $('clanLeaveBtn').addEventListener('click', leaveClan);
    if ($('clanSearchBtn')) $('clanSearchBtn').addEventListener('click', () => loadList(searchVal()));
    const si = $('clanSearchInput');
    if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') loadList(si.value); });
    if ($('clanChatSend')) $('clanChatSend').addEventListener('click', sendChat);
    const rs = $('clanRankSort');
    if (rs) rs.addEventListener('change', () => { const t = $('clanRankTable'); if (t) delete t.dataset.loaded; loadRanking(); });
    const ci = $('clanChatInput');
    if (ci) ci.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
  }

  function init() { bind(); }

  function searchVal() { const i = $('clanSearchInput'); return i ? i.value : ''; }

  async function openPanel() {
    if (typeof Auth === 'undefined' || !Auth.isLogged) { Toast.info('Inicia sesión para ver los clanes'); return; }
    const ov = $('clansOverlay');
    if (ov) ov.classList.remove('hidden');
    open = true;
    setTab(tab);
    await refresh();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => { if (open && tab === 'mine') refresh(); }, 5000);
  }

  function closePanel() {
    const ov = $('clansOverlay');
    if (ov) ov.classList.add('hidden');
    open = false;
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function setTab(t) {
    tab = t || 'mine';
    const panes = { mine: 'clansPaneMine', list: 'clansPaneList', rank: 'clansPaneRank', tour: 'clansPaneTour' };
    Object.keys(panes).forEach(k => {
      const el = $(panes[k]);
      if (el) el.classList.toggle('hidden', k !== tab);
    });
    if (tab === 'list') loadList(searchVal());
    if (tab === 'rank') loadRanking();
    if (tab === 'tour') loadTour();
  }

  async function refresh() {
    try {
      const d = await API.getMyClan();
      data = d || {};
      if (!Array.isArray(data.members)) data.members = [];
      if (!Array.isArray(data.chat)) data.chat = [];
      if (!Array.isArray(data.missions)) data.missions = [];
      if (!data.myRole) data.myRole = '';
      renderMine();
      renderMissions();
    } catch (e) {
      const el = $('clanMembersList');
      if (el) el.innerHTML = '<p class="lead muted">Error al cargar tu clan.</p>';
    }
  }

  /* ---------------- RANGO DE CLAN ---------------- */
  function clanRankBadge(r) {
    if (!r || !r.name) return '';
    return '<span class="clan-rank-badge" style="--cr:' + escAttr(r.color || '#8a6b3a') + '">' +
      esc(r.icon || '') + ' ' + esc(r.name) + '</span>';
  }

  /* ---------------- MISIONES ---------------- */
  function renderMissions() {
    const box = $('clanMissionsBox');
    if (!box) return;
    if (!data.clan || !data.missions.length) { box.innerHTML = ''; return; }
    box.innerHTML =
      '<h4 class="clan-missions-title">📋 MISIONES DEL DÍA <span class="clan-reset">se renuevan cada 24h</span></h4>'
      + '<div class="clan-missions">'
      + data.missions.map(m => {
          const state = m.claimedBy ? 'done' : (m.ready ? 'ready' : 'wip');
          const btn = m.claimedBy
            ? '<span class="clan-mission-done">✅ Reclamada</span>'
            : (m.ready
                ? '<button class="btn btn-primary btn-sm clan-claim" data-mid="' + escAttr(m.id) + '">🎁 Reclamar</button>'
                : '<span class="clan-mission-lock">🔒 ' + esc(String(m.progress)) + '/' + esc(String(m.target)) + '</span>');
          return '<div class="clan-mission ' + state + '">'
            + '<div class="clan-mission-main">'
              + '<b>' + esc(m.label) + '</b>'
              + '<small>🏅 +' + esc(String(m.points)) + ' pts clan' + (m.coins ? (' · 🪙 +' + esc(String(m.coins))) : '') + '</small>'
              + '<div class="clan-mission-track"><div class="clan-mission-fill" style="width:' + (Number(m.pct) || 0) + '%"></div></div>'
            + '</div>'
            + btn
          '</div>';
        }).join('')
      + '</div>';
    box.querySelectorAll('.clan-claim').forEach(b => b.addEventListener('click', () => claimMission(b.dataset.mid, b)));
  }

  async function claimMission(missionId, btn) {
    if (btn) btn.disabled = true;
    try {
      const r = await API.claimClanMission(missionId);
      Toast.success('🎁 Misión reclamada · +' + (r.clanPoints || 0) + ' pts de clan');
      if (r.coins != null && typeof Auth !== 'undefined' && Auth.user) Auth.user.coins = r.coins;
      lastChatKey = '';
      await refresh();
    } catch (e) {
      Toast.error((e && e.message) || 'Error al reclamar');
      if (btn) btn.disabled = false;
    }
  }

  /* ---------------- MI CLAN ---------------- */
  function renderMine() {
    const none = $('clanNoClan'), has = $('clanHasClan');
    if (!emblemList.length) fillEmblems();
    if (!data.clan) {
      if (none) none.classList.remove('hidden');
      if (has) has.classList.add('hidden');
      return;
    }
    if (none) none.classList.add('hidden');
    if (has) has.classList.remove('hidden');

    const c = data.clan;
    const h = $('clanHeader');
    if (h) {
      h.innerHTML =
        '<div class="clan-banner" style="--cc:' + escAttr(c.color || '#00e5ff') + '">' +
          '<span class="clan-emblem">' + esc(c.emblem || '🛡️') + '</span>' +
          '<div class="clan-banner-info">' +
            '<h3>' + esc(c.name) + ' <span class="clan-tag">[' + esc(c.tag) + ']</span></h3>' +
            '<p class="muted">' + esc(c.description || 'Sin descripción') + '</p>' +
          '</div>' +
          '<div class="clan-lv">' +
            '<span class="clan-lv-badge">Nv ' + (Number(c.level) || 1) + '</span>' +
            '<span class="clan-lv-pts">' + (Number(c.points) || 0) + ' pts</span>' +
          '</div>' +
        '</div>' +
        '<div class="clan-rank-row">' + clanRankBadge(c.rank) +
          (c.rank && c.rank.next
            ? '<span class="clan-rank-next">' + (Number(c.rank.into) || 0) + ' / ' + (Number(c.rank.span) || 0) + ' → ' + esc(c.rank.next.name) + '</span>'
            : '<span class="clan-rank-next">RANGO MÁXIMO</span>') +
        '</div>' +
        '<div class="ranked-mp-bar-track clan-lv-bar"><div class="ranked-mp-bar-fill" style="width:' + (Number(c.rank && c.rank.pct) || 0) + '%"></div></div>' +
        '<p class="clan-role">Tu rol: <b>' + esc(roleLabels[data.myRole] || '🛡️ Miembro') + '</b></p>';
    }

    const mc = $('clanMembersCount');
    if (mc) mc.textContent = String(data.members.length);

    const ml = $('clanMembersList');
    if (ml) {
      const isLeader = data.myRole === 'leader';
      const myId = (Auth.user && Auth.user.id);
      ml.innerHTML = data.members.map(m => {
        const roleTag = '<span class="clan-role-tag role-' + escAttr(m.role) + '">' + esc(roleLabels[m.role] || '🛡️ Miembro') + '</span>';
        const acts = (isLeader && m.userId !== myId)
          ? '<span class="clan-mem-acts">' +
              '<button class="btn btn-ghost btn-sm clan-promote" data-uid="' + escAttr(m.userId) + '" data-role="officer" title="Ascender a oficial">⭐</button>' +
              '<button class="btn btn-ghost btn-sm clan-demote" data-uid="' + escAttr(m.userId) + '" data-role="member" title="Bajar a miembro">🛡️</button>' +
              '<button class="btn btn-ghost btn-sm clan-kick" data-uid="' + escAttr(m.userId) + '" title="Expulsar">🚪</button>' +
            '</span>'
          : '';
        return '<div class="clan-member">' +
          '<div class="clan-mem-avatar">' + (m.profilePic ? '<img src="' + escAttr(m.profilePic) + '" alt="">' : '👾') + '</div>' +
          '<div class="clan-mem-info">' +
            '<b>' + esc(m.username) + '</b> ' + roleTag + rankBadge(m.rank) +
            '<small>' + (m.online ? '<span class="dot online"></span> En línea' : '<span class="dot offline"></span> Desconectado') +
              ' · ' + (Number(m.points) || 0) + ' pts</small>' +
          '</div>' + acts +
        '</div>';
      }).join('');
      ml.querySelectorAll('.clan-promote').forEach(b => b.addEventListener('click', () => setRole(b.dataset.uid, b.dataset.role)));
      ml.querySelectorAll('.clan-demote').forEach(b => b.addEventListener('click', () => setRole(b.dataset.uid, b.dataset.role)));
      ml.querySelectorAll('.clan-kick').forEach(b => b.addEventListener('click', () => kick(b.dataset.uid)));
    }

    renderClanChat();
  }

  function renderClanChat() {
    const box = $('clanChatBox');
    if (!box) return;
    const msgs = data.chat || [];
    const key = msgs.length + '|' + (msgs.length ? msgs[msgs.length - 1].id : '');
    if (key === lastChatKey) return;
    lastChatKey = key;
    if (!msgs.length) { box.innerHTML = '<p class="muted" style="text-align:center">Sin mensajes todavía. ¡Hablá con tu clan! 👋</p>'; return; }
    box.innerHTML = msgs.map(m =>
      '<div class="clan-chat-msg"><b>' + esc(m.username) + '</b><span>' + esc(m.text) + '</span></div>'
    ).join('');
    box.scrollTop = box.scrollHeight;
  }

  async function sendChat() {
    const inp = $('clanChatInput');
    if (!inp) return;
    const t = (inp.value || '').trim();
    if (!t) return;
    try { await API.sendClanChat(t); inp.value = ''; lastChatKey = ''; await refresh(); }
    catch (e) { Toast.error((e && e.message) || 'Error al enviar'); }
  }

  async function setRole(userId, role) {
    try { await API.setClanRole(userId, role); Toast.success('Rol actualizado'); await refresh(); }
    catch (e) { Toast.error((e && e.message) || 'Error'); }
  }

  async function kick(userId) {
    if (!userId || !confirm('¿Expulsar a este miembro del clan?')) return;
    try { await API.kickClanMember(userId); Toast.success('Miembro expulsado'); await refresh(); }
    catch (e) { Toast.error((e && e.message) || 'Error'); }
  }

  function fillEmblems() {
    const sel = $('clanEmblemInput');
    if (!sel) return;
    const list = (emblemList && emblemList.length) ? emblemList : ['🛡️', '⚔️', '🔥', '🐉'];
    sel.innerHTML = list.map(e => '<option value="' + escAttr(e) + '">' + esc(e) + '</option>').join('');
  }

  async function createClan() {
    const nEl = $('clanNameInput'), tEl = $('clanTagInput');
    const name = nEl ? nEl.value.trim() : '';
    const tag = tEl ? tEl.value.trim().toUpperCase() : '';
    const eSel = $('clanEmblemInput'), cInp = $('clanColorInput'), dEl = $('clanDescInput');
    const emblem = eSel ? eSel.value : '';
    const color = cInp ? cInp.value : '#00e5ff';
    const description = dEl ? dEl.value.trim() : '';
    if (name.length < 3) { Toast.error('El nombre necesita 3+ caracteres'); return; }
    if (tag.length < 2) { Toast.error('La TAG necesita 2-4 caracteres'); return; }
    const btn = $('clanCreateBtn');
    if (btn) btn.disabled = true;
    try {
      await API.createClan({ name, tag, emblem, color, description });
      Toast.success('🛡️ ¡Clan creado!');
      if (nEl) nEl.value = '';
      if (tEl) tEl.value = '';
      if (dEl) dEl.value = '';
      await refresh();
    } catch (e) { Toast.error((e && e.message) || 'Error al crear'); }
    finally { if (btn) btn.disabled = false; }
  }

  async function leaveClan() {
    if (!confirm('¿Salir del clan?')) return;
    try { await API.leaveClan(); Toast.success('Saliste del clan'); lastChatKey = ''; await refresh(); }
    catch (e) { Toast.error((e && e.message) || 'Error'); }
  }

  /* ---------------- LISTA ---------------- */
  async function loadList(q) {
    const el = $('clansList');
    if (!el) return;
    el.innerHTML = '<p class="lead muted" style="text-align:center">Cargando clanes...</p>';
    try {
      const d = await API.getClans(q || '');
      const list = (d && Array.isArray(d.clans)) ? d.clans : [];
      if (Array.isArray(d.emblems) && d.emblems.length) emblemList = d.emblems;
      if (d.roles) roleLabels = d.roles;
      if (!list.length) { el.innerHTML = '<p class="lead muted" style="text-align:center">No hay clanes. ¡Creá el primero! 👇</p>'; return; }
      el.innerHTML = list.map(c => {
        const mine = !!c.myRole;
        const btn = mine
          ? '<span class="clan-list-mine">Ya sos miembro</span>'
          : '<button class="btn btn-primary btn-sm clan-join" data-id="' + escAttr(c.id) + '" data-tag="' + escAttr(c.tag) + '">Unirse</button>';
        return '<div class="clan-list-card" style="--cc:' + escAttr(c.color || '#00e5ff') + '">' +
          '<span class="clan-list-emblem">' + esc(c.emblem || '🛡️') + '</span>' +
          '<div class="clan-list-info">' +
            '<b>' + esc(c.name) + ' <span class="clan-tag">[' + esc(c.tag) + ']</span></b>' +
            '<small>👥 ' + (Number(c.members) || 0) + ' · 🏅 ' + (Number(c.points) || 0) + ' pts</small>' +
            '<small>' + clanRankBadge(c.rank) + '</small>' +
          '</div>' + btn +
        '</div>';
      }).join('');
      el.querySelectorAll('.clan-join').forEach(b => b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          await API.joinClan({ clanId: b.dataset.id, tag: b.dataset.tag });
          Toast.success('🛡️ ¡Te uniste al clan!');
          lastChatKey = '';
          setTab('mine');
          await refresh();
        } catch (e) { Toast.error((e && e.message) || 'Error'); b.disabled = false; }
      }));
    } catch (e) {
      el.innerHTML = '<p class="lead muted" style="text-align:center">Error al cargar la lista.</p>';
    }
  }

  /* ---------------- CLASIFICACIÓN ---------------- */
  let rankSort = 'points';

  function renderRanking(d) {
    const pod = $('clanPodium'), tbl = $('clanRankTable'), note = $('clanRankNote');
    const board = (d && Array.isArray(d.board)) ? d.board : [];

    if (!board.length) {
      if (pod) pod.innerHTML = '';
      if (tbl) tbl.innerHTML = '<p class="lead muted" style="text-align:center">Todavía no hay clanes en la clasificación. ¡Creá el primero! 👇</p>';
      if (note) note.textContent = '';
      return;
    }

    // Podio: 2° | 1° | 3°
    const top = board.slice(0, 3);
    if (pod) {
      if (top.length < 3) { pod.innerHTML = ''; }
      else {
        const order = [top[1], top[0], top[2]];       // 2°, 1°, 3°
        pod.innerHTML = '<div class="podium">' + order.map(c => {
          const place = c.position;
          const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉';
          const cls = place === 1 ? 'p1' : place === 2 ? 'p2' : 'p3';
          return '<div class="podium-col ' + cls + '" style="--cc:' + escAttr(c.color || '#00e5ff') + '">'
            + '<span class="podium-medal">' + medal + '</span>'
            + '<span class="podium-emblem">' + esc(c.emblem || '🛡️') + '</span>'
            + '<b class="podium-name">' + esc(c.name) + '</b>'
            + '<span class="podium-tag">[' + esc(c.tag) + ']</span>'
            + clanRankBadge(c.rank)
            + '<span class="podium-stats">🏅 ' + (Number(c.points) || 0) + ' pts · 👥 ' + (Number(c.members) || 0) + '</span>'
            + '</div>';
        }).join('') + '</div>';
      }
    }

    // Tabla del resto
    const rest = board.slice(3);
    if (tbl) {
      if (!rest.length) {
        tbl.innerHTML = board.length
          ? '<p class="lead muted" style="text-align:center">¡Sólo hay ' + board.length + ' clanes en total! Sumá el tuyo 👇</p>'
          : '';
      } else {
        tbl.innerHTML =
          '<div class="clan-rt-head"><span>#</span><span>Clan</span><span>Rango</span><span>🏅</span><span>👥</span><span>🏆</span><span>⚔️</span></div>'
          + rest.map(c =>
            '<div class="clan-rt-row' + (c.myClan ? ' my-clan' : '') + '" style="--cc:' + escAttr(c.color || '#00e5ff') + '">'
            + '<span class="clan-rt-pos">' + c.position + '</span>'
            + '<span class="clan-rt-name"><span class="clan-rt-emblem">' + esc(c.emblem || '🛡️') + '</span>'
              + esc(c.name) + ' <span class="clan-tag">[' + esc(c.tag) + ']</span>'
              + (c.myClan ? '<span class="clan-rt-mine">TU CLAN</span>' : '') + '</span>'
            + '<span>' + clanRankBadge(c.rank) + '</span>'
            + '<span class="clan-rt-pts">' + (Number(c.points) || 0) + '</span>'
            + '<span>' + (Number(c.members) || 0) + '</span>'
            + '<span>' + (Number(c.wins) || 0) + '</span>'
            + '<span>' + (Number(c.tournamentPoints) || 0) + '</span>'
            + '</div>').join('');
      }
    }

    if (note) {
      let txt = (d.total || board.length) + ' clan' + ((d.total === 1) ? '' : 'es') + ' en total';
      if (d.myPosition) txt += ' · Tu clan está en el puesto #' + d.myPosition;
      if (d.tournamentActive) txt += ' · ⚔️ Torneo en curso';
      note.textContent = txt;
    }
  }

  async function loadRanking() {
    const tbl = $('clanRankTable');
    if (tbl && !tbl.dataset.loaded) tbl.innerHTML = '<p class="lead muted" style="text-align:center">Cargando clasificación...</p>';
    const sel = $('clanRankSort');
    rankSort = (sel && sel.value) ? sel.value : rankSort;
    try {
      const d = await API.getClanRanking(rankSort);
      renderRanking(d);
      if (tbl) tbl.dataset.loaded = '1';
    } catch (e) {
      if (tbl) tbl.innerHTML = '<p class="lead muted" style="text-align:center">Error al cargar la clasificación.</p>';
    }
  }

  /* ---------------- TORNEO ---------------- */
  async function loadTour() {
    const b = $('clanTourBanner'), bd = $('clanTourBoard');
    if (!b || !bd) return;
    b.innerHTML = '<p class="lead muted">Cargando torneo...</p>';
    bd.innerHTML = '';
    try {
      const d = await API.getClanTournament();
      const t = d.tournament, p = d.pending;
      const board = Array.isArray(d.board) ? d.board : [];

      let banner = '';
      if (t && t.status === 'active') {
        const end = new Date(t.endDate);
        banner = '<div class="clan-tour-active">🏆 <b>TORNEO DE CLANES ACTIVO</b> · termina ' + end.toLocaleDateString('es-AR') +
          '<small>Jugá Multijugador Ranked para sumar puntos a tu clan.</small></div>';
      } else if (p) {
        const canStart = data.myRole === 'leader';
        banner = '<div class="clan-tour-pending">⏳ <b>Próximo torneo en preparación</b> · ' + (Number(d.durationDays) || 7) + ' días' +
          '<small>' + (Number(d.clanCount) || 0) + ' clanes inscritos (mínimo ' + (Number(d.minClans) || 2) + ')</small>' +
          (canStart ? '<div><button class="btn btn-primary btn-sm" id="clanTourStartBtn">🏁 Iniciar torneo</button></div>' : '') +
          '</div>';
      } else {
        banner = '<p class="lead muted">No hay torneo configurado.</p>';
      }
      b.innerHTML = banner;

      const startBtn = $('clanTourStartBtn');
      if (startBtn) startBtn.addEventListener('click', async () => {
        if (!confirm('¿Iniciar el torneo de clanes ahora?')) return;
        startBtn.disabled = true;
        try { await API.startClanTournament(); Toast.success('🏆 ¡Torneo iniciado!'); loadTour(); }
        catch (e) { Toast.error((e && e.message) || 'Error'); startBtn.disabled = false; }
      });

      if (!board.length) { bd.innerHTML = '<p class="lead muted" style="text-align:center">Todavía no hay clanes.</p>'; return; }
      bd.innerHTML = board.map((c, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return '<div class="clan-list-card' + (c.myClan ? ' my-clan' : '') + '" style="--cc:' + escAttr(c.color || '#00e5ff') + '">' +
          '<span class="clan-list-emblem">' + esc(c.emblem || '🛡️') + '</span>' +
          '<div class="clan-list-info">' +
            '<b>' + medal + ' ' + esc(c.name) + ' <span class="clan-tag">[' + esc(c.tag) + ']</span></b>' +
            '<small>🏅 ' + (Number(c.tournamentPoints) || 0) + ' pts en torneo · 👥 ' + (Number(c.members) || 0) + '</small>' +
            '<small>' + clanRankBadge(c.rank) + '</small>' +
          '</div>' +
          (c.myClan ? '<span class="clan-list-mine">Tu clan</span>' : '') +
        '</div>';
      }).join('');
    } catch (e) {
      b.innerHTML = '<p class="lead muted">Error al cargar el torneo.</p>';
    }
  }

  return { init, openPanel, closePanel, refresh, loadTour };
})();

document.addEventListener('DOMContentLoaded', () => { try { Clans.init(); } catch (e) { console.error('[clans]', e); } });