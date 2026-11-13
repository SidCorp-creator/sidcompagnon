// v85 : une tâche dont le texte contient des chiffres (« 4-5 », « 10/12 »…) est enregistrée telle quelle, sans date devinée.
// Avant : « 4-5 » était lu comme le 4 mai (tâche planifiée des mois plus tard, texte amputé : « 2-3 séries » → « séries »).
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
const PORT=process.env.PORT||8766;
(async()=>{const b=await chromium.launch();const errors=[];
 for(const fallback of [false,true]){const tag=fallback?'secours':'react';
  const c=await b.newContext({...devices['iPhone 13'],locale:'fr-BE',timezoneId:'Europe/Brussels'}),p=await c.newPage();p.setDefaultTimeout(7000);
  await p.clock.install({time:new Date('2026-11-13T10:00:00+01:00')});
  await c.addInitScript(f=>{window.__noIntro=true;window.__noIslands=f},fallback);
  p.on('pageerror',e=>errors.push(tag+': '+e.message));
  await p.goto('http://localhost:'+PORT);await p.fill('#aName','Camille');await p.fill('#aEmail',`chiffres-${Date.now()}-${tag}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
  await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
  await p.evaluate(()=>show('todo'));
  const add=async v=>{await p.fill('#todoIn',v);await p.press('#todoIn','Enter');
    assert.equal(await p.inputValue('#todoIn'),'',`${tag} : le champ est vidé après « ${v} »`);
    return p.evaluate(()=>{const t=data.todos[data.todos.length-1];return {title:t.title,day:t.day||null}})};
  // texte gardé tel quel, aucune date
  for(const v of ['4-5','10/12','3h-4h','2-3 séries','12','1.5','Lire chapitres 4-5','Réviser 14h','4 marches','Payer 12.50','Série 3.5.2','Dentiste le 31/02','Relire le 12/00']){
    const before=await p.evaluate(()=>data.todos.length),t=await add(v);
    assert.equal(await p.evaluate(()=>data.todos.length),before+1,`${tag} : « ${v} » est enregistrée`);
    assert.deepEqual(t,{title:v,day:null},`${tag} : « ${v} » telle quelle, sans date`);
    assert.ok(await p.evaluate(v=>[...document.querySelectorAll('#v-todo .ttl')].some(x=>x.textContent.includes(v)),v),`${tag} : « ${v} » visible dans la liste`)}
  // les dates sans équivoque planifient toujours (v39)
  assert.deepEqual(await add('Appeler maman demain'),{title:'Appeler maman',day:'2026-11-14'});
  assert.deepEqual(await add('Dentiste le 12/12'),{title:'Dentiste',day:'2026-12-12'});
  assert.deepEqual(await add('Rendre le rapport 4-5-2027'),{title:'Rendre le rapport',day:'2027-05-04'});
  assert.deepEqual(await add('Faire 4-5 séries le 12/12'),{title:'Faire 4-5 séries',day:'2026-12-12'});
  assert.deepEqual(await add('Examen 2 mars'),{title:'Examen',day:'2027-03-02'});
  // une erreur d'enregistrement s'affiche et le texte reste dans le champ
  await p.evaluate(()=>{window.__push=data.todos.push;data.todos.push=()=>{throw Error('panne simulée')}});
  await p.fill('#todoIn','Tâche en panne');await p.press('#todoIn','Enter');
  assert.match(await p.textContent('#toast'),/Tâche non enregistrée.*panne simulée/,`${tag} : l'erreur est affichée`);
  assert.equal(await p.inputValue('#todoIn'),'Tâche en panne',`${tag} : le texte reste pour réessayer`);
  await p.evaluate(()=>{data.todos.push=window.__push});
  // panne pendant l'enregistrement lui-même : rien n'est gardé à moitié
  const n0=await p.evaluate(()=>{window.__save=save;window.save=()=>{throw Error('disque plein')};return data.todos.length});
  await p.fill('#todoIn','Tâche 7-8');await p.press('#todoIn','Enter');
  assert.match(await p.textContent('#toast'),/Tâche non enregistrée.*disque plein/);assert.equal(await p.inputValue('#todoIn'),'Tâche 7-8');
  assert.equal(await p.evaluate(()=>{window.save=window.__save;return data.todos.length}),n0,`${tag} : pas de tâche fantôme`);
  console.log(tag,'OK');await c.close()}
 await b.close();assert.deepEqual(errors,[]);console.log('taches-chiffres OK')})().catch(e=>{console.error(e);process.exit(1)});
