import path from 'node:path'

import {
  DEFAULT_BASE_URL,
  PERF_ROOT_DIR,
  ensureDir,
  resolvePerfRoutes,
  runLighthouseAudit,
  runNetworkProbe,
  summarizeLighthouseRuns,
  writeJson,
  writeText
} from './common.mjs'

const targetArg = process.argv[2] ?? 'home'
const label = process.argv[3] ?? `lab-${Date.now()}`

const routes = await resolvePerfRoutes()
const route =
  routes.find((candidate) => candidate.name === targetArg) ??
  routes.find((candidate) => candidate.path === targetArg) ?? {
    name: targetArg.replaceAll('/', '-').replace(/^-+/, '') || 'root',
    path: targetArg.startsWith('/') ? targetArg : `/${targetArg}`
  }

const outputDir = path.join(PERF_ROOT_DIR, label)
const rawDir = path.join(outputDir, 'raw')

await ensureDir(outputDir)
await ensureDir(rawDir)

const url = new URL(route.path, DEFAULT_BASE_URL).toString()
const lighthouseRuns = []

for (let runIndex = 1; runIndex <= 3; runIndex += 1) {
  lighthouseRuns.push(
    await runLighthouseAudit({
      url,
      routeName: route.name,
      runIndex,
      rawDir
    })
  )
}

const summary = {
  label,
  route,
  url,
  lighthouseRuns,
  medianMetrics: summarizeLighthouseRuns(lighthouseRuns),
  network: await runNetworkProbe({
    url,
    routeName: route.name,
    rawDir
  })
}

await writeJson(path.join(outputDir, 'summary.json'), summary)
await writeText(
  path.join(outputDir, 'summary.md'),
  [
    `# Lab Result: ${route.name}`,
    '',
    `URL: ${url}`,
    `Performance score: ${summary.medianMetrics.performanceScore.toFixed(2)}`,
    `FCP: ${summary.medianMetrics.firstContentfulPaintMs.toFixed(2)}ms`,
    `LCP: ${summary.medianMetrics.largestContentfulPaintMs.toFixed(2)}ms`,
    `TBT: ${summary.medianMetrics.totalBlockingTimeMs.toFixed(2)}ms`,
    `CLS: ${summary.medianMetrics.cumulativeLayoutShift.toFixed(4)}`,
    `Speed Index: ${summary.medianMetrics.speedIndexMs.toFixed(2)}ms`,
    `Data requests: ${summary.network.dataRequestCount}`,
    `Duplicate data requests: ${summary.network.duplicateDataRequests.length}`
  ].join('\n')
)
