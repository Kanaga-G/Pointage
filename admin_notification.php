<?php
// admin_notification.php : gestion des notifications de justification de retard (admin/super admin)

session_start();
require_once 'db.php';

header('Content-Type: application/json');

// Vérifie que l'utilisateur est un admin OU un super admin
if (!isset($_SESSION['admin_id']) && !isset($_SESSION['super_admin_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès refusé']);
    exit;
}

// Déterminer l'action (GET ou POST)
$action = $_GET['action'] ?? $_POST['action'] ?? null;

if (!$action || $action === 'table') {
    // Affichage HTML des notifications de justification de retard
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Notifications de retard</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"></head><body class="p-4"><div class="container">';
    echo '<h2 class="mb-4">Notifications de justification de retard</h2>';
    try {
        $stmt = $pdo->prepare("SELECT n.id, n.employe_id, e.nom, e.prenom, n.date, n.message, n.lue FROM notifications n JOIN employes e ON n.employe_id = e.id WHERE n.type = 'justif_retard' ORDER BY n.date DESC LIMIT 50");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($rows) === 0) {
            echo '<div class="alert alert-info">Aucune notification de justification de retard.</div>';
        } else {
            echo '<table class="table table-bordered table-striped"><thead><tr><th>#</th><th>Employé</th><th>Date</th><th>Message</th><th>Statut</th><th>Lue</th></tr></thead><tbody>';
            foreach ($rows as $notif) {
                echo '<tr>';
                echo '<td>' . htmlspecialchars($notif['id']) . '</td>';
                echo '<td>' . htmlspecialchars($notif['prenom'] . ' ' . $notif['nom']) . '</td>';
                echo '<td>' . htmlspecialchars($notif['date']) . '</td>';
                echo '<td>' . htmlspecialchars($notif['message']) . '</td>';
                echo '<td>' . htmlspecialchars($notif['statut'] ?? '-') . '</td>';
                echo '<td>' . ($notif['lue'] ? 'Oui' : '<span class="badge bg-danger">Non</span>') . '</td>';
                echo '</tr>';
            }
            echo '</tbody></table>';
        }
    } catch (PDOException $e) {
        echo '<div class="alert alert-danger">Erreur base de données : ' . htmlspecialchars($e->getMessage()) . '</div>';
    }
    echo '<a href="admin_dashboard.php" class="btn btn-secondary mt-3">Retour au dashboard</a>';
    echo '</div></body></html>';
    exit;
}

try {
    if ($action === 'list') {
        // Récupérer les dernières 50 notifications de type "justif_retard"
        $stmt = $pdo->prepare("
            SELECT n.id, n.employe_id, e.nom, e.prenom, n.date, n.message, n.lue
            FROM notifications n
            JOIN employes e ON n.employe_id = e.id
            WHERE n.type = 'justif_retard'
            ORDER BY n.date DESC
            LIMIT 50
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    if ($action === 'read') {
        // Marquer une notification comme "lue"
        $id = $_POST['id'] ?? null;
        if (!$id || !is_numeric($id)) {
            echo json_encode(['success' => false, 'message' => 'ID invalide']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE notifications SET lue = 1 WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Notification marquée comme lue']);
        exit;
    }

    if ($action === 'set_statut') {
        // Changer le statut : approuvé ou refusé
        $id = $_POST['id'] ?? null;
        $statut = $_POST['statut'] ?? null;

        if (!$id || !is_numeric($id) || !in_array($statut, ['approuvé', 'refusé'])) {
            echo json_encode(['success' => false, 'message' => 'Paramètres invalides']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE notifications SET statut = ?, lue = 1 WHERE id = ?");
        $stmt->execute([$statut, $id]);

        echo json_encode(['success' => true, 'message' => "Notification $statut avec succès"]);
        exit;
    }

    // Si action inconnue
    echo json_encode(['success' => false, 'message' => 'Action inconnue']);
    exit;

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur base de données', 'error' => $e->getMessage()]);
    exit;
}
