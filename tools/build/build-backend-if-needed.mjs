import { existsSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

function hasTs(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (hasTs(join(dir, ent.name))) return true
      } else if (ent.isFile()) {
        if (ent.name.endsWith('.ts') || ent.name.endsWith('.tsx')) return true
      }
    }
  } catch {}
  return false
}

const needsTsBuild = existsSync(SRC) && hasTs(SRC)

if (!needsTsBuild) {
  console.log('[build:backend] No TypeScript sources detected under src/. Skipping tsc.')
  process.exit(0)
}

console.log('[build:backend] TypeScript sources found. Running tsc...')
const res = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' })
process.exit(res.status ?? 1)
