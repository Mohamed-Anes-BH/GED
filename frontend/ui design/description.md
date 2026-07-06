# AgrOdiv GED – Système de Gestion Électronique des Documents

## Présentation du projet

**AgrOdiv GED** est une application desktop moderne de **Gestion Électronique des Documents (GED)** destinée aux entreprises et aux administrations souhaitant centraliser, sécuriser et automatiser la gestion de leurs documents et courriers.

Le projet offre une plateforme unique permettant de gérer l'ensemble du cycle de vie documentaire, depuis la création ou la réception d'un document jusqu'à son archivage, sa diffusion et son audit.

L'objectif principal est de remplacer la gestion papier traditionnelle par une solution numérique performante, garantissant une meilleure organisation des informations, une recherche rapide des documents, une collaboration efficace entre les utilisateurs ainsi qu'une traçabilité complète de toutes les opérations réalisées.

---

# Objectifs du projet

Le système permet de :

* Centraliser tous les documents de l'organisation.
* Gérer les courriers entrants et sortants.
* Organiser les documents par directions, départements et services.
* Assurer le suivi des workflows de validation.
* Contrôler les accès grâce à un système de rôles et permissions.
* Faciliter la recherche documentaire grâce aux filtres et aux tags.
* Assurer la sécurité des données.
* Conserver l'historique complet des actions réalisées.
* Produire des statistiques sur l'activité documentaire.

---

# Fonctionnalités principales

Le système couvre l'ensemble des besoins d'une plateforme GED professionnelle.

### Gestion documentaire

* Gestion des documents
* Ajout de documents
* Modification
* Suppression
* Classement
* Versioning
* Aperçu PDF
* Téléchargement
* Archivage
* Corbeille

---

### Gestion des courriers

* Courriers entrants
* Courriers sortants
* Suivi des courriers
* Diffusion
* Validation

---

### Organisation documentaire

* Directions
* Départements
* Services
* Correspondants
* Dossiers
* Catégories
* Tags

---

### Gestion des utilisateurs

* Gestion des utilisateurs
* Attribution des rôles
* Gestion des permissions
* Authentification
* Profil utilisateur

---

### Collaboration

* Workflow
* Notifications
* Historique
* Audit
* Recherche avancée
* Favoris
* Documents récents

---

### Administration

* Paramètres de l'application
* Statistiques
* Gestion du stockage
* Sauvegarde
* Journal système
* Informations de la plateforme

---

# Technologies utilisées

## Front-end

* React
* Electron JS
* Tailwind CSS
* JavaScript
* Tabler Icons

---

## Back-end

* Django
* Django REST Framework
* PostgreSQL
* JWT Authentication

---

## Fonctionnalités techniques

* API REST
* OCR (prévu)
* Workflow documentaire
* Upload sécurisé
* Gestion des permissions
* Authentification JWT

---

# Architecture générale

Le projet suit une architecture en trois couches :

**Interface utilisateur (Desktop React + Electron)**

↓

**API REST (Django REST Framework)**

↓

**Base de données PostgreSQL**

Cette architecture facilite la maintenance, la sécurité et l'évolutivité du système.

---

# Design UI/UX

L'interface utilisateur a été conçue selon une approche moderne inspirée de  **Notion** , **Linear** et  **Microsoft Fluent Design** .

Les principaux choix graphiques sont :

* Interface minimaliste
* Navigation latérale permanente
* Design responsive desktop
* Mode clair et mode sombre
* Cartes modernes avec ombres légères
* Couleurs cohérentes autour du jaune/orange de l'identité AgrOdiv
* Icônes Tabler
* Illustrations légères intégrées aux formulaires
* Expérience utilisateur fluide et intuitive

---

# Sécurité

Le système intègre plusieurs mécanismes de sécurité :

* Authentification sécurisée
* Gestion des rôles et permissions
* Journalisation des actions
* Contrôle des accès
* Historique complet des opérations
* Protection des documents sensibles

---

# Public cible

Cette plateforme est destinée aux :

* Entreprises privées
* Administrations publiques
* Collectivités locales
* Universités
* Établissements publics
* Organismes agricoles
* Institutions ayant une forte gestion documentaire

---

# Résultat attendu

AgrOdiv GED constitue une solution complète de gestion documentaire permettant de réduire l'utilisation du papier, d'améliorer l'organisation des informations, de renforcer la sécurité des documents et d'optimiser la collaboration entre les différents services de l'organisation. Grâce à son interface moderne, son architecture robuste et ses nombreuses fonctionnalités, elle répond aux besoins d'une plateforme GED professionnelle tout en restant intuitive et simple d'utilisation.

Cette description est adaptée à un rapport de stage ou de mémoire et reflète un projet complet de niveau professionnel.
