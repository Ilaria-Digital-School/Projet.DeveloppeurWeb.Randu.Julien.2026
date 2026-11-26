# ResaHôtel.com

ResaHôtel.com est une application web de réservation d'hôtels en région parisienne. Elle permet de consulter les hôtels et les chambres, de créer un compte, de gérer son profil, de réserver une chambre et d'administrer le catalogue selon le rôle de l'utilisateur.

## Fonctionnalités

- Consultation du catalogue des hôtels et des chambres
- Recherche d'hôtels
- Inscription et connexion avec jeton JWT
- Gestion du profil utilisateur
- Réservation et consultation des disponibilités
- Gestion du panier et du paiement côté interface
- Gestion des hôtels et des chambres pour les prestataires et les administrateurs
- Gestion des utilisateurs pour les administrateurs
- Trois rôles : `client`, `prestataire` et `admin`

## Technologies

- Front-end : HTML5, CSS3, JavaScript, Bootstrap
- API : Python 3 et Flask
- API alternative : serveur HTTP Python standard
- Base de données : MySQL
- Sécurité : bcrypt pour les mots de passe et JWT pour les sessions
- Dépendances Python : Flask, mysql-connector-python, PyJWT, bcrypt, python-dotenv

## Structure du projet

```text
.
|-- index.html
|-- Pages/                 # Pages du site
|-- assets/
|   |-- CSS/               # Feuilles de style
|   |-- Images/            # Images du catalogue
|   `-- js/                # Scripts JavaScript et appels API
|-- backend/
|   |-- app.py             # API Flask
|   |-- server.py          # API sans framework
|   |-- database.py        # Connexion MySQL
|   |-- securite.py        # JWT et autorisations
|   |-- admin.py           # Création d'un administrateur
|   `-- reset_admin.py     # Modification du mot de passe admin
|-- resahotel_complet.sql   # Structure et données MySQL
|-- requirements.txt
`-- README.md
```

## Prérequis

- Python 3.10 ou supérieur
- MySQL ou MariaDB
- Un navigateur web moderne

## Installation

### 1. Installer les dépendances Python

Depuis la racine du projet :

```powershell
py -m pip install -r requirements.txt
```

### 2. Importer la base de données

Créez la base et importez le fichier SQL avec MySQL Workbench ou depuis un terminal :

```powershell
mysql -u root -p < resahotel_complet.sql
```

Le script crée la base `resahotel` ainsi que ses tables et ses données initiales.

### 3. Configurer les variables d'environnement

Créez un fichier `backend/.env` contenant :

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=resahotel
JWT_SECRET=une_cle_secrete_unique_d_au_moins_32_caracteres
```

Ne versionnez jamais le fichier `.env` et ne partagez pas sa valeur.

## Démarrage

### Option 1 : lancer l'API Python standard

Dans un premier terminal :

```powershell
cd backend
py server.py
```

L'API démarre sur `http://localhost:8000`.

Dans un second terminal, servez le front-end depuis la racine du projet :

```powershell
py -m http.server 5500
```

Puis ouvrez `http://localhost:5500`.

Le fichier [assets/js/api.js](assets/js/api.js) est déjà configuré pour utiliser le port `8000`.

### Option 2 : lancer l'API avec Flask

Dans un premier terminal :

```powershell
cd backend
py app.py
```

L'API Flask démarre sur `http://localhost:5000`.

Dans [assets/js/api.js](assets/js/api.js), remplacez temporairement :

```javascript
const API_URL = "http://localhost:8000";
```

par :

```javascript
const API_URL = "http://localhost:5000";
```

Puis servez le front-end sur le port `5500` avec `py -m http.server 5500`.

## Comptes et rôles

- `client` : consulte son profil et crée des réservations
- `prestataire` : peut gérer les hôtels et chambres auxquels il a accès
- `admin` : peut gérer les hôtels, chambres, réservations et utilisateurs

Pour créer un administrateur :

```powershell
cd backend
py admin.py
```

Pour modifier le mot de passe d'un administrateur existant :

```powershell
cd backend
py reset_admin.py
```

## Principales routes API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/` | Vérification de l'API |
| `GET` | `/hotels` | Liste des hôtels |
| `POST` | `/hotels` | Création d'un hôtel |
| `GET` | `/chambres` | Liste des chambres |
| `GET` | `/disponibilites/<hotel>/<chambre>` | Périodes occupées |
| `GET` | `/reservations` | Réservations accessibles |
| `POST` | `/reservations` | Création d'une réservation |
| `POST` | `/inscription` | Création d'un compte |
| `POST` | `/connexion` | Connexion et récupération du JWT |
| `GET` | `/profil` | Profil connecté |
| `PATCH` | `/profil` | Modification du profil |
| `GET` | `/utilisateurs` | Liste des utilisateurs pour l'administrateur |

Les routes protégées utilisent l'en-tête HTTP :

```text
Authorization: Bearer <jeton_jwt>
```
