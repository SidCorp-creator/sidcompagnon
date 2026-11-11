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
 await p.waitForFunction(()=>Number($('notePages').dataset.pages)>1);
 const body=p.locator('#noteBody');
 const initial=await body.innerHTML();
 const noGap=async()=>assert.equal(await p.evaluate(()=>{
   const body=$('noteBody'),top=body.getBoundingClientRect().top;
   const h=parseFloat(getComputedStyle($('notePages')).getPropertyValue('--page-height')),step=h+16;
   const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);let node;
   while(node=walker.nextNode()){
     const range=document.createRange();range.selectNodeContents(node);
     for(const rect of range.getClientRects()){
       if(!rect.width)continue;
       const y=(rect.top-top)%step;
       if(y<23||y+rect.height>h-23)return false;
     }
   }
   return document.documentElement.scrollWidth<=innerWidth+1;
 }),true,'toutes les lignes restent dans les feuilles, sans débordement horizontal');
 await noGap();
 assert.equal(await p.locator('#notePageNext,#notePagePrevious').count(),0);
 await body.focus();await p.keyboard.press('Control+End');await p.keyboard.insertText('Fin');
 assert.ok(await p.evaluate(()=>noteFind('long').html.includes('Fin')));
 await p.waitForTimeout(100);
 assert.ok(await p.evaluate(()=>{
   const caret=getSelection().getRangeAt(0).getBoundingClientRect();
   return caret.top>=$('noteEdit').querySelector('.coffre-editor-chrome').getBoundingClientRect().bottom&&caret.bottom<=innerHeight;
 }),'curseur visible après recalcul des pages');
 await p.keyboard.press('Control+z');
 assert.equal(await body.innerHTML(),initial,'annulation native sans modification du DOM par la pagination');
 await p.setViewportSize({width:1280,height:844});await p.waitForTimeout(100);await noGap();
 await p.setViewportSize({width:320,height:440});await p.waitForTimeout(100);await noGap();
 await p.setViewportSize({width:390,height:844});
 // Rich blocks and a selection spanning several sheets use the same native undo stack.
 await p.evaluate(()=>{
   const n=noteFind('long');n.html='<h2>Titre conservé</h2><p><b>'+('Paragraphe très long. '.repeat(600))+'</b></p><ol><li>'+('Liste longue. '.repeat(120))+'<ul><li><i>Liste imbriquée</i></li></ul></li></ol><hr><p><a href="https://example.com">Lien conservé</a></p>';
   $('noteTitle').focus();rtSet(n);$('noteBody').focus();
 });
 await p.waitForTimeout(100);await noGap();
 const rich=await body.innerHTML(),plain=await body.innerText();
 await p.evaluate(()=>{
   const text=$('noteBody').querySelector('p b').firstChild,range=document.createRange();
   range.setStart(text,40);range.setEnd(text,4000);
   const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
 });
 await p.keyboard.insertText('Collage entre pages');await p.waitForTimeout(100);
 assert.ok((await body.innerText()).includes('Collage entre pages'));
 await p.keyboard.press('Control+z');assert.equal(await body.innerHTML(),rich);
 await noGap();
 await p.evaluate(()=>{
   const text=$('noteBody').querySelector('p b').firstChild,range=document.createRange();
   range.setStart(text,120);range.collapse(true);
   getSelection().removeAllRanges();getSelection().addRange(range);
   const data=new DataTransfer();data.setData('text/html','<i>Texte collé</i>');data.setData('text/plain','Texte collé');
   $('noteBody').dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));
 });
 assert.ok((await body.innerText()).includes('Texte collé'));
 assert.ok(await body.locator('i,em').filter({hasText:'Texte collé'}).count());
 await p.keyboard.press('Control+z');assert.equal(await body.innerHTML(),rich,'collage riche annulable');
 await noGap();
 await p.evaluate(async()=>{noteInput();await noteFlush()});
 assert.equal(await p.evaluate(()=>noteFind('long').body),plain.trim());
 assert.equal(await p.evaluate(()=>noteFind('long').html),rich);
 await p.evaluate(async()=>{await closeNote();openNote('long')});
 assert.equal(await body.innerHTML(),rich,'mise en forme conservée après réouverture');
 await noGap();
 assert.equal(await p.locator('#v-docs,#v-pwd').count(),0);
 // v82 : Projets retiré (écran, onglet, liens) ; une note et une séance Focus rattachées à un ancien projet restent dans Notes et Focus
 await p.evaluate(async()=>{await closeNote();data.noteProjects=[{id:'pj1',name:'Dossier v81',upd:Date.now()}];noteFind('long').project='pj1';save();show('projects')});
 assert.equal(await p.evaluate(()=>data.ui.view),'home','show("projects") ne mène plus nulle part');
 assert.equal(await p.locator('#v-projects,[data-go=projects],#projectList').count(),0,'plus aucun écran ni lien Projets');
 await p.evaluate(()=>show('notes'));
 await p.locator('#v-notes [data-note="long"]').first().waitFor();// la note rattachée à l'ancien projet reste dans Notes
 await p.click('#navIn [data-go=pomo]');
 await p.click('#pomoStart');
 await p.evaluate(()=>{P.run.startAt-=120000;save();finishPomo(false)});
 assert.equal(await p.evaluate(()=>focusSessions().length),1,'la séance Focus est enregistrée');
 assert.equal(await p.evaluate(()=>data.noteProjects.length),1,'les données des anciens projets sont gardées');
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
 console.log('Pagination, Projets retiré, Focus, exports ZIP et CSV OK');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});