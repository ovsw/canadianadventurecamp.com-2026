#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

const VERSION = 1
const STAGES = [
  'initialized',
  'claimed',
  'researched',
  'planned',
  'prepared',
  'blocks-built',
  'draft-written',
  'verified',
  'pushed',
  'handed-off',
]
const NEXT = new Map([
  ['initialized', ['claimed']],
  ['claimed', ['researched', 'planned']],
  ['researched', ['planned']],
  ['planned', ['prepared']],
  ['prepared', ['blocks-built']],
  ['blocks-built', ['draft-written']],
  ['draft-written', ['verified']],
  ['verified', ['pushed']],
  ['pushed', ['handed-off']],
  ['handed-off', []],
])
const NOTE_CATEGORIES = new Set(['decision', 'review', 'client', 'assumption'])
const STOP_AFTER_VALUES = new Set(['', 'take-the-page', 'research', 'plan'])

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
}

function parseArgs(values) {
  const [command, ...rest] = values
  const options = {}
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index]
    if (!item.startsWith('--')) throw new Error(`Unexpected argument: ${item}`)
    const key = item.slice(2)
    const value = rest[index + 1]
    if (value == null || value.startsWith('--')) throw new Error(`Missing value for --${key}`)
    options[key] = value
    index += 1
  }
  return { command, options }
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function now() {
  return new Date().toISOString()
}

function safeName(value) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return normalized || 'page-draft'
}

function repoContext(cwd) {
  const root = git(cwd, 'rev-parse', '--show-toplevel')
  const branch = git(root, 'branch', '--show-current')
  const firstWorktreeLine = git(root, 'worktree', 'list', '--porcelain')
    .split('\n')
    .find((line) => line.startsWith('worktree '))
  const mainWorktree = firstWorktreeLine?.slice('worktree '.length)
  if (!branch || branch === 'main' || !mainWorktree || resolve(root) === resolve(mainWorktree)) {
    throw new Error('Run page-draft from a non-main worktree branch.')
  }
  return { root: resolve(root), branch, worktree: resolve(root) }
}

function stateDirectory(root) {
  return resolve(root, 'backups/page-draft-runs')
}

function assertStatePath(root, candidate) {
  const base = stateDirectory(root)
  const path = resolve(root, candidate)
  const inside = relative(base, path)
  if (inside === '' || inside.startsWith(`..${sep}`) || inside === '..' || isAbsolute(inside)) {
    throw new Error(`State path must be a JSON file inside ${base}`)
  }
  if (!path.endsWith('.json')) throw new Error('State path must end in .json')
  return path
}

function readState(root, candidate) {
  if (!candidate) throw new Error('Missing --state')
  const path = assertStatePath(root, candidate)
  const state = JSON.parse(readFileSync(path, 'utf8'))
  if (state.version !== VERSION) throw new Error(`Unsupported state version: ${state.version}`)
  if (!STAGES.includes(state.stage) && state.stage !== 'failed') throw new Error(`Unknown state stage: ${state.stage}`)
  return { path, state }
}

function atomicWrite(path, state) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(temporary, path)
}

function readDataFile(root, candidate) {
  if (!candidate) return {}
  return JSON.parse(readFileSync(resolve(root, candidate), 'utf8'))
}

function output(path, state) {
  process.stdout.write(`${JSON.stringify({ statePath: path, state }, null, 2)}\n`)
}

function initialize(context, options) {
  const runId = safeName(options['run-id'] || context.branch)
  const stopAfter = options['stop-after'] || ''
  if (!STOP_AFTER_VALUES.has(stopAfter)) throw new Error(`Unknown stop-after value: ${stopAfter}`)
  const runDirectory = join(stateDirectory(context.root), runId)
  const path = join(runDirectory, 'state.json')
  mkdirSync(join(runDirectory, 'artifacts'), { recursive: true })

  try {
    const existing = JSON.parse(readFileSync(path, 'utf8'))
    if (existing.branch !== context.branch || resolve(existing.worktree) !== context.worktree) {
      throw new Error(`Run id ${runId} belongs to another branch or worktree.`)
    }
    output(path, existing)
    return
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const timestamp = now()
  const state = {
    version: VERSION,
    runId,
    target: options.target || '',
    stopAfter,
    branch: context.branch,
    worktree: context.worktree,
    stage: 'initialized',
    lastSuccessfulStage: 'initialized',
    createdAt: timestamp,
    updatedAt: timestamp,
    artifactsDirectory: join(runDirectory, 'artifacts'),
    checkpoints: { initialized: { at: timestamp } },
    notesForOvi: [],
    history: [{ at: timestamp, event: 'initialized' }],
    failure: null,
  }
  atomicWrite(path, state)
  output(path, state)
}

function checkpoint(context, options) {
  const { path, state } = readState(context.root, options.state)
  const stage = options.stage
  if (!STAGES.includes(stage)) throw new Error(`Unknown checkpoint stage: ${stage}`)
  if (state.stage === 'failed') throw new Error('Resume the failed run before recording a checkpoint.')
  if (state.stage !== stage && !NEXT.get(state.stage)?.includes(stage)) {
    throw new Error(`Invalid transition: ${state.stage} -> ${stage}`)
  }
  const data = readDataFile(context.root, options['data-file'])
  const timestamp = now()
  state.stage = stage
  state.lastSuccessfulStage = stage
  state.updatedAt = timestamp
  state.failure = null
  state.checkpoints[stage] = { ...(state.checkpoints[stage] || {}), ...data, at: timestamp }
  state.history.push({ at: timestamp, event: 'checkpoint', stage })
  atomicWrite(path, state)
  output(path, state)
}

function addNote(context, options) {
  const { path, state } = readState(context.root, options.state)
  const category = options.category
  if (!NOTE_CATEGORIES.has(category)) throw new Error(`Unknown note category: ${category}`)
  if (!options.source || !options.text) throw new Error('A note requires --source and --text.')
  const duplicate = state.notesForOvi.some(
    (note) => note.category === category && note.source === options.source && note.text === options.text,
  )
  if (!duplicate) {
    state.notesForOvi.push({ category, source: options.source, text: options.text })
    state.updatedAt = now()
    state.history.push({ at: state.updatedAt, event: 'note', category, source: options.source })
    atomicWrite(path, state)
  }
  output(path, state)
}

function recordFailure(context, options) {
  const { path, state } = readState(context.root, options.state)
  if (!options.step || !options.reason) throw new Error('Failure requires --step and --reason.')
  if (state.stage === 'handed-off') throw new Error('A handed-off run cannot fail.')
  const timestamp = now()
  state.failure = { at: timestamp, step: options.step, reason: options.reason }
  state.stage = 'failed'
  state.updatedAt = timestamp
  state.history.push({ at: timestamp, event: 'failed', step: options.step })
  atomicWrite(path, state)
  output(path, state)
}

function resume(context, options) {
  const { path, state } = readState(context.root, options.state)
  if (state.stage !== 'failed') throw new Error(`Run is ${state.stage}, not failed.`)
  const timestamp = now()
  state.stage = state.lastSuccessfulStage
  state.updatedAt = timestamp
  state.history.push({ at: timestamp, event: 'resumed', fromFailure: state.failure })
  atomicWrite(path, state)
  output(path, state)
}

function show(context, options) {
  const { path, state } = readState(context.root, options.state)
  output(path, state)
}

try {
  const { command, options } = parseArgs(process.argv.slice(2))
  const context = repoContext(process.cwd())
  if (command === 'init') initialize(context, options)
  else if (command === 'checkpoint') checkpoint(context, options)
  else if (command === 'note') addNote(context, options)
  else if (command === 'fail') recordFailure(context, options)
  else if (command === 'resume') resume(context, options)
  else if (command === 'show') show(context, options)
  else throw new Error('Command must be init, checkpoint, note, fail, resume, or show.')
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
