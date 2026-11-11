// Chrono de séance avec faux Supabase. Lancer tests/serve.js avant ce test.
const { chromium } = require('../app/node_modules/playwright');
const assert = require('node:assert/strict');

const base = process.env.SID_BASE_URL || 'http://localhost:' + (process.env.SID_SITE_PORT || 8766);
const waitForRemote = async (page, started) => {
  const end=Date.now()+8000;
  while(Date.now()<end){
    const remote=await page.evaluate(async flag=>{
      await push();
      const row=await fetchRow(session.user.id,await token());
      return !!row?.data?.muscu?.sessions?.some(x=>x.id==='session-clock')&&(!flag||!!row.data.muscuClock?.run);
    },started);
    if(remote)return;
    await page.waitForTimeout(100);
  }
  throw new Error('État de séance absent de la copie synchronisée');
};
const openMuscu = async page => {
  await page.evaluate(() => {show('muscu');renderMuscu();});
  const details=page.locator('[data-ms="session-clock"]');
  await details.waitFor();
  if(!await details.evaluate(el=>el.open))await details.locator(':scope > summary').click();
};
const waitForClock = (page, action) =>
  page.locator(`[data-ms="session-clock"] [data-msclock="${action}"]`).waitFor();
const createPage = async (context, now) => {
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.addInitScript(() => { window.__noIntro = true; });
  if (now) await page.clock.setFixedTime(now);
  await page.goto(base);
  return page;
};

(async () => {
  let browser = await chromium.launch();
  try {
    let context = await browser.newContext();
    const first = await createPage(context);
    await first.fill('#aName', 'Chrono muscu');
    await first.fill('#aEmail', `chrono-muscu-${Date.now()}@test.be`);
    await first.fill('#aPw', 'secret11');
    await first.fill('#aPw2', 'secret11');
    await first.check('#aAgree');
    await first.click('#aBtn');
    await first.click('#onbSkip');
    await first.evaluate(() => {
      M().sessions.push(...['session-clock','other-session'].map(id=>({
        id,name:id==='session-clock'?'Séance test':'Autre séance',upd:Date.now(),
        exercises:[{id:id+'-set',name:'Squat',sets:[{kg:'20',reps:'10'}]}]
      })));
      save();
    });
    await waitForRemote(first,false);
    await openMuscu(first);
    const second = await createPage(context);
    await openMuscu(second);
    await first.click('[data-ms="session-clock"] [data-msclock=start]');
    await waitForClock(second, 'stop');
    const start = await first.evaluate(() => msRunGet().t0);
    assert.equal(await second.evaluate(() => msRunGet().t0), start);
    const competing=await first.evaluate(()=>{
      const other=msFind('other-session');
      msRunTouch(other,other.exercises[0],0,true);msDone(other,true);
      return {timed:msRunGet().se,duration:ML().find(l=>l.day===other.id)?.min};
    });
    assert.deepEqual(competing,{timed:'session-clock',duration:undefined});
    await waitForRemote(first,true);
    const state = await context.storageState();
    await browser.close();

    browser = await chromium.launch();
    context = await browser.newContext({ storageState: state });
    const later = new Date(start + 5 * 3600000 + 37000);
    const reopened = await createPage(context, later);
    await openMuscu(reopened);
    await waitForClock(reopened, 'stop');
    assert.equal(await reopened.locator('[data-mselapsed]').textContent(), '5:00:37');
    const peer = await createPage(context, later);
    await openMuscu(peer);
    await reopened.clock.setFixedTime(new Date(start+29*3600000));
    const overnight=await reopened.evaluate(()=>{
      const se=msFind('session-clock');
      msRunTouch(se,se.exercises[0],0,true);msDone(se,true);renderMuscu();
      return {since:msClockSince(msRunGet()),duration:ML().find(l=>l.day===se.id&&l.date===iso(today()))?.min};
    });
    assert.match(overnight.since,/^Depuis le/);
    assert.equal(overnight.duration,undefined);
    await reopened.click('[data-ms="session-clock"] [data-msclock=stop]');
    await waitForClock(peer, 'start');
    assert.equal(await peer.evaluate(() => msRunGet()), null);
    await reopened.reload();
    await openMuscu(reopened);
    await waitForClock(reopened, 'start');
    assert.equal(await reopened.evaluate(() => msRunGet()), null);
    await reopened.click('[data-ms="session-clock"] [data-msclock=start]');
    await reopened.click('[data-ms="other-session"] > summary');
    await reopened.click('[data-ms="other-session"] [data-msclock=start]');
    assert.equal(await reopened.evaluate(()=>msRunGet().se),'other-session');
    console.log('Chrono muscu : démarrage, arrêt, fermeture complète et deux onglets OK');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
