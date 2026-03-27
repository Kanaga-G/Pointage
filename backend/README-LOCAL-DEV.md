# 🚀 Backend - Développement Local

## 📋 Prérequis

- PostgreSQL installé et démarré
- Utilisateur `moha` avec mot de passe `mohaguindo`
- Node.js 18+ installé

## 🔧 Installation et Configuration

### 1. Installation des dépendances
```bash
npm install
```

### 2. Initialisation de la base locale
```bash
npm run init:local
```

Ce script va :
- ✅ Vérifier PostgreSQL
- ✅ Créer la base `pointage`
- ✅ Appliquer le schéma Prisma
- ✅ Créer des utilisateurs de test

### 3. Démarrage du serveur
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3004`

## 📊 Configuration

### Base de données PostgreSQL
- **Hôte** : localhost
- **Port** : 5432
- **Utilisateur** : moha
- **Mot de passe** : mohaguindo
- **Base** : pointage

### Variables d'environnement (`.env`)
```env
DATABASE_URL="postgresql://moha:mohaguindo@localhost:5432/pointage"
PORT=3004
NODE_ENV=development
JWT_SECRET="dev-jwt-secret-local-2024"
BADGE_SECRET="dev-badge-secret-local-2024"
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

## 🚀 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run init:local` | Initialise la base PostgreSQL locale |
| `npm run dev` | Démarre le serveur en mode développement |
| `npm run build` | Génère le client Prisma |
| `npm run prisma:migrate` | Applique les migrations |
| `npm run create:admin` | Crée un administrateur |
| `npm run db:users` | Liste les utilisateurs |

## 🔍 Vérification

### Test de connexion à la base
```bash
psql -h localhost -U moha -d pointage -c "SELECT version();"
```

### Test de l'API
```bash
curl http://localhost:3004/api/health
```

## 👥 Utilisateurs de test

Après l'initialisation, vous aurez :
- **Admin** : admin@xpertpro.local / admin123
- **Employé** : employe@xpertpro.local / employe123

## 🛠️ Dépannage

### PostgreSQL ne démarre pas
```bash
# Sur Windows
net start postgresql-x64-15

# Ou avec pg_ctl
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

### Base de données n'existe pas
```bash
createdb -h localhost -U moha pointage
```

### Erreur de connexion
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les identifiants (moha/mohaguindo)
3. Vérifiez que la base `pointage` existe

## 🌐 Endpoints API

Une fois démarré :
- **Health** : http://localhost:3004/api/health
- **Login** : http://localhost:3004/api/auth/login
- **Employés** : http://localhost:3004/api/employes
- **Pointages** : http://localhost:3004/api/pointages

## 📝 Notes

- Le backend est configuré pour fonctionner **uniquement en local**
- Toutes les références à Render ont été supprimées
- La base de données PostgreSQL locale est utilisée
- Le CORS est configuré pour `http://localhost:5173`

---

**Le développement local est maintenant prêt !** 🎉
