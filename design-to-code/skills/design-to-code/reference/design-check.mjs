import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { extractSpec } from './extract.mjs'
import { diffSpecs } from './diff.mjs'
import { bootApp } from './server.mjs'
import { seedBySurface } from './seeds.mjs'

const ROOT = join(import.meta.dirname, '../..')
const elementMap = JSON.parse(readFileSync(join(ROOT, 'design/element-map.json'), 'utf8'))

const requestedSurfaces = process.argv.slice(2)
const surfacesToRun = Object.entries(elementMap).filter(
  ([surfaceName]) => requestedSurfaces.length === 0 || requestedSurfaces.includes(surfaceName)
)

const elementsToSelectors = (elements, side) =>
  Object.fromEntries(
    Object.entries(elements).map(([name, config]) => [
      name,
      { selector: config[side], origin: config.origin?.[side] }
    ])
  )

const extractFromMock = async (browser, config) => {
  const mockPage = await browser.newPage({
    viewport: { width: config.mockViewportWidth ?? 1600, height: 1400 }
  })
  await mockPage.goto(pathToFileURL(join(ROOT, config.mock)).href, {
    waitUntil: 'load',
    timeout: 60_000
  })
  await mockPage.waitForTimeout(config.mockSettleMs ?? 1_000)
  if (config.mockStyle) {
    await mockPage.addStyleTag({ content: config.mockStyle })
  }
  const spec = await extractSpec(
    mockPage,
    elementsToSelectors(config.elements, 'mock'),
    config.mockFrame
  )
  await mockPage.close()
  return spec
}

const extractFromBuild = async (browser, config, viewport, app, seeded) => {
  const builtPage = await browser.newPage({
    viewport: { width: viewport, height: config.viewportHeight ?? 1000 },
    colorScheme: config.colorScheme ?? 'light'
  })
  if (seeded.session) {
    await builtPage.context().addCookies(seeded.session)
  }
  const builtRoute = seeded.builtRoute ?? config.builtRoute
  await builtPage.goto(`${app.baseUrl}${builtRoute}`, { waitUntil: 'networkidle' })
  const spec = await extractSpec(builtPage, elementsToSelectors(config.elements, 'built'), null)
  await builtPage.close()
  return spec
}

const runSurface = async (surfaceName, config, browser, app) => {
  const seedRun = seedBySurface[surfaceName]
  if (!seedRun) {
    throw new Error(`no seed function registered for surface "${surfaceName}" in seeds.mjs`)
  }
  const seeded = await seedRun()

  const report = []
  try {
    for (const viewport of config.viewports) {
      const mockSpec = await extractFromMock(browser, config)
      const builtSpec = await extractFromBuild(browser, config, viewport, app, seeded)
      const { defects, waived } = diffSpecs(mockSpec, builtSpec, config.elements)
      report.push({ surface: surfaceName, viewport, defects, waived })
    }
  } finally {
    await seeded.cleanup?.()
  }
  return report
}

const main = async () => {
  const app = await bootApp()
  const browser = await chromium.launch()
  let totalDefects = 0

  try {
    for (const [surfaceName, config] of surfacesToRun) {
      const results = await runSurface(surfaceName, config, browser, app)
      const gating = config.gate !== false
      for (const { viewport, defects, waived } of results) {
        console.log(`\n=== ${surfaceName} @ ${viewport} ===`)
        if (!gating) {
          console.log(`NOT GATING — ${config.gateNote ?? 'reported only'}`)
        }
        if (waived.length > 0) {
          console.log(`waived (${waived.length}):`)
          for (const line of waived) {
            console.log(`  ${line}`)
          }
        }
        if (defects.length === 0) {
          console.log('0 defects')
          continue
        }
        console.log(`${defects.length} defects:`)
        for (const line of defects) {
          console.log(`  ${line}`)
        }
        if (gating) {
          totalDefects += defects.length
        }
      }
    }
  } finally {
    await browser.close()
    await app.stop()
  }

  if (totalDefects > 0) {
    console.log(`\ndesign:check FAILED — ${totalDefects} unwaived defects`)
    process.exit(1)
  }
  console.log('\ndesign:check passed — 0 defects')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
