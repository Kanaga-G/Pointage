// Test simple pour le déverrouillage par code PIN
// Simule une connexion admin puis teste le déverrouillage

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
async function runTest() {
  console.log('🚀 Test de déverrouillage par code PIN\n');

  try {
    // Étape 1: Connexion admin pour obtenir un token
    console.log('📋 Étape 1: Connexion admin');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@xpert.com',
      password: 'XpertPro2026'
    });

    if (loginResponse.statusCode !== 200 || !loginResponse.body?.success) {
      console.log('❌ Échec de connexion admin');
      console.log('Status:', loginResponse.statusCode);
      console.log('Response:', loginResponse.body);
      return;
    }

    const token = loginResponse.body.token;
    console.log('✅ Connexion admin réussie');
    console.log('Token:', token.substring(0, 20) + '...');

    // Étape 2: Test du code PIN par défaut
    console.log('\n📋 Étape 2: Test déverrouillage PIN par défaut (1234)');
    const pinResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      method: 'pin',
      value: '1234',
      deviceName: 'Test Device',
      duration: 60
    });

    console.log(`Status: ${pinResponse.statusCode}`);
    if (pinResponse.body?.success) {
      console.log('✅ Déverrouillage PIN réussi!');
      console.log('Session ID:', pinResponse.body.session?.id);
      console.log('Méthode:', pinResponse.body.session?.method);
      console.log('Expires:', pinResponse.body.session?.expiresAt);
    } else {
      console.log('❌ Échec du déverrouillage PIN');
      console.log('Response:', pinResponse.body);
    }

    // Étape 3: Test du code PIN incorrect
    console.log('\n📋 Étape 3: Test PIN incorrect (9999)');
    const pinIncorrectResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/unlock/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      method: 'pin',
      value: '9999',
      deviceName: 'Test Device',
      duration: 60
    });

    console.log(`Status: ${pinIncorrectResponse.statusCode}`);
    if (pinIncorrectResponse.statusCode === 403 && !pinIncorrectResponse.body?.success) {
      console.log('✅ PIN incorrect correctement rejeté');
    } else {
      console.log('❌ Le PIN incorrect aurait dû être rejeté');
      console.log('Response:', pinIncorrectResponse.body);
    }

    // Étape 4: Test Super Admin
    console.log('\n📋 Étape 4: Test Super Admin (sans PIN)');
    
    // D'abord créer un utilisateur super_admin
    const superAdminLogin = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'super_admin@xpert.com',
      password: 'XpertPro2026'
    });

    if (superAdminLogin.statusCode === 200 && superAdminLogin.body?.success) {
      const superToken = superAdminLogin.body.token;
      
      const superAdminResponse = await makeRequest({
        hostname: 'localhost',
        port: 3003,
        path: '/api/scan/unlock/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superToken}`
        }
      }, {
        method: 'admin_override',
        deviceName: 'Super Admin Device',
        duration: 60
      });

      console.log(`Status: ${superAdminResponse.statusCode}`);
      if (superAdminResponse.body?.success) {
        console.log('✅ Super Admin déverrouillage réussi!');
        console.log('Session ID:', superAdminResponse.body.session?.id);
        console.log('Méthode:', superAdminResponse.body.session?.method);
      } else {
        console.log('❌ Échec du déverrouillage Super Admin');
        console.log('Response:', superAdminResponse.body);
      }
    } else {
      console.log('⚠️  Utilisateur super_admin non trouvé, test sauté');
    }

    // Étape 5: Test de gestion du PIN
    console.log('\n📋 Étape 5: Test gestion du PIN');
    
    // Obtenir le PIN actuel
    const getCurrentPinResponse = await makeRequest({
      hostname: 'localhost',
      port: 3003,
      path: '/api/scan/pin',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${getCurrentPinResponse.statusCode}`);
    if (getCurrentPinResponse.body?.success) {
      console.log('✅ PIN actuel obtenu');
      console.log('PIN:', getCurrentPinResponse.body.pin);
      console.log('Est par défaut:', getCurrentPinResponse.body.isDefault);
    } else {
      console.log('❌ Échec obtention PIN');
      console.log('Response:', getCurrentPinResponse.body);
    }

    console.log('\n🎉 Tests terminés!');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
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
  await runTest();
}

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, checkServer };
