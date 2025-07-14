<?php
// Suppression du journal des événements de pointage côté serveur
header('Content-Type: application/json');
ini_set('display_errors', 0); // Jamais d'erreur PHP en sortie
$logFile = __DIR__ . '/logs/pointage_system.log';

if (file_exists($logFile)) {
    file_put_contents($logFile, '');
    echo json_encode(['success' => true, 'message' => 'Journal vidé']);
} else {
    echo json_encode(['success' => false, 'message' => 'Fichier journal introuvable']);
}
