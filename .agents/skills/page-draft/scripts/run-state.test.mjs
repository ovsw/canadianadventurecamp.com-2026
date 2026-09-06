import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const script = new URL('./run-state.mjs', import.meta.url).pathname

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function run(cwd, ...args) {
  return JSON.parse(execFileSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' }))
}

function repository() {
  const base = mkdtempSync(join(tmpdir(), 'page-draft-state-'))
  const main = join(base, 'main')
  const worktree = join(base, 'worktree')
  mkdirSync(main)
  git(main, 'init', '-b', 'main')
  git(main, 'config', 'user.email', 'test@example.com')
  git(main, 'config', 'user.name', 'Test')
  writeFileSync(join(main, 'tracked'), '')
  git(main, 'add', 'tracked')
  git(main, 'commit', '-m', 'test')
  git(main, 'worktree', 'add', '-b', 'feature/test-page', worktree)
  return { main, worktree }
}

test('initializes once and resumes the same branch state', () => {
  const { worktree: root } = repository()
  const first = run(root, 'init', '--target', 'family-guide', '--stop-after', 'plan')
  const second = run(root, 'init', '--target', 'ignored-on-resume')

  assert.equal(first.state.stage, 'initialized')
  assert.equal(second.statePath, first.statePath)
  assert.equal(second.state.target, 'family-guide')
  assert.equal(second.state.stopAfter, 'plan')
  assert.match(first.state.artifactsDirectory, /backups\/page-draft-runs\/feature-test-page\/artifacts$/)
})

test('allows the existing-plan transition and idempotent checkpoint updates', () => {
  const { worktree: root } = repository()
  const initialized = run(root, 'init', '--target', '57')
  const state = initialized.statePath
  const data = join(root, 'plan.json')
  writeFileSync(data, '{"issueNumber":57}')

  run(root, 'checkpoint', '--state', state, '--stage', 'claimed')
  run(root, 'checkpoint', '--state', state, '--stage', 'planned', '--data-file', data)
  const repeated = run(root, 'checkpoint', '--state', state, '--stage', 'planned', '--data-file', data)

  assert.equal(repeated.state.stage, 'planned')
  assert.equal(repeated.state.checkpoints.planned.issueNumber, 57)
})

test('rejects skipped transitions', () => {
  const { worktree: root } = repository()
  const initialized = run(root, 'init', '--target', 'family-guide')
  const result = spawnSync(process.execPath, [script, 'checkpoint', '--state', initialized.statePath, '--stage', 'prepared'], {
    cwd: root,
    encoding: 'utf8',
  })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /Invalid transition: initialized -> prepared/)
})

test('deduplicates notes and resumes from the last successful stage', () => {
  const { worktree: root } = repository()
  const initialized = run(root, 'init', '--target', 'family-guide')
  const state = initialized.statePath
  run(root, 'checkpoint', '--state', state, '--stage', 'claimed')
  run(root, 'note', '--state', state, '--category', 'client', '--source', 'research', '--text', 'Confirm the price.')
  run(root, 'note', '--state', state, '--category', 'client', '--source', 'research', '--text', 'Confirm the price.')
  run(root, 'fail', '--state', state, '--step', 'research', '--reason', 'The old site did not respond.')
  const resumed = run(root, 'resume', '--state', state)

  assert.equal(resumed.state.stage, 'claimed')
  assert.equal(resumed.state.notesForOvi.length, 1)
  assert.equal(JSON.parse(readFileSync(state, 'utf8')).failure.reason, 'The old site did not respond.')
})

test('refuses the main branch', () => {
  const { main } = repository()
  const result = spawnSync(process.execPath, [script, 'init', '--target', 'family-guide'], {
    cwd: main,
    encoding: 'utf8',
  })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /non-main worktree branch/)
})
