/* App principal: arranque y navegación SPA */
(function init() {
  document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    Notifications.init();
    Docs.init();
    if (typeof Intro !== 'undefined') Intro.init();
    Game.init();
    if (typeof Profile !== 'undefined') Profile.init();
    if (typeof Ranked !== 'undefined') Ranked.init();

    const logoBtn = document.getElementById('logoMenuBtn');
    const logoWrap = document.getElementById('logoWrap');
    const logoMenu = document.getElementById('logoMenu');
    const menuTutorial = document.getElementById('menuTutorial');
    if (logoBtn && logoMenu) {
      logoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = logoMenu.classList.contains('hidden');
        logoMenu.classList.toggle('hidden', !isHidden);
        if (logoWrap) logoWrap.classList.toggle('open', isHidden);
        logoBtn.setAttribute('aria-expanded', String(isHidden));
      });
      document.addEventListener('click', (e) => {
        if (!logoWrap.contains(e.target)) {
          logoMenu.classList.add('hidden');
          if (logoWrap) logoWrap.classList.remove('open');
          logoBtn.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          logoMenu.classList.add('hidden');
          if (logoWrap) logoWrap.classList.remove('open');
          logoBtn.setAttribute('aria-expanded', 'false');
        }
      });
      if (menuTutorial) menuTutorial.addEventListener('click', () => {
        logoMenu.classList.add('hidden');
        if (logoWrap) logoWrap.classList.remove('open');
        logoBtn.setAttribute('aria-expanded', 'false');
        if (typeof Intro !== 'undefined') Intro.open();
      });
      const menuSettings=document.getElementById('menuSettings');
      if(menuSettings) menuSettings.addEventListener('click',()=>{
        logoMenu.classList.add('hidden');
        if(logoWrap) logoWrap.classList.remove('open');
        logoBtn.setAttribute('aria-expanded','false');
        const ov=document.getElementById('settingsOverlay');
        if(ov) ov.classList.remove('hidden');
        if(typeof Profile!=='undefined') Profile.renderProfile();
      });
      logoMenu.querySelectorAll('[data-view]').forEach(el => {
        el.addEventListener('click', () => {
          logoMenu.classList.add('hidden');
          if (logoWrap) logoWrap.classList.remove('open');
          logoBtn.setAttribute('aria-expanded', 'false');
        });
      });
      const shopBtn = document.getElementById('shopBtn');
      if (shopBtn) shopBtn.addEventListener('click', () => {
        logoMenu.classList.add('hidden');
        if (logoWrap) logoWrap.classList.remove('open');
        logoBtn.setAttribute('aria-expanded', 'false');
      });
      const shopBack = document.getElementById('shopBack');
      if (shopBack) shopBack.addEventListener('click', () => {
        const m = document.getElementById('shopModal');
        if (m) m.classList.add('hidden');
      });
    }

    const views = document.querySelectorAll('.view');
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.view;
        views.forEach(v => v.classList.toggle('active', v.id === 'view-' + target));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === target));
        if (target === 'ranked' && typeof Ranked !== 'undefined') Ranked.loadRanking();
        if (target === 'chat' && typeof Chat !== 'undefined') Chat.start();
        if (target === 'friends' && typeof Friends !== 'undefined') Friends.load();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    (async()=>{ try{ const r=await fetch('/api/status'); const s=await r.json(); const b=document.getElementById('dbBadge'); if(b){ b.classList.remove('hidden'); if(s.storage==='postgres'){ b.textContent='PG '+s.users; b.classList.add('db-ok'); b.title='PostgreSQL conectada ('+s.users+' cuentas). Todo se guarda.'; } else { b.textContent='TEMPORAL'; b.classList.add('db-bad'); b.title='MODO TEMPORAL: sin base de datos. Las cuentas SE BORRAN. Configura DATABASE_URL en Render.'; } } }catch(e){} })();
    Notifications.sync();
  });
})();
