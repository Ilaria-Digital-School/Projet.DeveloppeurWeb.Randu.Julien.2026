import uuid
import bcrypt
from getpass import getpass
from database import lire, ecrire

email = input("Email de l'administrateur :").strip()
nom = input("Nom : ").strip()
prenom = input("prenom : ").strip()
telephone = input("Telephone : ").strip()
mot_de_passe = getpass("Mot de passe(8 caractères minimum) : ")
confirmation = getpass("Confirmer le mot de passe : ")

if "@" not in email or "." not in email or len(email) > 100:
    raise SystemExit("Adresse mail invalide !")

if nom == "" or prenom == "" or telephone == "":
    raise SystemExit("Nom, Prenom et telephone obligatoire !")

if mot_de_passe != confirmation:
    raise SystemExit("Mots de passe differents !")

if len(mot_de_passe) < 8:
    raise SystemExit("8 caracteres minimum")

if len(mot_de_passe.encode("utf-8")) > 72:
    raise SystemExit("Mot de passe trop long !")

if len(lire("SELECT utilisateurs FROM utilisateur WHERE email = %s", (email,))) > 0:
    raise SystemExit("Cet email est deja utilisé !")

hash_texte = bcrypt.hashpw(mot_de_passe.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

identifiant = "U" + uuid.uuid4().hex[:8]

ecrire("INSERT INTO utilisateur (utilisateurs, nom, prenom, email, mot_de_passe, telephone, role)"
       "VALUES (%s, %s, %s %s, %s, %s, %s)", 
       (identifiant, nom, prenom, email, hash_texte, telephone, "admin"))

print("administrateur créé avec succés !", email)