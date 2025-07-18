<?php
// Constantes de sécurité
define('SECRET_KEY', 'GroupeXpert2025!'); // Clé secrète pour HMAC
define('TOKEN_PREFIX', 'XPERT'); // Préfixe pour les tokens
define('TOKEN_EXPIRATION', 7200); // secondes (2 heures)

define('DB_HOST', 'localhost');
define('DB_NAME', 'pointage');
define('DB_USER', 'root');
define('DB_PASS', '');
// En-têtes de sécurité
header("Content-Security-Policy: default-src 'self'");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
// Configuration du fuseau horaire
date_default_timezone_set('Europe/Berlin');

// Pour vérifier que c'est bien pris en compte
// echo "Timezone actuel : " . date_default_timezone_get() . "\n";
// echo "Heure serveur : " . date('Y-m-d H:i:s') . "\n";
