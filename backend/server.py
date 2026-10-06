from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from database import get_connection


class ResaHotelServer(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            self.wfile.write(
                b'{"message": "Bienvenue sur l API ResaHotel"}'
            )
            
        elif self.path == "/hotels":
            connection = get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM hotel")
            hotels = cursor.fetchall()
            cursor.close()
            connection.close()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps(hotels, default=str).encode("utf-8")
            )

        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            self.wfile.write(
                b'{"error": "Route inconnue"}'
            )


server = HTTPServer(("localhost", 8000), ResaHotelServer)

print("Serveur ResaHotel démarré sur http://localhost:8000")

server.serve_forever()