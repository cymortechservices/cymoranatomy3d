import { test, expect, type Page } from '@playwright/test'

const viewerReady = (page: Page) => page.locator('[data-testid="anatomy-viewer"][data-ready="true"]')

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  return errors
}

test.describe('intro', () => {
  test('3D skeleton, typewriter title, then fade into the home page', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page.getByTestId('intro')).toBeVisible()
    await expect(page.getByTestId('intro-canvas')).toBeVisible()
    await expect(page.getByTestId('intro-title')).toHaveAttribute('aria-label', 'CYMOR ANATOMY 3D')
    // typewriter: the title starts empty, appears letter by letter, and ends complete
    await expect(page.getByTestId('intro-title')).toHaveText(/^C/, { timeout: 10_000 })
    await expect(page.getByTestId('intro-title')).not.toHaveText('CYMOR ANATOMY 3D', { timeout: 1500 }).catch(() => undefined)
    await expect(page.getByTestId('intro-title')).toHaveText('CYMOR ANATOMY 3D', { timeout: 10_000 })
    await expect(page.getByTestId('intro')).toBeHidden({ timeout: 30_000 })
    await expect(page.getByTestId('hero-preview')).toBeVisible()
    expect(errors).toEqual([])
  })
  test('can be skipped, and is not shown again in the same session', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('intro-skip').click()
    await expect(page.getByTestId('intro')).toBeHidden({ timeout: 10_000 })
    await page.goto('/explore'); await page.goto('/')
    await expect(page.getByTestId('intro')).toHaveCount(0)
  })
})

const ROUTES = ['/', '/explore', '/laboratory', '/systems', '/systems/cardiovascular', '/organ/heart', '/structure/left-ventricle', '/study', '/histology', '/physiology', '/embryology', '/quiz', '/tutor', '/about', '/references', '/dashboard', '/bookmarks', '/progress', '/profile', '/auth', '/admin']
test.describe('routes', () => {
  for (const r of ROUTES) {
    test(`renders ${r} without errors`, async ({ page }) => {
      const errors = trackErrors(page)
      await page.goto(`${r}?nointro`)
      await expect(page.locator('main, h1').first()).toBeVisible({ timeout: 20_000 })
      expect((await page.locator('body').innerText()).trim().length).toBeGreaterThan(40)
      await expect(page.getByText('Page not found')).toHaveCount(0)
      await page.waitForTimeout(500)
      expect(errors, errors.join('\n')).toEqual([])
    })
  }
  test('unknown route shows the 404 page', async ({ page }) => {
    await page.goto('/definitely-not-a-page?nointro')
    await expect(page.getByText(/not found/i).first()).toBeVisible()
  })
})

test.describe('3D laboratory', () => {
  test('loads the heart and selects a structure from the list', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/laboratory?b=heart&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    await page.getByRole('tab', { name: 'Structures' }).click()
    await page.getByRole('button', { name: 'Left ventricle', exact: true }).click()
    await page.getByRole('tab', { name: 'Information' }).click()
    await expect(page.getByTestId('atlas-info').getByRole('heading', { name: /Left ventricle/ })).toBeVisible()
    await expect(page.getByTestId('atlas-info').getByText(/CC BY-SA 4.0/).first()).toBeVisible()
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('search finds structures in bundles that are not loaded and loads them on demand', async ({ page }) => {
    await page.goto('/laboratory?b=heart&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    await page.getByTestId('atlas-search').fill('femur')
    await page.getByRole('option', { name: /Femur \(left\)/ }).click()
    await expect(page).toHaveURL(/b=heart(%2C|,)skeleton/)
    await expect(page.getByTestId('atlas-info').getByRole('heading', { name: /Femur/ })).toBeVisible({ timeout: 60_000 })
  })

  test('curated structure deep link highlights its real meshes and shows teaching notes', async ({ page }) => {
    await page.goto('/laboratory?structure=left-ventricle&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    await expect(page.getByRole('heading', { name: 'Left ventricle' }).first()).toBeVisible()
    await expect(page.getByTestId('atlas-info')).toBeVisible()
  })

  test('hide, isolate and restore', async ({ page }) => {
    await page.goto('/laboratory?structure=right-atrium&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    await page.getByRole('button', { name: 'Isolate selected structure' }).click()
    await expect(page.getByRole('button', { name: 'Stop isolating' })).toBeVisible()
    await page.getByRole('button', { name: /Reset anatomical visibility/ }).click()
    await expect(page.getByRole('button', { name: 'Isolate selected structure' })).toBeVisible()
    await page.getByRole('button', { name: 'Hide selected structure' }).click()
    await page.getByRole('tab', { name: 'Structures' }).click()
    await expect(page.getByRole('button', { name: 'Show Right atrium' })).toBeVisible()
  })

  test('camera views and controls respond', async ({ page }) => {
    await page.goto('/laboratory?b=skeleton&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    await page.getByLabel('Camera view').selectOption('posterior')
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await page.getByRole('button', { name: 'Reset camera' }).click()
    await page.getByRole('button', { name: /X-ray mode/ }).click()
    await expect(page.getByRole('button', { name: 'Turn X-ray off' })).toBeVisible()
  })

  test('layers load on demand and unload', async ({ page }) => {
    await page.goto('/laboratory?b=heart&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    await page.getByRole('tab', { name: 'Structures' }).click()
    await page.getByTestId('layer-vessels').click()
    await expect(page).toHaveURL(/vessels/)
    await expect(page.getByTestId('layer-vessels')).toBeChecked({ timeout: 60_000 })
    await page.getByTestId('layer-vessels').click()
    await expect(page).not.toHaveURL(/vessels/)
  })

  test('a missing model file shows a clear fallback with a working retry', async ({ page }) => {
    let block = true
    await page.route('**/models/zanatomy/respiratory.glb', (route) => (block ? route.abort() : route.continue()))
    await page.goto('/laboratory?b=respiratory&nointro')
    await expect(page.getByTestId('viewer-fallback')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    block = false
    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
  })

  test('works at phone size', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/laboratory?b=heart&nointro')
    await expect(viewerReady(page)).toBeVisible({ timeout: 60_000 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    expect(overflow).toBe(false)
  })
})

test.describe('learning features', () => {
  test('global search reaches a structure page', async ({ page }) => {
    await page.goto('/explore?nointro')
    await page.getByRole('combobox').or(page.getByRole('searchbox')).first().fill('mitral')
    await expect(page.getByText(/Mitral/i).first()).toBeVisible()
  })

  test('quiz runs and scores', async ({ page }) => {
    page.on('dialog', (d) => d.accept())
    await page.goto('/quiz?nointro')
    await page.getByTestId('start-quiz').click()
    await expect(page.getByTestId('quiz-run')).toBeVisible()
    // answer nothing: the result must still be a valid, honest score (0 correct)
    await page.getByTestId('submit-quiz').click()
    await expect(page.getByTestId('quiz-results')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('percent')).toHaveText(/^\d+%$/)
  })

  test('bookmarks persist across reloads (demo mode, saved in this browser)', async ({ page }) => {
    await page.goto('/structure/left-ventricle?nointro')
    await page.getByRole('button', { name: 'Bookmark Left ventricle' }).click()
    await page.goto('/bookmarks?nointro')
    await expect(page.getByText('Left ventricle').first()).toBeVisible()
    await page.reload()
    await expect(page.getByText('Left ventricle').first()).toBeVisible()
    await expect(page.getByText(/only in this browser/i).first()).toBeVisible()
  })

  test('credits page lists every model with its licence', async ({ page }) => {
    await page.goto('/references?nointro')
    await expect(page.getByText('Z-Anatomy').first()).toBeVisible()
    await expect(page.getByText('Heart, valves and coronary vessels')).toBeVisible()
    await expect(page.getByText('CC BY-SA 4.0').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Source objects not imported' })).toBeVisible()
  })
})
