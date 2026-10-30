// v60 (#3, coquille étape 2) : les briques de chiffrement sont en TypeScript (app/src/core/crypto.ts → site/react/core.js).
// Ce test vérifie que l'ancien code (gardé en secours dans app.js) et le nouveau sont interchangeables :
// ce que l'un chiffre, l'autre l'ouvre ; mêmes clés tirées des mêmes codes ; même format des documents.
// Lance : node tests/crypto.test.js   (après « cd app && npm run build »)
const fs=require("fs"),vm=require("vm");
const src=fs.readFileSync(__dirname+"/../site/app.js","utf8").split("\n");
// une déclaration de haut niveau : de la ligne qui commence par `start` jusqu'à la prochaine ligne non indentée
const take=start=>{const i=src.findIndex(l=>l.startsWith(start));if(i<0)throw new Error("introuvable : "+start);let j=i+1;while(j<src.length&&(/^\s/.test(src[j])||/^[})\]];?\s*$/.test(src[j])))j++;return src.slice(i,j).join("\n")};
const oldSrc=["const ENC_MAGIC","const isEnc","const CC=","async function docEncrypt","async function docDecrypt","const PIN_LEN","const b64e","const b64d","async function pinKey","async function encJ","async function decJ","const rawKey","async function phDerive","async function bioKey"].map(take).join("\n")+
  ";this.O={b64e,b64d,pinKey,encJ,decJ,rawKey,phDerive,bioKey,docEncrypt,docDecrypt,isEnc}";
const ctxOld={window:{},crypto:globalThis.crypto,TextEncoder,TextDecoder,btoa,atob,Blob,Uint8Array,L:x=>x,dvKey:null,console};
vm.createContext(ctxOld);vm.runInContext(oldSrc,ctxOld);const O=ctxOld.O;
const ctxNew={window:{},crypto:globalThis.crypto,TextEncoder,TextDecoder,btoa,atob,Uint8Array,console};vm.createContext(ctxNew);
vm.runInContext(fs.readFileSync(__dirname+"/../site/react/core.js","utf8"),ctxNew);const N=ctxNew.window.SCCore&&ctxNew.window.SCCore.crypto;
if(!N){console.log("ÉCHEC : site/react/core.js ne définit pas SCCore.crypto");process.exit(1)}
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log("ÉCHEC :",m)}};
(async()=>{
  // base64 : identique sur des octets au hasard
  for(let i=0;i<200;i++){const u=crypto.getRandomValues(new Uint8Array(i));ok(O.b64e(u)===N.b64e(u),"b64e différent");ok(Buffer.from(O.b64d(O.b64e(u))).equals(Buffer.from(N.b64d(N.b64e(u)))),"b64d différent")}
  const salt=O.b64e(crypto.getRandomValues(new Uint8Array(16))),IT=2000; // peu d'itérations pour aller vite (en vrai : 600 000, même code)
  // code à 5 chiffres → clé : chiffré par l'ancien, ouvert par le nouveau, et inversement
  for(const pin of ["12345","00000","98765"]){const ko=await O.pinKey(pin,salt,IT),kn=await N.pinKey(pin,salt,IT),obj={site:"Banque",pw:"S3cret!é",n:[1,2]};
    ok(JSON.stringify(await N.decJ(kn,await O.encJ(ko,obj)))===JSON.stringify(obj),"ancien → nouveau : coffre illisible");
    ok(JSON.stringify(await O.decJ(ko,await N.encJ(kn,obj)))===JSON.stringify(obj),"nouveau → ancien : coffre illisible");
    let bad=false;try{await N.decJ(await N.pinKey("11111",salt,IT),await O.encJ(ko,obj))}catch(e){bad=true}ok(bad,"un mauvais code ouvre le coffre")}
  // phrase / mot de passe du compte → clé maître : exactement la même (NFC compris)
  for(const ph of ["ma phrase secrète","Ma phrase secrète","motdepasse123"]){const a=await O.phDerive(ph,salt,IT),b=await N.phDerive(ph,salt,IT);ok(a.raw===b.raw,"clé maître différente pour « "+ph+" »")}
  // clé brute + documents « SNE1 »
  const raw=O.b64e(crypto.getRandomValues(new Uint8Array(32))),ko=await O.rawKey(raw),kn=await N.rawKey(raw),pdf=new TextEncoder().encode("%PDF-1.4 bonjour "+"x".repeat(5000));
  const encOld=new Uint8Array(await (await O.docEncrypt(new Blob([pdf]),ko)).arrayBuffer()),encNew=await N.docEncryptBytes(pdf.buffer,kn);
  ok(O.isEnc(encNew)&&N.isEnc(encOld),"format SNE1 non reconnu");ok(encOld.length===encNew.length,"taille du document chiffré différente");
  ok(Buffer.from(await N.docDecryptBytes(encOld,kn)).equals(Buffer.from(pdf)),"document chiffré par l'ancien code illisible");
  ok(Buffer.from(await (await O.docDecrypt(encNew,ko)).arrayBuffer()).equals(Buffer.from(pdf)),"document chiffré par le nouveau code illisible");
  // Face ID : même clé tirée du même secret
  const prf=crypto.getRandomValues(new Uint8Array(32)),bo=await O.bioKey(prf),bn=await N.bioKey(prf),msg={code:"12345"};
  ok(JSON.stringify(await N.decJ(bn,await O.encJ(bo,msg)))===JSON.stringify(msg),"Face ID : clé différente");
  console.log(fail?fail+" échec(s)":"OK : chiffrement (ancien et nouveau code interchangeables)");process.exit(fail?1:0);
})().catch(e=>{console.log("ÉCHEC :",e&&e.message);process.exit(1)});
