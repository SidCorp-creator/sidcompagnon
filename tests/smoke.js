// Test rapide avant chaque mise en ligne (iPhone 13 simulé, clair + sombre, FR + EN).
// Prérequis une fois : npm i -D playwright && npx playwright install chromium
// Lance :  node tests/smoke.js   → captures dans tests/out/, erreurs JS affichées à la fin
const {chromium,devices}=require("playwright"),fs=require("fs"),path=require("path");
require("./serve.js");
const OUT=path.join(__dirname,"out");fs.mkdirSync(OUT,{recursive:true});
const G={plan:"orga",todo:"orga",pomo:"orga",muscu:"sport",nutri:"sport",notes:"perso",docs:"perso",pwd:"perso",more:"more",app:"more"};
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
    await pg.click('[data-dsort="alpha"]');const first=await pg.textContent("#docList .doc-open b");if(first!=="Contrat de bail")errs.push(scheme+": tri A→Z incorrect ("+first+")");
    await go("notes");await pg.click("#noteNew");await pg.fill("#noteTitle","Idées");await pg.fill("#noteBody","Première ligne\nDeuxième ligne");
    await shot(pg,scheme+"-fr-note-edition");await pg.click("#noteBack");await pg.waitForTimeout(200);
    if(!(await pg.textContent("#noteList")).includes("Idées"))errs.push(scheme+": note non enregistrée");
    await go("pwd");await shot(pg,scheme+"-fr-pwd-code");
    const pin=async c=>{for(const d of c)await pg.click(`[data-pin="${d}"]`)};
    await pin("12345");await pg.waitForTimeout(300);await pin("54321");await pg.waitForTimeout(400);
    if(await pg.isVisible("#vault"))errs.push(scheme+": codes différents acceptés");
    await pin("12345");await pg.waitForTimeout(300);await pin("12345");await pg.waitForSelector("#vault:not([hidden])",{timeout:8000});
    await pg.click("#pwNew");await pg.fill("#pwSite","Netflix");await pg.fill("#pwUser","sid@mail.be");await pg.click("#pwGen");await pg.click("#pwForm [type=submit]");
    await pg.click("[data-pweye]");await shot(pg,scheme+"-fr-pwd-coffre");
    const stored=await pg.evaluate(()=>JSON.stringify(data.pwds));if(stored.includes("Netflix"))errs.push(scheme+": mot de passe stocké en clair");
    await pg.click("#pwLock");await pin("11111");await pg.waitForTimeout(1500);if(await pg.isVisible("#vault"))errs.push(scheme+": mauvais code accepté");
    await pin("12345");await pg.waitForSelector("#vault:not([hidden])",{timeout:8000});await pg.waitForTimeout(300);
    if(!(await pg.textContent("#pwList")).includes("Netflix"))errs.push(scheme+": mot de passe non relu après déverrouillage");
    // v20 : nutrition (faux Claude du serveur de test)
    await go("nutri");await shot(pg,scheme+"-fr-nutri-profil");
    await pg.click('[data-sex="h"]');await pg.fill("#nuAge","24");await pg.fill("#nuHeight","180");await pg.fill("#nuWeight","72");
    await pg.fill('[data-sp="0"][data-f="name"]',"Musculation");await pg.fill('[data-sp="0"][data-f="freq"]',"4");await pg.fill('[data-sp="0"][data-f="min"]',"75");
    await pg.click('[data-goal="gain"]');await pg.click("#nuCalc");await pg.waitForSelector("#nuMain:not([hidden])",{timeout:8000});
    await pg.fill("#nuAsk","1 kinder bueno");await pg.click("#nuAskBtn");await pg.waitForSelector("[data-nuadd]",{timeout:8000});await shot(pg,scheme+"-fr-nutri-resultat");
    await pg.click("[data-nuadd]");await pg.waitForTimeout(200);if(!(await pg.textContent("#nuKcal")).includes("246"))errs.push(scheme+": calories du jour incorrectes");
    await pg.click("#nuPrev");await pg.click("#nuManual");await pg.fill("#nuEName","Pâtes");await pg.fill("#nuEKcal","500");await pg.click("#nuEntryForm [type=submit]");
    if(!(await pg.textContent("#nuKcal")).includes("500"))errs.push(scheme+": ajout a posteriori incorrect");await pg.click("#nuNext");
    await pg.click("#nuMenuSec summary");await pg.fill("#nuInclude","poulet");await pg.click("#nuMenuBtn");await pg.waitForSelector("[data-numeal]",{timeout:8000});
    await shot(pg,scheme+"-fr-nutri-menu");
    // v20 : couleur
    await go("more");if(!(await pg.isVisible("#accentSel")))await pg.click('[data-sec="look"] summary');await pg.click('[data-accent="vert"]');await shot(pg,scheme+"-fr-reglages-apparence");
    await pg.click('[data-sec="tabs"] summary');await shot(pg,scheme+"-fr-reglages-onglets");
    for(const v of ["plan","todo","notes","muscu","nutri","docs","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-fr-${v}`)}
    await go("more");if(!(await pg.isVisible("#langSel")))await pg.click('[data-sec="look"] summary');await pg.selectOption("#langSel","en");await pg.waitForTimeout(1200);
    for(const v of ["plan","todo","notes","nutri","docs","pwd","more"]){await go(v);await pg.waitForTimeout(250);await shot(pg,`${scheme}-en-${v}`)}
    if(!(await pg.isVisible("#replayOnb")))await pg.click('[data-sec="tabs"] summary');await pg.click("#replayOnb");await pg.waitForTimeout(200);await shot(pg,scheme+"-en-presentation");
    await ctx.close();
  }
  console.log(errs.length?"ERREURS :\n"+errs.join("\n"):"OK : aucune erreur JavaScript. Captures dans tests/out/");
  await b.close();process.exit(errs.length?1:0);
})();
