from http.server import HTTPServer, BaseHTTPRequestHandler


class ResaHotelServer(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            self.wfile.write(
                b'{"message": "Bienvenue sur l API ResaHotel"}'
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