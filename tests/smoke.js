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
  for(const scheme of ["light","dark"]){
    const ctx=await b.newContext({...devices["iPhone 13"],colorScheme:scheme}),pg=await ctx.newPage();
    pg.on("pageerror",e=>errs.push(scheme+": "+e.message));
    pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))errs.push(scheme+" CSP : "+m.text().slice(0,200))});
    const err=m=>errs.push(scheme+": "+m);
    // navigation v28 : espace dans la barre du bas, puis fonction dans les pastilles du haut
    const closePin=async()=>{if(await pg.isVisible("#pinSheet"))await pg.click("#psClose").catch(()=>{})};
    const go=async v=>{await closePin();await pg.click(`#navIn [data-dock="${G[v]}"]`);await pg.waitForTimeout(150);await closePin();
      if(v!=="more"&&await pg.isVisible(`#vhead [data-go="${v}"]`))await pg.click(`#vhead [data-go="${v}"]`);await pg.waitForTimeout(200);await closePin()};
    const cur=()=>pg.evaluate(()=>data.ui.view);
    const email=scheme+"@test.be";

    // --- connexion : œil, blocage après 5 erreurs, mot de passe oublié
    await pg.goto(U);await pg.waitForTimeout(400);
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
    await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){await shot(pg,scheme+"-02-presentation");await pg.click("#onbSkip");await pg.waitForTimeout(400)}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{["plan","todo","pomo","notes","muscu","nutri","graph","docs","pwd","app"].forEach(k=>data.prefs.tabs[k]=true);save();applyTabs()});

    // --- barre du bas : Aujourd'hui, Organisation, Santé, Coffre, Compte (plus de « + » ni d'« Espaces »)
    const dock=await pg.$$eval("#navIn [data-dock]",x=>x.map(e=>e.dataset.dock).join(","));
    if(dock!=="home,orga,sport,perso,more")err("barre du bas inattendue : "+dock);
    await shot(pg,scheme+"-03-aujourdhui");
    await pg.click("#homeAdd");if(!(await pg.isVisible("#qaSheet")))err("le + de la page Aujourd'hui n'ouvre pas l'ajout rapide");await pg.click("#qaClose");
    await pg.click('#navIn [data-dock="perso"]');await pg.waitForTimeout(200);await closePin();
    if(G[await cur()]!=="perso")err("Coffre n'ouvre pas une fonction du coffre");
    if((await pg.$$("#vhead .vseg [data-go]")).length!==3)err("pastilles du Coffre absentes");
    await go("notes");await go("muscu");await pg.click('#navIn [data-dock="perso"]');await pg.waitForTimeout(200);await closePin();
    if(await cur()!=="notes")err("l'espace ne rouvre pas la dernière fonction ouverte");

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
    await pg.click('#navIn [data-dock="home"]');await pg.click("#homeAdd");await pg.waitForTimeout(150);
    if(!(await pg.evaluate(()=>document.documentElement.classList.contains("modal-open"))))err("le fond n'est pas figé sous l'ajout rapide");
    await shot(pg,scheme+"-fr-ajout-rapide");await pg.click("#qaClose");await pg.waitForTimeout(150);
    if(await pg.evaluate(()=>document.documentElement.classList.contains("modal-open")))err("le fond reste figé après fermeture");
    // --- v29 : chrono de la musculation à sa place
    await go("muscu");if(await pg.$eval("#rest",e=>getComputedStyle(e).position)!=="sticky")err("le chrono ne suit plus la séance");
    await pg.evaluate(()=>{const sp=document.createElement("div");sp.id="spacer";sp.style.height="2000px";document.getElementById("v-muscu").appendChild(sp);window.scrollTo(0,600)});await pg.waitForTimeout(400);
    if(!(await pg.$eval("#rest",e=>e.classList.contains("stuck"))))err("le chrono collé ne devient pas compact");
    await shot(pg,scheme+"-fr-muscu-chrono-compact");await pg.evaluate(()=>{document.getElementById("spacer").remove();window.scrollTo(0,0)});
    // --- v29 : code des Documents dans la page, grand clavier
    await go("docs");await pg.waitForTimeout(300);
    if(await pg.isVisible("#pinSheet"))err("le code des Documents s'ouvre encore dans une fenêtre");
    if(!(await pg.isVisible("#docPinHost #psPad")))err("clavier du code absent de la page Documents");
    await shot(pg,scheme+"-fr-docs-code");
    // --- v29 : ambiances de couleurs
    await go("more");if(!(await pg.isVisible("#palSel")))await pg.click('[data-sec="look"] summary');
    await pg.click('[data-pal="saphir"]');if(await pg.evaluate(()=>document.documentElement.dataset.palette)!=="saphir")err("ambiance Saphir non appliquée");
    await pg.locator("#palSel").scrollIntoViewIfNeeded();await shot(pg,scheme+"-fr-couleurs-saphir");
    await pg.click('[data-pal="emeraude"]');await go("todo");await shot(pg,scheme+"-fr-todo-emeraude");
    await go("more");await pg.click('[data-pal="or"]');if(await pg.evaluate(()=>document.documentElement.dataset.palette))err("retour à Noir & or impossible");
    // --- v31 : Nutrition : « à inclure / à éviter » propres à chaque repas ; délai pré-rempli en modifiant le profil
    await go("nutri");await pg.evaluate(()=>{const n=NU();n.profile={sex:"h",age:24,height:180,weight:72,goal:"gain",target:80,sports:[]};n.plan={kcal:2500,p:150,c:300,f:80,bmr:1800,tdee:2400,text:"",warn:[],wg:{ok:false,wk:.3,weeks:26,advice:"x"}};
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
    await pg.click('#navIn [data-dock="home"]');await shot(pg,scheme+"-en-home");
    // v31 : néerlandais
    await go("more");if(!(await pg.isVisible("#langSel")))await pg.click('[data-sec="look"] summary');await pg.selectOption("#langSel","nl");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    if(await pg.evaluate(()=>document.documentElement.lang)!=="nl")err("le néerlandais ne s'active pas");
    for(const v of ["plan","todo","notes","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-nl-${v}`)}
    const nlLeft=await pg.evaluate(()=>{show("todo");return document.querySelector("#v-todo h1").textContent});if(nlLeft.trim()==="Tâches")err("titres non traduits en néerlandais");
    await pg.click('#navIn [data-dock="home"]');await shot(pg,scheme+"-nl-home");
    await ctx.close();
  }
  // --- ordinateur (écran large) : barre latérale et rendu épuré
  for(const scheme of ["light","dark"]){
    const ctx=await b.newContext({viewport:{width:1440,height:900},colorScheme:scheme}),pg=await ctx.newPage();
    pg.on("pageerror",e=>errs.push("pc "+scheme+": "+e.message));
    await pg.goto(U);await pg.waitForTimeout(400);await shot(pg,scheme+"-pc-connexion");
    await pg.click("#mSignup");await pg.fill("#aName","Sid");await pg.fill("#aEmail","pc-"+scheme+"@test.be");await pg.fill("#aPw","secret11");await pg.fill("#aPw2","secret11");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb"))await pg.click("#onbSkip");if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    await pg.evaluate(()=>{["plan","todo","pomo","notes","muscu","nutri","graph","docs","pwd","app"].forEach(k=>data.prefs.tabs[k]=true);
      data.todos.push({id:"a",title:"Préparer la présentation",createdAt:new Date().toISOString(),done:false},{id:"b",title:"Appeler le garage",createdAt:new Date().toISOString(),done:false});save();applyTabs();renderAll()});
    for(const v of ["home","todo","plan","more"]){await pg.evaluate(v=>show(v),v);await pg.waitForTimeout(300);await shot(pg,`${scheme}-pc-${v}`)}
    await ctx.close();
  }
  // --- v32 : un compte sans accès ne voit ni Nutrition ni Graphiques ; la page d'ouverture choisie est respectée
  {const ctx=await b.newContext({...devices["iPhone 13"]}),pg=await ctx.newPage(),err=m=>errs.push("sans accès : "+m);
    pg.on("pageerror",e=>err(e.message));pg.on("console",m=>{if(/Content Security Policy/i.test(m.text()))err("CSP : "+m.text().slice(0,200))});
    await pg.goto(U);await pg.waitForTimeout(400);
    await pg.click("#mSignup");await pg.fill("#aName","Proche");await pg.fill("#aEmail","sans@test.be");await pg.fill("#aPw","court1");await pg.fill("#aPw2","court1");await pg.click("#aBtn");await pg.waitForTimeout(500);
    if(!(await pg.isVisible("#aErr"))||!(await pg.textContent("#aErr")).includes("8 caractères"))err("mot de passe de 6 caractères accepté à l'inscription");
    await pg.fill("#aPw","assezlong1");await pg.fill("#aPw2","assezlong1");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){if(await pg.locator('#onbGroups [data-onbk="nutri"],#onbGroups [data-onbk="graph"]').count())err("Nutrition proposée dans la présentation");
      await shot(pg,"sans-acces-presentation-sport").catch(()=>{});await pg.click("#onbSkip")}
    if(await pg.isVisible("#notifAsk"))await pg.click("#naNo");
    const vis=await pg.evaluate(()=>visibleTabs().join(","));if(/nutri|graph/.test(vis))err("onglets réservés visibles : "+vis);
    await pg.click('#navIn [data-dock="sport"]');await pg.waitForTimeout(300);await shot(pg,"sans-acces-sante");
    if(await pg.locator('#vhead [data-go="nutri"],#vhead [data-go="graph"]').count())err("pastille Nutrition visible");
    await pg.evaluate(()=>{show("nutri")});if(await pg.evaluate(()=>data.ui.view)==="nutri")err("Nutrition s'ouvre quand même");
    await pg.evaluate(()=>{data.prefs.home="todo";save()});await pg.waitForTimeout(1500);await pg.reload();await pg.waitForTimeout(1200);
    if(await pg.evaluate(()=>data.ui.view)!=="todo")err("la page d'ouverture choisie (Tâches) n'est pas respectée");
    const opts=await pg.$$eval("#homeSel option",o=>o.map(x=>x.value).join(","));if(/nutri|graph/.test(opts))err("Nutrition proposée comme page d'ouverture");
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
    await pg.click("#mSignup");await pg.fill("#aName","Coffre");await pg.fill("#aEmail","coffre@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.click("#aBtn");await pg.waitForTimeout(1500);
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
    st=await pg.evaluate(()=>({v:data.noteVault.v,vid:data.notes.find(x=>x.id==="n1").vid===data.noteVault.id,txt:document.getElementById("noteBody").value}));
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
    await pg.click("#mSignup");await pg.fill("#aName","Sauve");await pg.fill("#aEmail","sauve@test.be");await pg.fill("#aPw","motdepasse1");await pg.fill("#aPw2","motdepasse1");await pg.click("#aBtn");await pg.waitForTimeout(1500);
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
  const real=errs.filter(Boolean);
  console.log(real.length?"ERREURS :\n"+real.join("\n"):"OK : aucune erreur. Captures dans tests/out/");
  await b.close();process.exit(real.length?1:0);
})();
