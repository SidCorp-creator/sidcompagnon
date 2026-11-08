const assert=require('node:assert/strict'),fs=require('node:fs');
const {validateRequest,programmeInput,createHandler}=require('./sidbot-loader.cjs');
const create=new Function(fs.readFileSync('supabase/functions/_shared/muscu-programme.js','utf8').replace('export function ','function ')+';return createMuscuEngine')();const engine=create(JSON.parse(fs.readFileSync('supabase/functions/_shared/muscu-catalogue.json','utf8')));
const answers={v:1,goal:'forme',level:'deb',days:2,dur:20,place:'home',equip:['none'],avoidZones:[],avoidEx:[],prefer:[],other:[],notes:''};
const body={app:'forme',locale:'en',task:'programme',answers,requestId:'req-001'};
assert.equal(validateRequest(body).messages.length,0);assert.throws(()=>validateRequest({...body,app:'note'}));assert.throws(()=>validateRequest({...body,answers:{...answers,v:2}}));assert.throws(()=>validateRequest({...body,change:'a'.repeat(601)}));assert.throws(()=>validateRequest({...body,requestId:'../../pwd'}));assert.throws(()=>validateRequest({...body,answers:{...answers,equip:['machines','unknown']}}));
const input=programmeInput(validateRequest({...body,context:{notes:'DO_NOT_SEND'}}));assert.ok(!JSON.stringify(input).includes('DO_NOT_SEND'));assert.ok(input.allowed.every(e=>!e.name.includes('machine')));
let mode='',providerCalls=0,received;
const config={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'server-key',SIDBOT_PROVIDER:'groq',SIDBOT_FREE_PLAN_CONFIRMED:'true',SIDBOT_API_KEY:'api-key'};
const fake=async(url,opt)=>{
 if(url.endsWith('/auth/v1/user'))return Response.json(mode==='auth'?{}:{id:'user-a'},{status:mode==='auth'?401:200});
 if(url.includes('/rpc/'))return Response.json(mode==='quota'?{error:'quota',retry_after:100}:{used:1,limit:20,reset:'2026-11-09T00:00:00Z'});
 providerCalls++;received=JSON.parse(opt.body);
 if(mode==='timeout')throw new DOMException('private','TimeoutError');if(mode==='network')throw TypeError('private');if(mode==='provider-quota')return new Response('',{status:429,headers:{'Retry-After':'60','x-ratelimit-remaining-requests':'0'}});
 if(mode==='json-error')return Response.json({error:{code:'json_validate_failed'}},{status:400});
 const ask=JSON.parse(received.messages[1].content),r=engine.muBuild(ask.answers,'en');
 if(mode==='bad-equipment')r.plan.days[0].ex[0].name='Chest press machine';if(mode==='invented-load')r.plan.days[0].ex[0].note='Start at 30 kg';if(mode==='wrong-days')r.plan.days.pop();if(mode==='missing')delete r.plan;
 return Response.json({choices:[{message:{content:mode==='invalid-json'?'broken':JSON.stringify(r)}}]})
};
const handle=createHandler(k=>config[k],fake),req=(b=body)=>new Request('https://edge.test',{method:'POST',headers:{Authorization:'Bearer fake-user-jwt'},body:JSON.stringify(b)});
(async()=>{
 const profiles=[answers,{...answers,goal:'force',level:'conf',days:4,dur:60,place:'gym',equip:['dumbbells','bench','barbell','machines','cables','pullup']},{...answers,days:3,dur:35,equip:['bands'],avoidZones:['knee'],avoidEx:['Rowing élastique assis']}];
 for(const a of profiles){mode='';providerCalls=0;const r=await handle(req({...body,answers:a,context:{pwds:['DO_NOT_SEND']}})),j=await r.json();assert.equal(r.status,200,JSON.stringify(j));assert.equal(j.requestId,'req-001');assert.equal(j.plan.src,'ia');assert.equal(j.plan.days.length,a.days);assert.deepEqual(j.plan.profile,a);assert.ok(j.est.every(x=>x<=a.dur));assert.equal(j.usage.used,1);assert.ok(!j.actions);assert.equal(providerCalls,1);assert.equal(received.max_tokens,3800);assert.ok(!JSON.stringify(received).includes('DO_NOT_SEND'))}
 for(const [state,status,code] of [['auth',401,'auth'],['quota',429,'quota'],['timeout',504,'timeout'],['network',503,'unavailable'],['provider-quota',429,'quota'],['json-error',502,'invalid_programme'],['bad-equipment',502,'invalid_programme'],['invented-load',502,'invalid_programme'],['wrong-days',502,'invalid_programme'],['missing',502,'invalid_programme'],['invalid-json',502,'invalid_programme']]){mode=state;providerCalls=0;const r=await handle(req()),j=await r.json();assert.equal(r.status,status,state);assert.equal(j.error,code,state);assert.ok(!j.plan,state+' must not silently fabricate a local/AI result');assert.ok(!JSON.stringify(j).includes('private'));if(state==='json-error')assert.equal(providerCalls,1,'no automatic retry for a program')}
 mode='';const a=engine.muBuild(answers,'en').plan;assert.equal((await handle(req({...body,change:'Use an alternative for the first exercise',currentPlan:a}))).status,200);assert.equal(JSON.parse(received.messages[1].content).change,'Use an alternative for the first exercise');
 const noConfig=createHandler(k=>k==='SIDBOT_API_KEY'?undefined:config[k],fake);assert.equal((await (await noConfig(req())).json()).error,'not_configured');
 console.log('sidbot programme: no chat messages required, 3 profiles, constraints/preview/requestId, minimal context, auth/quota/timeout/invalid, no silent fallback or retry OK');
})().catch(e=>{console.error(e);process.exitCode=1});
