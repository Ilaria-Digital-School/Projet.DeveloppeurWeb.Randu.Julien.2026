#app.py concerne la partie du bloc 3 avec le Framework Flask

from decimal import Decimal
import mysql.connector
from flask import Flask, request, jsonify
from flask.json.provider import DefaultJSONProvider
from werkzeug.exceptions import HTTPException

import hotel
import chambre
import reservation
import utilisateur
import securite

def convertir_json(valeur):
    if isinstance(valeur, Decimal):
        return float(valeur)
    return str(valeur)

class MonJSON(DefaultJSONProvider):
    default = staticmethod(convertir_json)
    ensure_ascii = False
    sort_keys = False
    
app = Flask(__name__)
app.json = MonJSON(app)
app.url_map.strict_slashes = False

@app.after_request
def ajouter_cors(reponse):
    reponse.headers["Access-Control-Allow-Origin"] = "*"
    reponse.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    reponse.headers["Access-Control-Allow-Headers"] = "Content-Type ,Authorization"
    return reponse

@app.before_request
def proteger_routes():
    morceaux = [m for m in request.path.split("/") if m != ""]
    if securite.PROTECTION_ACTIVATE and len(morceaux) > 0 and morceaux[0] in ["hotels", "chambres"] and request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        utilisateur_connect = securite.lire_jeton(request.headers.get("Authorization"))
        refus = securite.verifier_droits(utilisateur_connect, ["admin"])
        if refus is not None:
            return jsonify(refus[1]), refus [0]
        
def lire_json():
    donnees = request.get_json(force=True, silent=True)
    if not isinstance(donnees, dict):
        return None
    return donnees

def repondre(resultat):
    statusCode, contenu = resultat
    return jsonify(contenu), statusCode

#Creation des routes pour utilisations de Flask
#Route Hôtel

@app.get("/")
def route_accueil():
    return jsonify({"message": "Bienvenue sur ResaHotel.com"})

@app.get("/hotels")
def route_lister_hotels():
    return repondre(hotel.lister_hotels())

@app.post("/hotels")
def route_creer_hotel():
    return repondre(hotel.creer_hotel(lire_json()))

@app.get("/hotels/<identifiant>")
def route_un_hotel(identifiant):
    return repondre(hotel.un_hotel(identifiant))

@app.put("/hotels/<identifiant>")
def route_remplacer_hotel(identifiant):
    return repondre(hotel.modifier_hotel(identifiant, lire_json(), True))

@app.patch("/hotels/<identifiant>")
def route_modifier_hotel(identifiant):
    return repondre(hotel.modifier_hotel(identifiant, lire_json(), False))

@app.delete("/hotels/<identifiant>")
def route_supprimer_hotel(identifiant):
    return repondre(hotel.supprimer_hotel(identifiant))

#Route pour les Chambres

@app.get("/chambres")
def route_lister_chambre():
    return repondre(chambre.lister_chambre())

@app.post("/chambres")
def route_creer_chambre():
    return repondre(chambre.creer_chambre(lire_json()))

@app.get("/chambres/<id_hotel>")
def route_chambre_hotel(id_hotel):
    return repondre(chambre.chambre_hotel(id_hotel))

@app.get("/chambres/<id_hotel>/<id_chambre>")
def route_une_chambre(id_hotel, id_chambre):
    return repondre(chambre.une_chambre(id_hotel, id_chambre))

@app.put("/chambres/<id_hotel>/<id_chambre>")
def route_remplacer_chambre(id_hotel, id_chambre):
    return repondre(chambre.modifier_chambre(id_hotel, id_chambre, lire_json(), True))

@app.patch("/chambres/<id_hotel>/<id_chambre>")
def route_modifier_chambre(id_hotel, id_chambre):
    return repondre(chambre.modifier_chambre(id_hotel, id_chambre, lire_json(), False))

@app.delete("/chambres/<id_hotel>/<id_chambre>")
def route_supprimer_chambre(id_hotel, id_chambre):
    return repondre(chambre.supprimer_chambre(id_hotel, id_chambre))

#Reservation

@app.get("/reservations")
def route_lister_reservations():
    return repondre(reservation.lister_reservation())

@app.post("/reservations")
def route_creer_reservations():
    return repondre(reservation.creer_reservation(lire_json()))

@app.get("/reservations/<identifiant>")
def route_une_reservation(identifiant):
    return repondre(reservation.une_reservation(identifiant))

@app.put("/reservations/<identifiant>")
def route_remplacer_reservation(identifiant):
    return repondre(reservation.modifier_reservation(identifiant, lire_json(), True))

@app.patch("/reservations/<identifiant>")
def route_modifier_reservation(identifiant):
    return repondre(reservation.modifier_reservation(identifiant, lire_json(), False))

@app.delete("/reservations/<identifiant>")
def route_supprimer_reservation(identifiant):
    return repondre(reservation.supprimer_reservation(identifiant))

#Comptes

@app.post("/inscription")
def route_inscription():
    return repondre(utilisateur.inscrire(lire_json()))

@app.post("/connexion")
def route_connexion():
    return repondre(utilisateur.connecter(lire_json()))

#Affiche la liste des utilisateurs
@app.get("/utilisateurs")
def route_lister_utilisateurs():
    utilisateur_connect = securite.lire_jeton(request.headers.get("Authorization"))
    refus = securite.verifier_droits(utilisateur_connect, ["admin"])
    if refus is not None:
        return jsonify(refus[1]), refus [0]
    return repondre(utilisateur.lister_utilisateurs())

#Les erreurs et les StatusCode

@app.errorhandler(404)
def erreur_404(erreur):
    return jsonify({"error": "Route inconnue !"}), 404

@app.errorhandler(405)
def erreur_405(erreur):
    return jsonify({"error": "Methode non autorise !"}), 405

@app.errorhandler(mysql.connector.Error)
def erreur_mysql(erreur):
    print("Erreur MySQL :", erreur)
    return jsonify({"error": "Erreur sur la Base de Donnee !"}), 500

@app.errorhandler(Exception)
def erreur_imprevue(erreur):
    if isinstance(erreur, HTTPException):
        return jsonify({"error": erreur.description}), erreur.code
    print("Erreur serveur :", repr(erreur))
    return jsonify({"error": "Erreur du serveur"}), 500


if __name__ == "__main__":
    if not securite.PROTECTION_ACTIVATE:
        print("Attention, protection desactivée pour test")
    app.run(host="localhost", port=5000, debug=True)