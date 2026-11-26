# ResaHôtel.com

ResaHôtel.com is a web application for booking hotels in the Paris region. It allows users to browse hotels and rooms, create an account, manage their profile, book a room, and manage the catalogue according to their user role.

## Features

- Browse hotel and room catalogues
- Search for hotels
- Register and log in using JWT
- Manage user profiles
- View availability periods and create reservations
- Manage the shopping cart and payment interface
- Manage hotels and rooms for providers and administrators
- Manage users for administrators
- Three roles: `client`, `provider`, and `admin`

## Technologies

- Front-end: HTML5, CSS3, JavaScript, Bootstrap
- API: Python 3 and Flask
- Alternative API: standard Python HTTP server
- Database: MySQL
- Security: bcrypt for passwords and JWT for sessions
- Python dependencies: Flask, mysql-connector-python, PyJWT, bcrypt, python-dotenv

## Project Structure

```text
.
|-- index.html
|-- Pages/                 # Website pages
|-- assets/
|   |-- CSS/               # Stylesheets
|   |-- Images/            # Catalogue images
|   `-- js/                # JavaScript files and API calls
|-- backend/
|   |-- app.py             # Flask API
|   |-- server.py          # Framework-free API
|   |-- database.py        # MySQL connection
|   |-- securite.py        # JWT and authorization
|   |-- admin.py           # Administrator creation
|   `-- reset_admin.py     # Administrator password reset
|-- resahotel_complet.sql   # MySQL structure and initial data
|-- requirements.txt
|-- README.md               # French documentation
`-- README_EN.md            # English documentation
```

## Prerequisites

- Python 3.10 or newer
- MySQL or MariaDB
- A modern web browser

## Installation

### 1. Install the Python dependencies

From the project root:

```powershell
py -m pip install -r requirements.txt
```

### 2. Import the database

Create the database and import the SQL file using MySQL Workbench or a terminal:

```powershell
mysql -u root -p < resahotel_complet.sql
```

The script creates the `resahotel` database, its tables, and its initial data.

### 3. Configure environment variables

Create a `backend/.env` file containing:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=resahotel
JWT_SECRET=a_unique_secret_key_with_at_least_32_characters
```

Never commit the `.env` file or share its value.

## Getting Started

### Option 1: Run the standard Python API

In the first terminal:

```powershell
cd backend
py server.py
```

The API starts at `http://localhost:8000`.

In a second terminal, serve the front-end from the project root:

```powershell
py -m http.server 5500
```

Then open `http://localhost:5500`.

The [assets/js/api.js](assets/js/api.js) file is configured to use port `8000`.

### Option 2: Run the Flask API

In the first terminal:

```powershell
cd backend
py app.py
```

The Flask API starts at `http://localhost:5000`.

In [assets/js/api.js](assets/js/api.js), temporarily replace:

```javascript
const API_URL = "http://localhost:8000";
```

with:

```javascript
const API_URL = "http://localhost:5000";
```

Then serve the front-end on port `5500` with `py -m http.server 5500`.

## Accounts and Roles

- `client`: manages their profile and creates reservations
- `provider`: manages the hotels and rooms they have access to
- `admin`: manages hotels, rooms, reservations, and users

To create an administrator:

```powershell
cd backend
py admin.py
```

To change the password of an existing administrator:

```powershell
cd backend
py reset_admin.py
```

## Main API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | API health check |
| `GET` | `/hotels` | List hotels |
| `POST` | `/hotels` | Create a hotel |
| `GET` | `/chambres` | List rooms |
| `GET` | `/disponibilites/<hotel>/<room>` | Occupied periods |
| `GET` | `/reservations` | Accessible reservations |
| `POST` | `/reservations` | Create a reservation |
| `POST` | `/inscription` | Create an account |
| `POST` | `/connexion` | Log in and receive a JWT |
| `GET` | `/profil` | Logged-in user profile |
| `PATCH` | `/profil` | Update the profile |
| `GET` | `/utilisateurs` | List users for administrators |

Protected routes require the following HTTP header:

```text
Authorization: Bearer <jwt_token>
```
