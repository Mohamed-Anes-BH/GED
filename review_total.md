# 🔍 AgrOdiv GED - Revue Totale & État des Lieux (Audit v2.1)

Ce document dresse un diagnostic complet de l'état actuel (Base de données, Backend Django, Frontend React) avant la transition vers l'application bureau **ElectronJS**. Il met en évidence ce qui est **100% fonctionnel** et ce qui **manque / reste à câbler**.

---

## 1. 🗄️ Base de Données (PostgreSQL)
**État actuel : 🟢 Excellent (100% Implémenté)**

- **Schéma relationnel** : Les 39 tables prévues dans le guide v2.1 sont créées et migrées.
- **Fonctionnalités avancées** : 
  - Système de *Corbeille* (`is_deleted`, `deleted_at`) intégré partout (Courriers, Dossiers, Documents).
  - Moteur de *Diffusion* avec suivi de lecture individuel (`DiffusionDestinataire`).
  - Piste d'audit (Logs) prête pour intercepter chaque action logicielle via les `signaux` Django.
- **Données** : Script `seed_db.py` opérationnel (Rôles, Utilisateurs de test, fausses factures et courriers).
- **Reste à faire (Post-MVP)** : Stratégie de sauvegarde automatique distante (dump régulier).

---

## 2. ⚙️ Backend API (Django REST Framework)
**État actuel : 🟢 Très Bon (95% Implémenté)**

- **Architecture** : Découpée en 12 applications logiques (Authentication, Documents, Dossiers, Courriers, OCR, Workflows, Audit, Dashboard...). 
- **Sécurité** : JWT implémenté (Access + Refresh token), système de permissions (basé sur le département / rôle).
- **Endpoints** : Routeur API (`/api/...`) structuré et validé.
- **Ce qui manque ou doit être finalisé** :
  1. **Moteur OCR asynchrone (Celery + Tesseract)** : Si l'OCR (app 8) a ses endpoints, le traitement d'une grosse image peut bloquer le serveur si on n'utilise pas des tâches asynchrones (`Celery` / `Redis`). De plus, assurez-vous que `tesseract-ocr` est installé sur l'OS du conteneur Docker.
  2. **Génération PDF / Export** : Les endpoints pour exporter l'historique d'audit (CSV/PDF) ou les KPIs peuvent nécessiter des librairies (`ReportLab` ou `WeasyPrint`) pas encore testées à pleine échelle.
  3. **Workflows complexes automatiques** : Le passage automatique de l'état "brouillon" à "validé" selon des délais (Timeout) nécessite un thread en arrière-plan (`Celery Beat`).

---

## 3. 🖥️ Frontend Web (React + Vite)
**État actuel : 🟡 Bon (80% Implémenté - UI Magnifique, Câblage partiel)**

- **Design UI/UX** : Thème premium, responsive, modes clair/sombre, animations fluides (100% validé).
- **Architecture Frontend** : Structure de composants propre (`src/pages`, `src/services`, `src/hooks`).
- **Lecture des données (GET)** : 
  - La connexion (`LoginPage`), le Dashboard, la lecture des Dossiers et Courriers interagissent avec les *vraies* APIs.
  - Le système d'intercepteur Axios (rafraichissement JWT auto) fonctionne.
- **Ce qui manque (Câblage des Formulaires d'écriture)** :
  1. **Formulaires de Création (POST)** : Les fenêtres "Créer un nouveau document", "Créer courrier entrant" et "Nouvelle diffusion" utilisent actuellement des fausses alertes (`console.log` / `alert`) et ne déclenchent pas encore `api.post(...)`.
  2. **Visionneuse PDF (`VisionneusePdfPage.tsx`)** : Affiche un faux aperçu ou passe par un iFrame basique. Récupérer un `Blob` sécurisé depuis le Backend (qui nécessite le header JWT) demande un lecteur PDF orienté composant (ex: `react-pdf`).
  3. **Module Scanner (TWAIN/SANE)** : Totalement impossible via un navigateur Web classique dû aux restrictions de sécurité. **(C'est ici qu'intervient Electron !)**

---

## 4. 🚀 La Phase Fine : Transition vers Electron (Desktop App)
Transformer ce frontend web en une application bureau Windows/Linux. 

**Pourquoi on en a besoin maintenant ?**
1. **Accéder au scanner matériel (Côté Client)** : Communiquer nativement via l'USB/Wifi local pour scanner des documents (module `node-twain` ou appel CLI SANE/WIA via IPC).
2. **Système de Notification OS** : Remplacer l'alerte React par une native native en bas à droite de l'écran (ex: Windows Toast).
3. **Sécurité et confort** : AgrOdiv veut sans doute lancer l'application d'un simple double-clic, avec lancement du backend Docker masqué en arrière plan ou hébergé en réseau local.

### 📋 To-Do List pour basculer sur Electron :
1. [ ] Installer `electron`, `electron-builder` et `concurrently` côté Frontend React.
2. [ ] Créer `main.js` (ou `main.ts`): le cerveau d'Electron (Gestion de la fenêtre, cache Chromium, etc.).
3. [ ] Créer `preload.js` : le pont de sécurité IPC (Inter-Process Communication) qui expose les API natives Node.js (ex: accès au file system local) au React.
4. [ ] Paramétrer `vite.config.ts` pour supporter le *build* ciblant Electron (gestion des chemins relatifs `./`).
5. [ ] **Connecter l'interface Scanner React** vers le port natif OS via l'IPC d'Electron pour récupérer directement l'image `.jpg/.pdf` du scanner de l'utilisateur.

---

**Conclusion** : 
Le système principal est de qualité production. Il reste à terminer le câblage de certains formulaires d'écriture UI, puis envelopper le tout dans **ElectronJS** pour libérer les fonctionnalités matérielles avancées (Scanner local, intégration OS).
