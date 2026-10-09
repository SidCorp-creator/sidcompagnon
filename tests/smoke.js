// Test rapide avant chaque mise en ligne (iPhone 13 simulé, clair + sombre, FR + EN).
// Prérequis une fois : npm i -D playwright && npx playwright install chromium
// Lance :  node tests/smoke.js   → captures dans tests/out/, erreurs JS affichées à la fin
const {chromium,devices}=require("playwright"),fs=require("fs"),path=require("path");
require("./serve.js");
const OUT=path.join(__dirname,"out");fs.mkdirSync(OUT,{recursive:true});
const U="http://localhost:8766/",shot=(pg,n)=>pg.screenshot({path:path.join(OUT,n+".png")});
(async()=>{
  const b=await chromium.launch(),errs=[];
  for(const scheme of ["light","dark"]){
    const ctx=await b.newContext({...devices["iPhone 13"],colorScheme:scheme}),pg=await ctx.newPage();
    pg.on("pageerror",e=>errs.push(scheme+": "+e.message));
    await pg.goto(U);await pg.waitForTimeout(400);await shot(pg,scheme+"-01-connexion");
    await pg.click("#mSignup");await pg.fill("#aName","Test");await pg.fill("#aEmail",scheme+"@test.be");
    await pg.fill("#aPw","secret1");await pg.fill("#aPw2","secret1");await pg.click("#aBtn");await pg.waitForTimeout(1500);
    if(await pg.isVisible("#onb")){await shot(pg,scheme+"-02-presentation");await pg.click("#onbGo")}
    await pg.click(".tab[data-v=todo]");await pg.fill("#todoIn","Tâche de test");await pg.press("#todoIn","Enter");
    await pg.click(".tab[data-v=docs]");await pg.setInputFiles("#docImport",path.join(__dirname,"Contrat de bail.pdf"));await pg.waitForTimeout(800);
    // v19 : catégorie repliable, tri des documents, notes, coffre à mots de passe
    await pg.click(".tab[data-v=todo]");await pg.click("[data-tcatnew]");await pg.fill("#catIn","Projet");await pg.press("#catIn","Enter");
    await pg.fill("#todoIn","Tâche du projet");await pg.press("#todoIn","Enter");await pg.click('[data-tcat="all"]');
    await pg.click('[data-tfold]');if((await pg.textContent("#todoOpen")).includes("Tâche du projet"))errs.push(scheme+": la catégorie ne se replie pas");
    await shot(pg,scheme+"-fr-todo-replie");await pg.click('[data-tfold]');
    await pg.click(".tab[data-v=docs]");await pg.setInputFiles("#docImport",path.join(__dirname,"photo.jpg"));await pg.waitForTimeout(800);
    await pg.click('[data-dsort="alpha"]');const first=await pg.textContent("#docList .doc-open b");if(first!=="Contrat de bail")errs.push(scheme+": tri A→Z incorrect ("+first+")");
    await pg.click(".tab[data-v=notes]");await pg.click("#noteNew");await pg.fill("#noteTitle","Idées");await pg.fill("#noteBody","Première ligne\nDeuxième ligne");
    await shot(pg,scheme+"-fr-note-edition");await pg.click("#noteBack");await pg.waitForTimeout(200);
    if(!(await pg.textContent("#noteList")).includes("Idées"))errs.push(scheme+": note non enregistrée");
    await pg.click(".tab[data-v=pwd]");await shot(pg,scheme+"-fr-pwd-code");
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
    await pg.click(".tab[data-v=todo]");
    for(const v of ["plan","todo","notes","muscu","docs","pwd","more"]){await pg.click(`.tab[data-v=${v}]`);await pg.waitForTimeout(250);await shot(pg,`${scheme}-fr-${v}`)}
    await pg.selectOption("#langSel","en");await pg.waitForTimeout(1200);
    for(const v of ["plan","todo","notes","docs","pwd","more"]){await pg.click(`.tab[data-v=${v}]`);await pg.waitForTimeout(250);await shot(pg,`${scheme}-en-${v}`)}
    await pg.click("#replayOnb");await pg.waitForTimeout(200);await shot(pg,scheme+"-en-presentation");
    await ctx.close();
  }
  console.log(errs.length?"ERREURS :\n"+errs.join("\n"):"OK : aucune erreur JavaScript. Captures dans tests/out/");
  await b.close();process.exit(errs.length?1:0);
})();
