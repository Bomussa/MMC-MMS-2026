import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcDir = path.join(root, 'src')

function hasTsSources(dir) {
  if (!existsSync(dir)) return false
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (hasTsSources(full)) return true
    } else if (/\.tsx?$/.test(entry)) {
      return true
    }
  }
  return false
}

if (!hasTsSources(srcDir)) {
  console.log('[typecheck] No TypeScript sources under src/. Skipping typecheck.')
  process.exit(0)
}

try {
  execSync('tsc --noEmit', { stdio: 'inherit' })
} catch (e) {
  process.exit(e.status || 1)
}
