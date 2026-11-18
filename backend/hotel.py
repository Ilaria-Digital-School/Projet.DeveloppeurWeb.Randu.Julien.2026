#concerne la base de données Hôtel

import mysql.connector
from database import lire, ecrire
import securite

CHAMPS = ["nom", "nombre_etoiles", "description", "adresse", "code_postale", "ville", "pays", "image"]

COLONNES_PUBLIQUES = ["hotel"] + CHAMPS
SELECT_PUBLIC = "SELECT " + ", ".join(COLONNES_PUBLIQUES) + " FROM hotel"

LONGUEURS_MAX = {"nom": 50, "description": 500, "adresse": 50, "code_postale": 50, "ville": 50, "pays": 50, "image": 255}
OBLIGATOIRE_NON_VIDES = ["nom", "adresse", "code_postale", "ville", "pays"]

#les etoiles doivent etre un nombre en 1 et 5
def etoiles_valides(valeur):
    if isinstance(valeur, bool) or not isinstance(valeur, int):
        return False
    return 1 <= valeur <=5

def verifier_valeurs(donnees):
    if "nombre_etoiles" in donnees and not etoiles_valides(donnees["nombre_etoiles"]):
        return "Le nombre d'etoile doit etre entre 1 et 5"
    for champ, maximum in LONGUEURS_MAX.items():
        if champ not in donnees:
            continue
        valeur = donnees[champ]
        if not isinstance(valeur, str):
            return champ + "doit etre un texte"
        if len(valeur) > maximum:
            return champ + " : " + str(maximum) + " caracteres maximum"
        if champ in OBLIGATOIRE_NON_VIDES and valeur.strip() == "":
            return champ + " ne peut pas etre vide"
    return None

def est_admin(demandeur):
    return demandeur is not None and demandeur ["role"] == securite.ROLE_ADMIN

#permets de trouver l'hotel demander. Renvoie None si l'hotel est introuvable ou n'existe pas
def trouver_hotel(identifiant):
    lignes = lire("SELECT * FROM hotel WHERE hotel = %s", (identifiant,))
    if len(lignes) == 0:
        return None
    return lignes[0]

def prochain_identifiant():
    plus_grand = 0
    for ligne in lire("SELECT hotel FROM hotel"):
        identifiant = ligne["hotel"]
        if isinstance(identifiant, str) and identifiant.startswith("H") and identifiant[1:].isdigit() and len(identifiant) <= 6:
            plus_grand = max(plus_grand, int(identifiant[1:]))
    return "H" + str(plus_grand + 1).zfill(3)

#GET Hotel
def lister_hotels():
    return 200, lire("SELECT * FROM hotel")

def un_hotel(identifiant):
    hotel = trouver_hotel(identifiant)
    if hotel is None:
        return 404, {"error": "Hôtel introuvable !"}
    return 200, hotel

#GET mes hôtels, permets au prestataire de voir ses hotels, l'admin voit tout.

def mes_hotels(demandeur):
    if demandeur is None:
        return 401, {"error": "Connexion requise !"}
    colonnes = ", ".join("h." + c for c in COLONNES_PUBLIQUES)
    sql = ("SELECT " + colonnes + ", h.prestataire, " "u.nom AS prestataire_nom, u.prenom AS prestataire_prenom, u.email AS prestataire_email " "FROM hotel h LEFT JOIN utilisateur u ON u.utilisateurs = h.prestataire ")
    if est_admin(demandeur):
        return 200, lire(sql + "ORDER BY h.hotel")
    return 200, lire(sql + "WHERE h.prestataire = %s ORDER BY h.hotel", (demandeur["utilisateurs"],))

#POST hotel
def creer_hotel(donnees, demandeur=None):
    if donnees is None:
        return 400, {"error": "Donnée invalide !"}
    
    manquants = [champ for champ in CHAMPS if champ not in donnees]
    if len(manquants) > 0:
        return 400, {"error": "champs manquants", "champs": manquants}
    
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}
    
    identifiant_impose = None
    if demandeur is None or est_admin(demandeur):
        identifiant_impose = donnees.get("hotel")
        if identifiant_impose is not None and (not isinstance(identifiant_impose, str) or not 1 <= len(identifiant_impose) <= 50):
            return 400, {"error": "hotel : texte de 1 à 50 caracteres"}
        
    proprietaire = (
        demandeur["utilisateurs"]
        if demandeur is not None and demandeur["role"] == securite.ROLE_PRESTATAIRE
        else None
    )
    colonnes = ["hotel"] + CHAMPS + ["prestataire"]
    marqueurs = ", ".join(["%s"] * len(colonnes))
    
    for essai in range (3):
        identifiant = identifiant_impose or prochain_identifiant()
        valeurs = [identifiant] + [donnees[champ] for champ in CHAMPS] + [proprietaire]
        try:
            ecrire("INSERT INTO hotel (" + ", ".join(colonnes) + ") VALUES (" + marqueurs + ")", valeurs)
            return 201, trouver_hotel(identifiant)
        except mysql.connector.IntegrityError:
            if identifiant_impose is not None:
                return 409, {"error": "Cet identifiant d'hôtel existe deja !"}
    return 409, {"error": "Impossible de creer l'hotel pour le moment, reessayer plus tard"}

#PUT/PATCH admin

def modifier_hotel(identifiant, donnees, tout_remplacer):
    if trouver_hotel(identifiant) is None:
        return 404, {"error": "Hôtel introuvable !"}
    
    if not donnees:
        return 400, {"error": "Donnees invalides ! "}
    
    #refuse les champs inconnus et identifiant inchangeable 
    
    inconnus = [champ for champ in donnees if champ not in CHAMPS]
    if len(inconnus) > 0:
        return 400, {"error": "Champs non modifiable", "champs": inconnus}
    
    if tout_remplacer:
        manquants = [champ for champ in CHAMPS if champ not in donnees]
        if len(manquants) > 0:
            return 400, {"error": "Tout les champs sont necessaires !", "champs": manquants}
        
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}
    
    #permet la modifications des champs 
    
    modifications = ", ".join(f"{champ} = %s" for champ in donnees)
    valeurs = list(donnees.values()) + [identifiant]
    ecrire(f"UPDATE hotel SET {modifications} WHERE hotel = %s", valeurs)
    
    return 200, trouver_hotel(identifiant)

#Delete
def supprimer_hotel(identifiant):
    if trouver_hotel(identifiant) is None:
        return 404, {"error": "Hôtel Introuvable !"}
    
    try:
        ecrire("DELETE FROM hotel WHERE hotel = %s", (identifiant,))
    except mysql.connector.IntegrityError:
        return 409, {"error": "Supression impossible, des données sont liés a cet hôtel !"}
    
    return 200, {"message": "Supression reussie !"}