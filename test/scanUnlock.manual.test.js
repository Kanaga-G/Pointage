// Test manuel pour le déverrouillage de la zone de scan
// Exécuter avec: node test/scanUnlock.manual.test.js

const http = require('http');

// Configuration du test
const BASE_URL = 'http://localhost:3003';
const TEST_TOKEN = 'Bearer test-token';

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

// Tests
async function runTests() {
  console.log('🚀 Début des tests de déverrouillage de la zone de scan\n');

  const tests = [
    {
      name: 'Test 1: Déverrouillage avec code PIN par défaut (1234)',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'pin', value: '1234' },
      expectedStatus: 200
    },
    {
      name: 'Test 2: Déverrouillage avec code PIN incorrect',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'pin', value: '9999' },
      expectedStatus: 403
    },
    {
      name: 'Test 3: Déverrouillage avec adresse MAC valide',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'mac', value: '00:1A:2B:3C:4D:5E' },
      expectedStatus: 200
    },
    {
      name: 'Test 4: Déverrouillage avec adresse IP valide',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'ip', value: '192.168.1.100' },
      expectedStatus: 200
    },
    {
      name: 'Test 5: Déverrouillage avec token valide',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'token', value: 'SCAN_UNLOCK_TOKEN' },
      expectedStatus: 200
    },
    {
      name: 'Test 6: Déverrouillage avec méthode non supportée',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'unsupported', value: 'test' },
      expectedStatus: 400
    },
    {
      name: 'Test 7: Obtenir le code PIN actuel',
      method: 'GET',
      path: '/api/scan/pin',
      data: null,
      expectedStatus: 200
    },
    {
      name: 'Test 8: Modifier le code PIN',
      method: 'PUT',
      path: '/api/scan/pin',
      data: { currentPin: '1234', newPin: '5678' },
      expectedStatus: 200
    },
    {
      name: 'Test 9: Vérifier le nouveau code PIN',
      method: 'POST',
      path: '/api/scan/unlock/request',
      data: { method: 'pin', value: '5678' },
      expectedStatus: 200
    },
    {
      name: 'Test 10: Réinitialiser le code PIN par défaut',
      method: 'POST',
      path: '/api/scan/pin/reset',
      data: null,
      expectedStatus: 200
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      console.log(`\n📋 ${test.name}`);
      
      const options = {
        hostname: 'localhost',
        port: 3003,
        path: test.path,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': TEST_TOKEN
        }
      };

      const result = await makeRequest(options, test.data);
      
      if (result.statusCode === test.expectedStatus) {
        console.log(`✅ Succès - Status: ${result.statusCode}`);
        if (result.body && result.body.message) {
          console.log(`   Message: ${result.body.message}`);
        }
        passedTests++;
      } else {
        console.log(`❌ Échec - Status attendu: ${test.expectedStatus}, reçu: ${result.statusCode}`);
        if (result.body) {
          console.log(`   Réponse: ${JSON.stringify(result.body)}`);
        }
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ Erreur - ${error.message}`);
      failedTests++;
    }
  }

  console.log('\n📊 Résultats des tests:');
  console.log(`✅ Tests réussis: ${passedTests}`);
  console.log(`❌ Tests échoués: ${failedTests}`);
  console.log(`📈 Taux de réussite: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
}

// Vérifier si le serveur est démarré
async function checkServer() {
  try {
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/pin',
      method: 'GET',
      headers: {
        'Authorization': TEST_TOKEN
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
  await runTests();
}

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, checkServer };
