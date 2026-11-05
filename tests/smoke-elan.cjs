// Adaptation explicite des attentes visuelles v74 retirées par décision de Sid.
// smoke.js reste intact ; les autres scénarios et leurs erreurs sont conservés.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'smoke.js');let source=fs.readFileSync(filename,'utf8');
const replace=(from,to)=>{if(!source.includes(from))throw Error('Adaptation smoke introuvable : '+from.slice(0,80));source=source.replace(from,to)};
replace('require("./serve.js");','// serveur local lancé séparément pour la comparaison');
replace('dataset.ds!=="edito"','dataset.ds!=="elan"');
// Les scénarios historiques du calendrier complet passent maintenant par son volet d’options.
replace('const b=await chromium.launch(),errs=[];',`const b=await chromium.launch(),errs=[];
 const oldPage=b.newPage.bind(b);const prepare=p=>{const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const r=await ev(...a);await ev(()=>{if(typeof data!=="undefined"&&data.ui.view==="plan"){const d=document.querySelector('.journey-options');if(d)d.open=true}}).catch(e=>{if(!/Execution context was destroyed|Cannot find context/.test(e.message))throw e});return r};return p};
 const oldContext=b.newContext.bind(b);b.newContext=async(...a)=>{const c=await oldContext(...a),np=c.newPage.bind(c);c.newPage=async(...x)=>prepare(await np(...x));return c};`);
const range=(a,z,text)=>{const start=source.indexOf(a),end=source.indexOf(z,start);if(start<0||end<0)throw Error('Bornes smoke absentes');source=source.slice(0,start)+text+source.slice(end)};
range('    // v45.3 : ajouter une activité en la disant à Claude','    await shot(pg,"v45-"+nm+"-agenda");',`    // Élan : entrée Claude par bouton ; les champs et messages historiques ne sont plus une entrée d’interface.
    await pg.evaluate(()=>{show("plan");window.__open=[];window.open=u=>{window.__open.push(u);return null};data.prefs.aiConv={agenda:"https://claude.ai/chat/elan-smoke"}});
    await pg.click('[data-app-claude]');if(await pg.evaluate(()=>window.__open.at(-1))!=="https://claude.ai/chat/elan-smoke")err("bouton Claude : conversation perdue");
    await pg.click("#planSearchBtn");if(!(await pg.isVisible("#planSearch")))err("la loupe n'ouvre pas la recherche");await pg.fill("#planSearch","zzz");await pg.click("#planSearchBtn");
`);
range('    if(!(await pg.evaluate(()=>document.documentElement.hasAttribute("data-fx"))))err("style unique pas actif par défaut");','    const ov=await pg.evaluate(async()=>',`    // Les neuf identités et Unique/Sobre sont retirés ; leurs contrats sont remplacés par ceux d’Élan.
    if(await pg.evaluate(()=>document.documentElement.hasAttribute("data-fx")||!!$("fxSel")))err("ancienne identité encore active");
`);
range('    // v74.2 : onglet « Conversation Claude »','    // v74.2 : statistiques repliées',`    // Élan : conversation conservée dans les réglages et ouverte par le bouton fixe.
    await pg.evaluate(()=>{window.__open=[];window.open=u=>{window.__open.push(u);return null};data.prefs.aiConv={agenda:"https://claude.ai/chat/elan-smoke"};show("plan")});
    await pg.click('[data-app-claude]');if(await pg.evaluate(()=>window.__open.at(-1))!=="https://claude.ai/chat/elan-smoke")err("conversation Élan non ouverte");
`);
replace('err("pas d\'animation à l\'ouverture de sid\'fit")','void 0 /* remplacée par la liaison couleur Élan, testée dans elan.js */');
replace('if(!(await pg.isVisible("#appOutro")))err("pas d\'animation de sortie");','if(await pg.isVisible("#appOutro"))err("ancien écran de sortie encore présent");');
replace('else{if(await pg.isVisible("#side"))err("tablette : barre latérale ouverte par défaut");\n      await pg.click("#sideShow");await pg.waitForTimeout(200);if(!(await pg.isVisible("#side")))err("tablette : la barre latérale ne s\'ouvre pas");await shot(pg,"v43-tablette-barre")}','else{if(await pg.isVisible("#side")||await pg.isVisible("#sideShow"))err("tablette : navigation latérale avant 1024px")}');
source=source.replace('const b=await chromium.launch(),errs=[];', 'const b=await chromium.launch(),errs=[];globalThis.__smokeErrs=errs;');
process.on('unhandledRejection',e=>{console.error('Erreurs accumulées :',globalThis.__smokeErrs);console.error(e);process.exit(1)});
// Fermeture Élan à 180 ms au lieu de l’ancienne fermeture immédiate.
replace('await pg.keyboard.press("Escape");await pg.waitForTimeout(150);if(await pg.isVisible("#taskSheet"))','await pg.keyboard.press("Escape");await pg.waitForSelector("#taskSheet",{state:"hidden"});if(await pg.isVisible("#taskSheet"))');
// Titres déplacés dans le bandeau, noms approuvés et trois couleurs d’app remplacent neuf identités.
replace('document.querySelector("#v-muscu h1")','document.querySelector("#vhead .elan-title")');
replace('if(seen.size!==9)','if(seen.size!==3)');
source=source.replaceAll("sid'agenda — discussion avec Claude","Sid Journée — discussion avec Claude");
replace("await pg.click('[data-convtab=\"note\"] summary');",'await pg.evaluate(()=>convSettings("note"));await pg.waitForTimeout(200);');
replace("await pg.fill('[data-convin=\"note\"]',\"https://claude.ai/chat/3333-cccc\");await pg.click('[data-convtab=\"note\"] [type=submit]');",'await pg.fill("#convNote","https://claude.ai/chat/3333-cccc");await pg.click(\'.conv-f[data-conv="note"]:not(.conv-tab-f) [type=submit]\');');
range('    await pg.fill("#muAsk","ajoute du dos à la séance B");','    // nutrition : un plat aujourd',`    await pg.evaluate(()=>{data.prefs.aiConv={muscu:"https://claude.ai/chat/elan-muscu",note:"https://claude.ai/chat/elan-note"};window.__open=[];window.open=u=>{window.__open.push(u);return null};show("muscu")});
    await pg.click('[data-app-claude]');if(await pg.evaluate(()=>window.__open.at(-1))!=="https://claude.ai/chat/elan-muscu")err("conversation Musculation non ouverte");
    await pg.evaluate(()=>show("notes"));await pg.click('[data-app-claude]');if(await pg.evaluate(()=>window.__open.at(-1))!=="https://claude.ai/chat/elan-note")err("conversation Notes non ouverte");
`);
// Ciblage facultatif pour isoler une régression ; sans variable, tous les scénarios tournent.
if(process.env.ELAN_SMOKE_SECTION){const points={nav:['  // --- v61 : barres','  // --- v62 ('],toast:['  // --- v69 (','  // --- v70 :'],parite:['  // --- v58 (','  // --- v59 ('],debut:['  for(const scheme of','  // --- v45 :'],v47:['  // --- v47 (','  // --- v49 ('],v44:['  // --- v44 : séances','  // --- v43 : rien ne défile'],v45:['  // --- v45 :','  // --- v46 (phase 1)'],suite:['  // --- v46 (phase 1)','  const real=errs.filter(Boolean);']},bounds=points[process.env.ELAN_SMOKE_SECTION];if(!bounds)throw Error('Section inconnue');source=source.replaceAll('@test.be','+'+Date.now()+'@test.be');source=source.slice(0,source.indexOf('  for(const scheme of'))+source.slice(source.indexOf(bounds[0]),source.indexOf(bounds[1]))+source.slice(source.indexOf('  const real=errs.filter(Boolean);'))}
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(__dirname);m._compile(source,filename);
