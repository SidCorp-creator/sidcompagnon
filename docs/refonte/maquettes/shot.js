const {chromium}=require("playwright");const fs=require("fs");
(async()=>{const b=await chromium.launch();const src=fs.readFileSync(process.argv[2],"utf8");
const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>${src}</body></html>`;
for(const [w,n] of [[1280,"desk"],[400,"phone"]]){const p=await b.newPage({viewport:{width:w,height:900}});const errs=[];p.on("pageerror",e=>errs.push(e.message));
await p.setContent(html,{waitUntil:"networkidle"}).catch(()=>{});await p.waitForTimeout(800);
const ow=await p.evaluate(()=>document.documentElement.scrollWidth);console.log(n,"scrollWidth",ow,"errs",errs);
await p.screenshot({path:`shots/${n}.png`,fullPage:true});
if(n==="desk"){for(const s of ["home","muscu","add","notes"]){await p.click(`#scrTabs [data-s="${s}"]`);await p.waitForTimeout(200);const el=await p.$("#phones");await el.screenshot({path:`shots/ph-${s}.png`})}
 await p.click("#thLight");await p.click('#scrTabs [data-s="agenda"]');await p.waitForTimeout(200);await (await p.$("#phones")).screenshot({path:"shots/ph-agenda-light.png"});
 await p.click("#thDark");await (await p.$("#phones")).screenshot({path:"shots/ph-agenda-dark.png"});
 await (await p.$("#desks")).screenshot({path:"shots/desks.png"});await (await p.$("#identity")).screenshot({path:"shots/identity.png"});await (await p.$("#logoTests")).screenshot({path:"shots/logos.png"});
 await p.click("#motion [data-go]");await p.waitForTimeout(700);await (await p.$("#motion")).screenshot({path:"shots/motion.png"});}
await p.close()}await b.close()})();
