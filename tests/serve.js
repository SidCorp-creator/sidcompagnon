// Aperçu local de Sid'note, sans toucher au vrai Supabase.
// Lance :  node tests/serve.js   puis ouvre http://localhost:8766
// - un faux Supabase tourne sur le port 8790 (comptes, données, stockage, horaire iCal en mémoire)
// - le site (dossier site/) est servi sur le port 8766, avec l'adresse Supabase remplacée à la volée
const http=require("http"),fs=require("fs"),path=require("path");
require("./mock-supabase.js");
const SITE=path.join(__dirname,"..","site"),REAL="https://eloeoaidgbkygazwjwiu.supabase.co";
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css; charset=utf-8",".webmanifest":"application/manifest+json",".png":"image/png",".json":"application/json",".svg":"image/svg+xml",".pdf":"application/pdf",".woff2":"font/woff2",".txt":"text/plain; charset=utf-8",".xml":"application/xml"};
// mêmes en-têtes de sécurité qu'en ligne (vercel.json, règle « /(.*) »), pour que le test voie tout ce que la CSP bloquerait
const HEADERS={};for(const r of JSON.parse(fs.readFileSync(path.join(__dirname,"..","vercel.json"),"utf8")).headers||[]){if(r.source!=="/(.*)")continue;
  for(const h of r.headers)if(h.key!=="Strict-Transport-Security")HEADERS[h.key]=h.value.split(REAL).join("http://localhost:8790")}
http.createServer((req,res)=>{
  let p=decodeURIComponent(new URL(req.url,"http://x").pathname);if(p.endsWith("/"))p+="index.html";
  const f=path.join(SITE,p);if(!f.startsWith(SITE)||!fs.existsSync(f)){res.writeHead(404);return res.end("introuvable")}
  let body=fs.readFileSync(f);if(/\.(html|js)$/.test(f))body=body.toString().split(REAL).join("http://localhost:8790");
  res.writeHead(200,{"Content-Type":TYPES[path.extname(f)]||"application/octet-stream","Cache-Control":"no-store",...HEADERS});res.end(body);
}).listen(8766,()=>console.log("Aperçu : http://localhost:8766  (faux Supabase sur :8790, Ctrl+C pour arrêter)"));
