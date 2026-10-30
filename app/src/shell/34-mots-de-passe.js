/* ---------- mots de passe (coffre chiffré par un code à 5 chiffres) ---------- */
// Le code ne quitte jamais l'appareil : il sert à fabriquer une clé (PBKDF2) qui chiffre chaque entrée (AES-GCM).
// Le serveur ne reçoit que du texte chiffré. Sans le code, impossible de relire les mots de passe.
const PIN_LEN=5,PIN_ITER=600000;
const PW=()=>data.pwds||(data.pwds=[]);
let vaultVid=null,vaultKey=null,vaultItems=new Map(),pinStep="",pinBuf="",pinFirst="",pinBusy=false,pwQ="",pwShown=new Set(),pwEditId=null,pinFails=0,pinWait=0;
const b64e=u=>{let s="";const a=new Uint8Array(u);for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)};
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function pinKey(pin,salt,iter){if(CC())return CC().pinKey(pin,salt,iter);
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:b64d(salt),iterations:iter,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encJ(key,obj){if(CC())return CC().encJ(key,obj);const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(JSON.stringify(obj)));return{iv:b64e(iv),ct:b64e(ct)}}
async function decJ(key,e){if(CC())return CC().decJ(key,e);const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64d(e.iv)},key,b64d(e.ct));return JSON.parse(new TextDecoder().decode(pt))}
const vaultOn=()=>!!(data.vault&&data.vault.chk);
