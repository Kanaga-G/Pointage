# Script d'initialisation de la base PostgreSQL locale
# Crée la base de données et applique les migrations

Write-Host "🗄️ Initialisation de la base PostgreSQL locale..." -ForegroundColor Green

# Vérifier si PostgreSQL est en cours d'exécution
try {
    $result = & psql -h localhost -U moha -d postgres -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL est prêt" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL n'est pas en cours d'exécution" -ForegroundColor Red
        Write-Host "💡 Démarrez PostgreSQL avec: pg_ctl -D /path/to/data start" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ PostgreSQL n'est pas accessible" -ForegroundColor Red
    Write-Host "💡 Vérifiez que PostgreSQL est installé et démarré" -ForegroundColor Yellow
    exit 1
}

# Créer la base de données si elle n'existe pas
Write-Host "🏗️ Création de la base de données 'pointage'..." -ForegroundColor Blue
try {
    $result = & createdb -h localhost -U moha pointage 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données 'pointage' créée" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ La base de données existe déjà" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️ La base de données existe probablement déjà" -ForegroundColor Yellow
}

# Générer le client Prisma
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Blue
$env:DATABASE_URL = "postgresql://moha:mohaguindo@localhost:5432/pointage"
npm run prisma:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Client Prisma généré" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la génération du client Prisma" -ForegroundColor Red
    exit 1
}

# Appliquer les migrations
Write-Host "🔄 Application des migrations..." -ForegroundColor Blue
npm run prisma:migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations appliquées" -ForegroundColor Green
} else {
    Write-Host "⚠️ Erreur lors des migrations (peut être normal si déjà appliquées)" -ForegroundColor Yellow
}

# Vérifier la connexion
Write-Host "📡 Test de connexion à la base..." -ForegroundColor Blue
try {
    $result = & psql -h localhost -U moha -d pointage -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données prête et accessible" -ForegroundColor Green
        Write-Host "🚀 Vous pouvez maintenant démarrer avec: npm run dev:local" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur de connexion à la base" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Impossible de se connecter à la base de données" -ForegroundColor Red
    exit 1
}
