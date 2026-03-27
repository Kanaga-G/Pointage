# Script d'initialisation de la base PostgreSQL (Docker)
# Crée la base de données et applique le schéma

Write-Host "Initialisation de la base PostgreSQL (Docker)..." -ForegroundColor Green
Set-Location $PSScriptRoot

# Vérifier si le conteneur PostgreSQL est en cours d'exécution
try {
    $result = docker exec postgres-registre pg_isready -U moha -d pointage 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL Docker est pret" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL Docker n'est pas en cours d'execution" -ForegroundColor Red
        Write-Host "Demarrez-le avec: npm run docker:start" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "PostgreSQL Docker n'est pas accessible" -ForegroundColor Red
    Write-Host "Demarrez-le avec: npm run docker:start" -ForegroundColor Yellow
    exit 1
}

# Nettoyer la base de données existante
Write-Host "Nettoyage de la base de donnees..." -ForegroundColor Blue
docker exec postgres-registre psql -U moha -d pointage -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>$null

# Appliquer le schéma Prisma
Write-Host "Application du schema Prisma..." -ForegroundColor Blue
.\node_modules\.bin\prisma.cmd db push --schema .\\prisma\\schema.prisma

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema applique avec succes" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de l'application du schema" -ForegroundColor Red
    exit 1
}

# Créer des utilisateurs de test
Write-Host "Creation des utilisateurs de test..." -ForegroundColor Blue
node create-admin.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "Utilisateurs de test crees" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de la creation des utilisateurs" -ForegroundColor Yellow
}

# Vérifier la connexion
Write-Host "Test de connexion a la base..." -ForegroundColor Blue
try {
    $result = docker exec postgres-registre psql -U moha -d pointage -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Base de donnees prete et accessible" -ForegroundColor Green
        Write-Host "Vous pouvez maintenant demarrer le serveur avec: npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host "Erreur de connexion a la base" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Impossible de se connecter a la base de donnees" -ForegroundColor Red
    exit 1
}

Write-Host "Initialisation terminee!" -ForegroundColor Green
