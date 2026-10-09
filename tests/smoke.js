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
    for(const v of ["plan","todo","muscu","docs","more"]){await pg.click(`.tab[data-v=${v}]`);await pg.waitForTimeout(250);await shot(pg,`${scheme}-fr-${v}`)}
    await pg.selectOption("#langSel","en");await pg.waitForTimeout(1200);
    for(const v of ["plan","todo","docs","more"]){await pg.click(`.tab[data-v=${v}]`);await pg.waitForTimeout(250);await shot(pg,`${scheme}-en-${v}`)}
    await ctx.close();
  }
  console.log(errs.length?"ERREURS :\n"+errs.join("\n"):"OK : aucune erreur JavaScript. Captures dans tests/out/");
  await b.close();process.exit(errs.length?1:0);
})();
