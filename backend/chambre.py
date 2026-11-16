#concerne la base de données chambre

import mysql.connector
from database import lire, ecrire
import securite

CHAMPS = ["numero", "type", "capacite", "tarif", "description","image"]

LONGUEURS_MAX = {"numero": 50, "type": 50, "description": 500, "image": 255}

#la capacité doit etre un chiffre en 1 et 10
def capacite_valide(valeur):
    if isinstance(valeur, bool) or not isinstance(valeur, int):
        return False
    return 1 <= valeur <=10


#Le tarif doit etre supérieur à 0

def tarif_valide(valeur):
    if isinstance(valeur, bool) or not isinstance(valeur, (int, float)):
        return False
    return valeur > 0

def verifier_valeurs(donnees):
    if "capacite" in donnees and not capacite_valide(donnees["capacite"]):
        return "La Capacite doit etre un chiffre entre 1 et 10"
    if "tarif" in donnees and not tarif_valide(donnees["tarif"]):
        return "Le tarif doit etre un chiffre positif"
    for champ, maximum in LONGUEURS_MAX.items():
        if champ not in donnees:
            continue
        if not isinstance(donnees[champ], str):
            return champ + "doit etre un texte"
        if len(donnees[champ]) > maximum:
            return champ + " : " + str(maximum) + "caracteres maximum"
    return None


def hotel_existe(id_hotel):
    lignes = lire("SELECT hotel FROM hotel WHERE hotel = %s", (id_hotel,))
    return len(lignes) > 0

#renvoie le propriétaire de l'hotel (si défini)
def proprietaire_hotel(id_hotel):
    lignes = lire("SELECT prestataire FROM hotel WHERE hotel = %s", (id_hotel,))
    if len(lignes) == 0:
        return None
    return lignes[0]["prestataire"]

# permets de trouver la chambre en fonction de l'hotel ou None si introuvable/inexistante 
def trouver_chambre(id_hotel, id_chambre):
    lignes = lire("SELECT * FROM chambre WHERE hotel = %s AND chambre = %s", (id_hotel, id_chambre))
    if len(lignes) == 0:
        return None
    return lignes[0]

#permets de suivre l'odre de creation des chambre, C001, C002 etc...si libre dans l'hotel concerner 
def prochain_identifiant(id_hotel):
    plus_grand = 0
    for ligne in lire("SELECT chambre FROM chambre WHERE hotel = %s", (id_hotel,)):
        identifiant = ligne["chambre"]
        if isinstance(identifiant, str) and identifiant.startswith("C") and identifiant[1:].isdigit() and len(identifiant) <= 6: 
            plus_grand = max(plus_grand, int(identifiant[1:]))
    return "C" + str(plus_grand +1).zfill(3)
            

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
        return 404, {"error": "Chambre Introuvable !"}
    return 200, chambre

#POST
#Pour la creation un prestataire peux ajouter des chambres uniquement dans son hotel
def creer_chambre(donnees, demandeur=None):
    if donnees is None:
        return 400, {"error": "Donnée invalide !"}
    
    requis = ["hotel"] + CHAMPS
    manquants = [champ for champ in requis if champ not in donnees]
    if len(manquants) > 0:
        return 400, {"error":"Champs manquants", "champs": manquants}
    
    if not isinstance(donnees["hotel"], str):
        return 400, {"error": "hotel doit etre un texte"}
    
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error":message} 
    
    if not hotel_existe(donnees["hotel"]):
        return 400, {"error": "Cet hôtel n'existe pas !"}
    
    est_prestataire = demandeur is not None and demandeur["role"] == securite.ROLE_PRESTATAIRE
    if est_prestataire and proprietaire_hotel(donnees["hotel"]) != demandeur["utilisateurs"]:
        return 403, {"error": "Cet Hôtel ne vous appartient pas, impossible d'y ajouter une chambre !"}
    
    identifiant_impose = None
    if demandeur is None or demandeur["role"] == securite.ROLE_ADMIN:
        identifiant_impose = donnees.get("chambre")
        if identifiant_impose is not None and (not isinstance(identifiant_impose, str) or not 1 <= len(identifiant_impose) <= 50):
            return 400, {"error": "chambre: texte de 1 à 50 caracteres"}

    
    colonnes = ["hotel", "chambre"] + CHAMPS
    marqueurs = ", ".join(["%s"] * len(colonnes))
    
    for essai in range(3):
        identifiant = identifiant_impose or prochain_identifiant(donnees["hotel"])
        valeurs = [donnees["hotel"], identifiant] + [donnees[champ] for champ in CHAMPS]
        try:
            ecrire(f"INSERT INTO chambre({colonnes}) VALUES ({marqueurs})", valeurs)
            return.201, trouver_chambre(donnees["hotel"], identifiant)
        except mysql.connector.IntegrityError:
            if identifiant_impose is not None:
               return 409, {"error": "Cette chambre existe deja dans cet hôtel !"}
    return 409, {"error": "Impossible de cree la chambre pour le moment, reessayez plus tard"}

#PUT/PATCH admin

def modifier_chambre(id_hotel, id_chambre, donnees, tout_remplacer):
    if trouver_chambre(id_hotel, id_chambre) is None:
        return 404, {"error": "Chambre introuvable !"}
    
    if not donnees:
        return 400, {"error": "Donnees invalides ! "}
    
    #refuse les champs inconnus et identifiant inchangeable 
    
    inconnus = [champ for champ in donnees if champ not in CHAMPS]
    if len(inconnus) > 0:
        return 400,{"error": "Champs non modifiable", "champs": inconnus}
    
    if tout_remplacer:
        manquants = [champ for champ in CHAMPS if champ not in donnees]
        if len(manquants) > 0:
            return 400, {"error": "Tous les champs sont necessaires !", "champs": manquants}
        
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}
        
    
    #permet la modifications des champs 
    
    modifications = ", ".join(f"{champ} = %s" for champ in donnees)
    valeurs = list(donnees.values()) + [id_hotel, id_chambre]
    ecrire(f"UPDATE chambre SET {modifications} WHERE hotel = %s AND chambre = %s", valeurs)
    
    return 200, trouver_chambre(id_hotel, id_chambre)

#Delete admin
def supprimer_chambre(id_hotel, id_chambre):
    if trouver_chambre(id_hotel, id_chambre) is None:
        return 404, {"error": "Chambre Introuvable !"}
    
    try:
        ecrire("DELETE FROM chambre WHERE hotel = %s AND chambre = %s", (id_hotel, id_chambre,))
    except mysql.connector.IntegrityError:
        return 409, {"error": "Suppression impossible, des réservation sont liées a cette chambre !"}
    
    return 200, {"message":"Suppression reussie !"}