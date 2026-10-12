import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        use_pure=True
    )
    
def lire(sql, valeurs=()):
    connexon = get_connection()
    try :
        curseur = connexion.cursor(dictionnary=True)
        curseur.execute(sql, valeurs)
        return curseur.fetchall()
    finally:
        connexion.close()
        
def ecrire(sql, valeurs=()):
    connexion = get_connection
    try:
        curseur= connexion.cursor()
        curseur.execute(sql, valeurs)
        connexion.commit()
    finally:
        connexion.close()
    
if __name__=="__main__":
    connexion = get_connection()
    print("Connexion à MySQL réussie !")
    connexion.close()    