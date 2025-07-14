
import QrScanner from './js/qr-scanner.min.js';

const video = document.getElementById('qr-video');
const feedback = document.getElementById('feedback-message');
const historique = document.getElementById('historique');
const journal = document.getElementById('journal');
const scanStatus = document.getElementById('scan-status');
const restartBtn = document.getElementById('restart-scan');

// API endpoint
const api = {
    scan: 'pointage.php'
};

let lastScan = '';
let scanner = null;
let isProcessing = false;

// Centraliser l'affichage des notifications
function afficherNotification(message, type = 'info') {
    feedback.textContent = message;
    feedback.className = `message-feedback text-${type}`;
}


// Afficher un pointage dans l'historique (prénom, nom, date, heure arrivée, heure départ, justification de retard)
function addHistoriqueItem({prenom, nom, date_pointage, heure_arrivee, heure_depart, justification_retard}) {
    // Fallback : on ne fait rien si historique n'existe pas
    if (!historique) return;
    // Construction manuelle des cellules pour éviter innerHTML
    const tr = document.createElement('tr');
    const tdPrenom = document.createElement('td');
    tdPrenom.textContent = prenom || '';
    const tdNom = document.createElement('td');
    tdNom.textContent = nom || '';
    const tdDate = document.createElement('td');
    tdDate.textContent = date_pointage || '';
    const tdHeure = document.createElement('td');
    tdHeure.innerHTML = (heure_arrivee ? `<span class='text-success'>${heure_arrivee}</span>` : '<span class="text-muted">-</span>') +
        (heure_depart ? `<br><span class='text-danger'>${heure_depart}</span>` : '');
    const tdJustif = document.createElement('td');
    if (justification_retard) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning text-dark';
        badge.textContent = justification_retard;
        tdJustif.appendChild(badge);
    } else {
        tdJustif.innerHTML = '<span class="text-muted">-</span>';
    }
    tr.appendChild(tdPrenom);
    tr.appendChild(tdNom);
    tr.appendChild(tdDate);
    tr.appendChild(tdHeure);
    tr.appendChild(tdJustif);
    historique.appendChild(tr);
}

// Charger l'historique réel depuis le backend
async function chargerHistorique() {
    if (!historique) return;
    try {
        const res = await fetch('get_pointage_history.php');
        const data = await res.json();
        historique.innerHTML = '';
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            data.data.forEach(addHistoriqueItem);
        } else {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.className = 'text-muted text-center';
            td.textContent = 'Aucun pointage récent.';
            tr.appendChild(td);
            historique.appendChild(tr);
        }
    } catch (e) {
        if (historique) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.className = 'text-danger text-center';
            td.textContent = "Erreur lors du chargement de l'historique.";
            tr.appendChild(td);
            historique.appendChild(tr);
        }
    }
}



// Ajouter un événement au journal (dynamique)
function addJournalItem({datetime, type, message}) {
    if (!journal) return;
    const li = document.createElement('li');
    let color = 'secondary';
    if (type === 'POINTAGE') color = 'success';
    if (type === 'ERREUR') color = 'danger';
    li.className = `list-group-item d-flex justify-content-between align-items-center text-${color}`;
    li.innerHTML = `<span><strong>${type}</strong> - ${message}</span><span class="small text-muted">${datetime}</span>`;
    journal.appendChild(li);
}

// Ajoute une entrée simple au journal (fallback pour les appels addJournal)
function addJournal(message, type = 'info') {
    if (!journal) return;
    const li = document.createElement('li');
    let color = 'secondary';
    if (type === 'success') color = 'success';
    if (type === 'danger') color = 'danger';
    li.className = `list-group-item d-flex justify-content-between align-items-center text-${color}`;
    const now = new Date();
    const datetime = now.toLocaleString('fr-FR');
    li.innerHTML = `<span><strong>${type.toUpperCase()}</strong> - ${message}</span><span class="small text-muted">${datetime}</span>`;
    journal.appendChild(li);
}

// Charger le journal des événements depuis le backend et nettoyage serveur
async function chargerJournal() {
    try {
        // Supprimer tout bouton trash existant avant d'en ajouter un nouveau
        const oldBtn = document.getElementById('clear-journal-btn');
        if (oldBtn && oldBtn.parentNode) oldBtn.parentNode.removeChild(oldBtn);

        const res = await fetch('get_pointage_journal.php');
        // Gestion d'une éventuelle réponse HTML (erreur PHP)
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            const li = document.createElement('li');
            li.className = 'list-group-item text-danger';
            li.textContent = "Erreur serveur : réponse non JSON. Vérifiez les erreurs PHP côté serveur.";
            journal.innerHTML = '';
            journal.appendChild(li);
            return;
        }
        journal.innerHTML = '';
        // Placer le bouton trash à droite du titre
        let cardHeader = journal?.closest('.card')?.querySelector('.card-header');
        if (cardHeader && !document.getElementById('clear-journal-btn')) {
            let trashBtn = document.createElement('button');
            trashBtn.id = 'clear-journal-btn';
            trashBtn.className = 'btn btn-sm btn-danger float-end';
            trashBtn.innerHTML = '<i class="fas fa-trash"></i>';
            trashBtn.title = 'Vider tout le journal des événements';
            trashBtn.onclick = async () => {
                if (confirm('Confirmer la suppression de tout le journal des événements ?')) {
                    try {
                        const res = await fetch('clear_pointage_journal.php', { method: 'POST' });
                        const result = await res.json();
                        if (result.success) {
                            addJournal('Journal vidé avec succès.', 'success');
                            chargerJournal();
                        } else {
                            addJournal(result.message || 'Erreur lors du nettoyage.', 'danger');
                        }
                    } catch (e) {
                        addJournal('Erreur réseau lors du nettoyage.', 'danger');
                    }
                }
            };
            cardHeader.appendChild(trashBtn);
        }
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            data.data.forEach(addJournalItem);
        } else {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'Aucun événement récent.';
            journal.appendChild(li);
        }
    } catch (e) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-danger';
        li.textContent = "Erreur lors du chargement du journal.";
        journal.innerHTML = '';
        journal.appendChild(li);
    }
}

// Traiter le scan
async function handleScan(token) {
    if (isProcessing || token === lastScan) return;
    isProcessing = true;
    lastScan = token;
    // Afficher le token scanné pour debug
    if (scanStatus) {
        scanStatus.innerHTML = `<span class='text-info'>Token scanné :</span><br><code style='font-size:0.9em;'>${token}</code><br><i class="fas fa-spinner fa-spin me-2"></i> Vérification...`;
    }

    try {
        // Toujours envoyer en JSON
        const res = await fetch(api.scan, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ badge_token: token })
        });
        const data = await res.json();

        if (data.status === 'success') {
            afficherNotification(data.message, 'success');
            addJournal(data.message, 'success');
            // Si retard, afficher le modal
            if (data.retard === true || data.retard === 1) {
                showJustifModal(data);
            }
        } else {
            afficherNotification(data.message || "Échec validation.", 'danger');
            addJournal(data.message || "Échec validation.", 'danger');
        }

    } catch (error) {
        afficherNotification("⛔ Erreur de réseau : " + error.message, 'danger');
        addJournal("Erreur réseau : " + error.message, 'danger');
    } finally {
        isProcessing = false;
        scanStatus.innerHTML = '<i class="fas fa-search me-2"></i> En attente de détection...';
        setTimeout(() => {
            lastScan = '';
            scanner.start();
        }, 2000);
    }
}

// Initialiser le scanner
function initScanner() {
    scanner = new QrScanner(
        video,
        result => {
            const qrText = result.data ?? result;
            handleScan(qrText);
        },
        {
            highlightScanRegion: true,
            maxScansPerSecond: 2
        }
    );
    scanner.start();
}

// Bouton de redémarrage
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        if (scanner) {
            lastScan = '';
            scanner.start();
            afficherNotification("Redémarrage du scanner", 'info');
        }
    });
}

// Affichage du modal de justification de retard
function showJustifModal(data) {
    const modal = new bootstrap.Modal(document.getElementById('modalJustifRetard'));
    document.getElementById('justifEmployeId').value = data.employe_id || '';
    document.getElementById('justifDate').value = (data.timestamp || '').split(' ')[0];
    document.getElementById('justifComment').value = '';
    // On stocke la date et l'employé pour rafraîchir l'historique après justification
    modal._justifContext = {
        employe_id: data.employe_id,
        date_pointage: (data.timestamp || '').split(' ')[0]
    };
    modal.show();
}

// Gestion de l'envoi du formulaire de justification
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formJustifRetard');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const employe_id = document.getElementById('justifEmployeId').value;
            const date = document.getElementById('justifDate').value;
            const comment = document.getElementById('justifComment').value;
            try {
                const res = await fetch('justifier_pointage.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        employe_id,
                        date,
                        type: 'retard',
                        est_justifie: 1,
                        commentaire: comment
                    })
                });
                if (res.ok) {
                    afficherNotification('Justification envoyée.', 'success');
                    // Confirmation visuelle supplémentaire
                    const confirmation = document.createElement('div');
                    confirmation.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow';
                    confirmation.style.zIndex = 2000;
                    confirmation.innerHTML = '<i class="fas fa-check-circle me-2"></i> Justification enregistrée avec succès !';
                    document.body.appendChild(confirmation);
                    setTimeout(() => confirmation.remove(), 2500);
                    // Fermer le modal
                    const modalEl = document.getElementById('modalJustifRetard');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    modal.hide();
                    // Rafraîchir l'historique pour afficher la justification
                    if (typeof chargerHistorique === 'function') {
                        setTimeout(() => chargerHistorique(), 500);
                    }
                } else {
                    afficherNotification('Erreur lors de la justification.', 'danger');
                }
            } catch (err) {
                afficherNotification('Erreur réseau.', 'danger');
            }
        });
    }
});


// Lancer le scanner et charger l'historique + journal uniquement si la page contient le tableau d'historique
window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('historique')) {
        setTimeout(() => {
            initScanner();
            chargerHistorique();
            chargerJournal();
        }, 0);
    }
});