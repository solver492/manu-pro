# Documentation MonAuxiliaire Manu-Pro

## Table des matières
1. [Installation et démarrage](#installation-et-démarrage)
2. [Architecture de l'application](#architecture-de-lapplication)
3. [Fonctionnalités principales](#fonctionnalités-principales)
4. [Base de données](#base-de-données)
5. [API et Routes](#api-et-routes)
6. [Authentification](#authentification)

## Installation et démarrage

### Sur Replit
1. Créer un nouveau Repl
2. Importer le projet depuis GitHub ou uploader les fichiers
3. Dans le terminal Replit, exécuter :
```bash
npm install        # Installer les dépendances
npm run dev       # Démarrer le serveur de développement
node server/server.js  # Démarrer le serveur backend dans un autre terminal
```

### En local
1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```
3. Démarrer l'application :
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
node server/server.js
```

## Architecture de l'application

### Frontend (React + Vite)
- `/src/pages/` : Pages principales de l'application
- `/src/components/` : Composants réutilisables
- `/src/contexts/` : Contextes React (Auth, etc.)
- `/src/services/` : Services (API, etc.)

### Backend (Express.js)
- `/server/server.js` : Point d'entrée du serveur
- `/server/database.js` : Configuration de la base de données
- `/server/routes/` : Routes API

## Fonctionnalités principales

### 1. Gestion des sites clients
- Liste des sites avec statut
- Recherche par ID de site
- Détails du site avec historique des envois
- Statistiques par site

### 2. Gestion des envois
- Envoi de manutentionnaires
- Historique des envois
- Calcul des coûts

### 3. Dashboard
- Vue d'ensemble des activités
- Statistiques globales
- Indicateurs de performance

## Base de données

### Structure (SQLite)
- Table `sites` : Informations des sites clients
- Table `shipments` : Historique des envois
- Table `users` : Utilisateurs et authentification

### Requêtes principales
- Récupération des sites : `SELECT * FROM sites`
- Historique des envois : `SELECT * FROM shipments WHERE site_id = ?`
- Statistiques : Requêtes agrégées pour les totaux

## API et Routes

### Routes principales
- `/api/sites` : CRUD des sites clients
- `/api/sites/:id` : Détails d'un site
- `/api/sites/:id/shipments` : Historique des envois
- `/api/auth/*` : Routes d'authentification

### Middleware
- Authentification : Vérification du token JWT
- Validation : Vérification des données entrantes
- Logging : Journalisation des requêtes

## Authentification

### Système
- JWT (JSON Web Tokens)
- Sessions côté client
- Stockage sécurisé dans localStorage

### Niveaux d'accès
- Administrateur : Accès complet
- Utilisateur standard : Lecture seule
- Non authentifié : Page de connexion uniquement

## Déploiement

### Prérequis
- Node.js v14+
- NPM ou Yarn
- Base de données SQLite

### Variables d'environnement
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=votre_secret_jwt
```

### Commandes de production
```bash
npm run build    # Build l'application
npm start       # Démarrer en production
```

## Maintenance

### Sauvegarde
- Base de données : Fichier SQLite à sauvegarder régulièrement
- Configuration : Variables d'environnement à conserver
- Logs : Rotation des logs à configurer

### Mises à jour
1. Sauvegarder la base de données
2. Mettre à jour les dépendances
3. Tester en développement
4. Déployer en production

## Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs
3. Contacter le support technique

## Sécurité

### Bonnes pratiques
- Validation des entrées
- Protection contre les injections SQL
- Authentification JWT
- HTTPS en production
