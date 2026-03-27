#!/bin/bash

# Script de démarrage pour développement local
# Utilise la base PostgreSQL locale

echo "🚀 Démarrage du backend en mode local..."

# Vérifier si PostgreSQL est en cours d'exécution
echo "📡 Vérification de PostgreSQL..."
if ! pg_isready -h localhost -p 5432 -U moha; then
    echo "❌ PostgreSQL n'est pas en cours d'exécution"
    echo "💡 Démarrez PostgreSQL avec: pg_ctl -D /path/to/data start"
    exit 1
fi

echo "✅ PostgreSQL est prêt"

# Vérifier si la base de données existe
echo "🗄️ Vérification de la base de données..."
if ! psql -h localhost -U moha -d pointage -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ La base de données 'pointage' n'existe pas"
    echo "💡 Créez la base avec: createdb -h localhost -U moha pointage"
    exit 1
fi

echo "✅ Base de données accessible"

# Démarrer le serveur avec la configuration locale
echo "🔧 Démarrage du serveur..."
export DATABASE_URL="postgresql://moha:mohaguindo@localhost:5432/pointage"
export NODE_ENV="development"
export PORT="3004"

npm run dev
