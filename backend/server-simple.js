// Serveur backend simplifié sans Prisma
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initDatabase, query } = require('./database');

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-local-2024';
const BADGE_SECRET = process.env.BADGE_SECRET || 'dev-badge-secret-local-2024';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variables globales
let users = [];
let pointages = [];

// Fonctions utilitaires
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      prenom: user.prenom,
      nom: user.nom
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function generateMatricule() {
  const prefix = 'XP';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

// Routes d'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    // Rechercher l'utilisateur dans la table admins ou employes
    let user = null;
    
    try {
      const adminResult = await query('SELECT * FROM admins WHERE email = $1', [email]);
      if (adminResult.rows.length > 0) {
        user = adminResult.rows[0];
      }
    } catch (error) {
      console.error('Erreur recherche admin:', error);
    }
    
    if (!user) {
      try {
        const employeResult = await query('SELECT * FROM employes WHERE email = $1', [email]);
        if (employeResult.rows.length > 0) {
          user = employeResult.rows[0];
        }
      } catch (error) {
        console.error('Erreur recherche employé:', error);
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // Générer le token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        matricule: user.matricule
      }
    });
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'registre-employes-backend',
    database: 'postgresql',
    version: '1.0.0-sans-prisma'
  });
});

// Route pour obtenir les utilisateurs (admin seulement)
app.get('/api/users', async (req, res) => {
  try {
    // Récupérer tous les admins et employés
    const adminsResult = await query('SELECT id, nom, prenom, email, role, matricule, is_active FROM admins ORDER BY nom, prenom');
    const employesResult = await query('SELECT id, nom, prenom, email, role, matricule, is_active FROM employes ORDER BY nom, prenom');
    
    const allUsers = [
      ...adminsResult.rows.map(user => ({ ...user, type: 'admin' })),
      ...employesResult.rows.map(user => ({ ...user, type: 'employe' }))
    ];
    
    res.json({
      success: true,
      users: allUsers
    });
    
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour créer un admin
app.post('/api/admins', async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;
    
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await query('SELECT email FROM admins WHERE email = $1 UNION SELECT email FROM employes WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const matricule = generateMatricule();

    // Créer l'admin
    const result = await query(
      'INSERT INTO admins (nom, prenom, email, password, role, matricule) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nom, prenom, email, role, matricule',
      [nom, prenom, email, hashedPassword, 'admin', matricule]
    );

    res.json({
      success: true,
      message: 'Admin créé avec succès',
      admin: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour créer un employé
app.post('/api/employes', async (req, res) => {
  try {
    const { nom, prenom, email, password, admin_id } = req.body;
    
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await query('SELECT email FROM admins WHERE email = $1 UNION SELECT email FROM employes WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const matricule = generateMatricule();

    // Créer l'employé
    const result = await query(
      'INSERT INTO employes (nom, prenom, email, password, role, matricule, admin_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nom, prenom, email, role, matricule',
      [nom, prenom, email, hashedPassword, 'employe', matricule, admin_id || null]
    );

    res.json({
      success: true,
      message: 'Employé créé avec succès',
      employe: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erreur création employé:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour les pointages
app.get('/api/pointages', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, e.nom, e.prenom, e.email, e.matricule 
      FROM pointages p 
      JOIN employes e ON p.employe_id = e.id 
      ORDER BY p.date_heure DESC
      LIMIT 100
    `);
    
    res.json({
      success: true,
      pointages: result.rows
    });
    
  } catch (error) {
    console.error('Erreur récupération pointages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour créer un pointage
app.post('/api/pointages', async (req, res) => {
  try {
    const { employe_id, type, methode = 'manuel', latitude, longitude } = req.body;
    
    if (!employe_id || !type) {
      return res.status(400).json({ success: false, message: 'Employé ID et type requis' });
    }

    // Vérifier que l'employé existe
    const employeResult = await query('SELECT id FROM employes WHERE id = $1', [employe_id]);
    
    if (employeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    }

    // Créer le pointage
    const result = await query(
      'INSERT INTO pointages (employe_id, type, methode, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [employe_id, type, methode, latitude, longitude]
    );

    res.json({
      success: true,
      message: 'Pointage créé avec succès',
      pointage: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erreur création pointage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Démarrage du serveur
async function startServer() {
  try {
    // Initialiser la base de données
    await initDatabase();
    
    // Créer un admin par défaut si aucun n'existe
    const adminCount = await query('SELECT COUNT(*) as count FROM admins');
    
    if (parseInt(adminCount.rows[0].count) === 0) {
      console.log('👤 Création de l\'admin par défaut...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await query(
        'INSERT INTO admins (nom, prenom, email, password, role, matricule) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin', 'System', 'admin@xpertpro.local', hashedPassword, 'admin', generateMatricule()]
      );
      console.log('✅ Admin par défaut créé (admin@xpertpro.local / admin123)');
    }
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`💊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👤 Admin par défaut: admin@xpertpro.local / admin123`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet non géré:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  process.exit(1);
});

// Démarrer le serveur
startServer();
