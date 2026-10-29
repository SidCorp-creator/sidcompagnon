const http=require('http');const users={};const rows={};let n=0;
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,PUT,DELETE,OPTIONS'};
function send(res,code,obj){res.writeHead(code,{...cors,'Content-Type':'application/json'});res.end(obj===undefined?'':JSON.stringify(obj))}
// v32 : fonctions réservées dans app_metadata (comme sur Supabase) ; les adresses « sans… » n'ont pas Nutrition
const appMeta=e=>String(e||'').startsWith('sans')?{}:{features:['nutri']};
const tok=(u)=>({access_token:'at-'+u.id,refresh_token:'rt-'+u.id,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:{id:u.id,email:u.email,user_metadata:u.meta,app_metadata:appMeta(u.email)}});
const objs={},mem={};let failWrites=false;const clientErrors=[];let SL={lists:[],members:[],items:[]};const MCP={};
http.createServer((req,res)=>{const ch=[];req.on('data',c=>ch.push(c));req.on('end',()=>{const raw=Buffer.concat(ch);const isJ=!(req.url.startsWith('/storage/'));const b=isJ?raw.toString():'';
  if(req.method==='OPTIONS')return send(res,204);
  const url=new URL(req.url,'http://x');const body=b?JSON.parse(b):{};
  const auth=(req.headers.authorization||'').replace('Bearer at-','');
  if(url.pathname==='/auth/v1/signup'){ if(users[body.email])return send(res,422,{code:422,error_code:'user_already_exists',msg:'User already registered'});
    if(body.password.length<6)return send(res,422,{msg:'Password should be at least 6 characters'});
    const u={id:'u'+(++n),pw:body.password,meta:body.data,email:body.email};users[body.email]=u;return send(res,200,tok(u))}
  if(url.pathname==='/auth/v1/token'){ if(url.searchParams.get('grant_type')==='password'){const u=users[body.email];if(!u||u.pw!==body.password)return send(res,400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return send(res,200,tok(u))}
    const u=Object.values(users).find(x=>'rt-'+x.id===body.refresh_token);return u?send(res,200,tok(u)):send(res,400,{msg:'bad refresh'})}
  if(url.pathname==='/auth/v1/user'&&req.method==='GET'){const e=Object.keys(users).find(k=>users[k].id===auth);return e?send(res,200,{id:auth,email:e,user_metadata:users[e].meta,app_metadata:appMeta(e)}):send(res,401,{msg:'no'})}
  if(url.pathname==='/auth/v1/user'&&req.method==='PUT'){const e=Object.keys(users).find(k=>users[k].id===auth);if(!e)return send(res,401,{msg:'no'});
    if(body.email&&body.email!==e){if(users[body.email])return send(res,422,{error_code:'email_exists',msg:'A user with this email address has already been registered'});users[body.email]=users[e];delete users[e]}
    const em=body.email||e;if(body.data)users[em].meta={...users[em].meta,...body.data};if(body.password)users[em].pw=body.password;return send(res,200,{id:auth,email:em,user_metadata:users[em].meta,app_metadata:appMeta(em)})}
  if(url.pathname==='/auth/v1/logout')return send(res,204);
  if(url.pathname==='/auth/v1/recover')return send(res,200,{});
  // v33 : panne simulée du serveur pour les écritures (GET /__fail?on=1 ou 0)
  if(url.pathname==='/__fail'){failWrites=url.searchParams.get('on')==='1';return send(res,200,{failWrites})}
  // v37 : listes partagées (même logique que les règles RLS de supabase/sql/v37.sql)
  {const q=k=>(url.searchParams.get(k)||'').replace(/^eq\./,''),isMem=l=>SL.members.some(m=>m.list_id===l&&m.user_id===auth),now=()=>new Date().toISOString();
   if(url.pathname.startsWith('/rest/v1/rpc/')||url.pathname.startsWith('/rest/v1/shared_')){if(!auth)return send(res,401,{message:'no'});
    if(url.pathname==='/rest/v1/rpc/create_shared_list'){const id='L'+(++n),code=Math.random().toString(36).slice(2,8).toUpperCase();
      SL.lists.push({id,name:body.p_name,owner:auth,code,created_at:now()});SL.members.push({list_id:id,user_id:auth,name:body.p_member_name});return send(res,200,id)}
    if(url.pathname==='/rest/v1/rpc/join_shared_list'){const l=SL.lists.find(x=>x.code===String(body.p_code).toUpperCase());if(!l)return send(res,400,{message:'Code inconnu'});
      if(!isMem(l.id))SL.members.push({list_id:l.id,user_id:auth,name:body.p_member_name});return send(res,200,l.id)}
    if(url.pathname==='/rest/v1/shared_lists'){
      if(req.method==='GET')return send(res,200,SL.lists.filter(l=>isMem(l.id)).map(l=>({...l,shared_members:SL.members.filter(m=>m.list_id===l.id).map(m=>({user_id:m.user_id,name:m.name})),shared_items:SL.items.filter(i=>i.list_id===l.id).map(i=>({id:i.id,done:i.done}))})));
      if(req.method==='DELETE'){const id=q('id');const l=SL.lists.find(x=>x.id===id);if(l&&l.owner===auth){SL.lists=SL.lists.filter(x=>x!==l);SL.members=SL.members.filter(m=>m.list_id!==id);SL.items=SL.items.filter(i=>i.list_id!==id)}return send(res,204)}}
    if(url.pathname==='/rest/v1/shared_members'&&req.method==='DELETE'){const l=q('list_id'),u=q('user_id');if(u===auth)SL.members=SL.members.filter(m=>!(m.list_id===l&&m.user_id===u));return send(res,204)}
    if(url.pathname==='/rest/v1/shared_items'){
      if(req.method==='GET'){const l=q('list_id');return send(res,200,isMem(l)?SL.items.filter(i=>i.list_id===l):[])}
      if(req.method==='POST'){if(!isMem(body.list_id))return send(res,403,{message:'rls'});SL.items.push({id:'I'+(++n),list_id:body.list_id,text:body.text,done:false,by_name:body.by_name,created_at:now()});return send(res,201)}
      if(req.method==='PATCH'){const i=SL.items.find(x=>x.id===q('id'));if(i&&isMem(i.list_id))Object.assign(i,body);return send(res,204)}
      if(req.method==='DELETE'){const id=q('id'),l=q('list_id'),dn=q('done');SL.items=SL.items.filter(i=>!(isMem(i.list_id)&&(id?i.id===id:(i.list_id===l&&(dn!=='true'||i.done)))));return send(res,204)}}
    return send(res,404,{message:'?'})}}
  // v38 : adresses du connecteur Claude (chacun ne voit que les siennes)
  if(url.pathname==='/rest/v1/mcp_tokens'){if(!auth)return send(res,401,{message:'no'});MCP.list=MCP.list||[];
    if(req.method==='GET'){const h=(url.searchParams.get('hash')||'').replace(/^eq\./,''),used=url.searchParams.get('last_used')==='not.is.null';
      return send(res,200,MCP.list.filter(t=>t.user_id===auth&&(!h||t.hash===h)&&(!used||t.last_used)))}
    if(req.method==='POST'){if(body.user_id!==auth||!/^[0-9a-f]{64}$/.test(body.hash))return send(res,403,{message:'rls'});MCP.list.push({...body,created_at:new Date().toISOString(),last_used:null});return send(res,201)}
    if(req.method==='DELETE'){const h=(url.searchParams.get('hash')||'').replace(/^eq\./,'');MCP.list=MCP.list.filter(t=>!(t.user_id===auth&&t.hash===h));return send(res,204)}}
  // v39 : simule le premier appel de l'IA (le connecteur met last_used à jour)
  if(url.pathname==='/__mcpuse'){(MCP.list||[]).forEach(t=>{t.last_used=new Date().toISOString()});return send(res,200,{ok:true})}
  // v37 : erreurs envoyées par l'app (gardées en mémoire, lisibles par /__errors)
  if(url.pathname==='/rest/v1/client_errors'&&req.method==='POST'){if(!auth)return send(res,401,{message:'no'});clientErrors.push(body);return send(res,201)}
  if(url.pathname==='/__errors')return send(res,200,clientErrors);
  if(url.pathname==='/rest/v1/user_data'&&failWrites&&req.method!=='GET')return send(res,500,{message:'panne simulée'});
  if(url.pathname==='/rest/v1/user_data'){
    if(req.method==='GET'){const id=url.searchParams.get('user_id').replace('eq.','');if(id!==auth)return send(res,200,[]);return send(res,200,rows[id]?[rows[id]]:[])}
    if(req.method==='POST'){if(body.user_id!==auth)return send(res,403,{message:'rls'});rows[body.user_id]={data:body.data,updated_at:body.updated_at};return send(res,201)}
    if(req.method==='PATCH'){const id=(url.searchParams.get('user_id')||'').replace('eq.','');if(id!==auth)return send(res,200,[]);
      const want=(url.searchParams.get('updated_at')||'').replace('eq.','');const r=rows[id];
      if(!r||r.updated_at!==want)return send(res,200,[]);rows[id]={data:body.data,updated_at:body.updated_at};return send(res,200,[{updated_at:body.updated_at}])}
  }
  // faux Claude pour l'onglet Nutrition (réponses fixes)
  if(url.pathname==='/functions/v1/nutrition'){if(!auth)return send(res,401,{error:'Non connecté'});
    {const e=Object.keys(users).find(k=>users[k].id===auth);if(!appMeta(e).features)return send(res,403,{error:'Bientôt disponible'})}
    if(body.kind==='profil')return send(res,200,{result:{bmr_kcal:1780,tdee_kcal:2650,target_kcal:2950,protein_g:150,carbs_g:380,fat_g:90,explanation:'Ton corps brûle environ 1 780 kcal au repos. Avec ton sport, tu dépenses environ 2 650 kcal par jour. Pour prendre du poids, vise 2 950 kcal.',warnings:[],sports_kcal:[{sport:'Musculation',kcal_per_session:420}],weight_goal:body.data&&body.data.target_weight_kg?{realistic:false,weekly_change_kg:0.3,suggested_weeks:27,advice:'Prendre 8 kg en 1 mois ferait surtout du gras. Vise environ 0,3 kg par semaine : ton objectif sera atteint en 6 mois environ.'}:{realistic:true,weekly_change_kg:0,suggested_weeks:0,advice:''}}});
    // mémoire partagée simulée : la même phrase revient sans « Claude »
    if(body.kind==='aliment'&&!body.image){const k=String(body.text||'').trim().toLowerCase();mem[k]=(mem[k]||0)+1;if(mem[k]>1)return send(res,200,{source:'memory',result:{dish:'Barre chocolatée',emoji:'🍫',items:[{name:'Barre chocolatée',emoji:'🍫',quantity:'1 barre (43 g)',grams:43,kcal:246,protein_g:3.7,carbs_g:21.3,fat_g:16}],note:''}})}
    if(body.kind==='aliment')return send(res,200,{result:{dish:body.image?'Assiette poisson riz':'Barre chocolatée',emoji:body.image?'🍽️':'🍫',items:body.image?[{name:'Riz blanc cuit',emoji:'🍚',quantity:'150 g',grams:150,kcal:195,protein_g:4.1,carbs_g:42.3,fat_g:0.5},{name:'Poisson blanc',emoji:'🐟',quantity:'120 g',grams:120,kcal:158,protein_g:34.2,carbs_g:0,fat_g:1.8}]:[{name:'Barre chocolatée',emoji:'🍫',quantity:'1 barre (43 g)',grams:43,kcal:246,protein_g:3.7,carbs_g:21.3,fat_g:16}],note:''}});
    if(body.kind==='menu'){const ms=(body.data&&body.data.meals)||[{name:'Déjeuner',kcal:700}];
      return send(res,200,{result:{meals:ms.map(m=>({name:m.name+' maison',emoji:'🍽️',kcal:m.kcal,protein_g:30,carbs_g:60,fat_g:15,items:[{food:'Poulet',emoji:'🍗',grams:150,kcal:Math.round(m.kcal*.5),protein_g:30,carbs_g:0,fat_g:5},{food:'Riz cuit',emoji:'🍚',grams:200,kcal:Math.round(m.kcal*.5),protein_g:5,carbs_g:60,fat_g:1}]})),total:{kcal:0,protein_g:0,carbs_g:0,fat_g:0},tips:'Prépare le riz à l\'avance.'}})}
    if(body.kind==='bilan')return send(res,200,{result:body.scope==='week'?{summary:'Semaine correcte : 3 jours suivis sur 7, protéines un peu basses.',good:['Calories proches de l\'objectif les jours suivis'],improve:['4 jours sans suivi'],tips:['Ajoute une source de protéines au petit-déjeuner','Note tes repas le soir même']}:{summary:'Aujourd\'hui tu es à 246 kcal sur 2 950 : il te reste de la marge.',good:['Tu as noté ton premier repas'],improve:[],tips:['Vise 40 g de protéines au prochain repas']}});
    return send(res,400,{error:'Demande inconnue'})}
  // v35 : suppression du compte (fichiers, ligne de données, compte)
  if(url.pathname==='/functions/v1/delete-account'){const e=Object.keys(users).find(k=>users[k].id===auth);if(!e)return send(res,401,{error:'Non connecté'});
    if(e==='test@sidcorp.app')return send(res,403,{error:'Ce compte ne peut pas être supprimé'});
    for(const k of Object.keys(objs))if(k.includes(auth+'/'))delete objs[k];delete rows[auth];delete users[e];return send(res,200,{ok:true})}
  if(url.pathname==='/functions/v1/horaire'){if(!auth)return send(res,401,{error:'Non connecté'});
    // v45 : 2e calendrier (« travail ») et calendrier privé (« prive », identifiant moi / pw)
    const u2=String(body.url||''),d0=new Date(),ds=d0.getFullYear()+String(d0.getMonth()+1).padStart(2,'0')+String(d0.getDate()).padStart(2,'0');
    const one=(uid,t)=>"BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:"+uid+"\r\nDTSTART:"+ds+"T100000\r\nDTEND:"+ds+"T110000\r\nSUMMARY:"+t+"\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
    if(u2.includes('prive')){if(body.user!=='moi'||body.pass!=='pw')return send(res,502,{error:'Identifiant ou mot de passe refusé par le calendrier'});res.writeHead(200,{...cors,'Content-Type':'text/calendar'});return res.end(one('p1','Réunion privée'))}
    if(u2.includes('travail')){res.writeHead(200,{...cors,'Content-Type':'text/calendar'});return res.end(one('w1','Point équipe'))}res.writeHead(200,{...cors,'Content-Type':'text/calendar'});return res.end("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Index Education//HYPERPLANNING//FR\r\nBEGIN:VEVENT\r\nUID:Cours-1-Index-Education\r\nDTSTART:20261009T070000Z\r\nDTEND:20261009T090000Z\r\nSUMMARY;LANGUAGE=fr:Strategic Management - CM\r\nLOCATION;LANGUAGE=fr:Plaine de Nimy - Auditoire 25\r\nDESCRIPTION;LANGUAGE=fr:Matière : Strategic Management\\nEnseignant : Dupont\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:Cours-2-Index-Education\r\nDTSTART;TZID=Europe/Brussels:20261009T130000\r\nDTEND;TZID=Europe/Brussels:20261009T150000\r\nSUMMARY:Annulé : Seminar in Corporate Fina\r\n nce\r\nLOCATION:Warocqué - Salle 1.04\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:Cours-3\r\nDTSTART:20261012T080000Z\r\nDTEND:20261012T100000Z\r\nSTATUS:CANCELLED\r\nSUMMARY:Séminaires NTIC\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:Conge-1\r\nDTSTART;VALUE=DATE:20261102\r\nDTEND;VALUE=DATE:20261104\r\nSUMMARY:Congé\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n")}
  if(url.pathname==='/storage/v1/object/move'&&req.method==='POST'){if(!auth)return send(res,401,{message:'no auth'});const j=JSON.parse(raw.toString()),f='documents/'+j.sourceKey,t='documents/'+j.destinationKey;
    if(!f.startsWith('documents/'+auth+'/')||!t.startsWith('documents/'+auth+'/'))return send(res,403,{message:'rls'});if(!objs[f])return send(res,404,{message:'Object not found'});objs[t]=objs[f];delete objs[f];return send(res,200,{message:'Successfully moved'})}
  if(url.pathname.startsWith('/storage/v1/object/')){
    if(!auth)return send(res,401,{message:'no auth'});
    let p=url.pathname.slice('/storage/v1/object/'.length);
    if(process.env.NOBUCKET)return send(res,404,{statusCode:'404',error:'Bucket not found',message:'Bucket not found'});
    if(p.startsWith('authenticated/'))p=p.slice(14);
    if(!p.startsWith('documents/'+auth+'/'))return send(res,403,{message:'new row violates row-level security policy'});
    if(req.method==='POST'){objs[p]=raw;return send(res,200,{Key:p})}
    if(req.method==='GET'){if(!objs[p])return send(res,404,{message:'Object not found'});res.writeHead(200,{...cors,'Content-Type':'application/pdf'});return res.end(objs[p])}
    if(req.method==='DELETE'){delete objs[p];return send(res,200,[{name:p}])}
  }
  if(url.pathname==='/__heads')return send(res,200,Object.fromEntries(Object.entries(objs).map(([k,v])=>[k,v.slice(0,4).toString('latin1')])));
  if(url.pathname==='/__objs')return send(res,200,Object.fromEntries(Object.entries(objs).map(([k,v])=>[k,v.length])));
  if(url.pathname==='/__dump')return send(res,200,{users:Object.keys(users),rows});
  send(res,404,{msg:'nf'})})}).listen(8790);
