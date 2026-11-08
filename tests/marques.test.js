// v76 : noms de marque — aucune ancienne graphie dans ce que l'app affiche (pages, scripts, traductions, manifeste, icônes).
// Règle (charte § 2) : « Sid » + apostrophe droite U+0027 + nom avec majuscule : Sid'Compagnon, Sid'Journée, Sid'Forme, Sid'Note, Sid'Bot.
// Les commentaires de code, les identifiants techniques et la fonction serveur « mcp » (ancien connecteur, hors app) ne sont pas contrôlés.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ctx={};vm.runInNewContext(fs.readFileSync(path.join(root,'site/i18n.js'),'utf8')+';this.MARQUES=MARQUES;this.DICT=DICT',ctx);
assert.deepEqual({...ctx.MARQUES},{compagnon:"Sid'Compagnon",journee:"Sid'Journée",forme:"Sid'Forme",note:"Sid'Note",bot:"Sid'Bot"});
const BAD=[[/Sid[  ](Journée|Forme|Coffre|Note|Bot|Compagnon)/,'espace au lieu de l’apostrophe'],[/Sid[’ʼ`´]/,'apostrophe typographique'],
 [/\bSid'(compagnon|journée|forme|note|bot|coffre)\b/,'minuscule après l’apostrophe'],[/\bSid'?Coffre\b|\bSidCoffre\b|\bSidNote\b|\bSidJournée\b|\bSidForme\b/,'ancien nom'],
 [/\bSid'(home|agenda|fit)\b/i,'ancien nom d’app']];
const files=[];const walk=d=>{for(const f of fs.readdirSync(path.join(root,d),{withFileTypes:true})){const p=path.join(d,f.name);
 if(f.isDirectory()){if(!['lib','fonts','exercices','react','node_modules'].includes(f.name))walk(p)}else if(/\.(html|js|tsx|ts|webmanifest|svg|txt|xml|json)$/.test(f.name))files.push(p)}};
walk('site');walk('app/src');files.push('supabase/functions/rappels/index.ts');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).replace(/(^|[^:"'`\\])\/\/[^\n]*/g,'$1').replace(/<!--[\s\S]*?-->/g,m=>m.replace(/[^\n]/g,' '));
// lignes où l'ancienne graphie est volontaire : remise à niveau de vieux textes (sid'agenda → Sid'Journée), import d'une ancienne sauvegarde, référencement
const ALLOW=[/replaceAll\("sid'agenda"/,/\(sidnote\|Sid'note\)/,/"alternateName"/,/sid'agenda\|sid'fit\|sid'note/];
const errs=[];
for(const f of files){if(f==='site/app.js')continue;const lines=strip(fs.readFileSync(path.join(root,f),'utf8')).split('\n');
 lines.forEach((l,i)=>{if(ALLOW.some(r=>r.test(l)))return;for(const [re,why] of BAD){const m=l.match(re);if(m)errs.push(`${f}:${i+1} ${why} : « ${m[0]} »`)}})}
// traductions anglaises : mêmes noms qu'en français
for(const [fr,en] of Object.entries(ctx.DICT)){for(const n of Object.values(ctx.MARQUES))if(fr.includes(n)&&!en.includes(n))errs.push(`i18n : « ${n} » absent de la traduction de « ${fr.slice(0,60)} »`)}
// surfaces de métadonnées
const man=JSON.parse(fs.readFileSync(path.join(root,'site/manifest.webmanifest'),'utf8'));assert.equal(man.name,"Sid'Compagnon");assert.equal(man.short_name,"Sid'Compagnon");
const html=fs.readFileSync(path.join(root,'site/index.html'),'utf8');assert.match(html,/<title>Sid'Compagnon<\/title>/);assert.match(html,/apple-mobile-web-app-title" content="Sid'Compagnon"/);
if(errs.length){console.error(errs.slice(0,60).join('\n'));console.error(`${errs.length} problème(s) de nom de marque`);process.exit(1)}
console.log(`OK : noms de marque (${files.length} fichiers, ${Object.keys(ctx.DICT).length} traductions)`);
