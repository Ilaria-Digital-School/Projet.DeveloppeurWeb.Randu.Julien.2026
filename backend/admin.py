import bcrypt
from getpass import getpass
from database import ecrire

email = input("Email de l'administrateur :")
mot_de_passe=getpass("Mot de passe(8 caractères minimum) : ")

if len(mot_de_passe) < 8:
    raise SystemExit("Mot de passe trop court")

hash_texte=bcrypt.hashpw(mot_de_passe.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

ecrire("INSERT INTO utilisateur (utilisateurs, nom, prenom, email, mot_de_passe, telephone, role)"
       "VALUES (%s, %s, %s %s, %s, %s, %s", ("Uadmin01", "Randu", "Julien", email, hash_texte, "0605132521", "admin"))

print("administrateur créé avec succés !")