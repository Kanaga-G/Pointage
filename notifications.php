<?php
session_start();
require_once 'db.php';

// Vérification authentification
if (!isset($_SESSION['employe_id']) && !isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}
$is_super_admin = ($_SESSION['role'] === 'super_admin');
$message = "";
$employe_id = $_SESSION['employe_id'] ?? 0; // Initialisation de $employe_id

// Nouvelle récupération des notifications : non lues d'abord, puis par date
try {
    $stmt = $pdo->prepare("SELECT n.id, n.titre, n.contenu, n.type, n.lue, n.date, n.date_creation, n.lien, p.type AS pointage_type, p.date_heure 
                          FROM notifications n 
                          LEFT JOIN pointages p ON n.pointage_id = p.id 
                          WHERE n.employe_id = ? 
                          ORDER BY n.lue ASC, n.date DESC, n.date_creation DESC LIMIT 20");
    $stmt->execute([$employe_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Erreur de base de données: " . $e->getMessage());
    $notifications = [];
}

// Compte des notifications non lues
function countUnreadNotifications($employe_id) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE employe_id = ? AND lue = 0");
    $stmt->execute([$employe_id]);
    return $stmt->fetchColumn();
}
$unreadNotificationCount = countUnreadNotifications($employe_id);

// Fonction utilitaire pour l'icône selon le type
function getNotificationIcon($type) {
    switch ($type) {
        case 'retard':
            return '<i class="fas fa-clock text-warning"></i>';
        case 'pointage_manqué':
            return '<i class="fas fa-user-times text-danger"></i>';
        case 'info':
            return '<i class="fas fa-info-circle text-primary"></i>';
        default:
            return '<i class="fas fa-bell"></i>';
    }
}

function formatDate($date) {
    return date('d/m/Y H:i', strtotime($date));
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifications - Gestion RH</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/notifications.css">
</head>
<body>
    <div class="notification-container">
        <div class="notification-header d-flex justify-content-between align-items-center">
            <h2><i class="fas fa-bell me-2"></i> Mes Notifications</h2>
            <span class="badge bg-danger rounded-pill"><?= $unreadNotificationCount ?></span>
        </div>
        <ul class="list-group mb-3">
            <?php if (count($notifications) > 0): ?>
                <?php foreach ($notifications as $notification): ?>
                    <li class="list-group-item d-flex align-items-center <?= $notification['lue'] ? 'read' : 'unread' ?>" data-id="<?= $notification['id'] ?>">
                        <span class="me-2"><?= getNotificationIcon($notification['type']) ?></span>
                        <div class="flex-grow-1">
                            <div><strong><?= htmlspecialchars($notification['titre']) ?></strong></div>
                            <div class="small text-muted"><?= htmlspecialchars($notification['contenu']) ?></div>
                            <div class="notification-time small text-secondary"><?= formatDate($notification['date'] ?? $notification['date_creation']) ?></div>
                        </div>
                        <?php if (!$notification['lue']): ?>
                            <span class="badge bg-danger ms-2">Non lu</span>
                        <?php endif; ?>
                    </li>
                <?php endforeach; ?>
            <?php else: ?>
                <li class="list-group-item text-center text-muted">Aucune notification</li>
            <?php endif; ?>
        </ul>
        <a href="notifications.php" class="btn btn-link">Voir toutes les notifications</a>
    </div>
    <script>
    // Marquer comme lu via AJAX
    document.querySelectorAll('.list-group-item.unread').forEach(item => {
        item.addEventListener('click', function() {
            const notificationId = this.getAttribute('data-id');
            fetch('mark_notification_read.php?id=' + notificationId)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.classList.remove('unread');
                        this.classList.add('read');
                        this.querySelector('.badge.bg-danger').remove();
                        // Optionnel : rafraîchir le badge global
                        location.reload();
                    }
                });
        });
    });
    </script>
</body>
</html>