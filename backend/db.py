
import mysql.connector
from dotenv import load_dotenv
from pathlib import Path
import os
import certifi

BASE_DIR = Path(__file__).resolve().parent

# Always use the latest values from backend/.env
load_dotenv(BASE_DIR / ".env", override=True)


def get_db_connection():
    config = {
        "host": os.getenv("DB_HOST"),
        "port": int(os.getenv("DB_PORT") or "4000"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_NAME"),
    }

    if os.getenv("DB_SSL") == "1":
        config["ssl_ca"] = certifi.where()
        config["ssl_verify_cert"] = True

    return mysql.connector.connect(**config)
