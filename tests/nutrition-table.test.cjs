// v85 : table nutritionnelle de référence et calculs faits par le code (jamais demandés à la personne, jamais laissés au modèle).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.resolve(__dirname,'../supabase/functions/_shared/nutrition-table.js'),'utf8');
const T=new Function(src.replace('export function','function')+';return createNutritionTable()')();
const one=(t,o)=>T.parseFoodText(t,o).items[0],prop=(t,o={})=>T.mealProposal(t,{date:'2026-11-13',locale:'fr',...o});
// 1. « 50 g de flocons d'avoine » : chiffré directement, sans aucune question
{const p=prop("j'ai mangé 50 g de flocons d'avoine"),x=p.actions[0].payload.items[0];
 assert.deepEqual([x.name,x.g,x.kcal,x.p,x.c,x.f],["Flocons d'avoine",50,187,6.7,30,3.5]);
 assert.equal(p.reply,"Total : 187 kcal · P 6,7 g · G 30 g · L 3,5 g\nJe l'enregistre ?");assert.equal(p.actions[0].type,'log_meal');assert.equal(p.actions[0].payload.date,'2026-11-13');
 assert.equal((p.reply.match(/\?/g)||[]).length,1,'une seule question : la confirmation');assert.equal(prop("50 g de flocons d'avoine").actions[0].payload.items[0].kcal,187,'sans « j\'ai mangé » aussi')}
// 2. « 150 g de riz cru » : fiche crue
{const x=one('150 g de riz cru');assert.deepEqual([x.name,x.kcal,x.weight_state,x.p,x.c,x.f],['Riz blanc cru',525,'raw',10.5,116.3,1.2]);assert.equal(x.assumed_state,undefined)}
// 3. pièces et portions : « 2 œufs et une banane »
{const r=T.parseFoodText('2 œufs et une banane');assert.deepEqual(r.items.map(x=>[x.name,x.qty,x.g,x.kcal]),[['Œuf entier','2',110,154],['Banane','1',120,108]]);assert.equal(r.items[0].unit_g,55);assert.equal(r.statement,true)}
// 4. quantité absente : portion standard retenue et dite, sans question
{const p=prop("J'ai mangé du riz"),x=p.actions[0].payload.items[0];assert.deepEqual([x.name,x.g,x.kcal],['Riz blanc cuit',180,257]);
 assert.match(p.reply,/Quantité non précisée, portion standard retenue : Riz blanc cuit \(180 g\)\./);assert.match(p.reply,/État de pesée non précisé, compté comme : Riz blanc cuit\./);assert.match(p.reply,/Je l'enregistre \?$/);
 assert.equal(x.assumed_qty,undefined,'les marqueurs internes ne partent pas dans le journal')}
// 5. aliment inconnu : pas de réponse locale (le modèle estime, marqué « estimé »), jamais de fiche prise au hasard
{const r=T.parseFoodText("j'ai mangé 30 g de kombucha de yuzu");assert.equal(r.items.length,0);assert.deepEqual(r.unknown.map(u=>[u.name,u.g]),[['kombucha de yuzu',30]]);assert.equal(prop("j'ai mangé 30 g de kombucha de yuzu"),null);
 assert.equal(T.find('riz au lait'),null,'« riz au lait » n\'est pas du riz');assert.equal(T.find('fromage blanc').name,'Fromage blanc 3 %');assert.equal(T.find('lait entier').name,'Lait entier')}
// 6. accents, pluriels, cuisson : la bonne fiche crue ou cuite
assert.equal(one('200 g de pâtes cuites').kcal,334);assert.equal(one('200g de PATES crues').kcal,728);assert.equal(one('120 g de poulet grillé').name,'Filet de poulet cuit');
assert.equal(one('200 g de frites au four').name,'Frites cuites au four');assert.equal(one('200 g de frites au four',{prefer:'raw'}).name,'Frites surgelées pour four, crues');assert.equal(one('150 g de frites à la friteuse').name,'Frites cuites en friteuse');
assert.equal(one('150 g de viande hachée 5% crue').kcal,195);assert.equal(one('150 g de viande hachée',{prefer:'raw'}).name,'Bœuf haché 10 % MG cru');assert.equal(one('100 g de lentilles sèches').kcal,327);
assert.equal(one('200 g de pommes de terre au four').name,'Pomme de terre cuite au four');assert.equal(one('200 g de riz').assumed_state,true);
// 7. unités : cuillères, kg, ml, quantité en fin de phrase, virgule décimale
assert.deepEqual([one("1 c. à s. d'huile d'olive").g,one("1 c. à s. d'huile d'olive").kcal],[13.5,122]);assert.equal(one('1 cuillère à café de miel').g,7);assert.equal(one('0,5 kg de pommes de terre crues').g,500);
assert.equal(one('lait entier 250 ml').kcal,163);assert.equal(one('3 galettes de riz').g,27);assert.equal(one('1,5 tranche de pain complet').g,52.5);
// 8. ce qui n'est pas un repas pris n'est pas noté
for(const t of ['Que manger ce soir ?','Explique-moi mon programme','Bonjour'])assert.equal(prop(t),null,t);
// 9. dîner 983 kcal, poids crus : viande hachée + frites au four + wrap → ajusté par le code, wrap entier, pas de 5 g
{const items=[{name:'Wrap',g:62},{name:'Viande hachée 5 %',g:150,cooking_method:'four'},{name:'Frites au four',g:250,cooking_method:'four'},{name:"Huile d'olive",g:5}].map(x=>T.recalcItem(x,{prefer:'raw'}));
 assert.deepEqual(items.map(x=>[x.name,x.kcal,x.weight_state,x.source]),[['Wrap',198,'unspecified','table'],['Bœuf haché 5 % MG cru',195,'raw','table'],['Frites surgelées pour four, crues',355,'raw','table'],["Huile d'olive",45,'unspecified','table']]);
 const f=T.fit(items,983);assert.equal(f.ok,true);assert.ok(Math.abs(f.kcal-983)<=983*.015,'écart ≤ 1,5 % ('+f.kcal+')');assert.equal(f.kcal,f.items.reduce((t,x)=>t+x.kcal,0),'le total est la somme des lignes affichées');
 assert.equal(f.items[0].g,62,'wrap entier');assert.equal(f.items[3].g,5,'huile inchangée');assert.ok(f.items.slice(1,3).every(x=>x.g%5===0&&x.g>0));assert.ok(f.items[1].g>150&&f.items[2].g>250)}
// 10. menu impossible à ajuster : signalé (le serveur redemande une fois, puis renonce) ; un total déjà juste n'est pas retouché
assert.equal(T.fit([{name:'Wrap de blé',g:62,kcal:198,p:5,c:33,f:4.7,unit_g:62,role:'starch'}],983).ok,false);
{const ok=[{name:'Riz blanc cru',g:100,kcal:350,p:7,c:77.5,f:.8,role:'starch'}],f=T.fit(ok,352);assert.equal(f.items[0].g,100);assert.equal(f.ok,true)}
// 11. aliment absent de la table : valeurs fournies gardées et marquées « estimé »
{const x=T.recalcItem({name:'Kombucha de yuzu',g:30,kcal:12,p:0,c:3,f:0});assert.equal(x.estimated,true);assert.equal(x.kcal,12);assert.match(T.mealText([x]),/Estimé : Kombucha de yuzu\./)}
// 12. table saine : aucune valeur aberrante (kcal cohérentes avec 4/4/9), noms uniques, « cru » ou « cuit » dans le nom des fiches concernées, aucun emoji
{const names=new Set();for(const r of T.rows){const [name,alias,state,kcal,p,c,f,role,unit,portion]=r,calc=4*p+4*c+9*f;
  assert.ok(!names.has(name),'doublon '+name);names.add(name);assert.ok(kcal>=0&&kcal<=900&&p>=0&&c>=0&&f>=0&&p+c+f<=100.5,name);
  assert.ok(Math.abs(kcal-calc)<=Math.max(30,kcal*.25), // marge : les fibres des légumineuses et des graines comptent dans les kcal, pas dans les glucides
   `${name} : ${kcal} kcal annoncées, ${Math.round(calc)} d'après les macros`);
  assert.ok(portion>0&&unit>=0&&alias.length>0,name);assert.ok(['starch','protein','fat','veg','fruit','dairy','sauce','sweet','other'].includes(role),name);
  if(state==='r')assert.match(name,/cru|sec|sèche/i,name);if(state==='c')assert.match(name,/cuit|grillé|rôti|dur|plat|Omelette|pané/i,name);
  assert.doesNotMatch(name,/\p{Extended_Pictographic}/u);assert.ok(T.find(name),'introuvable par son propre nom : '+name);assert.equal(T.find(name).name,name,'le nom mène à sa fiche : '+name)}
 assert.ok(T.rows.length>=150,'au moins 150 aliments courants ('+T.rows.length+')')}
console.log('nutrition table: 50 g oats / 150 g raw rice / pieces / missing quantity / unknown food / states / units / non-meals / 983 kcal fit / impossible fit / estimates / '+T.rows.length+' sane rows OK');
