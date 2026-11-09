import os, re
from pathlib import Path
import mysql.connector
from werkzeug.security import generate_password_hash

DB_NAME = "concertticket"

kwargs = dict(
    host=os.environ["DB_HOST"],
    port=int(os.environ.get("DB_PORT", "4000")),
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
)
import certifi
kwargs["ssl_ca"] = certifi.where()
kwargs["ssl_verify_cert"] = True

conn = mysql.connector.connect(**kwargs)
cur = conn.cursor()
cur.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
cur.execute(f"USE {DB_NAME}")

DB_DIR = Path(__file__).resolve().parent.parent / "database"


def run_file(path):
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"(?im)^\s*(CREATE DATABASE|USE)\b[^;]*;", "", text)
    ok = 0
    for stmt in text.split(";"):
        body = "\n".join(l for l in stmt.splitlines() if not l.strip().startswith("--")).strip()
        if not body:
            continue
        try:
            cur.execute(body)
            ok += 1
        except Exception as e:
            print("LỖI:", e)
            print("   ở câu:", body[:120].replace("\n", " "))
    conn.commit()
    print(path.name, "- chạy được", ok, "câu")


run_file(DB_DIR / "schema_cloud.sql")
run_file(DB_DIR / "seed.sql")

h = generate_password_hash("Demo@123")
for uid, email, role in [("U102", "nguoimua@gmail.com", "Customer"),
                         ("U103", "admin@concert.vn", "Administrator")]:
    cur.execute("INSERT IGNORE INTO USER_ACCOUNT (UserID,Email,PasswordHash,Role) VALUES (%s,%s,%s,%s)",
                (uid, email, h, role))
conn.commit()
cur.execute("SELECT COUNT(*) FROM USER_ACCOUNT")
print("Số tài khoản:", cur.fetchone()[0])
conn.close()