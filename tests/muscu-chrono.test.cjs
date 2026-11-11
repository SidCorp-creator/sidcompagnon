// Chrono de séance avec faux Supabase. Lancer tests/serve.js avant ce test.
const { chromium } = require('../app/node_modules/playwright');
const assert = require('node:assert/strict');

const base = process.env.SID_BASE_URL || 'http://localhost:' + (process.env.SID_SITE_PORT || 8766);
const openMuscu = async page => {
  await page.evaluate(() => show('muscu'));
  const details=page.locator('[data-ms="session-clock"]');
  await details.waitFor();
  if(!await details.evaluate(el=>el.open))await details.locator('summary').click();
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
      M().sessions.push({ id: 'session-clock', name: 'Séance test', exercises: [], upd: Date.now() });
      save();
    });
    await openMuscu(first);
    const second = await createPage(context);
    await openMuscu(second);
    await first.click('[data-msclock=start]');
    await waitForClock(second, 'stop');
    const start = await first.evaluate(() => msRunGet().t0);
    assert.equal(await second.evaluate(() => msRunGet().t0), start);
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
    await reopened.click('[data-msclock=stop]');
    await waitForClock(peer, 'start');
    assert.equal(await peer.evaluate(() => msRunGet()), null);
    await reopened.reload();
    await openMuscu(reopened);
    await waitForClock(reopened, 'start');
    assert.equal(await reopened.evaluate(() => msRunGet()), null);
    console.log('Chrono muscu : démarrage, arrêt, fermeture complète et deux onglets OK');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
