
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
from pathlib import Path
import os
import certifi
import threading

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env", override=True)

# Shared connection pool
_connection_pool = None
_pool_lock = threading.Lock()


def get_db_connection():
    global _connection_pool

    # Create the pool only once
    if _connection_pool is None:
        with _pool_lock:
            if _connection_pool is None:
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

                _connection_pool = pooling.MySQLConnectionPool(
                    pool_name="encore_pool",
                    pool_size=3,
                    pool_reset_session=True,
                    **config
                )

    # Get an available connection from the pool
    return _connection_pool.get_connection()
