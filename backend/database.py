import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

try:
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        use_pure=True
    )

    print("Connexion à MySQL réussie !")

    connection.close()

except mysql.connector.Error as erreur:
    print("Erreur MySQL :", erreur)

except Exception as erreur:
    print("Autre erreur :", repr(erreur))