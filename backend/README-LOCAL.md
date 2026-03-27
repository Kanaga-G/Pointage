# 🚀 Développement Local - Backend

## 📋 Prérequis

- PostgreSQL installé et démarré
- Utilisateur `moha` avec mot de passe `mohaguindo`
- Base de données `pointage` (créée automatiquement)

## 🔧 Configuration

### 1. Initialisation de la base locale

```bash
npm run init:local
```

Ce script va :
- ✅ Vérifier que PostgreSQL est démarré
- ✅ Créer la base de données `pointage`
- ✅ Générer le client Prisma
- ✅ Appliquer les migrations

### 2. Démarrage du serveur local

```bash
npm run dev:local
```

Ce script va :
- ✅ Configurer les variables d'environnement locales
- ✅ Démarrer le serveur sur le port 3004
- ✅ Se connecter à la base PostgreSQL locale

## 📊 Configuration de la base locale

**Identifiants PostgreSQL :**
- Hôte : `localhost`
- Port : `5432`
- Utilisateur : `moha`
- Mot de passe : `mohaguindo`
- Base : `pointage`

**URL de connexion :**
```
postgresql://moha:mohaguindo@localhost:5432/pointage
```

## 🔍 Vérification

### Test de connexion à la base

```bash
psql -h localhost -U moha -d pointage -c "SELECT version();"
```

### Test de l'API

```bash
curl http://localhost:3004/api/health
```

## 🛠️ Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run init:local` | Initialise la base de données locale |
| `npm run dev:local` | Démarre le serveur avec la base locale |
| `npm run dev` | Démarre le serveur (config par défaut) |
| `npm run build` | Génère le client Prisma |

## 📁 Fichiers de configuration

- `.env.local` : Configuration pour le développement local
- `start-local.ps1` : Script de démarrage PowerShell
- `init-local-db.ps1` : Script d'initialisation PowerShell

## 🚨 Dépannage

### PostgreSQL ne démarre pas

```bash
# Sur Windows avec service PostgreSQL
net start postgresql-x64-15

# Ou avec pg_ctl
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

### Base de données n'existe pas

```bash
# Créer manuellement la base
createdb -h localhost -U moha pointage
```

### Erreur de connexion

1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les identifiants (moha/mohaguindo)
3. Vérifiez que la base `pointage` existe

## 🌐 Accès au serveur

Une fois démarré, le serveur est accessible sur :
- **API** : http://localhost:3004/api
- **Health** : http://localhost:3004/api/health
- **Documentation** : http://localhost:3004/api/docs

## 🔄 Synchronisation avec la production

Pour synchroniser les données entre la base locale et Render :

```bash
# Exporter depuis Render
npm run db:pull

# Importer vers la base locale
npm run db:sync
```

---

**Le développement local est maintenant configuré !** 🎉
