import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function writeAtomicJSON(filePath: string, data: unknown): Promise<void> {
  const directory = path.dirname(filePath)
  await fs.mkdir(directory, { recursive: true })
  const tempFile = `${filePath}.tmp-${process.pid}-${Date.now()}`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tempFile, filePath)
}

export async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
