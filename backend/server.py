from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from decimal import Decimal
import mysql.connector

import hotel
import chambre
import utilisateur
import reservation
import securite

PROTECTION_ACTIVATE = False #remplacer par TRUE pour réactiver 

#permet de convertir le prix et les dates
def convertir_json(valeur):
    if isinstance(valeur, Decimal):
        return float(valeur)
    return str(valeur)

class ResaHotelServer(BaseHTTPRequestHandler):
    def repondre(self, statusCode, contenu):
        corps = json.dumps(contenu, default=convertir_json).encode("utf-8")
        self.send_response(statusCode)
        self.send_header("content-Type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(corps)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(corps)
        
    def lire_json(self):
        taille = int(self.headers.get("Content-Length", 0))
        if taille == 0:
            return None
        try:
            donnees=json.loads(self.rfile.read(taille))
        except json.JSONDecodeError:
            return None
        if not isinstance(donnees, dict):
            return None
        return donnees
    
    def traiter(self):
        methode = self.command
        chemin = self.path.split("?")[0]
        morceaux = [ m for m in chemin.split("/") if m != ""] #morceaux = morceaux de l'URL ecrit sur Postman. 
        #("/") permet de prendre en compte le split ("/")
        
        try:
            #bloc de securite
            #lignes 50, pour le moment seul hotels et chambres sont proteger, il faut dupppliquer pour reservation.py etc..
            # A FINALISER
            
            if PROTECTION_ACTIVATE and len (morceaux) > 0 and morceaux[0] in ["hotels", "chambres"] and methode in ["POST", "PUT", "PATCH", "DELETE"]:
                utilisateur_connect = securite.lire_jeton(self.headers.get("Authorization"))
                refus = securite.verifier_droits(utilisateur_connect, ["admin"])
                if refus is not None:
                    self.repondre(refus[0], refus[1])
                    return
             
         #Concerne la page hotel.py  
            if morceaux == []:
                statusCode, contenu = 200, {"message": "Bienvenue sur ResaHotel.com"}
                
            elif morceaux == ["hotels"] and methode == "GET":
                statusCode, contenu = hotel.lister_hotels()
                
            elif morceaux == ["hotels"] and methode == "POST":
                statusCode, contenu = hotel.creer_hotel(self.lire_json())
                
            elif len(morceaux) == 2 and morceaux [0] == "hotels" and methode == "GET":
                statusCode, contenu = hotel.un_hotel(morceaux[1])
                
            elif len(morceaux) == 2 and morceaux [0] == "hotels" and methode == "PUT":
                statusCode, contenu = hotel.modifier_hotel(morceaux[1], self.lire_json(), True)
                
            elif len(morceaux) == 2 and morceaux [0] == "hotels" and methode == "PATCH":
                statusCode, contenu = hotel.modifier_hotel(morceaux[1], self.lire_json(), False)
                
            elif len(morceaux) == 2 and morceaux [0] == "hotels" and methode == "DELETE":
                statusCode, contenu = hotel.supprimer_hotel(morceaux[1])
                
            #Concerne la page chambre.py
                   
            elif morceaux == ["chambres"] and methode == "GET":
                            statusCode, contenu = chambre.lister_chambre()
                            
            elif morceaux == ["chambres"] and methode == "POST":
                            statusCode, contenu = chambre.creer_chambre(self.lire_json())
                            
            elif len(morceaux) == 2 and morceaux [0] == "chambres" and methode == "GET":
                            statusCode, contenu = chambre.chambre_hotel(morceaux[1])
                            
            elif len(morceaux) == 3 and morceaux [0] == "chambres" and methode == "GET":
                            statusCode, contenu = chambre.une_chambre(morceaux[1], morceaux[2])
                            
            elif len(morceaux) == 3 and morceaux [0] == "chambres" and methode == "PUT":
                            statusCode, contenu = chambre.modifier_chambre(morceaux[1], morceaux[2], self.lire_json(), True)
                            
            elif len(morceaux) == 3 and morceaux [0] == "chambres" and methode == "PATCH":
                            statusCode, contenu = chambre.modifier_chambre(morceaux[1], morceaux[2], self.lire_json(), False)
                            
            elif len(morceaux) == 3 and morceaux [0] == "chambres" and methode == "DELETE":
                            statusCode, contenu = chambre.supprimer_chambre(morceaux[1], morceaux[2])
                            
            #Concerne la page reservation
            
            elif morceaux == ["reservations"] and methode == "GET":
                            statusCode, contenu = reservation.lister_reservation()
                                        
            elif morceaux == ["reservations"] and methode == "POST":
                            statusCode, contenu = reservation.creer_reservation(self.lire_json())
                                        
            elif len(morceaux) == 2 and morceaux [0] == "reservations" and methode == "GET":
                            statusCode, contenu = reservation.une_reservation(morceaux[1])
                                        
            elif len(morceaux) == 2 and morceaux [0] == "reservations" and methode == "PUT":
                            statusCode, contenu = reservation.modifier_reservation(morceaux[1], self.lire_json(), True)
                                        
            elif len(morceaux) == 2 and morceaux [0] == "reservations" and methode == "PATCH":
                            statusCode, contenu = reservation.modifier_reservation(morceaux[1], self.lire_json(), False)
                                        
            elif len(morceaux) == 2 and morceaux [0] == "reservations" and methode == "DELETE":
                            statusCode, contenu = reservation.supprimer_reservation(morceaux[1])
                            
            #Inscriptions / Connexion
            # A verifier
            elif morceaux == ["utilisateur"] and methode == "GET":
                            statusCode, contenu = utilisateur.lister_utilisateur(self.lire_json())
            
            elif morceaux == ["inscription"] and methode == "POST":
                            statusCode, contenu = utilisateur.inscrire(self.lire_json())
                                                    
            elif morceaux == ["connexion"] and methode == "POST":
                            statusCode, contenu = utilisateur.connecter(self.lire_json())
            
            else:
                statusCode, contenu = 404, {"error":"Route Inconnue"}
                
        except mysql.connector.Error as erreur:
            print("Erreur MySQL :", erreur)
            statusCode, contenu = 500, {"error" : "Erreur de Base de Données"}
            
        except Exception as erreur:
                    print("Erreur Serveur :", repr(erreur))
                    statusCode, contenu = 500, {"error" : "Erreur du serveur"}
            
        self.repondre(statusCode, contenu)
        
    def do_GET(self):
        self.traiter()
        
    def do_POST(self):
            self.traiter()
            
    def do_PUT(self):
            self.traiter()
            
    def do_PATCH(self):
            self.traiter()
            
    def do_DELETE(self):
            self.traiter()
            
            
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        
if __name__ == "__main__":
    if not PROTECTION_ACTIVATE:
        print("Attention : protection et jeton desactiver !")#securité a finalisée
    serveur= HTTPServer(("localhost", 8000), ResaHotelServer)
    print("Serveur ResaHotel démarré sur http://localhost:8000")
    serveur.serve_forever()
        
        

                