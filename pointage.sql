-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 03 juil. 2025 à 17:10
-- Version du serveur : 9.1.0
-- Version de PHP : 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+02:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pointage`
--

-- --------------------------------------------------------

--
-- Structure de la table `absences`
--

DROP TABLE IF EXISTS `absences`;
CREATE TABLE IF NOT EXISTS `absences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_employe` int DEFAULT NULL,
  `date_absence` date DEFAULT NULL,
  `motif` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `statut` enum('autorisé','non autorisé') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'non autorisé',
  PRIMARY KEY (`id`),
  KEY `id_employe` (`id_employe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `admins`
--

DROP TABLE IF EXISTS `admins`;
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `adresse` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','super_admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'admin',
  `last_activity` timestamp NULL DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `poste` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departement` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admins`
--

INSERT INTO `admins` (`id`, `nom`, `prenom`, `adresse`, `email`, `telephone`, `password`, `role`, `last_activity`, `date_creation`, `poste`, `departement`) VALUES
(1, 'Ouologuem', 'Moussa Hubert', '', 'ouologuemoussa@gmail.com', NULL, '$2y$10$nZF2zaidonFwCfp8Z53d4eSf5MCwD7C8ci4bmwYn9bTlTRVWU6cYS', 'super_admin', NULL, '2025-05-20 14:14:02', NULL, NULL),
(2, 'Tirera', 'Cheik Oumar', 'Faladje Sema', 'manager.xpert@gmail.com', '78909876', '$2y$10$Y7VNkYEpZt8QjCWV5M9Ls.32LpM9IR5UgTcCKb/f7L/xQ6R4emIXW', 'admin', NULL, '2025-05-20 16:01:33', 'Manager', 'administration');

-- --------------------------------------------------------

--
-- Structure de la table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `details` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `details`, `created_at`) VALUES
(1, 1, 'demande_rejete', 'Demande ID: 1', '2025-07-01 14:41:58');

-- --------------------------------------------------------

--
-- Structure de la table `badge_journalier`
--

DROP TABLE IF EXISTS `badge_journalier`;
CREATE TABLE IF NOT EXISTS `badge_journalier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `code_badge` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date_validite` date NOT NULL,
  `utilise_arrivee` tinyint(1) DEFAULT '0',
  `utilise_depart` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `employe_id` (`employe_id`,`date_validite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `badge_logs`
--

DROP TABLE IF EXISTS `badge_logs`;
CREATE TABLE IF NOT EXISTS `badge_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `badge_logs`
--

INSERT INTO `badge_logs` (`id`, `employe_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 2, 'generation', 'Nouveau badge généré', '::1', '2025-06-26 10:28:04'),
(2, 2, 'invalidation', 'Badge invalidé après pointage de départ', NULL, '2025-07-01 13:10:20'),
(3, 2, 'invalidation', 'Badge invalidé après pointage de départ', NULL, '2025-07-01 14:28:54'),
(4, 15, 'invalidation', 'Badge invalidé après pointage de départ', NULL, '2025-07-03 16:24:53'),
(5, 2, 'invalidation', 'Badge invalidé après pointage de départ', NULL, '2025-07-03 16:40:33'),
(6, 15, 'invalidation', 'Badge invalidé après pointage de départ', NULL, '2025-07-03 17:06:46');

-- --------------------------------------------------------

--
-- Structure de la table `badge_scans`
--

DROP TABLE IF EXISTS `badge_scans`;
CREATE TABLE IF NOT EXISTS `badge_scans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token_id` int DEFAULT NULL,
  `token_hash` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `scan_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `device_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `is_valid` tinyint(1) NOT NULL,
  `validation_details` json DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `scan_type` enum('arrival','departure','access') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `token_id` (`token_id`),
  KEY `idx_token_scan` (`token_hash`,`scan_time`),
  KEY `idx_scan_time` (`scan_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `badge_tokens`
--

DROP TABLE IF EXISTS `badge_tokens`;
CREATE TABLE IF NOT EXISTS `badge_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `token_hash` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `device_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','revoked','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Type de badge/token',
  `revoked_at` datetime DEFAULT NULL,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'system',
  `last_used_at` datetime DEFAULT NULL,
  `usage_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_employe_status` (`employe_id`,`status`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `badge_tokens`
--

INSERT INTO `badge_tokens` (`id`, `employe_id`, `token`, `token_hash`, `created_at`, `expires_at`, `ip_address`, `user_agent`, `device_info`, `status`, `type`, `revoked_at`, `created_by`, `last_used_at`, `usage_count`) VALUES
(36, 15, '15|31a34e8dd619cc1f8ee1174e1d655c99|1751561845|3|f69d573e12b852cd9fe6fb168a94d4165172bb8e8a40b426225100e017d7e82d', '2af701733315fb1793a21af5eda320138b463bd73d47422ecea92208199161ac', '2025-07-03 16:57:25', '2025-07-03 19:06:46', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'expired', NULL, NULL, '3', NULL, 0),
(37, 15, '15|9a6944fff1abcac559d164e23379e6b9|1751562406|3|38625669a0edcaa5231eaa29c657fabaff2ff0b11eb2781e65456705bbac6310', '', '2025-07-03 19:06:46', '2025-07-03 20:06:46', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'active', NULL, NULL, 'system', NULL, 0),
(38, 2, '2|0687d4a82a51093ec0185b6e0af4ffa7|1751562444|3|4fa4ea6ad87cd24c2a5e20fecfc4ac25fc1f1a15ba5c595bdf6763b106916421', '3f38a7c50d5f5469c625eb2d0e9fe524b999f84676192cb422ec04e061aa6d9b', '2025-07-03 17:07:24', '2025-07-03 20:07:24', '::1', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'active', NULL, NULL, '3', NULL, 0);

-- --------------------------------------------------------

--
-- Structure de la table `conges`
--

DROP TABLE IF EXISTS `conges`;
CREATE TABLE IF NOT EXISTS `conges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `jours_total` int DEFAULT '25',
  `jours_utilises` int DEFAULT '0',
  `jours_restants` int DEFAULT '25',
  `annee` year NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conge` (`employe_id`,`annee`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `conges`
--

INSERT INTO `conges` (`id`, `employe_id`, `jours_total`, `jours_utilises`, `jours_restants`, `annee`) VALUES
(1, 2, 25, 0, 25, '2025');

-- --------------------------------------------------------

--
-- Structure de la table `demandes`
--

DROP TABLE IF EXISTS `demandes`;
CREATE TABLE IF NOT EXISTS `demandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `type` enum('conge','retard','absence','badge') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `raison` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `statut` enum('en_attente','approuve','rejete') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'en_attente',
  `date_demande` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_traitement` datetime DEFAULT NULL,
  `commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `traite_par` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `demandes`
--

INSERT INTO `demandes` (`id`, `employe_id`, `type`, `raison`, `statut`, `date_demande`, `date_traitement`, `commentaire`, `traite_par`) VALUES
(1, 2, 'conge', 'Vacances annuelles', 'rejete', '2023-06-01 09:00:00', '2025-07-01 14:41:58', '', 1);

-- --------------------------------------------------------

--
-- Structure de la table `demandes_badge`
--

DROP TABLE IF EXISTS `demandes_badge`;
CREATE TABLE IF NOT EXISTS `demandes_badge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `raison` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date_demande` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `statut` enum('en_attente','approuve','rejete') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'en_attente',
  `date_traitement` datetime DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `raison_rejet` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `is_read` tinyint(1) DEFAULT '0',
  `traite_par` int DEFAULT NULL COMMENT 'ID de l''admin qui a traité la demande',
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  KEY `admin_id` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `employes`
--

DROP TABLE IF EXISTS `employes`;
CREATE TABLE IF NOT EXISTS `employes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `prenom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `rapport_quotidiens` tinyint(1) DEFAULT '0',
  `adresse` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departement` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `poste` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qr_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `badge_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `badge_actif` tinyint(1) DEFAULT '1',
  `qr_code_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `date_embauche` date DEFAULT NULL,
  `contrat_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrat_duree` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `statut` enum('actif','inactif') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'actif',
  `badge_token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `matricule` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `qr_code` (`qr_code`),
  UNIQUE KEY `badge_id` (`badge_id`),
  UNIQUE KEY `matricule` (`matricule`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `employes`
--

INSERT INTO `employes` (`id`, `nom`, `prenom`, `email`, `telephone`, `rapport_quotidiens`, `adresse`, `departement`, `poste`, `qr_code`, `photo`, `date_creation`, `password`, `badge_id`, `badge_actif`, `qr_code_data`, `date_embauche`, `contrat_type`, `contrat_duree`, `statut`, `badge_token`, `matricule`) VALUES
(2, 'Guindo', 'Mohamadoun', 'xpertproinformatique3@gmail.com', '94148204', 1, 'Nafadji', 'depart_informatique', 'Analyste', 'QR123456', 'uploads/employes/6862a9e73e62f_Capture d’écran 2025-02-13 191448.png', '2025-05-05 10:37:08', '$2y$10$Tb/z6lLLE6CklzUqFk51Au4Z7d1DBvf5HS2v/YTIc5oPkrpQZcfDy', 'BG789012', 1, '{\"type\":\"employee\",\"id\":2,\"department\":\"IT\"}', '2023-01-15', NULL, NULL, 'actif', 'token_2a7b9c4d5e6f', 'EMP002'),
(15, 'Fofana', 'Hady', 'xpertproinformatique1@gmail.com', '78909876', 0, 'Bamako Mali', 'depart_informatique', 'Développeur', NULL, 'uploads/employes/6863d453d833a_istockphoto-508319912-612x612.jpg', '2025-07-01 12:28:04', '$2y$10$IfO4BrkgCiosGCMICEW/iO1iT9TGRsJPxOfOk.paTyXkjkgE1XcPO', NULL, 1, NULL, '2025-01-01', 'CDI', '', 'actif', NULL, NULL),
(16, 'Sy', 'Diakaridia', 'xpertproinformatique2@gmail.com', '78909876', 0, 'Moribabougou', 'depart_informatique', 'Développeur', NULL, 'uploads/employes/6863d58937b3d_télécharger.jpg', '2025-07-01 12:33:13', '$2y$10$MzFW8ifePdJZey8iNxnXg.iKEg0c2XgY42iVDBZaU2Rt9buBqnGGO', NULL, 1, NULL, '2025-01-01', 'CDI', '', 'actif', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `justificatifs`
--

DROP TABLE IF EXISTS `justificatifs`;
CREATE TABLE IF NOT EXISTS `justificatifs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pointage` int NOT NULL,
  `type_justif` enum('retard','absence') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `fichier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_ajout` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_pointage` (`id_pointage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `late_reasons`
--

DROP TABLE IF EXISTS `late_reasons`;
CREATE TABLE IF NOT EXISTS `late_reasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `scan_time` datetime NOT NULL,
  `late_time` int NOT NULL COMMENT 'En minutes',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expediteur_id` int NOT NULL,
  `sujet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contenu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date_envoi` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expediteur_id` (`expediteur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `message_destinataires`
--

DROP TABLE IF EXISTS `message_destinataires`;
CREATE TABLE IF NOT EXISTS `message_destinataires` (
  `message_id` int NOT NULL,
  `destinataire_id` int NOT NULL,
  `lu` tinyint(1) DEFAULT '0',
  `date_lecture` datetime DEFAULT NULL,
  PRIMARY KEY (`message_id`,`destinataire_id`),
  KEY `destinataire_id` (`destinataire_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_general_ci,
  `message` text COLLATE utf8mb4_general_ci,
  `type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lien` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lue` tinyint(1) DEFAULT '0',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `pointage_id` int DEFAULT NULL,
  `date_lecture` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  KEY `pointage_id` (`pointage_id`)
) ENGINE=MyISAM AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `employe_id`, `titre`, `contenu`, `message`, `type`, `lien`, `lue`, `date_creation`, `date`, `pointage_id`, `date_lecture`) VALUES
(2, 1, 'Pointage manqué', NULL, 'Absence de pointage détectée le 29/06/2025 à 08:00.', 'pointage_manqué', 'detail_pointage.php?id=117', 0, '2025-07-01 09:40:12', '2025-07-01 09:45:13', NULL, NULL),
(3, 3, 'Info', NULL, 'Votre badge expire bientôt.', 'info', NULL, 0, '2025-07-01 09:40:12', '2025-07-01 09:45:13', NULL, NULL),
(115, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 16:24:02', '2025-07-03 16:24:02', NULL, NULL),
(114, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 16:14:01', '2025-07-03 16:14:01', NULL, NULL),
(109, 2, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 10:06:45', '2025-07-03 10:06:45', NULL, NULL),
(110, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 10:11:18', '2025-07-03 10:11:18', NULL, NULL),
(111, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 11:33:56', '2025-07-03 11:33:56', NULL, NULL),
(104, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-02.', NULL, NULL, NULL, 0, '2025-07-02 22:02:49', '2025-07-02 22:02:49', NULL, NULL),
(103, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-02.', NULL, NULL, NULL, 0, '2025-07-02 18:24:28', '2025-07-02 18:24:28', NULL, NULL),
(102, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-02.', NULL, NULL, NULL, 0, '2025-07-02 14:59:48', '2025-07-02 14:59:48', NULL, NULL),
(101, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-02.', NULL, NULL, NULL, 0, '2025-07-02 14:59:37', '2025-07-02 14:59:37', NULL, NULL),
(100, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:34:20', '2025-07-01 20:34:20', NULL, NULL),
(99, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:19', '2025-07-01 20:17:19', NULL, NULL),
(113, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 16:13:15', '2025-07-03 16:13:15', NULL, NULL),
(98, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:19', '2025-07-01 20:17:19', NULL, NULL),
(95, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:18', '2025-07-01 20:17:18', NULL, NULL),
(96, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:19', '2025-07-01 20:17:19', NULL, NULL),
(97, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:19', '2025-07-01 20:17:19', NULL, NULL),
(93, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:16', '2025-07-01 20:17:16', NULL, NULL),
(94, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:18', '2025-07-01 20:17:18', NULL, NULL),
(92, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:17:10', '2025-07-01 20:17:10', NULL, NULL),
(91, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-01.', NULL, NULL, NULL, 0, '2025-07-01 20:16:55', '2025-07-01 20:16:55', NULL, NULL),
(112, 0, 'Pointage manquant', 'Vous avez manqué le pointage du 2025-07-03.', NULL, NULL, NULL, 0, '2025-07-03 12:26:25', '2025-07-03 12:26:25', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`(250)),
  KEY `token` (`token`(250))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `pointages`
--

DROP TABLE IF EXISTS `pointages`;
CREATE TABLE IF NOT EXISTS `pointages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_pointage` datetime DEFAULT NULL,
  `date_heure` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `employe_id` int NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `temps_total` time DEFAULT NULL,
  `type` enum('arrivee','depart','absence') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `retard_cause` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `retard_justifie` enum('oui','non') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `est_justifie` tinyint(1) DEFAULT '0',
  `commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `justifie_par` int DEFAULT NULL,
  `date_justification` datetime DEFAULT NULL,
  `type_justification` enum('médical','familial','autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `badge_token_id` int DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `device_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `qr_code_id` int DEFAULT NULL,
  `etat` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'normal',
  PRIMARY KEY (`id`),
  KEY `justifie_par` (`justifie_par`),
  KEY `employe_id` (`employe_id`),
  KEY `badge_token_id` (`badge_token_id`),
  KEY `fk_pointages_qr_code` (`qr_code_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pointages`
--

INSERT INTO `pointages` (`id`, `date_pointage`, `date_heure`, `employe_id`, `is_read`, `temps_total`, `type`, `retard_cause`, `retard_justifie`, `est_justifie`, `commentaire`, `justifie_par`, `date_justification`, `type_justification`, `badge_token_id`, `ip_address`, `device_info`, `qr_code_id`, `etat`) VALUES
(1, NULL, '2025-07-01 13:39:30', 2, 1, NULL, 'arrivee', 'Arrivée après 09h00', 'non', 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', NULL, 'normal'),
(2, NULL, '2025-07-01 15:10:20', 2, 1, '01:30:50', 'depart', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', NULL, 'normal'),
(4, NULL, '2025-07-01 16:13:45', 2, 1, NULL, 'arrivee', 'Arrivée après 09h00', 'non', 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', NULL, 'normal'),
(5, NULL, '2025-07-01 16:28:54', 2, 1, '00:15:09', 'depart', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', NULL, 'normal'),
(11, NULL, '2025-07-03 18:11:15', 15, 1, NULL, 'arrivee', 'Arrivée après 09h00', 'non', 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal'),
(12, NULL, '2025-07-03 18:24:53', 15, 0, '00:13:38', 'depart', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal'),
(13, NULL, '2025-07-03 18:35:42', 2, 0, NULL, 'arrivee', 'Arrivée après 09h00', 'non', 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal'),
(14, NULL, '2025-07-03 18:40:33', 2, 0, '00:04:51', 'depart', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal'),
(15, NULL, '2025-07-03 18:58:06', 15, 0, NULL, 'arrivee', 'Arrivée après 09h00', 'non', 0, NULL, NULL, NULL, NULL, 36, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal'),
(16, NULL, '2025-07-03 19:06:46', 15, 0, '00:08:40', 'depart', NULL, NULL, 0, NULL, NULL, NULL, NULL, 36, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal'),
(17, NULL, '2025-07-03 19:07:57', 2, 0, NULL, 'arrivee', 'Arrivée après 09h00', 'non', 0, NULL, NULL, NULL, NULL, 38, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'normal');

--
-- Déclencheurs `pointages`
--
DROP TRIGGER IF EXISTS `after_depart_pointage`;
DELIMITER $$
CREATE TRIGGER `after_depart_pointage` AFTER INSERT ON `pointages` FOR EACH ROW BEGIN
    IF NEW.type = 'depart' THEN
        UPDATE badge_tokens 
        SET expires_at = NOW() 
        WHERE employe_id = NEW.employe_id AND expires_at > NOW();
        
        INSERT INTO badge_logs (employe_id, action, details)
        VALUES (NEW.employe_id, 'invalidation', 'Badge invalidé après pointage de départ');
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `qr_codes`
--

DROP TABLE IF EXISTS `qr_codes`;
CREATE TABLE IF NOT EXISTS `qr_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `departement` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `heure_arrivee` datetime NOT NULL,
  `type` enum('arriver','depart') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `retards`
--

DROP TABLE IF EXISTS `retards`;
CREATE TABLE IF NOT EXISTS `retards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `date_retard` date NOT NULL,
  `heure_arrivee_prevue` time DEFAULT '09:00:00',
  `heure_arrivee_reelle` time DEFAULT NULL,
  `justifie` tinyint(1) DEFAULT '0',
  `motif` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_retard` (`employe_id`,`date_retard`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `absences`
--
ALTER TABLE `absences`
  ADD CONSTRAINT `fk_absence_employe` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `badge_journalier`
--
ALTER TABLE `badge_journalier`
  ADD CONSTRAINT `fk_badge_journalier_employe` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `badge_logs`
--
ALTER TABLE `badge_logs`
  ADD CONSTRAINT `fk_badge_logs_employe` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `badge_scans`
--
ALTER TABLE `badge_scans`
  ADD CONSTRAINT `badge_scans_ibfk_1` FOREIGN KEY (`token_id`) REFERENCES `badge_tokens` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `badge_tokens`
--
ALTER TABLE `badge_tokens`
  ADD CONSTRAINT `fk_employe_id` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `conges`
--
ALTER TABLE `conges`
  ADD CONSTRAINT `fk_conges_employe` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `demandes`
--
ALTER TABLE `demandes`
  ADD CONSTRAINT `demandes_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `demandes_badge`
--
ALTER TABLE `demandes_badge`
  ADD CONSTRAINT `fk_demandes_badge_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_demandes_badge_employe` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `justificatifs`
--
ALTER TABLE `justificatifs`
  ADD CONSTRAINT `fk_justificatifs_pointage` FOREIGN KEY (`id_pointage`) REFERENCES `pointages` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`expediteur_id`) REFERENCES `admins` (`id`);

--
-- Contraintes pour la table `message_destinataires`
--
ALTER TABLE `message_destinataires`
  ADD CONSTRAINT `message_destinataires_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`),
  ADD CONSTRAINT `message_destinataires_ibfk_2` FOREIGN KEY (`destinataire_id`) REFERENCES `employes` (`id`);

--
-- Contraintes pour la table `pointages`
--
ALTER TABLE `pointages`
  ADD CONSTRAINT `fk_pointages_badge_token` FOREIGN KEY (`badge_token_id`) REFERENCES `badge_tokens` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pointages_employe` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pointages_justifie_par` FOREIGN KEY (`justifie_par`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pointages_qr_code` FOREIGN KEY (`qr_code_id`) REFERENCES `qr_codes` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `retards`
--
ALTER TABLE `retards`
  ADD CONSTRAINT `fk_retards_employe` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
