import os
import time
import jwt
from dotenv import load_dotenv

load_dotenv()

DUREE_JETON = 60 * 60

#Les Trois roles:
ROLE_CLIENT = "client"
ROLE_PRESTATAIRE = "prestataire"
ROLE_ADMIN = "admin"

#permet de choisir son role a l'inscription prestataire ou client, admin ne s'affiche pas. Il se cree depuis admin.py
#allows users to choose their role during registration—service provider or client; 'admin' is not displayed as an option. Admin accounts are created via admin.py
ROLES_INSCRIPTION = [ROLE_CLIENT, ROLE_PRESTATAIRE]

ECRITURES = ["POST", "PUT", "PATCH", "DELETE"]

PROTECTION_ACTIVATE = True #False pour le desactivé / False to disable it

def cle_secrete():
    cle = os.getenv("JWT_SECRET")
    if not cle or len(cle) < 32:
        raise RuntimeError("JWT_SECRET manquante ou trop courte (32 caracteres minimum) dans le fichier .env")
    return cle

def creer_jeton(utilisateur):
    maintenant = int(time.time())
    contenu = {
        "sub": utilisateur["utilisateurs"],
        "role": utilisateur["role"],
        "iat": maintenant,
        "exp": maintenant + DUREE_JETON,
    }
    return jwt.encode(contenu, cle_secrete(), algorithm="HS256")

def verifier_jeton(jeton):
    try:
        contenu = jwt.decode(jeton, cle_secrete(), algorithms=["HS256"], 
                             options={"require": ["exp", "sub", "role"]})
    except jwt.InvalidTokenError:
        return None
    
    return {"utilisateurs": contenu["sub"], "role": contenu["role"]}    


def lire_jeton(valeur_authorization):
    
    if not valeur_authorization or not valeur_authorization.startswith("Bearer "):
        return None
    jeton = valeur_authorization[len("Bearer "):]
    return verifier_jeton(jeton)

def verifier_droits(utilisateur, roles_autorises):
    
    if utilisateur is None: 
     return 401, {"error": "Connexion requise !"}
 
    if utilisateur["role"] not in roles_autorises:
        return 403, {"error": "Droits insuffisants"}
    return None

#Regles en fonction du role / 
#Rules based on role

def regle_route(methode, morceaux):
    premier = morceaux[0] if len(morceaux) > 0 else ""
    if methode == "OPTIONS":
        return None, False
    if premier in ("hotels", "chambres") and methode in ECRITURES:
        if methode == "POST":
            return [ROLE_PRESTATAIRE, ROLE_ADMIN], True
        return [ROLE_ADMIN], True
    if premier == "mes-hotels":
        return [ROLE_PRESTATAIRE, ROLE_ADMIN], False
    if premier == "reservations":
        if methode == "POST":
            return [ROLE_CLIENT], False
        if methode in ("GET", "PUT", "PATCH", "DELETE"):
            return [ROLE_CLIENT, ROLE_ADMIN], False
    if premier == "profil" and methode in ("GET", "PATCH"):
        return [ROLE_CLIENT, ROLE_PRESTATAIRE, ROLE_ADMIN], False
    if premier == "utilisateurs" and methode == "GET":
        return [ROLE_ADMIN], False
    return None, False

#lit le jeton et donne l'acces en fonction du role / 
#reads the token and grants access based on the role
def controler_acces(methode, morceaux, valeur_authorization):
    demandeur = lire_jeton(valeur_authorization)
    roles, soumis_a_l_interrupteur = regle_route(methode, morceaux)
    if roles is None:
        return demandeur, None
    if soumis_a_l_interrupteur and not PROTECTION_ACTIVATE:
        return demandeur, None
    return demandeur, verifier_droits(demandeur, roles)
    
