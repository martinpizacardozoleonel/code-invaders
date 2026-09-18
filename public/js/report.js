const Report={
  REASONS:[['insultos','🤬 Insultos / acoso'],['spam','📢 Spam'],['trampa','🥷 Trampa / hacks'],['contenido','⚠️ Contenido inapropiado'],['otro','❓ Otro motivo']],
  open(userId,username){
    if(typeof Auth==='undefined'||!Auth.isLogged){ Toast.info('Iniciá sesión para denunciar'); return; }
    const meId=Auth.user&&Auth.user.id;
    if(!userId){ Toast.error('Jugador no válido'); return; }
    if(userId===meId){ Toast.error('No podés denunciarte a vos mismo'); return; }
    this.close();
    const name=String(username||'este jugador');
    const bd=document.createElement('div');
    bd.className='modal-backdrop'; bd.id='reportModal';
    bd.innerHTML='<div class="modal report-modal"><h2>🚩 Denunciar jugador</h2>'
      +'<p class="report-target">¿Denunciar a <b>'+name.replace(/</g,'&lt;')+'</b>?</p>'
      +'<label class="report-label">Motivo<select id="reportReason" class="arcade-select">'
      +this.REASONS.map(r=>'<option value="'+r[0]+'">'+r[1]+'</option>').join('')
      +'</select></label>'
      +'<p class="report-warn">⛔ Con <b>3 denuncias</b> de jugadores distintos, su cuenta se <b>cierra para siempre</b>. Denunciá con responsabilidad.</p>'
      +'<p class="form-error hidden" id="reportError"></p>'
      +'<div class="btn-row"><button class="btn btn-ghost btn-sm" id="reportCancel">Cancelar</button>'
      +'<button class="btn btn-primary btn-sm" id="reportConfirm">🚩 Enviar denuncia</button></div></div>';
    document.body.appendChild(bd);
    const close=()=>this.close();
    bd.addEventListener('click',e=>{ if(e.target===bd) close(); });
    document.getElementById('reportCancel').addEventListener('click',close);
    document.getElementById('reportConfirm').addEventListener('click',async()=>{
      const reason=document.getElementById('reportReason').value;
      const btn=document.getElementById('reportConfirm');
      btn.disabled=true; btn.textContent='Enviando...';
      try{
        const r=await API.report(userId,reason);
        close();
        if(r&&r.banned) Toast.success('⛔ "'+name+'" acumuló 3 denuncias: cuenta cerrada para siempre');
        else Toast.success('🚩 Denuncia enviada ('+((r&&r.reports)||1)+'/3)');
      }catch(e){
        const err=document.getElementById('reportError');
        if(err){ err.textContent=e.message; err.classList.remove('hidden'); }
        btn.disabled=false; btn.textContent='🚩 Enviar denuncia';
      }
    });
  },
  close(){ const m=document.getElementById('reportModal'); if(m) m.remove(); }
};
