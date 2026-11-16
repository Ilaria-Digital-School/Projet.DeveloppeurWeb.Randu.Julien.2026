import uuid #uuid evite la creation de doublon d'ID utilisateurs
import bcrypt #crypte le mot de passe hash
import mysql.connector
from database import lire, ecrire
import securite

CHAMPS_INSCRIPTION = ["nom", "prenom", "email", "mot_de_passe", "telephone"]
GENRES_VALIDES = ["femme", "homme"]
PAYS_VALIDES = ["France", "Portugais", "Anglais", "Autre"]
INTERETS_VALIDES = ["Hôtels 5*", "Hôtel 4*", "spa"]
CHAMPS_PROFIL = ["nom", "prenom", "email", "telephone", "genre", "pays", "interets"]
COLONNES_PUBLIQUES = "utilisateurs, nom, prenom, email, telephone, role, genre, pays, interets"

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

def erreur_champ(champ, valeur):
    if champ in ("nom", "prenom", "telephone"):
        if not isinstance(valeur, str) or valeur.strip() == "" or len(valeur) > 50:
            return "Texte de 1 à 50 caracteres"
        
    elif champ == "email":
        if not isinstance(valeur, str) or "@" not in valeur or "." not in valeur or len(valeur) > 100:
            return "adresse email invalide !"
        
    elif champ == "mot_de_passe":
        if not isinstance(valeur, str) or len(valeur) < 8:
            return "8 caracteres minimum"
        if len(valeur.encode("utf-8")) > 72:
            return "72 octets maximum (limite de bcrypt)"
        
    elif champ == "genre":
        if valeur is not None and valeur not in GENRES_VALIDES:
            return "doit etre : " + ", ".join(GENRES_VALIDES)
        
    elif champ == "pays":
        if valeur is not None and valeur not in PAYS_VALIDES:
            return " doit etre : " + ", ".join(PAYS_VALIDES)
        
    elif champ == "interets":
        if valeur is not None and (not isinstance(valeur, list)
                                   or any(i not in INTERETS_VALIDES for i in valeur)
                                   or len(set(valeur)) != len(valeur)):
            return "liste de valeur parmi :" + ", ".join(INTERETS_VALIDES)
        
    elif champ == "role":
        if valeur not in securite.ROLES_INSCRIPTION:
            return "doit etre :" +", ".join(securite.ROLES_INSCRIPTION)
        
    return None
        

def verifier_inscription(donnees):
    erreurs = {}
    for champ in CHAMPS_INSCRIPTION + ["genre", "pays", "interets"]:
        if champ in donnees:
            message = erreur_champ(champ, donnees[champ])
            if message is not None:
                erreurs[champ] = message
        
    if donnees.get("role") is not None:
        message = erreur_champ("role", donnees["role"])
        if message is not None:
            erreurs["role"] = message
    return erreurs

def interets_en_texte(interets):
    return ",".join(interets) if interets else None

#compare les mots de passe hash
def mot_de_passe_correct(mot_de_passe, hash_enregistre):
    try:
        return bcrypt.checkpw(mot_de_passe.encode("utf-8"), hash_enregistre.encode("utf-8"))
    except ValueError:
        return False


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
    hash_texte = bcrypt.hashpw(donnees["mot_de_passe"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
 
    identifiant = "U" + uuid.uuid4().hex[:8]    
    
    role = donnees.get("role") or securite.ROLE_CLIENT 

 
    # Le rôle est TOUJOURS "client" ici, même si le client envoie "role": "admin".
    # Les administrateurs se créent uniquement avec le script admin.py.
    try:
        ecrire("INSERT INTO utilisateur (utilisateurs, nom, prenom, email, mot_de_passe, telephone, role, genre, pays, interets) "
               "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
               (identifiant, donnees["nom"], donnees["prenom"], donnees["email"],
                hash_texte, donnees["telephone"], role,
                donnees.get("genre"), donnees.get("pays"), interets_en_texte(donnees.get("interets"))))
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
    
    if not mot_de_passe_correct(donnees["mot_de_passe"], utilisateur["mot_de_passe"]):
        return echec
    
    reponse = preparer_utilisateur(utilisateur)
    reponse["jeton"] = securite.creer_jeton(utilisateur)
    return 200, reponse

#GET / Profil
def un_profil(demandeur):
    lignes = lire("SELECT " + COLONNES_PUBLIQUES + " FROM utilisateur WHERE utilisateurs = %s", (demandeur["utilisateurs"],))
    if len(lignes) == 0:
        return 404, {"error": "Compte introuvable !"}
    return 200, preparer_utilisateur(lignes[0])

#PUT/PATCH pour modification du profil
#permets de modifier les elements du profil
def modifier_profil(demandeur, donnees):
    if not donnees:
        return 400, {"error": "Données invalide"}
    
    autorises = CHAMPS_PROFIL + ["mot_de_passe_actuel", "nouveau_mot_de_passe"]
    inconnus = [champ for champ in donnees if champ not in autorises]
    if len(inconnus) > 0:
        return 400, {"error": "champs non modifiables", "champs": inconnus}
    
    lignes = lire("SELECT * FROM utilisateur WHERE utilisateurs = %s", (demandeur["utilisateurs"],))
    if len(lignes) == 0:
        return 404, {"error": "compte introuvable !"}
    actuel = lignes[0]
    
    erreurs = {}
    for champ in CHAMPS_PROFIL:
        if champ in donnees:
            message = erreur_champ(champ, donnees[champ])
            if message is not None:
                erreurs[champ] = message
                
    if "nouveau_mot_de_passe" in donnees:
        message = erreur_champ("mot_de_passe", donnees["nouveau_mot_de_passe"])
        if message is not None:
            erreurs["nouveau_mot_de_passe"] = message
            
    if len(erreurs) > 0:
        return 400, {"error": "Valeurs invalides", "details": erreurs}
    
    changement_email = "email" in donnees and donnees["email"] != actuel["email"]
    changement_mot_de_passe = "nouveau_mot_de_passe" in donnees
    
    if changement_email or changement_mot_de_passe:
        saisi = donnees.get("mot_de_passe_actuel")
        if not isinstance(saisi, str) or not mot_de_passe_correct(saisi, actuel["mot_de_passe"]):
            return 403, {"error": "Mot de passe actuel incorrect (obligatoire pour changer l'email ou le mot de passe)"}
        
    if changement_email:
        pris = lire("SELECT utilisateurs FROM utilisateur WHERE email = %s AND utilisateurs <> %s",
                        (donnees["email"], demandeur["utilisateurs"]))
        if len(pris) > 0:
             return 409, {"error": "Cet email est deja utilisé !"}
         
    modifs = {}
    for champ in CHAMPS_PROFIL:
        if champ in donnees:
            modifs[champ] = interets_en_texte(donnees[champ]) if champ == "interets" else donnees[champ]
    if changement_mot_de_passe:
        modifs["mot_de_passe"] = bcrypt.hashpw(donnees["nouveau_mot_de_passe"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
    if len(modifs) == 0:
        return 400, {"error": "Aucune modification demandée"}
    
    modifications = ", ".join(f"{colonne} = %s" for colonne in modifs)
    try:
        ecrire(f"UPDATE utilisateur SET {modifications} WHERE utilisateurs = %s", list(modifs.values()) + [demandeur["utilisateurs"]])
    except mysql.connector.IntegrityError:
        return 409, {"error": "Cet email est deja utilisé !"}
    return un_profil(demandeur)


#GET utilisateurs // Attention a ne pas le laisser sur un vrai projet car il expose certaines informations
def lister_utilisateurs():
        lignes = lire("SELECT" + COLONNES_PUBLIQUES + "FROM utilisateur")
        return 200, [preparer_utilisateur(ligne) for ligne in lignes]