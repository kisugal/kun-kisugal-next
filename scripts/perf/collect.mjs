import path from 'node:path'

import {
  DEFAULT_BASE_URL,
  PERF_ROOT_DIR,
  ensureDir,
  prettyDuration,
  resolvePerfRoutes,
  runCommand,
  runLighthouseAudit,
  runNetworkProbe,
  startProductionServer,
  summarizeLighthouseRuns,
  writeJson,
  writeText
} from './common.mjs'

const label = process.argv[2] ?? `run-${Date.now()}`

const outputDir = path.join(PERF_ROOT_DIR, label)
const logsDir = path.join(outputDir, 'logs')
const rawDir = path.join(outputDir, 'raw')

await ensureDir(outputDir)
await ensureDir(logsDir)
await ensureDir(rawDir)

const summary = {
  label,
  generatedAt: new Date().toISOString(),
  baseUrl: DEFAULT_BASE_URL,
  routes: [],
  typecheck: null,
  build: null,
  notes: []
}

let server = null

try {
  summary.routes = await resolvePerfRoutes()

  const typecheckResult = await runCommand({
    label: 'typecheck',
    command: 'pnpm',
    args: ['run', 'typecheck'],
    logPath: path.join(logsDir, 'typecheck.log')
  })

  summary.typecheck = {
    success: typecheckResult.success,
    exitCode: typecheckResult.exitCode,
    durationMs: typecheckResult.durationMs,
    durationText: prettyDuration(typecheckResult.durationMs),
    logPath: typecheckResult.logPath
  }

  const buildResult = await runCommand({
    label: 'build',
    command: 'pnpm',
    args: ['run', 'build'],
    logPath: path.join(logsDir, 'build.log')
  })

  summary.build = {
    success: buildResult.success,
    exitCode: buildResult.exitCode,
    durationMs: buildResult.durationMs,
    durationText: prettyDuration(buildResult.durationMs),
    logPath: buildResult.logPath
  }

  if (!buildResult.success) {
    summary.notes.push('Build failed, so production perf collection was skipped.')
    await writeJson(path.join(outputDir, 'summary.json'), summary)
    process.exit(1)
  }

  server = await startProductionServer({
    baseUrl: DEFAULT_BASE_URL,
    logPath: path.join(logsDir, 'server.log')
  })

  const routeResults = []

  for (const route of summary.routes) {
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

    const medianMetrics = summarizeLighthouseRuns(lighthouseRuns)
    const network = await runNetworkProbe({
      url,
      routeName: route.name,
      rawDir
    })

    routeResults.push({
      ...route,
      url,
      lighthouseRuns,
      medianMetrics,
      network
    })
  }

  summary.routes = routeResults
  await writeJson(path.join(outputDir, 'summary.json'), summary)

  const lines = [
    `# Perf Summary: ${label}`,
    '',
    `Base URL: ${summary.baseUrl}`,
    `Typecheck: ${summary.typecheck.success ? 'PASS' : 'FAIL'} (${summary.typecheck.durationText})`,
    `Build: ${summary.build.success ? 'PASS' : 'FAIL'} (${summary.build.durationText})`,
    '',
    '| Route | Score | FCP(ms) | LCP(ms) | TBT(ms) | CLS | Speed Index(ms) | Data Requests | Duplicate Data Requests |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
  ]

  for (const route of routeResults) {
    lines.push(
      `| ${route.name} | ${route.medianMetrics.performanceScore.toFixed(2)} | ${route.medianMetrics.firstContentfulPaintMs.toFixed(2)} | ${route.medianMetrics.largestContentfulPaintMs.toFixed(2)} | ${route.medianMetrics.totalBlockingTimeMs.toFixed(2)} | ${route.medianMetrics.cumulativeLayoutShift.toFixed(4)} | ${route.medianMetrics.speedIndexMs.toFixed(2)} | ${route.network.dataRequestCount} | ${route.network.duplicateDataRequests.length} |`
    )
  }

  await writeText(path.join(outputDir, 'summary.md'), lines.join('\n'))
} catch (error) {
  summary.notes.push(
    error instanceof Error ? error.message : 'Unknown perf collection failure'
  )
  await writeJson(path.join(outputDir, 'summary.json'), summary)
  throw error
} finally {
  if (server) {
    await server.stop()
  }
}
