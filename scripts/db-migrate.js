import dotenv from 'dotenv'
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const nodeEnv = process.env.NODE_ENV || 'development'
const envFile = path.join(root, `.env.${nodeEnv}`)
if (fs.existsSync(envFile)) dotenv.config({ path: envFile })
dotenv.config({ path: path.join(root, '.env') })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const migrationsDir = path.join(root, 'migrations')
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => /^\d+.*\.sql$/i.test(f))
  .sort()

const sql = postgres(databaseUrl, { max: 1 })

try {
  for (const file of files) {
    const full = path.join(migrationsDir, file)
    const sqlText = fs.readFileSync(full, 'utf8')
    await sql.begin(async (tx) => {
      await tx.unsafe(sqlText)
    })
    console.log('Migration applied:', path.relative(root, full))
  }
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
