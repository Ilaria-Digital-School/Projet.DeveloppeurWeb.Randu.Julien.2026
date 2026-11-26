from datetime import date
from decimal import Decimal
import uuid
import mysql.connector
from database import lire, ecrire
from chambre import trouver_chambre
import securite


CHAMPS = ["date_arrivee", "date_depart", "nombre_adulte","nombre_enfant","montant_total", "statut", "chambre", "hotel", "utilisateurs"]

STATUTS_VALIDE = ["en attente", "confirmee", "annulee", "reserver", "en cours de traitement"]
STATUTS_ANNULE = "annulee"
CHAMPS_CREATION = ["date_arrivee", "date_depart", "nombre_adulte", "nombre_enfant", "chambre", "hotel"]
CHAMPS_MODIFIABLES_CLIENT = ["date_arrivee", "date_depart", "nombre_adulte", "nombre_enfant"]


def est_administrateur(demandeur):
    return demandeur is not None and demandeur["role"] == securite.ROLE_ADMIN


def calculer_montant(hotel, chambre, arrivee, depart):
    detail_chambre = trouver_chambre(hotel, chambre)
    if detail_chambre is None:
        return None
    nuits = (date.fromisoformat(str(depart)) - date.fromisoformat(str(arrivee))).days
    return (Decimal(str(detail_chambre["tarif"])) * nuits).quantize(Decimal("0.01"))

#permet de vérifier que les valeurs saisies correspondent bien aux paramètres
#allows verification that the entered values correspond correctly to the parameters

def est_entier_entre(valeur, minimum, maximum):
    if isinstance(valeur, bool) or not isinstance(valeur, int):
        return False
    return minimum <= valeur <= maximum


def est_nombre_positif(valeur):
    if isinstance(valeur, bool) or not isinstance(valeur, (int, float)):
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
    
    if "nombre_adulte" in donnees and not est_entier_entre(donnees["nombre_adulte"], 1, 10):
        return "nombre_adulte doit etre compris entre 1 et 10"
    
    if "nombre_enfant" in donnees and not est_entier_entre(donnees["nombre_enfant"], 0, 10):
        return "nombre_enfant doit etre compris entre 0 et 10"
    
    if "montant_total" in donnees and not est_nombre_positif(donnees["montant_total"]):
        return "montant_total doit etre un nombre positif"
    
    if "statut" in donnees and donnees ["statut"] not in STATUTS_VALIDE:
        return "le statut doit etre : " + ", ".join(STATUTS_VALIDE)
    return None

def trouver_reservation(identifiant):
    lignes = lire("SELECT * FROM reservation WHERE reservation = %s", (identifiant,))
    if len(lignes) == 0:
        return None
    return lignes[0]

def utilisateurs_existe(identifiant):
    lignes = lire("SELECT utilisateurs FROM utilisateur WHERE utilisateurs = %s",(identifiant,))
    return len(lignes) > 0

def verifier_regles(reservation, id_a_exclure=None):
    
    #important : la chambre et l'utilisateur doivent exister, sinon il y aura un conflit
    #important, the room and the user must exist; otherwise, a conflict will occur.
    if trouver_chambre(reservation["hotel"], reservation["chambre"]) is None:
        return 400, "Cette chambre n'existe pas dans cet Hôtel"
    if not utilisateurs_existe(reservation["utilisateurs"]):
        return 400, "Cet utilisateur n'existe pas"
    
    #la date de départ doit être après la date d'arrivée / The departure date must be after the arrival date.
    arrivee = str(reservation["date_arrivee"])
    depart = str(reservation["date_depart"])
    if date.fromisoformat(depart) <= date.fromisoformat(arrivee):
        return 409, "La date de départ doit etre apres la date d'arrivee"
    
    #une réservation annulée ne bloque pas une autre réservation / A cancelled reservation does not block another reservation
    if reservation["statut"] == STATUTS_ANNULE:
        return None
    
    #empêche les réservations simultanées tout en permettant des réservations dont les dates se chevauchent
    #prevents simultaneous reservations while allowing reservations with overlapping dates
    sql = ("SELECT reservation FROM reservation " "WHERE hotel = %s AND chambre = %s " 
           "AND statut <> %s " "AND date_arrivee < %s AND date_depart > %s ")
    
    valeurs = [reservation["hotel"], reservation["chambre"], STATUTS_ANNULE, depart, arrivee]
    if id_a_exclure is not None:
        sql += " AND reservation <> %s"
        valeurs.append(id_a_exclure)
        
    if len(lire(sql, valeurs)) > 0:
        return 409, "Cette chambre est deja reserver sur la periode selectionnee"
    
    return None

#Récupère uniquement les périodes occupées d'une chambre sur une plage de dates.
#Returns only the occupied periods for a room within a date range.
def disponibilites_chambre(id_hotel, id_chambre, debut, fin):
    try:
        date_debut = date.fromisoformat(debut)
        date_fin = date.fromisoformat(fin)
    except (TypeError, ValueError):
        return 400, {"error": "Les dates doivent être au format AAAA-MM-JJ"}

    if date_debut.isoformat() != debut or date_fin.isoformat() != fin or date_fin <= date_debut:
        return 400, {"error": "La période demandée est invalide"}

    if trouver_chambre(id_hotel, id_chambre) is None:
        return 404, {"error": "Chambre introuvable !"}

    periodes = lire(
        "SELECT date_arrivee, date_depart FROM reservation "
        "WHERE hotel = %s AND chambre = %s AND statut <> %s "
        "AND date_arrivee < %s AND date_depart > %s "
        "ORDER BY date_arrivee",
        (id_hotel, id_chambre, STATUTS_ANNULE, fin, debut),
    )
    return 200, periodes

#GET reservation
def lister_reservation(demandeur):
    if demandeur is None:
        return 401, {"error": "Connexion requise !"}
    sql = (
        "SELECT r.*, u.nom AS client_nom, u.prenom AS client_prenom, "
        "u.email AS client_email, h.nom AS hotel_nom, c.type AS chambre_type "
        "FROM reservation r "
        "JOIN utilisateur u ON u.utilisateurs = r.utilisateurs "
        "JOIN hotel h ON h.hotel = r.hotel "
        "JOIN chambre c ON c.hotel = r.hotel AND c.chambre = r.chambre "
    )
    if est_administrateur(demandeur):
        return 200, lire(sql + "ORDER BY r.date_arrivee")
    return 200, lire(
        sql + "WHERE r.utilisateurs = %s ORDER BY r.date_arrivee",
        (demandeur["utilisateurs"],),
    )

def une_reservation(identifiant, demandeur):
    if demandeur is None:
        return 401, {"error": "Connexion requise !"}
    reservation = trouver_reservation(identifiant)
    if reservation is None:
        return 404, {"error": "Reservaton introuvable !"}
    if not est_administrateur(demandeur) and reservation["utilisateurs"] != demandeur["utilisateurs"]:
        return 404, {"error": "Reservaton introuvable !"}
    return 200, reservation


#POST reservation
def creer_reservation(donnees, demandeur):
    if donnees is None:
        return 400, {"error": "Données invalides"}
    if demandeur is None:
        return 401, {"error": "Connexion requise !"}
    if demandeur["role"] != securite.ROLE_CLIENT:
        return 403, {"error": "Seuls les clients peuvent créer une réservation"}

    manquants = [champ for champ in CHAMPS_CREATION if champ not in donnees]
    if len(manquants) > 0:
        return 400, {"error": "champs manquants", "champs": manquants}
    
    inconnus = [champ for champ in donnees if champ not in CHAMPS_CREATION]
    if inconnus:
        return 400, {"error": "Champs non modifiables", "champs": inconnus}

    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}

    if date.fromisoformat(donnees["date_arrivee"]) < date.today():
        return 400, {"error": "La date d'arrivée ne peut pas être passée"}

    montant = calculer_montant(
        donnees["hotel"], donnees["chambre"], donnees["date_arrivee"], donnees["date_depart"]
    )
    if montant is None:
        return 400, {"error": "Cette chambre n'existe pas dans cet hôtel"}

    reservation = {
        "reservation": "R" + uuid.uuid4().hex[:12].upper(),
        "date_arrivee": donnees["date_arrivee"],
        "date_depart": donnees["date_depart"],
        "nombre_adulte": donnees["nombre_adulte"],
        "nombre_enfant": donnees["nombre_enfant"],
        "montant_total": montant,
        "statut": "en attente",
        "chambre": donnees["chambre"],
        "hotel": donnees["hotel"],
        "utilisateurs": demandeur["utilisateurs"],
    }

    probleme = verifier_regles(reservation)
    if probleme is not None:
        statusCode, message = probleme
        return statusCode, {"error": message}

    colonnes = ", ".join(["reservation"] + CHAMPS)
    marqueurs = ", ".join(["%s"] * (len(CHAMPS) + 1))
    valeurs = [reservation[champ] for champ in ["reservation"] + CHAMPS]

    try:
        ecrire(f"INSERT INTO reservation ({colonnes}) VALUES ({marqueurs})", valeurs)
    except mysql.connector.IntegrityError:
        return 409, {"error": "Impossible de créer cette réservation"}
    return 201, trouver_reservation(reservation["reservation"])

#PUT / PATCH
def modifier_reservation(identifiant, donnees, tout_remplacer, demandeur):
    if demandeur is None:
        return 401, {"error": "Connexion requise !"}
    
    ancienne = trouver_reservation(identifiant)
    if ancienne is None:
        return 404, {"error": "reservation introuvable"}
    if not est_administrateur(demandeur) and ancienne["utilisateurs"] != demandeur["utilisateurs"]:
        return 404, {"error": "reservation introuvable"}
    
    if not donnees:
        return 400, {"error": "donnee introuvable"}
    
    inconnus = [champ for champ in donnees if champ not in CHAMPS]
    if len(inconnus) > 0:
        return 400,{"error" : "champs non modifiables", "champs": inconnus}

    if not est_administrateur(demandeur):
        if ancienne["statut"] == STATUTS_ANNULE:
            return 409, {"error": "Cette reservation est deja annulee"}
        if not tout_remplacer and donnees == {"statut": STATUTS_ANNULE}:
            ecrire(
                "UPDATE reservation SET statut = %s WHERE reservation = %s",
                (STATUTS_ANNULE, identifiant),
            )
            return 200, trouver_reservation(identifiant)

        non_autorises = [champ for champ in donnees if champ not in CHAMPS_MODIFIABLES_CLIENT]
        if non_autorises:
            return 403, {"error": "Les clients ne peuvent modifier que les dates et le nombre de voyageurs", "champs": non_autorises}
    
    if tout_remplacer:
        manquants = [champ for champ in CHAMPS if champ not in donnees]
        if len(manquants) > 0:
            return 400, {"error": "PUT exige tous les champs", "champs": manquants}
        
    message = verifier_valeurs(donnees)
    if message is not None:
        return 400, {"error": message}
    
    complete = dict(ancienne)
    complete.update(donnees)
    if not est_administrateur(demandeur):
        if date.fromisoformat(str(complete["date_arrivee"])) < date.today():
            return 400, {"error": "La date d'arrivée ne peut pas être passée"}
        montant = calculer_montant(
            complete["hotel"], complete["chambre"], complete["date_arrivee"], complete["date_depart"]
        )
        if montant is None:
            return 400, {"error": "Cette chambre n'existe pas dans cet hôtel"}
        donnees = dict(donnees)
        donnees["montant_total"] = montant
        complete["montant_total"] = montant
    probleme = verifier_regles(complete, id_a_exclure=identifiant)
    if probleme is not None:
        statusCode, message = probleme
        return statusCode, {"error": message}
    
    modifications = ", ".join(f"{champ} = %s" for champ in donnees)
    valeurs = list(donnees.values()) + [identifiant]
    ecrire(f"UPDATE reservation SET {modifications} WHERE reservation = %s", valeurs)
    
    return 200, trouver_reservation(identifiant)

#DELETE
def supprimer_reservation(identifiant, demandeur):
    if demandeur is None:
        return 401, {"error": "Connexion requise !"}
    reservation = trouver_reservation(identifiant)
    if reservation is None or (
        not est_administrateur(demandeur)
        and reservation["utilisateurs"] != demandeur["utilisateurs"]
    ):
        return 404, {"error":" Reservation introuvable !"}
    
    try:
        ecrire("DELETE FROM reservation WHERE reservation = %s", (identifiant,))
    except mysql.connector.IntegrityError:
        return 409, {"error": "supression impossible : un paiement est en cours"}
    return 200, {"message": "Reservation supprimee avec succes !"}
