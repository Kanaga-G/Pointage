<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Scan de Badge - Xpert Pro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="scan.css">
</head>
<body>
    <div class="scan-container">
        <div class="scan-header">
            <h2><i class="fas fa-qrcode me-2"></i> Scan de Badge</h2>
            <p class="mb-0">Positionnez votre badge devant la caméra</p>
        </div>
        
        <div class="p-4">
            <div class="text-center position-relative">
                <video id="qr-video" class="pulse"></video>
                <div id="scan-status" class="scan-status waiting mt-3">
                    <i class="fas fa-search me-2"></i> En attente de détection...
                </div>
                <div id="feedback-message" class="mt-2"></div>
            </div>
            
            <div class="d-flex justify-content-center gap-3 mt-4">
                <button id="restart-scan" class="btn btn-warning">
                    <i class="fas fa-redo me-2"></i> Recommencer
                </button>
                <a href="employe_dashboard.php" class="btn btn-secondary">
                    <i class="fas fa-home me-2"></i> Tableau de bord
                </a>
            </div>
        </div>
        
        <div class="p-4 bg-light">
            <style>
                .event-card-list {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    padding: 12px 0 12px 0;
                    margin-bottom: 0;
                    max-height: 260px;
                    overflow-y: auto;
                }
                .event-card-list .list-group-item {
                    border: none;
                    border-radius: 8px;
                    margin-bottom: 4px;
                    background: #f8f9fa;
                    font-size: 0.97rem;
                    word-break: break-word;
                }
                .event-card-list .list-group-item:last-child {
                    margin-bottom: 0;
                }
                .event-card.card, .history-card.card {
                    border-radius: 16px;
                    box-shadow: 0 4px 16px rgba(67,97,238,0.07);
                }
                .event-card .card-header, .history-card .card-header {
                    border-radius: 16px 16px 0 0;
                }
            </style>
            <div class="row g-4 align-items-stretch">
                <div class="col-12 h-100 d-flex flex-column">
                    <div class="history-card card h-100 flex-grow-1">
                        <div class="card-header bg-warning text-dark">
                            <h4><i class="fas fa-clock me-2"></i> Scans du Jour</h4>
                        </div>
                        <div class="card-body p-0">
                            <table class="table table-striped table-hover mb-0" style="background:#fff;">
                                <thead class="table-light">
                                    <tr>
                                        <th>Prénom</th>
                                        <th>Nom</th>
                                        <th>Date</th>
                                        <th>Heure de pointage</th>
                                        <th>Justification de retard</th>
                                    </tr>
                                </thead>
                                <tbody id="historique"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Justification de Retard -->
<!-- Modal de justification de retard -->
<div class="modal fade" id="modalJustifRetard" tabindex="-1" aria-labelledby="modalJustifRetardLabel" aria-hidden="true">
  <div class="modal-dialog">
    <form id="formJustifRetard" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalJustifRetardLabel">Justifier un retard</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="justifEmployeId" name="employe_id">
        <input type="hidden" id="justifDate" name="date">
        <input type="hidden" name="type" value="retard">
        <input type="hidden" name="est_justifie" value="1">
        <div class="mb-3">
          <label for="justifComment" class="form-label">Commentaire (optionnel)</label>
          <textarea class="form-control" id="justifComment" name="commentaire" rows="3"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="submit" class="btn btn-primary">Envoyer</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal Justification de Départ Anticipé -->
<div class="modal fade" id="modalJustifDepartAnticipe" tabindex="-1" aria-labelledby="modalJustifDepartAnticipeLabel" aria-hidden="true">
  <div class="modal-dialog">
    <form id="formJustifDepartAnticipe" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalJustifDepartAnticipeLabel">Justifier un départ anticipé</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="departEmployeId" name="employe_id">
        <input type="hidden" id="departDate" name="date">
        <input type="hidden" name="type" value="depart_anticipé">
        <input type="hidden" name="est_justifie" value="1">
        <div class="mb-3">
          <label for="departComment" class="form-label">Commentaire (optionnel)</label>
          <textarea class="form-control" id="departComment" name="commentaire" rows="3"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="submit" class="btn btn-primary">Envoyer</button>
      </div>
    </form>
  </div>
</div>

    <!-- Place ici ton script JS séparé (versionné pour forcer le cache) -->
    <script type="module" src="scan.js?v=20250701"></script>
    <script>
document.addEventListener('DOMContentLoaded', function() {
    const formJustifRetard = document.getElementById('formJustifRetard');

    formJustifRetard.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(formJustifRetard);
        fetch('traiter_justification.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Justification soumise pour approbation.');
                formJustifRetard.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalJustifRetard'));
                modal.hide();
            } else {
                alert('Erreur lors de l\'envoi de la justification.');
            }
        })
        .catch(() => alert('Erreur de connexion.'));
    });

    const formJustifDepartAnticipe = document.getElementById('formJustifDepartAnticipe');

    formJustifDepartAnticipe.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(formJustifDepartAnticipe);
        fetch('traiter_justification.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Justification de départ anticipé envoyée avec succès.');
                formJustifDepartAnticipe.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalJustifDepartAnticipe'));
                modal.hide();
            } else {
                alert('Erreur lors de l\'envoi de la justification de départ anticipé.');
            }
        })
        .catch(() => alert('Erreur de connexion.'));
    });

    const userRole = '<?= $_SESSION['role'] ?? '' ?>'; // Assurez-vous que le rôle de l'utilisateur est défini dans la session

    if (userRole !== 'admin') {
        const markInformed = document.getElementById('markInformed');
        const markUninformed = document.getElementById('markUninformed');
        if (markInformed) markInformed.style.display = 'none';
        if (markUninformed) markUninformed.style.display = 'none';
    }
});
</script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>