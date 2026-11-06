// Adaptation explicite des attentes visuelles v74 retirées par décision de Sid.
// smoke.js reste intact ; les autres scénarios et leurs erreurs sont conservés.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'smoke.js');let source=fs.readFileSync(filename,'utf8');
if(process.env.ELAN_SMOKE_URL)source=source.replaceAll("http://localhost:8766",process.env.ELAN_SMOKE_URL);
const replace=(from,to)=>{if(!source.includes(from))throw Error('Adaptation smoke introuvable : '+from.slice(0,80));source=source.replace(from,to)};
replace('require("./serve.js");','// serveur local lancé séparément pour la comparaison');
replace('dataset.ds!=="edito"','dataset.ds!=="elan"');
// Les scénarios historiques du calendrier complet passent maintenant par son volet d’options.
// T16 B : les fixtures de résultat Nutrition ouvrent la feuille de repas pour tester les mêmes commandes ; elle se referme quand le résultat est effacé.
replace('const b=await chromium.launch(),errs=[];',`const b=await chromium.launch(),errs=[];
 const oldPage=b.newPage.bind(b);const prepare=p=>{const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const r=await ev(...a);await ev(()=>{if(typeof nuPending!=="undefined"&&data.ui.view==="nutri")$("nuMealSheet").hidden=!nuPending;if(typeof data!=="undefined"&&data.ui.view==="plan"){const d=document.querySelector('.journey-options');if(d)d.open=true}}).catch(e=>{if(!/Execution context was destroyed|Cannot find context/.test(e.message))throw e});return r};const rawClick=p.click.bind(p);p.click=async(selector,...args)=>{if(/^#(todo|cat|fold|doneView)/.test(selector)){const l=p.locator(selector);await l.evaluate(e=>e.scrollIntoView({block:"center"}));if(await ev(()=>matchMedia("(pointer:coarse)").matches&&visualViewport.offsetTop!==0)){const r=await l.boundingBox();if(r)return p.mouse.click(r.x+r.width/2,r.y+r.height/2)}}if((["#nuAskBtn","#nuAiLink"].includes(selector)||selector.startsWith("#nuFor "))&&!await p.isVisible(selector)&&await p.isVisible("#nuMealAdd"))await rawClick("#nuMealAdd");return rawClick(selector,...args)};const rawFill=p.fill.bind(p);p.fill=async(selector,...args)=>{if(selector==="#nuAsk"&&!await p.isVisible(selector))await rawClick("#nuMealAdd");return rawFill(selector,...args)};return p};
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
range('    await pg.fill("#muAsk","ajoute du dos à la séance B");','    // nutrition : un plat aujourd',`    await pg.evaluate(()=>{data.prefs.aiConv={muscu:"https://claude.ai/chat/elan-muscu",note:"https://claude.ai/chat/elan-note"};window.__open=[];window.open=u=>{window.__open.push(u);return null};show("muscu")});
    await pg.click('[data-app-claude]');if(await pg.evaluate(()=>window.__open.at(-1))!=="https://claude.ai/chat/elan-muscu")err("conversation Musculation non ouverte");
    await pg.evaluate(()=>show("notes"));await pg.click('[data-app-claude]');if(await pg.evaluate(()=>window.__open.at(-1))!=="https://claude.ai/chat/elan-note")err("conversation Notes non ouverte");
`);
// Le lien Claude se trouve maintenant dans la feuille des cinq méthodes d’ajout.
replace('if(!(await pg.isVisible("#nuAiLink")))err("lien « Ou dis-le à Claude » absent");','if(!(await pg.isVisible("#nuMealAdd"))||await pg.locator("#nuAiLink").count()!==1)err("entrée Claude absente de la feuille repas");');
// Le bandeau et les commandes de l’éditeur restent collés ensemble.
replace('return !!(el&&el.closest("#noteTop"))&&Math.round($("noteTop").getBoundingClientRect().top)===0','return !!(el&&el.closest(".coffre-editor-chrome"))&&Math.round(document.querySelector(".coffre-editor-chrome").getBoundingClientRect().top)===0');
// Photo/Galerie se trouvent dans la nouvelle feuille repas, ouverte par la vraie entrée.
replace('const ga=await pg.evaluate(()=>{const g=$("nuPhotoLib")','await pg.click("#nuMealAdd");const ga=await pg.evaluate(()=>{const g=$("nuPhotoLib")');
// Le temps de séance reste présent ; le glyphe chronomètre a été retiré par la charte.
replace('!/⏱ 2[56] min/.test(run.sub)','!/2[56] min/.test(run.sub)');
// Les commandes PDF à 44 px changent la hauteur disponible : dessiner dans la partie visible du papier.
{const a=source.indexOf('  // --- v65 ('),z=source.indexOf('  // --- v66 (',a);let part=source.slice(a,z);const changePdf65=(from,to)=>{if(!part.includes(from))throw Error('Adaptation PDF65 introuvable');part=part.replace(from,to)};
changePdf65("const ov=pg.locator('#pvBody .pv-page[data-pg=\"1\"] .pv-ov');let bb=await ov.boundingBox();","const ov=pg.locator('#pvBody .pv-page[data-pg=\"1\"] .pv-ov');const scrollPdf=async fraction=>{await ov.evaluate((e,f)=>{const b=e.closest(\".pv-body\"),r=b.getBoundingClientRect(),p=e.getBoundingClientRect();b.scrollTop+=p.top+p.height*f-(r.top+r.height/2)},fraction);await pg.waitForTimeout(100);return ov.boundingBox()};let bb=await scrollPdf(.45);");
changePdf65("await pg.click('[data-pvt=\"text\"]');await pg.mouse.click(bb.x+bb.width*.6,bb.y+bb.height*.2);","await pg.click('[data-pvt=\"text\"]');bb=await scrollPdf(.2);await pg.mouse.click(bb.x+bb.width*.6,bb.y+bb.height*.2);");
changePdf65("await pg.click('[data-pvt=\"erase\"]');bb=await ov.boundingBox();","await pg.click('[data-pvt=\"erase\"]');bb=await scrollPdf(.45);");
source=source.slice(0,a)+part+source.slice(z);}
// Après ajout, le journal reste visible et la feuille repas est fermée.
replace('await pg.locator("#nuAddBox").scrollIntoViewIfNeeded();await shot(pg,"v444-nutrition-jour-passe");','await pg.locator("#nuLog").scrollIntoViewIfNeeded();await shot(pg,"v444-nutrition-jour-passe");');
// Comptes distincts à chaque exécution du faux backend, même pour le smoke complet.
source=source.replaceAll('@test.be','+'+Date.now()+'@test.be');
// Le backend de test est partagé : limiter l’inspection des photos au compte du scénario.
replace('const ob2=await (await pg.request.get("http://localhost:8790/__objs")).json();','const ob2all=await (await pg.request.get("http://localhost:8790/__objs")).json(),owner=await pg.evaluate(()=>session.user.id),ob2=Object.fromEntries(Object.entries(ob2all).filter(([k])=>k.startsWith("documents/"+owner+"/")));');
// T16 D (décision de Sid) : le lien de conversation se règle en bas de chaque app, plus dans Réglages.
replace(`convSettings()});await pg.waitForTimeout(300);
    if(!(await pg.isVisible("#convNutri")))err("réglage des conversations introuvable");
    await pg.fill("#convNutri","https://claude.ai/share/abc");await pg.click('.conv-f[data-conv="nutri"]:not(.conv-tab-f) button');`,`convSettings("nutri")});await pg.waitForTimeout(300);
    if(!(await pg.isVisible('[data-convin="nutri"]')))err("réglage de la conversation Nutrition introuvable dans l'app");
    if(await pg.evaluate(()=>!!document.querySelector('#v-more .conv-f')))err("réglage des conversations encore dans Réglages");
    await pg.fill('[data-convin="nutri"]',"https://claude.ai/share/abc");await pg.click('[data-convtab="nutri"] [type=submit]');`);
replace(`await pg.fill("#convNutri","https://claude.ai/chat/1111-aaaa");await pg.click('.conv-f[data-conv="nutri"]:not(.conv-tab-f) button');
    await pg.fill("#convMuscu","https://claude.ai/project/2222-bbbb");await pg.click('.conv-f[data-conv="muscu"]:not(.conv-tab-f) button');`,`await pg.fill('[data-convin="nutri"]',"https://claude.ai/chat/1111-aaaa");await pg.click('[data-convtab="nutri"] [type=submit]');
    await pg.evaluate(()=>convSettings("muscu"));await pg.waitForTimeout(300);await pg.fill('[data-convin="muscu"]',"https://claude.ai/project/2222-bbbb");await pg.click('[data-convtab="muscu"] [type=submit]');`);
replace(`if(!(await pg.isVisible("#convNote"))||!(await pg.isVisible("#convAgenda")))err("conversations sid'agenda / sid'note absentes de « Avancé »");`,`if(!(await pg.isVisible('[data-convin="note"]')))err("conversation Sid Coffre absente en bas des Notes");await pg.evaluate(()=>{document.querySelectorAll(".conv-tab").forEach(d=>d.open=false);show("more");$("mcpSec").open=true});await pg.waitForTimeout(200);`);
// Ciblage facultatif pour isoler une régression ; sans variable, tous les scénarios tournent.
if(process.env.ELAN_SMOKE_SECTION){const points={pdf65:['  // --- v65 (','  // --- v66 ('],photo43:['  // --- v43 : Nutrition commence','  // --- v44 : séances'],v444:['  // --- v44.4 :','  // --- v45 :'],forms64:['  // --- v64 (','  // --- v65 ('],wizard68:['  // --- v68 (','  // --- v69 ('],mu73:['  // --- v73 :','  // --- v74 :'],v745:['  // --- v74.5 (','  const real=errs.filter(Boolean);'],sticky:['  // --- v43 : rien ne défile','  // --- v43 lot 5 :'],coffre:['  // --- v57 (','  // --- v58 ('],extra:['  // --- v59 (','  // --- v60 ('],calendar:['  // --- v50 (','  // --- v51 ('],nutrition:['  // --- v56 (','  // --- v57 ('],graph:['  // --- v51 (','  // --- v52 ('],todo:['  // --- v54 (','  // --- v55 ('],focus:['  // --- v55 (','  // --- v56 ('],nav:['  // --- v61 : barres','  // --- v62 ('],toast:['  // --- v69 (','  // --- v70 :'],parite:['  // --- v58 (','  // --- v59 ('],debut:['  for(const scheme of','  // --- v45 :'],v47:['  // --- v47 (','  // --- v49 ('],v44:['  // --- v44 : séances','  // --- v43 : rien ne défile'],v45:['  // --- v45 :','  // --- v46 (phase 1)'],suite:['  // --- v46 (phase 1)','  const real=errs.filter(Boolean);']},bounds=points[process.env.ELAN_SMOKE_SECTION];if(!bounds)throw Error('Section inconnue');source=source.slice(0,source.indexOf('  for(const scheme of'))+source.slice(source.indexOf(bounds[0]),source.indexOf(bounds[1]))+source.slice(source.indexOf('  const real=errs.filter(Boolean);'))}
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(__dirname);m._compile(source,filename);
