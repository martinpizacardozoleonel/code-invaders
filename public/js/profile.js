const Profile = {
  token: null,
  user: null,
  expLevel: 1,
  pendingTime: 0,
  active: false,
  bannersCatalog: [],
  fontsCatalog: [],
  fxsCatalog: [],
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
    const deleteBtn=document.getElementById('deleteAccountBtn');
    if(deleteBtn) deleteBtn.addEventListener('click', ()=> this.deleteAccount());
    const upB=document.getElementById('uploadBannerBtn'); const bIn=document.getElementById('bannerInput'); const clB=document.getElementById('clearBannerImgBtn');
    if(upB) upB.addEventListener('click',()=>bIn&&bIn.click());
    if(bIn) bIn.addEventListener('change',(e)=>this.saveBannerImg(e));
    if(clB) clB.addEventListener('click',()=>this.clearBannerImg());
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

  async deleteAccount(){
    if(!this.isLogged()) return;
    if(!confirm('¿Borrar tu cuenta? Desaparecés del ranked y se pierde todo. No se puede deshacer.')) return;
    const btn=document.getElementById('deleteAccountBtn');
    if(btn) btn.disabled=true;
    try{
      await this.api('/api/account', { method:'DELETE' });
      if(window.API && API.deleteAccount) { try{ await API.deleteAccount(); }catch(e){} }
      this.token=null; this.user=null; this.active=false; this.pendingTime=0;
      localStorage.removeItem('fx_token');
      this.renderProfile();
      if(typeof Auth!=='undefined' && Auth.logoutLocal) Auth.logoutLocal();
      const ov=document.getElementById('settingsOverlay');
      if(ov) ov.classList.add('hidden');
      if(typeof Toast!=='undefined') Toast.success('Cuenta borrada');
      if(typeof Ranked!=='undefined' && Ranked.loadRanking) Ranked.loadRanking();
    }catch(e){
      if(typeof Toast!=='undefined') Toast.error(e.message);
      if(btn) btn.disabled=false;
    }
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
    this.loadNameColors();
    this.loadBanners();
    this.loadFonts();
    this.loadFxs();
  },
  async loadNameColors(){
    try{
      const data=await API.getNameColors();
      this.nameColorsCatalog=data.colors||[];
    }catch(e){ this.nameColorsCatalog=[]; }
    this.renderNameColors();
  },
  async buyNameColor(id){
    if(!this.isLogged()) return;
    try{
      const data=await API.buyNameColor(id);
      if(this.user){ this.user.ownedNameColors=data.ownedNameColors; this.user.exp=data.exp; }
      this.renderNameColors(); this.renderProfile();
    }catch(e){ if(typeof Toast!=='undefined') Toast.error(e.message); }
  },
  async equipNameColor(id){
    if(!this.isLogged()) return;
    try{
      const data=await API.equipNameColor(id);
      if(this.user) this.user.nameColor=data.nameColor;
      this.renderNameColors();
      if(typeof Toast!=='undefined') Toast.success('Color equipado');
    }catch(e){ if(typeof Toast!=='undefined') Toast.error(e.message); }
  },

  async loadBanners(){
    try{ const d=await API.getBanners(); this.bannersCatalog=d.banners||[]; }catch(e){ this.bannersCatalog=[]; }
    this.renderBanners();
  },
  async buyBanner(id){
    if(!this.isLogged()) return;
    try{
      const d=await API.buyBanner(id);
      if(this.user){ this.user.banners=d.banners; this.user.coins=d.coins; }
      this.renderBanners(); this.renderProfile();
      Toast.success('Banner comprado');
    }catch(e){ Toast.error(e.message); }
  },
  async equipBanner(id){
    if(!this.isLogged()) return;
    try{
      const d=await API.equipBanner(id);
      if(this.user) this.user.equippedBanner=d.equippedBanner;
      this.renderBanners(); this.renderProfileBanner(); this.renderProfile();
    }catch(e){ Toast.error(e.message); }
  },
  async saveBannerImg(e){
    const f=e.target.files[0]; if(!f||!this.isLogged()) return;
    if(f.size>2500000){ Toast.error('Imagen muy grande (max 2.5MB)'); return; }
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=async()=>{
        const c=document.createElement('canvas'); const max=900;
        let w=img.width,h=img.height; const s=Math.min(1,max/Math.max(w,h));
        w=Math.round(w*s); h=Math.round(h*s); c.width=w; c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        const out=c.toDataURL('image/jpeg',0.75);
        try{ await this.api('/api/settings',{method:'PUT',body:JSON.stringify({bannerImg:out})}); if(this.user) this.user.bannerImg=out; this.renderProfileBanner(); Toast.success('Foto del banner lista'); }catch(err){ Toast.error('No se pudo guardar'); }
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  },
  async clearBannerImg(){
    if(!this.isLogged()) return;
    try{ await this.api('/api/settings',{method:'PUT',body:JSON.stringify({bannerImg:''})}); if(this.user) this.user.bannerImg=''; this.renderProfileBanner(); }catch(e){}
  },
  renderProfileBanner(){
    const wrap=document.getElementById('profileBanner'); if(!wrap) return;
    const im=document.getElementById('bannerImg'); const ph=document.getElementById('bannerPlaceholder'); const cl=document.getElementById('clearBannerImgBtn');
    const b=(this.bannersCatalog||[]).find(x=>x.id===((this.user&&this.user.equippedBanner)||'none'));
    wrap.style.background=(b&&b.grad&&b.grad!=='transparent')?b.grad:'';
    wrap.style.borderColor=b?b.border:'#333';
    if(b&&b.id==='leyenda') wrap.classList.add('banner-leyenda'); else wrap.classList.remove('banner-leyenda');
    if(this.user&&this.user.bannerImg){ if(im){ im.src=this.user.bannerImg; im.classList.remove('hidden'); im.style.display='block'; } if(ph) ph.style.display='none'; if(cl) cl.classList.remove('hidden'); }
    else { if(im){ im.src=''; im.classList.add('hidden'); im.style.display='none'; } if(ph) ph.style.display=''; if(cl) cl.classList.add('hidden'); }
  },
  renderBanners(){
    const g=document.getElementById('bannersGrid'); if(!g) return;
    const owned=(this.user&&this.user.banners)||['none']; const cur=(this.user&&this.user.equippedBanner)||'none'; const coins=(this.user&&this.user.coins)||0; const list=this.bannersCatalog||[];
    g.innerHTML=list.map(x=>{
      const has=owned.includes(x.id); const act=x.id===cur; let btn='';
      if(act) btn='<button class="btn btn-ghost btn-sm" disabled>Equipado</button>';
      else if(has) btn='<button class="btn btn-primary btn-sm b-equip" data-b="'+x.id+'">Equipar</button>';
      else if(coins>=x.price) btn='<button class="btn btn-primary btn-sm b-buy" data-b="'+x.id+'">Comprar '+x.price+'</button>';
      else btn='<button class="btn btn-ghost btn-sm" disabled>'+x.price+'</button>';
      return '<div class="frame-card"><div class="banner-preview" style="background:'+x.grad+';border-color:'+x.border+'"></div><p>'+x.name+'</p>'+btn+'</div>';
    }).join('');
    g.querySelectorAll('.b-buy').forEach(b=>b.addEventListener('click',()=>this.buyBanner(b.dataset.b)));
    g.querySelectorAll('.b-equip').forEach(b=>b.addEventListener('click',()=>this.equipBanner(b.dataset.b)));
    this.renderProfileBanner();
  },
  async loadFonts(){
    try{ const d=await API.getFonts(); this.fontsCatalog=d.fonts||[]; }catch(e){ this.fontsCatalog=[]; }
    this.renderFonts();
  },
  async buyFont(id){
    if(!this.isLogged()) return;
    try{
      const d=await API.buyFont(id);
      if(this.user){ this.user.fonts=d.fonts; this.user.coins=d.coins; }
      this.renderFonts(); this.renderProfile();
      Toast.success('Letra comprada');
    }catch(e){ Toast.error(e.message); }
  },
  async equipFont(id){
    if(!this.isLogged()) return;
    try{
      const d=await API.equipFont(id);
      if(this.user) this.user.equippedFont=d.equippedFont;
      this.renderFonts(); this.renderProfile();
      Toast.success('Letra equipada');
    }catch(e){ Toast.error(e.message); }
  },
  renderFonts(){
    const g=document.getElementById('fontsGrid'); if(!g) return;
    const owned=(this.user&&this.user.fonts)||['normal']; const cur=(this.user&&this.user.equippedFont)||'normal'; const coins=(this.user&&this.user.coins)||0; const list=this.fontsCatalog||[];
    g.innerHTML=list.map(x=>{
      const has=owned.includes(x.id); const act=x.id===cur; let btn='';
      if(act) btn='<button class="btn btn-ghost btn-sm" disabled>Equipado</button>';
      else if(has) btn='<button class="btn btn-primary btn-sm f-equip" data-f="'+x.id+'">Equipar</button>';
      else if(coins>=x.price) btn='<button class="btn btn-primary btn-sm f-buy" data-f="'+x.id+'">Comprar '+x.price+'</button>';
      else btn='<button class="btn btn-ghost btn-sm" disabled>'+x.price+'</button>';
      return '<div class="frame-card"><div class="banner-preview" style="display:flex;align-items:center;justify-content:center;font-size:1.3rem;background:#0a0e1a;'+x.css+'"><span>Aa</span></div><p style="'+x.css+'">'+x.name+'</p>'+btn+'</div>';
    }).join('');
    g.querySelectorAll('.f-buy').forEach(b=>b.addEventListener('click',()=>this.buyFont(b.dataset.f)));
    g.querySelectorAll('.f-equip').forEach(b=>b.addEventListener('click',()=>this.equipFont(b.dataset.f)));
  },
  async loadFxs(){
    try{ const d=await API.getFxs(); this.fxsCatalog=d.fxs||[]; }catch(e){ this.fxsCatalog=[]; }
    this.renderFxs();
  },
  async buyFx(id){
    if(!this.isLogged()) return;
    try{
      const d=await API.buyFx(id);
      if(this.user){ this.user.fxs=d.fxs; this.user.coins=d.coins; }
      this.renderFxs(); this.renderProfile();
      Toast.success('Efecto comprado');
    }catch(e){ Toast.error(e.message); }
  },
  async equipFx(id){
    if(!this.isLogged()) return;
    try{
      const d=await API.equipFx(id);
      if(this.user) this.user.equippedFx=d.equippedFx;
      this.renderFxs(); this.renderProfile();
      Toast.success('Efecto equipado');
    }catch(e){ Toast.error(e.message); }
  },
  renderFxs(){
    const g=document.getElementById('fxsGrid'); if(!g) return;
    const owned=(this.user&&this.user.fxs)||['none']; const cur=(this.user&&this.user.equippedFx)||'none'; const coins=(this.user&&this.user.coins)||0; const list=this.fxsCatalog||[];
    g.innerHTML=list.map(x=>{
      const has=owned.includes(x.id); const act=x.id===cur; let btn='';
      if(act) btn='<button class="btn btn-ghost btn-sm" disabled>Equipado</button>';
      else if(has) btn='<button class="btn btn-primary btn-sm x-equip" data-x="'+x.id+'">Equipar</button>';
      else if(coins>=x.price) btn='<button class="btn btn-primary btn-sm x-buy" data-x="'+x.id+'">Comprar '+x.price+'</button>';
      else btn='<button class="btn btn-ghost btn-sm" disabled>'+x.price+'</button>';
      return '<div class="frame-card"><div class="banner-preview" style="display:flex;align-items:center;justify-content:center;font-size:1.1rem;background:#0a0e1a;'+x.css+'"><span>Efecto</span></div><p style="'+x.css+'">'+x.name+'</p>'+btn+'</div>';
    }).join('');
    g.querySelectorAll('.x-buy').forEach(b=>b.addEventListener('click',()=>this.buyFx(b.dataset.x)));
    g.querySelectorAll('.x-equip').forEach(b=>b.addEventListener('click',()=>this.equipFx(b.dataset.x)));
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
    const bannerSection = document.getElementById('bannerSection');
    const fontsSection = document.getElementById('fontsSection');
    const fxsSection = document.getElementById('fxsSection');
    const fontsSection = document.getElementById('fontsSection');
    const dangerZone = document.getElementById('dangerZone');

    if (this.isLogged()) {
      if (nameEl) { nameEl.textContent = this.user.username || 'Invitado'; try{ let s=API.fontStyle(this.user.equippedFont)+API.fxStyle(this.user.equippedFx); const c=this.user.nameColor; if(c&&c!=='rainbow'&&c!=='#ffffff') s='color:'+c+';'+s; nameEl.style.cssText=s; if(c==='rainbow'){ nameEl.style.background='linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff)'; nameEl.style.webkitBackgroundClip='text'; nameEl.style.webkitTextFillColor='transparent'; } }catch(e){} }
      if (levelEl) { levelEl.textContent = `Nivel ${this.expLevel} · ${this.user.exp || 0} EXP`; levelEl.style.display=''; }
      if (hoursEl) { hoursEl.textContent = `⏱ ${this.user.hoursPlayed || 0} horas jugadas`; hoursEl.style.display=''; }
      if (coinsEl) { coinsEl.textContent = `🪙 ${this.user.coins || 0} puntos`; coinsEl.style.display=''; }
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
      if (bannerSection) bannerSection.classList.remove('hidden');
      if (fontsSection) fontsSection.classList.remove('hidden');
      if (fxsSection) fxsSection.classList.remove('hidden');
      if (fontsSection) fontsSection.classList.remove('hidden');
      this.renderProfileBanner();
      if (dangerZone) dangerZone.classList.remove('hidden');
    } else {
      if (nameEl) nameEl.textContent = 'Invitado';
      if (levelEl) { levelEl.textContent = ''; levelEl.style.display='none'; }
      if (hoursEl) { hoursEl.textContent = ''; hoursEl.style.display='none'; }
      if (coinsEl) { coinsEl.textContent = ''; coinsEl.style.display='none'; }
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
      if (bannerSection) bannerSection.classList.add('hidden');
      if (fontsSection) fontsSection.classList.add('hidden');
      if (fxsSection) fxsSection.classList.add('hidden');
      if (fontsSection) fontsSection.classList.add('hidden');
      if (dangerZone) dangerZone.classList.add('hidden');
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
  ,renderNameColors(){
    const grid=document.getElementById('nameColorsGrid'); if(!grid) return;
    const owned=(this.user&&this.user.ownedNameColors)||[];
    const cur=(this.user&&this.user.nameColor)||'#ffffff';
    const exp=(this.user&&this.user.exp)||0;
    const list=this.nameColorsCatalog||[];
    grid.innerHTML=list.map(c=>{
      const isOwned=owned.includes(c.id);
      const isActive=(c.color===cur)||(c.id==='white'&&cur==='#ffffff');
      let btn='';
      if(isActive) btn='<button class="btn btn-ghost btn-sm" disabled>Equipado</button>';
      else if(isOwned) btn=`<button class="btn btn-primary btn-sm name-equip" data-color="${c.id}">Equipar</button>`;
      else if(exp>=c.price) btn=`<button class="btn btn-primary btn-sm name-buy" data-color="${c.id}">Comprar ${c.price} EXP</button>`;
      else btn=`<button class="btn btn-ghost btn-sm" disabled>${c.price} EXP</button>`;
      const bg=c.color==='rainbow'?'linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff)':c.color;
      return `<div class="frame-card${isActive?' active':''}"><div class="frame-preview" style="background:${bg};border-color:${c.color==='rainbow'?'#fff':c.color}"></div><p style="color:${c.color==='rainbow'?'#fff':c.color};font-weight:800">${c.name}</p>${btn}</div>`;
    }).join('');
    grid.querySelectorAll('.name-buy').forEach(b=>b.addEventListener('click',()=>this.buyNameColor(b.dataset.color)));
    grid.querySelectorAll('.name-equip').forEach(b=>b.addEventListener('click',()=>this.equipNameColor(b.dataset.color)));
    const resetBtn=document.createElement('button'); resetBtn.className='btn btn-ghost btn-sm'; resetBtn.textContent='Blanco por defecto'; resetBtn.addEventListener('click',()=>this.equipNameColor('white')); grid.appendChild(resetBtn);
  }
};

// FIX horas jugadas: Profile debe ver la sesion de Auth aunque se loguee por el modal principal
Profile.syncAuth = function(){
  try{
    if(typeof Auth!=='undefined'){
      if(Auth.token) this.token=Auth.token;
      else { const t=localStorage.getItem('fx_token'); if(t) this.token=t; }
      if(Auth.user){
        if(!this.user) this.user=JSON.parse(JSON.stringify(Auth.user));
        else {
          this.user.username=Auth.user.username;
          if(Auth.user.coins!==undefined) this.user.coins=Auth.user.coins;
          if(Auth.user.exp!==undefined) this.user.exp=Auth.user.exp;
          if(Auth.user.hoursPlayed!==undefined) this.user.hoursPlayed=Auth.user.hoursPlayed;
          if(Auth.user.profilePic!==undefined) this.user.profilePic=Auth.user.profilePic;
          if(Auth.user.banners!==undefined) this.user.banners=Auth.user.banners;
          if(Auth.user.equippedBanner!==undefined) this.user.equippedBanner=Auth.user.equippedBanner;
          if(Auth.user.bannerImg!==undefined) this.user.bannerImg=Auth.user.bannerImg; if(Auth.user.fonts!==undefined) this.user.fonts=Auth.user.fonts; if(Auth.user.equippedFont!==undefined) this.user.equippedFont=Auth.user.equippedFont; if(Auth.user.fxs!==undefined) this.user.fxs=Auth.user.fxs; if(Auth.user.equippedFx!==undefined) this.user.equippedFx=Auth.user.equippedFx;
        }
        this.active=true;
      }
    }
  }catch(e){}
};
Profile.api = async function(path, options){
  options=options||{};
  const headers={'Content-Type':'application/json'};
  const tok=this.token||localStorage.getItem('fx_token');
  if(tok) headers['Authorization']='Bearer '+tok;
  const res=await fetch(path,Object.assign({},options,{headers:headers}));
  const data=await res.json();
  if(!res.ok) throw new Error(data.error||'Error');
  return data;
};
Profile.isLogged = function(){
  if(this.active&&this.user) return true;
  try{ return (typeof Auth!=='undefined')&&!!Auth.token&&!!Auth.user; }catch(e){ return false; }
};
Profile.addPlaytime = function(seconds){
  this.syncAuth();
  if(!this.isLogged()) return;
  this.pendingTime+=seconds;
  if(this.pendingTime>=60) this.flushTime();
};
Profile.flushTime = async function(force){
  this.syncAuth();
  if(!this.isLogged()) return;
  if(this.pendingTime<10&&!force) return;
  const seconds=Math.floor(this.pendingTime);
  if(seconds<=0) return;
  this.pendingTime-=seconds;
  try{
    const data=await this.api('/api/stats',{method:'POST',body:JSON.stringify({seconds:seconds})});
    if(data&&data.user){
      if(!this.user) this.user=data.user;
      else {
        if(data.user.hoursPlayed!==undefined) this.user.hoursPlayed=data.user.hoursPlayed;
        if(data.user.coins!==undefined) this.user.coins=data.user.coins;
        if(data.user.exp!==undefined) this.user.exp=data.user.exp;
      }
      if(data.expLevel) this.expLevel=data.expLevel;
      this.renderProfile();
    }
    try{ if(typeof Auth!=='undefined'&&Auth.user&&data&&data.user){ Auth.user.hoursPlayed=data.user.hoursPlayed; Auth.user.coins=data.user.coins; Auth.user.exp=data.user.exp; } }catch(e){}
  }catch(e){ this.pendingTime+=seconds; }
};
Profile.addExp = async function(amount, coins){
  this.syncAuth();
  if(!this.isLogged()) return false;
  try{
    const data=await this.api('/api/stats',{method:'POST',body:JSON.stringify({seconds:0,exp:amount,coins:coins||0})});
    const u=(data&&data.user)||{};
    if(!this.user) this.user=u;
    else {
      if(u.exp!==undefined) this.user.exp=u.exp;
      if(u.coins!==undefined) this.user.coins=u.coins;
      if(u.hoursPlayed!==undefined) this.user.hoursPlayed=u.hoursPlayed;
    }
    const newLevel=(data&&data.expLevel)||this.expLevel;
    const leveled=newLevel>this.expLevel;
    this.expLevel=newLevel;
    this.renderProfile();
    try{ if(typeof Auth!=='undefined'&&Auth.user){ Auth.user.exp=this.user.exp; Auth.user.coins=this.user.coins; } }catch(e){}
    return leveled;
  }catch(e){ return false; }
};
document.addEventListener('visibilitychange',function(){ try{ if(document.hidden&&typeof Profile!=='undefined'&&Profile.flushTime) Profile.flushTime(true); }catch(e){} });

