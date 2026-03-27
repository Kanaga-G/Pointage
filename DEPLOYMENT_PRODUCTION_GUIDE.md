# Guide de Configuration Production - Render & Netlify

## 🚀 Étapes de Configuration

### 1. **Configuration Backend sur Render**

#### Variables d'environnement à ajouter dans Render Dashboard :

```bash
# Base de données PostgreSQL
DATABASE_URL=postgresql://votre_username:votre_password@votre_host_render:5432/votre_database

# Configuration serveur
PORT=3003
NODE_ENV=production
SERVICE_MODE=production

# Secrets JWT (générer avec: openssl rand -base64 32)
JWT_SECRET=votre-super-secret-jwt-production-ici
BADGE_SECRET=votre-super-secret-badge-production-ici

# CORS pour Netlify
CORS_ORIGIN=https://votre-frontend.netlify.app
FRONTEND_URL=https://votre-frontend.netlify.app
CORS_ALLOWED_ORIGINS=https://votre-frontend.netlify.app

# Sécurité
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000

# Performance
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### Actions dans Render Dashboard :
1. Allez dans votre service "registre-employe"
2. Section "Environment" → "Environment Variables"
3. Ajoutez toutes les variables ci-dessus
4. Redémarrez le service

### 2. **Configuration Frontend sur Netlify**

#### Variables d'environnement à ajouter dans Netlify Dashboard :

```bash
# URL de l'API backend Render
VITE_API_URL=https://votre-service-backend.onrender.com
VITE_BACKEND_URL=https://votre-service-backend.onrender.com
VITE_API_ENDPOINT=https://votre-service-backend.onrender.com/api

# Configuration application
VITE_APP_NAME=Registre Employé
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
VITE_SERVICE_MODE=production

# Timeouts
VITE_API_TIMEOUT=30000
VITE_REQUEST_TIMEOUT=30000

# Fonctionnalités
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_DEBUG=false

# Dashboard
VITE_DASHBOARD_REFRESH_INTERVAL=30000
VITE_NOTIFICATION_CHECK_INTERVAL=15000
```

#### Actions dans Netlify Dashboard :
1. Allez dans votre site Netlify
2. Section "Site settings" → "Environment variables"
3. Ajoutez les variables ci-dessus
4. Trigger un nouveau déploiement

### 3. **URLs à remplacer**

Dans les fichiers `.env.production`, remplacez :

**Backend Render :**
- `votre-service-backend.onrender.com` → URL réelle de votre service Render
- `postgresql://votre_username:votre_password@votre_host_render:5432/votre_database` → URL réelle de votre base PostgreSQL

**Frontend Netlify :**
- `https://votre-frontend.netlify.app` → URL réelle de votre site Netlify

### 4. **Vérification Post-Déploiement**

#### Tests à effectuer :
1. **Backend** : `https://votre-service-backend.onrender.com/api/health`
2. **Frontend** : `https://votre-frontend.netlify.app`
3. **CORS** : Vérifier que le frontend peut appeler l'API
4. **Authentification** : Test de connexion admin/employé
5. **Fonctionnalités** : Pointage, demandes, dashboard

### 5. **Dépannage**

#### Problèmes courants :
- **CORS** : Vérifier que `CORS_ORIGIN` contient l'URL Netlify exacte
- **Database** : Confirmer que `DATABASE_URL` est correct et accessible
- **Timeouts** : Augmenter `VITE_API_TIMEOUT` si les requêtes sont lentes
- **Build** : Vérifier que toutes les variables `VITE_*` sont présentes

#### Logs et monitoring :
- Render : Logs disponibles dans le dashboard du service
- Netlify : Logs dans "Deploys" et "Functions"

## 🔐 Sécurité

- **Ne jamais** commiter les vraies valeurs secrètes
- **Utiliser** des secrets générés aléatoirement
- **Limiter** les origins CORS à votre domaine exact
- **Surveiller** les logs pour activités suspectes

## 📞 Support

- Render Dashboard : Documentation et support intégrés
- Netlify Dashboard : Support et monitoring
- Base de données : Logs PostgreSQL dans Render
