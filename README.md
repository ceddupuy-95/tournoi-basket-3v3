# 🏀 BasketTournoi

Gestionnaire de tournoi de basket scolaire — synchronisation temps réel entre tous les navigateurs.

## Déploiement gratuit sur Railway (recommandé, 5 minutes)

1. Crée un compte sur https://railway.app (gratuit)
2. Clique **"New Project" → "Deploy from GitHub repo"**
   - Ou utilise **"Deploy from local"** en glissant ce dossier
3. Railway détecte automatiquement le `package.json` et lance `npm start`
4. Va dans l'onglet **Settings → Networking → Generate Domain**
5. Partage l'URL générée (ex: `https://tournoi-basket-xyz.railway.app`) à tous les profs

## Déploiement sur Render (alternative gratuite)

1. Crée un compte sur https://render.com
2. **New → Web Service → Upload files** (ou connecte GitHub)
3. Build Command : `npm install`
4. Start Command : `node server.js`
5. Environment : Node
6. Clique **Deploy** → partage l'URL

## Lancement en local (réseau lycée)

```bash
npm install
npm start
```

Puis partage `http://[IP-du-PC]:3000` sur le réseau local.
L'IP du PC : `ip addr` (Linux) ou `ipconfig` (Windows).

## Variables d'environnement (optionnel)

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT`   | 3000   | Port d'écoute |
| `DB_PATH`| `./tournoi.db` | Chemin de la base SQLite |

## Architecture

- **Backend** : Node.js + Express
- **Base de données** : SQLite (fichier `tournoi.db`, persistant)
- **Sync temps réel** : Server-Sent Events (SSE) — le serveur notifie tous les clients connectés à chaque modification
- **Frontend** : HTML/CSS/JS vanilla (zéro dépendance front)

## Fonctionnement de la sync

1. Un prof modifie un score → le navigateur envoie `POST /api/state` au serveur
2. Le serveur sauvegarde en SQLite et diffuse le nouveau timestamp via SSE
3. Tous les autres navigateurs reçoivent le signal et rechargent l'état → `GET /api/state`
4. Résultat : tous les écrans sont à jour en moins d'une seconde
