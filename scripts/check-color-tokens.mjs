import { promises as fs } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const srcRoot = path.join(projectRoot, 'src')
const globalsCssPath = path.join(srcRoot, 'app', 'globals.css')
const colorTokensPath = path.join(srcRoot, 'lib', 'colorTokens.ts')

const targetExtensions = new Set(['.ts', '.tsx', '.css'])
const oldOrangeBrandHexes = [
  '#fff7ed',
  '#ffedd5',
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316',
  '#ea580c',
  '#c2410c',
  '#9a3412',
  '#7c2d12',
]

const errors = []

const relativePath = (absolutePath) => path.relative(projectRoot, absolutePath)

const getLineNumber = (content, index) => content.slice(0, index).split('\n').length

const getBlockRange = (content, selector) => {
  const ranges = []
  let searchFrom = 0

  while (true) {
    const selectorIndex = content.indexOf(selector, searchFrom)
    if (selectorIndex === -1) break

    const openBraceIndex = content.indexOf('{', selectorIndex)
    if (openBraceIndex === -1) break

    let depth = 0
    let closeBraceIndex = -1
    for (let i = openBraceIndex; i < content.length; i += 1) {
      const char = content[i]
      if (char === '{') depth += 1
      if (char === '}') {
        depth -= 1
        if (depth === 0) {
          closeBraceIndex = i
          break
        }
      }
    }

    if (closeBraceIndex === -1) break

    ranges.push({
      start: getLineNumber(content, selectorIndex),
      end: getLineNumber(content, closeBraceIndex),
    })

    searchFrom = closeBraceIndex + 1
  }

  return ranges
}

const isLineInRanges = (lineNumber, ranges) =>
  ranges.some((range) => lineNumber >= range.start && lineNumber <= range.end)

const walkFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const filePaths = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      const nested = await walkFiles(entryPath)
      filePaths.push(...nested)
      continue
    }

    if (!entry.isFile()) continue
    if (!targetExtensions.has(path.extname(entry.name))) continue
    filePaths.push(entryPath)
  }

  return filePaths
}

const checkLegacyVariables = (filePath, content) => {
  const legacyPattern = /--(?:color|shadow)-[a-z0-9-]*/gi
  for (const match of content.matchAll(legacyPattern)) {
    const line = getLineNumber(content, match.index ?? 0)
    errors.push(
      `${relativePath(filePath)}:${line} legacy variable "${match[0]}" is not allowed. Use current token names.`
    )
  }
}

const checkHexLiterals = (filePath, content) => {
  if (filePath === colorTokensPath) return

  let allowedRanges = []
  if (filePath === globalsCssPath) {
    allowedRanges = [
      ...getBlockRange(content, ':root'),
      ...getBlockRange(content, '.dark'),
    ]
  }

  const hexPattern = /#[0-9a-fA-F]{3,8}\b/g
  for (const match of content.matchAll(hexPattern)) {
    const line = getLineNumber(content, match.index ?? 0)
    if (filePath === globalsCssPath && isLineInRanges(line, allowedRanges)) continue
    errors.push(
      `${relativePath(filePath)}:${line} hex literal "${match[0]}" is not allowed outside token files.`
    )
  }
}

const checkOldOrangeBrandHexes = (filePath, content) => {
  const lowerContent = content.toLowerCase()
  for (const hex of oldOrangeBrandHexes) {
    const index = lowerContent.indexOf(hex)
    if (index === -1) continue
    const line = getLineNumber(lowerContent, index)
    errors.push(
      `${relativePath(filePath)}:${line} old orange brand hex "${hex}" is forbidden.`
    )
  }
}

const main = async () => {
  const files = await walkFiles(srcRoot)

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8')
    checkLegacyVariables(filePath, content)
    checkHexLiterals(filePath, content)
    checkOldOrangeBrandHexes(filePath, content)
  }

  if (errors.length === 0) {
    console.log('Color token checks passed.')
    return
  }

  console.error('Color token checks failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
