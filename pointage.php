<?php
require_once 'db.php';
require_once 'BadgeManager.php';

date_default_timezone_set('Europe/Paris');

class PointageSystem {
    private PDO $pdo;
    private $logger;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
        $this->logger = new PointageLogger();
    }

    public function handlePointageRequest(array $requestData): array {
        try {
            // Validation stricte de l'entrée
            if (empty($requestData['badge_token'])) {
                throw new InvalidArgumentException("Token manquant pour le pointage");
            }
            // Géolocalisation facultative : si présente, on la prend, sinon NULL
            $latitude = isset($requestData['latitude']) ? (float)$requestData['latitude'] : null;
            $longitude = isset($requestData['longitude']) ? (float)$requestData['longitude'] : null;

            // Si fournie, on vérifie qu'elle n'est pas 0/0 (optionnel)
            if ($latitude !== null && $longitude !== null && $latitude === 0.0 && $longitude === 0.0) {
                throw new InvalidArgumentException("Coordonnées GPS invalides (0,0)");
            }

            // DEBUG : log du token reçu (brut et encodé)
            $logDebug = __DIR__ . '/logs/pointage_debug.log';
            file_put_contents($logDebug, "[".date('Y-m-d H:i:s')."] TOKEN recu : [".$requestData['badge_token']."]\n", FILE_APPEND);
            file_put_contents($logDebug, "Lat: ".($latitude ?? 'NULL').", Lng: ".($longitude ?? 'NULL')."\n", FILE_APPEND);

            // Vérification du token et extraction des infos employé
            $tokenData = BadgeManager::verifyToken($requestData['badge_token'], $this->pdo);
            if (!$tokenData) {
                throw new RuntimeException("Token invalide ou expiré");
            }

            // Enregistrement du pointage
            return $this->traiterPointage($tokenData, $latitude, $longitude);
        } catch (Exception $e) {
            $this->logger->logError($e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }

    private function traiterPointage(array $tokenData, $latitude, $longitude): array {
        $employeId = (int)$tokenData['employe_id'];
        $badgeTokenId = (int)$tokenData['badge_token_id'];
        $dateCourante = date('Y-m-d');

        $this->pdo->beginTransaction();

        try {
            // Récupérer le dernier pointage du jour
            $lastPointage = $this->getLastPointage($employeId, $dateCourante);

            // Déterminer le type de pointage attendu
            $type = $this->determinerTypePointage($lastPointage);

            // Traiter le pointage
            if ($type === 'arrivee') {
                $response = $this->handleArrival($employeId, $badgeTokenId, $latitude, $longitude);
            } else {
                $response = $this->handleDeparture($employeId, $badgeTokenId, $lastPointage, $latitude, $longitude);
            }

            $this->pdo->commit();

            // Log du pointage
            $this->logger->logPointage(
                $employeId, 
                $type, 
                $response['timestamp'], 
                $tokenData['token']
            );

            return $response;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            $this->logger->logError("Erreur traitement: " . $e->getMessage());
            throw $e;
        }
    }

    private function getLastPointage(int $employeId, string $date): ?array {
        $stmt = $this->pdo->prepare("
            SELECT * FROM pointages
            WHERE employe_id = ? 
            AND DATE(date_heure) = ?
            ORDER BY date_heure DESC
            LIMIT 1
        ");
        $stmt->execute([$employeId, $date]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function determinerTypePointage(?array $lastPointage): string {
        if (!$lastPointage) {
            return 'arrivee';
        }
        return ($lastPointage['type'] === 'depart') ? 'arrivee' : 'depart';
    }

    private function handleArrival(int $employeId, int $badgeTokenId, $latitude, $longitude): array {
        $now = date('Y-m-d H:i:s');
        $jourSemaine = date('N'); // 1 (lundi) à 7 (dimanche)
        $heureLimite = ($jourSemaine == 6) ? '14:00:00' : '09:00:00';
        $heureLimiteComplete = date('Y-m-d') . ' ' . $heureLimite;
        $isLate = strtotime($now) > strtotime($heureLimiteComplete);
        
        // Vérification stricte : le badge doit appartenir à l'employé et être actif
        $check = $this->pdo->prepare("SELECT id, employe_id FROM badge_tokens WHERE id = ? AND status = 'active' AND expires_at > ?");
        $check->execute([$badgeTokenId, $now]);
        $row = $check->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] ERREUR badge_token_id non valide ARRIVEE: $badgeTokenId pour employe $employeId\n", FILE_APPEND);
            throw new RuntimeException("Le badge utilisé n'est plus valide ou n'existe pas.");
        }
        if ((int)$row['employe_id'] !== $employeId) {
            file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] ERREUR badge_token_id utilisé par un autre employé ARRIVEE: $badgeTokenId pour employe $employeId\n", FILE_APPEND);
            throw new RuntimeException("Ce badge n'est pas le vôtre.");
        }

        // Création automatique d'une justification si retard
        $justificationId = null;
        $etat = 'normal';
        if ($isLate) {
            $etat = 'justifie';
            // On crée d'abord le pointage pour obtenir son id
            $stmt = $this->pdo->prepare("
                INSERT INTO pointages (
                    employe_id, type, badge_token_id, ip_address, device_info, latitude, longitude, etat
                ) VALUES (?, 'arrivee', ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $employeId,
                $badgeTokenId,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $latitude,
                $longitude,
                $etat
            ]);
            $idPointage = $this->pdo->lastInsertId();
            $stmtJustif = $this->pdo->prepare("INSERT INTO justificatifs (id_pointage, type_justif, description, date_ajout, statut) VALUES (?, 'retard', 'Arrivée après $heureLimite', ?, 'en_attente')");
            $stmtJustif->execute([$idPointage, $now]);
            $justificationId = $this->pdo->lastInsertId();
            // Mise à jour du pointage pour lier la justification
            $stmtUpdate = $this->pdo->prepare("UPDATE pointages SET justification_id = ? WHERE id = ?");
            $stmtUpdate->execute([$justificationId, $idPointage]);
            file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] INSERT ARRIVEE+JUSTIF OK pour employe $employeId, badge $badgeTokenId\n", FILE_APPEND);
            return [
                'status' => 'success',
                'type' => 'arrivee',
                'message' => 'Arrivée enregistrée (retard justifié)',
                'retard' => $isLate,
                'timestamp' => $now,
            ];
        }

        // Cas normal (pas de retard)
        $stmt = $this->pdo->prepare("
            INSERT INTO pointages (
                employe_id, type, badge_token_id, ip_address, device_info, latitude, longitude, etat
            ) VALUES (?, 'arrivee', ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $employeId,
            $badgeTokenId,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $latitude,
            $longitude,
            $etat
        ]);
        file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] INSERT ARRIVEE OK pour employe $employeId, badge $badgeTokenId\n", FILE_APPEND);

        return [
            'status' => 'success',
            'type' => 'arrivee',
            'message' => 'Arrivée enregistrée',
            'retard' => $isLate,
            'timestamp' => $now,
        ];
    }

    private function handleDeparture(int $employeId, int $badgeTokenId, array $lastPointage, $latitude, $longitude): array {
        $now = date('Y-m-d H:i:s');
        $heureLimiteDepart = '18:00:00';
        $heureLimiteCompleteDepart = date('Y-m-d') . ' ' . $heureLimiteDepart;
        $isEarlyDeparture = strtotime($now) < strtotime($heureLimiteCompleteDepart);

        if ($lastPointage['type'] !== 'arrivee') {
            throw new LogicException("Incohérence: Dernier pointage n'est pas une arrivée");
        }

        // Vérification stricte : le badge doit appartenir à l'employé et être actif
        $check = $this->pdo->prepare("SELECT id, employe_id FROM badge_tokens WHERE id = ? AND status = 'active' AND expires_at > ?");
        $check->execute([$badgeTokenId, $now]);
        $row = $check->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] ERREUR badge_token_id non valide DEPART: $badgeTokenId pour employe $employeId\n", FILE_APPEND);
            throw new RuntimeException("Le badge utilisé n'est plus valide ou n'existe pas.");
        }
        if ((int)$row['employe_id'] !== $employeId) {
            file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] ERREUR badge_token_id utilisé par un autre employé DEPART: $badgeTokenId pour employe $employeId\n", FILE_APPEND);
            throw new RuntimeException("Ce badge n'est pas le vôtre.");
        }

        // Création automatique d'une justification si départ anticipé
        if ($isEarlyDeparture) {
            $stmtJustif = $this->pdo->prepare("INSERT INTO justificatifs (id_pointage, type_justif, description, date_ajout, statut) VALUES (?, 'depart_anticipé', 'Départ avant $heureLimiteDepart', ?, 'en_attente')");
            $stmtJustif->execute([$lastPointage['id'], $now]);
            file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] INSERT DEPART+JUSTIF OK pour employe $employeId, badge $badgeTokenId\n", FILE_APPEND);
        }

        // Enregistrement du départ
        $stmt = $this->pdo->prepare("
            INSERT INTO pointages (
                employe_id, type, badge_token_id, ip_address, device_info, latitude, longitude, etat
            ) VALUES (?, 'depart', ?, ?, ?, ?, ?, 'normal')
        ");
        $stmt->execute([
            $employeId,
            $badgeTokenId,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $latitude,
            $longitude
        ]);
        file_put_contents(__DIR__ . '/logs/pointage_debug.log', "[".date('Y-m-d H:i:s')."] INSERT DEPART OK pour employe $employeId, badge $badgeTokenId\n", FILE_APPEND);

        return [
            'status' => 'success',
            'type' => 'depart',
            'message' => 'Départ enregistré',
            'timestamp' => $now,
        ];
    }

    private function calculerTempsTravail(string $debut, string $fin): array {
        $debutDt = new DateTime($debut);
        $finDt = new DateTime($fin);

        if ($finDt < $debutDt) {
            throw new InvalidArgumentException("Heure de fin antérieure au début");
        }

        $interval = $debutDt->diff($finDt);
        $totalSeconds = ($interval->h * 3600) + ($interval->i * 60) + $interval->s;
        // Pause d'1h si > 4h de travail effectif (cf. logique vue en SQL)
        $pauseSeconds = ($totalSeconds > 4 * 3600) ? 3600 : 0;
        $workSeconds = max(0, $totalSeconds - $pauseSeconds);

        return [
            'temps_travail' => gmdate('H:i:s', $workSeconds),
            'temps_pause' => gmdate('H:i:s', $pauseSeconds)
        ];
    }
}

class PointageLogger {
    private $logFile;

    public function __construct() {
        $dir = __DIR__ . '/logs/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $this->logFile = $dir . 'pointage_system.log';
    }

    public function logPointage(int $employeId, string $type, string $timestamp, string $tokenHash) {
        $entry = sprintf(
            "[%s] POINTAGE - Employé: %d | Type: %s | Token: %s | IP: %s\n",
            date('Y-m-d H:i:s'),
            $employeId,
            strtoupper($type),
            substr($tokenHash, 0, 12) . '...',
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        );
        file_put_contents($this->logFile, $entry, FILE_APPEND);
    }

    public function logError(string $message) {
        $entry = sprintf(
            "[%s] ERREUR - %s | Trace: %s\n",
            date('Y-m-d H:i:s'),
            $message,
            json_encode(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3))
        );
        file_put_contents($this->logFile, $entry, FILE_APPEND);
    }
}

// API entry point
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    try {
        $system = new PointageSystem($pdo);
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $response = $system->handlePointageRequest($data);
        // Toujours forcer un JSON valide
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    } catch (Throwable $e) {
        // En cas d'erreur fatale, forcer un JSON propre
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Erreur système: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}