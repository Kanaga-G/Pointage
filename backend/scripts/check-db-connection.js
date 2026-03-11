const path = require('path')
const { Client } = require('pg')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const IMPORTANT_TABLES = [
  'admins',
  'employes',
  'pointages',
  'demandes',
  'evenements',
  'badge_tokens',
  'badge_journalier',
  'notifications'
]

function maskDatabaseUrl(value) {
  if (!value) return ''
  try {
    const parsed = new URL(value)
    if (parsed.password) parsed.password = '***'
    return parsed.toString()
  } catch {
    return value.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@')
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL manquant dans backend/.env')
  }

  console.log('Database URL:', maskDatabaseUrl(databaseUrl))

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const info = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS user_name,
        inet_server_addr()::text AS server_host,
        inet_server_port() AS server_port
    `)
    console.log('Connexion OK:', info.rows[0])

    const privilegeResult = await client.query(`
      SELECT
        has_schema_privilege(current_user, 'public', 'USAGE') AS schema_usage,
        has_schema_privilege(current_user, 'public', 'CREATE') AS schema_create
    `)
    const schemaUsage = Boolean(privilegeResult.rows[0]?.schema_usage)
    const schemaCreate = Boolean(privilegeResult.rows[0]?.schema_create)
    console.log('Schema public privileges:', { schema_usage: schemaUsage, schema_create: schemaCreate })

    const tablesResult = await client.query(`
      SELECT c.relname AS table_name, pg_get_userbyid(c.relowner) AS owner
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r' AND n.nspname = 'public'
      ORDER BY c.relname
    `)

    const tables = tablesResult.rows.map((row) => row.table_name)
    console.log(`Tables detectees (${tables.length}):`, tables.join(', '))
    if (tablesResult.rows.length > 0) {
      const owners = [...new Set(tablesResult.rows.map((row) => row.owner))]
      console.log('Owners detectes:', owners.join(', '))
    }

    if (!schemaUsage) {
      console.log('Droits insuffisants sur schema public pour introspection Prisma.')
      console.log('Execute ces SQL avec un compte superuser (postgres) dans pgAdmin:')
      console.log("  GRANT CONNECT ON DATABASE pointage TO moha;")
      console.log("  GRANT USAGE ON SCHEMA public TO moha;")
      console.log("  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO moha;")
      console.log("  GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO moha;")
      console.log("  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO moha;")
      console.log("  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO moha;")
    }

    const existingImportant = IMPORTANT_TABLES.filter((table) => tables.includes(table))
    if (existingImportant.length === 0) {
      console.log('Aucune table metier detectee dans la liste standard.')
      return
    }

    if (!schemaUsage) {
      console.log('Comptage ignore: moha n a pas encore les droits USAGE sur public.')
      return
    }

    console.log('Comptages rapides:')
    for (const table of existingImportant) {
      // Sequential by design to keep output deterministic.
      // eslint-disable-next-line no-await-in-loop
      const countResult = await client.query(`SELECT COUNT(*)::int AS total FROM "${table}"`)
      console.log(`- ${table}: ${countResult.rows[0].total}`)
    }
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  const message = String(error?.message || error || '')
  console.error('Echec connexion PostgreSQL:', message)

  if (message.toLowerCase().includes('password authentication failed') || message.toLowerCase().includes('authentification par mot de passe')) {
    console.error('Hint: verifie user/password dans backend/.env (DATABASE_URL).')
  }
  if (message.toLowerCase().includes('does not exist')) {
    console.error('Hint: verifie le nom de base dans DATABASE_URL.')
  }
  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('ec timed out')) {
    console.error('Hint: verifie host/port et que PostgreSQL est demarre.')
  }
  process.exit(1)
})
