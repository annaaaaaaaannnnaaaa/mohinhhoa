import mysql.connector
from dotenv import load_dotenv
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def get_db_connection():
    config = dict(
        host=os.getenv("DB_HOST") or "127.0.0.1",
        port=int(os.getenv("DB_PORT") or "3306"),
        user=os.getenv("DB_USER") or "root",
        password=os.getenv("DB_PASSWORD") or "",
        database=os.getenv("DB_NAME") or "concertticket",
    )
    if os.getenv("DB_SSL") == "1":
        import certifi
        config["ssl_ca"] = certifi.where()
        config["ssl_verify_cert"] = True
    return mysql.connector.connect(**config)