// Test rapide avant chaque mise en ligne (iPhone 13 simulé, clair + sombre, FR + EN). Version 28.
// Prérequis une fois : npm i -D playwright
// Lance :  node tests/smoke.js   → captures dans tests/out/, erreurs affichées à la fin
// (l'ancien test de la v22 est gardé dans tests/smoke-v22.js pour mémoire)
const {chromium,devices}=require("playwright"),fs=require("fs"),path=require("path");
require("./serve.js");
const OUT=path.join(__dirname,"out");fs.mkdirSync(OUT,{recursive:true});
const G={plan:"orga",todo:"orga",pomo:"orga",muscu:"sport",nutri:"sport",graph:"sport",notes:"perso",docs:"perso",pwd:"perso",more:"more",app:"more"};
const U="http://localhost:8766/",shot=(pg,n)=>pg.screenshot({path:path.join(OUT,n+".png")});
(async()=>{
  const b=await chromium.launch(),errs=[];
  // le lecteur Spotify (iframe) n'est pas testé : sa page réelle a ses propres erreurs, sans rapport avec Sid'note
  {const nc=b.newContext.bind(b);b.newContext=async o=>{const c=await nc(o);if(!(o&&o.intro))await c.addInitScript(()=>{window.__noIntro=true});await c.route(/open\.spotify\.com/,r=>r.fulfill({status:200,contentType:"text/html",body:"<!doctype html><title>Spotify</title>"}));return c}}
  for(const scheme of ["light","dark"]){
    const ctx=await b.newContext({...devices["iPhone 13"],colorScheme:scheme}),pg=await ctx.newPage();
    pg.on("pageerror",e=>errs.push(scheme+": "+e.message));
    pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))errs.push(scheme+" CSP : "+m.text().slice(0,200))});
    const err=m=>errs.push(scheme+": "+m);
    // navigation v28 : espace dans la barre du bas, puis fonction dans les pastilles du haut
    const closePin=async()=>{if(await pg.isVisible("#pinSheet"))await pg.click("#psClose").catch(()=>{})};
    // v42 : Sid'home → logo de l'app → barre du bas de l'app ; Réglages par le bouton du compte sur Sid'home
    const home=async()=>{await closePin();if(await pg.isVisible('#vhead [data-go="home"]'))await pg.click('#vhead [data-go="home"]');else await pg.evaluate(()=>show("home"));await pg.waitForTimeout(150)};
    const go=async v=>{await closePin();const c=await cur();
      if(v==="more"||v==="app"){if(c===v)return;if(c!=="home")await home();await pg.click("#homeAvatar");await pg.waitForTimeout(150);if(v==="app")await pg.evaluate(()=>show("app"));await closePin();return}
      if(c==="home"||G[c]!==G[v]){await home();await pg.click(`#homeBody [data-gapp="${G[v]}"]`);await pg.waitForTimeout(150);await closePin()}
      if(await cur()!==v&&await pg.isVisible(`#navIn [data-go="${v}"]`))await pg.click(`#navIn [data-go="${v}"]`);await pg.waitForTimeout(200);await closePin()};
    const cur=()=>pg.evaluate(()=>data.ui.view);
    const email=scheme+"@test.be";

    // --- connexion : œil, blocage après 5 erreurs, mot de passe oublié
    await pg.goto(U);await pg.waitForTimeout(400);
    // v34 : nouveau visiteur → « Créer un compte » en premier, avec ce que fait l'app
    if(await pg.getAttribute("#mSignup","aria-pressed")!=="true")err("un nouveau visiteur n'arrive pas sur « Créer un compte »");
    if(await pg.$$eval("#authFeats li",x=>x.length)<3)err("l'écran d'arrivée n'explique pas l'app");
    await shot(pg,scheme+"-00-arrivee");await pg.click("#mLogin");
    await pg.fill("#aPw","secret11");await pg.click('[data-pweyefor="aPw"]');
    if(await pg.getAttribute("#aPw","type")!=="text")err("l'œil n'affiche pas le mot de passe");
    await pg.click('[data-pweyefor="aPw"]');await shot(pg,scheme+"-01-connexion");
    for(let i=0;i<5;i++){await pg.fill("#aEmail","inconnu@test.be");await pg.fill("#aPw","mauvais"+i);await pg.click("#aBtn");await pg.waitForTimeout(250)}
    if(!(await pg.isDisabled("#aBtn"))||!(await pg.textContent("#aBtn")).includes("Trop d'essais"))err("pas de blocage après 5 essais ratés");
    await shot(pg,scheme+"-01-connexion-bloquee");
    await pg.evaluate(()=>{localStorage.removeItem("sidnote-auth-lock");authWait()});
    await pg.click("#aForgot");await pg.fill("#fpEmail",email);await pg.click("#fpBtn");await pg.waitForSelector("#fpOk:not([hidden])",{timeout:5000}).catch(()=>err("mot de passe oublié : pas de confirmation"));
    await shot(pg,scheme+"-01-mdp-oublie");await pg.click("#fpClose");

    // --- inscription, présentation passée, tous les onglets affichés
    await pg.click("#mSignup");await pg.fill("#aName","Test");await pg.fill("#aEmail",email);
    await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){await shot(pg,scheme+"-02-presentation");await pg.click("#onbSkip");await pg.waitForTimeout(400)}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{["plan","todo","pomo","notes","muscu","nutri","graph","docs","pwd","app"].forEach(k=>data.prefs.tabs[k]=true);save();applyTabs()});

    // --- v42 : Sid'home : les 3 apps en logos, pas de barre du bas ; chaque app a sa barre et un retour à Sid'home
    if(await pg.isVisible("nav"))err("barre du bas affichée sur Sid'home");
    const apps=await pg.$$eval("#homeBody .home-apps [data-gapp]",x=>x.map(e=>e.dataset.gapp).join(","));
    if(apps!=="orga,sport,perso")err("logos des 3 apps absents de Sid'home : "+apps);
    await shot(pg,scheme+"-03-aujourdhui");
    await pg.click("#homeAdd");if(!(await pg.isVisible("#qaSheet")))err("le + de la page Aujourd'hui n'ouvre pas l'ajout rapide");await pg.click("#qaClose");
    await pg.click('#homeBody [data-gapp="perso"]');await pg.waitForTimeout(200);await closePin();
    if(G[await cur()]!=="perso")err("le logo sid'note n'ouvre pas sid'note");
    if((await pg.$$("#navIn [data-go]")).length!==3)err("barre de sid'note : 3 fonctions attendues");
    if(await pg.evaluate(()=>document.documentElement.dataset.app)!=="note")err("accent de l'app non appliqué");
    if(await pg.isVisible('#homeBody'))err("Sid'home encore visible dans une app");
    await go("notes");await go("muscu");await home();await pg.click('#homeBody [data-gapp="perso"]');await pg.waitForTimeout(200);await closePin();
    if(await cur()!=="notes")err("l'app ne rouvre pas la dernière fonction ouverte");
    await home();if(await pg.isVisible("#vhead"))err("en-tête d'app affiché sur Sid'home");
    await go("plan");if((await pg.$$eval("#navIn [data-go]",x=>x.map(e=>e.dataset.go).join(",")))!=="plan,todo,pomo")err("barre de sid'agenda : Agenda, Tâches, Focus attendus");

    // --- Tâches : catégorie tapée mais pas validée → créée et utilisée
    await go("todo");await pg.click("[data-tcatnew]");await pg.fill("#catIn","Projet");await pg.fill("#todoIn","Préparer le dossier");await pg.press("#todoIn","Enter");
    const t1=await pg.evaluate(()=>{const c=data.todoCats.find(x=>x.name==="Projet"),t=data.todos.find(x=>x.title==="Préparer le dossier");return !!(c&&t&&t.cat===c.id)});
    if(!t1)err("tâche non rangée dans la catégorie tapée");
    await pg.click('[data-tcat="all"]');await pg.fill("#todoIn","Appeler le garage");await pg.press("#todoIn","Enter");
    await pg.fill("#todoIn","Acheter du pain");await pg.press("#todoIn","Enter");
    // glisser « Appeler le garage » sur la pastille « Projet »
    const grip=await pg.$('#todoOpen .row:has-text("Appeler le garage") [data-grip]'),pill=await pg.$('#todoCats .pill:has-text("Projet")');
    const ga=await grip.boundingBox(),pb=await pill.boundingBox();await pg.mouse.move(ga.x+ga.width/2,ga.y+ga.height/2);await pg.mouse.down();
    await pg.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2,{steps:10});await pg.waitForTimeout(150);await pg.mouse.up();await pg.waitForTimeout(250);
    if(!(await pg.evaluate(()=>{const c=data.todoCats.find(x=>x.name==="Projet"),t=data.todos.find(x=>x.title==="Appeler le garage");return t.cat===c.id})))err("glisser une tâche sur une catégorie inopérant");
    // replier « Projet », recharger l'app : toujours replié
    await pg.click('#todoOpen [data-tfold]:not([data-tfold="none"])');await pg.waitForTimeout(300);
    await pg.reload();await pg.waitForTimeout(1200);if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");await go("todo");
    if((await pg.textContent("#todoOpen")).includes("Préparer le dossier"))err("la catégorie repliée ne le reste pas après réouverture");
    await shot(pg,scheme+"-fr-todo-replie");
    // tâches réalisées : vue calendrier, puis la liste du jour
    await pg.click('[data-tcat="all"]');const tg=await pg.$('#todoOpen .row:has-text("Acheter du pain") [data-tg]');await tg.click();await pg.waitForTimeout(200);
    await pg.click("#foldDone");await pg.click('[data-dv="cal"]');await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#todoDone .dc")))err("calendrier des tâches réalisées absent");
    else{await pg.click("#todoDone .dc-d.td");await pg.waitForTimeout(200);if(!(await pg.textContent("#todoDone")).includes("Acheter du pain"))err("le jour ne montre pas la tâche réalisée")}
    await pg.locator("#foldDone").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-todo-calendrier");
    await pg.click('[data-dv="list"]');

    // --- Mots de passe : classement A → Z ou récents
    await go("pwd");await pg.waitForTimeout(300);await shot(pg,scheme+"-fr-pwd-code");
    if(await pg.isVisible("#pinPad")){const pin=async c=>{for(const d of c)await pg.click(`#pinPad [data-pin="${d}"]`)};
      await pin("12345");await pg.waitForTimeout(400);if(!(await pg.isVisible("#vault"))&&!(await pg.isVisible("#phSheet"))){await pin("12345");}
      // v32 : la phrase secrète est demandée à la création du coffre
      await pg.waitForSelector("#phSheet:not([hidden])",{timeout:8000}).catch(()=>err("phrase secrète non demandée à la création du coffre"));
      await pg.fill("#phIn","court");await pg.fill("#ph2In","court");await pg.click("#phOk");await pg.waitForTimeout(200);
      if(!(await pg.isVisible("#phErr")))err("phrase trop courte acceptée");
      await pg.fill("#phIn","trois mots 42");await pg.fill("#ph2In","trois mots 42");await shot(pg,scheme+"-fr-phrase-secrete");await pg.click("#phOk");
      await pg.waitForSelector("#recSheet:not([hidden])",{timeout:15000}).catch(()=>err("récupération de la phrase non proposée"));
      if(await pg.isVisible("#recSheet"))await pg.click("#recLater");
      await pg.waitForSelector("#vault:not([hidden])",{timeout:8000}).catch(()=>err("coffre non ouvert"));await pg.waitForTimeout(400);
      const vf=await pg.evaluate(()=>({v:data.vault.v,salt:!!data.vault.salt,ph:!!data.phx,dv:data.docVault&&data.docVault.v}));
      if(vf.v!==2||vf.salt||!vf.ph||vf.dv!==2)err("coffre pas au format renforcé : "+JSON.stringify(vf));
      if(await pg.isVisible("#recSheet"))await pg.click("#recLater")}
    if(await pg.isVisible("#vault")){
      for(const site of ["Zeta","Alpha"]){await pg.click("#pwNew");await pg.fill("#pwSite",site);await pg.fill("#pwPass","x"+site);await pg.click("#pwForm [type=submit]");await pg.waitForTimeout(300)}
      const order=()=>pg.$$eval("#pwList .pw-row b",x=>x.map(e=>e.textContent).join(","));
      if(await order()!=="Alpha,Zeta")err("classement A → Z incorrect : "+await order());
      await pg.click('[data-pwsort="date"]');
      await pg.evaluate(()=>{const z=data.pwds.find(p=>vaultItems.get(p.id).site==="Zeta");z.upd=Date.now()+5000;renderPwList()});
      if(await order()!=="Zeta,Alpha")err("classement par date incorrect : "+await order());
      await shot(pg,scheme+"-fr-pwd-tri");await pg.click('[data-pwsort="alpha"]')}

    // --- Agenda : option de calendrier relié, sans « UMons »
    await go("plan");
    if(!(await pg.textContent("#moreOpts summary")).includes("Relier un calendrier"))err("option iCal non renommée");
    if((await pg.textContent("#v-plan")).includes("UMons"))err("« UMons » encore affiché dans l'agenda");
    await pg.click("#moreOpts summary");await pg.locator("#moreOpts").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-plan-calendrier-relie");await pg.click("#moreOpts summary");
    const notifTxt=await pg.evaluate(()=>{renderLeads();return document.querySelector(".notif-box").textContent});
    if(notifTxt.includes("UMons")||notifTxt.includes("me prévenir 24"))err("l'option des cours reste affichée sans calendrier relié");

    // --- v29 : mois repliables dans l'Agenda
    await pg.evaluate(()=>{const y=new Date().getFullYear();data.tasks.push({id:"m1",title:"Anniversaire A",date:`${y+1}-01-19`,status:"à faire",cat:"Perso"},{id:"m2",title:"Anniversaire B",date:`${y+1}-03-02`,status:"à faire",cat:"Perso"});save();renderPlan()});
    await pg.click("#tasks [data-mfold]");await pg.waitForTimeout(150);
    if(!(await pg.$eval("#tasks [data-mfold]",b=>b.getAttribute("aria-expanded")==="false")))err("le mois ne se replie pas");
    await pg.click("[data-mfoldall]");await pg.waitForTimeout(150);
    if(await pg.$$eval("#tasks .card",x=>x.length)!==0)err("« Tout replier » ne replie pas tous les mois");
    await pg.locator("#tasks").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-plan-mois-replies");await pg.click("[data-mfoldall]");
    // --- v29 : le fond est figé quand une fenêtre est ouverte
    await home();await pg.click("#homeAdd");await pg.waitForTimeout(150);
    if(!(await pg.evaluate(()=>document.documentElement.classList.contains("modal-open"))))err("le fond n'est pas figé sous l'ajout rapide");
    await shot(pg,scheme+"-fr-ajout-rapide");await pg.click("#qaClose");await pg.waitForTimeout(150);
    if(await pg.evaluate(()=>document.documentElement.classList.contains("modal-open")))err("le fond reste figé après fermeture");
    // --- v44 : plus de chrono ni de minuteur dans la musculation
    await go("muscu");if(await pg.$("#rest")||await pg.$("#restTrack")||await pg.$("#tmSlide"))err("le chrono ou le minuteur est encore là");
    await shot(pg,scheme+"-fr-muscu");
    // --- v29 : code des Documents dans la page, grand clavier
    await go("docs");await pg.waitForTimeout(300);
    if(await pg.isVisible("#pinSheet"))err("le code des Documents s'ouvre encore dans une fenêtre");
    if(!(await pg.isVisible("#docPinHost #psPad")))err("clavier du code absent de la page Documents");
    await shot(pg,scheme+"-fr-docs-code");
    // --- v42 : les ambiances de couleurs sont remplacées par la direction « Éditorial de précision » (clair ivoire / graphite)
    await go("more");if(await pg.isVisible("#palSel"))err("le choix des ambiances est encore affiché");
    if(await pg.evaluate(()=>document.documentElement.dataset.palette||document.documentElement.dataset.ds!=="edito"))err("direction artistique non appliquée");
    await go("todo");await shot(pg,scheme+"-fr-todo");
    // --- v31 : Nutrition : « à inclure / à éviter » propres à chaque repas ; délai pré-rempli en modifiant le profil
    await go("nutri");await pg.evaluate(()=>{const n=NU();n.consent=new Date().toISOString();n.profile={sex:"h",age:24,height:180,weight:72,goal:"gain",target:80,sports:[]};n.plan={kcal:2500,p:150,c:300,f:80,bmr:1800,tdee:2400,text:"",warn:[],wg:{ok:false,wk:.3,weeks:26,advice:"x"}};
      n.menuPrefs={type:"day",pp:{day:{include:"poulet",exclude:"poisson"}}};save();applySoon();renderNutri();nuGoTab("menu")});await pg.waitForTimeout(200);
    if(await pg.inputValue("#nuInclude")!=="poulet")err("préférences de la journée non affichées");
    await pg.click('[data-mtype="breakfast"]');await pg.waitForTimeout(150);
    if(await pg.inputValue("#nuInclude")!==""||await pg.inputValue("#nuExclude")!=="")err("les préférences se recopient d'un repas à l'autre");
    await pg.fill("#nuInclude","flocons d'avoine");await pg.click('[data-mtype="day"]');await pg.waitForTimeout(150);
    if(await pg.inputValue("#nuInclude")!=="poulet")err("préférences de la journée écrasées par celles du petit-déjeuner");
    await pg.fill("#nuExclude","je ne veux pas de blanc de dinde au matin, et je veux consommer les aliments entiers, donc par exemple pas que du blanc d'oeuf");await pg.waitForTimeout(100);
    if((await pg.$eval("#nuExclude",e=>e.offsetHeight))<60)err("le champ « à éviter » ne s'agrandit pas");
    await pg.locator("#nuExclude").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-nutri-menu-prefs");
    await pg.evaluate(()=>{nuGoTab("profile");$("nuEditProfile").click()});await pg.waitForTimeout(200);
    if(await pg.inputValue("#nuDur")!=="6"||await pg.inputValue("#nuDurU")!=="m")err("délai conseillé non pré-rempli ("+await pg.inputValue("#nuDur")+")");
    // --- Compte : changer de mot de passe
    await go("more");await pg.click("#chPwBtn");await pg.fill("#npOld","faux123");await pg.fill("#npPw","secret22");await pg.fill("#npPw2","secret22");await pg.click("#npBtn");await pg.waitForTimeout(400);
    if(!(await pg.isVisible("#npErr")))err("mauvais mot de passe actuel accepté");
    await pg.fill("#npOld","secret11");await pg.click("#npBtn");await pg.waitForSelector("#npSheet",{state:"hidden",timeout:20000}).catch(()=>err("changement de mot de passe bloqué"));
    const okNew=await pg.evaluate(async e=>{try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:e,password:"secret22"}});return true}catch(x){return false}},email);
    if(!okNew)err("nouveau mot de passe non enregistré");
    // lien « mot de passe oublié » reçu par e-mail : nouvelle saisie, puis connexion
    const uidv=await pg.evaluate(()=>session.user.id);
    await pg.evaluate(()=>{localStorage.removeItem("sidnote-session")});
    await pg.goto(U+"?lien=1#access_token=at-"+uidv+"&refresh_token=rt-"+uidv+"&type=recovery");await pg.waitForTimeout(800);
    if(!(await pg.isVisible("#npSheet")))err("le lien de récupération n'ouvre pas la saisie du nouveau mot de passe");
    else{await shot(pg,scheme+"-01-nouveau-mdp");await pg.fill("#npPw","secret33");await pg.fill("#npPw2","secret33");await pg.click("#npBtn");await pg.waitForTimeout(1800);
      if(await pg.isVisible("#auth"))err("pas connecté après le nouveau mot de passe");if((await pg.url()).includes("access_token"))err("le jeton reste dans l'adresse")}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");

    // --- tour des écrans, FR puis EN
    for(const v of ["plan","todo","pomo","notes","muscu","nutri","graph","docs","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-fr-${v}`)}
    await go("more");if(!(await pg.isVisible("#langSel")))await pg.click('[data-sec="look"] summary');await pg.selectOption("#langSel","en");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    for(const v of ["plan","todo","notes","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-en-${v}`)}
    await home();await shot(pg,scheme+"-en-home");
    // v31 : néerlandais
    await go("more");if(!(await pg.isVisible("#langSel")))await pg.click('[data-sec="look"] summary');await pg.selectOption("#langSel","nl");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(await pg.evaluate(()=>document.documentElement.lang)!=="nl")err("le néerlandais ne s'active pas");
    for(const v of ["plan","todo","notes","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-nl-${v}`)}
    const nlLeft=await pg.evaluate(()=>{show("todo");return document.querySelector("#v-todo h1").textContent});if(nlLeft.trim()==="Tâches")err("titres non traduits en néerlandais");
    await home();await shot(pg,scheme+"-nl-home");
    await ctx.close();
  }
  // --- ordinateur (écran large) : barre latérale et rendu épuré
  for(const scheme of ["light","dark"]){
    const ctx=await b.newContext({viewport:{width:1440,height:900},colorScheme:scheme}),pg=await ctx.newPage();
    pg.on("pageerror",e=>errs.push("pc "+scheme+": "+e.message));
    await pg.goto(U);await pg.waitForTimeout(400);await shot(pg,scheme+"-pc-connexion");
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","pc-"+scheme+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{["plan","todo","pomo","notes","muscu","nutri","graph","docs","pwd","app"].forEach(k=>data.prefs.tabs[k]=true);
      data.todos.push({id:"a",title:"Préparer la présentation",createdAt:new Date().toISOString(),done:false},{id:"b",title:"Appeler le garage",createdAt:new Date().toISOString(),done:false});save();applyTabs();renderAll()});
    for(const v of ["home","todo","plan","more"]){await pg.evaluate(v=>show(v),v);await pg.waitForTimeout(300);await shot(pg,`${scheme}-pc-${v}`)}
    await ctx.close();
  }
  // --- v39 : Nutrition et Graphiques ouverts à tous (l'IA de chacun calcule) ; la page d'ouverture choisie est respectée
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("sans accès : "+m);
    pg.on("pageerror",e=>err(e.message));pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Proche");await pg.fill("#aEmail","sans@test.be");await pg.fill("#aPw","court1");await pg.fill("#aPw2","court1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(500);
    if(!(await pg.isVisible("#aErr"))||!(await pg.textContent("#aErr")).includes("8 caractères"))err("mot de passe de 6 caractères accepté à l'inscription");
    await pg.fill("#aPw","assezlong1");await pg.fill("#aPw2","assezlong1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){
      await shot(pg,"sans-acces-presentation-sport").catch(()=>{});await pg.click("#onbSkip")}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{data.prefs.tabs.nutri=true;data.prefs.tabs.graph=true;save();applyTabs()});
    await pg.evaluate(()=>show("home"));await pg.click('#homeBody [data-gapp="sport"]');await pg.waitForTimeout(300);await shot(pg,"sans-acces-sante");
    if(!(await pg.locator('#navIn [data-go="nutri"]').count()))err("Nutrition absente pour un compte ordinaire");
    await pg.evaluate(()=>{show("nutri")});if(await pg.evaluate(()=>data.ui.view)!=="nutri")err("Nutrition ne s'ouvre pas");
    await pg.evaluate(()=>{data.prefs.home="todo";data.prefs.homeV=1;save()});await pg.waitForTimeout(1500);await pg.reload();await pg.waitForTimeout(1200);
    if(await pg.evaluate(()=>data.ui.view)!=="home"||await pg.evaluate(()=>scrollY)!==0)err("v43 : l'app ne s'ouvre pas en haut d'Aujourd'hui (même avec un ancien choix de page)");
    
    if(await pg.evaluate(()=>esc("l'a")!=="l&#39;a"))err("esc n'échappe pas l'apostrophe");
    await ctx.close()}
  // --- v32 : coffre renforcé : passage d'un ancien coffre (code seul), nouvel appareil, code oublié
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("coffre : "+m);
    pg.on("pageerror",e=>err(e.message));pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    const pin=async c=>{for(const d of c)await pg.click(`#pinPad [data-pin="${d}"]`)};
    const ps=async c=>{for(const d of c)await pg.click(`#psPad [data-ps="${d}"]`);await pg.waitForTimeout(150)};
    const phrase=async(t,two)=>{await pg.waitForSelector("#phSheet:not([hidden])",{timeout:10000});await pg.fill("#phIn",t);if(two)await pg.fill("#ph2In",t);await pg.click("#phOk")};
    const later=async()=>{await pg.waitForSelector("#recSheet:not([hidden])",{timeout:15000}).catch(()=>{});if(await pg.isVisible("#recSheet"))await pg.click("#recLater")};
    const show=v=>pg.evaluate(v=>show(v),v);
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Coffre");await pg.fill("#aEmail","coffre@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    // anciens coffres (v31) : mots de passe + documents avec le code 24680, notes secrètes avec 13579
    await pg.evaluate(async()=>{const mkOld=async(code,ok,id,extra)=>{const salt=b64e(crypto.getRandomValues(new Uint8Array(16))),key=await pinKey(code,salt,PIN_ITER);
        return {v:{id,salt,iter:PIN_ITER,chk:await encJ(key,{ok}),createdAt:"2026-01-01T00:00:00.000Z",...extra},key}};
      const v=await mkOld("24680","sidnote","oldv"),d=await mkOld("24680","sidnote-docs","oldd",{uni:true}),n=await mkOld("13579","sidnote-notes","oldn");
      data.vault=v.v;data.docVault=d.v;data.noteVault=n.v;
      data.pwds.push({id:"p1",vid:"oldv",...await encJ(v.key,{site:"Banque",user:"sid",pw:"s3cret!"}),upd:1});
      data.notes.push({id:"n1",secret:true,vid:"oldn",...await encJ(n.key,{title:"Secret",body:"Le code du portail"}),createdAt:new Date().toISOString(),upd:1});
      const pdf=new Blob(["%PDF-1.4 bail "+"x".repeat(300)],{type:"application/pdf"});
      const d1={id:"d1",title:"Bail",size:pdf.size,pages:1,createdAt:new Date().toISOString(),up:true,enc:"oldd"};d1.path=docPath(d1);
      await stor("POST","documents/"+d1.path,await docEncrypt(pdf,d.key)); // en ligne seulement, chiffré avec l'ancienne clé
      const d2={id:"d2",title:"Scan",size:pdf.size,pages:1,createdAt:new Date().toISOString(),up:false};await idb.put(docKey(d2),pdf); // sur l'appareil, en clair
      data.docs.push(d1,d2);save()});
    // 1) mots de passe : ancien code → phrase demandée → coffre renforcé, mêmes données
    await show("pwd");await pg.waitForTimeout(300);await pin("24680");
    await phrase("ma phrase secrete 7",true).catch(()=>err("phrase non demandée au passage du coffre"));await shot(pg,"coffre-renforce");await later();
    await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("coffre non rouvert après le passage"));await pg.waitForTimeout(800);
    let st=await pg.evaluate(()=>({v:data.vault.v,salt:!!data.vault.salt,vid:data.pwds[0].vid===data.vault.id,item:(vaultItems.get("p1")||{}).pw,mk:Object.keys(JSON.parse(localStorage.getItem("sidnote-mk-"+session.user.id)||"{}"))}));
    if(st.v!==2||st.salt||!st.vid||st.item!=="s3cret!"||!st.mk.includes("main"))err("passage des mots de passe raté : "+JSON.stringify(st));
    // 2) documents : même code, passage sans redemander la phrase ; fichiers rechiffrés en ligne et sur l'appareil
    await show("docs");await pg.waitForTimeout(300);await ps("24680");await pg.waitForTimeout(4000);
    st=await pg.evaluate(async()=>{const d1=data.docs.find(x=>x.id==="d1"),d2=data.docs.find(x=>x.id==="d2");
      const r=await stor("GET","authenticated/documents/"+d1.path),u=new Uint8Array(await r.arrayBuffer());let srv=false;try{srv=(await docDecrypt(u)).size>0}catch(e){}
      return {v:data.docVault.v,open:dvOpen,enc:d1.enc===data.docVault.id,srv,seal1:await blobIsEnc(await idb.get(docKey(d1))),seal2:await blobIsEnc(await idb.get(docKey(d2))),up2:d2.up,read:(await docBlob(d1)).size}});
    if(st.v!==2||!st.open||!st.enc||!st.srv||!st.seal1||!st.seal2||!st.up2||!(st.read>0))err("passage des documents raté : "+JSON.stringify(st));
    // 3) notes secrètes : leur propre code, passage sans redemander la phrase
    await show("notes");await pg.click('[data-note="n1"]');await pg.waitForTimeout(200);await ps("13579");await pg.waitForTimeout(2500);
    st=await pg.evaluate(()=>({v:data.noteVault.v,vid:data.notes.find(x=>x.id==="n1").vid===data.noteVault.id,txt:document.getElementById("noteBody").innerText.trim()}));
    if(st.v!==2||!st.vid||st.txt!=="Le code du portail")err("passage des notes secrètes raté : "+JSON.stringify(st));
    await pg.click("#noteBack");
    // 4) le serveur ne contient plus rien qu'un code à 5 chiffres suffirait à ouvrir
    st=await pg.evaluate(()=>JSON.stringify([data.vault,data.docVault,data.noteVault]));if(/"salt"/.test(st))err("un coffre dépend encore du code seul");
    // 5) nouvel appareil : plus de clé sur l'appareil → phrase (fausse puis bonne) → nouveau code → tout se rouvre
    await pg.evaluate(()=>{localStorage.removeItem("sidnote-mk-"+session.user.id);phMem=null;pwdLock();dvLock();nsLock()});
    await show("pwd");await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#pinDev")))err("pas de bouton « phrase secrète » sur un nouvel appareil");await shot(pg,"coffre-nouvel-appareil");
    await pg.click("#pinDev");await phrase("mauvaise phrase");await pg.waitForTimeout(1500);
    if(!(await pg.isVisible("#phErr")))err("fausse phrase acceptée");
    await phrase("ma phrase secrete 7");await pg.waitForSelector("#pinSheet:not([hidden])",{timeout:15000}).catch(()=>err("code de l'appareil non demandé"));
    await ps("11111");await ps("11111");await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("coffre non ouvert sur le nouvel appareil"));await pg.waitForTimeout(600);
    if(await pg.evaluate(()=>(vaultItems.get("p1")||{}).pw)!=="s3cret!")err("mot de passe illisible sur le nouvel appareil");
    await show("docs");await pg.waitForTimeout(300);await ps("11111");await pg.waitForTimeout(1500);
    if(!(await pg.evaluate(async()=>dvOpen&&(await docBlob(data.docs.find(x=>x.id==="d1"))).size>0)))err("documents illisibles sur le nouvel appareil");
    // 6) mauvais code puis code oublié → phrase → nouveau code
    await pg.evaluate(()=>{phMem=null;pwdLock()});await show("pwd");await pg.waitForTimeout(300);await pin("99999");await pg.waitForTimeout(1500);
    if(!(await pg.textContent("#pinErr")).includes("incorrect"))err("mauvais code accepté");
    await pg.click("#pinForgot");await phrase("ma phrase secrete 7");await pg.waitForSelector("#pinSheet:not([hidden])",{timeout:15000}).catch(()=>{});
    await ps("33333");await ps("33333");await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("code oublié : coffre non rouvert"));
    // 7) fusion : un appareil resté sur l'ancien coffre n'écrase pas le coffre renforcé
    st=await pg.evaluate(()=>{const nv=data.vault,old={id:"oldv",salt:"x",chk:{},createdAt:"2026-01-01T00:00:00.000Z"};
      return [mergeData({...data,vault:old},data).vault.id===nv.id,mergeData(data,{...data,vault:old}).vault.id===nv.id]});
    if(!st[0]||!st[1])err("la fusion garde l'ancien coffre : "+st);
    await ctx.close()}
  // --- v33 : sauvegarde complète, restauration (fusionner / remplacer), échecs de synchro visibles, copies de conflit
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("sauvegarde : "+m);
    pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Sauve");await pg.fill("#aEmail","sauve@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    const bk=await pg.evaluate(()=>{const now=new Date().toISOString();
      data.todos.push({id:"tA",title:"Tâche A",createdAt:now,done:false});data.notes.push({id:"nN",title:"Note N",body:"texte",createdAt:now,upd:Date.now()});
      data.muscu.sessions.push({id:"sM",name:"Push",exercises:[]});save();return JSON.stringify(bkObj())});
    const o=JSON.parse(bk);if(o.app!=="sidnote"||o.v!==2||!o.data.notes||!o.data.muscu||o.data.ui)err("sauvegarde incomplète : "+Object.keys(o.data).join(","));
    // après la sauvegarde : la note est supprimée, une tâche B ajoutée
    await pg.evaluate(()=>{tomb("nN");data.notes=data.notes.filter(n=>n.id!=="nN");data.todos.push({id:"tB",title:"Tâche B",createdAt:new Date().toISOString(),done:false});save()});
    await pg.waitForTimeout(2500);
    const file={name:"sauvegarde.json",mimeType:"application/json",buffer:Buffer.from(bk)};
    await pg.evaluate(()=>show("more"));await pg.setInputFiles("#restoreIn",file);await pg.waitForTimeout(400);
    if(!(await pg.isVisible("#bkSheet")))err("pas d'aperçu avant la restauration");await shot(pg,"sauvegarde-apercu");
    await pg.click("#bkMerge");await pg.waitForTimeout(3000);
    let st=await pg.evaluate(()=>({n:!!data.notes.find(n=>n.id==="nN"),a:!!data.todos.find(t=>t.id==="tA"),b:!!data.todos.find(t=>t.id==="tB")}));
    if(!st.n||!st.a||!st.b)err("fusion incorrecte : "+JSON.stringify(st));
    // la note restaurée doit survivre à la synchro (sa suppression est annulée sur le serveur aussi)
    await pg.evaluate(async()=>{cache.dirty=true;await push();cache.base="";await pull()});await pg.waitForTimeout(500);
    if(!(await pg.evaluate(()=>!!data.notes.find(n=>n.id==="nN"))))err("la note restaurée disparaît à la synchro");
    // remplacer : la tâche B (absente de la sauvegarde) part, après confirmation
    await pg.setInputFiles("#restoreIn",file);await pg.waitForTimeout(300);await pg.click("#bkReplace");
    if(!(await pg.isVisible("#bkSheet"))||!(await pg.evaluate(()=>!!data.todos.find(t=>t.id==="tB"))))err("« Remplacer » sans confirmation");
    await pg.click("#bkReplace");await pg.waitForTimeout(500);
    st=await pg.evaluate(()=>({b:!!data.todos.find(t=>t.id==="tB"),a:!!data.todos.find(t=>t.id==="tA"),m:data.muscu.sessions.length}));
    if(st.b||!st.a||st.m!==1)err("remplacement incorrect : "+JSON.stringify(st));
    // ancien format (v1) : seulement tâches et agenda, le reste du compte ne bouge pas
    await pg.setInputFiles("#restoreIn",{...file,buffer:Buffer.from(JSON.stringify({todos:[{id:"tV",title:"Vieille",createdAt:"2026-01-01",done:false}],tasks:[]}))});await pg.waitForTimeout(300);
    await pg.click("#bkReplace");await pg.click("#bkReplace");await pg.waitForTimeout(400);
    st=await pg.evaluate(()=>({v:!!data.todos.find(t=>t.id==="tV"),n:!!data.notes.find(n=>n.id==="nN"),m:data.muscu.sessions.length}));
    if(!st.v||!st.n||st.m!==1)err("ancien format mal restauré : "+JSON.stringify(st));
    // échec de synchro : le serveur refuse → message sur Aujourd'hui et dans Compte, puis « Réessayer » quand il revient
    await pg.evaluate(()=>fetch(SUPABASE_URL+"/__fail?on=1"));
    await pg.evaluate(()=>{data.todos.push({id:"tF",title:"Pendant la panne",createdAt:new Date().toISOString(),done:false});save();show("home")});await pg.waitForTimeout(3500);
    if(!(await pg.isVisible("#homeSync")))err("échec de synchro non affiché sur Aujourd'hui");await shot(pg,"synchro-echec");
    if(!(await pg.evaluate(()=>document.getElementById("syncState").textContent.includes("échec"))))err("échec non affiché dans Compte");
    await pg.click("#homeSync [data-syncretry]");await pg.waitForTimeout(800); // encore en panne : le message reste
    if(!(await pg.isVisible("#homeSync")))err("le message d'échec disparaît alors que le serveur refuse encore");
    await pg.evaluate(()=>fetch(SUPABASE_URL+"/__fail?on=0"));await pg.evaluate(()=>syncRetry());await pg.waitForTimeout(2000);
    if(await pg.isVisible("#homeSync"))err("le message d'échec reste après un envoi réussi");
    if(await pg.evaluate(()=>cache.dirty))err("modifications non envoyées après « Réessayer »");
    // conflit : la même note modifiée sur deux appareils → les deux versions sont gardées
    st=await pg.evaluate(()=>{const t0=Date.now()-60000,base={id:"c1",title:"Liste",body:"pain",createdAt:"x",upd:t0-1000};
      const m=mergeData({notes:[{...base,body:"pain, lait",upd:t0+10}]},{notes:[{...base,body:"pain, oeufs",upd:t0+20}]},{since:t0});
      const m2=mergeData({notes:[{...base,body:"pain, lait",upd:t0+10}]},{notes:[{...base,body:"pain, oeufs",upd:t0+20}]});
      return {n:m.notes.length,bodies:m.notes.map(x=>x.body).sort().join("|"),n2:m2.notes.length}});
    if(st.n!==2||st.bodies!=="pain, lait|pain, oeufs"||st.n2!==1)err("conflit de notes mal géré : "+JSON.stringify(st));
    await ctx.close()}
  // --- v34 : mode essai sans compte, puis compte créé avec les données reprises ; tâches simplifiées ; agenda en fenêtre ; suppressions annulables
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("v34 : "+m);
    pg.on("pageerror",e=>err(e.message));pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    await pg.goto(U);await pg.waitForTimeout(400);await pg.click("#aTrial");await pg.waitForTimeout(1200);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");
    if(await pg.isVisible("#notifAsk"))err("notifications proposées en mode essai");
    if(!(await pg.evaluate(()=>isTrial())))err("le mode essai ne démarre pas");
    await pg.evaluate(()=>show("home"));await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#homeTrial")))err("pas de message « Mode essai » sur Aujourd'hui");await shot(pg,"essai-aujourdhui");
    // tâches : ligne simple, « ⋯ » pour le reste, suppression annulable
    await pg.evaluate(()=>show("todo"));await pg.fill("#todoIn","Acheter du pain");await pg.press("#todoIn","Enter");await pg.waitForTimeout(300);
    await pg.fill("#todoIn","Appeler maman");await pg.press("#todoIn","Enter");await pg.waitForTimeout(300);
    const btns=await pg.$$eval("#todoOpen .row:not(.done) button",x=>x.length/Math.max(1,document.querySelectorAll("#todoOpen .row:not(.done)").length));
    if(btns>4)err("trop de boutons par tâche : "+btns);
    if(await pg.locator("#todoOpen .realise").count())err("le bouton « Réaliser » en double est encore là");
    await shot(pg,"v34-taches");
    const tid=await pg.evaluate(()=>data.todos.find(t=>t.title==="Acheter du pain").id);
    await pg.click(`[data-tmore="${tid}"]`);await pg.waitForTimeout(200);if(!(await pg.isVisible("#actSheet")))err("le menu « ⋯ » ne s'ouvre pas");await shot(pg,"v34-taches-menu");
    // v42 : suppression en deux temps (1er appui = « Confirmer ? », rien n'est supprimé)
    await pg.click("#actList .act-it.danger");await pg.waitForTimeout(150);
    if(!(await pg.evaluate(id=>!!data.todos.find(t=>t.id===id),tid))||!/Confirmer/.test(await pg.textContent("#actList .act-it.danger")))err("le 1er appui sur Supprimer ne demande pas de confirmation");
    await shot(pg,"v42-confirmer");
    await pg.click("#actList .act-it.danger");await pg.waitForTimeout(200);
    if(await pg.evaluate(id=>!!data.todos.find(t=>t.id===id),tid))err("la tâche n'est pas supprimée tout de suite");
    if(!(await pg.isVisible("#toast .toast-act")))err("pas de bouton « Annuler » après la suppression");await shot(pg,"v34-annuler");
    await pg.click("#toast .toast-act");await pg.waitForTimeout(300);
    if(!(await pg.evaluate(id=>!!data.todos.find(t=>t.id===id)&&!(data.del||{})[id],tid)))err("« Annuler » ne remet pas la tâche");
    // toucher le titre = modifier
    await pg.click(`#todoOpen [data-edit="todo:${tid}"]`);await pg.waitForTimeout(200);if(!(await pg.isVisible("#sheet")))err("toucher le titre n'ouvre pas la modification");
    await pg.click("#sheet .x").catch(()=>{});await pg.evaluate(()=>closeEdit&&closeEdit());
    // agenda : plus de formulaire en haut, « + Activité » ouvre une fenêtre
    await pg.evaluate(()=>show("plan"));await pg.waitForTimeout(200);
    if(await pg.isVisible("#fTitle"))err("le formulaire de l'agenda est encore affiché en haut");
    await pg.click("#taskAdd");await pg.waitForTimeout(250);if(!(await pg.isVisible("#taskSheet")))err("« + Activité » n'ouvre pas la fenêtre");
    if(await pg.isVisible("#fEnd"))err("les options avancées ne sont pas repliées");await shot(pg,"v34-agenda-ajout");
    await pg.fill("#fTitle","Dentiste");await pg.fill("#fTime","14:00");await pg.click("#taskForm [type=submit]");await pg.waitForTimeout(300);
    if(await pg.isVisible("#taskSheet")||!(await pg.evaluate(()=>data.tasks.some(t=>t.title==="Dentiste"&&t.date===iso(today())&&t.time==="14:00"))))err("ajout d'activité raté");
    // créer un compte depuis l'essai : les données sont reprises
    await pg.evaluate(()=>show("more"));await pg.click("#trialBanner [data-trialacc]");await pg.waitForTimeout(800);
    if(await pg.getAttribute("#mSignup","aria-pressed")!=="true")err("« Créer mon compte » n'ouvre pas l'inscription");
    await pg.fill("#aName","Essai");await pg.fill("#aEmail","essai@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1800);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    const st=await pg.evaluate(()=>({trial:isTrial(),todos:data.todos.length,dent:data.tasks.some(t=>t.title==="Dentiste"),left:!!localStorage.getItem("sidnote-u-essai")}));
    if(st.trial||st.todos!==2||!st.dent||st.left)err("données de l'essai mal reprises : "+JSON.stringify(st));
    await pg.waitForTimeout(1500);if(await pg.evaluate(()=>cache.dirty))err("données reprises non envoyées en ligne");
    await ctx.close()}
  // --- v35 : confidentialité et conditions, consentement santé, suppression du compte, accessibilité
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("v35 : "+m);
    pg.on("pageerror",e=>err(e.message));pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    await pg.goto(U);await pg.waitForTimeout(400);
    if(!(await pg.isVisible("#aLegal")))err("pas de mention des conditions à l'inscription");
    await pg.click('#aLegal [data-openlegal="privacy"]');await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#legalSheet")))err("la politique de confidentialité ne s'ouvre pas depuis l'inscription");
    if(!(await pg.textContent("#legalBody")).includes("Francfort"))err("politique de confidentialité vide");await shot(pg,"v35-confidentialite");
    if(await pg.getAttribute("#legalSheet .sheet","role")!=="dialog"||await pg.getAttribute("#legalSheet .sheet","aria-modal")!=="true")err("fenêtre non annoncée comme fenêtre (role=dialog)");
    await pg.click('#legalSeg [data-legal="terms"]');if(!(await pg.textContent("#legalBody")).includes("droit belge"))err("conditions d'utilisation vides");
    await pg.keyboard.press("Escape");await pg.waitForTimeout(150);if(await pg.isVisible("#legalSheet"))err("Échap ne ferme pas la fenêtre");
    // compte : barre du bas accessible, accord santé, suppression du compte
    await pg.click("#mSignup");await pg.fill("#aName","Adieu");await pg.fill("#aEmail","adieu@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    const nav=await pg.evaluate(()=>({role:document.getElementById("navIn").getAttribute("role"),cur:document.querySelectorAll('nav [aria-current="page"]').length,toast:document.getElementById("toast").getAttribute("aria-live")}));
    if(nav.role||nav.cur!==1||nav.toast!=="polite")err("accessibilité de la navigation / des messages : "+JSON.stringify(nav));
    const fs=await pg.$eval("nav .tab .tab-l",e=>parseFloat(getComputedStyle(e).fontSize));if(fs<11)err("libellés de la barre du bas trop petits : "+fs);
    await pg.evaluate(()=>{show("plan")});await pg.click("#taskAdd");await pg.waitForTimeout(200);
    for(let i=0;i<30;i++)await pg.keyboard.press("Tab");
    if(!(await pg.evaluate(()=>document.getElementById("taskSheet").contains(document.activeElement))))err("le focus clavier sort de la fenêtre ouverte");
    await pg.keyboard.press("Escape");await pg.waitForTimeout(150);if(await pg.isVisible("#taskSheet"))err("Échap ne ferme pas « Nouvelle activité »");
    // accord santé : demandé avant le premier envoi à l'IA
    const asked=await pg.evaluate(async()=>{session.feat=["nutri"];const p=nuCall("aliment",{text:"1 pomme"}).then(()=>"ok",e=>"refus");await new Promise(r=>setTimeout(r,200));
      const vis=!document.getElementById("consentSheet").hidden;document.getElementById("consentNo").click();return [vis,await p]});
    if(!asked[0]||asked[1]!=="refus")err("pas d'accord demandé avant d'utiliser Nutrition : "+asked);
    await pg.evaluate(()=>show("more"));if(!(await pg.isVisible("#delAccBtn")))await pg.click('[data-sec="privacy"] summary');
    await pg.locator("#delAccBtn").scrollIntoViewIfNeeded();await shot(pg,"v35-supprimer-compte");
    await pg.click("#delAccBtn");await pg.waitForSelector("#recSheet:not([hidden])",{timeout:5000}).catch(()=>err("mot de passe non redemandé avant la suppression"));
    await pg.fill("#recPw","mauvais");await pg.click("#recOk");await pg.waitForTimeout(400);if(!(await pg.isVisible("#recErr")))err("suppression avec un mauvais mot de passe");
    await pg.fill("#recPw","motdepasse1");await pg.click("#recOk");await pg.waitForTimeout(2000);
    if(!(await pg.isVisible("#auth")))err("pas de retour à l'écran de connexion après la suppression");
    if(!(await pg.textContent("#aErr")).includes("supprimé"))err("pas de message après la suppression du compte");
    const left=await pg.evaluate(async()=>{const r=await fetch(SUPABASE_URL+"/__dump");const j=await r.json();return j.users.includes("adieu@test.be")});
    if(left)err("le compte existe encore sur le serveur");
    await ctx.close()}
  // --- v36 : présentation (tout décocher, couleurs), titre Musculation visible, pas de glissement de côté, ouverture sur Aujourd'hui
  {const ctx=await b.newContext({...devices["iPhone 13"],colorScheme:"dark"}),pg=await ctx.newPage(),err=m=>errs.push("v36 : "+m);
    pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Pres");await pg.fill("#aEmail","pres@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(!(await pg.isVisible("#onb")))err("présentation absente");
    else{const b1=pg.locator('#onbGroups [data-onball="orga"]');if(!(await b1.count()))err("pas de « Tout décocher » dans la présentation");
      else{await pg.evaluate(()=>onbGoTo(1));await pg.waitForTimeout(1500);await shot(pg,"v36-presentation-tout");await b1.click();
        const off=await pg.evaluate(()=>["plan","todo"].every(k=>!onbSel[k]));if(!off)err("« Tout décocher » ne décoche pas tout");
        if((await b1.textContent()).trim()!=="Tout cocher")err("le bouton ne devient pas « Tout cocher »");await b1.click()}
      await pg.evaluate(()=>onbGoTo(onbSlides().length-1));await pg.waitForTimeout(700);
      // v42 : plus de choix d'ambiance (direction artistique unique) ; les logos des 3 apps sont sur leurs diapositives
      if(await pg.isVisible("#onbPal"))err("les ambiances sont encore proposées dans la présentation");
      if(await pg.locator("#onbGroups .onb-logo .logo").count()!==3)err("logos des apps absents de la présentation");
      await shot(pg,"v36-presentation-couleurs");
      await pg.click("#onbGo");await pg.waitForTimeout(400)}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    // titre Musculation entièrement visible (le cache du chrono ne le recouvre plus)
    await pg.evaluate(()=>{data.prefs.tabs.muscu=true;applyTabs();show("muscu");window.scrollTo(0,0)});await pg.waitForTimeout(300);
    const cov=await pg.evaluate(()=>{const h=document.querySelector("#v-muscu h1"),r=h.getBoundingClientRect(),e=document.elementFromPoint(r.x+20,r.y+r.height*0.8);return e===h||h.contains(e)});
    if(!cov)err("le titre Musculation est recouvert");await shot(pg,"v36-musculation");
    // plus de glissement de côté
    const ox=await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
    if(!ox)err("on peut encore glisser de côté");
    // ancien réglage caché « page d'accueil » : l'app s'ouvre quand même sur Aujourd'hui
    await pg.evaluate(()=>{data.prefs.home="plan";delete data.prefs.homeV;save()});await pg.waitForTimeout(1500);await pg.reload();await pg.waitForTimeout(1200);
    if(await pg.evaluate(()=>data.ui.view)!=="home")err("l'app ne s'ouvre pas sur Aujourd'hui");
    // la fenêtre « Nouvelle activité » suit la zone visible de l'écran
    await pg.evaluate(()=>show("plan"));await pg.click("#taskAdd");await pg.waitForTimeout(200);
    const vv=await pg.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue("--vvh"));if(!vv)err("zone visible non suivie (--vvh)");
    await ctx.close()}
  // --- v37 : listes partagées (2 comptes), ajout rapide en langage courant, délai de reverrouillage, notifications au bon moment, erreurs envoyées
  {const err=m=>errs.push("v37 : "+m);
    const mk=async(name,email)=>{const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage();pg.on("pageerror",e=>err(name+" : "+e.message));
      await pg.goto(U);await pg.waitForTimeout(400);await pg.click("#mSignup");await pg.fill("#aName",name);await pg.fill("#aEmail",email);await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
      if(await pg.isVisible("#onb"))await pg.click("#onbSkip");await pg.waitForTimeout(300);return {ctx,pg}};
    const A=await mk("Sid","sid37@test.be"),B=await mk("Léa","lea37@test.be");
    if(await A.pg.isVisible("#notifAsk"))err("notifications encore proposées dès l'ouverture");
    // v41 : Listes retirées ; v42 : Focus revient dans sid'agenda
    if(await A.pg.evaluate(()=>visibleTabs().includes("lists")))err("Listes encore visibles");
    if(!(await A.pg.evaluate(()=>GROUPS[0].tabs.includes("pomo")&&!OFF_TABS.includes("pomo"))))err("Focus absent de sid'agenda");
    // ajout rapide en langage courant
    const P=A.pg;await P.evaluate(()=>show("plan"));await P.click("#taskAdd");await P.waitForTimeout(200);
    await P.fill("#fTitle","Dentiste jeudi 14h");await P.waitForTimeout(150);
    if(!(await P.isVisible("#fHint")))err("l'ajout rapide n'affiche pas ce qu'il a compris");
    const fv=await P.evaluate(()=>[$("fDate").value,$("fTime").value]);await shot(P,"v37-ajout-rapide");
    await P.click("#taskForm [type=submit]");await P.waitForTimeout(400);
    const tk=await P.evaluate(()=>{const t=data.tasks.find(x=>x.title==="Dentiste");return t&&[t.date,t.time,new Date(t.date+"T12:00").getDay()]});
    if(!tk||tk[1]!=="14:00"||tk[2]!==4||tk[0]!==fv[0])err("« Dentiste jeudi 14h » mal compris : "+JSON.stringify(tk));
    if(!(await P.isVisible("#notifAsk"))&&(await P.evaluate(()=>pushOK()&&Notification.permission==="default")))err("notifications pas proposées après la première activité avec une heure");
    if(await P.isVisible("#notifAsk"))await P.click("#naNo");
    // délai avant reverrouillage
    const lk=await P.evaluate(()=>{const r=[];data.docVault={id:"tv",v:2,wk:{},chk:{}};dvVid="tv";data.ui.lockDelay=0;dvOpen=true;dvKey={};show("docs");show("todo");r.push(dvOpen);
      data.ui.lockDelay=5;dvOpen=true;dvKey={};show("docs");show("todo");r.push(dvOpen);secAway.docs-=5*60000+1000;secCheck();r.push(dvOpen);return r});
    if(lk.join()!=="false,true,false")err("délai de reverrouillage incorrect : "+lk);
    // erreur envoyée
    await P.evaluate(()=>reportErr("erreur de test v37","pile"));await P.waitForTimeout(800);
    const ce=await P.evaluate(async()=>(await (await fetch(SUPABASE_URL+"/__errors")).json()).map(e=>e.msg));if(!ce.includes("erreur de test v37"))err("erreur non envoyée");
    await A.ctx.close();await B.ctx.close()}
  // --- v38 : Face ID (capteur simulé avec PRF), adresse du connecteur Claude, note en plein écran
  {const err=m=>errs.push("v38 : "+m);
    const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage();pg.on("pageerror",e=>err(e.message));
    pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    const cdp=await ctx.newCDPSession(pg);await cdp.send("WebAuthn.enable");
    await cdp.send("WebAuthn.addVirtualAuthenticator",{options:{protocol:"ctap2",transport:"internal",hasResidentKey:true,hasUserVerification:true,isUserVerified:true,hasPrf:true,automaticPresenceSimulation:true}});
    const pin=async c=>{for(const d of c)await pg.click(`#pinPad [data-pin="${d}"]`);await pg.waitForTimeout(150)};
    const ps=async c=>{await pg.waitForSelector("#pinSheet:not([hidden])",{timeout:10000});for(const d of c)await pg.click(`#psPad [data-ps="${d}"]`);await pg.waitForTimeout(150)};
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Bio");await pg.fill("#aEmail","bio38@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    // coffre : code 24680 + phrase secrète
    await pg.evaluate(()=>show("pwd"));await pg.waitForTimeout(300);await pin("24680");await pin("24680");
    await pg.waitForSelector("#phSheet:not([hidden])",{timeout:10000});await pg.fill("#phIn","trois mots et 7");await pg.fill("#ph2In","trois mots et 7");await pg.click("#phOk");
    await pg.waitForSelector("#recSheet:not([hidden])",{timeout:15000}).catch(()=>{});if(await pg.isVisible("#recSheet"))await pg.click("#recLater");
    await pg.waitForFunction(()=>!!vaultKey,null,{timeout:15000}).catch(()=>err("coffre pas créé"));
    // v39 : Face ID proposé tout seul juste après le choix du code
    await pg.waitForSelector("#actSheet:not([hidden])",{timeout:10000}).catch(()=>err("Face ID pas proposé après le choix du code"));
    await shot(pg,"v39-faceid-propose");
    if(await pg.isVisible("#actSheet"))await pg.click("#actSheet [data-act='0']");await pg.waitForTimeout(1200);
    if(await pg.isVisible("#actSheet"))await pg.click("#actSheet [data-act]");
    await pg.waitForFunction(()=>bioHas("main"),null,{timeout:10000}).catch(()=>err("Face ID pas activé"));
    await pg.evaluate(()=>{show("more");document.querySelector('[data-sec="privacy"]').open=true});await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#bioCard")))err("réglage Face ID absent");
    await shot(pg,"v38-faceid-reglage");
    // v39 : en arrivant sur Mots de passe, Face ID s'ouvre tout seul
    await pg.evaluate(()=>{pwdLock();show("home")});await pg.waitForTimeout(4200);
    await pg.evaluate(()=>show("pwd"));await pg.waitForFunction(()=>!!vaultKey,null,{timeout:15000}).catch(()=>err("Face ID ne s'ouvre pas tout seul"));
    // bouton Face ID sous le clavier (si annulé)
    await pg.evaluate(()=>{pwdLock();bioAutoAt.main=Date.now();show("pwd")});await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#pinBio")))err("bouton Face ID absent sur le clavier du code");
    await shot(pg,"v38-faceid-clavier");
    await pg.click("#pinBio");await pg.waitForFunction(()=>!!vaultKey,null,{timeout:15000}).catch(()=>err("Face ID n'ouvre pas les mots de passe"));
    // code changé ailleurs : Face ID se retire proprement, le code reste possible
    await pg.evaluate(async()=>{const s=ls.get(bioLsKey());const k=await bioPrf(s);s.main=await encJ(k,{c:"11111"});ls.set(bioLsKey(),s);pwdLock();bioAutoAt.main=Date.now();show("pwd")});await pg.waitForTimeout(300);
    await pg.click("#pinBio");await pg.waitForTimeout(2500);
    if(await pg.evaluate(()=>!!vaultKey||bioHas("main")))err("mauvais code Face ID mal géré");
    // adresse pour Claude
    await pg.evaluate(()=>{show("more");document.querySelector('[data-sec="claude"]').open=true});await pg.waitForTimeout(500);
    await pg.click("#mcpNew");await pg.waitForTimeout(800);
    const url=await pg.textContent("#mcpUrl");if(!/\/functions\/v1\/mcp\/[A-Za-z0-9_-]{40,}$/.test(url))err("adresse Claude incorrecte : "+url);
    if(await pg.locator("#mcpList [data-mcpdel]").count()!==1)err("adresse Claude absente de la liste");
    await shot(pg,"v38-claude");
    await pg.click("#mcpList [data-mcpdel]");await pg.click("#mcpList [data-mcpdel]");await pg.waitForTimeout(600);
    if(await pg.locator("#mcpList [data-mcpdel]").count()!==0)err("adresse Claude pas retirée");
    // note en plein écran
    await pg.evaluate(()=>show("notes"));await pg.waitForTimeout(300);await pg.click("#noteNew");await pg.fill("#noteTitle","Plein écran");await pg.waitForTimeout(300);
    const box=await pg.$eval("#noteEdit",e=>{const r=e.getBoundingClientRect();return [r.width,r.height,innerWidth,innerHeight]});
    if(!(await pg.evaluate(()=>document.body.classList.contains("note-full")))||box[0]<box[2]-2||box[1]<box[3]-2)err("la note ne couvre pas toute la page : "+box);
    await shot(pg,"v38-note-plein-ecran");
    await pg.click("#noteBack");await pg.waitForTimeout(300);if(await pg.evaluate(()=>document.body.classList.contains("note-full")))err("plein écran pas retiré en quittant la note");
    await ctx.close()}
  {const ctx=await b.newContext({viewport:{width:1280,height:800}}),pg=await ctx.newPage();
    await pg.goto(U);await pg.waitForTimeout(400);await pg.click("#mSignup");await pg.fill("#aName","Pc");await pg.fill("#aEmail","pc38@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>show("notes"));await pg.waitForTimeout(300);await pg.click("#noteNew");await pg.fill("#noteTitle","Sur ordinateur");await pg.fill("#noteBody","Une note qui prend toute la page.");await pg.waitForTimeout(300);
    const w=await pg.$eval("#noteEdit",e=>e.getBoundingClientRect().width);if(w<1270)errs.push("v38 : note pas en plein écran sur ordinateur ("+w+")");
    await shot(pg,"v38-note-pc");await ctx.close()}
  // --- v39 : tâches du jour (report automatique), notes en dossiers et mises en forme, tout se referme, « Mon IA », nutrition sans clé
  {const err=m=>errs.push("v39 : "+m);
    const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage();pg.on("pageerror",e=>err(e.message));
    pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Neuf");await pg.fill("#aEmail","neuf39@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    // tâches : « demain » compris, report d'hier sur aujourd'hui, cocher depuis Aujourd'hui, ajout depuis l'agenda
    await pg.evaluate(()=>show("todo"));await pg.fill("#todoIn","Appeler maman demain");await pg.press("#todoIn","Enter");await pg.waitForTimeout(300);
    const tm=await pg.evaluate(()=>{const t=data.todos.find(x=>x.title==="Appeler maman");const d=new Date();d.setDate(d.getDate()+1);return t&&t.day===iso(d)});if(!tm)err("« Appeler maman demain » pas prévue demain");
    await pg.evaluate(()=>{const y=new Date();y.setDate(y.getDate()-2);data.todos.push({id:"late1",title:"Payer le loyer",createdAt:new Date().toISOString(),done:false,day:iso(y)});data.todos.push({id:"free1",title:"Ranger la cave",createdAt:new Date().toISOString(),done:false});save();show("home")});
    await pg.waitForTimeout(300);await shot(pg,"v39-aujourdhui");
    if(!(await pg.locator('#homeBody [data-htg="late1"]').count()))err("tâche d'hier pas reportée sur aujourd'hui");
    if(!(await pg.textContent("#homeBody")).includes("reportée"))err("badge « reportée » absent");
    await pg.click('#homeBody [data-hplan="free1"]');await pg.waitForTimeout(200);if(!(await pg.evaluate(()=>data.todos.find(x=>x.id==="free1").day===iso(today()))))err("« Aujourd'hui » ne planifie pas la tâche");
    await pg.click('#homeBody [data-htg="late1"]');await pg.waitForTimeout(200);
    const dn=await pg.evaluate(()=>{const t=data.todos.find(x=>x.id==="late1");return t.done&&t.day===iso(today())});if(!dn)err("tâche reportée mal cochée");
    await pg.evaluate(()=>{show("plan");selDay=iso(today());calMode="day";renderCal()});await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#calDayView .dt-box")))err("tâches du jour absentes de l'agenda");
    await pg.fill("#calDayView [data-dtadd] input","Acheter du pain");await pg.press("#calDayView [data-dtadd] input","Enter");await pg.waitForTimeout(300);
    if(!(await pg.evaluate(()=>data.todos.some(t=>t.title==="Acheter du pain"&&t.day===iso(today())))))err("ajout de tâche depuis l'agenda raté");
    await shot(pg,"v39-agenda-taches");
    // notes : dossier, sous-dossier, note dedans, gras, case à cocher
    await pg.evaluate(()=>show("notes"));await pg.click("#nfNew");await pg.fill("#nfIn","Cours");await pg.press("#nfIn","Enter");await pg.waitForTimeout(200);
    await pg.click("[data-nfopen]");await pg.click("#nfNew");await pg.fill("#nfIn","Finance");await pg.press("#nfIn","Enter");await pg.waitForTimeout(200);
    await shot(pg,"v39-notes-dossier");
    await pg.click("#noteNew");await pg.fill("#noteTitle","Séminaire");await pg.click("#noteBody");await pg.keyboard.type("Point important");
    await pg.keyboard.down("Shift");for(let i=0;i<9;i++)await pg.keyboard.press("ArrowLeft");await pg.keyboard.up("Shift");
    await pg.click('#rtBar [data-rt="bold"]');await pg.keyboard.press("End");await pg.keyboard.press("Enter");await pg.click('#rtBar [data-rtm="ul"]');await pg.click('#rtPop [data-rtc="chk"]');await pg.keyboard.type("Relire le cours");
    // v41 : surligneur depuis le menu (couleur gardée au nettoyage)
    await pg.keyboard.down("Shift");for(let i=0;i<7;i++)await pg.keyboard.press("ArrowLeft");await pg.keyboard.up("Shift");
    await pg.click('#rtBar [data-rtm="hl"]');await shot(pg,"v41-menu-surligneur");await pg.click('#rtPop [data-rtc="hl:g"]');
    await pg.waitForTimeout(900);await shot(pg,"v39-note-word");
    const nv=await pg.evaluate(()=>{const n=data.notes.find(x=>x.title==="Séminaire");return n&&{f:nfOf(n.folder)&&nfOf(n.folder).name,html:n.html||"",body:n.body}});
    if(!nv||nv.f!=="Cours")err("note pas rangée dans le dossier ouvert : "+JSON.stringify(nv));
    if(!nv||!/<b>|<strong>/.test(nv.html))err("gras pas enregistré : "+(nv&&nv.html));
    if(!nv||!/ul class="chk"/.test(nv.html))err("case à cocher pas enregistrée : "+(nv&&nv.html));
    if(!nv||!/<mark data-hl="g">/.test(nv.html))err("surligneur vert pas enregistré : "+(nv&&nv.html));
    await pg.evaluate(async()=>{data.notes.find(x=>x.title==="Séminaire").html+='<img src=x onerror="window.pwned=1"><script>window.pwned=1</script>';renderNotes();await closeNote();openNote(data.notes.find(x=>x.title==="Séminaire").id)});
    await pg.waitForTimeout(300);if(await pg.evaluate(()=>!!window.pwned||!!document.querySelector("#noteBody img,#noteBody script")))err("contenu dangereux pas nettoyé");
    await pg.click("#noteBack");await pg.waitForTimeout(300);
    // tout se referme au retour
    await pg.evaluate(()=>{openActions("x",[{l:"y",fn:()=>{}}]);show("more");document.querySelector('[data-sec="privacy"]').open=true;closeAll()});await pg.waitForTimeout(200);
    if(await pg.evaluate(()=>!$("actSheet").hidden||document.querySelector('[data-sec="privacy"]').open))err("closeAll laisse des choses ouvertes");
    // Mon IA : choisir Claude, adresse créée et copiée, test confirmé
    await pg.evaluate(()=>show("home"));await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#homeBody .hm-ai")))err("carte « branche ton IA » absente d'Aujourd'hui");
    // v42 : Claude seulement, l'assistant va directement aux étapes de Claude
    await pg.click('#homeBody [data-aiwiz]');await pg.waitForTimeout(900);await shot(pg,"v39-ia-etapes");
    if(await pg.locator("[data-aipick]").count())err("le choix d'une autre IA est encore proposé");
    const au=await pg.textContent("#aiUrl");if(!/\/functions\/v1\/mcp\//.test(au))err("adresse pas créée dans l'assistant : "+au);
    const ah=await pg.getAttribute("[data-aiadd]","href").catch(()=>"");
    if(!(ah.startsWith("https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Sid'note")&&ah.includes("connectorUrl="+encodeURIComponent(au))))err("lien Claude pré-rempli incorrect : "+ah);
    await pg.click('[data-aistep="test"]');await pg.waitForTimeout(300);await pg.evaluate(async()=>{await fetch(SUPABASE_URL+"/__mcpuse")});
    await pg.waitForSelector("#aiDone:not([hidden])",{timeout:10000}).catch(()=>err("branchement pas détecté"));await shot(pg,"v39-ia-branchee");
    if(await pg.isVisible("#aiDone"))await pg.click("#aiDone");
    if(!(await pg.evaluate(()=>!!data.prefs.aiOk&&data.prefs.ai==="claude")))err("IA branchée pas retenue");
    // nutrition sans clé : profil calculé dans l'app, menu confié à l'IA
    await pg.evaluate(()=>{data.prefs.tabs.nutri=true;save();applyTabs();NU().consent=new Date().toISOString();show("nutri")});await pg.waitForTimeout(300);
    const pr=await pg.evaluate(()=>{const r=nuProfileLocal({sex:"male",age:24,height_cm:180,weight_kg:75,sports:[{sport:"Musculation",times_per_week:4,minutes_per_session:60}],goal:"gain",pace:"realistic",target_weight_kg:80,timeframe_weeks:4});return r});
    if(!(pr.bmr_kcal===1760&&pr.target_kcal>pr.tdee_kcal&&pr.protein_g===135&&pr.weight_goal.realistic===false&&pr.sports_kcal[0].kcal_per_session>300))err("profil local incorrect : "+JSON.stringify(pr));
    await pg.evaluate(()=>nuCall("menu",{data:{meals:[{name:"Dîner",kcal:700}],must_include:"poulet"}}).catch(()=>{}));await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#aiAskSheet"))||!(await pg.textContent("#aaPrompt")).includes("poulet"))err("menu pas confié à l'IA");
    await shot(pg,"v39-ia-demande");await pg.click("#aaClose");
    if(await pg.evaluate(()=>!!data.prefs.aiOk)?!(await pg.evaluate(()=>!$("nuAiLink").hidden&&$("nuAiLink").href.includes("claude"))):!(await pg.isVisible("#nuAiCard")))err("ni carte IA ni lien Claude dans Nutrition");
    // notifications : la veille toujours active
    await pg.evaluate(()=>{data.prefs.notif={leads:[10]};save()});if(!(await pg.evaluate(()=>notifLeads().includes(1440))))err("la veille n'est pas toujours active");
    await ctx.close()}
  // --- v41 : programme de musculation sur mesure, glisser notes et dossiers, coffre ouvert jusqu'à la fermeture
  {const err=m=>errs.push("v41 : "+m);
    const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage();pg.on("pageerror",e=>err(e.message+" @ "+String(e.stack).split("\n").slice(1,3).join(" | ")));
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","La loutre");await pg.fill("#aEmail","coach41@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(await pg.evaluate(()=>lockDelay()!==Infinity))err("le coffre se reverrouille par défaut");
    // v42 : surnom complet dans l'en-tête
    if(!(await pg.textContent("#hello")).includes("La loutre"))err("surnom coupé : "+await pg.textContent("#hello"));
    // programme : débutant, 3 séances, haltères, genoux à ménager
    await pg.evaluate(()=>show("muscu"));await pg.waitForTimeout(200);await shot(pg,"v41-muscu-vide");
    await pg.click('#coachBox [data-coach="new"]');
    // v43 : les précisions facultatives sont repliées
    if(await pg.isVisible('#coachForm [data-cf="avoid"]'))err("précisions facultatives pas repliées");
    await pg.click("#cfMore summary");
    for(const [k,v] of [["level","deb"],["goal","muscle"],["days","3"],["dur","60"],["equip","db"],["avoid","knee"]])await pg.click(`#coachForm [data-cf="${k}"] [data-v="${v}"]`);
    // v42 : exercices imposés / exclus, avec recherche
    await pg.fill('.cf-pick[data-cfx="must"] input',"marteau");await pg.waitForTimeout(100);await pg.click('.cf-pick[data-cfx="must"] [data-cfadd]');
    await pg.fill('.cf-pick[data-cfx="never"] input',"rowing appui");await pg.waitForTimeout(100);await pg.click('.cf-pick[data-cfx="never"] [data-cfadd]');
    await shot(pg,"v41-coach-questions");await pg.click('#coachForm [data-cfgo="app"]');await pg.waitForTimeout(300);
    const mn=await pg.evaluate(()=>{const a=PLD().flatMap(d=>d.exercises.map(e=>e.name));return[a.includes("Curl marteau"),a.includes("Rowing avec appui")]});
    if(!mn[0])err("exercice imposé absent du programme");if(mn[1])err("exercice exclu présent dans le programme");
    const dup=await pg.evaluate(()=>PLD().some(d=>{const s=new Set();return d.exercises.some(e=>{const x=EXN(e.name),k=x.m+":"+x.pat;if(s.has(k)||s.has(x.g))return true;s.add(k);s.add(x.g)})}));if(dup)err("doublon dans une séance");
    if(await pg.evaluate(()=>PLD().some(d=>d.exercises.some(e=>e.rest<120))))err("repos trop court");
    // v44 : les séances du programme sont des cartes comme les autres (repos et séries modifiables sur la carte)
    const d0=await pg.evaluate(()=>PLD()[0].id);
    await pg.click(`#msList [data-ms="${d0}"] summary`);await pg.click(`#msList [data-ms="${d0}"] [data-msrest]`);await pg.waitForTimeout(150);await pg.click('#actList .act-it:has-text("4 min")');
    if(await pg.evaluate(()=>PLD()[0].exercises[0].rest)!==240)err("repos pas modifiable");
    const pl=await pg.evaluate(()=>PLD().map(d=>d.exercises.map(e=>e.name)));
    if(pl.length!==3)err("programme pas créé : "+pl.length);
    else if(await pg.evaluate(()=>PLD().some(d=>d.exercises.length<3||d.exercises.some(e=>!EXN(e.name)))))err("séance trop courte ou exercice hors de la liste");
    else if(pl.some(d=>d.some(n=>/Presse à cuisses|Leg extension|Hack squat/.test(n))))err("genoux pas ménagés");
    await shot(pg,"v41-coach-programme");
    // v43 : séries libres (+ / −), sur la carte de la séance
    {const s0=await pg.evaluate(()=>PLD()[0].exercises[0].sets.length),sel=`#msList [data-ms="${d0}"] [data-ex]:first-of-type`;
      await pg.click(`${sel} [data-msset="1"]`);await pg.click(`${sel} [data-msset="1"]`);await pg.click(`${sel} [data-msset="-1"]`);
      if(await pg.evaluate(()=>PLD()[0].exercises[0].sets.length)!==s0+1)err("séries du programme pas modifiables")}
    // v43 : remarque → ajustement par Claude (le message part dans son Claude, comme Nutrition)
    await pg.fill("#coRemark","remplace la 2e séance jambes par une séance haut du corps");await pg.click('#coachBox [data-coach="adjust"]');await pg.waitForTimeout(300);
    if(await pg.isVisible("#consentSheet")){await pg.click("#consentYes");await pg.waitForTimeout(300)}
    if(!(await pg.isVisible("#aiAskSheet"))||!(await pg.textContent("#aaPrompt")).includes("remplace la 2e séance jambes"))err("l'ajustement n'envoie pas la remarque à Claude");
    if(!(await pg.evaluate(()=>PL().aiWait&&PL().profile.remarks.length===1)))err("remarque pas gardée / attente non signalée");
    await shot(pg,"v43-coach-ajuster");await pg.click("#aaClose");await pg.waitForTimeout(150);
    if(!(await pg.isVisible("#coachBox .coach-wait")))err("« demande envoyée à Claude » pas affiché");
    // le programme de Claude arrive (comme par le connecteur) : l'attente disparaît
    await pg.evaluate(()=>{const o=PL();PLD().forEach(s=>{s.grp={...s.grp,id:"ia1",src:"claude"};s.upd=Date.now()});M().plan={id:"ia1",v:2,profile:o.profile,at:new Date().toISOString(),upd:Date.now(),src:"ia"};M().upd=Date.now();renderMuscu()});
    if(await pg.isVisible("#coachBox .coach-wait"))err("l'attente reste après l'arrivée du programme de Claude");
    // séance : 2 séries faites, enregistrée, puis la charge monte
    await pg.click('#coachBox [data-coach="start"]');await pg.waitForTimeout(300);await shot(pg,"v41-seance");
    // v43 : ajouter / retirer une série pendant la séance
    {const n0=await pg.evaluate(()=>wo.ex[0].sets.length);await pg.click('#woBody [data-woadd="0"]');await pg.click('#woBody [data-woadd="0"]');await pg.click('#woBody [data-wodel="0:0"]');
      if(await pg.evaluate(()=>wo.ex[0].sets.length)!==n0+1)err("séries pas ajoutables / retirables pendant la séance")}
    const nm=await pg.evaluate(()=>wo.ex[0].name),top=await pg.evaluate(()=>String(wo.ex[0].reps).split(/[–-]/).pop());
    await pg.evaluate(t=>{wo.ex[0].sets.forEach(s=>{s.kg="20";s.reps=t;s.done=true});woRender()},top);
    // v42 : en touchant un champ de nombre, le curseur va à la fin
    await pg.click('[data-wok="0:0"]',{position:{x:8,y:10}});await pg.waitForTimeout(120);
    const cur=await pg.evaluate(()=>{const el=document.activeElement;return [el.selectionStart,el.value.length]});if(cur[0]!==cur[1])err("curseur pas à la fin du nombre : "+cur);
    await pg.click("#woDone");await pg.waitForTimeout(300);
    const lg=await pg.evaluate(()=>ML().length);if(lg!==1)err("séance pas enregistrée");
    const h=await pg.evaluate(n=>coachHint(PLD().flatMap(d=>d.exercises).find(e=>e.name===n)),nm);if(!(+h.kg>20))err("charge pas augmentée après tout réussi : "+JSON.stringify(h));
    // notes : glisser une note puis un dossier dans un dossier
    await pg.evaluate(()=>{data.noteFolders=[{id:"fA",name:"Master 2",parent:null},{id:"fB",name:"Cours",parent:null}];data.notes=[{id:"n1",title:"Finance",body:"x",createdAt:new Date().toISOString(),upd:Date.now()}];save();show("notes");noteDir=null;renderNotes()});
    await pg.waitForTimeout(300);await shot(pg,"v41-notes-glisser");
    const drag=async(src,dst)=>{const a=await pg.locator(src).boundingBox(),c=await pg.locator(dst).boundingBox();
      await pg.mouse.move(a.x+a.width/2,a.y+a.height/2);await pg.mouse.down();await pg.mouse.move(c.x+c.width/2,c.y+c.height/2,{steps:8});await pg.mouse.up();await pg.waitForTimeout(250)};
    await drag('[data-ngrip="n1"]','[data-nfopen="fB"]');
    if(!(await pg.evaluate(()=>data.notes[0].folder==="fB")))err("note pas glissée dans le dossier");
    await drag('[data-fgrip="fB"]','[data-nfopen="fA"]');
    if(!(await pg.evaluate(()=>nfOf("fB").parent==="fA")))err("dossier pas glissé dans le dossier");
    await pg.click('[data-nfopen="fA"]');await pg.waitForTimeout(200);await shot(pg,"v41-notes-sous-dossier");
    // v42 : dossiers en tuiles (section à part), titre = nom du dossier, bouton retour
    if(!(await pg.isVisible(".nf-grid .nf-tile")))err("dossiers : pas de tuiles");
    if(!(await pg.isVisible("#nfPath .nf-back")))err("dossier : pas de bouton retour");
    if(!(await pg.isVisible(".nf-back")))err("pas de bouton retour dans un dossier");
    await pg.click(".nf-back");await pg.waitForTimeout(200);if(await pg.evaluate(()=>noteDir!==null))err("le retour ne remonte pas");
    await ctx.close()}
  // --- v43 lot 2 : thème clair par défaut, barre latérale masquable (ordinateur, tablette), animation d'ouverture des apps
  for(const [nm,dev] of [["pc",{viewport:{width:1440,height:900},colorScheme:"dark"}],["tablette",{...devices["iPad (gen 7)"]}]]){
    const ctx=await b.newContext({...dev,intro:true}),pg=await ctx.newPage(),err=m=>errs.push("v43 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(2400);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){await pg.click("#onbNext");await pg.waitForTimeout(350);
      if(await pg.evaluate(()=>$("onb").dataset.app)!=="agenda")err("présentation : la diapositive sid'agenda n'est pas à sa couleur");
      if(!(await pg.isVisible(".onb-slide.on .onb-hero")))err("présentation : diapositive de l'app invisible");
      await shot(pg,"v43-"+nm+"-presentation-agenda");await pg.click("#onbSkip")}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(await pg.evaluate(()=>document.documentElement.dataset.theme)!=="light")err("le thème clair n'est pas pré-sélectionné (appareil en sombre)");
    if(nm==="pc"){if(!(await pg.isVisible("#side")))err("barre latérale absente");
      await pg.click("#side .side-tog");await pg.waitForTimeout(200);if(await pg.isVisible("#side")||!(await pg.isVisible("#sideShow")))err("la barre latérale ne se masque pas");
      await pg.reload();await pg.waitForTimeout(2600);if(await pg.isVisible("#side"))err("le choix « barre masquée » n'est pas gardé");
      await pg.click("#sideShow");await pg.waitForTimeout(200);if(!(await pg.isVisible("#side")))err("la barre latérale ne revient pas")}
    else{if(await pg.isVisible("#side"))err("tablette : barre latérale ouverte par défaut");
      await pg.click("#sideShow");await pg.waitForTimeout(200);if(!(await pg.isVisible("#side")))err("tablette : la barre latérale ne s'ouvre pas");await shot(pg,"v43-tablette-barre")}
    await pg.evaluate(()=>show("home"));await pg.click('#homeBody [data-gapp="sport"]');await pg.waitForTimeout(400);
    if(!(await pg.isVisible("#appIntro")))err("pas d'animation à l'ouverture de sid'fit");else{await shot(pg,"v43-"+nm+"-animation-fit");
      await pg.mouse.click(400,300);await pg.waitForTimeout(300);if(await pg.isVisible("#appIntro"))err("un clic ne passe pas l'animation")}
    if(await pg.evaluate(()=>data.ui.view)!=="muscu")err("sid'fit ne s'ouvre pas après l'animation");
    await shot(pg,"v43-"+nm+"-muscu");await ctx.close()}
  // --- v43 lot 3 : Aujourd'hui = une section par app (nom, couleur, « Ouvrir »), dossiers récents dans sid'note
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("v43 Aujourd'hui : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43home@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{data.noteFolders=[{id:"fh1",name:"Cours",createdAt:new Date().toISOString()}];data.notes=[{id:"nh1",title:"Chapitre",body:"x",folder:"fh1",createdAt:new Date().toISOString(),upd:Date.now()}];save();show("home")});await pg.waitForTimeout(200);
    const secs=await pg.$$eval("#homeBody .hm-sec",x=>x.map(e=>e.dataset.app).join(","));if(secs!=="agenda,fit,note")err("sections attendues agenda,fit,note : "+secs);
    if((await pg.$$("#homeBody .hm-sec .hm-open")).length!==3)err("lien « Ouvrir » manquant");
    const t=await pg.textContent("#homeBody");if(!t.includes("Dossiers récents")||t.includes("Notes récentes"))err("« Dossiers récents » attendu à la place des notes récentes");
    await shot(pg,"v43-aujourdhui");
    await pg.click('#homeBody [data-folder-open="fh1"]');await pg.waitForTimeout(250);if(await pg.evaluate(()=>data.ui.view+"/"+noteDir)!=="notes/fh1")err("le dossier récent ne s'ouvre pas");
    await pg.evaluate(()=>show("home"));await pg.click('#homeBody .hm-sec[data-app="fit"] .hm-open');await pg.waitForTimeout(250);if(await pg.evaluate(()=>appOf(data.ui.view))!=="fit")err("« Ouvrir » de sid'fit n'ouvre pas sid'fit");
    await ctx.close()}
  // --- v43 lot 4 : « Créer avec Claude » envoie toutes les réponses + remarques libres ; le programme de l'app sert de base
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1440,height:900}}],["tablette",{...devices["iPad (gen 7)"]}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v43 programme "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43co"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>show("muscu"));await pg.click('#coachBox [data-coach="new"]');await pg.waitForTimeout(200);await shot(pg,"v43-"+nm+"-programme-questions");
    await pg.click("#cfMore summary");await pg.fill("#cfNotes","je veux faire abdos tous les jours");await pg.fill("#cfAvoidTxt","poignet droit");
    if(!(await pg.textContent("#cfMoreSum")).includes("2"))err("le résumé des précisions ne compte pas");
    await pg.click('#coachForm [data-cfgo="ai"]');await pg.waitForTimeout(300);if(await pg.isVisible("#consentSheet")){await pg.click("#consentYes");await pg.waitForTimeout(300)}
    const pr=await pg.textContent("#aaPrompt");if(!pr.includes("abdos tous les jours")||!pr.includes("poignet droit")||!pr.includes("enregistrer_programme"))err("message à Claude incomplet : "+pr);
    if(!(await pg.evaluate(()=>!!PL()&&!!PL().aiWait&&PL().profile.avoidTxt==="poignet droit")))err("programme de base / attente / zone libre non gardés");
    await shot(pg,"v43-"+nm+"-programme-claude");await ctx.close()}
  // --- v43 : Nutrition commence par « Ajouter ce que tu manges » ; Claude branché → plus de carte Claude au-dessus
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("v43 Nutrition : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43nu@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{data.prefs.aiOk=1;data.prefs.ai="claude";data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2000,text:"",warn:[]},upd:Date.now(),log:[],weights:[],weeks:[]};save();show("nutri")});await pg.waitForTimeout(300);
    if(await pg.isVisible("#nuAiCard"))err("la carte « Claude calcule pour toi » est encore affichée");
    const top=await pg.evaluate(()=>{const a=$("nuAddBox").getBoundingClientRect().top,t=$("nuTabs").getBoundingClientRect().top;return a<t});if(!top)err("« Ajouter ce que tu manges » n'est pas en haut");
    if(!(await pg.isVisible("#nuAiLink")))err("lien « Ou dis-le à Claude » absent");
    for(const t of ["menu","profile"]){await pg.click(`[data-nutab="${t}"]`);await pg.waitForTimeout(150)}await pg.click('[data-nutab="day"]');
    await shot(pg,"v43-nutrition-ajouter");
    // v43 : ce qui part chez Claude ne reste pas pré-rempli (menu, ajout d'aliment, remarques du programme)
    await pg.click('[data-nutab="menu"]');await pg.waitForTimeout(150);await pg.fill("#nuInclude","poulet");await pg.fill("#nuExclude","blanc de dinde");
    await pg.click("#nuMenuBtn");await pg.waitForTimeout(500);if(await pg.isVisible("#aaClose"))await pg.click("#aaClose");
    if(await pg.inputValue("#nuInclude")!==""||await pg.inputValue("#nuExclude")!=="")err("« à inclure / à éviter » restent pré-remplis après l'envoi à Claude");
    await pg.evaluate(()=>renderNutri());if(await pg.inputValue("#nuInclude")!=="")err("« à inclure » revient après un nouveau rendu");
    await pg.click('[data-nutab="day"]');await pg.evaluate(()=>{nuCall=async(k,p)=>{throw aiNeed(k,p)}});await pg.fill("#nuAsk","zzz plat imaginaire 300 g");await pg.click("#nuAskBtn");await pg.waitForTimeout(800);if(await pg.isVisible("#aaClose"))await pg.click("#aaClose");
    if(await pg.inputValue("#nuAsk")!=="")err("« Ajouter ce que tu manges » reste pré-rempli après l'envoi à Claude");
    // v43 : Claude branché → photo prise = déposée dans le dossier privé ; « Envoyer à Claude » ouvre Claude, rien d'autre à faire
    await pg.evaluate(async()=>{const c=document.createElement("canvas");c.width=c.height=60;c.getContext("2d").fillRect(0,0,60,60);
      const b=await new Promise(r=>c.toBlob(r,"image/jpeg"));const dt=new DataTransfer();dt.items.add(new File([b],"plat.jpg",{type:"image/jpeg"}));
      const i=$("nuPhoto");i.files=dt.files;i.dispatchEvent(new Event("change"));window.open=(u)=>{window.__opened=u||"";return null}});
    await pg.waitForTimeout(1200);
    if((await pg.textContent("#nuAskBtn")).trim()!=="Envoyer à Claude")err("le bouton ne dit pas « Envoyer à Claude » : "+await pg.textContent("#nuAskBtn"));
    const ob=await (await pg.request.get("http://localhost:8790/__objs")).json().catch(()=>({}));
    if(!Object.keys(ob).some(k=>/\/repas-\d+\.jpg$/.test(k)))err("la photo n'est pas déposée dans le dossier privé : "+JSON.stringify(Object.keys(ob)));
    await shot(pg,"v43-photo-direct");await pg.click("#nuAskBtn");await pg.waitForTimeout(500);
    const op=await pg.evaluate(()=>window.__opened);if(!op||!op.startsWith("https://claude.ai/new")||!decodeURIComponent(op).includes("nutrition_journee"))err("Claude ne s'ouvre pas avec le message nutrition_journee : "+op);
    const ob2=await (await pg.request.get("http://localhost:8790/__objs")).json();
    if(!Object.keys(ob2).some(k=>/\/envoi-\d+\.jpg$/.test(k))||Object.keys(ob2).some(k=>/\/repas-\d+\.jpg$/.test(k)))err("la photo envoyée n'est pas marquée « envoi » : "+JSON.stringify(Object.keys(ob2)));
    if(await pg.isVisible("#aiAskSheet"))err("une fenêtre intermédiaire s'ouvre encore pour la photo");
    // la petite fenêtre ouverte pour Claude est refermée au retour dans Sid'home (sur iPhone, elle restait blanche)
    const closed=await pg.evaluate(async()=>{const fw={closed:false,close(){this.closed=true}};window.open=()=>fw;extOpen("https://claude.ai/new?q=x");
      document.dispatchEvent(new Event("visibilitychange"));await new Promise(r=>setTimeout(r,400));return fw.closed});
    if(!closed)err("la fenêtre de Claude n'est pas refermée au retour");
    // Sid'note s'ouvre toujours sur Notes, même si Documents était ouvert en dernier
    const nv=await pg.evaluate(()=>{show("docs");show("home");openGroup("perso");const v=data.ui.view;show("nutri");return v});if(nv!=="notes")err("Sid'note s'ouvre sur « "+nv+" » au lieu de Notes");
    if(await pg.evaluate(()=>!!nuPhoto||!$("nuPhotoPrev").hidden))err("la photo reste affichée après l'envoi");
    // sans Claude branché : la feuille de partage reste le secours (photo + message)
    await pg.evaluate(()=>{data.prefs.aiOk=0;navigator.canShare=()=>true;navigator.share=async d=>{window.__shared={n:(d.files||[]).length,type:d.files&&d.files[0]&&d.files[0].type,text:d.text}}});
    await pg.evaluate(()=>{const c=document.createElement("canvas");c.width=c.height=40;c.getContext("2d").fillRect(0,0,40,40);const u=c.toDataURL("image/jpeg");nuPhoto={big:u,small:u};$("nuPhotoPrev").hidden=false});
    await pg.click("#nuAskBtn");await pg.waitForTimeout(800);
    if(!(await pg.isVisible("#aaShare")))err("pas de bouton « Envoyer la photo à Claude »");
    if(await pg.locator('#aaActs a[href^="https://claude.ai/new"]').count())err("le lien texte seul est encore proposé pour une photo");
    await shot(pg,"v43-photo-claude");await pg.click("#aaShare");await pg.waitForTimeout(300);
    const sh=await pg.evaluate(()=>window.__shared);if(!sh||sh.n!==1||sh.type!=="image/jpeg"||!/photo/i.test(sh.text||""))err("la photo n'est pas partagée avec le message : "+JSON.stringify(sh));
    if(await pg.isVisible("#aiAskSheet"))await pg.click("#aaClose");
    await pg.evaluate(()=>{show("muscu");coachOpen()});await pg.click("#cfMore summary");await pg.fill("#cfNotes","abdos tous les jours");await pg.fill("#cfAvoidTxt","poignet");
    await pg.click('#coachForm [data-cfgo="ai"]');await pg.waitForTimeout(400);if(await pg.isVisible("#aaClose"))await pg.click("#aaClose");
    await pg.evaluate(()=>coachOpen());await pg.waitForTimeout(150);if(await pg.inputValue("#cfNotes")!==""||await pg.inputValue("#cfAvoidTxt")!=="")err("remarques du programme pré-remplies à la réouverture");
    if(!(await pg.evaluate(()=>PL().profile.remarks.some(r=>r.text==="abdos tous les jours"))))err("la remarque n'est plus gardée pour Claude");
    await ctx.close()}
  // --- v44 : séances et programmes au même format (migration, cartes, partage, import), liste d'exercices, conversations Claude fixes
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1440,height:900}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v44 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v44"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    // ancien programme (plan.days) + séance libre : migrés sans rien perdre, mêmes cartes
    const mg=await pg.evaluate(()=>{data.muscu={sessions:[{id:"s1",name:"Push libre",exercises:[{id:"e1",name:"Dips",sets:[{kg:"20",reps:"8"},{kg:"22,5",reps:"6"}]}]}],
      plan:{id:"P1",profile:{level:"inter",goal:"muscle",days:2,dur:60,equip:"gym"},days:[{id:"d1",name:"Séance A",ex:[{name:"Squat barre",pat:"quads:squat",sets:4,reps:"6–10",rest:180,rir:"1–2"}]},{id:"d2",name:"Séance B",ex:[{name:"Tractions",pat:"back:vpull",sets:3,reps:"8–12",rest:120}]}],upd:1,src:"app"},
      log:[{id:"l1",date:"2026-10-20",day:"d1",name:"Séance A",ex:[{name:"Squat barre",sets:[{kg:"80",reps:"10"}]}]}]};save();show("muscu");renderMuscu();
      const m=data.muscu;return{days:!!m.plan.days,v:m.plan.v,ses:m.sessions.map(s=>s.name+":"+s.exercises.map(e=>e.sets.length+"/"+(e.reps||"")+"/"+(e.rest||"")).join(",")).join(" | "),next:coachNext()&&coachNext().id,cards:document.querySelectorAll("#msList .ms").length,kg:m.sessions[0].exercises[0].sets[1].kg}});
    if(mg.days||mg.v!==2||mg.ses!=="Push libre:2// | Séance A:4/6–10/180 | Séance B:3/8–12/120"||mg.next!=="d2"||mg.cards!==3||mg.kg!=="22,5")err("migration : "+JSON.stringify(mg));
    if(await pg.$("#rest"))err("chrono encore présent");
    await pg.waitForFunction(()=>{const s=document.getElementById("splash");return !s||s.hidden||getComputedStyle(s).display==="none"||getComputedStyle(s).opacity==="0"},null,{timeout:6000}).catch(()=>{});await pg.waitForTimeout(300);
    await pg.click('#msList [data-ms="d2"] summary');await pg.evaluate(()=>{const e=document.querySelector("#msList");window.scrollTo(0,e.getBoundingClientRect().top+scrollY-120)});await shot(pg,"v44-"+nm+"-seances");
    // même carte, mêmes actions pour une séance libre et une séance de programme
    const act=await pg.evaluate(()=>["s1","d1"].map(id=>{msOpenId=id;renderMuscu();return[...document.querySelectorAll(`#msList [data-ms="${id}"] .ms-actions button`)].map(b=>Object.keys(b.dataset).join()).join("+")}));
    if(act[0]!==act[1])err("actions différentes : "+act);
    // partage d'un programme puis import : même format ; texte de Claude accepté ; ancien texte accepté
    const rt=await pg.evaluate(()=>{const t=shareTxt(PLD(),"Mon programme"),r=parseShared(t);return r&&{prog:r.prog,n:r.ses.length,ex:r.ses[0].exercises.map(e=>e.name+"/"+e.sets.length+"/"+e.reps+"/"+e.rest).join()}});
    if(!rt||rt.prog!=="Mon programme"||rt.n!==2||rt.ex!=="Squat barre/4/6–10/180")err("partage → import d'un programme : "+JSON.stringify(rt));
    const cl=await pg.evaluate(()=>{const r=parseShared("## Séance A — Haut du corps\n1. Développé couché haltères — 4 séries de 6 à 10 (repos 3 min)\n2. Pec deck : 3 x 12-15, repos 2 min\n\n## Séance B — Jambes\n- Leg curl assis : 3 séries × 10–12");return r&&r.ses.map(s=>s.name+"|"+s.exercises.map(e=>e.name+"/"+e.sets.length+"/"+(e.reps||"")+"/"+(e.rest||"")).join(";")).join(" || ")});
    if(cl!=="Séance A — Haut du corps|Développé couché haltères/4/6–10/180;Pec deck/3/12–15/120 || Séance B — Jambes|Leg curl assis/3/10–12/")err("programme écrit par Claude mal lu : "+cl);
    const old=await pg.evaluate(()=>{const r=parseShared("Séance « Push » (Sid'note)\n1. Développé couché : 4 séries\n2. Dips : 3 séries");return r&&!r.prog&&r.ses[0].name==="Push"&&r.ses[0].exercises.length===2});if(!old)err("ancien texte de séance plus importable");
    await pg.click("#msImportOpen");await pg.fill("#msPaste",await pg.evaluate(()=>shareTxt(PLD(),"Programme de Léa")));await pg.click("#msImportBtn");await pg.waitForTimeout(200);
    if(await pg.evaluate(()=>M().sessions.filter(s=>s.grp&&s.grp.name==="Programme de Léa").length)!==2)err("import d'un programme par l'écran d'import");
    // suivre un programme importé : il devient le programme suivi
    await pg.evaluate(()=>{const g=M().sessions.find(s=>s.grp&&s.grp.name==="Programme de Léa").grp.id;grpActions(g)});await pg.click('#actList .act-it:has-text("Suivre ce programme")');await pg.waitForTimeout(150);
    if(!(await pg.evaluate(()=>PLD().length===2&&PLD()[0].grp.name==="Programme de Léa")))err("programme importé pas suivi");
    // liste d'exercices : seule source des suggestions
    const sg=await pg.evaluate(()=>{const names=new Set(EXDB.map(e=>e.n));const dl=[...$("exList").options].map(o=>o.value);
      const box=document.querySelector('.cf-pick[data-cfx="must"]');box.querySelector("input").value="squat";cfSearch(box);const hits=[...box.querySelectorAll("[data-cfadd]")].map(b=>b.dataset.cfadd);
      return{n:EXDB.length,dl:dl.length===EXDB.length&&dl.every(n=>names.has(n)),hits,prio:EXDB.filter(e=>e.p).length}});
    if(sg.n!==39||!sg.dl||sg.hits.join()!=="Hack squat amplitude limitée"||sg.prio!==12)err("liste d'exercices : "+JSON.stringify(sg));
    const pr=await pg.evaluate(()=>{cfDraft={level:"inter",goal:"muscle",days:3,dur:60,equip:"gym"};return coachPrompt("new")});
    if(!pr.includes("Utilise uniquement ces exercices")||!pr.includes("Face pull (P)")||!pr.includes("Crunch à la poulie (P)"))err("le message de génération n'impose pas la liste");
    // conversations fixes : réglages (lien public refusé), message copié puis la conversation s'ouvre
    await pg.evaluate(()=>{window.__open=[];window.__clip=[];window.open=u=>{window.__open.push(u);return null};navigator.clipboard.writeText=t=>{window.__clip.push(t);return Promise.resolve()};convSettings()});await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#convNutri")))err("réglage des conversations introuvable");
    await pg.fill("#convNutri","https://claude.ai/share/abc");await pg.click('.conv-f[data-conv="nutri"] button');if(await pg.evaluate(()=>(data.prefs.aiConv||{}).nutri))err("lien de partage public accepté");
    await pg.fill("#convNutri","https://claude.ai/chat/1111-aaaa");await pg.click('.conv-f[data-conv="nutri"] button');
    await pg.fill("#convMuscu","https://claude.ai/project/2222-bbbb");await pg.click('.conv-f[data-conv="muscu"] button');await shot(pg,"v44-"+nm+"-conversations");
    if(await pg.evaluate(()=>JSON.stringify(data.prefs.aiConv))!=='{"nutri":"https://claude.ai/chat/1111-aaaa","muscu":"https://claude.ai/project/2222-bbbb"}')err("liens des conversations pas enregistrés");
    await pg.evaluate(()=>{data.prefs.aiOk=1;data.prefs.ai="claude";data.nutri.consent=new Date().toISOString();save();show("muscu");renderMuscu()});
    await pg.fill("#coRemark","plus de dos");await pg.click('#coachBox [data-coach="adjust"]');await pg.waitForTimeout(300);
    if(!(await pg.isVisible('#aaActs [data-aaconv]')))err("pas de bouton « Ouvrir la conversation Musculation »");
    await pg.click('#aaActs [data-aaconv]');await pg.waitForTimeout(300);
    const o1=await pg.evaluate(()=>({o:window.__open.slice(-1)[0],c:window.__clip.slice(-1)[0]}));
    // projet : nouvelle discussion dans le projet, message déjà écrit (rien à coller)
    if(!String(o1.o).startsWith("https://claude.ai/new?project=2222-bbbb&q=")||!decodeURIComponent(o1.o).includes("plus de dos"))err("musculation : pas ouvert dans le projet avec le message : "+JSON.stringify(o1));
    await pg.evaluate(()=>{show("nutri");aiGo("nutri","J'ai mangé : test")});
    const o2=await pg.evaluate(()=>({o:window.__open.slice(-1)[0],c:window.__clip.slice(-1)[0]}));
    if(o2.o!=="https://claude.ai/chat/1111-aaaa"||o2.c!=="J'ai mangé : test")err("nutrition : mauvaise conversation : "+JSON.stringify(o2));
    if(!(await pg.textContent("#toast")).includes("Prompt copié"))err("pas de message « Prompt copié »");
    // sans lien réglé : nouvelle conversation pré-remplie, comme avant
    await pg.evaluate(()=>{data.prefs.aiConv={};aiGo("nutri","bonjour")});if(!(await pg.evaluate(()=>window.__open.slice(-1)[0].startsWith("https://claude.ai/new?q="))))err("sans lien : pas de nouvelle conversation");
    await ctx.close()}
  // --- v43 : rien ne défile au-dessus de la barre d'une note (iPhone et ordinateur)
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1440,height:900}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v43 barres collées "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43bar"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{data.notes=[{id:"lg",title:"Longue",body:Array.from({length:60},(_,i)=>"Ligne "+i).join("\n"),createdAt:new Date().toISOString(),upd:Date.now()}];save();show("notes");openNote("lg")});await pg.waitForTimeout(300);
    const n=await pg.evaluate(async()=>{$("noteEdit").scrollTop=600;await new Promise(r=>setTimeout(r,250));const el=document.elementFromPoint(innerWidth/2,1);return !!(el&&el.closest("#noteTop"))&&Math.round($("noteTop").getBoundingClientRect().top)===0});
    if(!n)err("le texte de la note passe au-dessus de la barre");
    await ctx.close()}
  // --- v43 lot 5 : RGPD / cookies : aucune ressource de tiers, Spotify seulement après un clic, case des conditions, pages légales
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1440,height:900}}],["tablette",{...devices["iPad (gen 7)"]}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v43 RGPD "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    const hosts=new Set();pg.on("request",r=>{try{hosts.add(new URL(r.url()).host)}catch(e){}});
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43rgpd"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");
    if(await pg.isChecked("#aAgree"))err("case des conditions pré-cochée");
    await pg.click("#aBtn");await pg.waitForTimeout(400);if(!(await pg.isVisible("#auth"))||!(await pg.textContent("#aErr")).includes("conditions"))err("inscription possible sans accepter les conditions");
    await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    for(const v of ["plan","pomo","muscu","nutri","notes","docs","more"]){await pg.evaluate(v=>show(v),v);await pg.waitForTimeout(250)}
    await pg.evaluate(()=>show("pomo"));await pg.waitForTimeout(300);
    if(await pg.locator("#spotEmbed iframe").count())err("Spotify chargé sans accord");
    const third=[...hosts].filter(h=>!/^localhost(:\d+)?$/.test(h));if(third.length)err("ressources de tiers chargées sans action : "+third.join(", "));
    await pg.click("[data-spotok]");await pg.waitForTimeout(300);if(!(await pg.locator("#spotEmbed iframe").count()))err("Spotify ne se charge pas après l'accord");
    await pg.click("[data-spotno]");await pg.waitForTimeout(200);if(await pg.locator("#spotEmbed iframe").count())err("l'accord Spotify ne se retire pas");
    await pg.evaluate(()=>openLegal("cookies"));await pg.waitForTimeout(200);if(!(await pg.textContent("#legalBody")).includes("cookie"))err("onglet Cookies absent");
    await shot(pg,"v43-"+nm+"-cookies");
    for(const f of ["confidentialite.html","conditions.html","cookies.html","robots.txt","sitemap.xml","llms.txt","fonts.css","lib/pdfjs/pdf.min.js"]){const r=await pg.request.get(U+f);if(r.status()!==200)err(f+" introuvable ("+r.status()+")")}
    if(nm==="mobile"){await pg.goto(U+"confidentialite.html");await pg.waitForTimeout(300);if(!(await pg.textContent("main")).includes("Inventaire complet"))err("inventaire absent de la page de confidentialité");await shot(pg,"v43-page-confidentialite")}
    await ctx.close()}
  {const ctx=await b.newContext({...devices["iPhone 13"],intro:true,reducedMotion:"reduce"}),pg=await ctx.newPage(),err=m=>errs.push("v43 animations réduites : "+m);
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43rm@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.click('#homeBody [data-gapp="perso"]');await pg.waitForTimeout(300);if(await pg.isVisible("#appIntro"))err("animation affichée malgré « réduire les animations »");await ctx.close()}
  const real=errs.filter(Boolean);
  console.log(real.length?"ERREURS :\n"+real.join("\n"):"OK : aucune erreur. Captures dans tests/out/");
  await b.close();process.exit(real.length?1:0);
})();
