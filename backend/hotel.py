#concerne la base de données Hôtel

import mysql.connector
from database import lire, ecrire

CHAMPS = ["nom", "nombre_etoiles", "description", "adresse", "code_postale","ville","pays","image"]

#les etoiles doivent etre un nombre en 1 et 5
def etoiles_valides(valeur):
    if isinstance(valeur,bool) or not isinstance(valeur,int):
        return False
    return 1 <= valeur <=5

#permets de trouver l'hotel demander. Renvoie None si l'hotel est introuvable ou n'existe pas
def trouver_hotel(identifiant):
    lignes = lire("SELECT * FROM hotel WHERE hotel=%s", (identifiant,))
    if len(lignes)==0:
        return None
    return lignes[0]

#GET 
def lister_hotels():
    return 200, lire("SELECT * FROM hotel")

def un_hotel(identifiant):
    hotel = trouver_hotel(identifiant)
    if hotel is None:
        return 404, {"error": "Hôtel introuvable !"}
    return 200, hotel

#POST
def creer_hotel(donnees):
    if donnees is None:
        return 400, {"error": "Donnée invalide !"}
    
    requis = ["hotel"] + CHAMPS
    manquants = [champ for champ in requis if champ not in donnees]
    if len(manquants) > 0 :
        return 400,{"error":"Champs manquants", "champs":manquants}
    
    if not etoiles_valides(donnees["nombre_etoiles"]):
        return 400, {"error": "nombre_etoiles doit etre un chffre entre 1 et 5 !"}
    
    colonnes=",".join(requis)
    marqueurs=",".join(["%s"] * len(requis))
    valeurs=[donnees[champ] for champ in requis]
    
    try:
        ecrire(f"INSERT INTO hotel({colonnes}) VALUES ({marqueurs})", valeurs)
    except mysql.connector.IntegrityError:
        return 409, {"error": "Cet Hôtel existe deja !"}
    return 201, trouver_hotel(donnees["hotel"])

#PUT/PATCH

def modifier_hotel(identifiant, donnees, tout_remplacer):
    if trouver_hotel(identifiant) is None:
        return 400, {"error": "Hôtel introuvable !"}
    
    if not donnees:
        return 400, {"error":"Donnees invalides ! "}
    
    #refuse les champs inconnus et identifiant inchangeable 
    
    inconnus = [champ for champ in donnees if champ not in CHAMPS]
    if len(inconnus) > 0:
        return 400,{"error":"Champs non modifiable","champs":inconnus}
    
    if tout_remplacer:
        manquants = [champ for champ in CHAMPS if champ not in donnees]
        if len(manquants)>0:
            return 400, {"error":"Tout les champs sont necessaires !", "champs":manquants}
        
    if "nombre_etoiles" in donnees and not etoiles_valides(donnees["nombre_etoiles"]):
        return 400, {"error":"nombre_etoiles doit etre un chiffre entre 1 et 5"}
    
    #permet la modifications des champs 
    
    modifications = ",".join(f"{champ}=%s" for champ in donnees)
    valeurs=list(donnees.values()) + [identifiant]
    ecrire(f"UPDATE hotel SET {modifications} WHERE hotel = %s", valeurs)
    
    return 200, trouver_hotel(identifiant)

#Delete
def supprimer_hotel(identifiant):
    if trouver_hotel(identifiant) is None:
        return 404, {"error":"Hôtel Introuvable !"}
    
    try:
        ecrire("DELETE FROM hotel WHERE hotel = %s", (identifiant,))
    except mysql.connector.IntegrityError:
        return 409, {"error":"Supression impossible, des données sont liés a cet hôtel !"}
    
    return 200, {"message":"Supression reussie !"}