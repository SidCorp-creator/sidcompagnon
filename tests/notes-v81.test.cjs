// Parcours v81 sur faux Supabase. Lancer tests/serve.js avant ce test.
const {chromium}=require('../app/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
 const p=await browser.newPage({viewport:{width:390,height:844}});
 p.on('pageerror',console.error);
 await p.addInitScript(()=>{window.__noIntro=true});
 await p.goto('http://localhost:'+(process.env.SID_SITE_PORT||8766));
 await p.fill('#aName','Pagination');await p.fill('#aEmail',`pagination-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');await p.click('#onbSkip');
 await p.evaluate(()=>{show('notes');const n={id:'long',title:'Longue',body:'',html:'<p><b>'+('Texte préservé et éditable. '.repeat(360))+'</b></p>',upd:Date.now()};NT().push(n);openNote(n.id)});
 await p.waitForSelector('#notePageControls:not([hidden])');
 const body=p.locator('#noteBody');
 assert.ok(await body.evaluate(e=>e.querySelector('b').getClientRects().length>2));
 await p.click('#notePageNext');
 await p.locator('#notePagePosition').filter({hasText:'2 / '}).waitFor();
 await body.focus();await p.keyboard.press('Control+End');await p.keyboard.type('Fin');
 assert.ok(await p.evaluate(()=>noteFind('long').html.includes('Fin')));
 assert.ok(await p.evaluate(async()=>{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const caret=getSelection().getRangeAt(0).getBoundingClientRect();
   const viewport=$('notePages').getBoundingClientRect();
   return caret.x>=viewport.left-1&&caret.x<=viewport.right+1;
 }),'le curseur reste dans la page visible');
 await p.keyboard.press('Control+z');
 assert.ok(!(await body.innerHTML()).includes('Fin'));
 assert.equal(await p.locator('#v-docs,#v-pwd').count(),0);
 await p.evaluate(async()=>{await closeNote();show('projects')});
 await p.fill('#projectName','Dossier v81');
 await p.click('#projectForm button');
 await p.locator('#projectList h2').filter({hasText:'Dossier v81'}).waitFor();
 await p.evaluate(()=>{moveNoteToProject(noteFind('long'))});
 await p.locator('#actList [data-act]').filter({hasText:'Dossier v81'}).click();
 await p.locator('[data-project-note=long]').waitFor();
 await p.click('#navIn [data-go=pomo]');
 await p.click('#pomoStart');
 await p.evaluate(()=>{P.run.startAt-=120000;save();finishPomo(false)});
 await p.click('#navIn [data-go=projects]');
 await p.click('#projectBack');
 await p.locator('[data-project-session]').click();
 await p.locator('#actList [data-act]').filter({hasText:'Dossier v81'}).click();
 await p.locator('[data-project]').filter({hasText:'Dossier v81'}).click();
 assert.equal(await p.locator('[data-project-session]').count(),1);
 await p.evaluate(async()=>{
   const salt=rnd(16),mk=await phDerive('phrase de test du coffre',salt,PIN_ITER);
   data.phx={id:'fixture-phrase',salt,iter:PIN_ITER,chk:await encJ(mk.key,{ok:true})};
   const docs=await v2Make(mk,'sidnote-docs'),passwords=await v2Make(mk,'sidnote');
   data.docVault=docs.v;data.vault=passwords.v;
   await mkWrap('main','12345',mk);
   data.docs=[{id:'one',title:'Résumé',up:false,folder:'folder'}];
   data.docFolders=[{id:'folder',name:'Archive'}];
   data.pwds=[{id:'one',vid:passwords.v.id,...await encJ(passwords.key,{site:'https://example.com',user:'test',pw:'secret,"x"',note:'texte'})}];
   const bytes=await CC().docEncryptBytes(new TextEncoder().encode('%PDF-1.4 test').buffer,docs.key);
   await idb.put(docKey(data.docs[0]),new Blob([bytes],{type:'application/pdf'}));
   show('more');$('vaultExport').closest('details').open=true;
 });
 const files=new Map();
 for(const [id,filename] of [['exportVaultDocs','sidcompagnon-documents.zip'],['exportVaultPasswords','sidcompagnon-mots-de-passe.csv']]){
   await p.click('#'+id);
   await p.waitForSelector('#pinSheet:not([hidden])');
   const download=p.waitForEvent('download');
   await p.keyboard.type('12345');
   const file=await download;
   assert.equal(file.suggestedFilename(),filename);
   const chunks=[];for await(const chunk of await file.createReadStream())chunks.push(chunk);
   files.set(id,Buffer.concat(chunks));
 }
 const zip=files.get('exportVaultDocs');
 const zipEntries=new Map();
 for(let at=0;zip.readUInt32LE(at)===0x04034b50;){
   const size=zip.readUInt32LE(at+18),label=zip.readUInt16LE(at+26),body=at+30+label;
   zipEntries.set(zip.toString('utf8',at+30,body),zip.toString('utf8',body,body+size));
   at=body+size;
 }
 assert.equal(zipEntries.get('1 - Résumé.pdf'),'%PDF-1.4 test');
 assert.equal(JSON.parse(zipEntries.get('documents.json')).folders[0].name,'Archive');
 assert.match(files.get('exportVaultPasswords').toString(),/"secret,""x"""/);
 assert.equal(await p.evaluate(async()=>{
   const salt=rnd(16),key=await pinKey('54321',salt,PIN_ITER);
   data.noteVault={id:'note-v1',salt,iter:PIN_ITER,chk:await encJ(key,{ok:true})};
   const secret={id:'legacy-note',secret:true,vid:'note-v1',...await encJ(key,{title:'Note v1',body:'texte'})};
   data.notes.push(secret);
   const archives=JSON.stringify([data.vault,data.docVault,data.pwds,data.docs]);
   const upgraded=await v2Upgrade('54321',key);
   return isV2(data.noteVault)&&secret.vid===data.noteVault.id&&
     (await decJ(upgraded,secret)).title==='Note v1'&&JSON.stringify([data.vault,data.docVault,data.pwds,data.docs])===archives;
 }),true,'migration v1 du coffre des notes indépendante des archives');
 console.log('Pagination, projets, Focus, exports ZIP et CSV OK');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});