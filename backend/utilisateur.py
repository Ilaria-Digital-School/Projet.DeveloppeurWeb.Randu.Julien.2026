import uuid #uuid evite la creation de doublon d'ID utilisateurs
import bcrypt #crypte le mot de passe hash
import mysql.connector
from database import lire, ecrire
import securite

CHAMPS_INSCRIPTION = ["nom", "prenom", "email", "mot_de_passe", "telephone"]
GENRES_VALIDES = ["femme", "homme"]
PAYS_VALIDES = ["France", "Portugais", "Anglais", "Autre"]
INTERETS_VALIDES = ["Hôtel 5*", "Hôtel 4*", "spa"]

def sans_mot_de_passe(utilisateur):
    #renvoie une copie de l'utilisateur sans la colonnne mot de passe (securite)
    copie = dict(utilisateur)
    copie.pop("mot_de_passe", None)
    return copie

def preparer_utilisateur(ligne):
    copie = sans_mot_de_passe(ligne)
    texte = copie.get("interets")
    copie["interets"] = texte.split(",") if texte else []
    return copie

def verifier_inscription(donnees):
    erreurs = {}
    
    for champ in ["nom", "prenom", "telephone"]:
        valeur = donnees[champ]
        if not isinstance(valeur, str) or valeur.strip() == "" or len(valeur) > 50:
            erreurs[champ] = "Texte de 1 à 50 caracteres"
            
    email = donnees["email"]
    if not isinstance(email, str) or "@" not in email or "." not in email or len(email) > 100:
        erreurs["email"] = "adresse email invalide !"
        
    mot_de_passe = donnees["mot_de_passe"]
    if not isinstance(mot_de_passe, str) or len(mot_de_passe) < 8:
        erreurs["mot_de_passe"] = "8 caracteres minimum"
    elif len(mot_de_passe.encode("utf-8")) > 72:
        erreurs["mot_de_passe"] = "72 octets maximum (limite de bcrypt)" 
        
    genre = donnees.get("genre")
    if genre is not None and genre not in GENRES_VALIDES:
        erreurs["genre"] = "doit etre :" + ", ".join(GENRES_VALIDES)
        
    pays = donnees.get("pays")
    if pays is not None and pays not in PAYS_VALIDES:
        erreurs["pays"] = "doit etre : " + ", ".join(PAYS_VALIDES)
        
    interets = donnees.get("interets")
    if interets is not None:
        if (not isinstance(interets, list)
                or any(i not in INTERETS_VALIDES for i in interets)
                or len(set(interets)) != len(interets)):
            erreurs["interets"] = "liste de valeurs parmi : " + ", ".join(INTERETS_VALIDES)
        
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
    
    genre = donnees.get("genre")
    pays = donnees.get("pays")
    interets = donnees.get("interets")
    interets_texte = ",".join(interets) if interets else None
 
    # Le rôle est TOUJOURS "client" ici, même si le client envoie "role": "admin".
    # Les administrateurs se créent uniquement avec le script admin.py.
    try:
        ecrire("INSERT INTO utilisateur (utilisateurs, nom, prenom, email, mot_de_passe, telephone, role, genre, pays, interets) "
               "VALUES (%s, %s, %s, %s, %s, %s, %s)",
               (identifiant, donnees["nom"], donnees["prenom"], donnees["email"],
                hash_texte, donnees["telephone"], "client", genre, pays, interets_texte))
    except mysql.connector.IntegrityError:
        return 409, {"error": "Cet email est déjà utilisé"}
 
    lignes = lire("SELECT * FROM utilisateur WHERE utilisateurs = %s", (identifiant,))
    return 201, preparer_utilisateur(lignes[0])
 
 
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
    
 
    
    reponse = preparer_utilisateur(utilisateur)
    reponse["jeton"] = securite.creer_jeton(utilisateur)
    return 200, reponse

#GET utilisateurs // Attention a ne pas le laisser sur un vrai projet car il expose certaines informations
def lister_utilisateurs():
        lignes = lire("SELECT utilisateurs, nom, prenom, email, telephone, role, genre, pays, interets FROM utilisateur")
        return 200, [preparer_utilisateur(ligne) for ligne in lignes]