#concerne la base de données chambre

import mysql.connector
from database import lire, ecrire

CHAMPS = ["numero", "type", "capacite", "tarif", "description","image"]

#la capacité doit etre un chiffre en 1 et 10
def capacite_valide(valeur):
    if isinstance(valeur,bool) or not isinstance(valeur,int):
        return False
    return 1 <= valeur <=10


#Le tarif doit etre supérieur à 0

def tarif_valide(valeur):
    if isinstance(valeur,bool) or not isinstance(valeur,int):
        return False
    return valeur > 0

def verifier_valeurs(donnees):
    if "capacite" in donnees and not capacite_valide(donnees["capacite"]):
        return "La Capacite doit etre un chiffre entre 1 et 10"
    if "tarif" in donnees and not tarif_valide(donnees["tarif"]):
        return "Le tarif doit etre un chiffre positif"
    return None


def hotel_existe(id_hotel):
    lignes = lire("SELECT hotel * FROM hotel WHERE hotel=%s", (id_hotel,))
    return len(lignes) > 0

# permets de trouver la chambre en fonction de l'hotel ou None si introuvable/inexistante 
def trouver_chambre(id_hotel, id_chambre):
    lignes=lire("SELECT * FROM chambre WHERE hotel =%s AND chambre = %s",(id_hotel, id_chambre))
    if len(lignes)==0:
        return None
    return lignes[0]

#GET 
def lister_chambre():
    return 200, lire("SELECT * FROM chambre")

def chambre_hotel(id_hotel):
    if not hotel_existe(id_hotel):
        return 404, {"error": "Hôtel introuvable !"}
    return 200, lire("SELECT * FROM chambre WHERE hotel = %s", (id_hotel,))

def une_chambre(id_hotel, id_chambre):
    chambre = trouver_chambre(id_hotel, id_chambre)
    if chambre is None:
        return 404, {"error", "Chambre Introuvable !"}
    return 200, chambre

#POST
def creer_chambre(donnees):
    if donnees is None:
        return 400, {"error": "Donnée invalide !"}
    
    requis = ["hotel", "chambre"] + CHAMPS
    manquants = [champ for champ in requis if champ not in donnees]
    if len(manquants) > 0 :
        return 400,{"error":"Champs manquants", "champs":manquants}
    
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error":message} 
    
    if not hotel_existe(donnees["hotel"]):
        return 400, {"error": "Cet hôtel n'existe pas !"}

    
    colonnes=",".join(requis)
    marqueurs=",".join(["%s"] * len(requis))
    valeurs=[donnees[champ] for champ in requis]
    
    try:
        ecrire(f"INSERT INTO chambre({colonnes}) VALUES ({marqueurs})", valeurs)
    except mysql.connector.IntegrityError:
        return 409, {"error": "Cet chambre existe deja dans cet hôtel !"}
    return 201, trouver_chambre(donnees["hotel"], donnees["chambre"])

#PUT/PATCH

def modifier_chambre(id_hotel, id_chambre, donnees, tout_remplacer):
    if trouver_chambre(id_hotel, id_chambre) is None:
        return 400, {"error": "Chambre introuvable !"}
    
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
        
    message=verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error":message}
        
    
    #permet la modifications des champs 
    
    modifications = ",".join(f"{champ}=%s" for champ in donnees)
    valeurs=list(donnees.values()) + [id_hotel, id_chambre]
    ecrire(f"UPDATE chambre SET {modifications} WHERE hotel = %s AND chambre = %s", valeurs)
    
    return 200, trouver_chambre(id_hotel, id_chambre)

#Delete
def supprimer_chambre(id_hotel, id_chambre):
    if trouver_chambre(id_hotel, id_chambre) is None:
        return 404, {"error":"Chambre Introuvable !"}
    
    try:
        ecrire("DELETE FROM chambre WHERE hotel = %s AND chambre = %s", (id_hotel, id_chambre,))
    except mysql.connector.IntegrityError:
        return 409, {"error":"Supression impossible, des réservation sont liées a cette chambre !"}
    
    return 200, {"message":"Supression reussie !"}