# Script de demarrage pour developpement local (Windows PowerShell)
# Utilise la base PostgreSQL locale

Write-Host "Demarrage du backend en mode local..." -ForegroundColor Green

# Verifier si PostgreSQL est en cours d'execution
Write-Host "Verification de PostgreSQL..." -ForegroundColor Blue
try {
    $result = & psql -h localhost -U moha -d postgres -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL est pret" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL n'est pas en cours d'execution" -ForegroundColor Red
        Write-Host "Demarrez PostgreSQL avec: pg_ctl -D /path/to/data start" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "PostgreSQL n'est pas accessible" -ForegroundColor Red
    Write-Host "Verifiez que PostgreSQL est installe et demarre" -ForegroundColor Yellow
    exit 1
}

# Verifier si la base de donnees existe
Write-Host "Verification de la base de donnees..." -ForegroundColor Blue
try {
    $result = & psql -h localhost -U moha -d pointage -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Base de donnees accessible" -ForegroundColor Green
    } else {
        Write-Host "La base de donnees 'pointage' n'existe pas" -ForegroundColor Red
        Write-Host "Creez la base avec: createdb -h localhost -U moha pointage" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Impossible de se connecter a la base de donnees" -ForegroundColor Red
    exit 1
}

# Demarrer le serveur avec la configuration locale
Write-Host "Demarrage du serveur..." -ForegroundColor Blue
$env:DATABASE_URL = "postgresql://moha:mohaguindo@localhost:5432/pointage"
$env:NODE_ENV = "development"
$env:PORT = "3004"

npm run dev
