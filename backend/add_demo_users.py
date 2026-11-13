from db import get_db_connection
from werkzeug.security import generate_password_hash

h = generate_password_hash("Demo@123")
conn = get_db_connection()
cur = conn.cursor()

cur.execute(
    "INSERT IGNORE INTO USER_ACCOUNT (UserID,Email,PasswordHash,Role) VALUES (%s,%s,%s,%s)",
    ("U102", "nguoimua@gmail.com", h, "Customer"))
cur.execute(
    "INSERT IGNORE INTO USER_ACCOUNT (UserID,Email,PasswordHash,Role) VALUES (%s,%s,%s,%s)",
    ("U103", "admin@concert.vn", h, "Administrator"))
cur.execute(
    "INSERT IGNORE INTO CUSTOMER (CustomerID,UserID,FullName,PhoneNumber) VALUES (%s,%s,%s,%s)",
    ("C102", "U102", "Nguyễn Văn A", "0901234567"))
conn.commit()

cur.execute(
    "SELECT u.Email, u.Role, c.CustomerID FROM USER_ACCOUNT u "
    "LEFT JOIN CUSTOMER c ON c.UserID = u.UserID "
    "WHERE u.Email IN ('nguoimua@gmail.com','admin@concert.vn')")
print(cur.fetchall())
conn.close()