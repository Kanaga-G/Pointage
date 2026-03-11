(() => {
  // Références aux éléments du DOM
  const video = document.getElementById('qr-video');
  const feedback = document.getElementById('feedback-message');
  const historique = document.getElementById('historique');
  const journal = document.getElementById('journal');

  if (!video || !feedback || !historique || !journal) {
    return;
  }

  // Use global QrScanner (provided by qr-scanner.umd.min.js)
  const QrScanner = window.QrScanner;
  if (!QrScanner) {
    console.warn('QrScanner global not found. Ensure /assets/js/qr-scanner.umd.min.js is loaded before script.js');
    return;
  }

  // Initialisation du scanner avec détection du QR code
  const scanner = new QrScanner(video, result => {
    // Récupère le texte (compatible ancienne et nouvelle version)
    const qrText = result.data ?? result;

    // Affiche dans le feedback
    feedback.textContent = `📷 QR détecté : ${qrText}`;
    feedback.classList.add('text-success', 'message-feedback');

    // Ajoute une ligne au journal de l'historique
    historique.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${new Date().toLocaleTimeString()}
            <span class="badge bg-success">${qrText}</span>
        </li>`;

    // Arrête le scanner temporairement
    scanner.stop();

    // Envoie le QR code au backend pour traitement (validate_badge.php)
    fetch('validate_badge.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ badge_token: qrText })
    })    
        .then(res => res.json())
        .then(data => {
            feedback.textContent = data.message;
            feedback.className = `message-feedback ${data.status === 'success' ? 'text-success' : 'text-danger'}`;

            journal.innerHTML += `
                <li class="list-group-item ${data.status === 'success' ? 'text-success' : 'text-danger'}">
                    ${new Date().toLocaleTimeString()} - ${data.message}
                </li>`;
        })
        .catch(err => {
            feedback.textContent = "⛔ Erreur lors du pointage.";
            feedback.className = 'message-feedback text-danger';
            journal.innerHTML += `<li class="list-group-item text-danger">Erreur : ${err}</li>`;
        });

  }, {
    highlightScanRegion: true,
    highlightCodeOutline: true
  });

  // Démarre le scanner (attention à HTTPS !)
  scanner.start();

  /**
   * Permet de simuler un pointage manuel
   * @param {string} type - "arrivee" ou "depart"
   */
  function envoyerPointage(type) {
    if (!['arrivee', 'depart'].includes(type)) {
        afficherNotification("⛔ Type de pointage invalide.", 'error');
        return;
    }

    fetch('pointage.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `type=${encodeURIComponent(type)}`
    })
    .then(response => response.json())
    .then(data => {
        afficherNotification(data.message, data.status === 'success' ? 'success' : 'error');
    })
    .catch(error => {
        console.error("Erreur:", error);
        afficherNotification("⛔ Une erreur est survenue. Veuillez réessayer.", 'error');
    });
  }

  /**
   * Affiche une notification visuelle temporaire
   */
  function afficherNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
  }

  // Initialisation des tooltips (si bootstrap est présent)
  if (window.bootstrap?.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (element) {
      return new window.bootstrap.Tooltip(element);
    });
  }

  // Timer / expiration (uniquement si les variables attendues existent)
  const timerElement = document.getElementById('badgeTimer');
  const expirationTimestamp = Number(document.body?.dataset?.badgeExpiryTs || NaN);
  if (timerElement && Number.isFinite(expirationTimestamp)) {
    let timerInterval = null;
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expirationTimestamp - now;

      if (diff <= 0) {
        timerElement.innerText = "⛔ Badge expiré";
        timerElement.classList.remove("text-success");
        timerElement.classList.add("text-danger");
        if (timerInterval) clearInterval(timerInterval);
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      timerElement.innerText = `Temps restant : ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (diff < 3600) {
        timerElement.classList.remove("text-success");
        timerElement.classList.add("text-warning");
      }
    }

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
    window.__badgeTimerInterval = timerInterval;

    // Vérification périodique de l'expiration
    const checkBadgeExpiry = () => {
      const expiryElement = document.querySelector('.badge-expiry');
      if (expiryElement) {
        const expiryText = expiryElement.innerText;
        if (expiryText.includes("Badge actif") && expirationTimestamp <= Math.floor(Date.now() / 1000)) {
          showToast('Badge Expire', 'Votre badge d\'accès a expiré. Veuillez le renouveler.', 'danger');
          expiryElement.innerText = "Badge expiré";
          expiryElement.classList.remove("text-success");
          expiryElement.classList.add("text-danger");
          if (timerInterval) clearInterval(timerInterval);
        }
      }
    }

    setInterval(checkBadgeExpiry, 60000); // Vérifier toutes les minutes
  }

  // Fonction pour afficher les notifications
  function showToast(title, message, type) {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong><br>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    const alertsContainer = document.getElementById('alertsContainer') || document.body;
    alertsContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

})();