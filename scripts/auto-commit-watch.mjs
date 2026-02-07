import { spawn } from 'node:child_process'
import { existsSync, statSync, watch } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const ADD_PATHS = [
  'src',
  'public',
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json',
]

const WATCH_PATHS = ADD_PATHS
  .map((item) => path.join(repoRoot, item))
  .filter((item) => existsSync(item))

const DEBOUNCE_MS = Number.parseInt(process.env.AUTO_COMMIT_DEBOUNCE_MS || '1500', 10)
const COMMIT_PREFIX = process.env.AUTO_COMMIT_MESSAGE_PREFIX || 'AUTO: update frontend'

let timer = null
let isRunning = false
let hasPending = false

const run = (cmd, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...options })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })

const gitStatus = () =>
  new Promise((resolve, reject) => {
    let output = ''
    const child = spawn('git', ['status', '--porcelain', '--', ...ADD_PATHS], { cwd: repoRoot })
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    child.stderr.on('data', (data) => {
      process.stderr.write(data)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim())
        return
      }
      reject(new Error(`git status exited with code ${code}`))
    })
  })

const schedule = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(runCycle, DEBOUNCE_MS)
}

const runCycle = async () => {
  if (isRunning) {
    hasPending = true
    return
  }

  isRunning = true
  try {
    const status = await gitStatus()
    if (!status) return

    await run('git', ['add', '-A', '--', ...ADD_PATHS], { cwd: repoRoot })
    const stagedStatus = await gitStatus()
    if (!stagedStatus) return

    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '')
    const message = `${COMMIT_PREFIX} (${timestamp})`
    await run('git', ['commit', '-m', message], { cwd: repoRoot })
  } catch (err) {
    console.error('[auto-commit]', err?.message || err)
  } finally {
    isRunning = false
    if (hasPending) {
      hasPending = false
      schedule()
    }
  }
}

const startWatch = (watchPath) => {
  let recursive = false
  try {
    recursive = statSync(watchPath).isDirectory()
  } catch (err) {
    console.error(`[auto-commit] failed to stat ${watchPath}`, err)
    return
  }

  try {
    watch(watchPath, { recursive }, () => schedule())
  } catch (err) {
    console.error(`[auto-commit] failed to watch ${watchPath}`, err)
  }
}

console.log(`[auto-commit] watching ${WATCH_PATHS.length} path(s)...`)
WATCH_PATHS.forEach((watchPath) => startWatch(watchPath))
