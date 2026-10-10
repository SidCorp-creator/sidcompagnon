// Test rapide avant chaque mise en ligne (iPhone 13 simulé, clair + sombre, FR + EN).
// Prérequis une fois : npm i -D playwright && npx playwright install chromium
// Lance :  node tests/smoke.js   → captures dans tests/out/, erreurs JS affichées à la fin
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
    // navigation : catégorie en bas, puis fonction dans la barre du haut
    const go=async v=>{await pg.click(`nav .tab[data-g=${G[v]}]`);if(await pg.isVisible(`#subnav [data-sub=${v}]`))await pg.click(`#subnav [data-sub=${v}]`);await pg.waitForTimeout(150)};
    await pg.goto(U);await pg.waitForTimeout(400);await shot(pg,scheme+"-01-connexion");
    await pg.click("#mSignup");await pg.fill("#aName","Test");await pg.fill("#aEmail",scheme+"@test.be");
    await pg.fill("#aPw","secret1");await pg.fill("#aPw2","secret1");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){await shot(pg,scheme+"-02-presentation");await pg.click("#onbGo")}
    await go("todo");await pg.fill("#todoIn","Tâche de test");await pg.press("#todoIn","Enter");
    await go("docs");await pg.setInputFiles("#docImport",path.join(__dirname,"Contrat de bail.pdf"));await pg.waitForTimeout(800);
    // v19 : catégorie repliable, tri des documents, notes, coffre à mots de passe
    await go("todo");await pg.click("[data-tcatnew]");await pg.fill("#catIn","Projet");await pg.press("#catIn","Enter");
    await pg.fill("#todoIn","Tâche du projet");await pg.press("#todoIn","Enter");await pg.click('[data-tcat="all"]');
    await pg.click('[data-tfold]');if((await pg.textContent("#todoOpen")).includes("Tâche du projet"))errs.push(scheme+": la catégorie ne se replie pas");
    await shot(pg,scheme+"-fr-todo-replie");await pg.click('[data-tfold]');
    await go("docs");await pg.setInputFiles("#docImport",path.join(__dirname,"photo.jpg"));await pg.waitForTimeout(800);
    await pg.click('[data-dsort="alpha"]');
    // classeurs : création, import dedans, recherche du classeur, protection par code
    await pg.click("[data-dfoldnew]");await pg.fill("#folderIn","Admin");await pg.press("#folderIn","Enter");
    await pg.setInputFiles("#docImport",path.join(__dirname,"Contrat de bail.pdf"));await pg.waitForTimeout(600);
    await pg.fill("#folderSearch","zzz");if(!(await pg.textContent("#docList")).includes("Aucun document"))errs.push(scheme+": recherche du classeur incorrecte");await pg.fill("#folderSearch","");
    await pg.click("[data-dflock]");await pg.waitForSelector("#pinSheet:not([hidden])");const ps2=async c=>{for(const d of c)await pg.click(`[data-ps="${d}"]`)};
    await ps2("13579");await pg.waitForTimeout(300);await ps2("13579");await pg.waitForSelector("#recSheet:not([hidden])",{timeout:8000});await pg.click("#recLater");
    await shot(pg,scheme+"-fr-docs-classeur");await pg.evaluate(()=>dvLock());await pg.click('[data-dfold="all"]');
    const vis=await pg.$$eval("#docList .doc",x=>x.length);if(vis!==2)errs.push(scheme+": document d'un classeur protégé visible ("+vis+")");const first=await pg.textContent("#docList .doc-open b");if(first!=="Contrat de bail")errs.push(scheme+": tri A→Z incorrect ("+first+")");
    await go("notes");await pg.click("#noteNew");await pg.fill("#noteTitle","Idées");await pg.fill("#noteBody","Première ligne\nDeuxième ligne");
    await shot(pg,scheme+"-fr-note-edition");await pg.click("#noteBack");await pg.waitForTimeout(200);
    if(!(await pg.textContent("#noteList")).includes("Idées"))errs.push(scheme+": note non enregistrée");
    // notes secrètes : cadenas, code choisi deux fois, contenu chiffré, réouverture avec le code
    const ps=async c=>{for(const d of c)await pg.click(`[data-ps="${d}"]`)};
    await pg.click("#noteList [data-note]");await pg.click("#noteLock");await pg.waitForSelector("#pinSheet:not([hidden])");
    await ps("24680");await pg.waitForTimeout(300);await ps("24680");
    await pg.waitForSelector("#recSheet:not([hidden])",{timeout:8000});await shot(pg,scheme+"-fr-recuperation");await pg.fill("#recPw","faux");await pg.click("#recOk");await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#recErr")))errs.push(scheme+": mauvais mot de passe de compte accepté");
    await pg.fill("#recPw","secret1");await pg.click("#recOk");await pg.waitForSelector("#recSheet",{state:"hidden",timeout:8000});
    await pg.waitForSelector("#pinSheet",{state:"hidden",timeout:8000});await pg.waitForTimeout(300);
    if((await pg.textContent("#noteList")).includes("Idées"))errs.push(scheme+": note secrète visible sans code");
    if((await pg.evaluate(()=>JSON.stringify(data.notes))).includes("Première"))errs.push(scheme+": note secrète stockée en clair");
    await shot(pg,scheme+"-fr-notes-secrete");
    await pg.click("#noteList [data-note]");await pg.waitForSelector("#pinSheet:not([hidden])");await shot(pg,scheme+"-fr-notes-code");
    await ps("11111");await pg.waitForTimeout(1500);if(!(await pg.isVisible("#pinSheet")))errs.push(scheme+": mauvais code accepté (notes)");
    await ps("24680");await pg.waitForSelector("#noteEdit:not([hidden])",{timeout:8000});
    if(await pg.inputValue("#noteTitle")!=="Idées")errs.push(scheme+": note secrète mal relue");
    await pg.fill("#noteBody","Texte modifié en secret");await pg.click("#noteBack");await pg.waitForTimeout(300);
    if((await pg.evaluate(()=>JSON.stringify(data.notes))).includes("modifié"))errs.push(scheme+": modification d'une note secrète stockée en clair");
    await pg.click("[data-nslock]");if((await pg.textContent("#noteList")).includes("Idées"))errs.push(scheme+": verrouillage des notes secrètes inopérant");
    await go("pwd");await shot(pg,scheme+"-fr-pwd-code");
    const pin=async c=>{for(const d of c)await pg.click(`[data-pin="${d}"]`)};
    await pin("12345");await pg.waitForTimeout(300);await pin("54321");await pg.waitForTimeout(400);
    if(await pg.isVisible("#vault"))errs.push(scheme+": codes différents acceptés");
    await pin("12345");await pg.waitForTimeout(300);await pin("12345");await pg.waitForSelector("#vault:not([hidden])",{timeout:8000});
    await pg.waitForSelector("#recSheet:not([hidden])",{timeout:8000});await pg.fill("#recPw","secret1");await pg.click("#recOk");await pg.waitForSelector("#recSheet",{state:"hidden",timeout:8000});
    await pg.click("#pwNew");await pg.fill("#pwSite","Netflix");await pg.fill("#pwUser","sid@mail.be");await pg.click("#pwGen");await pg.click("#pwForm [type=submit]");
    await pg.click("[data-pweye]");await shot(pg,scheme+"-fr-pwd-coffre");
    const stored=await pg.evaluate(()=>JSON.stringify(data.pwds));if(stored.includes("Netflix"))errs.push(scheme+": mot de passe stocké en clair");
    await pg.click("#pwLock");await pin("11111");await pg.waitForTimeout(1500);if(await pg.isVisible("#vault"))errs.push(scheme+": mauvais code accepté");
    // code oublié : retrouvé grâce au mot de passe du compte, sans rien effacer
    await pg.click("#pinForgot");await pg.waitForSelector("#recSheet:not([hidden])");await pg.fill("#recPw","secret1");await pg.click("#recOk");
    await pg.waitForSelector("#vault:not([hidden])",{timeout:8000});await pg.waitForTimeout(300);
    if(!(await pg.textContent("#pwList")).includes("Netflix"))errs.push(scheme+": mot de passe non relu après déverrouillage");
    // v20 : nutrition (faux Claude du serveur de test)
    await go("nutri");
    // accès réservé : un compte quelconque voit « Bientôt disponible », flouté
    if(!(await pg.isVisible("#v-nutri .soon")))errs.push(scheme+": nutrition non verrouillée pour un compte non autorisé");await shot(pg,scheme+"-fr-nutri-bientot");
    await pg.evaluate(()=>{NUTRI_ALLOW.push(session.email);renderNutri()});await shot(pg,scheme+"-fr-nutri-profil");
    await pg.click('[data-sex="h"]');await pg.fill("#nuAge","24");await pg.fill("#nuHeight","180");await pg.fill("#nuWeight","72");
    await pg.fill('[data-sp="0"][data-f="name"]',"Musculation");await pg.fill('[data-sp="0"][data-f="freq"]',"4");await pg.fill('[data-sp="0"][data-f="dur"]',"1h15");
    await pg.click('[data-goal="gain"]');await pg.click('[data-pace="fast"]');await pg.fill("#nuTarget","80");await shot(pg,scheme+"-fr-nutri-profil-rempli");await pg.click("#nuCalc");await pg.waitForSelector("#nuMain:not([hidden])",{timeout:8000});
    if(!(await pg.isVisible("#nuGoalCard")))errs.push(scheme+": alerte de délai irréaliste absente");await shot(pg,scheme+"-fr-nutri-objectif");
    await pg.fill("#nuAsk","1 barre chocolatée");await pg.click("#nuAskBtn");await pg.waitForSelector("[data-nuadd]",{timeout:8000});await shot(pg,scheme+"-fr-nutri-resultat");
    await pg.click("[data-nuadd]");await pg.waitForTimeout(200);if(!(await pg.textContent("#nuKcal")).includes("246"))errs.push(scheme+": calories du jour incorrectes");
    await pg.click("#nuPrev");await pg.click("#nuManual");await pg.fill("#nuEName","Pâtes");await pg.fill("#nuEKcal","500");await pg.click("#nuEntryForm [type=submit]");
    if(!(await pg.textContent("#nuKcal")).includes("500"))errs.push(scheme+": ajout a posteriori incorrect");await pg.click("#nuNext");
    // photo du plat, puis suppression d'un plat
    await pg.setInputFiles("#nuPhoto",path.join(__dirname,"photo.jpg"));await pg.waitForSelector("[data-nuadd]",{timeout:8000});await shot(pg,scheme+"-fr-nutri-photo");
    await pg.click("[data-nuadd]");await pg.waitForTimeout(300);await shot(pg,scheme+"-fr-nutri-plats");
    const before=await pg.$$eval("#nuLog .dish",x=>x.length);await pg.click("#nuLog [data-nudelg]");await pg.click("#nuLog [data-nudelg]");await pg.waitForTimeout(200);
    if(await pg.$$eval("#nuLog .dish",x=>x.length)!==before-1)errs.push(scheme+": suppression d'un plat impossible");
    await pg.click("#nuMenuSec summary");await pg.fill("#nuInclude","poulet");await pg.click("#nuMenuBtn");await pg.waitForSelector("[data-numeal]",{timeout:8000});
    await shot(pg,scheme+"-fr-nutri-menu");
    // v21 : graphiques et bilans
    await go("graph");await pg.fill("#grWIn","72,5");await pg.click("#grWForm [type=submit]");await pg.waitForTimeout(200);
    await pg.click('[data-rev="day"]');await pg.waitForSelector('#grDay [data-rev="day"]',{timeout:8000});
    await pg.click('[data-rev="week"]');await pg.waitForSelector('#grWeek [data-rev="week"]',{timeout:8000});await pg.waitForTimeout(200);
    if(!(await pg.textContent("#grWeeks")).includes("Semaine"))errs.push(scheme+": suivi des semaines absent");
    await shot(pg,scheme+"-fr-graph");await pg.evaluate(()=>window.scrollTo(0,700));await shot(pg,scheme+"-fr-graph-bas");await pg.evaluate(()=>window.scrollTo(0,1500));await shot(pg,scheme+"-fr-graph-bilan");
    // v20 : couleur
    await go("more");if(!(await pg.isVisible("#accentSel")))await pg.click('[data-sec="look"] summary');await pg.click('[data-accent="vert"]');await shot(pg,scheme+"-fr-reglages-apparence");
    await pg.click('[data-sec="tabs"] summary');await shot(pg,scheme+"-fr-reglages-onglets");
    for(const v of ["plan","todo","notes","muscu","nutri","graph","docs","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-fr-${v}`)}
    await go("more");if(!(await pg.isVisible("#langSel")))await pg.click('[data-sec="look"] summary');await pg.selectOption("#langSel","en");await pg.waitForTimeout(1200);await pg.evaluate(()=>{NUTRI_ALLOW.push(session.email);applySoon()});
    for(const v of ["plan","todo","notes","nutri","graph","docs","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-en-${v}`)}
    if(!(await pg.isVisible("#replayOnb")))await pg.click('[data-sec="tabs"] summary');await pg.click("#replayOnb");await pg.waitForTimeout(200);await shot(pg,scheme+"-en-presentation");
    await ctx.close();
  }
  console.log(errs.length?"ERREURS :\n"+errs.join("\n"):"OK : aucune erreur JavaScript. Captures dans tests/out/");
  await b.close();process.exit(errs.length?1:0);
})();
