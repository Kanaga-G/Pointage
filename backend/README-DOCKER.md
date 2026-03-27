# 🐳 Docker PostgreSQL - Backend Local

## 📋 Prérequis

- Docker Desktop installé et démarré
- Node.js 18+ installé

## 🚀 Démarrage rapide

### 1. Démarrer PostgreSQL avec Docker
```bash
npm run docker:start
```

Ce script va :
- ✅ Vérifier Docker
- ✅ Démarrer PostgreSQL dans un conteneur
- ✅ Attendre que la base soit prête
- ✅ Tester la connexion

### 2. Initialiser la base de données
```bash
npm run init:local
```

### 3. Démarrer le serveur backend
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3004`

## 📊 Configuration PostgreSQL

**Identifiants de connexion :**
- **Hôte** : localhost
- **Port** : 5432
- **Base** : pointage
- **Utilisateur** : moha
- **Mot de passe** : mohaguindo

**URL de connexion :**
```
postgresql://moha:mohaguindo@localhost:5432/pointage
```

## 🛠️ Scripts Docker

| Script | Description |
|--------|-------------|
| `npm run docker:start` | Démarre PostgreSQL dans Docker |
| `npm run docker:stop` | Arrête et supprime le conteneur PostgreSQL |
| `npm run init:local` | Initialise la base de données |
| `npm run dev` | Démarre le serveur backend |

## 🔍 Vérification

### Test de connexion PostgreSQL
```bash
docker exec postgres-registre psql -U moha -d pointage -c "SELECT version();"
```

### Test de l'API
```bash
curl http://localhost:3004/api/health
```

### Vérifier le conteneur
```bash
docker ps
# Vous devriez voir postgres-registre
```

## 🛠️ Dépannage

### Docker n'est pas installé
```bash
# Installez Docker Desktop depuis https://docker.com
# Redémarrez votre ordinateur après l'installation
```

### Port 5432 déjà utilisé
```bash
# Vérifiez ce qui utilise le port
netstat -ano | findstr :5432

# Arrêtez le service PostgreSQL local s'il est en cours d'exécution
net stop postgresql-x64-15
```

### Conteneur ne démarre pas
```bash
# Affichez les logs du conteneur
docker logs postgres-registre

# Redémarrez complètement
docker-compose down
docker-compose up -d postgres
```

### Problème de permissions
```bash
# Nettoyez tout et redémarrez
docker-compose down -v
docker system prune -f
npm run docker:start
```

## 📁 Fichiers Docker

- `docker-compose.yml` : Configuration du conteneur PostgreSQL
- `start-docker-postgres.ps1` : Script de démarrage PowerShell
- Volume `postgres_data` : Persistance des données

## 🔄 Cycle de vie

### Démarrage complet
```bash
npm run docker:start    # Démarre PostgreSQL
npm run init:local      # Initialise la base
npm run dev            # Démarre le backend
```

### Arrêt complet
```bash
# Arrête le backend (Ctrl+C)
npm run docker:stop    # Arrête PostgreSQL
```

### Redémarrage
```bash
npm run docker:stop    # Arrête
npm run docker:start   # Redémarre
npm run dev           # Démarre le backend
```

## 🎯 Avantages de Docker

- ✅ **Isolation** : Base de données isolée du système
- ✅ **Reproductibilité** : Même configuration partout
- ✅ **Nettoyage facile** : `docker-compose down`
- ✅ **Pas de conflits** : Pas de conflit avec PostgreSQL local
- ✅ **Rapide** : Démarrage en quelques secondes

---

**Docker PostgreSQL est maintenant configuré pour le développement local !** 🎉
