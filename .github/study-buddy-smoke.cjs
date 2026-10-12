const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');

(async () => {
  fs.mkdirSync('study-buddy-qa', { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', '8877', '--bind', '127.0.0.1'], {
    stdio: 'ignore', detached: true,
  });
  let browser;
  const results = [];
  const errs = [];
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const base = 'http://127.0.0.1:8877/study-buddy/';
    async function view(path, device = 'desktop') {
      const p = await browser.newPage({
        viewport: device === 'mobile' ? { width: 390, height: 844 } : { width: 1365, height: 860 }
      });
      p.on('pageerror', e => errs.push(path + ': ' + e.message));
      p.on('dialog', d => d.accept());
      await p.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.locator('header .nav-links').waitFor({ state: 'attached', timeout: 14000 });
      return p;
    }
    // All feature links resolve under the custom-domain prefix.
    const home = await view('index.html');
    if (await home.locator('.card-container .card a').count() !== 5) throw Error('Missing homepage feature cards');
    const hrefs = await home.locator('.card-container .card a').evaluateAll(as => as.map(a => a.getAttribute('href')));
    if (hrefs.some(h => !h.startsWith('html/'))) throw Error('Home links target the wrong subpath: ' + hrefs);
    const headerLinks = await home.locator('.nav-links a').evaluateAll(as => as.map(a => a.getAttribute('href')));
    if (headerLinks.some(h => !h.startsWith('/study-buddy/'))) throw Error('Header links target the wrong subpath');
    await home.screenshot({ path: 'study-buddy-qa/home-desktop.png', fullPage: true });
    results.push({ test: 'home', status: 'pass', cards: hrefs.length });
    await home.close();

    const mobile = await view('index.html', 'mobile');
    await mobile.locator('.hamburger').click();
    if (!(await mobile.locator('.nav-links').evaluate(x => x.classList.contains('active')))) throw Error('Mobile navigation did not open');
    await mobile.screenshot({ path: 'study-buddy-qa/home-mobile.png', fullPage: true });
    const widths = await mobile.evaluate(() => ({
      view: innerWidth, doc: document.documentElement.scrollWidth
    }));
    if (widths.doc > widths.view + 3) throw Error('Mobile horizontal overflow: ' + JSON.stringify(widths));
    results.push({ test: 'mobile-nav', status: 'pass', ...widths });
    await mobile.close();

    const todo = await view('html/todolist.html');
    await todo.locator('#taskInput').fill('Review lecture notes');
    await todo.locator('#addTaskButton').click();
    await todo.locator('#saveTaskButton').click();
    await todo.reload();
    await todo.locator('header .nav-links').waitFor({ state: 'attached' });
    if (!(await todo.locator('#taskList').innerText()).includes('Review lecture notes')) throw Error('Tasks not saved');
    await todo.screenshot({ path: 'study-buddy-qa/tasks.png' });
    results.push({ test: 'task-persistence', status: 'pass' });
    await todo.close();

    const pomo = await view('html/pomodoro.html');
    await pomo.getByRole('button', { name: 'Short Task (15/5)' }).click();
    if ((await pomo.locator('#time').innerText()) !== '15:00') throw Error('Focus mode failed');
    await pomo.getByRole('button', { name: 'Start', exact: true }).first().click();
    await pomo.waitForTimeout(1200);
    await pomo.getByRole('button', { name: 'Pause' }).click();
    if ((await pomo.locator('#time').innerText()) === '15:00') throw Error('Timer did not advance');
    await pomo.getByRole('button', { name: 'Reset' }).click();
    if ((await pomo.locator('#time').innerText()) !== '15:00') throw Error('Reset failed');
    results.push({ test: 'pomodoro', status: 'pass' });
    await pomo.close();

    const countdown = await view('html/countdown.html');
    const deadline = await countdown.evaluate(() => {
      let d = new Date(Date.now() + 5 * 60000);
      return { date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0'), time: String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') };
    });
    await countdown.locator('#event-date').fill(deadline.date);
    await countdown.locator('#event-time').fill(deadline.time);
    await countdown.getByRole('button', { name: 'Start' }).click();
    await countdown.waitForTimeout(1300);
    if ((await countdown.locator('#countdown').innerText()) === '00:00:00') throw Error('Countdown did not start');
    await countdown.getByRole('button', { name: 'Pause' }).click();
    await countdown.getByRole('button', { name: 'Reset' }).click();
    results.push({ test: 'countdown', status: 'pass' });
    await countdown.close();

    const table = await view('html/timetable.html');
    await table.locator('#timetable-body td[contenteditable="true"]').first().fill('Revision block');
    await table.reload();
    if (!(await table.locator('#timetable-body td[contenteditable="true"]').first().innerText()).includes('Revision block')) {
      throw Error('Timetable edit not saved');
    }
    results.push({ test: 'timetable', status: 'pass' });
    await table.close();

    const quotes = await view('html/quotes.html');
    await quotes.getByRole('button', { name: 'Give Me Motivation' }).click();
    if ((await quotes.locator('#quote').innerText()).includes('Click the flower for motivation!')) throw Error('Quote generator failed');
    results.push({ test: 'quotes', status: 'pass' });
    await quotes.close();

    const helper = await view('index.html');
    const externalPosts = [];
    helper.on('request', req => {
      if (req.method() === 'POST' && !req.url().startsWith('http://127.0.0.1')) externalPosts.push(req.url());
    });
    await helper.locator('.chatbot-toggle').click();
    await helper.locator('#chatInput').fill('How do I use Pomodoro?');
    await helper.locator('.chatbot-input button').click();
    if (!(await helper.locator('.chatbot-messages .bot').last().innerText()).includes('25 minutes')) throw Error('Local helper failed');
    if (externalPosts.length) throw Error('Local helper made unexpected network POST');
    results.push({ test: 'offline-helper', status: 'pass' });
    await helper.close();

    if (errs.length) throw Error('Browser errors: ' + errs.join(' | '));
    fs.writeFileSync('study-buddy-qa/results.json', JSON.stringify(results, null, 2));
    console.log('PASSED ' + results.length + ' browser checks: ' + JSON.stringify(results));
  } finally {
    if (browser) await browser.close();
    try { process.kill(-server.pid, 'SIGTERM'); } catch (_) {}
  }
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
