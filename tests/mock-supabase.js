const http=require('http');const users={};const rows={};let n=0;
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,PUT,DELETE,OPTIONS'};
function send(res,code,obj){res.writeHead(code,{...cors,'Content-Type':'application/json'});res.end(obj===undefined?'':JSON.stringify(obj))}
const tok=(u)=>({access_token:'at-'+u.id,refresh_token:'rt-'+u.id,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:{id:u.id,email:u.email,user_metadata:u.meta}});
const objs={};
http.createServer((req,res)=>{const ch=[];req.on('data',c=>ch.push(c));req.on('end',()=>{const raw=Buffer.concat(ch);const isJ=!(req.url.startsWith('/storage/'));const b=isJ?raw.toString():'';
  if(req.method==='OPTIONS')return send(res,204);
  const url=new URL(req.url,'http://x');const body=b?JSON.parse(b):{};
  const auth=(req.headers.authorization||'').replace('Bearer at-','');
  if(url.pathname==='/auth/v1/signup'){ if(users[body.email])return send(res,422,{code:422,error_code:'user_already_exists',msg:'User already registered'});
    if(body.password.length<6)return send(res,422,{msg:'Password should be at least 6 characters'});
    const u={id:'u'+(++n),pw:body.password,meta:body.data,email:body.email};users[body.email]=u;return send(res,200,tok(u))}
  if(url.pathname==='/auth/v1/token'){ if(url.searchParams.get('grant_type')==='password'){const u=users[body.email];if(!u||u.pw!==body.password)return send(res,400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return send(res,200,tok(u))}
    const u=Object.values(users).find(x=>'rt-'+x.id===body.refresh_token);return u?send(res,200,tok(u)):send(res,400,{msg:'bad refresh'})}
  if(url.pathname==='/auth/v1/user'&&req.method==='GET'){const e=Object.keys(users).find(k=>users[k].id===auth);return e?send(res,200,{id:auth,email:e,user_metadata:users[e].meta}):send(res,401,{msg:'no'})}
  if(url.pathname==='/auth/v1/user'&&req.method==='PUT'){const e=Object.keys(users).find(k=>users[k].id===auth);if(!e)return send(res,401,{msg:'no'});
    if(body.email&&body.email!==e){if(users[body.email])return send(res,422,{error_code:'email_exists',msg:'A user with this email address has already been registered'});users[body.email]=users[e];delete users[e]}
    const em=body.email||e;if(body.data)users[em].meta={...users[em].meta,...body.data};return send(res,200,{id:auth,email:em,user_metadata:users[em].meta})}
  if(url.pathname==='/auth/v1/logout')return send(res,204);
  if(url.pathname==='/rest/v1/user_data'){
    if(req.method==='GET'){const id=url.searchParams.get('user_id').replace('eq.','');if(id!==auth)return send(res,200,[]);return send(res,200,rows[id]?[rows[id]]:[])}
    if(req.method==='POST'){if(body.user_id!==auth)return send(res,403,{message:'rls'});rows[body.user_id]={data:body.data,updated_at:body.updated_at};return send(res,201)}
  }
  // faux Claude pour l'onglet Nutrition (réponses fixes)
  if(url.pathname==='/functions/v1/nutrition'){if(!auth)return send(res,401,{error:'Non connecté'});
    if(body.kind==='profil')return send(res,200,{result:{bmr_kcal:1780,tdee_kcal:2650,target_kcal:2950,protein_g:150,carbs_g:380,fat_g:90,explanation:'Ton corps brûle environ 1 780 kcal au repos. Avec ton sport, tu dépenses environ 2 650 kcal par jour. Pour prendre du poids, vise 2 950 kcal.',warnings:[],weight_goal:body.data&&body.data.target_weight_kg?{realistic:false,weekly_change_kg:0.3,suggested_weeks:27,advice:'Prendre 8 kg en 1 mois ferait surtout du gras. Vise environ 0,3 kg par semaine : ton objectif sera atteint en 6 mois environ.'}:{realistic:true,weekly_change_kg:0,suggested_weeks:0,advice:''}}});
    if(body.kind==='aliment')return send(res,200,{result:{dish:body.image?'Assiette poisson riz':'Barre chocolatée',emoji:body.image?'🍽️':'🍫',items:body.image?[{name:'Riz blanc cuit',emoji:'🍚',quantity:'150 g',grams:150,kcal:195,protein_g:4.1,carbs_g:42.3,fat_g:0.5},{name:'Poisson blanc',emoji:'🐟',quantity:'120 g',grams:120,kcal:158,protein_g:34.2,carbs_g:0,fat_g:1.8}]:[{name:'Barre chocolatée',emoji:'🍫',quantity:'1 barre (43 g)',grams:43,kcal:246,protein_g:3.7,carbs_g:21.3,fat_g:16}],note:''}});
    if(body.kind==='menu')return send(res,200,{result:{meals:[{name:'Petit-déjeuner',kcal:700,protein_g:35,carbs_g:90,fat_g:20,items:[{food:'Flocons d\'avoine',grams:100,kcal:370,protein_g:13,carbs_g:60,fat_g:7},{food:'Skyr',grams:250,kcal:160,protein_g:22,carbs_g:10,fat_g:0.5}]},{name:'Déjeuner',kcal:1100,protein_g:60,carbs_g:140,fat_g:30,items:[{food:'Poulet',grams:200,kcal:330,protein_g:62,carbs_g:0,fat_g:7},{food:'Riz cuit',grams:350,kcal:455,protein_g:9,carbs_g:100,fat_g:1}]}],total:{kcal:1800,protein_g:95,carbs_g:230,fat_g:50},tips:'Prépare le riz à l\'avance.'}});
    if(body.kind==='bilan')return send(res,200,{result:body.scope==='week'?{summary:'Semaine correcte : 3 jours suivis sur 7, protéines un peu basses.',good:['Calories proches de l\'objectif les jours suivis'],improve:['4 jours sans suivi'],tips:['Ajoute une source de protéines au petit-déjeuner','Note tes repas le soir même']}:{summary:'Aujourd\'hui tu es à 246 kcal sur 2 950 : il te reste de la marge.',good:['Tu as noté ton premier repas'],improve:[],tips:['Vise 40 g de protéines au prochain repas']}});
    return send(res,400,{error:'Demande inconnue'})}
  if(url.pathname==='/functions/v1/horaire'){if(!auth)return send(res,401,{error:'Non connecté'});res.writeHead(200,{...cors,'Content-Type':'text/calendar'});return res.end("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Index Education//HYPERPLANNING//FR\r\nBEGIN:VEVENT\r\nUID:Cours-1-Index-Education\r\nDTSTART:20261009T070000Z\r\nDTEND:20261009T090000Z\r\nSUMMARY;LANGUAGE=fr:Strategic Management - CM\r\nLOCATION;LANGUAGE=fr:Plaine de Nimy - Auditoire 25\r\nDESCRIPTION;LANGUAGE=fr:Matière : Strategic Management\\nEnseignant : Dupont\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:Cours-2-Index-Education\r\nDTSTART;TZID=Europe/Brussels:20261009T130000\r\nDTEND;TZID=Europe/Brussels:20261009T150000\r\nSUMMARY:Annulé : Seminar in Corporate Fina\r\n nce\r\nLOCATION:Warocqué - Salle 1.04\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:Cours-3\r\nDTSTART:20261012T080000Z\r\nDTEND:20261012T100000Z\r\nSTATUS:CANCELLED\r\nSUMMARY:Séminaires NTIC\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:Conge-1\r\nDTSTART;VALUE=DATE:20261102\r\nDTEND;VALUE=DATE:20261104\r\nSUMMARY:Congé\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n")}
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
  if(url.pathname==='/__objs')return send(res,200,Object.fromEntries(Object.entries(objs).map(([k,v])=>[k,v.length])));
  if(url.pathname==='/__dump')return send(res,200,{users:Object.keys(users),rows});
  send(res,404,{msg:'nf'})})}).listen(8790);
