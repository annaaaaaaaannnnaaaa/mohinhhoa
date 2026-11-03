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

# Run Flask application
if __name__ == "__main__":
    app.run(debug=True, port=5000)
