// Start the production server and an isolated Chrome with --remote-debugging-port=9333.
// Run: node scripts/verify-public-access.mjs [site origin] [Chrome debugger origin]
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3100';
const debuggerOrigin = process.argv[3] || 'http://localhost:9333';
const tabs = await (await fetch(`${debuggerOrigin}/json`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
const browserErrors = [];
const networkFailures = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') browserErrors.push(message.params);
  if (message.method === 'Network.loadingFailed') networkFailures.push(message.params);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) networkFailures.push({ url: message.params.response.url, status: message.params.response.status });
  if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, message => message.error ? reject(Error(JSON.stringify(message.error))) : resolve(message.result));
  ws.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = async expression => {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error(`Timed out: ${expression}`);
};
const quiet = () => new Promise(resolve => setTimeout(resolve, 350));
const check = async () => {
  await quiet();
  assert.deepEqual(browserErrors, [], 'No uncaught JavaScript exceptions or console errors');
  assert.equal(await evaluate('Boolean(document.querySelector("dialog[open].binexa-auth-modal"))'), false, 'No auth popup');
  assert.equal(await evaluate('document.documentElement.style.visibility'), '', 'Content remains visible');
  assert.equal(await evaluate('location.search.includes("auth=")'), false, 'No auth redirect');
};
const go = async path => {
  await call('Page.navigate', { url: base + path });
  await wait(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && Boolean(document.querySelector('main'))`);
  await check();
};
const popupScreenshots = new Set();
const authPrompt = async (selector, currentPath, expectedNext = "/discussions") => {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await wait('Boolean(document.querySelector("dialog[open].binexa-account-dialog"))');
  assert.equal(await evaluate('location.pathname'), currentPath);
  const width = await evaluate('innerWidth');
  if (!popupScreenshots.has(width)) {
    const screenshot = await call('Page.captureScreenshot', { format: 'png' });
    await writeFile(`/private/tmp/binexa-discussions-popup-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    popupScreenshots.add(width);
  }
  assert.equal(await evaluate(`document.querySelector('dialog[open] .binexa-auth-modes button[aria-pressed="true"]').textContent`), 'Sign in');
  assert.equal(await evaluate(`new URL(document.querySelector('dialog[open] .binexa-auth-social a').href).searchParams.get('next')`), expectedNext);
  assert.equal(await evaluate('document.querySelector("dialog[open]").textContent.includes("Facebook")'), false);
  assert.equal(await evaluate('document.querySelector("dialog[open] input[name=email]").type'), 'email');
  assert.equal(await evaluate('document.querySelector("dialog[open] input[name=password]").type'), 'password');
  assert.ok(await evaluate('document.querySelector("dialog[open]").textContent.includes("Create Account")'));
  await evaluate(`document.querySelector('dialog[open] [aria-label="Close account popup"]').click()`);
  await check();
  assert.equal(await evaluate('location.pathname'), currentPath);
};
try {
  await call('Page.bringToFront');
  await call('Runtime.enable');
  await call('Log.enable');
  await call('Page.enable');
  await call('Network.enable');
  await call('Network.clearBrowserCookies');
  const slugs = ['welcome-to-binexa-connect', 'healthy-habits-that-stick', 'understanding-weight-care', 'glp1-questions', 'ai-and-healthcare', 'spotting-credible-wellness-info'];
  const paths = ['/', '/resources', '/explore', '/offerings', '/events', '/habits', '/lounge', '/start', '/join', '/about', '/privacy', '/data-deletion', ...slugs.map(slug => `/resources/${slug}`)];
  for (const mobile of process.env.BINEXA_SECURITY_ONLY ? [] : [false, true]) {
    await call('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000, deviceScaleFactor: 1, mobile });
    for (const path of paths) {
      const response = await fetch(base + path, { redirect: 'manual' });
      assert.equal(response.status, 200, path);
      await go(path);
      if (path.startsWith('/resources/')) {
        assert.ok(await evaluate('document.querySelector("article").textContent.length > 500'));
        assert.equal(await evaluate('[...document.querySelectorAll("a")].filter(a => a.textContent.includes("Back to Home")).length'), 2);
      }
      await evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await check();
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), `No horizontal overflow: ${path}`);
      await call('Page.reload');
      await wait('document.readyState === "complete" && Boolean(document.querySelector("main"))');
      await check();
      await authPrompt('header a[href="/discussions"]', path);
      await authPrompt('header a[href="/research"]', path, '/research');
      console.log(`PASS ${mobile ? "mobile" : "desktop"}: ${path}`);
    }
    await go('/');
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(`/private/tmp/binexa-public-${mobile ? 'mobile' : 'desktop'}.png`, Buffer.from(screenshot.data, 'base64'));
    assert.equal(await evaluate('Boolean(document.querySelector("main .home-signin"))'), true);
    await authPrompt('main .home-signin', '/', '/member');
    if (!mobile) {
      assert.ok(await evaluate('document.querySelector("header .header-signin").getClientRects().length > 0'));
      await authPrompt('header .header-signin', '/', '/member');
    }
    const links = await evaluate('[...new Set([...document.querySelectorAll("main a[href]")].map(a => a.getAttribute("href")).filter(h => h.startsWith("/") && !h.includes("#")))]');
    for (const href of links) {
      await go('/');
      if (href === '/discussions') {
        await authPrompt('main a[href="/discussions"]', '/');
        continue;
      }
      await evaluate(`document.querySelector('main a[href="${href}"]').click()`);
      await wait(`location.pathname === ${JSON.stringify(href)} && document.readyState === 'complete'`);
      await check();
    }
    if (mobile) {
      await go('/');
      await evaluate('document.querySelector("button.menu").click()');
      await wait('Boolean(document.querySelector("#mobile-navigation"))');
      await authPrompt('#mobile-navigation .header-signin', '/', '/member');
      await evaluate('document.querySelector("button.menu").click()');
      await wait('Boolean(document.querySelector("#mobile-navigation"))');
      await authPrompt('#mobile-navigation a[href="/discussions"]', '/');
      await evaluate('document.querySelector("button.menu").click()');
      await wait('Boolean(document.querySelector("#mobile-navigation"))');
      await evaluate(`document.querySelector('#mobile-navigation a[href="/resources"]').click()`);
      await wait('location.pathname === "/resources"');
      await check();
    }
    console.log(`PASS ${mobile ? 'mobile' : 'desktop'}: ${paths.length} public pages, refresh, scrolling, homepage links, article bodies, no auth prompts or overflow`);
  }
  for (const protectedPath of ['/discussions', '/research']) {
    for (const headers of [{}, { RSC: '1' }]) {
      const response = await fetch(base + protectedPath, { redirect: 'manual', headers });
      const body = await response.text();
      assert.ok(response.status === 307 || body.includes('NEXT_REDIRECT'));
      assert.ok((response.headers.get('location') || body).includes(`next=${encodeURIComponent(protectedPath)}`));
      assert.ok(!body.includes('chat-conversation') && !body.includes('Where could AI help healthcare?'));
      if (protectedPath === '/research') assert.ok(!body.includes('Research sources by category'));
    }
  }
  for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
    const response = await fetch(base + '/api/discussions', { method });
    assert.ok(response.status >= 400, `No public discussion API for ${method}`);
  }
  console.log('PASS direct Discussions and New Releases HTML/RSC blocked; no public discussion API');
  const account = await fetch(base + '/member', { redirect: 'manual' });
  assert.equal(account.status, 307);
  const privateWrite = await fetch(base + '/api/auth/sign-in-log', { method: 'POST', headers: { origin: base } });
  assert.equal(privateWrite.status, 401);
  const draft = await fetch(base + '/resources/unpublished-draft');
  const missingBody = await draft.text();
  assert.ok([200, 404].includes(draft.status));
  assert.ok(missingBody.includes("This page could not be found"));
  assert.ok(!missingBody.includes("<article"));
  const facebook = await fetch(base + '/auth/sign-in?provider=facebook');
  assert.equal(facebook.status, 400);
  await go('/');
  const discordLinks = await evaluate(`Array.from(document.querySelectorAll('a[href*="discord.gg"],a[href*="discord.com/invite"]')).map(a => ({href:a.href,target:a.target}))`);
  assert.ok(discordLinks.length > 0);
  assert.ok(discordLinks.every(link => link.target === '_blank'));
  console.log('PASS account protected, private write rejected, unknown draft renders not-found without article content, Facebook rejected, Discord links preserved');
  assert.deepEqual(browserErrors, [], 'No uncaught JavaScript exceptions or console errors');
  console.log('PASS browser console: no uncaught JavaScript exceptions or console errors');
} finally {
  const lastPage = await evaluate('({ url: location.href, title: document.title, text: document.body.innerText.slice(0, 1500) })');
  await writeFile('/private/tmp/binexa-browser-console-results.json', JSON.stringify({ browserErrors, networkFailures, lastPage }, null, 2));
  ws.close();
}
