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
    const logoBackdrop = document.getElementById('logoBackdrop');
    const menuTutorial = document.getElementById('menuTutorial');
    function openMenu(){
      logoMenu.classList.remove('hidden','closing');
      void logoMenu.offsetWidth;
      if (logoWrap) logoWrap.classList.add('open');
      if (logoBackdrop) logoBackdrop.classList.remove('hidden');
      logoBtn.setAttribute('aria-expanded','true');
    }
    function closeMenu(instant){
      if (logoMenu.classList.contains('hidden')) return;
      if (instant){ logoMenu.classList.add('hidden'); }
      else {
        logoMenu.classList.add('closing');
        setTimeout(()=>{ logoMenu.classList.add('hidden'); logoMenu.classList.remove('closing'); },170);
      }
      if (logoWrap) logoWrap.classList.remove('open');
      if (logoBackdrop) logoBackdrop.classList.add('hidden');
      logoBtn.setAttribute('aria-expanded', 'false');
    }
    if (logoBtn && logoMenu) {
      logoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = logoMenu.classList.contains('hidden') || logoMenu.classList.contains('closing');
        if (isHidden) openMenu(); else closeMenu();
      });
      if (logoBackdrop) logoBackdrop.addEventListener('click', ()=>closeMenu());
      document.addEventListener('click', (e) => {
        if (!logoWrap.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
      if (menuTutorial) menuTutorial.addEventListener('click', () => {
        closeMenu();
        setTimeout(()=>{ if (typeof Intro !== 'undefined') Intro.open(); },120);
      });
      const menuSettings=document.getElementById('menuSettings');
      if(menuSettings) menuSettings.addEventListener('click',()=>{
        closeMenu();
        setTimeout(()=>{
          const ov=document.getElementById('settingsOverlay');
          if(ov) ov.classList.remove('hidden');
          if(typeof Profile!=='undefined') Profile.renderProfile();
        },120);
      });
      logoMenu.querySelectorAll('[data-view]').forEach(el => {
        el.addEventListener('click', () => closeMenu());
      });
      const shopBtn = document.getElementById('shopBtn');
      if (shopBtn) shopBtn.addEventListener('click', () => closeMenu());
      const menuAchievements = document.getElementById('menuAchievements');
      if (menuAchievements) menuAchievements.addEventListener('click', () => closeMenu());
      const shopBack = document.getElementById('shopBack');
      if (shopBack) shopBack.addEventListener('click', () => {
        const m = document.getElementById('shopModal');
        if (m) m.classList.add('hidden');
      });
    }

    const views = document.querySelectorAll('.view');
    const mainEl = document.querySelector('main');
    function switchView(target){
      views.forEach(v => v.classList.toggle('active', v.id === 'view-' + target));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === target));
      if (target === 'ranked' && typeof Ranked !== 'undefined') Ranked.loadRanking();
      if (target === 'chat' && typeof Chat !== 'undefined') Chat.start();
      if (target === 'friends' && typeof Friends !== 'undefined') Friends.load();
      if(mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('[data-view]').forEach(el => {
      const handler = (e) => {
        e.preventDefault();
        const target = el.dataset.view;
        switchView(target);
      };
      el.addEventListener('click', handler);
      el.addEventListener('touchend', handler, {passive:false});
    });

    (async()=>{ try{ const r=await fetch('/api/status'); const s=await r.json(); const b=document.getElementById('dbBadge'); if(b){ b.classList.remove('hidden'); if(s.storage==='postgres'){ b.textContent='PG '+s.users; b.classList.add('db-ok'); b.title='PostgreSQL conectada ('+s.users+' cuentas). Todo se guarda.'; } else { b.textContent='TEMPORAL'; b.classList.add('db-bad'); b.title='MODO TEMPORAL: sin base de datos. Las cuentas SE BORRAN. Configura DATABASE_URL en Render.'; } } }catch(e){} })();
    Notifications.sync();
  });
})();
