# ResaHôtel.com

Application web de réservation d'hôtels : un site (HTML, CSS, JavaScript), une API en Python et une base de données MySQL.
Projet fil rouge de la formation Développeur Fullstack.

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Technologies](#technologies)
3. [Structure du projet](#structure-du-projet)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Lancer le projet](#lancer-le-projet)
7. [Rôles et droits](#rôles-et-droits)
8. [Les pages du site](#les-pages-du-site)
9. [L'API](#lapi)
10. [Règles de réservation](#règles-de-réservation)
11. [Sécurité](#sécurité)
12. [Tests](#tests)
13. [Dépannage](#dépannage)
14. [Feuille de route](#feuille-de-route)

## Fonctionnalités

Le site a **quatre profils** :

- **Visiteur** (personne de connectée) : consulte les hôtels et les chambres, s'inscrit, se connecte.
- **Client** : réserve une chambre, puis **voit, modifie, annule et supprime ses réservations** ; **modifie son profil**.
- **Prestataire** (un hôtelier) : **ajoute ses hôtels et leurs chambres** ; modifie son profil.
- **Administrateur** : voit et gère **tout ce que saisissent les prestataires** (hôtels et chambres : modifier, supprimer) ; voit **toutes les réservations des clients** et peut les **modifier ou les supprimer** ; voit la liste des comptes.

Le menu s'adapte au profil : chacun ne voit que les liens qui le concernent, et « Connexion » devient « Déconnexion (Prénom) » une fois connecté.

## Technologies

| Partie | Outils |
|---|---|
| Site | HTML, CSS, JavaScript, Bootstrap, Font Awesome |
| API | Python : serveur `http.server` (`server.py`) **ou** Flask (`app.py`) |
| Base de données | MySQL 5.7 (MAMP PRO), MySQL Workbench |
| Sécurité | bcrypt (mots de passe), PyJWT (jetons), python-dotenv (secrets) |
| Outils | VS Code, Live Server, Postman, Git |

## Structure du projet

```
ResaHôtel.com/
├── index.html
├── Pages/                          les pages du site (voir « Les pages du site »)
├── assets/
│   ├── CSS/
│   ├── Images/
│   └── js/
│       ├── api.js                  appels à l'API, session, rôles, menu, outils d'affichage  (contient API_URL)
│       ├── user.js                 inscription (client ou prestataire) et connexion
│       ├── product.js              ajout d'un hôtel (prestataire, admin)
│       ├── chambre.js              ajout d'une chambre (prestataire, admin)
│       ├── reservation.js          réservation (client)
│       ├── panier.js               « Mes réservations » : voir, modifier, annuler, supprimer (client)
│       ├── profil.js               « Mon profil » (tous les comptes)
│       └── admin.js                page d'administration (admin)
├── backend/
│   ├── server.py                   API version http.server  (port 8000)
│   ├── app.py                      API version Flask        (port 5000)
│   ├── database.py                 connexion MySQL et requêtes
│   ├── hotel.py  chambre.py  reservation.py  utilisateur.py    une page de code par ressource
│   ├── securite.py                 jetons, rôles, règles d'accès (table unique : regle_route)
│   ├── admin.py                    création d'un compte administrateur
│   ├── reset_admin.py              réinitialisation du mot de passe admin
│   ├── migration_prestataire.sql   à lancer UNE fois dans MySQL (voir « Installation »)
│   ├── .env                        secrets (JAMAIS dans Git)
│   └── .env.example                modèle du .env
├── tests_securite/                 tests de sécurité (voir « Tests »)
├── resahotel_complet.sql           export de la base de données
├── requirements.txt                bibliothèques Python
└── README.md
```

Les deux serveurs (`server.py` et `app.py`) utilisent **les mêmes fichiers** `hotel.py`, `chambre.py`, `reservation.py`, `utilisateur.py` et `securite.py` : les règles d'accès sont écrites **une seule fois** (`securite.regle_route`) et appliquées de la même façon par les deux. On choisit simplement lequel lancer.

## Prérequis

- **Python** 3.10 ou plus récent
- **MySQL** 5.7 ou plus récent (MAMP PRO, par exemple)
- **VS Code** avec l'extension **Live Server** (pour ouvrir le site)
- Facultatifs : MySQL Workbench, Postman, Node.js 20 ou plus récent (tests du front-end)

## Installation

### 1. Récupérer le projet

```bash
git clone <adresse-du-dépôt>
cd "ResaHôtel.com"
```

### 2. La base de données

1. Démarrez MySQL (dans MAMP PRO, le port est 3306).
2. Dans MySQL Workbench : **Server**, **Data Import**, choisissez `resahotel_complet.sql` (le fichier crée la base `resahotel` et ses tables : `avis`, `chambre`, `hotel`, `paiement`, `reservation`, `utilisateur`).
3. **Migration du rôle prestataire** : ouvrez `backend/migration_prestataire.sql` dans Workbench et exécutez-le **une seule fois**. Il ajoute à la table `hotel` la colonne `prestataire` (le propriétaire de l'hôtel). Les hôtels déjà présents n'ont pas de propriétaire : l'administrateur les gère.
4. Après chaque modification de la structure de la base, refaites l'export (**Server**, **Data Export**) et mettez à jour `resahotel_complet.sql`.

> Sans cette migration, l'ajout d'un hôtel et la page d'administration répondent « Erreur de Base de Données » : le terminal du serveur affiche alors `Unknown column 'prestataire'`.

### 3. L'environnement Python

```bash
python -m venv .venv
source .venv/Scripts/activate        # Git Bash sous Windows
# .venv\Scripts\Activate.ps1         # PowerShell
# source .venv/bin/activate          # Linux et macOS
pip install -r requirements.txt
```

### 4. Le fichier `.env`

Dans le dossier `backend`, copiez `.env.example` en `.env` et remplissez-le :

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=resahotel
JWT_SECRET=
```

`JWT_SECRET` est la clé qui signe les jetons de connexion : **32 caractères minimum**. Pour en fabriquer une :

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Le `.env` ne doit jamais être envoyé sur GitHub : il est dans le `.gitignore`.

### 5. Créer l'administrateur

L'inscription publique ne crée que des comptes **client** ou **prestataire**. Le compte administrateur se crée avec un script :

```bash
cd backend
python admin.py
```

Le script pose les questions (email, nom, prénom, téléphone, mot de passe). Pour changer le mot de passe de l'admin plus tard : `python reset_admin.py`.

**Transformer un compte existant en prestataire** (par exemple un compte de test), dans Workbench :

```sql
UPDATE utilisateur SET role = 'prestataire' WHERE email = 'adresse@exemple.fr';
```

La personne doit se reconnecter : le rôle est écrit dans le jeton à la connexion.

## Lancer le projet

### Choisir le serveur, puis régler l'adresse dans `api.js`

| Serveur lancé | Commande (dans `backend`) | Port | Valeur de `API_URL` dans `assets/js/api.js` |
|---|---|---|---|
| `server.py` (http.server) | `python server.py` | 8000 | `http://localhost:8000` |
| `app.py` (Flask) | `python app.py` | 5000 | `http://localhost:5000` |

> **À ne pas oublier :** l'adresse du serveur s'écrit **à un seul endroit**, en haut de `assets/js/api.js` :
>
> ```javascript
> const API_URL = "http://localhost:8000";
> ```
>
> Quand vous passez d'un serveur à l'autre, **changez cette ligne**. Sinon, le site affiche « Serveur injoignable » alors que le serveur tourne très bien. Pour vérifier l'adresse utilisée : ouvrez la console du navigateur (F12) et tapez `API_URL`.

### Démarrage, dans l'ordre

1. **MySQL** allumé.
2. **Le serveur Python** (environnement virtuel activé) :
   ```bash
   cd backend
   python server.py        # ou : python app.py
   ```
   Le terminal affiche l'adresse du serveur. Pour l'arrêter : `Ctrl+C`. Après toute modification d'un fichier `.py`, relancez-le.
3. **Vérifier `API_URL`** dans `assets/js/api.js` (voir le tableau).
4. **Le site** : clic droit sur `index.html`, puis **Open with Live Server**. Rechargez avec `Ctrl+F5` après une modification des fichiers JavaScript.

## Rôles et droits

| | Visiteur | Client | Prestataire | Administrateur |
|---|---|---|---|---|
| Voir hôtels et chambres | oui | oui | oui | oui |
| S'inscrire, se connecter | oui | | | |
| Réserver | non | **oui** | non | non |
| Voir / modifier / supprimer **ses** réservations | non | **oui** | non | |
| Voir / modifier / supprimer **toutes** les réservations | non | non | non | **oui** |
| Ajouter un hôtel ou une chambre | non | non | **oui** (dans **ses** hôtels) | **oui** (partout) |
| Modifier / supprimer un hôtel ou une chambre | non | non | non | **oui** |
| Voir **ses** hôtels | non | non | **oui** | tous |
| Voir et modifier **son** profil | non | oui | oui | oui |
| Voir la liste des comptes | non | non | non | **oui** |

Le rôle est choisi à l'inscription (**client** ou **prestataire**) et ne peut pas être changé ensuite depuis le site. L'administrateur se crée uniquement avec `admin.py`.

Le menu est adapté par le JavaScript avec des classes : `admin-seulement`, `client-seulement`, `prestataire-seulement`, `catalogue-seulement` (prestataire ou admin), `connecte-seulement`, `lien-connexion`, `lien-inscription`. **Ce n'est qu'un confort d'affichage : la vraie protection est dans l'API**, qui vérifie le jeton à chaque requête.

## Les pages du site

| Page | Qui peut l'ouvrir | Contenu |
|---|---|---|
| `index.html`, à propos, contact, sélection du moment | tout le monde | pages publiques |
| `formulaire-dinscription.html` | tout le monde | inscription (choix **Client** ou **Prestataire**) |
| `connexion.html` | tout le monde | connexion |
| `reservation.html` | tout le monde voit la page ; **seul un client** peut réserver | réservation |
| `votre-panier.html` | **client** | « Mes réservations » : voir, modifier, annuler, supprimer |
| `mon-profil.html` | **toute personne connectée** | voir et modifier son profil, changer son mot de passe |
| `ajout.hotel.html`, `ajout.chambre.html` | **prestataire**, **admin** | ajouter un hôtel, une chambre |
| `admin.html` | **admin** | hôtels (avec le prestataire qui les a ajoutés), chambres, toutes les réservations, comptes |
| `paiement.html` | tout le monde | pas encore relié à l'API |

Une page réservée a `<body style="display:none">` et appelle une garde après le chargement de `api.js` : `pageReserveeClient()`, `pageReserveeCatalogue()`, `pageReserveeConnecte()` ou `pageReserveeAdmin()`. Un visiteur est renvoyé vers la connexion, un compte non autorisé vers l'accueil.

## L'API

Les réponses sont en JSON. Pour les routes protégées, envoyez le jeton reçu à la connexion dans l'en-tête `Authorization: Bearer <jeton>` (avec l'espace après `Bearer`).

| Méthode | Route | Qui peut l'appeler |
|---|---|---|
| `GET` | `/hotels`, `/hotels/<id>` | tout le monde (sans le propriétaire) |
| `POST` | `/hotels` | **prestataire** (devient propriétaire), **admin** |
| `PUT`, `PATCH`, `DELETE` | `/hotels/<id>` | **admin** |
| `GET` | `/mes-hotels` | **prestataire** (ses hôtels), **admin** (tous, avec le nom du prestataire) |
| `GET` | `/chambres`, `/chambres/<hôtel>`, `/chambres/<hôtel>/<chambre>` | tout le monde |
| `POST` | `/chambres` | **prestataire** (dans **ses** hôtels seulement, sinon 403), **admin** |
| `PUT`, `PATCH`, `DELETE` | `/chambres/<hôtel>/<chambre>` | **admin** |
| `GET` | `/reservations`, `/reservations/<id>` | **client** (les siennes), **admin** (toutes) |
| `POST` | `/reservations` | **client** |
| `PUT`, `PATCH`, `DELETE` | `/reservations/<id>` | **client** (les siennes, selon les règles ci-dessous), **admin** |
| `GET`, `PUT`, `PATCH` | `/profil` | toute personne connectée (SON profil) |
| `POST` | `/inscription` | tout le monde (`role` : `client` ou `prestataire` ; `admin` refusé) |
| `POST` | `/connexion` | tout le monde (renvoie l'utilisateur et un `jeton`) |
| `GET` | `/utilisateurs` | **admin** |

**Identifiants :** ceux des hôtels (`H001`...), des chambres (`C001`...) et des réservations (`R...`) sont **fabriqués par le serveur**. Seul l'admin peut en imposer un (utile dans Postman).

**Statuts d'une réservation :** `en attente`, `confirmee`, `annulee`.
**Codes de réponse :** 200 et 201 (succès), 400 (requête invalide), 401 (non connecté), 403 (droits insuffisants), 404 (introuvable), 409 (doublon, conflit de dates ou élément lié), 500 (erreur du serveur : le détail est dans le terminal).

Exemple de test en ligne de commande :

```bash
curl -X POST http://localhost:8000/connexion \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exemple.fr", "mot_de_passe": "votre-mot-de-passe"}'

curl http://localhost:8000/utilisateurs -H "Authorization: Bearer <jeton>"
```

## Règles de réservation

**Ce que le serveur décide** (le navigateur ne peut pas le falsifier) : l'identifiant, le propriétaire (la personne connectée), le statut de départ (`en attente`) et le **montant total** (nombre de nuits × tarif de la chambre). Si un client envoie ces champs, ils sont ignorés.

**Pour réserver**, le client envoie : `hotel`, `chambre`, `date_arrivee`, `date_depart`, `nombre_adulte` (1 à 10) et, facultatif, `nombre_enfant` (0 à 10, par défaut 0). La date d'arrivée ne peut pas être dans le passé, le départ doit suivre l'arrivée, et la chambre ne doit pas être déjà réservée sur la période (une arrivée le jour du départ d'un autre client est acceptée ; une réservation annulée ne bloque plus la chambre).

**Un client**, sur **ses** réservations (celles des autres lui répondent « introuvable », comme si elles n'existaient pas) :

| Action | Condition |
|---|---|
| Voir | toujours |
| Modifier (dates, adultes, enfants) | réservation **ni annulée, ni commencée** (arrivée après aujourd'hui) ; le montant est recalculé |
| Annuler (`statut` : `annulee`) | mêmes conditions |
| Supprimer | réservation **annulée** ou **pas encore commencée** |

Un client ne peut pas changer la chambre, l'hôtel, le montant ou le propriétaire. Pour une réservation commencée ou passée, il faut passer par l'administrateur.

**L'administrateur** peut tout modifier (dates, nombres de personnes, statut, chambre, hôtel, montant) et tout supprimer. Le montant est recalculé quand les dates ou la chambre changent, sauf s'il le fixe lui-même. Une réservation liée à un paiement ne peut pas être supprimée (409).

## Sécurité

- **Mots de passe** hachés avec bcrypt ; jamais stockés ni renvoyés en clair.
- **Jetons JWT** (HS256, une heure), vérifiés à chaque requête avec une liste d'algorithmes fixée ; la clé `JWT_SECRET` vient du `.env`. Le jeton contient l'identifiant et le rôle de la personne.
- **Contrôle d'accès** : une table unique (`securite.regle_route`) dit qui peut appeler quelle route. L'identité transmise aux fonctions vient **du jeton**, jamais du corps de la requête.
- **Propriété** : un client n'atteint que ses réservations ; un prestataire n'ajoute des chambres que dans ses hôtels ; la liste publique des hôtels ne montre pas le propriétaire.
- **Rôle** : `client` ou `prestataire` à l'inscription ; `admin` refusé. Le rôle d'un compte n'est jamais modifiable par l'API.
- **Profil** : changer son email ou son mot de passe exige le mot de passe actuel (réponse 403, et surtout pas 401, pour ne pas déconnecter la personne).
- **Requêtes SQL paramétrées** (`%s`) et listes de champs autorisés : pas d'injection SQL.
- **Validation** des types et des longueurs (celles des colonnes) : une valeur trop longue donne un 400 clair, pas une erreur 500 ; corps de requête limité à 100 Ko.
- **Affichage** des textes avec `textContent` : pas d'injection de script (XSS).
- **Interrupteur de protection** : `PROTECTION_ACTIVE` dans `backend/securite.py`. À `True` (valeur normale), les écritures du catalogue exigent un prestataire ou un admin. À `False` (essais seulement), elles s'ouvrent, mais les réservations, les profils, `/mes-hotels` et `/utilisateurs` restent **toujours** protégés.

**Limites connues :** n'importe qui peut s'inscrire comme prestataire (l'admin modère en supprimant) ; un prestataire ne peut pas modifier ni supprimer ses propres hôtels (l'admin le fait) ; il ne voit pas les réservations de ses hôtels ; il n'y a pas de limite de tentatives de connexion ; CORS est ouvert à tous (`*`) ; un jeton ne peut pas être annulé avant son expiration, et un changement de rôle ne prend effet qu'à la reconnexion ; le paiement n'est pas relié à l'API.

## Tests

Trois fichiers de tests sont fournis (dossier `tests_securite`) :

| Fichier | À placer | Commande |
|---|---|---|
| `test_securite.py` (jetons, droits, table des règles d'accès) | dans `backend` | `python -m unittest -v` |
| `test_protection_routes.py` (toutes les routes × tous les rôles, sans toucher à la base) | dans `backend` | `python -m unittest -v` |
| `test_front_securite.test.js` (règles de sécurité du front-end, rôles, gardes de page, menu) | à la racine du projet | `node --test` |

Les deux premiers n'ont besoin ni de la base de données ni du `.env`. Ils vérifient notamment qu'une requête refusée n'atteint **jamais** la fonction de la page, et que la page reçoit l'identité lue dans le jeton.

## Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| « Serveur injoignable » | `API_URL` ne correspond pas au serveur lancé, ou le serveur est éteint | Mettre 8000 pour `server.py`, 5000 pour `app.py` ; relancer le serveur ; lire la console (F12) |
| 500 « Erreur de Base de Données », `Unknown column 'prestataire'` dans le terminal | la migration n'a pas été lancée | Exécuter `backend/migration_prestataire.sql` dans Workbench |
| 500 à la connexion | `JWT_SECRET` absent ou trop court dans `backend/.env` | Le remplir (32 caractères minimum), relancer le serveur |
| 500 sur une page | erreur de base de données ou de code | Lire la ligne `Erreur MySQL :` ou `Erreur Serveur :` dans le terminal |
| 401 « Connexion requise ! » | pas de jeton, jeton expiré (une heure) ou invalide | Se reconnecter |
| 403 « Droits insuffisants » | le compte n'a pas le rôle exigé par la route | Se connecter avec le bon compte |
| 403 « Cet hôtel ne vous appartient pas » | un prestataire ajoute une chambre dans un hôtel qui n'est pas le sien (ou un hôtel sans propriétaire) | Choisir un de **ses** hôtels, ou demander à l'admin |
| 404 « Réservation introuvable » | la réservation n'existe pas, ou appartient à quelqu'un d'autre | Vérifier l'identifiant et le compte connecté |
| 409 « Une réservation déjà commencée... » | un client modifie ou supprime une réservation commencée | S'adresser à l'administrateur |
| « Seuls les comptes clients peuvent réserver » | un prestataire ou l'admin essaie de réserver | Se connecter avec un compte client |
| Le menu ne change pas après la connexion | `api.js` absent de la page, ou classe manquante sur le lien | Charger `api.js` dans la page ; `Ctrl+F5` |
| Page d'ajout blanche ou renvoyée vers l'accueil | compte non autorisé, ou `api.js` non chargé avant la garde | Se connecter en prestataire ou admin ; vérifier l'ordre des scripts |
| Mes modifications du site n'apparaissent pas | cache du navigateur | `Ctrl+F5` |
| Les modifications de `.py` sans effet | le serveur n'a pas été relancé | `Ctrl+C`, puis relancer |
| `ModuleNotFoundError` | environnement virtuel non activé ou bibliothèques manquantes | Activer `.venv`, puis `pip install -r requirements.txt` |

## Feuille de route

- [x] Rôle prestataire : ajout d'hôtels et de chambres, hôtels rattachés à leur propriétaire
- [x] Réservations sécurisées : propriétaire ou admin, montant et identifiants calculés par le serveur
- [x] Profil modifiable, réservations du client (voir, modifier, annuler, supprimer), page d'administration
- [ ] Le prestataire modifie et supprime ses propres hôtels et chambres
- [ ] Le prestataire voit les réservations de ses hôtels
- [ ] Validation des comptes prestataires par l'administrateur
- [ ] Boutons « Payer », page de paiement reliée à l'API
- [ ] Avis des clients
- [ ] Limitation des tentatives de connexion, CORS restreint
- [ ] Mise à jour du modèle Looping (colonne `prestataire`, rôles, images)

## Auteur

Projet réalisé par Julien dans le cadre du projet fil rouge de la formation Développeur Fullstack.


