import bcrypt
from getpass import getpass
from database import lire, ecrire

email = input("Email de l'administrateur :").strip

#verifier mail de l'admin
admins = lire("SELECT utilisateurs FROM utilisateur WHERE email = %s AND role = %s", (email, "admin"))
if len(admins) == 0:
    raise SystemExit("Administrateur inconnu !")

mot_de_passe = getpass("Nouveau mot de passe: ")
confirmation = getpass("Confirmer le mot de passe: ")

if mot_de_passe != confirmation:
    raise SystemExit("Les deux mots de passe sont differents !")
if len(mot_de_passe) < 8:
    raise SystemExit("Minimum 8 caracteres !")
if len(mot_de_passe.encode("utf-8")) > 72:
    raise SystemExit("Mot de passe trop long !")

hash_texte = bcrypt.hashpw(mot_de_passe.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

ecrire("UPDATE utilisateur SET mot_de_passe = %s WHERE utilisateurs = %s", (hash_texte, admins[0]["utilisateurs"]))

print("Mot de passe mis a jour avce succés !")
