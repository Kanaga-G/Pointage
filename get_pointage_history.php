<?php
// Récupère l'historique de pointage des employés
require_once 'db.php';
header('Content-Type: application/json');

try {
    // Nouvelle requête : pour chaque employé et chaque jour, récupérer la première arrivée et le dernier départ
    $sql = "
        SELECT e.prenom, e.nom, 
               DATE(p.date_heure) as date_pointage,
               MIN(CASE WHEN p.type = 'arrivee' THEN TIME(p.date_heure) END) AS heure_arrivee,
               MAX(CASE WHEN p.type = 'depart' THEN TIME(p.date_heure) END) AS heure_depart,
               MAX(CASE WHEN p.type = 'arrivee' THEN p.retard_cause END) AS justification_retard
        FROM pointages p
        JOIN employes e ON p.employe_id = e.id
        WHERE p.type IN ('arrivee','depart')
        GROUP BY e.id, DATE(p.date_heure)
        ORDER BY date_pointage DESC, heure_arrivee DESC
        LIMIT 30
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $result]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
