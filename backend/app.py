from pathlib import Path
from flask import Flask, jsonify, request
from db import get_db_connection

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend" / "encore-vscode-quiz"

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")

@app.route("/", methods=["GET"])
def index():
    return app.send_static_file("index.html")


# Get all concerts
@app.route("/api/admin/concerts", methods=["GET"])
def get_concerts():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT
                ConcertID,
                ConcertName,
                Venue,
                Artist,
                StartTime,
                Status
            FROM CONCERT
            ORDER BY StartTime ASC
        """

        cursor.execute(query)
        concerts = cursor.fetchall()

        for concert in concerts:
            concert["StartTime"] = concert["StartTime"].isoformat(
                sep=" ", timespec="seconds"
            )

        return jsonify({
            "success": True,
            "total": len(concerts),
            "data": concerts
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# Add a new concert
@app.route("/api/admin/concerts", methods=["POST"])
def add_concert():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Request body must be valid JSON."
        }), 400

    concert_id = data.get("ConcertID")
    concert_name = data.get("ConcertName")
    venue = data.get("Venue")
    artist = data.get("Artist")
    start_time = data.get("StartTime")
    status = data.get("Status", "Upcoming")

    if not all([concert_id, concert_name, venue, artist, start_time]):
        return jsonify({
            "success": False,
            "message": "Please provide all required fields."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO CONCERT
            (ConcertID, ConcertName, Venue, Artist, StartTime, Status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            concert_id,
            concert_name,
            venue,
            artist,
            start_time,
            status
        )

        cursor.execute(query, values)
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Concert added successfully!"
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Update an existing concert
@app.route("/api/admin/concerts/<concert_id>", methods=["PUT"])
def update_concert(concert_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Request body must be valid JSON."
        }), 400

    concert_name = data.get("ConcertName")
    venue = data.get("Venue")
    artist = data.get("Artist")
    start_time = data.get("StartTime")
    status = data.get("Status")

    if not all([concert_name, venue, artist, start_time, status]):
        return jsonify({
            "success": False,
            "message": "Please provide all required fields."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            UPDATE CONCERT
            SET ConcertName = %s,
                Venue = %s,
                Artist = %s,
                StartTime = %s,
                Status = %s
            WHERE ConcertID = %s
        """

        values = (
            concert_name,
            venue,
            artist,
            start_time,
            status,
            concert_id
        )

        cursor.execute(query, values)

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Concert not found or no changes made."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Concert updated successfully!"
        }), 200

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Delete a concert
@app.route("/api/admin/concerts/<concert_id>", methods=["DELETE"])
def delete_concert(concert_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check whether the concert exists
        cursor.execute(
            "SELECT ConcertID FROM CONCERT WHERE ConcertID = %s",
            (concert_id,)
        )

        concert = cursor.fetchone()

        if not concert:
            return jsonify({
                "success": False,
                "message": "Concert not found."
            }), 404

        # Check whether the concert has related bills
        cursor.execute(
            "SELECT BillID FROM BILL WHERE ConcertID = %s LIMIT 1",
            (concert_id,)
        )

        related_bill = cursor.fetchone()

        if related_bill:
            return jsonify({
                "success": False,
                "message": "Cannot delete this concert because it has related orders."
            }), 409

        # Check whether the concert has ticket classes
        cursor.execute(
            "SELECT ClassID FROM TICKET_CLASS WHERE ConcertID = %s LIMIT 1",
            (concert_id,)
        )

        related_class = cursor.fetchone()

        if related_class:
            return jsonify({
                "success": False,
                "message": "Cannot delete this concert because it has ticket classes."
            }), 409

        # Delete the concert
        cursor.execute(
            "DELETE FROM CONCERT WHERE ConcertID = %s",
            (concert_id,)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Concert deleted successfully!"
        }), 200

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Get all ticket classes
@app.route("/api/admin/ticket-classes", methods=["GET"])
def get_ticket_classes():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                ClassID,
                ConcertID,
                ClassName,
                Price,
                ColorCode
            FROM TICKET_CLASS
            ORDER BY ConcertID, Price ASC
        """

        cursor.execute(query)
        ticket_classes = cursor.fetchall()

        for ticket_class in ticket_classes:
            ticket_class["Price"] = float(ticket_class["Price"])

        return jsonify({
            "success": True,
            "total": len(ticket_classes),
            "data": ticket_classes
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Add a new ticket class
@app.route("/api/admin/ticket-classes", methods=["POST"])
def add_ticket_class():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Request body must be valid JSON."
        }), 400

    class_id = data.get("ClassID")
    concert_id = data.get("ConcertID")
    class_name = data.get("ClassName")
    price = data.get("Price")
    color_code = data.get("ColorCode")

    if not all([
        class_id,
        concert_id,
        class_name,
        price is not None,
        color_code
    ]):
        return jsonify({
            "success": False,
            "message": "Please provide all required fields."
        }), 400

    try:
        price = float(price)
        if price <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Price must be a positive number."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check whether the concert exists
        cursor.execute(
            "SELECT ConcertID FROM CONCERT WHERE ConcertID = %s",
            (concert_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Concert not found."
            }), 404

        query = """
            INSERT INTO TICKET_CLASS
            (ClassID, ConcertID, ClassName, Price, ColorCode)
            VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            class_id,
            concert_id,
            class_name,
            price,
            color_code
        )

        cursor.execute(query, values)
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Ticket class added successfully!"
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Update an existing ticket class
@app.route("/api/admin/ticket-classes/<class_id>", methods=["PUT"])
def update_ticket_class(class_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Request body must be valid JSON."
        }), 400

    concert_id = data.get("ConcertID")
    class_name = data.get("ClassName")
    price = data.get("Price")
    color_code = data.get("ColorCode")

    if not all([
        concert_id,
        class_name,
        price is not None,
        color_code
    ]):
        return jsonify({
            "success": False,
            "message": "Please provide all required fields."
        }), 400

    try:
        price = float(price)
        if price <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Price must be a positive number."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT ClassID FROM TICKET_CLASS WHERE ClassID = %s",
            (class_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Ticket class not found."
            }), 404

        cursor.execute(
            "SELECT ConcertID FROM CONCERT WHERE ConcertID = %s",
            (concert_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Concert not found."
            }), 404

        query = """
            UPDATE TICKET_CLASS
            SET ConcertID = %s,
                ClassName = %s,
                Price = %s,
                ColorCode = %s
            WHERE ClassID = %s
        """

        values = (
            concert_id,
            class_name,
            price,
            color_code,
            class_id
        )

        cursor.execute(query, values)
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Ticket class updated successfully!"
        }), 200

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Delete a ticket class
@app.route("/api/admin/ticket-classes/<class_id>", methods=["DELETE"])
def delete_ticket_class(class_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check whether the ticket class exists
        cursor.execute(
            "SELECT ClassID FROM TICKET_CLASS WHERE ClassID = %s",
            (class_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Ticket class not found."
            }), 404

        # Delete the ticket class
        cursor.execute(
            "DELETE FROM TICKET_CLASS WHERE ClassID = %s",
            (class_id,)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Ticket class deleted successfully!"
        }), 200

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Get all orders for Admin
@app.route("/api/admin/orders", methods=["GET"])
def get_orders():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                b.BillID,
                b.CustomerID,
                b.ConcertID,
                c.ConcertName,
                b.TotalAmount,
                b.BillDate,
                COUNT(bi.BillitemID) AS TotalTickets,
                p.PaymentID,
                p.PaymentStatus,
                p.PaymentMethod,
                p.PaymentTime
            FROM BILL b
            LEFT JOIN CONCERT c
                ON b.ConcertID = c.ConcertID
            LEFT JOIN BILL_ITEM bi
                ON b.BillID = bi.BillID
            LEFT JOIN PAYMENT p
                ON b.BillID = p.BillID
            GROUP BY
                b.BillID,
                b.CustomerID,
                b.ConcertID,
                c.ConcertName,
                b.TotalAmount,
                b.BillDate,
                p.PaymentID,
                p.PaymentStatus,
                p.PaymentMethod,
                p.PaymentTime
            ORDER BY b.BillDate DESC
        """

        cursor.execute(query)
        orders = cursor.fetchall()

        for order in orders:
            order["TotalAmount"] = float(order["TotalAmount"])

            if order["BillDate"]:
                order["BillDate"] = order["BillDate"].isoformat(
                    sep=" ", timespec="seconds"
                )

            if order["PaymentTime"]:
                order["PaymentTime"] = order["PaymentTime"].isoformat(
                    sep=" ", timespec="seconds"
                )

        return jsonify({
            "success": True,
            "total": len(orders),
            "data": orders
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/admin/orders/<bill_id>", methods=["GET"])
def get_order_details(bill_id):
    print("Bill ID received:", repr(bill_id))
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Get general order information
        order_query = """
            SELECT
                b.BillID,
                b.CustomerID,
                b.ConcertID,
                c.ConcertName,
                b.TotalAmount,
                b.BillDate,
                p.PaymentID,
                p.PaymentStatus,
                p.PaymentMethod,
                p.PaymentTime
            FROM BILL b
            LEFT JOIN CONCERT c
                ON b.ConcertID = c.ConcertID
            LEFT JOIN PAYMENT p
                ON b.BillID = p.BillID
            WHERE b.BillID = %s
        """

        cursor.execute(order_query, (bill_id,))
        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        # 2. Get ticket details
        ticket_query = """
            SELECT
                bi.BillitemID,
                bi.SeatID,
                s.RowNumber,
                s.SeatNumber,
                s.Status AS SeatStatus,
                z.ZoneID,
                z.ZoneName,
                bi.UnitPrice,
                bi.ServiceFee,
                t.TicketID,
                t.UniqueCode,
                t.CheckinStatus,
                t.CheckinTime,
                t.CheckedInBy
            FROM BILL_ITEM bi
            LEFT JOIN SEAT s
                ON bi.SeatID = s.SeatID
            LEFT JOIN ZONE z
                ON s.ZoneID = z.ZoneID
            LEFT JOIN TICKET t
                ON bi.BillitemID = t.BillitemID
            WHERE bi.BillID = %s
            ORDER BY z.ZoneName, s.RowNumber, s.SeatNumber
        """

        cursor.execute(ticket_query, (bill_id,))
        tickets = cursor.fetchall()

        # 3. Format datetime and decimal values
        for field in ["TotalAmount"]:
            if order[field] is not None:
                order[field] = float(order[field])

        for field in ["BillDate", "PaymentTime"]:
            if order[field]:
                order[field] = order[field].isoformat(
                    sep=" ", timespec="seconds"
                )

        for ticket in tickets:
            for field in ["UnitPrice", "ServiceFee"]:
                if ticket[field] is not None:
                    ticket[field] = float(ticket[field])

            if ticket["CheckinTime"]:
                ticket["CheckinTime"] = ticket[
                    "CheckinTime"
                ].isoformat(sep=" ", timespec="seconds")

        return jsonify({
            "success": True,
            "data": {
                "order": order,
                "totalTickets": len(tickets),
                "tickets": tickets
            }
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/admin/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Concert statistics
        cursor.execute("""
            SELECT
                COUNT(*) AS totalConcerts,
                SUM(
                    CASE
                        WHEN Status = 'OnSale' THEN 1
                        ELSE 0
                    END
                ) AS activeConcerts
            FROM CONCERT
        """)
        concert_stats = cursor.fetchone()

        # 2. Order and revenue statistics
        cursor.execute("""
            SELECT
                COUNT(DISTINCT b.BillID) AS totalOrders,
                COUNT(DISTINCT
                    CASE
                        WHEN p.PaymentStatus = 'Success'
                        THEN b.BillID
                    END
                ) AS successfulOrders,
                SUM(
                    CASE
                        WHEN p.PaymentStatus = 'Success'
                        THEN b.TotalAmount
                        ELSE 0
                    END
                ) AS totalRevenue
            FROM BILL b
            LEFT JOIN PAYMENT p
                ON b.BillID = p.BillID
        """)
        order_stats = cursor.fetchone()

        # 3. Sold ticket statistics
        cursor.execute("""
            SELECT COUNT(*) AS ticketsSold
            FROM BILL_ITEM bi
            INNER JOIN BILL b
                ON bi.BillID = b.BillID
            INNER JOIN PAYMENT p
                ON b.BillID = p.BillID
            WHERE p.PaymentStatus = 'Success'
        """)
        ticket_stats = cursor.fetchone()

        return jsonify({
            "success": True,
            "data": {
                "totalConcerts": concert_stats["totalConcerts"] or 0,
                "activeConcerts": concert_stats["activeConcerts"] or 0,
                "totalOrders": order_stats["totalOrders"] or 0,
                "successfulOrders": order_stats["successfulOrders"] or 0,
                "totalRevenue": float(
                    order_stats["totalRevenue"] or 0
                ),
                "ticketsSold": ticket_stats["ticketsSold"] or 0
            }
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# ===================== LOGIN =====================
import os
from functools import wraps
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import check_password_hash

serializer = URLSafeTimedSerializer(os.environ.get("SECRET_KEY", "dev-only-change-me"))


def get_current_user():
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    try:
        return serializer.loads(token, max_age=60 * 60 * 12)
    except (BadSignature, SignatureExpired):
        return None


def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"success": False, "message": "Unauthorized"}), 401
            if user.get("role") not in roles:
                return jsonify({"success": False, "message": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT UserID, Email, PasswordHash, Role FROM USER_ACCOUNT WHERE Email = %s LIMIT 1",
            (email,),
        )
        row = cursor.fetchone()
    except Exception as error:
        return jsonify({"success": False, "message": str(error)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
    try:
        ok = bool(row) and check_password_hash(row["PasswordHash"], password)
    except ValueError:
        ok = False
    if not ok:
        return jsonify({"success": False, "message": "Sai email hoặc mật khẩu"}), 401

    user = {"id": row["UserID"], "email": row["Email"], "role": row["Role"]}
    return jsonify({"success": True, "user": user, "token": serializer.dumps(user)})
# =================================================
# ===================== BẢO VỆ ROUTE ADMIN =====================
@app.before_request
def protect_admin_api():
    if request.path.startswith("/api/admin/"):
        if request.method == "OPTIONS":
            return None
        user = get_current_user()
        if not user:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        if user.get("role") != "Administrator":
            return jsonify({"success": False, "message": "Forbidden"}), 403
# ==============================================================

# ===================== CUSTOMER: HOLD SEAT =====================

@app.route("/api/customer/seat-holds", methods=["POST"])
@roles_required("Customer")
def hold_seat():
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    seat_id = data.get("SeatID")

    if not seat_id:
        return jsonify({
            "success": False,
            "message": "SeatID is required."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        # 1. Get CustomerID from the logged-in account
        cursor.execute(
            "SELECT CustomerID FROM CUSTOMER WHERE UserID = %s",
            (user["id"],)
        )
        customer = cursor.fetchone()

        if not customer:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Customer account not found."
            }), 404

        customer_id = customer["CustomerID"]

        # 2. Lock the selected seat
        cursor.execute(
            "SELECT SeatID, Status FROM SEAT "
            "WHERE SeatID = %s FOR UPDATE",
            (seat_id,)
        )
        seat = cursor.fetchone()

        if not seat:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Seat not found."
            }), 404

        # 3. Expire old holds for this seat
        cursor.execute("""
            UPDATE SEAT_HOLD
            SET HoldStatus = 'Expired'
            WHERE SeatID = %s
              AND HoldStatus = 'Active'
              AND ExpiresAt <= NOW()
        """, (seat_id,))

        # 4. Check whether another active hold exists
        cursor.execute("""
            SELECT HoldID
            FROM SEAT_HOLD
            WHERE SeatID = %s
              AND HoldStatus = 'Active'
              AND ExpiresAt > NOW()
            LIMIT 1
        """, (seat_id,))

        active_hold = cursor.fetchone()

        if active_hold:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "This seat is currently held."
            }), 409

        # 5. Release an expired hold if necessary
        if seat["Status"] == "Hold":
            cursor.execute(
                "UPDATE SEAT SET Status = 'Available' "
                "WHERE SeatID = %s",
                (seat_id,)
            )
            seat["Status"] = "Available"

        if seat["Status"] != "Available":
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "This seat is not available."
            }), 409

        # 6. Create a new hold for 10 minutes
        cursor.execute("""
            INSERT INTO SEAT_HOLD
                (SeatID, CustomerID, HoldStatus, HeldAt, ExpiresAt)
            VALUES
                (%s, %s, 'Active', NOW(),
                 DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        """, (seat_id, customer_id))

        hold_id = cursor.lastrowid

        # 7. Update seat status
        cursor.execute(
            "UPDATE SEAT SET Status = 'Hold' WHERE SeatID = %s",
            (seat_id,)
        )

        # 8. Get expiration time
        cursor.execute(
            "SELECT ExpiresAt FROM SEAT_HOLD WHERE HoldID = %s",
            (hold_id,)
        )
        hold = cursor.fetchone()

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Seat held successfully for 10 minutes.",
            "data": {
                "HoldID": hold_id,
                "SeatID": seat_id,
                "ExpiresAt": hold["ExpiresAt"].isoformat(
                    sep=" ", timespec="seconds"
                )
            }
        }), 201

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Error while holding seat")

        return jsonify({
            "success": False,
            "message": "Unable to hold this seat."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/api/customer/seat-holds/<int:hold_id>", methods=["DELETE"])
@roles_required("Customer")
def release_seat(hold_id):
    user = get_current_user()
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT h.SeatID, h.HoldStatus, h.ExpiresAt
            FROM SEAT_HOLD h
            JOIN CUSTOMER c ON c.CustomerID = h.CustomerID
            WHERE h.HoldID = %s AND c.UserID = %s
            FOR UPDATE
        """, (hold_id, user["id"]))

        hold = cursor.fetchone()

        if not hold:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Hold not found."
            }), 404

        if hold["HoldStatus"] == "Active":
            cursor.execute("""
                UPDATE SEAT_HOLD
                SET HoldStatus = CASE
                    WHEN ExpiresAt <= NOW() THEN 'Expired'
                    ELSE 'Cancelled'
                END
                WHERE HoldID = %s
            """, (hold_id,))

        cursor.execute("""
            SELECT Status
            FROM SEAT
            WHERE SeatID = %s
            FOR UPDATE
        """, (hold["SeatID"],))

        seat = cursor.fetchone()

        if seat and seat["Status"] == "Hold":
            cursor.execute("""
                SELECT COUNT(*) AS total
                FROM SEAT_HOLD
                WHERE SeatID = %s
                  AND HoldStatus = 'Active'
                  AND ExpiresAt > NOW()
            """, (hold["SeatID"],))

            if cursor.fetchone()["total"] == 0:
                cursor.execute("""
                    UPDATE SEAT
                    SET Status = 'Available'
                    WHERE SeatID = %s AND Status = 'Hold'
                """, (hold["SeatID"],))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Seat released successfully."
        })

    except Exception:
        if connection:
            connection.rollback()
        app.logger.exception("Error while releasing seat")
        return jsonify({
            "success": False,
            "message": "Unable to release this seat."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
# ==============================================================

# ===================== CUSTOMER: CHECKOUT =====================

@app.route("/api/customer/checkout", methods=["POST"])
@roles_required("Customer")
def checkout():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    concert_id = data.get("ConcertID")
    hold_ids = data.get("HoldIDs")

    if not concert_id:
        return jsonify({
            "success": False,
            "message": "ConcertID is required."
        }), 400

    if not isinstance(hold_ids, list) or not hold_ids:
        return jsonify({
            "success": False,
            "message": "HoldIDs must be a non-empty list."
        }), 400

    try:
        hold_ids = [int(x) for x in hold_ids]
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid HoldIDs."
        }), 400

    # Prevent duplicate hold IDs
    if len(hold_ids) != len(set(hold_ids)):
        return jsonify({
            "success": False,
            "message": "Duplicate HoldIDs are not allowed."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        # 1. Get CustomerID from the authenticated account
        cursor.execute("""
            SELECT CustomerID
            FROM CUSTOMER
            WHERE UserID = %s
        """, (user["id"],))

        customer = cursor.fetchone()

        if not customer:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "Customer account not found."
            }), 404

        customer_id = customer["CustomerID"]

        # 2. Lock and retrieve all selected holds and their prices
        placeholders = ", ".join(["%s"] * len(hold_ids))

        query = f"""
            SELECT
                h.HoldID,
                h.SeatID,
                h.CustomerID,
                h.HoldStatus,
                CASE
                    WHEN h.ExpiresAt > NOW() THEN 1
                    ELSE 0
                END AS IsUnexpired,
                s.Status AS SeatStatus,
                z.ConcertID,
                z.ZoneName,
                s.RowNumber,
                s.SeatNumber,
                tc.Price
            FROM SEAT_HOLD h
            JOIN SEAT s
                ON h.SeatID = s.SeatID
            JOIN ZONE z
                ON s.ZoneID = z.ZoneID
            JOIN TICKET_CLASS tc
                ON z.ClassID = tc.ClassID
            WHERE h.HoldID IN ({placeholders})
              AND h.CustomerID = %s
            FOR UPDATE
        """

        cursor.execute(query, tuple(hold_ids) + (customer_id,))
        holds = cursor.fetchall()

        if len(holds) != len(hold_ids):
            connection.rollback()
            return jsonify({
                "success": False,
                "message": "One or more seat holds were not found."
            }), 409

        # 3. Validate every hold
        for hold in holds:
            if hold["HoldStatus"] != "Active":
                connection.rollback()
                return jsonify({
                    "success": False,
                    "message": "One or more seat holds are no longer active."
                }), 409

            if not hold["IsUnexpired"]:
                connection.rollback()
                return jsonify({
                    "success": False,
                    "message": "One or more seat holds have expired."
                }), 409

            if hold["SeatStatus"] != "Hold":
                connection.rollback()
                return jsonify({
                    "success": False,
                    "message": "One or more seats are no longer available."
                }), 409

            if hold["ConcertID"] != concert_id:
                connection.rollback()
                return jsonify({
                    "success": False,
                    "message": "A selected seat does not belong to this concert."
                }), 400

        # 4. Calculate prices using database values
        service_fee = Decimal("25000.00")
        subtotal = sum(
            (Decimal(str(hold["Price"])) for hold in holds),
            Decimal("0.00")
        )
        total_amount = subtotal + service_fee * len(holds)

        # Generate IDs
        bill_id = "B" + secrets.token_hex(10)[:19].upper()
        payment_id = "P" + secrets.token_hex(10)[:19].upper()

        # 5. Create BILL
        cursor.execute("""
            INSERT INTO BILL
                (BillID, CustomerID, ConcertID, TotalAmount, BillDate)
            VALUES
                (%s, %s, %s, %s, NOW())
        """, (
            bill_id,
            customer_id,
            concert_id,
            total_amount
        ))

        ticket_results = []

        # 6. Create BILL_ITEM and TICKET for each seat
        for hold in holds:
            billitem_id = "BI" + secrets.token_hex(9).upper()
            ticket_id = "T" + secrets.token_hex(10)[:19].upper()
            unique_code = secrets.token_hex(4).upper()

            cursor.execute("""
                INSERT INTO BILL_ITEM
                    (BillitemID, BillID, SeatID, UnitPrice, ServiceFee)
                VALUES
                    (%s, %s, %s, %s, %s)
            """, (
                billitem_id,
                bill_id,
                hold["SeatID"],
                Decimal(str(hold["Price"])),
                service_fee
            ))

            cursor.execute("""
                INSERT INTO TICKET
                    (TicketID, BillitemID, UniqueCode, CheckinStatus)
                VALUES
                    (%s, %s, %s, 'NotCheckedIn')
            """, (
                ticket_id,
                billitem_id,
                unique_code
            ))

            ticket_results.append({
                "TicketID": ticket_id,
                "UniqueCode": unique_code,
                "SeatID": hold["SeatID"],
                "ZoneName": hold["ZoneName"],
                "RowNumber": hold["RowNumber"],
                "SeatNumber": hold["SeatNumber"],
                "UnitPrice": float(hold["Price"]),
                "ServiceFee": float(service_fee)
            })

            # 7. Mark seat as sold
            cursor.execute("""
                UPDATE SEAT
                SET Status = 'Sold'
                WHERE SeatID = %s
            """, (hold["SeatID"],))

            # 8. Confirm the seat hold
            cursor.execute("""
                UPDATE SEAT_HOLD
                SET HoldStatus = 'Confirmed'
                WHERE HoldID = %s
            """, (hold["HoldID"],))

        # 9. Create demo payment record
        cursor.execute("""
            INSERT INTO PAYMENT
                (PaymentID, BillID, PaymentStatus, PaymentMethod, PaymentTime)
            VALUES
                (%s, %s, 'Success', 'Demo', NOW())
        """, (
            payment_id,
            bill_id
        ))

        # 10. Commit all changes together
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Demo checkout completed successfully.",
            "data": {
                "BillID": bill_id,
                "PaymentID": payment_id,
                "ConcertID": concert_id,
                "Subtotal": float(subtotal),
                "ServiceFee": float(service_fee * len(holds)),
                "TotalAmount": float(total_amount),
                "TotalTickets": len(ticket_results),
                "Tickets": ticket_results
            }
        }), 201

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Error during customer checkout")

        return jsonify({
            "success": False,
            "message": "Unable to complete checkout."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# =============================================================
# Run Flask application
if __name__ == "__main__":
    app.run(debug=True, port=5000)