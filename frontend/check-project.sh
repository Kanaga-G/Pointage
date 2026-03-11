#!/bin/bash

echo "🔍 Vérification du projet React..."

# Vérifier les erreurs TypeScript
echo "📝 Vérification TypeScript..."
npx tsc --noEmit --skipLibCheck
if [ $? -eq 0 ]; then
    echo "✅ TypeScript OK"
else
    echo "❌ Erreurs TypeScript trouvées"
    exit 1
fi

# Vérifier que le build fonctionne
echo "🏗️  Test du build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build OK"
else
    echo "❌ Erreur de build"
    exit 1
fi

echo "🎉 Tous les tests sont passés avec succès !"
echo "📱 Le dashboard admin moderne est prêt à être utilisé"
echo "🌐 Accès: http://localhost:5174/admin/dashboard"
