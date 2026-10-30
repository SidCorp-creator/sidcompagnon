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
    // v42 : Sid'compagnon → logo de l'app → barre du bas de l'app ; Réglages par le bouton du compte sur Sid'compagnon
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
    // v45 : sombre par défaut ; le passage « light » choisit le thème clair pour garder des captures des deux thèmes
    if(scheme==="light")await pg.evaluate(()=>{data.prefs.theme="light";save();applyLook()});else if(await pg.evaluate(()=>document.documentElement.dataset.theme)!=="dark")err("le thème sombre n'est pas appliqué par défaut");
    if(await pg.isVisible("#onb")){await shot(pg,scheme+"-02-presentation");await pg.click("#onbSkip");await pg.waitForTimeout(400)}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{["plan","todo","pomo","notes","muscu","nutri","graph","docs","pwd","app"].forEach(k=>data.prefs.tabs[k]=true);save();applyTabs()});

    // --- v42 : Sid'compagnon : les 3 apps en logos, pas de barre du bas ; chaque app a sa barre et un retour à Sid'compagnon
    if(await pg.isVisible("nav"))err("barre du bas affichée sur Sid'compagnon");
    const apps=await pg.$$eval("#homeBody .hc-list [data-gapp]",x=>x.map(e=>e.dataset.gapp).join(","));
    if(apps!=="orga,sport,perso")err("cartes des 3 apps absentes de Sid'compagnon : "+apps);
    await shot(pg,scheme+"-03-aujourdhui");
    await pg.click("#homeAdd");if(!(await pg.isVisible("#qaSheet")))err("le + de la page Aujourd'hui n'ouvre pas l'ajout rapide");await pg.click("#qaClose");
    await pg.click('#homeBody [data-gapp="perso"]');await pg.waitForTimeout(200);await closePin();
    if(G[await cur()]!=="perso")err("le logo sid'note n'ouvre pas sid'note");
    if((await pg.$$("#navIn [data-go]")).length!==3)err("barre de sid'note : 3 fonctions attendues");
    if(await pg.evaluate(()=>document.documentElement.dataset.app)!=="note")err("accent de l'app non appliqué");
    if(await pg.isVisible('#homeBody'))err("Sid'compagnon encore visible dans une app");
    await go("notes");await go("muscu");await home();await pg.click('#homeBody [data-gapp="perso"]');await pg.waitForTimeout(200);await closePin();
    if(await cur()!=="notes")err("l'app ne rouvre pas la dernière fonction ouverte");
    await home();if(await pg.isVisible("#vhead"))err("en-tête d'app affiché sur Sid'compagnon");
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
      await pin("12345");await pg.waitForTimeout(400);if(!(await pg.isVisible("#vault"))&&!(await pg.isVisible("#recSheet"))){await pin("12345");}
      // v48 (option A) : plus de phrase secrète : le mot de passe du compte protège la clé du coffre
      await pg.waitForSelector("#recSheet:not([hidden])",{timeout:8000}).catch(()=>err("mot de passe du compte non demandé à la création du coffre"));
      if(await pg.isVisible("#phSheet"))err("phrase secrète encore demandée");
      await pg.fill("#recPw","mauvais1");await pg.click("#recOk");await pg.waitForTimeout(400);
      if(!(await pg.isVisible("#recErr")))err("mauvais mot de passe accepté pour le coffre");
      await pg.fill("#recPw","secret11");await shot(pg,scheme+"-fr-coffre-mot-de-passe");await pg.click("#recOk");
      await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("coffre non ouvert"));await pg.waitForTimeout(400);
      const vf=await pg.evaluate(()=>({v:data.vault.v,salt:!!data.vault.salt,ph:!!data.phx,pw:!!(data.phx&&data.phx.pw),phs:!!(data.phx&&data.phx.salt),dv:data.docVault&&data.docVault.v}));
      if(vf.v!==2||vf.salt||!vf.ph||!vf.pw||vf.phs||vf.dv!==2)err("coffre pas au format renforcé (mot de passe) : "+JSON.stringify(vf));
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
    if(!(await pg.textContent("#moreOpts summary")).includes("Calendriers reliés"))err("option iCal non renommée");
    if((await pg.textContent("#v-plan")).includes("UMons"))err("« UMons » encore affiché dans l'agenda");
    await pg.click("#moreOpts summary");await pg.locator("#moreOpts").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-plan-calendrier-relie");await pg.click("#moreOpts summary");
    const notifTxt=await pg.evaluate(()=>{renderLeads();return document.querySelector(".notif-box").textContent});
    if(notifTxt.includes("UMons")||notifTxt.includes("me prévenir 24"))err("l'option des cours reste affichée sans calendrier relié");

    // --- v29 : mois repliables dans l'Agenda
    await pg.evaluate(()=>{const y=new Date().getFullYear();data.tasks.push({id:"m1",title:"Anniversaire A",date:`${y+1}-01-19`,status:"à faire",cat:"Perso"},{id:"m2",title:"Anniversaire B",date:`${y+1}-03-02`,status:"à faire",cat:"Perso"});save();renderPlan()});
    // v44.6 : tous les mois repliés par défaut ; un mois s'ouvre au toucher, « Tout déplier » / « Tout replier »
    if(await pg.$$eval("#tasks .card",x=>x.length)!==0)err("des mois sont ouverts par défaut");
    await pg.locator("#tasks").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-plan-mois-replies");
    await pg.click("#tasks [data-mfold]");await pg.waitForTimeout(150);
    if(!(await pg.$eval("#tasks [data-mfold]",b=>b.getAttribute("aria-expanded")==="true")))err("le mois ne s'ouvre pas");
    await pg.click("[data-mfoldall]");await pg.waitForTimeout(150);
    if(await pg.$$eval("#tasks .card",x=>x.length)!==0)err("« Tout replier » ne replie pas tous les mois");
    await pg.click("[data-mfoldall]");await pg.waitForTimeout(150);
    if(await pg.$$eval("#tasks [data-mfold][aria-expanded='false']",x=>x.length))err("« Tout déplier » n'ouvre pas tous les mois");
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
    const acct=async t=>{await pg.waitForSelector("#recSheet:not([hidden])",{timeout:10000});await pg.fill("#recPw",t);await pg.click("#recOk")};
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
    // 1) mots de passe : ancien code → mot de passe du compte demandé (v48, plus de phrase) → coffre renforcé, mêmes données
    await show("pwd");await pg.waitForTimeout(300);await pin("24680");
    await acct("motdepasse1").catch(()=>err("mot de passe non demandé au passage du coffre"));await shot(pg,"coffre-renforce");
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
    // 5) nouvel appareil : plus de clé sur l'appareil → mot de passe du compte (faux puis bon) → nouveau code → tout se rouvre
    await pg.evaluate(()=>{localStorage.removeItem("sidnote-mk-"+session.user.id);phMem=null;pwdLock();dvLock();nsLock()});
    await show("pwd");await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#pinDev"))||!(await pg.textContent("#pinDev")).includes("mot de passe"))err("pas de bouton « mot de passe du compte » sur un nouvel appareil");await shot(pg,"coffre-nouvel-appareil");
    await pg.click("#pinDev");await acct("mauvais");await pg.waitForTimeout(1500);
    if(!(await pg.isVisible("#recErr")))err("faux mot de passe accepté");
    await acct("motdepasse1");await pg.waitForSelector("#pinSheet:not([hidden])",{timeout:15000}).catch(()=>err("code de l'appareil non demandé"));
    await ps("11111");await ps("11111");await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("coffre non ouvert sur le nouvel appareil"));await pg.waitForTimeout(600);
    if(await pg.evaluate(()=>(vaultItems.get("p1")||{}).pw)!=="s3cret!")err("mot de passe illisible sur le nouvel appareil");
    await show("docs");await pg.waitForTimeout(300);await ps("11111");await pg.waitForTimeout(1500);
    if(!(await pg.evaluate(async()=>dvOpen&&(await docBlob(data.docs.find(x=>x.id==="d1"))).size>0)))err("documents illisibles sur le nouvel appareil");
    // 6) mauvais code puis code oublié → phrase → nouveau code
    await pg.evaluate(()=>{phMem=null;pwdLock()});await show("pwd");await pg.waitForTimeout(300);await pin("99999");await pg.waitForTimeout(1500);
    if(!(await pg.textContent("#pinErr")).includes("incorrect"))err("mauvais code accepté");
    await pg.click("#pinForgot");await acct("motdepasse1");await pg.waitForSelector("#pinSheet:not([hidden])",{timeout:15000}).catch(()=>{});
    await ps("33333");await ps("33333");await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("code oublié : coffre non rouvert"));
    // 7) fusion : un appareil resté sur l'ancien coffre n'écrase pas le coffre renforcé
    st=await pg.evaluate(()=>{const nv=data.vault,old={id:"oldv",salt:"x",chk:{},createdAt:"2026-01-01T00:00:00.000Z"};
      return [mergeData({...data,vault:old},data).vault.id===nv.id,mergeData(data,{...data,vault:old}).vault.id===nv.id]});
    if(!st[0]||!st[1])err("la fusion garde l'ancien coffre : "+st);
    // 8) changement de mot de passe : l'enveloppe suit ; remise à zéro par e-mail : réenveloppée au prochain déverrouillage
    st=await pg.evaluate(async()=>{await recRewrap("motdepasse1","nouveau123");let a=false,b=false;try{await pwUnwrap("nouveau123");a=true}catch(e){}try{await pwUnwrap("motdepasse1");b=true}catch(e){}return {a,b}});
    if(!st.a||st.b)err("enveloppe pas rechiffrée au changement de mot de passe : "+JSON.stringify(st));
    await pg.evaluate(()=>{data.phx={...data.phx,pwStale:1};pwOfferDone=false;phPwOffer()});
    await acct("motdepasse1").catch(()=>err("mot de passe non redemandé après une remise à zéro"));await pg.waitForTimeout(800);
    st=await pg.evaluate(async()=>{let a=false;try{await pwUnwrap("motdepasse1");a=true}catch(e){}return {a,stale:!!data.phx.pwStale}});
    if(!st.a||st.stale)err("enveloppe pas refaite après une remise à zéro : "+JSON.stringify(st));
    // 9) ancien compte avec phrase secrète : rien n'est rechiffré, le mot de passe est ajouté une fois, la phrase reste en secours
    await pg.evaluate(async()=>{const salt=b64e(crypto.getRandomValues(new Uint8Array(16))),m2=await phDerive("vieille phrase 12",salt,PIN_ITER);
      data.phx={id:"phold",salt,iter:PIN_ITER,chk:await encJ(m2.key,{ok:"sidnote-phrase"}),createdAt:"2026-02-01T00:00:00.000Z",at:Date.parse("2026-02-01")};
      const n=await v2Make(m2,"sidnote",{uni:true});data.vault=n.v;data.pwds=[{id:"p9",vid:n.v.id,...await encJ(n.key,{site:"Poste",user:"sid",pw:"timbre"}),upd:2}];
      data.docVault=null;data.noteVault=null;ls.del(mkLsKey());await mkWrap("main","22222",m2);phMem=null;pwOfferDone=false;pwdLock();save()});
    await show("pwd");await pg.waitForTimeout(300);await pin("22222");
    await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("ancien coffre à phrase non ouvert avec le code"));
    await pg.waitForSelector("#recSheet:not([hidden])",{timeout:8000}).catch(()=>err("ajout du mot de passe non proposé à un ancien compte"));
    if(!(await pg.textContent("#recTitle")).includes("phrase"))err("mauvais titre pour l'ajout du mot de passe");
    await shot(pg,"coffre-plus-de-phrase");await acct("motdepasse1");await pg.waitForTimeout(800);
    st=await pg.evaluate(()=>({pw:!!data.phx.pw,salt:!!data.phx.salt,id:data.phx.id,item:(vaultItems.get("p9")||{}).pw}));
    if(!st.pw||!st.salt||st.id!=="phold"||st.item!=="timbre")err("ancien compte : "+JSON.stringify(st));
    // nouvel appareil : le mot de passe suffit ; sinon (annuler), la phrase marche encore
    await pg.evaluate(()=>{ls.del(mkLsKey());phMem=null;pwdLock()});await show("pwd");await pg.waitForTimeout(300);
    await pg.click("#pinDev");await acct("motdepasse1");await ps("44444");await ps("44444");
    await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("ancien compte : pas rouvert avec le mot de passe"));
    await pg.evaluate(()=>{ls.del(mkLsKey());phMem=null;pwdLock()});await show("pwd");await pg.waitForTimeout(300);
    await pg.click("#pinDev");await pg.waitForSelector("#recSheet:not([hidden])");await pg.click("#recLater");
    await phrase("vieille phrase 12").catch(()=>err("phrase pas proposée en secours"));await ps("55555");await ps("55555");
    await pg.waitForSelector("#vault:not([hidden])",{timeout:15000}).catch(()=>err("ancien compte : pas rouvert avec la phrase"));
    if(await pg.evaluate(()=>(vaultItems.get("p9")||{}).pw)!=="timbre")err("ancien compte : mot de passe illisible");
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
    // coffre : code 24680 + mot de passe du compte (v48)
    await pg.evaluate(()=>show("pwd"));await pg.waitForTimeout(300);await pin("24680");await pin("24680");
    await pg.waitForSelector("#recSheet:not([hidden])",{timeout:10000});await pg.fill("#recPw","motdepasse1");await pg.click("#recOk");
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
    await pg.evaluate(()=>{renderPwd();$("pinBio").click()}); // le bouton peut clignoter pendant une synchro : on vise directement l'actionawait pg.waitForFunction(()=>!!vaultKey,null,{timeout:15000}).catch(()=>err("Face ID n'ouvre pas les mots de passe"));
    // code changé ailleurs : Face ID se retire proprement, le code reste possible
    await pg.evaluate(async()=>{const s=ls.get(bioLsKey());const k=await bioPrf(s);s.main=await encJ(k,{c:"11111"});ls.set(bioLsKey(),s);pwdLock();bioAutoAt.main=Date.now();show("pwd")});await pg.waitForTimeout(300);
    await pg.waitForTimeout(3000); // laisse finir l'ouverture Face ID précédente (sinon le coffre se rouvre pendant le test)
    await pg.waitForFunction(()=>{if(vaultKey)pwdLock();return !vaultKey&&pinStep==="unlock"&&!$("pinBio").hidden},null,{timeout:5000}).catch(()=>{});await pg.evaluate(()=>{if(vaultKey)pwdLock();renderPwd()});await pg.click("#pinBio");await pg.waitForTimeout(2500);
    if(await pg.evaluate(()=>!!vaultKey||bioHas("main")))err("mauvais code Face ID mal géré");
    // adresse pour Claude
    await pg.evaluate(()=>{show("more");document.querySelector('[data-sec="claude"]').open=true;$("aiAdv").open=true});await pg.waitForTimeout(500);
    await pg.click("#mcpNew");await pg.waitForTimeout(800);
    const url=await pg.textContent("#mcpUrl");if(!/^https:\/\/sidcompagnon\.com\/mcp\/[A-Za-z0-9_-]{40,}$/.test(url))err("adresse Claude incorrecte : "+url); // v45.2 : sur le domaine de l'app
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
    // v44.7 : Aujourd'hui ne liste plus les tâches (seulement leur nombre sur la carte sid'agenda) : le report se vérifie dans Tâches
    if(!(await pg.textContent('#homeBody .hc[data-app="agenda"]')).includes("1 "))err("nombre de tâches du jour absent de la carte sid'agenda");
    if(!(await pg.evaluate(()=>dayTodos(iso(today())).some(t=>t.id==="late1")&&tLate(data.todos.find(t=>t.id==="late1")))))err("tâche d'hier pas reportée sur aujourd'hui");
    await pg.evaluate(()=>{todoToggle(data.todos.find(x=>x.id==="late1"))});await pg.waitForTimeout(200);
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
    // v44.7 : plus de carte Claude sur Aujourd'hui (elle reste dans Nutrition et Réglages)
    await pg.evaluate(()=>show("home"));await pg.waitForTimeout(200);
    if(await pg.isVisible("#homeBody .hm-ai"))err("la carte Claude est encore sur Aujourd'hui");
    // v42 : Claude seulement, l'assistant va directement aux étapes de Claude
    await pg.evaluate(()=>aiWizard());await pg.waitForTimeout(900);await shot(pg,"v39-ia-etapes");
    if(await pg.locator("[data-aipick]").count())err("le choix d'une autre IA est encore proposé");
    const au=await pg.textContent("#aiUrl");if(!/^https:\/\/sidcompagnon\.com\/mcp\//.test(au))err("adresse pas créée dans l'assistant : "+au);
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
    if(!(await pg.isVisible('#coachForm [data-cf="avoid"]')))err("précisions pas ouvertes d'emblée (v44.4)");
    
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
    await pg.click(`#msList [data-ms="${d0}"] summary`);
    const pl=await pg.evaluate(()=>PLD().map(d=>d.exercises.map(e=>e.name)));
    if(pl.length!==3)err("programme pas créé : "+pl.length);
    else if(await pg.evaluate(()=>PLD().some(d=>d.exercises.length<3||d.exercises.some(e=>!EXN(e.name)))))err("séance trop courte ou exercice hors de la liste");
    else if(pl.some(d=>d.some(n=>/Presse à cuisses|Leg extension|Hack squat/.test(n))))err("genoux pas ménagés");
    await shot(pg,"v41-coach-programme");
    // v43 : séries libres (+ / −), sur la carte de la séance
    {const s0=await pg.evaluate(()=>PLD()[0].exercises[0].sets.length),sel=`#msList [data-ms="${d0}"] [data-ex]:first-of-type`;
      await pg.click(`${sel} [data-msaddset]`);await pg.click(`${sel} [data-msaddset]`);await pg.click(`${sel} [data-msdelset="0"]`);
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
    // v44.7 : une seule interface, une ligne par série « Série n : [kg] – [reps] », + / × par série, rien de pré-rempli (plus de mode séance)
    if(await pg.$("#woSheet")||await pg.$('#coachBox [data-coach="start"]')||await pg.$("#msList [data-msstart]"))err("le mode séance (commencer / terminer) existe encore");
    {const sel=`#msList [data-ms="${d0}"] [data-ex]:first-of-type`,n0=await pg.evaluate(()=>PLD()[0].exercises[0].sets.length);
      if(await pg.$$eval(`${sel} .set-row`,x=>x.length)!==n0)err("pas une ligne par série");
      if(await pg.$$eval(`${sel} .set-in`,x=>x.some(i=>i.value!=="")))err("des séries sont pré-remplies");
      if(await pg.$$eval(`${sel} .set-row:first-child .set-in`,x=>x.map(i=>i.dataset.f).join())!=="setkg,setreps")err("kg doit venir avant les répétitions");
      await pg.click(`${sel} [data-msaddset]`);await pg.waitForTimeout(150);if(await pg.evaluate(()=>PLD()[0].exercises[0].sets.length)!==n0+1)err("« + Ajouter une série » ne marche pas");
      await pg.click(`${sel} [data-msdelset="0"]`);await pg.waitForTimeout(150);if(await pg.evaluate(()=>PLD()[0].exercises[0].sets.length)!==n0)err("× ne retire pas la série");
      await pg.type(`${sel} .set-row:nth-child(2) [data-f="setkg"]`,"22,5");await pg.type(`${sel} .set-row:nth-child(2) [data-f="setreps"]`,"10");await pg.waitForTimeout(700);
      const v=await pg.evaluate(()=>{const s=PLD()[0].exercises[0].sets[1];return [s.kg,s.reps]});if(v[0]!=="22.5"||v[1]!=="10")err("série pas enregistrée : "+v);
      // v42 : en touchant un champ de nombre, le curseur va à la fin
      await pg.click(`${sel} .set-row:nth-child(2) [data-f="setkg"]`,{position:{x:8,y:10}});await pg.waitForTimeout(120);
      const cur=await pg.evaluate(()=>{const el=document.activeElement;return [el.selectionStart,el.value.length]});if(cur[0]!==cur[1])err("curseur pas à la fin du nombre : "+cur);
      await pg.locator(`#msList [data-ms="${d0}"]`).scrollIntoViewIfNeeded();await shot(pg,"v447-muscu-series")}
    // migration : séries gardées telles quelles ; un poids commun de la 44.6 va dans les séries vides, jamais une fourchette « 8–12 »
    {const r=await pg.evaluate(()=>{M().sessions.push({id:"old1",name:"Ancienne",upd:1,exercises:[{id:"oe",name:"Curl poulie",reps:"",sets:[{kg:"12",reps:"10"},{kg:"14",reps:"8"},{kg:"",reps:""}]},
        {id:"oe2",name:"Face pull",reps:"10",kg:"20",sets:[{kg:"",reps:""},{kg:"",reps:""}]},{id:"oe3",name:"Pec deck",reps:"8–12",kg:"",sets:[{kg:"",reps:""}]}]});renderMuscu();
      const e=M().sessions.find(s=>s.id==="old1").exercises;return JSON.stringify(e.map(x=>x.sets.map(s=>s.kg+"/"+s.reps).join(",")))});
      if(r!==JSON.stringify(["12/10,14/8,/","20/10,20/10","/"]))err("migration des séries : "+r)}
    // notes : glisser une note puis un dossier dans un dossier
    await pg.evaluate(()=>{data.noteFolders=[{id:"fA",name:"Master 2",parent:null},{id:"fB",name:"Cours",parent:null}];data.notes=[{id:"n1",title:"Finance",body:"x",createdAt:new Date().toISOString(),upd:Date.now()}];save();show("notes");noteDir=null;renderNotes()});
    await pg.waitForTimeout(300);await shot(pg,"v41-notes-glisser");
    const drag=async(src,dst)=>{const a=await pg.locator(src).boundingBox(),c=await pg.locator(dst).boundingBox();
      await pg.mouse.move(a.x+a.width/2,a.y+a.height/2);await pg.mouse.down();await pg.mouse.move(c.x+c.width/2,c.y+c.height/2,{steps:8});await pg.mouse.up();await pg.waitForTimeout(250)};
    await pg.evaluate(()=>document.querySelector('[data-nfopen="fB"]').scrollIntoView({block:"center"}));await pg.waitForTimeout(150); // v47 : le champ Claude en haut de Notes décale la liste
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
    if(await pg.evaluate(()=>document.documentElement.dataset.theme)!=="dark")err("le thème sombre n'est pas le thème par défaut");
    if(nm==="pc"){if(!(await pg.isVisible("#side")))err("barre latérale absente");
      await pg.click("#side .side-tog");await pg.waitForTimeout(200);if(await pg.isVisible("#side")||!(await pg.isVisible("#sideShow")))err("la barre latérale ne se masque pas");
      await pg.reload();await pg.waitForTimeout(2600);if(await pg.isVisible("#side"))err("le choix « barre masquée » n'est pas gardé");
      await pg.click("#sideShow");await pg.waitForTimeout(200);if(!(await pg.isVisible("#side")))err("la barre latérale ne revient pas")}
    else{if(await pg.isVisible("#side"))err("tablette : barre latérale ouverte par défaut");
      await pg.click("#sideShow");await pg.waitForTimeout(200);if(!(await pg.isVisible("#side")))err("tablette : la barre latérale ne s'ouvre pas");await shot(pg,"v43-tablette-barre")}
    await pg.evaluate(()=>show("home"));await pg.click('#homeBody [data-gapp="sport"]');await pg.waitForTimeout(400);
    if(!(await pg.isVisible("#appIntro")))err("pas d'animation à l'ouverture de sid'fit");else{await shot(pg,"v43-"+nm+"-animation-fit");
      await pg.mouse.click(400,300);await pg.waitForTimeout(300);if(await pg.isVisible("#appIntro"))err("un clic ne passe pas l'animation")}
    if(await pg.evaluate(()=>data.ui.view)!=="nutri")err("sid'fit ne s'ouvre pas sur Nutrition après l'animation");
    await shot(pg,"v43-"+nm+"-muscu");await ctx.close()}
  // --- v43 lot 3 : Aujourd'hui = une section par app (nom, couleur, « Ouvrir »), dossiers récents dans sid'note
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("v43 Aujourd'hui : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43home@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{data.noteFolders=[{id:"fh1",name:"Cours",createdAt:new Date().toISOString()}];data.notes=[{id:"nh1",title:"Chapitre",body:"x",folder:"fh1",createdAt:new Date().toISOString(),upd:Date.now()}];save();show("home")});await pg.waitForTimeout(200);
    // v44.7 : 3 grandes cartes (nom, description d'une ligne, au plus 2 repères), toucher = ouvrir l'app
    const secs=await pg.$$eval("#homeBody .hc",x=>x.map(e=>e.dataset.app).join(","));if(secs!=="agenda,fit,note")err("cartes attendues agenda,fit,note : "+secs);
    if(await pg.$$eval("#homeBody .hc",x=>x.some(c=>!c.querySelector(".hc-desc").textContent.trim()||c.querySelectorAll(".hc-it").length>2)))err("carte sans description ou avec plus de 2 repères");
    if(!(await pg.textContent('#homeBody .hc[data-app="note"]')).includes("Chapitre"))err("dernière note absente de la carte sid'note");
    // v44.7 : nouvelles icônes des apps (site/icons/*.svg) : vraiment chargées
    await pg.waitForTimeout(300);if(await pg.$$eval("#homeBody .hc img.logo",x=>x.length!==3||x.some(i=>!i.complete||!i.naturalWidth)))err("icônes des apps non chargées");
    await shot(pg,"v447-aujourdhui");
    await pg.setViewportSize({width:1280,height:800});await pg.waitForTimeout(200);await shot(pg,"v447-aujourdhui-pc");await pg.setViewportSize({width:390,height:664});
    await pg.click('#homeBody .hc[data-app="fit"]');await pg.waitForTimeout(250);if(await pg.evaluate(()=>appOf(data.ui.view))!=="fit")err("la carte sid'fit n'ouvre pas sid'fit");
    await ctx.close()}
  // --- v43 lot 4 : « Créer avec Claude » envoie toutes les réponses + remarques libres ; le programme de l'app sert de base
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1440,height:900}}],["tablette",{...devices["iPad (gen 7)"]}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v43 programme "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v43co"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>show("muscu"));await pg.click('#coachBox [data-coach="new"]');await pg.waitForTimeout(200);await shot(pg,"v43-"+nm+"-programme-questions");
    await pg.fill("#cfNotes","je veux faire abdos tous les jours");await pg.fill("#cfAvoidTxt","poignet droit");
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
    // v44.2 : l'anneau des calories garde sa taille (il partageait les styles de l'ancien chrono)
    {const rg=await pg.evaluate(()=>{const b=document.querySelector(".nu-ring").getBoundingClientRect(),t=document.querySelector(".nu-ring-txt").getBoundingClientRect();return [b.width,b.height,t.height]});
      if(rg[0]<100||rg[1]<100||rg[2]>rg[1]+1)err("anneau des calories mal affiché : "+rg)}
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
    // la petite fenêtre ouverte pour Claude est refermée au retour dans Sid'compagnon (sur iPhone, elle restait blanche)
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
    await pg.evaluate(()=>{show("muscu");coachOpen()});await pg.fill("#cfNotes","abdos tous les jours");await pg.fill("#cfAvoidTxt","poignet");
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
      const m=data.muscu;return{days:!!m.plan.days,v:m.plan.v,ses:m.sessions.map(s=>s.name+":"+s.exercises.map(e=>e.sets.length+"/"+(e.reps||"")+"/"+(e.rest||"")).join(",")).join(" | "),next:coachNext()&&coachNext().id,cards:document.querySelectorAll("#msList .ms").length,kg:m.sessions[0].exercises[0].sets[1].kg,kg1:m.sessions[0].exercises[0].kg}});
    // v44.7 : les séries gardent leurs valeurs (une ligne par série), rien n'est recopié ailleurs
    if(mg.days||mg.v!==2||mg.ses!=="Push libre:2// | Séance A:4/6–10/180 | Séance B:3/8–12/120"||mg.next!=="d2"||mg.cards!==3||mg.kg!=="22,5"||mg.kg1!==undefined)err("migration : "+JSON.stringify(mg));
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
  // --- v44.4 : barre du bas, ouverture des apps, liste des dates, sortie animée, repas des jours passés, séance supprimée d'un coup, précisions ouvertes
  {const ctx=await b.newContext({...devices["iPhone 13"],intro:true}),pg=await ctx.newPage(),err=m=>errs.push("v44.4 : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v444@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{window.__noIntro=true;const y=new Date().getFullYear()+1;for(let i=0;i<14;i++)data.tasks.push({id:"p"+i,title:"Activité "+i,date:`${y}-${String(1+i%12).padStart(2,"0")}-${String(3+i).padStart(2,"0")}`,time:i%2?"08:00":"",status:"à faire",cat:"Perso"});
      data.ui.glast={orga:"todo",sport:"muscu",perso:"docs"};data.ui.filter="Toutes";save();renderPlan()});
    // ouverture : sid'agenda → Agenda, sid'fit → Nutrition (même si une autre fonction était ouverte avant)
    await pg.evaluate(()=>openGroup("orga"));if(await pg.evaluate(()=>data.ui.view)!=="plan")err("sid'agenda ne s'ouvre pas sur Agenda");
    // v44.6 : mois repliés à l'ouverture, même après « Tout déplier »
    await pg.click("[data-mfoldall]");await pg.waitForTimeout(100);await pg.evaluate(()=>{show("home");openGroup("orga")});await pg.waitForTimeout(100);
    if(await pg.$$eval("#tasks [data-mfold][aria-expanded='true']",x=>x.length))err("des mois sont ouverts à l'ouverture");
    await pg.click("[data-mfoldall]");await pg.waitForTimeout(100);
    if(!(await pg.$$eval("#tasks .prow .pr-date",x=>x.length)))err("nouvelles lignes de dates absentes");
    await pg.click('#tasks [data-tmore2="p0"]');await pg.waitForTimeout(150);if(!(await pg.isVisible("#actSheet")))err("« ⋯ » n'ouvre pas les actions de l'activité");
    await pg.click("#actClose");await pg.waitForTimeout(100);
    // barre du bas : collée en bas après défilement
    await pg.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await pg.waitForTimeout(300);
    {const r=await pg.evaluate(()=>{const n=document.querySelector("nav").getBoundingClientRect();return [n.bottom,innerHeight,n.height]});if(Math.abs(r[0]-r[1])>1||r[2]<40)err("barre du bas pas collée en bas : "+r)}
    await shot(pg,"v444-agenda-liste");
    await pg.evaluate(()=>window.scrollTo(0,0));await pg.locator("#tasks").scrollIntoViewIfNeeded();await shot(pg,"v444-agenda-liste-haut");
    // sortie animée vers Sid'compagnon
    await pg.evaluate(()=>{window.__noIntro=false;show("home")});await pg.waitForTimeout(150);if(!(await pg.isVisible("#appOutro")))err("pas d'animation de sortie");
    await pg.waitForTimeout(450);await shot(pg,"v444-sortie");await pg.waitForTimeout(1300);if(await pg.$("#appOutro"))err("l'animation de sortie ne disparaît pas");
    await pg.evaluate(()=>{window.__noIntro=true});
    await pg.evaluate(()=>openGroup("sport"));if(await pg.evaluate(()=>data.ui.view)!=="nutri")err("sid'fit ne s'ouvre pas sur Nutrition");
    // repas d'un jour passé : jour choisi dans « Ajouter ce que tu manges », dit à Claude
    await pg.evaluate(()=>{data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2000,text:"",warn:[]},upd:Date.now(),log:[]};save();renderNutri()});
    await pg.click('#nuFor [data-nufor="-1"]');await pg.waitForTimeout(100);
    {const r=await pg.evaluate(()=>{const y=new Date(today());y.setDate(y.getDate()-1);return [nuDay===iso(y),aiPrompt("aliment",{text:"pâtes 200 g"}).includes(iso(y)),$("nuForTxt").textContent]});
      if(!r[0])err("le jour du repas ne recule pas");if(!r[1])err("le message à Claude ne donne pas le jour passé");}
    await pg.evaluate(()=>{nuAddItems([{name:"Pâtes",qty:"200 g",kcal:300,p:10,c:60,f:2}],null,null)});
    if(!(await pg.evaluate(()=>{const y=new Date(today());y.setDate(y.getDate()-1);return NU().log.some(x=>x.day===iso(y)&&x.name==="Pâtes")})))err("repas non ajouté au jour passé");
    await pg.locator("#nuAddBox").scrollIntoViewIfNeeded();await shot(pg,"v444-nutrition-jour-passe");
    // séance supprimée d'un coup (poubelle dans l'en-tête, 2 appuis)
    await pg.evaluate(()=>{M().sessions.push({id:"sx",name:"Séance test",upd:Date.now(),exercises:[{id:"e1",name:"Curl poulie",sets:[{kg:"",reps:""},{kg:"",reps:""}]},{id:"e2",name:"Face pull",sets:[{kg:"",reps:""}]}]});save();show("muscu");renderMuscu()});await pg.waitForTimeout(200);
    await pg.locator('[data-ms="sx"] .ms-del').scrollIntoViewIfNeeded();await pg.click('[data-ms="sx"] .ms-del');await pg.waitForTimeout(100);
    if(!(await pg.evaluate(()=>M().sessions.some(x=>x.id==="sx"))))err("la séance est supprimée sans confirmation");
    if(await pg.evaluate(()=>document.querySelector('[data-ms="sx"]').open))err("la poubelle ouvre la séance");
    await shot(pg,"v444-seance-suppr");
    await pg.click('[data-ms="sx"] .ms-del');await pg.waitForTimeout(200);if(await pg.evaluate(()=>M().sessions.some(x=>x.id==="sx")))err("la séance n'est pas supprimée");
    // « Tes précisions » ouvert d'emblée
    await pg.evaluate(()=>coachOpen());await pg.waitForTimeout(200);if(!(await pg.isVisible("#cfNotes")))err("« Tes précisions » n'est pas ouvert");
    await pg.locator("#cfNotes").scrollIntoViewIfNeeded();await shot(pg,"v444-programme-precisions");
    await ctx.close()}
  // --- v44.7 : la dernière ligne de chaque page reste visible au-dessus de la barre du bas (iPhone et PC barre latérale masquée) ; infobulle des graphiques
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:720}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v44.7 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v447"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{data.ui.sideOff=1;saveUI();if(typeof sideApply==="function")sideApply();const y=new Date().getFullYear()+1;for(let i=0;i<12;i++)data.tasks.push({id:"q"+i,title:"Activité "+i,date:`${y}-${String(1+i).padStart(2,"0")}-10`,status:"à faire",cat:"Perso"});
      M().sessions.push({id:"big",name:"Grosse séance",upd:Date.now(),exercises:Array.from({length:8},(_,i)=>({id:"x"+i,name:"Exercice "+i,ps:1,sets:[{kg:"",reps:""},{kg:"",reps:""},{kg:"",reps:""}]}))});save();openGroup("orga");renderPlan()});
    await pg.waitForTimeout(300);await pg.click("[data-mfoldall]");await pg.waitForTimeout(200);
    const lastVis=async sel=>pg.evaluate(s=>{window.scrollTo(0,document.documentElement.scrollHeight);const els=document.querySelectorAll(s),l=els[els.length-1],n=document.querySelector("nav");if(!l)return "absent";
      const r=l.getBoundingClientRect(),top=n&&getComputedStyle(n).display!=="none"&&!n.hidden?n.getBoundingClientRect().top:innerHeight;return r.bottom<=top+1?"ok":`${Math.round(r.bottom)} > ${Math.round(top)}`},sel);
    await pg.waitForTimeout(300);{const r=await lastVis("#tasks .prow");if(r!=="ok")err("dernière date cachée par la barre du bas : "+r)}
    await shot(pg,"v447-"+nm+"-agenda-bas");
    await pg.evaluate(()=>{show("muscu");msOpenId="big";renderMuscu()});await pg.waitForTimeout(300);
    {const r=await lastVis("#v-muscu .ms-actions");if(r!=="ok")err("bas de la séance caché par la barre du bas : "+r)}
    await shot(pg,"v447-"+nm+"-muscu-bas");
    // graphiques : l'infobulle disparaît quand on fait défiler ou qu'on touche ailleurs
    await pg.evaluate(()=>{const d=new Date();data.nutri={consent:"x",profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2000,text:"",warn:[]},upd:Date.now(),
      log:[0,1,2,3].map(i=>{const x=new Date(d);x.setDate(x.getDate()-i);return{id:"g"+i,day:iso(x),at:x.toISOString(),name:"Repas",kcal:1800,p:100,c:200,f:60,upd:1}}),weights:[],weeks:[]};save();show("graph")});
    await pg.waitForTimeout(400);
    const svg=pg.locator("#v-graph svg").first();await svg.scrollIntoViewIfNeeded();const bx=await svg.boundingBox();
    if(!bx)err("graphique absent");else{
      await pg.evaluate(()=>{$("toast").hidden=true}); // le message de bienvenue ne doit pas recouvrir le graphique pendant le test
      await pg.mouse.move(bx.x+bx.width*0.6,bx.y+bx.height*0.5);await pg.mouse.down();await pg.mouse.up();await pg.waitForTimeout(150);
      if(!(await pg.isVisible("#grTip")))err("l'infobulle ne s'affiche pas au toucher");
      if(await pg.isVisible("#grTip")){await pg.evaluate(()=>window.scrollBy(0,40));await pg.waitForTimeout(200);if(await pg.isVisible("#grTip"))err("l'infobulle reste après le défilement")}
      await pg.mouse.move(bx.x+bx.width*0.6,bx.y+bx.height*0.5);await pg.mouse.down();await pg.mouse.up();await pg.waitForTimeout(150);
      if(await pg.isVisible("#grTip")){await pg.mouse.click(5,Math.max(5,bx.y-60));await pg.waitForTimeout(150);if(await pg.isVisible("#grTip"))err("l'infobulle reste après un toucher ailleurs")}}
    await ctx.close()}
  // --- v44.7 : PDF de cours dans sid'note : import, zone de texte, surligneur, notes liées ; retrouvés à la réouverture et après rechargement
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v44.7 PDF "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v447pdf"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{NF().push({id:"fc",name:"Finance",parent:null,createdAt:new Date().toISOString()});save();show("notes");noteDir="fc";renderNotes()});await pg.waitForTimeout(200);
    await pg.setInputFiles("#pdfIn",path.join(__dirname,"fixtures","cours.pdf"));
    await pg.waitForFunction(()=>!$("pdfv").hidden&&document.querySelectorAll("#pvBody .pv-page canvas").length>0,null,{timeout:15000}).catch(()=>err("le PDF ne s'affiche pas"));
    const nid=await pg.evaluate(()=>pv.note);
    if(await pg.evaluate(id=>{const n=noteFind(id);return !(n&&n.pdf&&n.folder==="fc"&&n.pdf.pages===2)},nid))err("note PDF mal créée (dossier, pages)");
    await shot(pg,"v447-"+nm+"-pdf-ouvert");
    // zone de texte
    await pg.click('[data-pvt="text"]');const p1=pg.locator('#pvBody .pv-page[data-pg="1"] .pv-ov');const bb=await p1.boundingBox();
    await pg.mouse.click(bb.x+bb.width*0.5,bb.y+bb.height*0.2);await pg.waitForTimeout(150);
    await pg.keyboard.type("À revoir pour l'examen");await pg.waitForTimeout(700);
    // surligneur
    await pg.click('[data-pvt="hl"]');await pg.waitForTimeout(150);{const b2=await p1.boundingBox();bb.x=b2.x;bb.y=b2.y}await pg.mouse.move(bb.x+bb.width*0.1,bb.y+bb.height*0.12);await pg.mouse.down();await pg.mouse.move(bb.x+bb.width*0.6,bb.y+bb.height*0.14,{steps:6});await pg.mouse.up();await pg.waitForTimeout(200);
    // notes liées
    await pg.click('[data-pvt="notes"]');await pg.fill("#pvNoteTxt","Formule de l'actualisation");await pg.waitForTimeout(700);
    await shot(pg,"v447-"+nm+"-pdf-annote");
    const st=await pg.evaluate(id=>{const a=pvAnns(id);return [a.filter(x=>x.t==="text"&&x.txt==="À revoir pour l'examen").length,a.filter(x=>x.t==="ink"&&x.hl&&x.pts.length>1).length,noteFind(id).body]},nid);
    if(st[0]!==1)err("zone de texte pas enregistrée");if(st[1]!==1)err("surlignage pas enregistré");if(st[2]!=="Formule de l'actualisation")err("notes liées pas enregistrées");
    // fermeture, liste, réouverture
    await pg.click("#pvBack");await pg.waitForTimeout(200);
    if(!(await pg.textContent("#noteList")).includes("PDF"))err("badge PDF absent de la liste");
    await pg.click(`#noteList [data-note="${nid}"]`);await pg.waitForFunction(()=>document.querySelectorAll("#pvBody path.ink-hl").length===1&&document.querySelectorAll("#pvBody .pv-txt").length===1,null,{timeout:10000}).catch(()=>err("annotations pas retrouvées à la réouverture"));
    // après synchro et rechargement (comme un autre appareil) : tout est là, fichier compris
    await pg.waitForTimeout(2500);if(!(await pg.evaluate(id=>noteFind(id).pdf.up,nid)))err("PDF pas envoyé en ligne");
    await pg.evaluate(()=>{pvClose()});await pg.reload();await pg.waitForTimeout(2500);
    await pg.evaluate(id=>{idb.del(pdfKey(id))},nid);await pg.waitForTimeout(200); // fichier absent de l'appareil : relu en ligne
    await pg.evaluate(id=>{show("notes");pdfOpen(id)},nid);
    await pg.waitForFunction(()=>document.querySelectorAll("#pvBody .pv-page canvas").length>0&&document.querySelectorAll("#pvBody path.ink-hl").length===1,null,{timeout:15000}).catch(()=>err("PDF ou annotations perdus après rechargement"));
    if(await pg.inputValue("#pvNoteTxt")!=="Formule de l'actualisation")err("notes liées perdues après rechargement");
    // suppression d'un surlignage (toucher → Supprimer, annulable)
    await pg.click('[data-pvt="read"]');await pg.waitForTimeout(400);{const r=await pg.evaluate(()=>{const p=document.querySelector("#pvBody path.ink-hl"),l=p.getTotalLength(),pt=p.getPointAtLength(l/2),m=p.getScreenCTM();return [pt.x*m.a+m.e,pt.y*m.d+m.f]});await pg.mouse.click(r[0],r[1])}await pg.waitForTimeout(150);await pg.click('#actList .act-it.danger');await pg.click('#actList .act-it.danger').catch(()=>{});await pg.waitForTimeout(250);
    if(await pg.evaluate(id=>pvAnns(id).some(a=>a.t==="ink"&&a.hl),nid))err("surlignage pas supprimé");
    await ctx.close()}
  // --- v44.7 : fiche « comment faire » des exercices ; supprimer une note depuis la liste ; le micro d'une note écrit dans la note
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v44.7 b "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    // fausse reconnaissance vocale : « bonjour le cours » dès le départ
    await pg.addInitScript(()=>{window.SpeechRecognition=window.webkitSpeechRecognition=class{start(){const R=t=>Object.assign([{transcript:t}],{isFinal:true});setTimeout(()=>this.onresult&&this.onresult({resultIndex:0,results:[R("bonjour le cours")]}),50);
      setTimeout(()=>this.onresult&&this.onresult({resultIndex:1,results:[R("bonjour le cours"),R(" et la suite")]}),1100)}stop(){setTimeout(()=>this.onend&&this.onend(),10)}}});
    await pg.goto(U);await pg.waitForTimeout(800);await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v447b"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{M().sessions.push({id:"hx",name:"Haut",upd:Date.now(),exercises:[{id:"hx1",name:"Développé couché haltères",ps:1,sets:[{kg:"",reps:""}]},{id:"hx2",name:"Mon exo inventé",ps:1,sets:[{kg:"",reps:""}]}]});msOpenId="hx";save();show("muscu");renderMuscu()});await pg.waitForTimeout(300);
    if(!(await pg.isVisible('[data-ex="hx1"] [data-exhelp]')))err("pas de bouton « ? » sur un exercice de la liste");
    if(await pg.isVisible('[data-ex="hx2"] [data-exhelp]'))err("bouton « ? » sur un exercice sans fiche");
    await pg.click('[data-ex="hx1"] [data-exhelp]');await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#exHelpSheet"))||(await pg.$$eval("#exHelpBody .exh-steps li",x=>x.length))!==3)err("fiche de l'exercice incomplète");
    await shot(pg,"v447-"+nm+"-exo-aide");await pg.click("#exHelpClose");
    await pg.fill('[data-ex="hx2"] [data-f="exname"]',"pec deck");await pg.waitForTimeout(100);
    if(!(await pg.isVisible('[data-ex="hx2"] [data-exhelp]')))err("le « ? » n'apparaît pas après avoir tapé un exercice connu");
    // notes : ⋯ dans la liste → Supprimer (annulable), sans ouvrir la note
    await pg.evaluate(()=>{data.notes=[{id:"nd1",title:"À jeter",body:"x",createdAt:new Date().toISOString(),upd:Date.now()},{id:"nd2",title:"À garder",body:"y",createdAt:new Date().toISOString(),upd:Date.now()-1000}];save();show("notes");noteDir=null;renderNotes()});await pg.waitForTimeout(200);
    await shot(pg,"v447-"+nm+"-notes-liste");
    await pg.click('[data-nmore="nd1"]');await pg.waitForTimeout(150);await pg.click("#actList .act-it.danger");await pg.click("#actList .act-it.danger");await pg.waitForTimeout(250);
    if(!(await pg.textContent("#toast")).includes("Note supprimée"))err("pas de toast « Note supprimée » (annulable)");
    if(await pg.evaluate(()=>!!noteFind("nd1")||!noteFind("nd2")||!!noteOpenId))err("suppression depuis la liste : mauvaise note ou note ouverte");
    // micro : plus de micro à côté du titre ; celui de l'en-tête écrit dans le texte de la note
    await pg.click('[data-note="nd2"]');await pg.waitForTimeout(200);
    if(await pg.$("#noteTitle + .nu-mic"))err("micro encore à côté du titre");
    await pg.click("#noteMic");await pg.waitForTimeout(1500);await pg.click("#noteMic");await pg.waitForTimeout(700);
    const nv=await pg.evaluate(()=>{const n=noteFind("nd2");return [n.title,n.body]});
    if(nv[0]!=="À garder"||!nv[1].includes("bonjour le cours et la suite"))err("dictée : "+JSON.stringify(nv));
    await ctx.close()}
  // --- v45 : Sid'compagnon, sombre par défaut, calendriers superposés (dont un privé), photos des exercices, série 1 sur toutes, annotation des PDF
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v45 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    if(!(await pg.title()).includes("Sid'compagnon"))err("titre de la page pas renommé");
    if((await pg.content()).includes("Sid'home"))err("« Sid'home » encore présent dans la page");
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v45"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(await pg.evaluate(()=>document.documentElement.dataset.theme)!=="dark")err("pas en sombre par défaut");
    if(nm==="pc"){await pg.evaluate(()=>{data.ui.sideOff=false;sideApply()});await pg.waitForTimeout(200);
      const sb=await pg.evaluate(()=>{const s=document.querySelector(".side-brand span"),r=s.getBoundingClientRect(),t=document.querySelector(".side-tog").getBoundingClientRect();return [Math.round(r.height),s.scrollWidth>s.clientWidth+1,r.right>t.left+1]});
      if(sb[0]>30||sb[1]||sb[2])err("« Sid'compagnon » coupé ou trop large dans la barre latérale : "+sb)}
    // calendriers : 3 calendriers, dont un privé (identifiant), superposés ; masquer / afficher
    await pg.evaluate(()=>{show("plan");$("moreOpts").open=true});await pg.waitForTimeout(200);
    const addCal=async(name,url,u,pw)=>{await pg.fill("#icalName",name);await pg.fill("#icalUrl",url);if(u){await pg.evaluate(()=>$("icalPriv").open=true);await pg.fill("#icalUser",u);await pg.fill("#icalPass",pw)}await pg.click("#icalSave");await pg.waitForTimeout(700)};
    await addCal("Cours","https://ecole.test/cours.ics");await addCal("Travail","https://boulot.test/travail.ics");await addCal("Perso","https://cloud.test/prive.ics","moi","pw");
    const cs=await pg.evaluate(()=>({n:CALS().length,cols:new Set(CALS().map(c=>c.c)).size,ev:[...new Set(icalEvents.map(e=>e.cat))].sort().join(","),auth:!!icalAuth(CALS()[2].id),inData:JSON.stringify(data).includes('"pw"')}));
    if(cs.n!==3||cs.cols!==3)err("calendriers : "+JSON.stringify(cs));
    if(cs.ev!=="Cours,Perso,Travail")err("calendriers pas superposés : "+cs.ev);
    if(!cs.auth||cs.inData)err("identifiant du calendrier privé mal gardé (doit rester sur l'appareil)");
    if(await pg.$$eval("#calLegend .cal-pill",x=>x.length)!==3)err("pas de pastilles des calendriers au-dessus du calendrier");
    await pg.click('#calLegend [data-calon2]:nth-child(2)');await pg.waitForTimeout(200);
    if(await pg.evaluate(()=>icalEvents.some(e=>e.cat==="Travail")))err("masquer un calendrier ne le cache pas");
    await pg.locator("#calList").scrollIntoViewIfNeeded();await shot(pg,"v45-"+nm+"-calendriers");
    await pg.click('#calLegend [data-calon2]:nth-child(2)');await pg.waitForTimeout(400);
    if(!(await pg.evaluate(()=>icalEvents.some(e=>e.cat==="Travail"))))err("réafficher un calendrier ne marche pas");
    // ancien format (un seul lien) : repris comme 1er calendrier
    if(await pg.evaluate(()=>{const p=data.prefs;const keep=p.icals;delete p.icals;p.ical="https://ancien.test/a.ics";const l=CALS();const ok=l.length===1&&l[0].url==="https://ancien.test/a.ics";p.icals=keep;p.ical=keep[0].url;return !ok}))err("ancien lien iCal pas repris");
    // v45.3 : ajouter une activité en la disant à Claude (comme Nutrition) ; la recherche est derrière la loupe
    await pg.evaluate(()=>{show("plan");window.scrollTo(0,0)});await pg.waitForTimeout(200);
    if(await pg.isVisible("#planSearch"))err("la recherche est encore affichée d'office dans l'agenda");
    await pg.fill("#plAsk","Dentiste jeudi à 14h, type Santé");await shot(pg,"v45-"+nm+"-agenda-claude");await pg.click("#plAskBtn");await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#aiAskSheet")))err("« Ajouter avec Claude » n'ouvre pas la fenêtre vers Claude");
    {const pr=await pg.textContent("#aaPrompt");if(!pr.includes("Dentiste jeudi à 14h")||!pr.includes("ajouter_activite"))err("message pour Claude incomplet : "+pr)}
    if(await pg.inputValue("#plAsk"))err("le champ n'est pas vidé après l'envoi");
    await pg.evaluate(()=>{$("aiAskSheet").hidden=true});
    await pg.click("#planSearchBtn");if(!(await pg.isVisible("#planSearch")))err("la loupe n'ouvre pas la recherche");
    await pg.fill("#planSearch","zzz");await pg.waitForTimeout(150);await pg.click("#planSearchBtn");
    if(await pg.evaluate(()=>planQ))err("refermer la recherche ne l'efface pas");
    await shot(pg,"v45-"+nm+"-agenda");
    // musculation : photos dans la fiche, série 1 sur toutes
    await pg.evaluate(()=>{M().sessions.push({id:"s45",name:"Haut",upd:Date.now(),exercises:[{id:"e45",name:"Développé couché haltères",ps:1,sets:[{kg:"",reps:""},{kg:"",reps:""},{kg:"",reps:""}]}]});msOpenId="s45";save();show("muscu");renderMuscu()});await pg.waitForTimeout(300);
    await pg.fill('[data-ex="e45"] .set-row:first-child [data-f="setkg"]',"34");await pg.fill('[data-ex="e45"] .set-row:first-child [data-f="setreps"]',"8");await pg.waitForTimeout(600);
    await pg.click('[data-ex="e45"] [data-mscopy1]');await pg.waitForTimeout(250);
    if(await pg.evaluate(()=>M().sessions.find(s=>s.id==="s45").exercises[0].sets.map(x=>x.kg+"/"+x.reps).join())!=="34/8,34/8,34/8")err("série 1 pas recopiée");
    await pg.locator('[data-ex="e45"]').scrollIntoViewIfNeeded();await shot(pg,"v45-"+nm+"-serie1");
    await pg.click('[data-ex="e45"] [data-exhelp]');await pg.waitForTimeout(300);
    await pg.waitForFunction(()=>[...document.querySelectorAll("#exHelpBody .exh-pics img")].length===2&&[...document.querySelectorAll("#exHelpBody .exh-pics img")].every(i=>i.complete&&i.naturalWidth>0),null,{timeout:8000}).catch(()=>err("photos de l'exercice absentes"));
    await shot(pg,"v45-"+nm+"-exo-photos");await pg.click("#exHelpClose");
    // PDF : le mode Texte reste actif ; zone de texte supprimable et redimensionnable ; stylo ; surligneur couleur + épaisseur ; gomme
    await pg.evaluate(()=>{show("notes");noteDir=null;renderNotes()});await pg.waitForTimeout(200);
    await pg.setInputFiles("#pdfIn",path.join(__dirname,"fixtures","cours.pdf"));
    await pg.waitForFunction(()=>!$("pdfv").hidden&&document.querySelectorAll("#pvBody .pv-page canvas").length>0,null,{timeout:15000}).catch(()=>err("PDF pas affiché"));
    const nid=await pg.evaluate(()=>pv.note);const ov=pg.locator('#pvBody .pv-page[data-pg="1"] .pv-ov');let bb=await ov.boundingBox();
    await pg.click('[data-pvt="text"]');await pg.mouse.click(bb.x+bb.width*.2,bb.y+bb.height*.15);await pg.waitForTimeout(150);await pg.keyboard.type("salut je prend note");await pg.waitForTimeout(600);
    await pg.mouse.click(bb.x+bb.width*.2,bb.y+bb.height*.5);await pg.waitForTimeout(150);
    if(await pg.evaluate(()=>pv.tool)!=="text")err("le mode Texte ne reste pas actif après un clic sur la page");
    await pg.keyboard.type("deuxième");await pg.waitForTimeout(600);
    const tid=await pg.evaluate(id=>pvAnns(id).find(a=>a.t==="text"&&a.txt==="salut je prend note").id,nid);
    // redimensionner (coin) puis supprimer (×)
    const w0=await pg.evaluate(id=>PA().find(a=>a.id===id).w,tid);
    const rs=await pg.locator(`[data-pvrs="${tid}"]`).boundingBox();await pg.mouse.move(rs.x+rs.width/2,rs.y+rs.height/2);await pg.mouse.down();await pg.mouse.move(rs.x+rs.width/2+bb.width*.15,rs.y+rs.height/2+bb.height*.05,{steps:6});await pg.mouse.up();await pg.waitForTimeout(200);
    const sz=await pg.evaluate(id=>{const a=PA().find(x=>x.id===id);return [a.w,a.h||0]},tid);if(!(sz[0]>w0+.1&&sz[1]>0))err("zone de texte pas redimensionnée : "+sz);
    await shot(pg,"v45-"+nm+"-pdf-texte");
    await pg.click(`[data-pvdel="${tid}"]`);await pg.waitForTimeout(250);
    if(await pg.evaluate(id=>PA().some(a=>a.id===id),tid))err("× ne supprime pas la zone de texte");
    // stylo
    await pg.click('[data-pvt="pen"]');if(!(await pg.isVisible("#pvOpts")))err("pas de réglages du stylo");
    await pg.click('#pvOpts [data-pvc="#D62828"]');await pg.waitForTimeout(150);bb=await ov.boundingBox();
    await pg.mouse.move(bb.x+bb.width*.3,bb.y+bb.height*.4);await pg.mouse.down();for(let i=1;i<=8;i++)await pg.mouse.move(bb.x+bb.width*(.3+i*.03),bb.y+bb.height*(.4+(i%2?.02:-.02)));await pg.mouse.up();await pg.waitForTimeout(200);
    // surligneur : couleur verte, épaisseur max
    await pg.click('[data-pvt="hl"]');await pg.click('#pvOpts [data-pvc="#7CE07C"]');await pg.evaluate(()=>{const r=$("pvSize");r.value=10;r.dispatchEvent(new Event("input",{bubbles:true}))});
    await pg.waitForTimeout(150);bb=await ov.boundingBox();await pg.mouse.move(bb.x+bb.width*.1,bb.y+bb.height*.25);await pg.mouse.down();await pg.mouse.move(bb.x+bb.width*.6,bb.y+bb.height*.25,{steps:8});await pg.mouse.up();await pg.waitForTimeout(200);
    const ink=await pg.evaluate(id=>pvAnns(id).filter(a=>a.t==="ink").map(a=>[a.hl,a.c,a.w,a.pts.length]),nid);
    if(!ink.some(x=>!x[0]&&x[1]==="#D62828"&&x[3]>3))err("trait au stylo pas enregistré : "+JSON.stringify(ink));
    if(!ink.some(x=>x[0]&&x[1]==="#7CE07C"&&x[2]>.05))err("surligneur (couleur / épaisseur) pas enregistré : "+JSON.stringify(ink));
    await shot(pg,"v45-"+nm+"-pdf-dessin");
    // gomme : on passe sur le trait du stylo
    await pg.click('[data-pvt="erase"]');await pg.waitForTimeout(150);bb=await ov.boundingBox();await pg.mouse.move(bb.x+bb.width*.36,bb.y+bb.height*.33);await pg.mouse.down();await pg.mouse.move(bb.x+bb.width*.36,bb.y+bb.height*.47,{steps:8});await pg.mouse.up();await pg.waitForTimeout(250);
    if(await pg.evaluate(id=>pvAnns(id).some(a=>a.t==="ink"&&!a.hl),nid))err("la gomme n'efface pas le trait");
    if(!(await pg.evaluate(id=>pvAnns(id).some(a=>a.t==="ink"&&a.hl),nid)))err("la gomme a effacé le surlignage aussi");
    await ctx.close()}
  // --- v46 (phase 1) : « smartphone » au lieu de « iPhone », fenêtre « Modifier l'activité » sans débordement, iCal toutes les 6 h, nom du site pour Google
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}],["pc-etroit",{viewport:{width:820,height:700}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v46 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    for(const lg of ["fr","en"]){const t=await pg.evaluate(()=>document.documentElement.innerHTML);if(/iphone/i.test(t.replace(/<!--[\s\S]*?-->/g,"").replace(/<script[\s\S]*?<\/script>/g,"")))err("« iPhone » encore dans la page ("+lg+")")}
    const ld=await pg.evaluate(()=>{const x=document.querySelector('script[type="application/ld+json"]');return x?JSON.parse(x.textContent):null});
    if(!ld||ld["@type"]!=="WebSite"||ld.name!=="Sid'compagnon")err("données structurées WebSite absentes ou mauvais nom");
    if(await pg.evaluate(()=>document.body.innerHTML.includes("Sid'note</div>")))err("en-têtes « Sid'note » encore dans la page");
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v46"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(await pg.evaluate(()=>ICAL_EVERY)!==6*3600e3)err("iCal pas réglé sur 6 h");
    // beaucoup de types aux noms longs + titre long : tout doit tenir dans la fenêtre
    await pg.evaluate(()=>{["Cours magistral","Examen écrit","Sport collectif","Travail en équipe","Rendez-vous médical","Famille et amis","Projet personnel","Administration","Voyage d'affaires","Séminaire","Anniversaire","Réunion de direction"].forEach(n=>ensureType(n));
      data.tasks.push({id:"t46",title:"Réunion importante avec un titre vraiment très long pour voir si la fenêtre tient",date:iso(today()),time:"10:00",cat:"Réunion de direction",status:"à faire",leads:[10,30,60,1440,2880]});save();show("plan");openEdit("task:t46")});
    await pg.waitForTimeout(400);
    const ov=await pg.evaluate(()=>{const f=$("editForm"),fr=f.getBoundingClientRect(),bad=[...f.querySelectorAll("*")].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>fr.right+1}).map(e=>e.id||e.className||e.tagName).slice(0,4);
      const sv=[...f.querySelectorAll("button[type=submit]")][0].getBoundingClientRect();return {sw:f.scrollWidth,cw:f.clientWidth,bad,save:sv.right<=fr.right+1,page:document.documentElement.scrollWidth<=innerWidth+1}});
    if(ov.sw>ov.cw+1||ov.bad.length||!ov.save||!ov.page)err("« Modifier l'activité » déborde : "+JSON.stringify(ov));
    await shot(pg,"v46-"+nm+"-modifier-activite");
    await pg.evaluate(()=>{document.querySelectorAll(".sheet-bg").forEach(x=>x.hidden=true);syncScrollLock()});
    // --- v46.1 (phase 2) : réglages Claude = un état + une action, le reste dans « Avancé » ; une conversation par app ; « Revoir les étapes » en haut
    await pg.evaluate(()=>{window.__open=[];window.open=u=>{window.__open.push(u);return null};show("more");$("mcpSec").open=true;renderAiCards()});await pg.waitForTimeout(200);
    const st=await pg.evaluate(()=>({t:$("aiState").textContent.trim(),b:$("aiMain").textContent.trim(),adv:$("aiAdv").open,fit:!!$("fitSec")}));
    if(st.t!=="Claude n'est pas branché"||st.b!=="Brancher Claude"||st.adv||st.fit)err("réglages Claude (pas branché) : "+JSON.stringify(st));
    await shot(pg,"v461-"+nm+"-reglages-claude");
    await pg.evaluate(()=>{data.prefs.ai="claude";data.prefs.aiOk=new Date().toISOString();save();renderAiCards();convSettings("note")});await pg.waitForTimeout(400);
    if(!(await pg.isVisible("#convNote"))||!(await pg.isVisible("#convAgenda")))err("conversations sid'agenda / sid'note absentes de « Avancé »");
    if(await pg.evaluate(()=>$("aiState").textContent.trim()+"|"+$("aiMain").textContent.trim())!=="Claude est branché|Tester la connexion")err("état « branché » mal affiché");
    await shot(pg,"v461-"+nm+"-reglages-avance");
    // sans lien : nouvelle conversation qui commence par le titre de l'app ; le lien collé dans la fenêtre est gardé
    const o=await pg.evaluate(()=>{aiGo("agenda","Ajoute dentiste demain");return decodeURIComponent(window.__open.slice(-1)[0])});
    if(!o.startsWith("https://claude.ai/new?q=sid'agenda — discussion avec Claude\n\nAjoute dentiste"))err("nouvelle conversation sid'agenda sans titre : "+o);
    await pg.evaluate(()=>{show("plan");aiHandoff("Note mon cours","note")});await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#aaConvIn")))err("pas de champ pour garder la conversation sid'note");
    await shot(pg,"v461-"+nm+"-garder-conversation");
    await pg.fill("#aaConvIn","https://claude.ai/chat/3333-cccc");await pg.click(".aa-conv button");await pg.waitForTimeout(200);
    if(await pg.evaluate(()=>(data.prefs.aiConv||{}).note)!=="https://claude.ai/chat/3333-cccc"||await pg.isVisible("#aiAskSheet"))err("lien de la conversation sid'note pas gardé");
    if(await pg.evaluate(()=>aiGo("note","x",true))!=="chat"||await pg.evaluate(()=>window.__open.slice(-1)[0])!=="https://claude.ai/chat/3333-cccc")err("sid'note n'ouvre pas sa conversation");
    // l'ancien dossier Santé ne sert pas à sid'note ni à sid'agenda
    if(await pg.evaluate(()=>{data.prefs.aiProj="https://claude.ai/project/9999";return convUrl("agenda")+convUrl("muscu")})!=="https://claude.ai/project/9999")err("dossier Santé mal appliqué");
    await pg.evaluate(()=>{aiWizard()});await pg.waitForTimeout(200);
    const fb=await pg.evaluate(()=>{const f=$("aiBody").firstElementChild;return f&&f.matches(".ai-back[data-aistep=setup]")&&f.getBoundingClientRect().height>=40});
    if(!fb)err("« Revoir les étapes » pas en haut de l'assistant");
    await shot(pg,"v461-"+nm+"-assistant");
    await ctx.close()}
  // --- v47 (phase 3) : objectif et séries conseillées, séances séparées, copie d'un repas, vues semaine/mois/année, champs Claude
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v47 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v47"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{window.__open=[];window.open=u=>{window.__open.push(u);return null};data.prefs.ai="claude";data.prefs.aiOk=1});
    // musculation : un programme de 4 séances + une séance libre
    await pg.evaluate(()=>{const g={id:"g1",name:"Programme test",src:"import"},ex=(n,k)=>({id:uid(),name:n,ps:1,sets:Array.from({length:k},newSet)});
      M().sessions=[{id:"sa",name:"Push",grp:g,ord:0,upd:1,exercises:[ex("Développé couché",2),ex("Élévations latérales",3)]},{id:"sb",name:"Pull",grp:g,ord:1,upd:1,exercises:[ex("Tractions",3)]},
        {id:"sc",name:"Jambes",grp:g,ord:2,upd:1,exercises:[ex("Squat",3)]},{id:"sd",name:"Upper",grp:g,ord:3,upd:1,exercises:[ex("Rowing",3)]},{id:"sf",name:"Bras du dimanche",upd:1,exercises:[ex("Curl",3)]}];
      save();show("muscu");renderMuscu()});await pg.waitForTimeout(300);
    const t=await pg.evaluate(()=>[...document.querySelectorAll("#msList .ms")].map(d=>(d.dataset.se||"-")+":"+(d.querySelector(".se-tag b")?.textContent||"")+":"+d.classList.contains("ms-free")));
    if(t.join()!=="push:A:false,pull:B:false,legs:C:false,upper:D:false,-::true")err("séances mal séparées : "+t.join());
    if(!(await pg.isVisible("#muGoal [data-mugoal=force]")))err("objectif pas visible");
    await pg.click("#muGoal [data-mugoal=force]");await pg.waitForTimeout(200);
    await pg.evaluate(()=>{msOpenId="sa";renderMuscu()});await pg.waitForTimeout(200);
    const adv=await pg.evaluate(()=>[...document.querySelectorAll('[data-ms="sa"] .ex-adv b')].map(x=>x.textContent));
    if(adv.join("|")!=="5 × 3–5|3 × 8–10")err("séries conseillées (force) : "+adv.join("|"));
    await pg.evaluate(()=>$("msList").scrollIntoView());await shot(pg,"v47-"+nm+"-musculation");await pg.evaluate(()=>$("muGoal").scrollIntoView());await shot(pg,"v47-"+nm+"-objectif");
    await pg.click('[data-ms="sa"] [data-msadv]');await pg.waitForTimeout(200);
    const ap=await pg.evaluate(()=>{const e=msFind("sa").exercises[0];return e.sets.length+":"+e.reps});
    if(ap!=="5:3–5")err("« Appliquer » : "+ap);
    if(await pg.evaluate(()=>data.prefs.muGoal)!=="force")err("objectif pas gardé");
    // champ Claude en haut de Musculation (avec l'accord santé) et de Notes
    await pg.evaluate(()=>{data.nutri=data.nutri||{};data.nutri.consent=new Date().toISOString();save()});
    await pg.fill("#muAsk","ajoute du dos à la séance B");await pg.click("#muAskForm button[type=submit]");await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#aiAskSheet"))||!(await pg.textContent("#aaPrompt")).includes("muscu_programme"))err("demande Musculation pas envoyée");
    await pg.evaluate(()=>{$("aiAskSheet").hidden=true;show("notes")});await pg.waitForTimeout(200);
    await pg.fill("#ntAsk","résume ma note de cours");await pg.click("#ntAskForm button[type=submit]");await pg.waitForTimeout(300);
    if(!(await pg.textContent("#aaPrompt")).includes("modifier_note"))err("demande Notes pas envoyée");
    await shot(pg,"v47-"+nm+"-notes-claude");
    await pg.evaluate(()=>{$("aiAskSheet").hidden=true});
    // nutrition : un plat aujourd'hui et hier, vue mois / semaine / année, puis copie sur deux jours
    await pg.evaluate(()=>{const d=new Date(),y=new Date();y.setDate(y.getDate()-1);
      data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2000,text:"",warn:[]},upd:Date.now(),
        log:[{id:"l1",day:iso(d),at:d.toISOString(),grp:"gp",gname:"Pâtes",name:"Pâtes",qty:"200 g",kcal:1900,p:60,c:250,f:40,upd:1},{id:"l2",day:iso(d),at:d.toISOString(),grp:"gp",name:"Sauce",qty:"50 g",kcal:100,p:2,c:5,f:6,upd:1},
          {id:"l3",day:iso(y),at:y.toISOString(),name:"Salade",qty:"1",kcal:600,p:20,c:30,f:20,upd:1}],weights:[],weeks:[]};
      data.ui.nuTab="day";save();show("nutri");renderNutri()});await pg.waitForTimeout(300);
    await pg.click("#nuDayBtn");await pg.waitForTimeout(200);
    const mo=await pg.evaluate(()=>({vis:!$("nuCal").hidden,ok:document.querySelectorAll("#nuCal .nu-st.ok").length,under:document.querySelectorAll("#nuCal .nu-mgrid .nu-st.under").length}));
    if(!mo.vis||mo.ok<1||mo.under<1)err("vue mois : "+JSON.stringify(mo));
    await pg.evaluate(()=>$("nuCal").scrollIntoView());await shot(pg,"v47-"+nm+"-nutrition-mois");
    await pg.click('#nuCal [data-nurange=week]');await pg.waitForTimeout(150);
    if(await pg.locator("#nuCal .nwk-row").count()!==7)err("vue semaine : pas 7 jours");
    await pg.evaluate(()=>$("nuCal").scrollIntoView());await shot(pg,"v47-"+nm+"-nutrition-semaine");
    await pg.click('#nuCal [data-nurange=year]');await pg.waitForTimeout(150);
    if(await pg.locator("#nuCal .ym").count()!==12)err("vue année : pas 12 mois");
    const ov=await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&$("nuCal").scrollWidth<=$("nuCal").clientWidth+1);if(!ov)err("le calendrier déborde");
    await pg.evaluate(()=>$("nuCal").scrollIntoView());await shot(pg,"v47-"+nm+"-nutrition-annee");
    await pg.click('#nuCal [data-nurange=""]');
    await pg.click('#nuLog [data-nucopy="gp"]');await pg.waitForTimeout(200);
    if(!(await pg.isVisible("#nuCopySheet")))err("fenêtre de copie absente");
    const days=await pg.evaluate(()=>{const a=new Date(),b=new Date();a.setDate(a.getDate()-2);b.setDate(b.getDate()-3);return[iso(a),iso(b)]});
    for(const k of days){if(!(await pg.isVisible(`#nuCopyBody [data-nucpd="${k}"]`)))await pg.click('#nuCopyBody [data-nucpn="-1"]');await pg.click(`#nuCopyBody [data-nucpd="${k}"]`)}
    await shot(pg,"v47-"+nm+"-nutrition-copie");
    await pg.click("#nuCopyGo");await pg.waitForTimeout(200);
    const cp=await pg.evaluate(k=>k.map(d=>NU().log.filter(x=>x.day===d).map(x=>x.name+":"+x.kcal).sort().join("+")),days);
    if(cp.join("|")!=="Pâtes:1900+Sauce:100|Pâtes:1900+Sauce:100")err("copie du repas : "+cp.join("|"));
    await pg.click("#toast .toast-act");await pg.waitForTimeout(200);
    if(await pg.evaluate(k=>NU().log.some(x=>k.includes(x.day)),days))err("annuler la copie ne marche pas");
    // l'agenda garde son calendrier (grilles communes)
    await pg.evaluate(()=>{show("plan");calMode="month";renderCal()});await pg.waitForTimeout(150);
    if(await pg.locator("#calDays .day[data-day]").count()<28)err("calendrier de l'agenda cassé");
    await pg.evaluate(()=>{calMode="year";renderCal()});if(await pg.locator("#calYear .ym").count()!==12)err("vue année de l'agenda cassée");
    await ctx.close()}
  // --- v49 (phase 4) : slogan, une couleur par fonction (9 ambiances), plus d'espace, rien qui déborde
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v49 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.waitForSelector("#splash",{state:"hidden",timeout:6000}).catch(()=>{});
    if(!(await pg.isVisible("#auth .slogan"))||(await pg.textContent("#auth .slogan")).trim()!=="Ta vie, en ordre.")err("slogan absent de l'accueil");
    await shot(pg,"v49-"+nm+"-connexion");
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v49"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.waitForSelector("#splash",{state:"hidden",timeout:6000}).catch(()=>{});await pg.evaluate(()=>{const t=$("toast");if(t)t.hidden=true});
    await pg.evaluate(()=>{data.todos.push({id:"t1",title:"Payer la facture",createdAt:new Date().toISOString(),done:false},{id:"t2",title:"Réviser le chapitre 4",createdAt:new Date().toISOString(),done:false});save()});
    const seen=new Set();
    for(const v of ["plan","todo","pomo","muscu","nutri","graph","notes","docs","pwd"]){
      const r=await pg.evaluate(v=>{show(v);const cs=getComputedStyle(document.body);return {app:cs.getPropertyValue("--app").trim(),bg:cs.getPropertyValue("--bg").trim(),ov:document.documentElement.scrollWidth>innerWidth+1}},v);
      await pg.waitForTimeout(150);
      if(!r.app)err("pas de couleur pour "+v);seen.add(r.app);if(r.ov)err("la page déborde sur le côté : "+v);
      if(["plan","todo","muscu","nutri","notes"].includes(v))await shot(pg,"v49-"+nm+"-"+v)}
    if(seen.size!==9)err("les 9 fonctions n'ont pas 9 couleurs différentes : "+[...seen].join(" "));
    const h=await pg.evaluate(()=>{show("todo");const b=[...document.querySelectorAll("#v-todo .btn")].find(x=>x.offsetParent);return b?Math.round(b.getBoundingClientRect().height):48});
    if(h<44)err("bouton trop petit : "+h+" px");
    await ctx.close()}
  // --- v50 (ticket #3) : premier écran migré en TypeScript + React (calendrier de la Nutrition) : même rendu que l'ancien
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v50 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,160))});
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v50"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.waitForFunction(()=>!!window.SCIslands,null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{const d=new Date(),y=new Date();y.setDate(y.getDate()-1);
      data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2000,text:"",warn:[]},upd:Date.now(),
        log:[{id:"l1",day:iso(d),at:d.toISOString(),name:"Pâtes",kcal:1950,p:60,c:250,f:40,upd:1},{id:"l3",day:iso(y),at:y.toISOString(),name:"Salade",kcal:2400,p:20,c:30,f:20,upd:1}],weights:[],weeks:[]};
      data.ui.nuTab="day";save();show("nutri");renderNutri()});
    await pg.click("#nuDayBtn");await pg.waitForTimeout(200);
    for(const r of ["week","month","year"]){
      await pg.evaluate(r=>nuCalOpen(r),r);await pg.waitForTimeout(150);
      const res=await pg.evaluate(()=>{const box=$("nuCal"),react=Object.keys(box).some(k=>k.startsWith("__reactContainer"));
        const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.classList].sort().join(".")+"|"+(e.dataset.nuday||e.dataset.ym||e.dataset.nurange||e.dataset.nurn||"")+"|"+(e.disabled?"x":"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
        const a=norm(box);window.__noIslands=true;const old=document.createElement("div");old.id="nuCalOld";box.after(old);
        // ancien rendu dans un élément à part, pour comparer
        const keep=box.id;box.id="nuCalReact";old.id="nuCal";renderNuCal();const b=norm(old);old.remove();box.id=keep;window.__noIslands=false;
        return {react,same:a===b,a:a.split("\n").length,b:b.split("\n").length,diff:a.split("\n").find((l,i)=>l!==b.split("\n")[i])||""}});
      if(!res.react)err(r+" : pas rendu par React");
      if(!res.same)err(r+" : rendu différent de l'ancien ("+res.a+"/"+res.b+") "+res.diff);
    }
    await pg.evaluate(()=>nuCalOpen("month"));await pg.waitForTimeout(150);
    const yIso=await pg.evaluate(()=>{const y=new Date();y.setDate(y.getDate()-1);return iso(y)});
    if(await pg.isVisible(`#nuCal [data-nuday="${yIso}"]`)){await pg.click(`#nuCal [data-nuday="${yIso}"]`);await pg.waitForTimeout(200);
      if(await pg.evaluate(()=>nuDay)!==yIso)err("toucher un jour (React) n'ouvre pas ce jour")}
    await ctx.close()}
  // --- v51 (ticket #3) : Graphiques (courbes, colonnes, légendes, tableau) et résumé du Focus migrés en React : même rendu que l'ancien
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v51 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v51"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.graph),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{const log=[],weights=[];for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);if(i%4===3)continue;
        log.push({id:"g"+i,day:iso(d),at:d.toISOString(),name:"Repas",kcal:1500+(i*137)%1100,p:90+i,c:180+(i*7)%90,f:50+(i%9),upd:1});if(i%2===0)weights.push({id:"w"+i,day:iso(d),kg:80-i*0.1,upd:1})}
      data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"lose",target:76,sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2200,text:"",warn:[]},upd:Date.now(),log,weights,weeks:[]};
      P.log[dayKey(new Date())]=37*MIN;const y=new Date();y.setDate(y.getDate()-2);P.log[dayKey(y)]=95*MIN;save()});
    const norm=`el=>[el,...el.querySelectorAll("*")].slice(1).map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\\n")`;
    for(const range of [7,30]){
      const res=await pg.evaluate(([range,ns])=>{const norm=eval(ns);data.ui.grRange=range;show("graph");renderGraph();
        const ids=["grMacros","grWeight","grKcal","grTable","grMacroLeg","grKcalLeg"],out={};
        const react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));
        const a={};ids.forEach(id=>a[id]=norm($(id)));
        const saved=ids.map(id=>{const el=$(id),c=el.cloneNode(false);el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
        window.__noIslands=true;renderGraph();window.__noIslands=false;
        saved.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});
        return {react,out}},[range,norm]);
      if(!res.react)err(range+" j : graphiques pas rendus par React");
      for(const [id,d] of Object.entries(res.out))err(range+" j : "+id+" différent de l'ancien : "+d.slice(0,300));
    }
    await pg.evaluate(()=>{data.ui.grRange=7;show("graph");renderGraph()});await pg.waitForTimeout(200);
    await pg.locator("#grKcal svg").scrollIntoViewIfNeeded();await pg.waitForTimeout(200);
    const box=await pg.locator("#grKcal svg").boundingBox();
    if(box){await pg.mouse.move(box.x+box.width-30,box.y+box.height/2);await pg.waitForTimeout(150);
      if(!(await pg.isVisible("#grTip"))||!(await pg.textContent("#grTip")).includes("kcal"))err("infobulle des calories absente")}
    await shot(pg,"v51-"+nm+"-graphiques");
    const po=await pg.evaluate(([ns])=>{const norm=eval(ns);show("pomo");renderPomoStats();const el=$("pomoStats"),react=Object.keys(el).some(k=>k.startsWith("__reactContainer")),a=norm(el);
      const c=el.cloneNode(false);el.id="pomoStatsR";el.after(c);c.id="pomoStats";window.__noIslands=true;renderPomoStats();window.__noIslands=false;const b=norm(c);c.remove();el.id="pomoStats";
      return {react,same:a===b,a,b}},[norm]);
    if(!po.react)err("Focus : résumé pas rendu par React");if(!po.same)err("Focus : rendu différent : "+po.a+" <> "+po.b);
    await ctx.close()}
  // --- v52 (ticket #3) : commentaires des Graphiques, objectif de la Musculation, barres des macros : même rendu que l'ancien
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v52 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v52"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.reviews),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await pg.evaluate(()=>{const d=new Date();data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"lose",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2200,text:"",warn:[]},upd:Date.now(),
      log:[{id:"a1",day:iso(d),at:d.toISOString(),name:"Riz",kcal:700,p:30,c:120,f:9,upd:1}],weights:[],weeks:[]};save();show("graph")});
    await check("commentaires vides",["grDay","grWeek","grWeeks"],"()=>renderReviews()");
    await pg.evaluate(()=>{const n=NU(),now=new Date().toISOString();n.rev={day:{key:iso(today()),summary:"Bonne journée <b>équilibrée</b>.",good:["Protéines OK"],improve:[],tips:["Boire plus"],at:now},
      week:{key:weekKey(),summary:"Semaine régulière.",good:["5 jours notés"],improve:["Moins de sucre"],tips:[],at:"2025-03-02T10:00:00Z"}};
      n.weeks=[{id:"2026-10-19",summary:"Semaine 1",good:["a"],improve:["b"],tips:["c"],at:"2026-10-25T09:00:00Z",upd:1},{id:"2026-10-12",summary:"Semaine 0",good:[],improve:[],tips:[],at:"2026-10-18T09:00:00Z",upd:1}];save()});
    await check("commentaires remplis",["grDay","grWeek","grWeeks"],"()=>renderReviews()");
    await pg.evaluate(()=>{revBusy="day";renderReviews()});await pg.waitForTimeout(200);
    if(!(await pg.evaluate(()=>{const el=$("revLoad-day");return !!el&&el.childElementCount>0})))err("animation de chargement absente pendant le calcul");
    await pg.evaluate(()=>{(revStops.day||(()=>{}))();revBusy="";renderReviews()});
    await pg.evaluate(()=>{show("muscu")});
    for(const g of ["force","forme"])await check("objectif "+g,["muGoal"],`()=>{data.prefs.muGoal="${g}";renderMuGoal()}`);
    await pg.evaluate(()=>{data.ui.nuTab="day";show("nutri")});
    await check("macros",["nuMacros"],"()=>renderNutri()");
    await shot(pg,"v52-"+nm+"-nutrition");
    await ctx.close()}
  // --- v53 (ticket #3) : Agenda (grille du mois, vue année, À venir, filtres, Toutes les dates) : même rendu que l'ancien, en français et en anglais
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v53 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v53"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.agPlan),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    // l'ancien rendu passe par la traduction automatique (asynchrone) : on attend un instant avant de comparer
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await pg.evaluate(()=>{const d=n=>{const x=today();x.setDate(x.getDate()+n);return iso(x)};
      data.tasks=[{id:"t1",title:"Dentiste",date:d(0),time:"14:00",status:"à faire",cat:"Santé",tbc:true},
        {id:"t2",title:"Stage",date:d(-3),end:d(4),status:"en cours",cat:"Travail",note:"Rapport à rendre"},
        {id:"t3",title:"Vieux rendez-vous",date:d(-40),time:"09:00",timeEnd:"10:30",status:"à faire",cat:"Sport"},
        {id:"t4",title:"Fait hier",date:d(-1),status:"fait",cat:"Sport"},
        {id:"t5",title:"Vacances",date:d(30),end:d(37),status:"à faire",tbc:true},
        {id:"t6",title:"Anniv",date:d(1),status:"à faire"},{id:"t7",title:"Dans 3 jours",date:d(3),time:"08:00",status:"à faire",cat:"Travail"}];
      icalEvents=[{id:"ic1",src:"ical",title:"Cours de chimie",date:d(2),time:"10:00",timeEnd:"12:00",status:"à faire",canc:true,loc:"Mons"},{id:"ic2",src:"ical",title:"TP",date:d(0),status:"à faire"}];
      ensureType("Santé");ensureType("Travail");ensureType("Sport");save();show("plan");planOpenMem={}});
    await check("mois",["calDays"],"()=>{calMode='month';const t=today();calY=t.getFullYear();calM=t.getMonth();renderCal()}");
    await check("année",["calYear"],"()=>{calMode='year';renderCal()}");
    await pg.evaluate(()=>{calMode="month";renderCal()});
    await check("liste repliée",["next","chips","tasks","calDays"],"()=>{planOpenMem={};renderPlan()}");
    await check("liste ouverte",["next","chips","tasks","calDays"],"()=>{document.querySelectorAll('#tasks [data-mfold]').forEach(x=>planOpenMem[x.dataset.mfold]=1);renderPlan()}");
    await check("filtre",["next","chips","tasks","calDays"],"()=>{data.ui.filter='Travail';renderPlan()}");
    await check("recherche",["next","chips","tasks","calDays"],"()=>{data.ui.filter='Toutes';planQ='cours';renderPlan()}");
    await check("vide",["next","chips","tasks","calDays"],"()=>{planQ='zzz';renderPlan()}");
    await pg.evaluate(()=>{planQ="";renderPlan()});
    // les clics restent gérés par app.js : ouvrir un mois, changer un statut, ouvrir un jour
    await pg.evaluate(()=>{planOpenMem={};renderPlan()});
    const mk=await pg.evaluate(()=>{const b=document.querySelector("#tasks [data-mfold]");b.scrollIntoView();return b.dataset.mfold});
    await pg.click(`#tasks [data-mfold="${mk}"]`);
    if(!(await pg.evaluate(k=>!!planOpenMem[k]&&!!document.querySelector("#tasks .card .prow"),mk)))err("ouvrir un mois ne marche plus");
    await pg.evaluate(()=>{planOpenMem={};document.querySelectorAll('#tasks [data-mfold]').forEach(x=>planOpenMem[x.dataset.mfold]=1);renderPlan()});
    await pg.locator('#tasks [data-st="t1"]').scrollIntoViewIfNeeded();await pg.click('#tasks [data-st="t1"]');
    if(await pg.evaluate(()=>data.tasks.find(t=>t.id==="t1").status)!=="en cours")err("changer le statut ne marche plus");
    await pg.evaluate(()=>window.scrollTo(0,0));const dk=await pg.evaluate(()=>iso(today()));
    await pg.locator(`#calDays [data-day="${dk}"]`).scrollIntoViewIfNeeded();await pg.click(`#calDays [data-day="${dk}"]`);await pg.waitForTimeout(300);
    if(await pg.evaluate(()=>calMode)!=="day")err("ouvrir un jour ne marche plus");
    await pg.evaluate(()=>{calMode="year";renderCal()});await pg.click("#calYear [data-yrn='1']");
    if(await pg.evaluate(()=>calY)!==new Date().getFullYear()+1)err("année suivante ne marche plus");
    await pg.click('#calYear [data-ym="0"]');await pg.waitForTimeout(300);
    if(await pg.evaluate(()=>calMode+calM)!=="month0")err("ouvrir un mois de l'année ne marche plus");
    if(lg==="en"&&/Toutes|Passé|à confirmer|élément/.test(await pg.evaluate(()=>$("tasks").textContent+$("chips").textContent+[...document.querySelectorAll("#calDays [aria-label]")].map(x=>x.getAttribute("aria-label")).join(" "))))err("textes non traduits en anglais");
    await pg.evaluate(()=>{const t=today();calY=t.getFullYear();calM=t.getMonth();calMode="month";renderCal();document.querySelectorAll('#tasks [data-mfold]').forEach(x=>planOpenMem[x.dataset.mfold]=1);renderPlan();$("toast").hidden=true;$("toast").style.display="none";$("calDays").scrollIntoView()});
    await shot(pg,"v53-"+nm+"-agenda");
    await ctx.close()}
  // --- v54 (ticket #3) : Tâches (catégories, barre de catégorie, à faire, en suspens, réalisées en liste et en calendrier) : même rendu, FR et EN
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v54 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v54"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.todos),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const IDS=["todoCats","catBar","todoOpen","todoPaused","todoDone"];
    const check=async(lbl,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[IDS,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await pg.evaluate(()=>{const d=n=>{const x=today();x.setDate(x.getDate()+n);return iso(x)},at=(n,h)=>{const x=today();x.setDate(x.getDate()+n);x.setHours(h,7);return x.toISOString()};
      data.todoCats=[{id:"cA",name:"Courses"},{id:"cB",name:"Travail"},{id:"cF",name:"Fini"}];
      data.todos=[{id:"a1",title:"Pain",createdAt:at(-2,9),done:false,cat:"cA",ord:0},{id:"a2",title:"Lait",createdAt:at(-2,9),done:false,cat:"cA",day:d(0),ord:1},
        {id:"b1",title:"Rapport",createdAt:at(-5,9),done:false,cat:"cB",day:d(-3)},{id:"b2",title:"Mail",createdAt:at(-1,9),done:false,cat:"cB",day:d(1)},{id:"b3",title:"Réunion",createdAt:at(-1,9),done:false,cat:"cB",day:d(9)},
        {id:"n1",title:"Appeler maman",createdAt:at(-1,8),done:false},{id:"p1",title:"Lire un livre",createdAt:at(-9,8),done:false,paused:true,pausedAt:at(-3,8),cat:"cB"},
        {id:"f1",title:"Fini 1",createdAt:at(-30,8),done:true,doneAt:at(-20,10),cat:"cF"},{id:"d1",title:"Sport",createdAt:at(-3,8),done:true,doneAt:at(0,7)},
        {id:"d2",title:"Courses faites",createdAt:at(-40,8),done:true,doneAt:at(-35,18),cat:"cA"},{id:"d3",title:"Ancien",createdAt:at(-400,8),done:true,doneAt:at(-380,12)}];
      data.prefs.todoView={fold:{},doneOpen:false,pausedOpen:true,cat:"all",showFin:false,doneCal:false};dcMonth=null;dcSel=null;save();show("todo")});
    await check("toutes","()=>{freshId='a2';renderTodos()}");
    await check("réalisées en liste","()=>{TV().doneOpen=true;TV().doneCal=false;renderTodos()}");
    await check("réalisées en calendrier","()=>{TV().doneCal=true;dcSel=null;renderTodos()}");
    await check("calendrier, jour choisi","()=>{dcSel=iso(today());renderTodos()}");
    await check("calendrier, mois précédent","()=>{dcMonth=today().getFullYear()*12+today().getMonth()-1;dcSel=null;renderTodos()}");
    await check("catégories repliées","()=>{TV().fold={cA:1,none:1};TV().pausedOpen=false;renderTodos()}");
    await check("terminées affichées","()=>{TV().showFin=true;renderTodos()}");
    await check("une catégorie","()=>{TV().cat='cB';catEditing=false;renderTodos()}");
    await check("renommer","()=>{catEditing=true;renderTodos()}");
    await check("catégorie finie","()=>{catEditing=false;TV().cat='cF';renderTodos()}");
    await check("sans catégorie","()=>{TV().cat='none';renderTodos()}");
    await check("recherche","()=>{TV().cat='all';todoQ='ra';renderTodos()}");
    await check("recherche vide","()=>{todoQ='zzz';renderTodos()}");
    await pg.evaluate(()=>{todoQ="";TV().fold={};TV().pausedOpen=true;TV().doneCal=false;TV().doneOpen=false;TV().showFin=false;catEditing=false;tvSave();renderTodos()});
    // les clics restent gérés par app.js
    await pg.locator('#todoOpen [data-tg="n1"]').scrollIntoViewIfNeeded();await pg.click('#todoOpen [data-tg="n1"]');
    if(!(await pg.evaluate(()=>data.todos.find(t=>t.id==="n1").done)))err("cocher une tâche ne marche plus");
    await pg.locator('#todoOpen [data-tfold="cA"]').scrollIntoViewIfNeeded();await pg.click('#todoOpen [data-tfold="cA"]');
    if(!(await pg.evaluate(()=>!!TV().fold.cA&&!document.querySelector('#todoOpen [data-group="cA"]'))))err("replier une catégorie ne marche plus");
    await pg.evaluate(()=>window.scrollTo(0,0));await pg.click('#todoCats [data-tcat="cB"]');
    if(await pg.evaluate(()=>TV().cat)!=="cB")err("choisir une catégorie ne marche plus");
    await pg.click('#catBar [data-catren]');await pg.fill("#catRenIn","Boulot");await pg.press("#catRenIn","Enter");
    if(await pg.evaluate(()=>catOf("cB").name)!=="Boulot")err("renommer une catégorie ne marche plus");
    // glisser une tâche (poignée) : l'ordre change et la ligne n'est plus marquée « en cours de glisser »
    await pg.evaluate(()=>{data.todos.forEach(t=>{if(t.cat==="cB")t.day=undefined});renderTodos()});
    const g=pg.locator('#todoOpen .row[data-tid="b1"] [data-grip]'),bx=await g.boundingBox(),tg=await pg.locator('#todoOpen .row[data-tid="b3"]').boundingBox();
    await pg.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await pg.mouse.down();
    for(let i=1;i<=8;i++){await pg.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2+(tg.y+tg.height-bx.y)*i/8);await pg.waitForTimeout(30)}
    await pg.mouse.up();await pg.waitForTimeout(300);
    const ord=await pg.evaluate(()=>[...document.querySelectorAll('#todoOpen .row[data-tid]')].map(r=>r.dataset.tid).join(","));
    if(ord.indexOf("b1")<ord.indexOf("b3"))err("glisser une tâche ne change plus l'ordre : "+ord);
    if(await pg.evaluate(()=>!!document.querySelector("#todoOpen .dragging,#todoOpen .drop-anim")||[...document.querySelectorAll("#todoOpen .row")].some(r=>r.style.transform)))err("classes du glisser restées sur les lignes");
    await pg.evaluate(()=>{TV().cat="all";TV().doneOpen=true;TV().doneCal=true;dcMonth=null;dcSel=null;tvSave();renderTodos()});
    await pg.locator(`#todoDone [data-dcday="${await pg.evaluate(()=>iso(today()))}"]`).scrollIntoViewIfNeeded();await pg.click(`#todoDone [data-dcday="${await pg.evaluate(()=>iso(today()))}"]`);
    if(!(await pg.evaluate(()=>dcSel===iso(today())&&!!document.querySelector("#todoDone .card .row.done"))))err("choisir un jour des réalisées ne marche plus");
    if(lg==="en"&&/Toutes|Reprendre|Sans catégorie|réalisées|Tout replier/.test(await pg.evaluate(()=>["todoCats","catBar","todoOpen","todoPaused","todoDone"].map(i=>$(i).textContent).join(" "))))err("textes non traduits en anglais");
    await pg.evaluate(()=>{TV().cat="all";TV().doneCal=false;tvSave();renderTodos();$("toast").style.display="none";window.scrollTo(0,0)});
    await shot(pg,"v54-"+nm+"-taches");
    // vue d'un jour de l'Agenda
    await pg.evaluate(()=>{const d=n=>{const x=today();x.setDate(x.getDate()+n);return iso(x)};
      data.tasks=[{id:"j1",title:"Cours",date:d(0),time:"09:00",timeEnd:"11:00",status:"à faire",cat:"Travail",loc:"Mons"},{id:"j2",title:"Réunion",date:d(0),time:"10:00",timeEnd:"10:45",status:"fait",cat:"Travail"},
        {id:"j3",title:"Stage",date:d(-2),end:d(3),status:"en cours"},{id:"j4",title:"Anniv",date:d(0),status:"fait"},{id:"j5",title:"Tôt",date:d(0),time:"06:30",status:"à faire"}];
      icalEvents=[{id:"ij1",src:"ical",title:"TP annulé",date:d(0),time:"14:00",timeEnd:"16:00",status:"à faire",canc:true},{id:"ij2",src:"ical",title:"Férié",date:d(0),status:"à faire",canc:true}];
      data.todos.push({id:"dd1",title:"Payer loyer",createdAt:new Date().toISOString(),done:false,day:d(-2)},{id:"dd2",title:"Faite",createdAt:new Date().toISOString(),done:true,doneAt:new Date().toISOString(),day:d(0)});
      save();show("plan");selDay=d(0);calMode="day";qOpen=false;renderCal()});
    const day=async(lbl,src)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[["calDayView"],src]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await day("jour","()=>{selDay=iso(today());qOpen=false;renderCal()}");
    await day("jour, ajout ouvert","()=>{qOpen=true;renderCal()}");
    await day("jour passé","()=>{const x=today();x.setDate(x.getDate()-2);selDay=iso(x);qOpen=false;renderCal()}");
    await day("jour vide","()=>{const x=today();x.setDate(x.getDate()+40);selDay=iso(x);renderCal()}");
    await pg.evaluate(()=>{selDay=iso(today());qOpen=false;renderCal();$("calDayView").scrollIntoView()});
    await pg.fill("#calDayView [data-dtadd] input","Acheter du pain");await pg.press("#calDayView [data-dtadd] input","Enter");await pg.waitForTimeout(200);
    if(!(await pg.evaluate(()=>data.todos.some(t=>t.title==="Acheter du pain"&&t.day===iso(today()))&&$("calDayView").querySelector("[data-dtadd] input").value==="")))err("tâche du jour : ajout ou champ pas vidé");
    await pg.click("#qOpen");await pg.fill("#qTitle","Dentiste");await pg.fill("#qTime","15:00");await pg.click("#qForm button[type=submit]");await pg.waitForTimeout(200);
    if(!(await pg.evaluate(()=>data.tasks.some(t=>t.title==="Dentiste"&&t.time==="15:00")&&!!document.querySelector("#calDayView .blk"))))err("ajout rapide d'une activité ne marche plus");
    await pg.click('#calDayView [data-dayjump]');if(await pg.evaluate(()=>selDay)===await pg.evaluate(()=>iso(today())))err("jour précédent ne marche plus");
    await pg.evaluate(()=>{selDay=iso(today());renderCal();$("toast").style.display="none";$("calDayView").scrollIntoView()});
    await shot(pg,"v54-"+nm+"-jour");
    await ctx.close()}
  // --- v55 (ticket #3) : Musculation (programmes, séances, exercices, séries) et Focus (durées, frise) : même rendu, FR et EN ; saisie fluide
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v55 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v55"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.muList),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await pg.evaluate(()=>{const m=M(),now=Date.now(),g={id:"g1",name:"Mon prog",src:"claude"},ex=(n,sets,reps)=>({id:uid(),name:n,ps:1,sets:sets.map(([kg,r])=>({kg,reps:r})),...(reps?{reps}:{})});
      m.plan={id:"g1",v:2,profile:{goal:"muscle"},at:new Date().toISOString(),upd:now,src:"ia"};
      m.sessions=[{id:"s1",name:"Séance A · Push",upd:now,grp:g,ord:0,exercises:[ex("Développé couché haltères",[["40","10"],["42.5","8"],["",""],["",""]],"6–10"),ex("Pec deck",[["","12"]])]},
        {id:"s2",name:"Jambes",upd:now,grp:g,ord:1,exercises:[ex("Squat",[["80",""],["80",""],["80",""]])]},
        {id:"s3",name:"Import",upd:now,grp:{id:"g2",name:"Programme importé",src:"import"},exercises:[ex("Tirage poitrine",[["",""]])]},
        {id:"s4",name:"Libre du dimanche",upd:now,exercises:[ex("Mon exo inventé",[["10","5"],["10","5"]]),ex("",[["",""]])]}];
      data.prefs.muGoal="muscle";msOpenId="s1";save();show("muscu")});
    await check("séances",["msList"],"()=>renderMuscu()");
    await check("autre objectif, une séance ouverte",["msList"],"()=>{data.prefs.muGoal='force';msOpenId='s4';renderMuscu()}");
    await check("autre séance ouverte",["msList"],"()=>{msOpenId='s2';renderMuscu()}");
    // saisie : le champ garde le focus et la carte se met à jour (nom de la séance, nom d'un exercice → conseil et fiche « ? »)
    await pg.evaluate(()=>{msOpenId="s4";renderMuscu();document.querySelector('[data-ms="s4"]').scrollIntoView()});
    const nameIn='[data-ms="s4"] input[data-f="msname"]';await pg.click(nameIn);await pg.keyboard.type(" bis");
    const st=await pg.evaluate(s=>({foc:document.activeElement===document.querySelector(s),shown:document.querySelector('[data-ms="s4"] .ms-name').textContent,data:msFind("s4").name}),nameIn);
    if(!st.foc||st.shown!=="Libre du dimanche bis"||st.data!=="Libre du dimanche bis")err("saisie du nom de séance : "+JSON.stringify(st));
    const exIn='[data-ms="s4"] .ex3:nth-of-type(2) input[data-f="exname"]';
    const exSel=await pg.evaluate(()=>{const e=msFind("s4").exercises[1];return `[data-ex="${e.id}"] input[data-f="exname"]`});
    await pg.click(exSel);await pg.keyboard.type("Pec deck");
    const st2=await pg.evaluate(s=>{const i=document.querySelector(s),box=i.closest("[data-ex]");return{foc:document.activeElement===i,help:!box.querySelector("[data-exhelp]").hidden,adv:!box.querySelector(".ex-adv").hidden}},exSel);
    if(!st2.foc||!st2.help||!st2.adv)err("saisie du nom d'exercice : "+JSON.stringify(st2));
    // série 1 sur toutes puis Annuler : les champs déjà touchés reprennent la valeur enregistrée
    const e1=await pg.evaluate(()=>msFind("s4").exercises[0].id);
    // (pas de fill : l'app place le curseur en fin de champ numérique, fill ajouterait au texte)
    await pg.evaluate(id=>{for(const[j,v]of [[1,"7"],[0,"12"]]){const i=document.querySelector(`[data-ex="${id}"] [data-si="${j}"] input[data-f="setkg"]`);i.focus();i.value=v;i.dispatchEvent(new Event("input",{bubbles:true}))}},e1);
    await pg.click(`[data-ex="${e1}"] [data-mscopy1]`);await pg.waitForTimeout(200);
    if(await pg.inputValue(`[data-ex="${e1}"] [data-si="1"] input[data-f="setkg"]`)!==(lg==="en"?"12":"12"))err("série 1 sur toutes : champ pas mis à jour");
    await pg.evaluate(()=>{const b=[...document.querySelectorAll("#toast button")].find(x=>x.offsetParent);if(b)b.click()});await pg.waitForTimeout(200);
    if(await pg.inputValue(`[data-ex="${e1}"] [data-si="1"] input[data-f="setkg"]`)!=="7")err("Annuler : le champ de la série 2 ne reprend pas sa valeur ("+await pg.inputValue(`[data-ex="${e1}"] [data-si="1"] input[data-f="setkg"]`)+")");
    await pg.click(`[data-ex="${e1}"] [data-msaddset]`);
    if(await pg.evaluate(id=>msFind("s4").exercises.find(e=>e.id===id).sets.length,e1)!==3)err("ajouter une série ne marche plus");
    if(lg==="en"&&/Séances libres|Ajouter une série|Supprimer|Série 1/.test(await pg.evaluate(()=>$("msList").textContent)))err("textes non traduits en anglais");
    await pg.evaluate(()=>{$("toast").style.display="none";document.querySelector('[data-ms="s1"]').scrollIntoView()});
    await shot(pg,"v55-"+nm+"-muscu");
    // Focus
    await pg.evaluate(()=>{P.run=null;P.cfg={work:25,brk:5,total:120};save();show("pomo")});
    await check("focus réglages",["presets","planBar"],"()=>renderSetup()");
    await check("focus autre durée",["presets","planBar"],"()=>{P.cfg.total=90;renderSetup()}");
    await pg.evaluate(()=>{P.run={segs:buildSegs(P.cfg),startAt:Date.now()-40*60000,pausedAt:Date.now(),pausedTotal:0};renderPomo()});
    await check("focus en cours",["runBar"],"()=>tickPomo()");
    await pg.evaluate(()=>{P.run=null;save();renderPomo()});await pg.click('#presets [data-total="180"]');
    if(await pg.evaluate(()=>P.cfg.total)!==180)err("choisir une durée du Focus ne marche plus");
    await ctx.close()}
  // --- v56 (ticket #3) : Nutrition (plats du jour, résultat d'une analyse, sport de la semaine) : même rendu, FR et EN ; quantités et vignettes
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v56 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v56"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.nuLog),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await pg.evaluate(()=>{const d=new Date(),k=iso(d),at=h=>{const x=new Date();x.setHours(h,5,0,0);return x.toISOString()};
      data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[{name:"Course",freq:2,min:45},{name:"Muscu",freq:3,min:60}]},plan:{kcal:2200,p:150,c:250,f:70,bmr:1800,tdee:2200,text:"",warn:[],kps:{course:450}},upd:Date.now(),
        log:[{id:"l1",day:k,at:at(8),grp:"g1",gname:"Petit-déjeuner",name:"Flocons d'avoine",qty:"60 g",kcal:230,p:8,c:40,f:4,upd:1},{id:"l2",day:k,at:at(8),grp:"g1",gname:"Petit-déjeuner",name:"Lait",qty:"200 ml",kcal:90,p:7,c:10,f:2,upd:1},
          {id:"l3",day:k,at:at(12),grp:"g2",gname:"Riz au poulet",name:"Riz au poulet",qty:"",kcal:650,p:45,c:80,f:12,upd:1},{id:"l4",day:k,at:at(19),name:"Huile d'olive",qty:"10 g",g:10,kcal:90,p:0,c:0,f:10,upd:1}],weights:[],weeks:[],
        wsports:{[wKey(k)]:{Course:3}}};data.ui.nuTab="day";nuDay=k;save();show("nutri")});
    await check("journée",["nuLog","nuWeek","nuMacros"],"()=>renderNutri()");
    await check("quantité ouverte",["nuLog","nuMacros"],"()=>{qtyEd='log:l1';renderNutri()}");
    await pg.evaluate(()=>{qtyEd=null;renderNutri()});
    await check("jour vide",["nuLog","nuMacros"],"()=>{const x=today();x.setDate(x.getDate()-3);nuDay=iso(x);renderNutri()}");
    await check("aujourd'hui vide",["nuLog","nuMacros"],"()=>{NU().log=[];nuDay=iso(today());renderNutri()}");
    await check("résultat",["nuResult"],"()=>{nuPending={q:'riz',mem:true,title:'Bol de riz',em:'🍚',note:'Portion estimée',photo:null,items:[{name:'Riz',qty:'150 g',kcal:200,p:4,c:44,f:0.5},{name:'Sauce soja',qty:'1 c. à soupe',kcal:10,p:1,c:1,f:0,extra:true}]};qtyEd=null;renderNuResult()}");
    await check("résultat, quantité ouverte",["nuResult"],"()=>{qtyEd='res:0';renderNuResult()}");
    // quantité modifiée depuis le résultat : calories recalculées ; puis ajout à la journée
    await pg.evaluate(()=>{qtyEd=null;renderNuResult();$("nuResult").scrollIntoView()});
    await pg.click('#nuResult [data-qed="res:0"]');await pg.fill("#qtyEdIn","300 g");await pg.press("#qtyEdIn","Enter");
    if(await pg.evaluate(()=>nuPending&&nuPending.items[0].kcal)!==400)err("quantité du résultat : calories pas recalculées");
    await pg.click('#nuResult [data-nuadd]');await pg.waitForTimeout(300);
    if(!(await pg.evaluate(()=>NU().log.some(x=>x.name==="Riz"&&x.kcal===400)&&!!document.querySelector("#nuLog .dish")&&!document.querySelector("#nuResult .dish"))))err("ajouter le résultat à la journée ne marche plus");
    // chargement (ancien code) puis nouveau résultat : #nuResult passe de l'un à l'autre sans erreur
    await pg.evaluate(()=>{nuBusy="aliment";nuPending=null;renderNuResult();const stop=nuLoading($("nuResult"),["Analyse du plat…"]);stop();nuBusy="";
      nuPending={q:'x',title:'Pomme',em:'🍎',note:'',items:[{name:'Pomme',qty:'1',kcal:80,p:0,c:20,f:0}]};renderNuResult()});
    if(!(await pg.evaluate(()=>!!document.querySelector("#nuResult .dish"))))err("résultat après chargement absent");
    await pg.evaluate(()=>{nuPending=null;renderNuResult()});
    // vignette : chargée après coup, dessinée par React
    await pg.evaluate(async()=>{const g=NU().log.find(x=>x.name==="Riz").grp;await idb.put(thumbKey(g),"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");thumbs.delete(g);renderNutri()});await pg.waitForTimeout(400);
    if(!(await pg.evaluate(()=>!!document.querySelector("#nuLog .dish-ic img"))))err("vignette du plat absente");
    await pg.locator('#nuWeek [data-d="1"]').first().scrollIntoViewIfNeeded();await pg.click('#nuWeek [data-d="1"]');
    if(await pg.evaluate(()=>NU().wsports[wKey(iso(today()))].Course)!==4)err("sport de la semaine : + ne marche plus");
    if(lg==="en"&&/Ton sport|Ajouter une quantité|Supprimer|aliments|par séance/.test(await pg.evaluate(()=>$("nuLog").textContent+$("nuWeek").textContent)))err("textes non traduits en anglais");
    await pg.evaluate(()=>{$("toast").style.display="none";$("nuLog").scrollIntoView()});
    await shot(pg,"v56-"+nm+"-nutrition");
    await ctx.close()}
  // --- v57 (ticket #3) : Notes (chemin, dossiers, notes), Documents (classeurs, liste), Mots de passe (liste) : même rendu, FR et EN
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v57 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v57"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.pwList),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    // Notes
    await pg.evaluate(()=>{const now=Date.now();data.noteFolders=[{id:"fA",name:"Cours",parent:null},{id:"fB",name:"Chimie",parent:"fA"},{id:"fC",name:"Perso",parent:null}];
      data.notes=[{id:"n1",title:"Liste de courses",body:"Pain\nLait\nOeufs",createdAt:new Date(now-864e5*40).toISOString(),upd:now-864e5*40},{id:"n2",title:"",body:"Idée sans titre\nsuite",createdAt:new Date().toISOString(),upd:now-60000},
        {id:"n3",title:"Atomes",body:"Protons",folder:"fB",createdAt:new Date().toISOString(),upd:now-3600e3,photos:[{id:"p1"},{id:"p2"}]},{id:"n4",title:"Cours 1",body:"",folder:"fA",createdAt:new Date().toISOString(),upd:now-7200e3,pdf:{name:"c.pdf",size:1000,pages:3}},
        {id:"n5",secret:true,vid:"vx",iv:"aa",ct:"bb",upd:now-5000}];data.pdfAnns=[{id:"a1",note:"n4",page:1,t:"text",x:.1,y:.1,w:.2,h:.1,txt:"x",upd:1}];noteDir=null;noteQ="";noteOpenId=null;save();show("notes")});
    await check("notes",["nfPath","noteList"],"()=>{noteDir=null;noteQ='';renderNotes()}");
    await check("dans un dossier",["nfPath","noteList"],"()=>{noteDir='fA';renderNotes()}");
    await check("sous-dossier",["nfPath","noteList"],"()=>{noteDir='fB';renderNotes()}");
    await check("dossier vide",["nfPath","noteList"],"()=>{noteDir='fC';renderNotes()}");
    await check("recherche",["nfPath","noteList"],"()=>{noteDir=null;noteQ='o';renderNotes()}");
    await check("recherche vide",["nfPath","noteList"],"()=>{noteQ='zzzz';renderNotes()}");
    await pg.evaluate(()=>{noteQ="";noteDir=null;renderNotes()});
    await pg.click('#noteList [data-nfopen="fA"]');if(await pg.evaluate(()=>noteDir)!=="fA")err("ouvrir un dossier de notes ne marche plus");
    await pg.click('#nfPath [data-nfgo=""]');if(await pg.evaluate(()=>noteDir)!==null)err("revenir à Notes par le chemin ne marche plus");
    await pg.click('#noteList [data-note="n1"]');await pg.waitForTimeout(200);if(await pg.evaluate(()=>noteOpenId)!=="n1")err("ouvrir une note ne marche plus");
    await pg.evaluate(()=>closeNote());await pg.waitForTimeout(300);
    // Documents
    await pg.evaluate(()=>{const d=new Date().toISOString();data.docFolders=[{id:"cl1",name:"Logement"},{id:"cl2",name:"Santé"}];
      data.docs=[{id:"d1",title:"Bail",size:1200000,pages:6,createdAt:d,up:true,folder:"cl1"},{id:"d2",title:"Carte d'identité",size:420000,pages:1,createdAt:"2026-01-05T10:00:00Z",up:false},{id:"d3",title:"Mutuelle",size:180000,createdAt:d,up:true,folder:"cl2"}];
      data.ui.docFolder=null;docQ="";dfQ="";save();show("docs")});
    await check("documents",["docFolders","docList"],"()=>{docQ='';renderDocs()}");
    await check("documents, envoi en cours",["docFolders","docList"],"()=>{docBusy.add('d2');renderDocs();docBusy.delete('d2')}");
    await check("documents, recherche",["docFolders","docList"],"()=>{docQ='bai';renderDocs()}");
    await check("documents, aucun",["docFolders","docList"],"()=>{docQ='zzzz';renderDocs()}");
    await pg.evaluate(()=>{docQ="";renderDocs()});
    // Mots de passe (coffre ouvert simulé : la liste ne lit que les entrées déjà déchiffrées en mémoire)
    // compte sans coffre : show("pwd") reverrouille ; on simule ensuite un coffre ouvert (clé factice, entrées « déchiffrées » en mémoire) et on ne dessine que la liste
    await pg.evaluate(()=>{show("pwd")});await pg.waitForTimeout(300);
    await pg.evaluate(()=>{vaultKey={};$("vault").hidden=false;$("pinBox").hidden=true;vaultItems=new Map([["w1",{site:"Banque",user:"sid",pw:"S3cret!",note:"code client 42"}],["w2",{site:"E-mail",user:"",pw:"abc"}],["w3",{site:"Université",user:"msidki",pw:"xyz"}]]);pwShown.clear();pwQ="";renderPwList()});
    if(await pg.evaluate(()=>$("pwList").querySelectorAll(".pw-row").length)!==3)err("liste des mots de passe : 3 entrées attendues");
    await check("mots de passe",["pwList"],"()=>{pwQ='';renderPwList()}");
    await check("mot de passe affiché",["pwList"],"()=>{pwShown.add('w1');renderPwList()}");
    await check("mots de passe, recherche",["pwList"],"()=>{pwShown.clear();pwQ='univ';renderPwList()}");
    await check("mots de passe, aucun",["pwList"],"()=>{pwQ='zzzz';renderPwList()}");
    await pg.evaluate(()=>{pwQ="";renderPwList()});
    if(await pg.evaluate(()=>$("pwList").textContent.includes("S3cret!")))err("mot de passe visible sans « Afficher »");
    await pg.evaluate(()=>document.querySelector('#pwList [data-pweye="w1"]').click());
    if(!(await pg.evaluate(()=>$("pwList").textContent.includes("S3cret!"))))err("« Afficher » ne montre plus le mot de passe");
    await pg.evaluate(()=>{pinBuf="";pwdLock()});
    if(await pg.evaluate(()=>/S3cret|Banque/.test($("pwList").textContent)))err("liste des mots de passe pas vidée au verrouillage");
    if(lg==="en"&&/Dossiers|Tous|Classeur|Sur cet appareil/.test(await pg.evaluate(()=>{show("docs");renderDocs();return $("docFolders").textContent+$("docList").textContent})))err("textes non traduits en anglais");
    await pg.evaluate(()=>{$("toast").style.display="none";show("notes");noteDir="fA";renderNotes();window.scrollTo(0,0)});
    await shot(pg,"v57-"+nm+"-notes");
    await ctx.close()}
  // --- v58 (ticket #3) : Nutrition (menu) et page d'accueil Sid'compagnon (3 cartes) : même rendu, FR et EN
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v58 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v58"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.nuMenu),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    // accueil : avec et sans données
    await pg.evaluate(()=>{show("home")});
    await check("accueil vide",["homeBody"],"()=>renderHome()");
    await pg.evaluate(()=>{const d=new Date();d.setHours(d.getHours()+2);data.tasks=[{id:"h1",title:"Dentiste <3>",date:iso(d),time:`${String(d.getHours()).padStart(2,"0")}:00`,status:"à faire"}];
      data.todos=[{id:"ht",title:"x",createdAt:new Date().toISOString(),done:false,day:iso(today())}];data.notes=[{id:"hn",title:"Ma note",body:"",createdAt:new Date().toISOString(),upd:Date.now()}];
      data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,goal:"maintain",sports:[]},plan:{kcal:2000,p:150,c:200,f:70,bmr:1800,tdee:2000,text:"",warn:[]},upd:Date.now(),log:[{id:"x1",day:iso(today()),at:new Date().toISOString(),name:"Riz",kcal:450,p:9,c:90,f:2,upd:1}],weights:[],weeks:[]};save()});
    await check("accueil rempli",["homeBody"],"()=>renderHome()");
    await pg.click('#homeBody [data-gapp]');await pg.waitForTimeout(400);if(await pg.evaluate(()=>data.ui.view)==="home")err("toucher une carte de l'accueil n'ouvre plus l'app");
    // menu
    await pg.evaluate(()=>{const n=NU();n.menu=null;data.ui.nuTab="menu";save();show("nutri")});
    await check("menu vide",["nuMenu"],"()=>{meEdit=null;meAdd=null;meRecipe=null;renderNuMenu()}");
    await pg.evaluate(()=>{NU().menu={at:new Date().toISOString(),tips:"Bois de l'eau.",meals:[{slot:"breakfast",target:500,name:"Porridge",em:"🥣",items:[{name:"Flocons d'avoine",g:60,qty:"60 g",kcal:230,p:8,c:40,f:4},{name:"Huile d'olive",g:10,qty:"10 g",kcal:90,p:0,c:0,f:10},{name:"Pomme",qty:"1",kcal:80,p:0,c:20,f:0}]},
      {slot:"lunch",target:700,name:"Riz poulet",items:[{name:"Riz cru",g:80,qty:"80 g",kcal:280,p:6,c:62,f:1}],steps:["Cuire le riz.","Griller le poulet."],ate:iso(today())}]};save()});
    await check("menu",["nuMenu"],"()=>{meEdit=null;meAdd=null;meRecipe=null;renderNuMenu()}");
    await check("menu, quantité ouverte",["nuMenu"],"()=>{meEdit='0:0';renderNuMenu()}");
    await check("menu, ajout ouvert",["nuMenu"],"()=>{meEdit=null;meAdd=1;renderNuMenu()}");
    await check("menu, recette",["nuMenu"],"()=>{meAdd=null;meRecipe=1;renderNuMenu()}");
    await check("menu, recette en préparation",["nuMenu"],"()=>{meRecipe=0;nuBusy='recipe';renderNuMenu();nuBusy=''}");
    await pg.evaluate(()=>{meRecipe=null;meEdit=null;meAdd=null;renderNuMenu();$("nuMenu").scrollIntoView()});
    // quantité modifiée dans le menu : calories recalculées
    await pg.click('#nuMenu [data-meq="0:0"]');await pg.fill("#meQtyIn","120");await pg.press("#meQtyIn","Enter");
    if(await pg.evaluate(()=>NU().menu.meals[0].items[0].kcal)!==460)err("menu : quantité pas recalculée");
    await pg.click('#nuMenu [data-merec="1"]');if(!(await pg.evaluate(()=>!!document.querySelector("#nuMenu .recipe ol li"))))err("menu : recette pas affichée");
    // chargement d'un menu (ancien code) puis retour au rendu React
    await pg.evaluate(()=>{nuMenuFree();nuBusy="menu";const stop=nuLoading($("nuMenu"),["Préparation du menu…"]);stop();nuBusy="";renderNuMenu()});
    if(!(await pg.evaluate(()=>!!document.querySelector("#nuMenu .dish")&&Object.keys($("nuMenu")).some(k=>k.startsWith("__reactContainer")))))err("menu après chargement absent");
    await pg.click('#nuMenu [data-numeal="0"]');await pg.waitForTimeout(200);if(!(await pg.evaluate(()=>NU().log.some(x=>x.name==="Flocons d'avoine"))))err("menu : ajouter à ma journée ne marche plus");
    if(lg==="en"&&/Ton menu|Autre idée|Recette|Dans ta journée/.test(await pg.evaluate(()=>{data.ui.nuTab="menu";show("nutri");return $("nuMenu").textContent})))err("textes non traduits en anglais");
    await pg.evaluate(()=>{$("toast").style.display="none";data.ui.nuTab="menu";show("nutri");$("nuMenu").scrollIntoView()});
    await shot(pg,"v58-"+nm+"-menu");
    await pg.evaluate(()=>{show("home");window.scrollTo(0,0)});await shot(pg,"v58-"+nm+"-accueil");
    await ctx.close()}
  // --- v59 (ticket #3) : Nutrition (copie d'un repas, résumé du profil, objectif de poids) : même rendu, FR et EN
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v59 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v59"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.nuPlan),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    const IDS=["nuGoalCard","nuPlan","nuLog","nuMacros"]; // (pas de sport : #nuWeek reste vide et caché)
    await pg.evaluate(()=>{data.nutri={consent:new Date().toISOString(),profile:{sex:"h",age:24,height:180,weight:80,target:74,dur:8,durU:"w",pace:"real",goal:"lose",sports:[]},
      plan:{kcal:1900,p:160,c:180,f:60,bmr:1800,tdee:2300,text:"Ton plan est prêt.",warn:["Bois 2 L d'eau par jour."],wg:{ok:true,wk:-0.75,weeks:8,advice:"Rythme raisonnable."}},upd:Date.now(),
      log:[{id:"c1",day:iso(today()),at:new Date().toISOString(),grp:"cg",gname:"Salade",name:"Salade",qty:"200 g",kcal:300,p:10,c:20,f:15,upd:1}],weights:[],weeks:[]};data.ui.nuTab="day";nuDay=iso(today());save();show("nutri")});
    await check("objectif réaliste",IDS,"()=>renderNutri()");
    await check("objectif pas réaliste, en mois",IDS,"()=>{const n=NU();n.plan.wg={ok:false,wk:-1.5,weeks:12,advice:''};n.profile.durU='m';n.profile.dur=2;n.profile.pace='fast';renderNutri()}");
    await check("objectif sans délai",IDS,"()=>{const n=NU();n.plan.wg={ok:true,wk:0,weeks:0,advice:''};delete n.profile.dur;delete n.profile.pace;renderNutri()}");
    await check("sans objectif de poids",IDS,"()=>{const n=NU();delete n.plan.wg;delete n.profile.target;renderNutri()}");
    // copie d'un repas
    await pg.evaluate(()=>{nuCopyOpen("cg")});await pg.waitForTimeout(200);
    await check("copie d'un repas",["nuCopyBody"],"()=>renderNuCopy()");
    const d1=await pg.evaluate(()=>{const x=today();x.setDate(x.getDate()+1);return iso(x)}),inM=await pg.evaluate(k=>!!document.querySelector(`#nuCopyBody [data-nucpd="${k}"]`),d1);
    if(!inM)await pg.click('#nuCopyBody [data-nucpn="1"]');
    await pg.click(`#nuCopyBody [data-nucpd="${d1}"]`);
    await check("copie, un jour choisi",["nuCopyBody"],"()=>renderNuCopy()");
    await pg.click("#nuCopyGo");await pg.waitForTimeout(200);
    if(!(await pg.evaluate(k=>NU().log.some(x=>x.day===k&&x.name==="Salade"),d1)))err("copier un repas ne marche plus");
    if(lg==="en"&&/Métabolisme|Objectif \(kcal\)|Chemin conseillé/.test(await pg.evaluate(()=>{data.ui.nuTab="profile";show("nutri");return $("nuPlan").textContent})))err("textes non traduits en anglais");
    await pg.evaluate(()=>{const n=NU();n.profile.target=74;n.profile.dur=8;n.profile.durU="w";n.plan.wg={ok:false,wk:-0.75,weeks:8,advice:"Plus lent."};data.ui.nuTab="profile";save();show("nutri");$("toast").style.display="none";$("nuPlan").scrollIntoView()});
    await shot(pg,"v59-"+nm+"-profil");
    await ctx.close()}
  // --- v60 (ticket #3, coquille étapes 1 et 2) : fusion et chiffrement en TypeScript (site/react/core.js), chargés avant app.js
  for(const [nm,dev] of [["mobile",{...devices["iPhone 13"]}],["pc",{viewport:{width:1280,height:800}}]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v60 "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    if(!(await pg.evaluate(()=>!!(window.SCCore&&window.SCCore.version>=2&&window.SCCore.crypto&&window.SCCore.mergeData))))err("core.js pas chargé avant l'app");
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v60"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    const r=await pg.evaluate(async()=>{const out={};
      // la fusion passe par core.js, et donne le même résultat que l'ancien code
      let used=0;const real=window.SCCore.mergeData;window.SCCore.mergeData=(...a)=>{used++;return real(...a)};
      const l={todos:[{id:"a",title:"A"}],prefs:{x:1}},rm={todos:[{id:"b",title:"B"}],prefs:{y:2}};
      const n=JSON.stringify(mergeData(l,rm));window.__noCore=true;const o=JSON.stringify(mergeData(l,rm));window.__noCore=false;window.SCCore.mergeData=real;
      out.merge=used===1&&n===o;
      // en cas d'erreur dans core.js, l'ancien code prend le relais
      window.SCCore.mergeData=()=>{throw new Error("test")};out.fallback=JSON.stringify(mergeData(l,rm))===o;window.SCCore.mergeData=real;
      // vrai coffre (600 000 itérations) : chiffré par l'ancien code, ouvert par le nouveau, et inversement
      const salt=b64e(crypto.getRandomValues(new Uint8Array(16))),obj={site:"Banque",pw:"x"};
      window.__noCore=true;const kOld=await pinKey("24680",salt,PIN_ITER),eOld=await encJ(kOld,obj);window.__noCore=false;
      const kNew=await pinKey("24680",salt,PIN_ITER);out.oldToNew=JSON.stringify(await decJ(kNew,eOld))===JSON.stringify(obj);
      const eNew=await encJ(kNew,obj);window.__noCore=true;out.newToOld=JSON.stringify(await decJ(kOld,eNew))===JSON.stringify(obj);window.__noCore=false;
      const mk1=await phDerive("secret11",salt);window.__noCore=true;const mk0=await phDerive("secret11",salt);window.__noCore=false;out.mk=mk1.raw===mk0.raw;
      return out});
    for(const[k,v]of Object.entries(r))if(!v)err("core : "+k+" en échec");
    await ctx.close()}
  // --- v61 (ticket #3, coquille étape 3) : appels au serveur, session et synchro en TypeScript ; deux appareils, l'un sur l'ancien code
  {const err=m=>errs.push("v61 : "+m);const em="v61sync@test.be";
    const mk=async(noCore)=>{const ctx=await b.newContext({...devices["iPhone 13"]});if(noCore)await ctx.addInitScript(()=>{window.__noCore=true});const pg=await ctx.newPage();pg.on("pageerror",e=>err(e.message));await pg.goto(U);await pg.waitForTimeout(800);return{ctx,pg}};
    const A=await mk(false),B=await mk(true);
    await A.pg.click("#mSignup");await A.pg.fill("#aName","Sid");await A.pg.fill("#aEmail",em);await A.pg.fill("#aPw","secret11");await A.pg.fill("#aPw2","secret11");await A.pg.check("#aAgree");await A.pg.click("#aBtn");await A.pg.waitForTimeout(1500);
    if(await A.pg.isVisible("#onb"))await A.pg.click("#onbSkip");if(await A.pg.isVisible("#notifAsk"))await A.pg.click("#naNo");
    if(!(await A.pg.evaluate(()=>!!(window.SCCore&&window.SCCore.sync&&session&&session.access_token&&session.user.id))))err("connexion : session absente (nouveau code)");
    await B.pg.click("#mLogin");await B.pg.fill("#aEmail",em);await B.pg.fill("#aPw","secret11");await B.pg.click("#aBtn");await B.pg.waitForTimeout(1500);
    if(await B.pg.isVisible("#onb"))await B.pg.click("#onbSkip");if(await B.pg.isVisible("#notifAsk"))await B.pg.click("#naNo");
    if(!(await B.pg.evaluate(()=>!!(session&&session.access_token))))err("connexion : session absente (ancien code)");
    // A (nouveau code) et B (ancien code) ajoutent chacun une tâche sans s'être vus : rien ne doit se perdre
    let used=0;await A.pg.exposeFunction("__pl",()=>{used++});
    await A.pg.evaluate(()=>{const ns=window.SCCore.sync,r=ns.pushLoop;window.SCCore.sync={...ns,pushLoop:(...x)=>{window.__pl();return r(...x)}}}); // (le module est figé : on le remplace par une copie)
    await A.pg.evaluate(()=>{data.todos.push({id:"ta",title:"Tâche A",createdAt:new Date().toISOString(),done:false});save()});
    await B.pg.evaluate(()=>{data.todos.push({id:"tb",title:"Tâche B",createdAt:new Date().toISOString(),done:false});save()});
    await A.pg.waitForTimeout(2500);await B.pg.waitForTimeout(2500);
    for(const P of [A,B])await P.pg.evaluate(()=>pull());await A.pg.waitForTimeout(800);
    // un deuxième tour, cette fois une suppression d'un côté et une modification de l'autre
    await A.pg.evaluate(()=>{data.todos=data.todos.filter(t=>t.id!=="tb");tomb("tb");save()});await A.pg.waitForTimeout(2500);
    await B.pg.evaluate(()=>{const t=data.todos.find(x=>x.id==="ta");if(t){t.title="Tâche A modifiée"}save()});await B.pg.waitForTimeout(2500);
    for(const P of [A,B])await P.pg.evaluate(()=>pull());await A.pg.waitForTimeout(800);
    const ra=await A.pg.evaluate(()=>data.todos.map(t=>t.id+":"+t.title).sort().join("|")),rb=await B.pg.evaluate(()=>data.todos.map(t=>t.id+":"+t.title).sort().join("|"));
    if(ra!==rb)err("les deux appareils ne sont pas d'accord : "+ra+" <> "+rb);
    if(ra!=="ta:Tâche A modifiée")err("résultat de la synchro inattendu : "+ra);
    if(!used)err("la synchro n'est pas passée par core.js");
    if(await A.pg.evaluate(()=>!!syncErr)||await B.pg.evaluate(()=>!!syncErr))err("erreur de synchro affichée");
    // jeton expiré : renouvelé par le nouveau code
    const tok=await A.pg.evaluate(async()=>{session.expires_at=0;const t=await token();return {t:!!t,exp:session.expires_at>Date.now()/1000}});
    if(!tok.t||!tok.exp)err("renouvellement du jeton : "+JSON.stringify(tok));
    // erreur du serveur : même message et même code qu'avant
    const e1=await A.pg.evaluate(async()=>{const r=[];for(const nc of [false,true]){window.__noCore=nc;try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:"x@y.be",password:"faux"}})}catch(e){r.push(e.message+"|"+e.status)}}window.__noCore=false;return r});
    if(e1.length!==2||e1[0]!==e1[1])err("message d'erreur du serveur différent : "+JSON.stringify(e1));
    await A.ctx.close();await B.ctx.close()}
  // --- v61 : barres de navigation (bas, en-tête d'app, barre latérale) : même rendu, FR et EN ; pastilles
  for(const [nm,dev,lg] of [["mobile",{...devices["iPhone 13"]},"fr"],["pc",{viewport:{width:1280,height:800}},"en"]]){
    const ctx=await b.newContext(dev),pg=await ctx.newPage(),err=m=>errs.push("v61 nav "+nm+" : "+m);pg.on("pageerror",e=>err(e.message));
    await pg.goto(U);await pg.waitForTimeout(800);
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","v61n"+nm+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.check("#aAgree");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(lg!=="fr"){await pg.evaluate(l=>setLang(l),lg);await pg.waitForTimeout(2500)}
    await pg.waitForFunction(()=>!!(window.SCIslands&&window.SCIslands.side),null,{timeout:8000}).catch(()=>err("module React non chargé"));
    await pg.evaluate(()=>{window.__par=async(ids,fn)=>{const norm=el=>[...el.querySelectorAll("*")].map(e=>e.tagName+"|"+[...e.attributes].filter(a=>a.name!=="style").map(a=>a.name+"="+a.value).sort().join(",")+"|"+(e.getAttribute("style")?e.style.cssText:"")+"|"+(e.children.length?"":e.textContent.trim())).join("\n");
      fn();await new Promise(r=>setTimeout(r,60));const out={},a={},react=ids.every(id=>Object.keys($(id)).some(k=>k.startsWith("__reactContainer")));ids.forEach(id=>a[id]=norm($(id)));
      const sv=ids.map(id=>{const el=$(id),c=el.cloneNode(false);c.classList.remove("notr");el.id=id+"R";el.after(c);c.id=id;c.innerHTML="";return[el,c,id]});
      window.__noIslands=true;try{fn()}finally{window.__noIslands=false}await new Promise(r=>setTimeout(r,60));
      sv.forEach(([el,c,id])=>{const b=norm(c);if(a[id]!==b){const al=a[id].split("\n"),bl=b.split("\n");out[id]=al.length+"/"+bl.length+" "+(al.find((l,i)=>l!==bl[i])||"")+" <> "+(bl.find((l,i)=>l!==al[i])||"")}c.remove();el.id=id});return{react,out}}});
    const check=async(lbl,ids,fnSrc)=>{const r=await pg.evaluate(([ids,src])=>window.__par(ids,eval(src)),[ids,fnSrc]);
      if(!r.react)err(lbl+" : pas rendu par React");for(const[id,d]of Object.entries(r.out))err(lbl+" : "+id+" différent : "+d.slice(0,300))};
    await pg.evaluate(()=>{data.todos=[{id:"x",title:"x",createdAt:new Date().toISOString(),done:false}];save();show("todo")});
    for(const v of ["todo","nutri","notes"])await check("navigation "+v,["navIn","vhead","side"],`()=>{show("${v}")}`);
    await pg.evaluate(()=>show("todo"));
    // pastilles : nombre puis point « en cours »
    await pg.evaluate(()=>setBadge("todo",7));if(await pg.evaluate(()=>{const b=document.querySelector('#navIn [data-go="todo"] .sbadge');return b&&b.textContent})!=="7")err("pastille 7 absente");
    await pg.evaluate(()=>setBadge("todo","dot"));if(!(await pg.evaluate(()=>!!document.querySelector('#navIn [data-go="todo"] .sbadge.dot'))))err("pastille « en cours » absente");
    await pg.evaluate(()=>setBadge("todo",0));if(await pg.evaluate(()=>!!document.querySelector('#navIn [data-go="todo"] .sbadge')))err("pastille pas retirée");
    // clics : barre du bas, retour à l'accueil, barre latérale
    if(nm==="mobile"){await pg.click('#navIn [data-go="plan"]');if(await pg.evaluate(()=>data.ui.view)!=="plan")err("barre du bas : clic sans effet");
      await pg.click('#vhead [data-go="home"]');await pg.waitForTimeout(400);if(await pg.evaluate(()=>data.ui.view)!=="home")err("retour à l'accueil sans effet")}
    else{await pg.click('#side [data-go="notes"]');if(await pg.evaluate(()=>data.ui.view)!=="notes")err("barre latérale : clic sans effet");
      await pg.click('#side .side-tog');if(!(await pg.evaluate(()=>document.body.classList.contains("side-off"))))err("masquer la barre latérale sans effet");
      await pg.click("#sideShow");if(!(await pg.evaluate(()=>document.body.classList.contains("side-on"))))err("réafficher la barre latérale sans effet")}
    if(lg==="en"&&/Aujourd'hui|Ajouter|Tâches|Masquer/.test(await pg.evaluate(()=>$("side").textContent+$("navIn").textContent)))err("textes non traduits en anglais");
    await pg.evaluate(()=>{show("todo");$("toast").style.display="none"});await shot(pg,"v61-"+nm+"-navigation");
    await ctx.close()}
  const real=errs.filter(Boolean);
  console.log(real.length?"ERREURS :\n"+real.join("\n"):"OK : aucune erreur. Captures dans tests/out/");
  await b.close();process.exit(real.length?1:0);
})();
