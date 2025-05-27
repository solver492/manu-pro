# MonAuxiliaire Manu-Pro - Documentation

## 1. Introduction

Bienvenue dans MonAuxiliaire Manu-Pro ! Cette application web a été conçue pour simplifier la gestion et le suivi des manutentionnaires envoyés sur différents sites clients. Elle offre une interface intuitive et des fonctionnalités robustes pour optimiser vos opérations quotidiennes.

L'application est développée en React avec Vite, utilise TailwindCSS pour le style, shadcn/ui pour les composants d'interface, Framer Motion pour les animations, et Lucide React pour les icônes. Initialement, les données sont stockées via `localStorage` pour un prototypage rapide.

## 2. Fonctionnalités Principales

### 2.1. Système d'Authentification
-   **Page de Connexion** : Interface sécurisée pour l'accès via email et mot de passe.
    -   Fichier principal : `src/pages/LoginPage.jsx`
    -   Logique d'authentification : `src/contexts/AuthContext.jsx` (simule l'authentification avec `localStorage`).
-   **Session Persistante** : L'utilisateur reste connecté jusqu'à la déconnexion manuelle (géré par `localStorage`).

### 2.2. Dashboard Principal (`src/pages/DashboardPage.jsx`)
-   **Statistiques Globales** :
    -   Nombre total de manutentionnaires envoyés (ce mois / cette année).
    -   Chiffre d'affaires total (calculé à 150 DH par manutentionnaire).
    -   Graphique des envois par mois.
    -   Top 5 des sites clients les plus actifs.
    -   Alertes et notifications (placeholder pour l'instant).
-   **Mécanisme** : Les données sont récupérées depuis `localStorage` (`shipments` et `clientSites`) et agrégées pour affichage.

### 2.3. Module "Sites Clients" (`src/pages/ClientSitesPage.jsx`)
-   **Liste des Sites** : Affiche tous les sites clients enregistrés sous forme de cartes.
    -   Données initiales : `src/data/initialData.js`.
    -   Stockage : `localStorage` clé `clientSites`.
-   **Fonctionnalités par Site** :
    -   **Ajouter un Site** : Permet d'ajouter un nouveau site.
    -   **Rechercher un Site** : Filtre la liste des sites par nom ou adresse.
    -   **Modifier un Site** : Placeholder pour une future fonctionnalité d'édition.
    -   **Supprimer un Site** : Permet de supprimer un site de la liste avec confirmation.
-   **Boutons d'Action par Site** :
    -   **Exploiter (Visualisation)** : Redirige vers `src/pages/SiteDetailPage.jsx?id=<siteId>`.
        -   Affiche les statistiques spécifiques au site : manutentionnaires envoyés (aujourd'hui, ce mois), coût total généré.
        -   Graphique de tendance des 6 derniers mois.
        -   **Historique Détaillé des Envois** : Affiche un tableau de tous les envois pour le site, triés par date, avec le nombre de manutentionnaires et le coût.
    -   **Envoyer (Action)** : Redirige vers `src/pages/SendHandlerPage.jsx?id=<siteId>`.
        -   Interface pour spécifier le nombre de manutentionnaires et la date d'envoi.
        -   Enregistre un nouvel "envoi" dans `localStorage` (clé `shipments`).

### 2.4. Module "Statistiques" (`src/pages/StatisticsPage.jsx`)
-   **Vue d'Ensemble** :
    -   Tableau récapitulatif par site client : nom, manutentionnaires envoyés (mois/année), CA généré, évolution.
    -   Graphiques : Envois par site (Top 10), Évolution mensuelle globale.
-   **Exportation** : Permet d'exporter les données du tableau récapitulatif au format CSV.
-   **Impression** : Permet d'imprimer la page des statistiques (principalement le tableau récapitulatif).
-   **Mécanisme** : Agrège les données de `shipments` et `clientSites` pour fournir une vue consolidée.

## 3. Structure du Code

### 3.1. Organisation des Dossiers
-   `public/` : Fichiers statiques.
-   `src/` : Code source de l'application.
    -   `components/` : Composants React réutilisables.
        -   `ui/` : Composants shadcn/ui (Button, Card, Input, etc.).
        -   `Layout.jsx` : Structure principale de la page (header, navigation, footer).
    -   `contexts/` : Contextes React (ex: `AuthContext.jsx`).
    -   `data/` : Données initiales et de configuration (ex: `initialData.js`).
    -   `hooks/` : Hooks React personnalisés (ex: `useLocalStorage.js`).
    -   `lib/` : Utilitaires (ex: `utils.js` pour `cn`).
    -   `pages/` : Composants React représentant les différentes pages/vues de l'application.
    -   `App.jsx` : Composant racine, gère le routing.
    -   `main.jsx` : Point d'entrée de l'application React.
    -   `index.css` : Styles globaux et configuration TailwindCSS.

### 3.2. Gestion des Données (`localStorage`)
-   Le hook `src/hooks/useLocalStorage.js` est utilisé pour lire et écrire des données dans le `localStorage` du navigateur.
-   **Clés utilisées** :
    -   `authUser`: Stocke les informations de l'utilisateur connecté.
    -   `clientSites`: Liste des sites clients.
    -   `shipments`: Liste des envois de manutentionnaires.
    -   `users`: Liste des utilisateurs (pour la simulation de connexion).
-   **Format des données** : Les données sont stockées au format JSON.

### 3.3. Navigation
-   Gérée par `react-router-dom` (version 6).
-   Les routes sont définies dans `src/App.jsx`.
-   `Layout.jsx` contient la barre de navigation principale.
-   Les `ProtectedRoute` dans `App.jsx` s'assurent que l'utilisateur est connecté pour accéder aux pages protégées.

### 3.4. Style et UI
-   **TailwindCSS** : Utilisé pour le stylage utilitaire. Configuration dans `tailwind.config.js`.
-   **shadcn/ui** : Bibliothèque de composants pré-stylés et accessibles, construits sur Radix UI. Les composants sont ajoutés manuellement dans `src/components/ui/`.
-   **Framer Motion** : Utilisé pour les animations et transitions fluides.
-   **Lucide React** : Fournit les icônes SVG.

## 4. Passage à une Base de Données SQLite (Guide)

L'application est actuellement conçue pour fonctionner en mode frontend uniquement avec `localStorage`. Pour utiliser SQLite, une architecture backend est nécessaire.

### 4.1. Prérequis
1.  **Environnement Backend** : Choisissez une technologie serveur (ex: Node.js avec Express.js, PHP avec un framework comme Laravel ou Symfony, Python avec Flask/Django).
2.  **Pilote SQLite** : Installez le pilote SQLite correspondant à votre technologie backend (ex: `sqlite3` pour Node.js, PDO SQLite pour PHP).

### 4.2. Étapes de Migration

#### Étape 1: Conception de la Base de Données
Les schémas SQL que vous avez fournis sont un bon point de départ :

```sql
CREATE TABLE sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_site TEXT NOT NULL UNIQUE, -- Ajout de UNIQUE pour éviter les doublons
    adresse TEXT,
    statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif', 'inactif')) -- Ajout de CHECK constraint
);

CREATE TABLE envois (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL, -- Changé pour NOT NULL
    nombre_manutentionnaires INTEGER NOT NULL,
    date_envoi DATE NOT NULL,
    cout_total DECIMAL(10,2) GENERATED ALWAYS AS (nombre_manutentionnaires * 150.0) STORED, -- Calcul automatique
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE -- Ajout de ON DELETE CASCADE
);

CREATE TABLE utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL, -- Devrait être un hash sécurisé
    nom_complet TEXT
);
```
-   **Note sur `cout_total`** : SQLite 3.31.0+ supporte les colonnes générées. Si votre version est antérieure, vous devrez calculer cela côté application ou via des triggers.
-   **Note sur `mot_de_passe`** : Stockez TOUJOURS les mots de passe sous forme de hashs sécurisés (ex: bcrypt, Argon2).

#### Étape 2: Création du Backend (API)
Vous devrez créer des points de terminaison (API endpoints) pour chaque opération CRUD (Create, Read, Update, Delete) sur vos tables.

**Exemple avec Node.js et Express.js:**

1.  **Installation** :
    ```bash
    npm install express sqlite3 cors
    # ou
    yarn add express sqlite3 cors
    ```

2.  **Structure du serveur (exemple `server.js`)** :
    ```javascript
    // server.js
    const express = require('express');
    const sqlite3 = require('sqlite3').verbose();
    const cors = require('cors');
    const app = express();
    const PORT = process.env.PORT || 3001; // Port pour le backend

    app.use(cors()); // Permettre les requêtes cross-origin (depuis votre frontend React)
    app.use(express.json()); // Pour parser les corps de requête JSON

    // Initialiser la base de données SQLite
    const db = new sqlite3.Database('./manutentionnaires.db', (err) => {
      if (err) {
        console.error("Erreur d'ouverture de la base de données", err.message);
      } else {
        console.log('Connecté à la base de données SQLite.');
        // Créer les tables si elles n'existent pas (à exécuter une seule fois ou vérifier l'existence)
        db.exec(`
          CREATE TABLE IF NOT EXISTS sites (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nom_site TEXT NOT NULL UNIQUE,
              adresse TEXT,
              statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif', 'inactif'))
          );
          CREATE TABLE IF NOT EXISTS envois (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              site_id INTEGER NOT NULL,
              nombre_manutentionnaires INTEGER NOT NULL,
              date_envoi DATE NOT NULL,
              cout_total DECIMAL(10,2) GENERATED ALWAYS AS (nombre_manutentionnaires * 150.0) STORED,
              FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
          );
          CREATE TABLE IF NOT EXISTS utilisateurs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              mot_de_passe TEXT NOT NULL,
              nom_complet TEXT
          );
        `, (err) => {
          if (err) console.error("Erreur création tables:", err);
        });
      }
    });

    // --- API Endpoints pour les Sites ---
    // GET /api/sites - Récupérer tous les sites
    app.get('/api/sites', (req, res) => {
      db.all("SELECT * FROM sites", [], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ data: rows });
      });
    });

    // POST /api/sites - Créer un nouveau site
    app.post('/api/sites', (req, res) => {
      const { nom_site, adresse, statut } = req.body;
      const sql = "INSERT INTO sites (nom_site, adresse, statut) VALUES (?, ?, ?)";
      db.run(sql, [nom_site, adresse, statut], function(err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.status(201).json({ id: this.lastID, nom_site, adresse, statut });
      });
    });

    // ... Autres endpoints pour PUT, DELETE, et pour les tables 'envois' et 'utilisateurs' ...
    // Exemple pour l'authentification (très simplifié, nécessite une gestion des mots de passe sécurisée)
    app.post('/api/login', (req, res) => {
        const { email, mot_de_passe } = req.body;
        // ATTENTION: Ceci est une simplification extrême.
        // NE JAMAIS stocker/comparer des mots de passe en clair. Utilisez bcrypt.
        db.get("SELECT * FROM utilisateurs WHERE email = ? AND mot_de_passe = ?", [email, mot_de_passe], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(401).json({ error: "Identifiants incorrects" });
            // Retourner un token JWT serait une meilleure pratique ici
            res.json({ message: "Connexion réussie", user: { id: row.id, email: row.email, nom_complet: row.nom_complet } });
        });
    });


    app.listen(PORT, () => {
      console.log(\`Serveur backend démarré sur http://localhost:\${PORT}\`);
    });
    ```

#### Étape 3: Modification du Frontend (React)
Vous devrez remplacer tous les appels à `useLocalStorage` par des appels `fetch` (ou une bibliothèque comme Axios) vers votre API backend.

**Exemple de modification pour `ClientSitesPage.jsx`:**

```javascript
// src/pages/ClientSitesPage.jsx (extrait modifié)
import React, { useState, useEffect } from 'react';
// ... autres imports ...

const ClientSitesPage = () => {
  const [clientSites, setClientSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // ... searchTerm, siteToDelete ...

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/sites'); // URL de votre API backend
        if (!response.ok) throw new Error('Erreur réseau');
        const result = await response.json();
        setClientSites(result.data);
      } catch (error) {
        toast({ title: "Erreur", description: "Impossible de charger les sites.", variant: "destructive" });
        console.error("Erreur fetchSites:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSites();
  }, [toast]);

  const handleAddSite = async () => {
    const newSiteData = { nom_site: \`Nouveau Site \${clientSites.length + 1}\`, adresse: 'Adresse à définir', statut: 'actif' };
    try {
      const response = await fetch('http://localhost:3001/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSiteData),
      });
      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Erreur serveur');
      }
      const addedSite = await response.json();
      setClientSites(prevSites => [...prevSites, addedSite]);
      toast({ title: "Site Ajouté", description: \`\${addedSite.nom_site} a été ajouté.\` });
    } catch (error) {
      toast({ title: "Erreur", description: \`Impossible d'ajouter le site: \${error.message}\`, variant: "destructive" });
    }
  };

  // ... confirmDeleteSite (devra appeler une API DELETE) ...
  // ... handleEditSite (devra appeler une API PUT) ...

  if (isLoading) return <div className="text-center p-10">Chargement des sites...</div>;

  // ... reste du JSX ...
};
```

**Points importants pour la migration frontend :**
-   **Gestion des états de chargement et d'erreur** : Ajoutez des indicateurs pour l'utilisateur.
-   **Authentification** : L'appel à `login` dans `AuthContext.jsx` devra appeler votre endpoint `/api/login`. Si vous utilisez des tokens (ex: JWT), stockez-les de manière sécurisée (ex: `localStorage` ou cookie `HttpOnly`) et incluez-les dans les en-têtes des requêtes authentifiées.
-   **Variables d'environnement** : Utilisez des variables d'environnement (fichier `.env`) pour l'URL de base de votre API (ex: `VITE_API_BASE_URL=http://localhost:3001/api`).

#### Étape 4: Déploiement
-   **Frontend (React)** : Peut être servi comme un site statique (après `npm run build`).
-   **Backend (Node.js/PHP)** : Nécessite un environnement d'hébergement supportant votre technologie backend (ex: un VPS, une plateforme PaaS comme Heroku, Render, ou un hébergement mutualisé avec support Node.js/PHP).
-   **Base de données SQLite** : Le fichier `manutentionnaires.db` devra être accessible en lecture/écriture par votre application backend sur le serveur. Assurez-vous des permissions correctes.

### 4.3. Sécurité et Bonnes Pratiques (avec Backend)
-   **Validation des entrées** : Validez toutes les données reçues par l'API (côté backend).
-   **Prévention des injections SQL** : Utilisez des requêtes préparées ou des ORM.
-   **Authentification et Autorisation** : Mettez en place un système robuste (ex: tokens JWT).
-   **HTTPS** : Utilisez HTTPS pour toutes les communications.
-   **Sauvegardes régulières** de votre fichier `manutentionnaires.db`.

## 5. Lancement de l'Application (Mode `localStorage`)

1.  **Prérequis** : Assurez-vous d'avoir Node.js (version 20 ou supérieure) et npm (ou yarn) installés sur votre machine.
2.  **Cloner le projet** (si vous l'avez exporté ou si vous travaillez à partir d'un dépôt Git) :
    ```bash
    git clone <url_du_repository>
    cd <nom_du_dossier_du_projet>
    ```
    Si vous avez exporté le projet en ZIP, décompressez-le et naviguez dans le dossier racine du projet via votre terminal.
3.  **Installer les dépendances** : Ouvrez un terminal à la racine du projet et exécutez :
    ```bash
    npm install
    ```
    ou si vous utilisez yarn :
    ```bash
    yarn install
    ```
4.  **Démarrer le serveur de développement Vite** :
    ```bash
    npm run dev
    ```
    ou si vous utilisez yarn :
    ```bash
    yarn dev
    ```
5.  Ouvrez votre navigateur web (Chrome, Firefox, Safari, Edge) et accédez à l'adresse URL affichée dans le terminal (généralement `http://localhost:5173` ou une variante).

L'application devrait maintenant être accessible. Vous pouvez vous connecter avec les identifiants par défaut :
-   Email : `admin@example.com`
-   Mot de passe : `password`

## 6. Pour Aller Plus Loin
-   Implémenter complètement les fonctionnalités d'édition des sites.
-   Développer des graphiques plus interactifs et détaillés (ex: avec Chart.js ou Recharts).
-   Mettre en place l'export des données en PDF (nécessitera des bibliothèques côté client ou backend).
-   Affiner la gestion des erreurs et les retours utilisateur.
-   Optimiser les performances pour de grandes quantités de données (si passage à une base de données serveur).

---
Cette documentation fournit un aperçu du fonctionnement actuel et un guide pour une évolution future. N'hésitez pas à la compléter au fur et à mesure du développement !