# Script pour démarrer PostgreSQL avec Docker
# Configuration locale pour développement

Write-Host "Démarrage de PostgreSQL avec Docker..." -ForegroundColor Green
Set-Location (Join-Path $PSScriptRoot '..')

# Vérifier si Docker est installé et en cours d'exécution
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker est installé: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "Docker n'est pas installé ou accessible" -ForegroundColor Red
        Write-Host "Installez Docker depuis https://docker.com" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Docker n'est pas accessible" -ForegroundColor Red
    Write-Host "Installez Docker depuis https://docker.com" -ForegroundColor Yellow
    exit 1
}

# Arrêter et supprimer les conteneurs existants
Write-Host "Nettoyage des conteneurs existants..." -ForegroundColor Blue
docker-compose down 2>$null

# Démarrer PostgreSQL
Write-Host "Démarrage du conteneur PostgreSQL..." -ForegroundColor Blue
docker-compose up -d postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL démarre..." -ForegroundColor Green
} else {
    Write-Host "Erreur lors du démarrage de PostgreSQL" -ForegroundColor Red
    exit 1
}

# Attendre que PostgreSQL soit prêt
Write-Host "Attente du démarrage de PostgreSQL..." -ForegroundColor Yellow
$ready = $false
$attempts = 0
$maxAttempts = 30

while (-not $ready -and $attempts -lt $maxAttempts) {
    try {
        $result = docker exec postgres-registre pg_isready -U moha -d pointage 2>$null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            Write-Host "PostgreSQL est prêt!" -ForegroundColor Green
        } else {
            Start-Sleep -Seconds 2
            $attempts++
            Write-Host "Tentative $attempts/$maxAttempts..." -ForegroundColor Yellow
        }
    } catch {
        Start-Sleep -Seconds 2
        $attempts++
    }
}

if (-not $ready) {
    Write-Host "PostgreSQL n'a pas pu démarrer après $maxAttempts tentatives" -ForegroundColor Red
    exit 1
}

# Vérifier la connexion
Write-Host "Test de connexion à PostgreSQL..." -ForegroundColor Blue
try {
    $result = docker exec postgres-registre psql -U moha -d pointage -c "SELECT version();" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connexion PostgreSQL réussie!" -ForegroundColor Green
    } else {
        Write-Host "Erreur de connexion à PostgreSQL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Impossible de se connecter à PostgreSQL" -ForegroundColor Red
    exit 1
}

# Afficher les informations de connexion
Write-Host "Configuration PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Hôte: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Base: pointage" -ForegroundColor White
Write-Host "  Utilisateur: moha" -ForegroundColor White
Write-Host "  Mot de passe: mohaguindo" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Vous pouvez maintenant:" -ForegroundColor Green
Write-Host "  1. Initialiser la base: npm run init:local" -ForegroundColor White
Write-Host "  2. Démarrer le serveur: npm run dev" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Pour arrêter PostgreSQL: docker-compose down" -ForegroundColor Yellow
