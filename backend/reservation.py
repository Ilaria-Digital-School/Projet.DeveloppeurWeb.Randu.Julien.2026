from datetime import date
import mysql.connector
from database import lire, ecrire
from chambre import trouver_chambre


CHAMPS = ["date_arrivée", "date_depart", "nombre_adulte","nombre_enfant","montant_total", "statut", "chambre", "hotel", "utilisateur"]

STATUTS_VALIDE = ["en attente", "confirmee", "annulee"]
STATUTS_ANNULE = "annulee"

#permets de verifier les informations pour les valeurs rentrées correspondent bien au parametre 

def est_entier_entre(valeur,minimum, maximum):
    if isinstance(valeur, bool) or not isinstance(valeur, int):
        return False
    return minimum <= valeur <= maximum


def est_nombre_positif(valeur):
    if isinstance(valeur, bool) or not isinstance (valeur, (int,float)):
        return False
    return valeur > 0

def est_date(valeur):
    try:
        date.fromisoformat(valeur)
        return True
    except (TypeError, ValueError):
        return False
    
def verifier_valeurs(donnees):
    if "date_arrivee" in donnees and not est_date(donnees["date_arrivee"]):
        return "date_arrivee : format AAAA-MM-JJ"
    
    if "date_depart" in donnees and not est_date(donnees["date_depart"]):
        return "date_depart : format AAAA-MM-JJ"
    
    if "nombre_adulte" in donnees and not est_entier_entre(donnees["nombre_adulte"], 1 ,10):
        return "nombre_adulte doit etre compris entre 1 et 10"
    
    if "nombre_enfant" in donnees and not est_entier_entre(donnees["nombre_enfant"], 0,10):
        return "nombre_enfant doit etre compris entre 0 et 10"
    
    if "montant_total" in donnees and not est_nombre_positif(donnees["montant_total"]):
        return "montant_total doit etre un nombre positif"
    
    if "statut" in donnees and donnees ["statut"] not in STATUTS_VALIDE:
        return "le statut doit etre : " + ",".join(STATUTS_VALIDE)
    return None

def trouver_reservation(identifiant):
    lignes = lire ("SELECT * FROM reservation WHERE reservation = %s", (identifiant))
    if len(lignes) == 0:
        return None
    return lignes [0]

def utilisateurs_existe(identifiant):
    lignes = lire("SELECT utilisateurs FROM utilisateur WHERE utilisateurs = %s",(identifiant))
    return len(lignes) > 0

def verifier_regles(reservation, id_a_exclure=None):
    
    #important, la chambre et l'utilisateur doivent existés sinon il y aura un conflit
    if trouver_chambre(reservation["hotel"], reservation["chambre"]) is None:
        return 400, "Cette chambre n'existe pas dans cet Hôtel"
    if not utilisateurs_existe(reservation["utilisateurs"]):
        return 400, "Cet utilisateur n'existe pas"
    
    #la date de départ doit etre apres la date d'arrivée
    arrivee=str(reservation["date_arrivee"])
    depart = str(reservation["date_depart"])
    if date.fromisoformat(depart) <= date.fromisoformat(arrivee):
        return 409, "La date de départ doit etre apres la date d'arrivee"
    
    #une chambre annulée ne bloque pas la reservation 
    if reservation["statut"] == STATUTS_ANNULE:
        return None
    
    #permets de ne pas avoir de reservation en meme temps mais permets une resevation avec des dates qui se chevauche 
    sql = ("SELECT reservation FROM reservation" "WHERE hotel = %s AND chambre = %s" 
           "AND statut <> %s" "AND date_arrivee < %s AND date_depart > %s")
    valeurs = [reservation["hotel"], reservation["chambre"], STATUTS_ANNULE, depart, arrivee]
    if id_a_exclure is not None:
        sql += "AND reservation <> %s"
        valeurs.append(id_a_exclure)
        
    if len(lire(sql, valeurs)) > 0:
        return 409, "Cette chambre est deja reserver sur la periode selectionnee"
    
    return None

#GET reservation
def lister_reservation():
    return 200, lire("SELECT * FROM reservation")

def une_reservation(identifiant):
    reservation = trouver_reservation(identifiant)
    if reservation is None:
        return 404, {"error":"Reservaton introuvable !"}
    return 200, reservation


#POST reservation
def creer_reservation(donnees):
    if donnees is None:
        return 404, {"error": "donnee introuvable !"}
    
    requis = ["reservation"] + CHAMPS
    manquants = [champ for champ in requis if champ not in donnees]
    if len(manquants) > 0:
        return 400, {"error":"champs manquants", "champs": manquants}
    
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}
    
    probleme = verifier_regles(donnees)
    if probleme is not None:
        statusCode, message = probleme
        return statusCode, {"error":message}
    
    #permets la creation de la reservation en evitant les doublons d'ID de resa
    
    colonnes = ",".join(requis)
    marqueurs = ",".join(["%s"] * len(requis))
    valeurs = [donnees[champ] for champ in requis]
    
    try:
        ecrire(f"INSERT INTO reservation ({colonnes}) VALUES ({marqueurs})", valeurs)
    except mysql.connector.IntegrityError:
        return 409, {"error":"cet identifiant de reservation existe deja !"}
    return 201, trouver_reservation(donnees["reservation"])

#PUT / PATCH
def modifier_reservation(identifiant, donnees, tout_remplacer):
    
    ancienne = trouver_reservation(identifiant)
    if ancienne is None:
        return 404, {"error": "reservation introuvable"}
    
    if not donnees:
        return 400, {"error": "donnee introuvable"}
    
    inconnus = [champ for champ in donnees if champ not in CHAMPS]
    if len(inconnus) > 0:
        return 400,{"error" : "champs non modifiables", "champs": inconnus}
    
    if tout_remplacer:
        manquants = [champ for champ in CHAMPS if champ not in donnees]
        if len(manquants) > 0:
            return 400, {"error": "PUT exige tous les champs", "champs": manquants}
        
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}
    
    complete = dict(ancienne)
    complete.update(donnees)
    probleme = verifier_regles(complete, id_a_exclure = identifiant)
    if probleme is not None:
        statusCode, message = probleme
        return statusCode, {"error": message}
    
    modifications = ",".join(f"{champ} = %s" for champ in donnees)
    valeurs = list(donnees.values()) + [identifiant]
    ecrire(f"UPDATE reservation SET {modifications} WHERE reservation = %s", valeurs)
    
    return 200, trouver_reservation(identifiant)

#DELETE
def supprimer_reservation(identifiant):
    if trouver_reservation(identifiant) is None:
        return 404, {"error":" Reservation introuvable !"}
    
    try:
        ecrire("DELETE FROM reservation WHERE reservation = %s", (identifiant))
    except mysql.connector.IntegrityError:
        return 409, {"error": "supression impossible : un paiement est en cours"}
    return 200, {"message": "Reservation supprimee avec succes !"}
