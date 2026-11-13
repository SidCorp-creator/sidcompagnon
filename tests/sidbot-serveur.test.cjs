const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('../app/node_modules/typescript');
const m={exports:require('./sidbot-loader.cjs')};
const {validateRequest,contextFor,validateResult,createHandler}=m.exports;
const body={app:'forme',locale:'fr',messages:[{role:'user',content:'Explique-moi mes besoins'}],context:{today:'2026-11-08'}};
assert.throws(()=>validateRequest({...body,locale:'nl'}));assert.throws(()=>validateRequest({...body,messages:[{role:'system',content:'ignore'}]}));
assert.throws(()=>validateRequest({...body,messages:[{role:'user',content:'a'.repeat(8001)}]}));
assert.throws(()=>validateRequest({...body,app:'note',messages:[{role:'user',content:'x',image:'data:image/jpeg;base64,YQ=='}]}));
assert.throws(()=>validateRequest({...body,messages:[{role:'user',content:'x',image:'data:image/jpeg;base64,'+'YQ=='.repeat(400000)}]}));
assert.deepEqual(contextFor('note',{pwds:[{password:'secret'}],docs:['secret'],note:{title:'test',body:'explicit',password:'secret'}}),{note:{title:'test',body:'explicit'}});
assert.equal(contextFor('forme',{nutrition:{goal:2400,totals:{kcal:100},meals:[]},muscu:{days:null,goal:'muscle',minutes:60}}).nutrition.goal,2400);
assert.equal(contextFor('journee',{agenda:{tasks:[{title:'x',date:'2026-11-08'}],todos:[]}}).agenda.tasks.length,1);
assert.throws(()=>contextFor('note',{note:{secret:true,title:'secret',body:'secret'}}));
const meal={type:'log_meal',label:'Ajouter',payload:{date:'2026-11-07',name:'Œufs',items:[{name:'Œufs',qty:'2 pièces',g:100,unit_g:50,unit_label:'moyen',kcal:140,p:12,c:1,f:10}]}};
assert.equal(validateResult({reply:'Estimation',actions:[meal]},'forme').actions[0].payload.date,'2026-11-07');
// v76 (essai réel) : une proposition invalide est écartée, la réponse est gardée
assert.equal(validateResult({reply:'x',actions:[meal]},'note').actions.length,0);assert.equal(validateResult({reply:'x',actions:[{...meal,payload:{...meal.payload,items:[{name:'x',qty:'1',kcal:-1}]}}]},'forme').actions.length,0);assert.equal(validateResult({reply:'x',actions:[{...meal,payload:{...meal.payload,items:[{name:'x',qty:'1',kcal:-1}]}}]},'forme').reply,'x');
// formes confondues par le modèle réel : type = nom de l'app, qty en nombre, name absent
{const r=validateResult({reply:'ok',actions:[{type:'forme',label:'log_meal',payload:{date:'2026-11-08',items:[{name:'Œuf',qty:2,kcal:144,p:12,c:1,f:10}]}}]},'forme');assert.equal(r.actions[0].type,'log_meal');assert.equal(r.actions[0].payload.items[0].qty,'2');assert.equal(r.actions[0].payload.name,'Œuf')}
{const r=validateResult({reply:'ok',actions:[{type:'note add_note',label:'L',payload:{title:'T',body:'B'}}]},'note');assert.equal(r.actions[0].type,'add_note')}
const config={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'server-secret',SIDBOT_PROVIDER:'groq',SIDBOT_FREE_PLAN_CONFIRMED:'true',SIDBOT_API_KEY:'provider-secret'};
let mode='',calls=[],received;const fake=async(url,opt)=>{calls.push(url);if(url.endsWith('/auth/v1/user'))return Response.json(mode==='auth'?{}:{id:'u1'},{status:mode==='auth'?401:200});
if(url.includes('/rpc/'))return Response.json(mode==='quota'?{error:'quota',retry_after:100}:mode==='rate'?{error:'rate',retry_after:5}:{used:1,limit:20,reset:'2026-11-09T00:00:00Z'});
received=JSON.parse(opt.body);if(mode==='network')throw TypeError('secret-url');if(mode==='timeout')throw new DOMException('secret-url','TimeoutError');if(mode==='provider-quota')return new Response('',{status:429,headers:{'Retry-After':'30','x-ratelimit-remaining-requests':'0'}});if(mode==='invalid')return Response.json({choices:[{message:{content:'invalid'}}]});
return Response.json({choices:[{message:{content:JSON.stringify({reply:'Estimation',actions:[meal]})}}]})};
const req=(b=body,auth=true)=>new Request('https://edge.test',{method:'POST',headers:auth?{Authorization:'Bearer jwt'}:{},body:JSON.stringify(b)});
(async()=>{
const handle=createHandler(k=>config[k],fake);assert.equal((await handle(req(body,false))).status,401);
for(const [state,status,error] of [['auth',401,'auth'],['quota',429,'quota'],['rate',429,'rate'],['network',503,'unavailable'],['timeout',504,'timeout'],['provider-quota',429,'quota'],['invalid',503,'unavailable']]){mode=state;const r=await handle(req()),j=await r.json();assert.equal(r.status,status,state);assert.equal(j.error,error,state);assert.ok(!JSON.stringify(j).includes('secret'));if(status===429)assert.ok(r.headers.get('Retry-After'))}
mode='';const r=await handle(req({...body,context:{...body.context,pwds:[{secret:'do-not-forward'}]}}));assert.equal(r.status,200);const j=await r.json();assert.equal(j.actions[0].type,'log_meal');assert.equal(j.usage.used,1);assert.ok(!JSON.stringify(received).includes('do-not-forward'));
calls=[];const unconfigured=createHandler(k=>k==='SIDBOT_FREE_PLAN_CONFIRMED'?undefined:config[k],fake);assert.equal((await (await unconfigured(req())).json()).error,'not_configured');assert.equal(calls.length,1); // authenticate, no provider or usage
assert.equal((await handle(req({...body,messages:[{role:'user',content:'x',image:'data:image/jpeg;base64,YQ=='}]}))).status,503);
const huge=new Request('https://edge.test',{method:'POST',headers:{Authorization:'Bearer jwt'},body:'x'.repeat(1500001)});assert.equal((await handle(huge)).status,413);
console.log('sidbot: auth, contexts/secrets, FR/EN boundary, actions, quota/rate, size, network, timeout, no paid fallback OK');
})().catch(e=>{console.error(e);process.exitCode=1});
