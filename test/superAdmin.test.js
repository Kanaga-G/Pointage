// Test pour vérifier que le super_admin peut déverrouiller la zone de scan
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3003';

// Fonction pour faire des requêtes HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test principal
async function testSuperAdmin() {
  console.log('🚀 Test du déverrouillage Super Admin\n');

  try {
    // Test 1: Vérifier si l'endpoint accepte admin_override
    console.log('📋 Test 1: Test méthode admin_override');
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-super-admin'
      }
    }, {
      method: 'admin_override',
      duration: 60
    });

    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', response.body);

    if (response.statusCode === 401) {
      console.log('✅ Endpoint fonctionne (requiert authentification valide)');
    } else if (response.statusCode === 400 && response.body?.message?.includes('non supportée')) {
      console.log('❌ Erreur: méthode admin_override non supportée par le backend');
    } else if (response.statusCode === 200 && response.body?.success) {
      console.log('✅ Super admin déverrouillage réussi!');
      console.log('Session ID:', response.body.session?.id);
      console.log('Méthode:', response.body.session?.method);
      console.log('Expires:', response.body.session?.expiresAt);
    } else {
      console.log('⚠️  Réponse inattendue');
    }

    // Test 2: Vérifier si le backend détecte le super_admin
    console.log('\n📋 Test 2: Test avec token invalide pour voir les logs');
    
    const invalidResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    }, {
      method: 'admin_override',
      duration: 60
    });

    console.log(`Status: ${invalidResponse.statusCode}`);
    if (invalidResponse.statusCode === 401) {
      console.log('✅ Middleware valide les tokens correctement');
    } else {
      console.log('Response:', invalidResponse.body);
    }

    console.log('\n📋 Instructions pour tester manuellement:');
    console.log('1. Connectez-vous en tant que super_admin');
    console.log('2. Naviguez vers /scan');
    console.log('3. Le super_admin devrait déverrouiller automatiquement');
    console.log('4. Vérifiez les logs du backend pour "Super_admin détecté"');

    console.log('\n📋 Vérification des logs:');
    console.log('• Recherchez "Super_admin détecté, déverrouillage automatique" dans les logs');
    console.log('• Vérifiez que la session est créée avec method: "admin_override"');
    console.log('• Confirmez que la réponse est success: true');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Vérifier si le serveur est démarré
async function checkServer() {
  try {
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

    await makeRequest(options);
    return true;
  } catch (error) {
    return false;
  }
}

// Point d'entrée principal
async function main() {
  console.log('🔍 Vérification si le serveur backend est démarré...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Le serveur backend n\'est pas démarré sur http://localhost:3003');
    console.log('📝 Veuillez démarrer le serveur avec: cd backend && node server.js');
    process.exit(1);
  }

  console.log('✅ Serveur backend détecté');
  await testSuperAdmin();
}

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSuperAdmin, checkServer };
