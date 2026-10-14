import os
import time
import jwt
from dotenv import load_dotenv

load_dotenv()

DUREE_JETON = 60 * 60

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
                             options = {"require": ["exp", "sub", "role"]})
    except jwt.InvalidTokenError:
        return None
    
    return{"utilisateurs": contenu["sub"], "role":contenu["role"]}    


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
