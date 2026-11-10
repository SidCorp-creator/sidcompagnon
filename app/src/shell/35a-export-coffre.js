/* ---------- export de l’ancien coffre ---------- */
function renderVaultExport(){
  const docs=docsArr().length,passwords=PW().length;
  $("vaultExport").hidden=!docs&&!passwords;
  $("exportVaultDocs").hidden=!docs;
  $("exportVaultPasswords").hidden=!passwords;
}

async function vaultExportKey(v,head){
  if(!v||!v.chk)throw new Error(L("Le code de ce coffre est indisponible."));
  if(isV2(v)&&!mkHas("main")){
    const mk=await mkNeed({mode:"enter",title:head});
    return mk?await v2Key(v,mk):null;
  }
  let key=null;
  const code=await askPin({mode:"unlock",ctx:"main",head,sub:"Entre ton code.",rec:isV2(v)?null:v.rec,phrase:isV2(v),verify:async c=>{
    try{key=await vOpen(v,c,"main");return true}catch(e){return false}
  }});
  if(code==="forgot"&&isV2(v)){
    const newCode=await devSetup("main",head,true);
    return newCode?await vOpen(v,newCode,"main"):null;
  }
  return code?key:null;
}

const vaultZipCrc=Uint32Array.from({length:256},(_,i)=>{
  for(let bit=0;bit<8;bit++)i=(i>>>1)^((i&1)?0xedb88320:0);
  return i;
});
async function vaultZip(files){
  const enc=new TextEncoder(),body=[],directory=[];
  let offset=0,directorySize=0;
  if(files.length>65535)throw new Error(L("Le coffre est trop volumineux pour un seul fichier ZIP."));
  for(const {name,blob} of files){
    const label=enc.encode(name),size=blob.size;
    const local=new Uint8Array(30),central=new Uint8Array(46);
    const a=new DataView(local.buffer),b=new DataView(central.buffer);
    let crc=0xffffffff;
    for(const byte of new Uint8Array(await blob.arrayBuffer()))crc=(crc>>>8)^vaultZipCrc[(crc^byte)&255];
    crc^=0xffffffff;
    a.setUint32(0,0x04034b50,true);a.setUint16(4,20,true);a.setUint16(6,0x800,true);
    a.setUint16(12,33,true);a.setUint32(14,crc,true);a.setUint32(18,size,true);
    a.setUint32(22,size,true);a.setUint16(26,label.length,true);
    b.setUint32(0,0x02014b50,true);b.setUint16(4,20,true);
    central.set(local.subarray(4,30),6);
    b.setUint32(42,offset,true);
    body.push(local,label,blob);directory.push(central,label);
    offset+=local.length+label.length+size;
    directorySize+=central.length+label.length;
    if(offset+directorySize+22>0xffffffff)throw new Error(L("Le coffre est trop volumineux pour un seul fichier ZIP."));
  }
  const end=new Uint8Array(22),c=new DataView(end.buffer);
  c.setUint32(0,0x06054b50,true);c.setUint16(8,files.length,true);c.setUint16(10,files.length,true);
  c.setUint32(12,directorySize,true);c.setUint32(16,offset,true);
  return new Blob([...body,...directory,end],{type:"application/zip"});
}

async function exportLegacyVault(kind){
  const status=$("vaultExportStatus"),buttons=[$("exportVaultDocs"),$("exportVaultPasswords")];
  if(buttons.some(b=>b.disabled))return;
  const account=session?.user.id;
  if(!account)return;
  const docs=kind==="docs",vault=docs?data.docVault:data.vault;
  const entries=[...(docs?docsArr():PW())];
  if(!entries.length)return;
  buttons.forEach(b=>b.disabled=true);
  status.hidden=true;
  try{
    const key=docs&&!vault?null:await vaultExportKey(vault,docs?"Documents":"Mots de passe");
    if(vault&&!key)return;
    const checkAccount=()=>{
      if(session?.user.id!==account||(docs?data.docVault:data.vault)?.id!==vault?.id)
        throw new Error(L("Le coffre a changé. Relance l’export."));
    };
    checkAccount();
    if(docs){
      const files=[],documents=[];
      for(const entry of entries){
        checkAccount();
        const title=pdfName(entry.title).replace(/[\u0000-\u001f]/g," ");
        const name=`${files.length+1} - ${title}`;
        files.push({name,blob:await docBlob(entry,key)});
        documents.push({file:name,title:entry.title,folder:entry.folder,createdAt:entry.createdAt});
      }
      const folders=(data.docFolders||[]).map(({id,name})=>({id,name}));
      files.push({name:"documents.json",blob:new Blob([JSON.stringify({documents,folders},null,2)],{type:"application/json"})});
      const archive=await vaultZip(files);
      checkAccount();
      downloadFile(archive,"sidcompagnon-documents.zip");
    }else{
      const rows=["name,url,username,password,note"];
      const csv=value=>'"'+String(value??"").replace(/"/g,'""')+'"';
      for(const entry of entries){
        if(entry.vid!==vault.id)throw new Error(L("Une entrée est protégée par un ancien code."));
        const value=await decJ(key,entry);
        rows.push([value.site,/^https?:\/\//i.test(value.site||"")?value.site:"",value.user,value.pw,value.note].map(csv).join(","));
      }
      checkAccount();
      downloadFile(new Blob([rows.join("\r\n")+"\r\n"],{type:"text/csv;charset=utf-8"}),"sidcompagnon-mots-de-passe.csv");
    }
    status.textContent=L("Vérifie le fichier téléchargé.");
    status.hidden=false;
  }catch(e){
    status.textContent=L("L’export a échoué. Vérifie le code et la disponibilité des données.");
    status.hidden=false;
  }finally{
    buttons.forEach(b=>b.disabled=false);
  }
}
$("exportVaultDocs").addEventListener("click",()=>exportLegacyVault("docs"));
$("exportVaultPasswords").addEventListener("click",()=>exportLegacyVault("passwords"));
