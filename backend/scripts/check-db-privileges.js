const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Client } = require('pg');

// Match backend/server.js behavior: prefer .env.local when present.
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: fs.existsSync(envLocalPath) ? envLocalPath : envPath });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is missing.');
  process.exit(2);
}

const TABLES = [
  'public.admins',
  'public.employes',
  'public.parametres_utilisateur',
  'public.notifications',
  'public.password_resets'
];
const PRIVS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const who = await client.query('select current_user as user, current_database() as db');
  console.log('Connected as:', who.rows[0]);

  const results = [];
  for (const table of TABLES) {
    for (const priv of PRIVS) {
      // has_table_privilege(user, table, privilege)
      const q = await client.query(
        'select has_table_privilege(current_user, $1, $2) as ok',
        [table, priv]
      );
      results.push({ table, priv, ok: q.rows[0].ok });
    }
  }

  console.table(results);
  await client.end();
}

main().catch((err) => {
  console.error('Privilege check failed:', err);
  process.exit(1);
});

