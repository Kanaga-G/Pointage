// Configuration de la base de données PostgreSQL sans Prisma
const { Pool } = require('pg');

// Configuration de la connexion
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Pas de SSL pour le développement local
});

// Fonction pour exécuter des requêtes
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Exécuté la requête', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête', { text, error });
    throw error;
  }
}

// Fonction pour obtenir un client (pour les transactions)
async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Patch pour le timeout
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(client.queryTimeout);
    return release.apply(client);
  };
  
  return client;
}

// Initialisation de la base de données
async function initDatabase() {
  try {
    console.log('🔧 Initialisation de la base de données...');
    
    // Créer les tables si elles n'existent pas
    await createTables();
    
    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Création des tables
async function createTables() {
  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(50) NOT NULL,
      prenom VARCHAR(50) NOT NULL,
      adresse VARCHAR(255) DEFAULT 'Adresse non renseignée',
      email VARCHAR(100) UNIQUE NOT NULL,
      telephone VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      last_activity TIMESTAMP,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      profile_photo VARCHAR(255),
      contract_pdf VARCHAR(255),
      matricule VARCHAR(20) UNIQUE,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      phone_verified BOOLEAN DEFAULT false,
      two_factor_enabled BOOLEAN DEFAULT false,
      login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP
    );
  `;

  const createEmployesTable = `
    CREATE TABLE IF NOT EXISTS employes (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(50) NOT NULL,
      prenom VARCHAR(50) NOT NULL,
      adresse VARCHAR(255) DEFAULT 'Adresse non renseignée',
      email VARCHAR(100) UNIQUE NOT NULL,
      telephone VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'employe',
      last_activity TIMESTAMP,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      profile_photo VARCHAR(255),
      contract_pdf VARCHAR(255),
      matricule VARCHAR(20) UNIQUE,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      phone_verified BOOLEAN DEFAULT false,
      two_factor_enabled BOOLEAN DEFAULT false,
      login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP,
      admin_id INTEGER REFERENCES admins(id)
    );
  `;

  const createPointagesTable = `
    CREATE TABLE IF NOT EXISTS pointages (
      id SERIAL PRIMARY KEY,
      employe_id INTEGER NOT NULL,
      date_heure TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      type VARCHAR(10) NOT NULL CHECK (type IN ('entree', 'sortie')),
      methode VARCHAR(20) DEFAULT 'manuel',
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      photo_pointage VARCHAR(255),
      statut VARCHAR(20) DEFAULT 'en_attente',
      approuve_par INTEGER,
      date_approbation TIMESTAMP,
      motif_rejet TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
    );
  `;

  const createBadgesTable = `
    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      employe_id INTEGER NOT NULL,
      qr_code VARCHAR(255) UNIQUE NOT NULL,
      badge_data TEXT,
      date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_expiration TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      usage_count INTEGER DEFAULT 0,
      last_used TIMESTAMP,
      FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
    );
  `;

  try {
    await query(createAdminsTable);
    await query(createEmployesTable);
    await query(createPointagesTable);
    await query(createBadgesTable);
    console.log('✅ Tables créées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
}

module.exports = {
  query,
  getClient,
  initDatabase,
  pool
};
