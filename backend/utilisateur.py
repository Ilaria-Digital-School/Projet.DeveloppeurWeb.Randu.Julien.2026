import uuid #uuid evite la creation de doublon d'ID utilisateurs
import bcrypt #crypte le mot de passe hash
import mysql.connector
from database import lire, ecrire
import securite

CHAMPS_INSCRIPTION = ["nom", "prenom", "email", "mot_de_passe", "telephone"]


def sans_mot_de_passe(utilisateur):
    #renvoie une copie de l'utilisateur sans la colonnne mot de passe (securite)
    copie = dict(utilisateur)
    copie.pop("mot_de_passe", None)
    return copie

def verifier_inscription(donnees):
    erreurs = {}
    
    for champ in ["nom", "prenom", "telephone"]:
        valeur = donnees[champ]
        if not isinstance(valeur, str) or valeur.strip() == "" or len(valeur) > 50:
            erreurs[champ] = "Texte de 1 à 50 caracteres"
            
    email = donnees["email"]
    if not isinstance(email,str) or "@" not in email or "." not in email or len(email) > 100:
        erreurs["email"] = "adresse email invalide !"
        
    mot_de_passe = donnees["mot_de_passe"]
    if not isinstance(mot_de_passe, str) or len(mot_de_passe) < 8:
        erreurs["mot_de_passe"] = "8 caracteres minimum"
    elif len(mot_de_passe.encode("utf-8")) > 72:
        erreurs["mot_de_passe"] = "72 octets maximum (limite de bcrypt)" 
        
    return erreurs

#POST / inscription
def inscrire(donnees):
    if donnees is None:
        return 400, {"error": "Corps JSON manquant ou invalide"}
 
    manquants = [champ for champ in CHAMPS_INSCRIPTION if champ not in donnees]
    if len(manquants) > 0:
        return 400, {"error": "Champs manquants", "champs": manquants}
 
    erreurs = verifier_inscription(donnees)
    if len(erreurs) > 0:
        return 400, {"error": "Valeurs invalides", "details": erreurs}
 
    # L'email doit être unique
    deja = lire("SELECT utilisateurs FROM utilisateur WHERE email = %s", (donnees["email"],))
    if len(deja) > 0:
        return 409, {"error": "Cet email est déjà utilisé"}
 
    # bcrypt travaille avec des octets
    hash_octets = bcrypt.hashpw(donnees["mot_de_passe"].encode("utf-8"), bcrypt.gensalt())
    hash_texte = hash_octets.decode("utf-8")
 
    identifiant = "U" + uuid.uuid4().hex[:8]     
 
    # Le rôle est TOUJOURS "client" ici, même si le client envoie "role": "admin".
    # Les administrateurs se créent uniquement avec le script admin.py.
    try:
        ecrire("INSERT INTO utilisateur (utilisateurs, nom, prenom, email, mot_de_passe, telephone, role) "
               "VALUES (%s, %s, %s, %s, %s, %s, %s)",
               (identifiant, donnees["nom"], donnees["prenom"], donnees["email"],
                hash_texte, donnees["telephone"], "client"))
    except mysql.connector.IntegrityError:
        return 409, {"error": "Cet email est déjà utilisé"}
 
    lignes = lire("SELECT * FROM utilisateur WHERE utilisateurs = %s", (identifiant,))
    return 201, sans_mot_de_passe(lignes[0])
 
 
# POST /connexion 
def connecter(donnees):
    if donnees is None or "email" not in donnees or "mot_de_passe" not in donnees:
        return 400, {"error": "email et mot_de_passe obligatoires"}
 
    echec = (401, {"error": "Email ou mot de passe incorrect"})
 
    if not isinstance(donnees["email"], str) or not isinstance(donnees["mot_de_passe"], str):
        return echec
 
    lignes = lire("SELECT * FROM utilisateur WHERE email = %s", (donnees["email"],))
    if len(lignes) == 0:
        return echec
    utilisateur = lignes[0]
 
    # checkpw compare le mot de passe saisi avec le hash enregistré.
    # Si le mot de passe n'est pas un hash valide, bcrypt lève une ValueError : on refuse la connexion.
    try:
        correct = bcrypt.checkpw(donnees["mot_de_passe"].encode("utf-8"),
                                 utilisateur["mot_de_passe"].encode("utf-8"))
    except ValueError:
        correct = False
 
    if not correct:
        return echec
    
 
    
    reponse = sans_mot_de_passe(utilisateur)
    reponse["jeton"] = securite.creer_jeton(utilisateur)
 
    return 200, reponse

#GET utilisateurs // Attention a ne pas le laisser sur un vrai projet car il expose certaines informations
def lister_utilisateurs():
        lignes = lire("SELECT utilisateurs, nom, prenom, email, telephone, role FROM utilisateur")
        return 200, lignes