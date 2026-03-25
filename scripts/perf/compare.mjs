import path from 'node:path'

import {
  PERF_ROOT_DIR,
  formatMetric,
  readJson,
  writeJson,
  writeText
} from './common.mjs'

const beforeLabel = process.argv[2] ?? 'baseline'
const afterLabel = process.argv[3] ?? 'optimized'

const beforeSummary = await readJson(
  path.join(PERF_ROOT_DIR, beforeLabel, 'summary.json')
)
const afterSummary = await readJson(
  path.join(PERF_ROOT_DIR, afterLabel, 'summary.json')
)

const compareDir = path.join(
  PERF_ROOT_DIR,
  `compare-${beforeLabel}-vs-${afterLabel}`
)

const delta = (beforeValue, afterValue) => {
  if (
    beforeValue === null ||
    beforeValue === undefined ||
    afterValue === null ||
    afterValue === undefined
  ) {
    return null
  }

  return Number(afterValue) - Number(beforeValue)
}

const routeMap = new Map()

for (const route of beforeSummary.routes ?? []) {
  routeMap.set(route.name, { before: route, after: null })
}

for (const route of afterSummary.routes ?? []) {
  const existing = routeMap.get(route.name) ?? { before: null, after: null }
  existing.after = route
  routeMap.set(route.name, existing)
}

const routeComparisons = [...routeMap.entries()].map(([name, value]) => {
  const beforeRoute = value.before
  const afterRoute = value.after

  return {
    name,
    scoreDelta: delta(
      beforeRoute?.medianMetrics?.performanceScore,
      afterRoute?.medianMetrics?.performanceScore
    ),
    fcpDeltaMs: delta(
      beforeRoute?.medianMetrics?.firstContentfulPaintMs,
      afterRoute?.medianMetrics?.firstContentfulPaintMs
    ),
    lcpDeltaMs: delta(
      beforeRoute?.medianMetrics?.largestContentfulPaintMs,
      afterRoute?.medianMetrics?.largestContentfulPaintMs
    ),
    tbtDeltaMs: delta(
      beforeRoute?.medianMetrics?.totalBlockingTimeMs,
      afterRoute?.medianMetrics?.totalBlockingTimeMs
    ),
    clsDelta: delta(
      beforeRoute?.medianMetrics?.cumulativeLayoutShift,
      afterRoute?.medianMetrics?.cumulativeLayoutShift
    ),
    speedIndexDeltaMs: delta(
      beforeRoute?.medianMetrics?.speedIndexMs,
      afterRoute?.medianMetrics?.speedIndexMs
    ),
    dataRequestDelta: delta(
      beforeRoute?.network?.dataRequestCount,
      afterRoute?.network?.dataRequestCount
    ),
    duplicateRequestDelta: delta(
      beforeRoute?.network?.duplicateDataRequests?.length,
      afterRoute?.network?.duplicateDataRequests?.length
    )
  }
})

const comparison = {
  beforeLabel,
  afterLabel,
  typecheck: {
    before: beforeSummary.typecheck,
    after: afterSummary.typecheck
  },
  build: {
    before: beforeSummary.build,
    after: afterSummary.build
  },
  routes: routeComparisons
}

const lines = [
  `# Perf Compare: ${beforeLabel} vs ${afterLabel}`,
  '',
  `Typecheck: ${beforeSummary.typecheck?.success ? 'PASS' : 'FAIL'} -> ${afterSummary.typecheck?.success ? 'PASS' : 'FAIL'}`,
  `Build: ${beforeSummary.build?.success ? 'PASS' : 'FAIL'} -> ${afterSummary.build?.success ? 'PASS' : 'FAIL'}`,
  '',
  '| Route | Score Δ | FCP Δ(ms) | LCP Δ(ms) | TBT Δ(ms) | CLS Δ | Speed Index Δ(ms) | Data Requests Δ | Duplicate Requests Δ |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
]

for (const route of routeComparisons) {
  lines.push(
    `| ${route.name} | ${formatMetric(route.scoreDelta)} | ${formatMetric(route.fcpDeltaMs)} | ${formatMetric(route.lcpDeltaMs)} | ${formatMetric(route.tbtDeltaMs)} | ${formatMetric(route.clsDelta, 4)} | ${formatMetric(route.speedIndexDeltaMs)} | ${formatMetric(route.dataRequestDelta, 0)} | ${formatMetric(route.duplicateRequestDelta, 0)} |`
  )
}

await writeJson(path.join(compareDir, 'summary.json'), comparison)
await writeText(path.join(compareDir, 'summary.md'), lines.join('\n'))
