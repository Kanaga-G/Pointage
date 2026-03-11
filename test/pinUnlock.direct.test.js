// Test direct du déverrouillage par PIN sans authentification
// Test si l'endpoint PIN répond correctement

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
async function runDirectTest() {
  console.log('🚀 Test direct du déverrouillage par PIN\n');

  try {
    // Test 1: Vérifier si l'endpoint PIN existe
    console.log('📋 Test 1: Vérification endpoint /api/scan/pin');
    const pinEndpointResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/pin',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log(`Status: ${pinEndpointResponse.statusCode}`);
    if (pinEndpointResponse.statusCode === 401) {
      console.log('✅ Endpoint PIN existe (requiert authentification)');
    } else if (pinEndpointResponse.statusCode === 404) {
      console.log('❌ Endpoint PIN non trouvé');
      return;
    } else {
      console.log('Response:', pinEndpointResponse.body);
    }

    // Test 2: Vérifier si l'endpoint unlock request existe
    console.log('\n📋 Test 2: Vérification endpoint /api/scan/unlock/request');
    const unlockEndpointResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    }, {
      method: 'pin',
      value: '1234'
    });

    console.log(`Status: ${unlockEndpointResponse.statusCode}`);
    if (unlockEndpointResponse.statusCode === 401) {
      console.log('✅ Endpoint unlock request existe (requiert authentification)');
    } else if (unlockEndpointResponse.statusCode === 404) {
      console.log('❌ Endpoint unlock request non trouvé');
      return;
    } else {
      console.log('Response:', unlockEndpointResponse.body);
    }

    // Test 3: Vérifier si le serveur a les variables globales initialisées
    console.log('\n📋 Test 3: Test sans token (vérifier les logs)');
    const noTokenResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      method: 'pin',
      value: '1234'
    });

    console.log(`Status: ${noTokenResponse.statusCode}`);
    if (noTokenResponse.statusCode === 400 && noTokenResponse.body?.message?.includes('Token')) {
      console.log('✅ Le middleware validateToken fonctionne');
    } else {
      console.log('Response:', noTokenResponse.body);
    }

    console.log('\n📋 Instructions pour tester manuellement:');
    console.log('1. Ouvrez le navigateur sur http://localhost:5173');
    console.log('2. Connectez-vous avec un compte admin ou super_admin');
    console.log('3. Naviguez vers /scan');
    console.log('4. Utilisez le code PIN "1234" pour déverrouiller');
    console.log('5. Vérifiez que la zone de scan s\'ouvre correctement');

    console.log('\n📋 Points de vérification:');
    console.log('✅ Le composant ScanLockScreen affiche "Code PIN (4 chiffres)"');
    console.log('✅ Le champ n\'accepte que des chiffres');
    console.log('✅ Le bouton "Déverrouiller" est désablé si < 4 chiffres');
    console.log('✅ Le code PIN "1234" déverrouille la zone');
    console.log('✅ La zone de scan devient verte et active');

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
      path: '/api/scan/pin',
      method: 'GET',
      headers: {
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
  await runDirectTest();
}

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runDirectTest, checkServer };
