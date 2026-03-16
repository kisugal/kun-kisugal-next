import 'dotenv/config'

import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import prismaClientPkg from '@prisma/client'
import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'

const { PrismaClient } = prismaClientPkg

export const PERF_ROOT_DIR = path.resolve(process.cwd(), 'perf-results')
export const DEFAULT_BASE_URL =
  process.env.PERF_BASE_URL ?? 'http://127.0.0.1:3000'
export const SERVER_HOSTNAME = '127.0.0.1'
export const SERVER_PORT = Number(new URL(DEFAULT_BASE_URL).port || 3000)

const LIGHTHOUSE_SETTINGS = {
  onlyCategories: ['performance'],
  emulatedFormFactor: 'mobile',
  throttlingMethod: 'simulate',
  screenEmulation: {
    mobile: true,
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    disabled: false
  },
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4,
    requestLatencyMs: 562.5,
    downloadThroughputKbps: 1474.56,
    uploadThroughputKbps: 675
  },
  maxWaitForLoad: 45_000
}

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true })
}

export const writeJson = async (filePath, data) => {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

export const writeText = async (filePath, text) => {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, `${text}\n`, 'utf8')
}

export const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

export const prettyDuration = (durationMs) =>
  `${(durationMs / 1000).toFixed(2)}s`

export const median = (values) => {
  const filtered = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  if (!filtered.length) {
    return null
  }

  const middle = Math.floor(filtered.length / 2)
  if (filtered.length % 2 === 0) {
    return (filtered[middle - 1] + filtered[middle]) / 2
  }

  return filtered[middle]
}

export const formatMetric = (value, digits = 2) => {
  if (value === null || value === undefined) {
    return 'n/a'
  }

  return Number(value).toFixed(digits)
}

export const runCommand = async ({
  command,
  args,
  cwd = process.cwd(),
  env = process.env,
  logPath,
  label
}) => {
  const start = process.hrtime.bigint()
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  const chunks = []

  child.stdout.on('data', (chunk) => {
    chunks.push(Buffer.from(chunk))
  })

  child.stderr.on('data', (chunk) => {
    chunks.push(Buffer.from(chunk))
  })

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })

  const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
  const output = Buffer.concat(chunks).toString('utf8')

  if (logPath) {
    await writeText(logPath, output)
  }

  return {
    label,
    command: [command, ...args].join(' '),
    exitCode,
    success: exitCode === 0,
    durationMs,
    logPath,
    output
  }
}

export const resolveChromeExecutablePath = () => {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH
  }

  const executablePath = puppeteer.executablePath()
  if (!executablePath) {
    throw new Error('Unable to resolve a Chrome executable for Lighthouse')
  }

  return executablePath
}

export const waitForServer = async (baseUrl, timeoutMs = 60_000) => {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(baseUrl, {
        signal: AbortSignal.timeout(5_000)
      })
      if (response.ok || response.status < 500) {
        return
      }
    } catch (error) {
      // Ignore connection errors while waiting for the server to boot.
    }

    await delay(1_000)
  }

  throw new Error(`Timed out waiting for ${baseUrl}`)
}

export const startProductionServer = async ({
  baseUrl = DEFAULT_BASE_URL,
  logPath
}) => {
  const child = spawn(
    'pnpm',
    [
      'exec',
      'next',
      'start',
      '--hostname',
      SERVER_HOSTNAME,
      '--port',
      String(SERVER_PORT)
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(SERVER_PORT),
        HOSTNAME: SERVER_HOSTNAME
      },
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  const chunks = []
  child.stdout.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
  child.stderr.on('data', (chunk) => chunks.push(Buffer.from(chunk)))

  child.on('exit', async () => {
    if (logPath) {
      await writeText(logPath, Buffer.concat(chunks).toString('utf8'))
    }
  })

  await waitForServer(baseUrl)

  return {
    child,
    async stop() {
      if (child.exitCode === null && !child.killed) {
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, 2_000)

          child.once('close', () => {
            clearTimeout(timeout)
            resolve()
          })

          child.kill('SIGTERM')
        })
      }

      if (logPath) {
        await writeText(logPath, Buffer.concat(chunks).toString('utf8'))
      }
    }
  }
}

export const resolvePerfRoutes = async () => {
  const prisma = new PrismaClient()

  try {
    const patchUniqueId =
      process.env.PERF_PATCH_ID ??
      (
        await prisma.patch.findFirst({
          where: {
            status: 0,
            content_limit: 'sfw'
          },
          orderBy: {
            resource_update_time: 'desc'
          },
          select: {
            unique_id: true
          }
        })
      )?.unique_id

    const topicId =
      process.env.PERF_TOPIC_ID ??
      String(
        (
          await prisma.topic.findFirst({
            where: {
              status: 0
            },
            orderBy: {
              created: 'desc'
            },
            select: {
              id: true
            }
          })
        )?.id ?? ''
      )

    const routes = [
      { name: 'home', path: '/' },
      { name: 'galgame', path: '/galgame' },
      { name: 'resource', path: '/resource' },
      { name: 'topic-list', path: '/topic' }
    ]

    if (patchUniqueId) {
      routes.push({ name: 'patch-detail', path: `/${patchUniqueId}` })
    }

    if (topicId) {
      routes.push({ name: 'topic-detail', path: `/topic/${topicId}` })
    }

    return routes
  } finally {
    await prisma.$disconnect()
  }
}

export const runLighthouseAudit = async ({ url, routeName, runIndex, rawDir }) => {
  const executablePath = resolveChromeExecutablePath()
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  })

  try {
    const wsEndpoint = browser.wsEndpoint()
    const port = Number(new URL(wsEndpoint).port)
    const result = await lighthouse(
      url,
      {
        port,
        output: 'json',
        logLevel: 'error',
        ...LIGHTHOUSE_SETTINGS
      },
      undefined
    )

    const reportText = Array.isArray(result.report)
      ? result.report[0]
      : result.report
    const rawPath = path.join(rawDir, `${routeName}-run-${runIndex}.json`)
    await writeText(rawPath, reportText)

    const {
      audits,
      categories: { performance }
    } = result.lhr

    return {
      rawPath,
      performanceScore: performance.score * 100,
      firstContentfulPaintMs: audits['first-contentful-paint'].numericValue,
      largestContentfulPaintMs: audits['largest-contentful-paint'].numericValue,
      totalBlockingTimeMs: audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
      speedIndexMs: audits['speed-index'].numericValue
    }
  } finally {
    await browser.close()
  }
}

export const summarizeLighthouseRuns = (runs) => ({
  performanceScore: median(runs.map((run) => run.performanceScore)),
  firstContentfulPaintMs: median(runs.map((run) => run.firstContentfulPaintMs)),
  largestContentfulPaintMs: median(
    runs.map((run) => run.largestContentfulPaintMs)
  ),
  totalBlockingTimeMs: median(runs.map((run) => run.totalBlockingTimeMs)),
  cumulativeLayoutShift: median(
    runs.map((run) => run.cumulativeLayoutShift)
  ),
  speedIndexMs: median(runs.map((run) => run.speedIndexMs))
})

export const runNetworkProbe = async ({ url, routeName, rawDir }) => {
  const executablePath = resolveChromeExecutablePath()
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  })

  try {
    const page = await browser.newPage()
    await page.setCacheEnabled(false)
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    })

    const requests = []
    const recordRequest = (request, status) => {
      const urlString = request.url()
      if (urlString.startsWith('data:')) {
        return
      }

      requests.push({
        method: request.method(),
        url: urlString,
        resourceType: request.resourceType(),
        status
      })
    }

    page.on('requestfinished', (request) => recordRequest(request, 'finished'))
    page.on('requestfailed', (request) => recordRequest(request, 'failed'))

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 60_000
    })
    await delay(1_000)

    const rawPath = path.join(rawDir, `${routeName}-network.json`)
    await writeJson(rawPath, requests)

    const dataRequests = requests.filter((request) =>
      ['fetch', 'xhr', 'document'].includes(request.resourceType)
    )

    const grouped = new Map()
    dataRequests.forEach((request) => {
      const key = `${request.method} ${request.url}`
      grouped.set(key, (grouped.get(key) ?? 0) + 1)
    })

    const duplicates = [...grouped.entries()]
      .filter(([, count]) => count > 1)
      .map(([requestKey, count]) => ({
        request: requestKey,
        count
      }))
      .sort((left, right) => right.count - left.count)

    return {
      rawPath,
      totalRequests: requests.length,
      dataRequestCount: dataRequests.length,
      duplicateDataRequests: duplicates
    }
  } finally {
    await browser.close()
  }
}
