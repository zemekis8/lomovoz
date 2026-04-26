#!/usr/bin/env node
/**
 * Self-contained screenshot script для Docker Playwright.
 * Усередині контейнера запускає крихітний static-server на /app/dist
 * і робить скріни через Playwright. Не залежить від dev-сервера на хості —
 * обходить WSL Docker network issues.
 *
 * Перед запуском треба `npm run build` на хості, щоб /app/dist був актуальний.
 *
 * Запуск:
 *   docker run --rm --ipc=host -v "$PWD":/app -w /app \
 *     mcr.microsoft.com/playwright:v1.59.0-jammy node scripts/screenshot.mjs
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const DIST = '/app/dist'
const PORT = 8765
const URL = `http://127.0.0.1:${PORT}/`
const OUT_BASE = '/app/.ai-factory/qa-screens'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.ico':  'image/x-icon',
}

// === STATIC SERVER ===
const server = http.createServer((req, res) => {
  let p = (req.url || '/').split('?')[0]
  if (p === '/') p = '/index.html'
  const fp = path.join(DIST, p)
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    res.statusCode = 404
    res.end('not found: ' + p)
    return
  }
  res.setHeader('Content-Type', MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream')
  fs.createReadStream(fp).pipe(res)
})
await new Promise(r => server.listen(PORT, '127.0.0.1', r))
console.log(`http server live on ${URL}`)

// === SCREENSHOT SUITE ===
const widths = [
  { name: '375',  width: 375,  height: 812,  dpr: 2 },
  { name: '768',  width: 768,  height: 1024, dpr: 2 },
  { name: '1440', width: 1440, height: 900,  dpr: 1 },
]

const sections = [
  { id: 'hero',     selector: '#hero' },
  { id: 'services', selector: '#services' },
  { id: 'process',  selector: '#process' },
  { id: 'prices',   selector: '#prices' },
  { id: 'gallery',  selector: '#gallery' },
  { id: 'why-us',   selector: '#why-us' },
  { id: 'reviews',  selector: '#reviews' },
  { id: 'faq',      selector: '#faq' },
  { id: 'contacts', selector: '#contacts' },
]

const browser = await chromium.launch()

for (const w of widths) {
  console.log(`\n=== ${w.name}px ===`)
  const ctx = await browser.newContext({
    viewport: { width: w.width, height: w.height },
    deviceScaleFactor: w.dpr,
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })

  // Прокрутити вниз-вгору щоб lazy-load спрацював
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0
      const step = 400
      const t = setInterval(() => {
        window.scrollBy(0, step)
        total += step
        if (total >= document.body.scrollHeight) {
          clearInterval(t)
          window.scrollTo(0, 0)
          resolve()
        }
      }, 80)
    })
  })
  await page.waitForTimeout(800)

  mkdirSync(`${OUT_BASE}/${w.name}`, { recursive: true })

  await page.screenshot({ path: `${OUT_BASE}/${w.name}/00-full.png`, fullPage: true })
  console.log(`  ✓ 00-full.png`)

  for (const s of sections) {
    const el = await page.$(s.selector)
    if (!el) { console.log(`  ✗ ${s.id} (selector not found)`); continue }
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await el.screenshot({ path: `${OUT_BASE}/${w.name}/${s.id}.png` })
    console.log(`  ✓ ${s.id}.png`)
  }

  // Mobile menu test only at 375
  if (w.name === '375') {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.click('#menu-toggle').catch(() => {})
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT_BASE}/${w.name}/mobile-menu-open.png` })
    console.log(`  ✓ mobile-menu-open.png`)
    await page.click('#menu-close').catch(() => {})
    await page.waitForTimeout(300)
  }

  // FAB test
  await page.evaluate(() => window.scrollTo(0, 1500))
  await page.waitForTimeout(200)
  await page.click('#fab-trigger').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT_BASE}/${w.name}/fab-open.png` })
  console.log(`  ✓ fab-open.png`)

  await ctx.close()
}

await browser.close()
server.close()
console.log('\n✓ done')
