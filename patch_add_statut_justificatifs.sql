-- Patch SQL pour ajouter la colonne 'statut' à la table justificatifs
ALTER TABLE justificatifs ADD COLUMN statut VARCHAR(32) NOT NULL DEFAULT 'en_attente';
