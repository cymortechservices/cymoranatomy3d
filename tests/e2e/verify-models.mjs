// Loads every atlas bundle in the REAL viewer and records what actually happened.
// usage: node tests/e2e/verify-models.mjs [baseUrl]   (needs `npm run build && npm run preview` running)
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:4173'
const cat = JSON.parse(readFileSync('src/data/atlas.catalogue.json', 'utf8'))
mkdirSync('public/models/zanatomy/thumbs', { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const out = {}
for (const b of cat.bundles) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  const res = { status: 'failed', checked_at: new Date().toISOString(), notes: '' }
  try {
    const t0 = Date.now()
    await page.goto(`${base}/laboratory?b=${b.id}&nointro`)
    await page.waitForSelector('[data-testid="anatomy-viewer"][data-ready="true"]', { timeout: 90000 })
    res.load_ms = Date.now() - t0
    const stats = await page.evaluate((id) => window.__cymorAtlas?.[id], b.id)
    res.meshes_rendered = stats?.meshes ?? 0
    const notes = []
    if (res.meshes_rendered !== b.mesh_count) notes.push(`rendered ${res.meshes_rendered} of ${b.mesh_count} meshes`)
    await page.waitForTimeout(900)
    await page.locator('[data-testid="viewport"]').screenshot({ path: `public/models/zanatomy/thumbs/${b.id}.png` })
    // selection through the Structures tab
    await page.getByRole('tab', { name: 'Structures' }).click()
    const first = page.locator('ul[aria-label="Structures in view"] li button[aria-pressed]').first()
    const label = (await first.textContent())?.trim()
    await first.click()
    await page.getByRole('tab', { name: 'Information' }).click()
    await page.waitForSelector('[data-testid="atlas-info"]', { timeout: 5000 })
    const heading = (await page.locator('[data-testid="atlas-info"] h2').first().textContent())?.trim()
    if (!heading || !label?.replace(/\s+/g, '').startsWith(heading.replace(/\s+/g, ''))) notes.push(`selection mismatch: list "${label}" vs panel "${heading}"`)
    // hide, isolate, restore must not throw
    await page.getByRole('button', { name: 'Hide selected structure' }).click({ trial: false }).catch(() => {})
    await page.getByRole('button', { name: /Reset anatomical visibility/ }).click()
    res.thumb = `thumbs/${b.id}.jpg`
    if (errors.length) notes.push(...errors.slice(0, 3))
    res.status = notes.length === 0 ? 'verified' : 'failed'
    res.notes = notes.join(' | ')
  } catch (e) { res.notes = String(e).slice(0, 300) + (errors.length ? ' | ' + errors[0] : '') }
  out[b.id] = res
  console.log(b.id, res.status, res.load_ms, res.meshes_rendered, res.notes)
  await page.close()
}
await browser.close()
writeFileSync('scripts/model-pipeline/_verification_raw.json', JSON.stringify(out, null, 1))
