# neuro·reset

Une web app responsive pour renforcer chaque jour les 7 principes de neuroscience et de transformation personnelle.

## Les 7 principes

1. **Neuroplasticité** — Le cerveau se recâble par la répétition
2. **Système nerveux autonome** — Activer le parasympathique pour récupérer
3. **Champ électromagnétique du cœur** — Le cœur influence le cerveau
4. **Répétition mentale** — Visualiser active les mêmes zones que faire
5. **Cerveau subconscient** — 85% de tes actions sont automatiques
6. **Système d'activation réticulaire** — Tu vois ce que tu crois
7. **Neurogenèse** — Créer de nouveaux neurones chaque jour

## Fonctionnalités

- 🔐 **Authentification** (username + mot de passe, hash SHA-256 + sel côté client)
- ✓ **Check-in quotidien** pour chaque principe
- ⏱ **Timers guidés** : respiration 4-7-8, cohérence cardiaque 5-5, méditation, visualisation
- 📝 **Journal** par principe
- 📊 **Dashboard** avec streaks, heatmap 90 jours, stats par principe, humeur
- 📱 **Responsive** (mobile, tablette, desktop)

## Setup — Étape par étape

### 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un compte (gratuit)
2. Clique sur **"New Project"**
3. Donne un nom, choisis une région proche (Frankfurt si tu es à Dubai), définis un mot de passe DB (à conserver)
4. Attends ~2 min que le projet soit provisionné

### 2. Créer les tables

1. Dans ton projet Supabase, va dans **SQL Editor** (icône `</>` à gauche)
2. Clique sur **"New query"**
3. Ouvre le fichier `supabase_schema.sql` de ce projet et copie tout son contenu
4. Colle dans l'éditeur SQL et clique sur **"Run"** (ou `Cmd/Ctrl + Enter`)
5. Tu devrais voir "Success" — les 4 tables sont créées

### 3. Récupérer les clés API

1. Dans Supabase, va dans **Settings** → **API**
2. Copie deux valeurs :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public** key (longue chaîne commençant par `eyJ...`)

### 4. Configurer l'app

1. Ouvre `js/config.js` dans un éditeur de texte
2. Remplace les deux lignes :
   ```js
   const SUPABASE_URL  = 'https://YOUR-PROJECT-ID.supabase.co';
   const SUPABASE_ANON = 'YOUR-ANON-PUBLIC-KEY';
   ```
   par tes vraies valeurs.

### 5. Lancer l'app

**Option A — Local (le plus simple) :**

Lance un serveur statique depuis le dossier `neuroreset/` :

```bash
# Avec Python (déjà installé sur macOS/Linux) :
python3 -m http.server 8000

# Ou avec Node :
npx serve

# Ou avec PHP :
php -S localhost:8000
```

Puis ouvre [http://localhost:8000](http://localhost:8000)

> ⚠️ N'ouvre PAS `index.html` directement avec `file://` — les requêtes Supabase échoueront. Il faut absolument un serveur HTTP local.

**Option B — Déploiement gratuit :**

L'app est 100% statique, donc tu peux l'héberger gratuitement sur :

- **Vercel** : `vercel deploy` depuis le dossier
- **Netlify** : drag & drop du dossier sur netlify.com
- **GitHub Pages** : push sur un repo et active Pages dans Settings
- **Cloudflare Pages** : connexion via GitHub

## Architecture des fichiers

```
neuroreset/
├── index.html              # Page principale (single page app)
├── supabase_schema.sql     # Script SQL à exécuter dans Supabase
├── README.md               # Ce fichier
├── css/
│   └── style.css           # Styles (esthétique organique terre)
└── js/
    ├── config.js           # ⚠️ À éditer : URL + clé Supabase
    ├── principles.js       # Données des 7 principes
    ├── auth.js             # Logique signup/login
    ├── db.js               # Accès Supabase (CRUD)
    └── app.js              # Logique UI et navigation
```

## Schéma de la base de données

- **users** — `id, username, password_hash, salt, created_at`
- **daily_checkins** — `user_id, date, principles_completed[], meditation_minutes, visualization_minutes, mood_before, mood_after`
- **journal_entries** — `user_id, principle_id, content, created_at`
- **sessions** — `user_id, session_type, duration_sec, principle_id, created_at`

## Sécurité — Notes importantes

- Les mots de passe sont hashés en **SHA-256 avec sel aléatoire** côté client avant envoi.
- La clé `anon` Supabase est destinée à être publique — c'est normal qu'elle soit dans le code.
- **RLS (Row Level Security) est désactivée** car on utilise une auth custom. Pour une vraie production, migre vers Supabase Auth + RLS policies.
- Pour un usage personnel quotidien, le setup actuel est largement suffisant.

## Conseils d'utilisation

- Commence petit : 1-2 principes par jour suffisent pour bâtir le streak
- Le timer guidé (respiration / cohérence) marque automatiquement le principe comme fait
- Note tes ressentis dans le journal — c'est là que la prise de conscience opère
- Reviens sur le dashboard chaque semaine pour voir ta constellation se densifier

Bonne pratique 🌿
