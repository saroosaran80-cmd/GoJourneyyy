from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
import bcrypt
import json
from datetime import datetime
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

# ════════════════════════════════════════════
#   PDF TICKET GENERATOR
# ════════════════════════════════════════════
def generate_ticket_pdf(booking_ref, data, passengers=None):
    """Generate a beautiful PDF ticket for the booking"""
    pdf_buffer = BytesIO()
    
    try:
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                              topMargin=0.5*inch, bottomMargin=0.5*inch,
                              leftMargin=0.5*inch, rightMargin=0.5*inch)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Title style
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#00c6ff'),
            spaceAfter=6,
            alignment=1  # Center alignment
        )
        
        # Heading style
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#333333'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Add title
        elements.append(Paragraph("🚌 GoJourney Bus Ticket", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Booking confirmation section
        booking_data = [
            ['Booking Reference:', booking_ref],
            ['Passenger Name:', data.get("contact_name", "N/A")],
            ['Email:', data.get("contact_email", "N/A")],
            ['Phone:', data.get("contact_phone", "N/A")],
        ]
        
        booking_table = Table(booking_data, colWidths=[2*inch, 4*inch])
        booking_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(booking_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Journey details section
        elements.append(Paragraph("Journey Details", heading_style))
        
        journey_data = [
            ['From City:', data.get("from_city", "N/A"), 'To City:', data.get("to_city", "N/A")],
            ['Travel Date:', data.get("travel_date", "N/A"), 'Bus Type:', data.get("bus_type", "N/A")],
            ['Departure:', data.get("departure", "N/A"), 'Arrival:', data.get("arrival", "N/A")],
            ['Bus Operator:', data.get("operator", "N/A"), 'Seats:', data.get("selected_seats", "N/A")],
        ]
        
        journey_table = Table(journey_data, colWidths=[1.5*inch, 2.25*inch, 1.5*inch, 2.25*inch])
        journey_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f4f8')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#e8f4f8')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        elements.append(journey_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Passenger details if provided
        if passengers:
            elements.append(Paragraph("Passenger Details", heading_style))
            
            passenger_data = [['Name', 'Age', 'Gender', 'Seat Number']]
            for p in passengers:
                passenger_data.append([
                    p.get("name", "N/A"),
                    str(p.get("age", "N/A")),
                    p.get("gender", "N/A"),
                    p.get("seat_number", "N/A")
                ])
            
            passenger_table = Table(passenger_data, colWidths=[2*inch, 1*inch, 1.5*inch, 1.5*inch])
            passenger_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00c6ff')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('TOPPADDING', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
            ]))
            
            elements.append(passenger_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Price breakdown section
        elements.append(Paragraph("Price Breakdown", heading_style))
        
        price_data = [
            ['Base Fare:', f"₹{data.get('base_fare', '0')}"],
            ['Service Fee:', f"₹{data.get('service_fee', '0')}"],
            ['Taxes:', f"₹{data.get('taxes', '0')}"],
            ['Discount:', f"₹{data.get('discount', '0')}"],
            ['Total Amount:', f"₹{data.get('total_amount', '0')}"],
        ]
        
        price_table = Table(price_data, colWidths=[2*inch, 2*inch])
        price_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -2), colors.white),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#00ffae')),
            ('TEXTCOLOR', (0, 0), (-1, -2), colors.black),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -2), 10),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        elements.append(price_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=1  # Center
        )
        elements.append(Paragraph("Thank you for booking with GoJourney! Have a safe journey.", footer_style))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("For support, visit www.gojourney.com or contact support@gojourney.com", footer_style))
        
        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        return pdf_buffer
        
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        return None


# ════════════════════════════════════════════
#   EMAIL CONFIGURATION (Replace with yours)
# ════════════════════════════════════════════
GMAIL_SENDER = "gojourneytraveling@gmail.com"
GMAIL_APP_PASSWORD = "rltf xkej jdfq ncjm"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
def send_booking_email(to_email, booking_ref, data, passengers=None):
    try:
        if GMAIL_SENDER == "your.email@gmail.com":
            print("⚠️ Skipping email: Please configure GMAIL_SENDER and GMAIL_APP_PASSWORD in app.py")
            return

        subject = f"🚌 Ticket Confirmed! Your GoJourney Booking: {booking_ref}"
        
        # Create beautiful HTML email content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #00c6ff; text-align: center;">GoJourney</h2>
                    <h3 style="color: #333; text-align: center;">Your Ticket is Confirmed!</h3>
                    
                    <p>Hi <b>{data.get("contact_name", "Traveler")}</b>,</p>
                    <p>Your bus ticket from <b>{data.get("from_city")}</b> to <b>{data.get("to_city")}</b> has been successfully booked.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00ffae;">
                        <p style="margin:5px 0;"><b>Booking ID:</b> {booking_ref}</p>
                        <p style="margin:5px 0;"><b>Bus Operator:</b> {data.get("operator")} ({data.get("bus_type")})</p>
                        <p style="margin:5px 0;"><b>Travel Date:</b> {data.get("travel_date")}</p>
                        <p style="margin:5px 0;"><b>Departure Time:</b> {data.get("departure")}</p>
                        <p style="margin:5px 0;"><b>Arrival Time:</b> {data.get("arrival")}</p>
                        <p style="margin:5px 0;"><b>Seats:</b> {data.get("selected_seats")}</p>
                        <p style="margin:5px 0;"><b>Total Amount Paid:</b> ₹{data.get("total_amount")}</p>
                    </div>
                    
                    <p><b>Your ticket PDF is attached to this email.</b></p>
                    
                    <p>Have a safe and wonderful journey!</p>
                    <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px;">&copy; GoJourney Tickets</p>
                </div>
            </body>
        </html>
        """

        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = GMAIL_SENDER
        msg["To"] = to_email

        msg.attach(MIMEText(html_content, "html"))

        # Generate and attach PDF ticket
        pdf_buffer = generate_ticket_pdf(booking_ref, data, passengers)
        if pdf_buffer:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(pdf_buffer.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename= "GoJourney_Ticket_{booking_ref}.pdf"')
            msg.attach(part)

        # Send via Gmail SMTP server
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_SENDER, to_email, msg.as_string())
            
        print(f"📧 Confirmation email with PDF ticket sent to {to_email}")

    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")


app = Flask(__name__)
CORS(app)

# ════════════════════════════════════════════
#   DATABASE CONNECTION POOL
# ════════════════════════════════════════════
db_config = {
    "host":     "localhost",
    "user":     "root",
    "password": "",
    "database": "go_journey"
}

try:
    pool = pooling.MySQLConnectionPool(
        pool_name="gojourney_pool",
        pool_size=5,
        **db_config
    )
    print("✅ Database pool created successfully")
except Exception as e:
    print(f"⚠️  Could not create pool: {e}")
    pool = None


def get_conn():
    """Get a connection from pool or create new fallback connection."""
    if pool:
        return pool.get_connection()
    return mysql.connector.connect(**db_config)


def init_db():
    """Create all required tables if they don't exist."""
    try:
        conn = get_conn()
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                name        VARCHAR(100) NOT NULL,
                email       VARCHAR(150) UNIQUE NOT NULL,
                password    BLOB NOT NULL,
                phone       VARCHAR(20),
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Bookings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                booking_ref     VARCHAR(30) UNIQUE NOT NULL,
                user_email      VARCHAR(150),
                operator        VARCHAR(100),
                bus_type        VARCHAR(50),
                from_city       VARCHAR(100),
                to_city         VARCHAR(100),
                travel_date     DATE,
                departure       VARCHAR(20),
                arrival         VARCHAR(20),
                selected_seats  VARCHAR(200),
                passenger_count INT,
                base_fare       DECIMAL(10,2),
                service_fee     DECIMAL(10,2) DEFAULT 0,
                taxes           DECIMAL(10,2) DEFAULT 0,
                discount        DECIMAL(10,2) DEFAULT 0,
                total_amount    DECIMAL(10,2),
                payment_method  VARCHAR(30),
                payment_status  ENUM('pending','success','failed') DEFAULT 'success',
                coupon_code     VARCHAR(30),
                contact_name    VARCHAR(100),
                contact_phone   VARCHAR(20),
                contact_email   VARCHAR(150),
                created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Passengers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS passengers (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                booking_id  INT NOT NULL,
                booking_ref VARCHAR(30),
                name        VARCHAR(100),
                age         INT,
                gender      VARCHAR(20),
                seat_number VARCHAR(10),
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
            )
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Tables initialized")
    except Exception as e:
        print(f"⚠️  DB init error: {e}")


# ════════════════════════════════════════════
#   SIGNUP
# ════════════════════════════════════════════
@app.route("/signup", methods=["POST"])
def signup():
    try:
        conn   = get_conn()
        cursor = conn.cursor(dictionary=True)
        data   = request.json

        name     = data.get("name", "").strip()
        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")
        phone    = data.get("phone", "").strip()

        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400

        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "An account with this email already exists"}), 409

        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        cursor.execute(
            "INSERT INTO users (name, email, password, phone) VALUES (%s, %s, %s, %s)",
            (name, email, hashed, phone)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Account created successfully! Please login."}), 201

    except Exception as e:
        print("❌ SIGNUP ERROR:", e)
        return jsonify({"error": "Server error. Please try again."}), 500


# ════════════════════════════════════════════
#   LOGIN
# ════════════════════════════════════════════
@app.route("/login", methods=["POST"])
def login():
    try:
        conn   = get_conn()
        cursor = conn.cursor(dictionary=True)
        data   = request.json

        email    = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        stored_pw = user["password"]
        if isinstance(stored_pw, str):
            stored_pw = stored_pw.encode("utf-8")

        if not bcrypt.checkpw(password.encode("utf-8"), stored_pw):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful",
            "name":    user["name"],
            "email":   user["email"],
            "phone":   user.get("phone", ""),
        }), 200

    except Exception as e:
        print("❌ LOGIN ERROR:", e)
        return jsonify({"error": "Server error. Please try again."}), 500


# ════════════════════════════════════════════
#   BOOK (Save Booking + Passengers)
# ════════════════════════════════════════════
@app.route("/book", methods=["POST"])
def book():
    try:
        conn   = get_conn()
        cursor = conn.cursor(dictionary=True)
        data   = request.json

        # Generate unique booking reference
        booking_ref = f"GJ{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"

        # Parse travel date
        try:
            travel_date = datetime.strptime(data.get("travel_date", ""), "%Y-%m-%d").date()
        except:
            travel_date = None

        cursor.execute("""
            INSERT INTO bookings (
                booking_ref, user_email, operator, bus_type,
                from_city, to_city, travel_date, departure, arrival,
                selected_seats, passenger_count,
                base_fare, service_fee, taxes, discount, total_amount,
                payment_method, payment_status,
                coupon_code, contact_name, contact_phone, contact_email
            ) VALUES (
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s,
                %s, %s, %s, %s, %s,
                %s, 'success',
                %s, %s, %s, %s
            )
        """, (
            booking_ref,
            data.get("user_email", data.get("contact_email", "")),
            data.get("operator", ""),
            data.get("bus_type", ""),
            data.get("from_city", ""),
            data.get("to_city", ""),
            travel_date,
            data.get("departure", ""),
            data.get("arrival", ""),
            data.get("selected_seats", ""),
            data.get("passenger_count", 0),
            data.get("base_fare", 0),
            data.get("service_fee", 0),
            data.get("taxes", 0),
            data.get("discount", 0),
            data.get("total_amount", 0),
            data.get("payment_method", ""),
            data.get("coupon_code"),
            data.get("contact_name", ""),
            data.get("contact_phone", ""),
            data.get("contact_email", ""),
        ))

        booking_db_id = cursor.lastrowid

        # Save passengers
        passengers = data.get("passengers", [])
        for p in passengers:
            cursor.execute("""
                INSERT INTO passengers (booking_id, booking_ref, name, age, gender, seat_number)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                booking_db_id,
                booking_ref,
                p.get("name", ""),
                p.get("age", 0),
                p.get("gender", ""),
                p.get("seatNumber", ""),
            ))

        conn.commit()
        cursor.close()
        conn.close()

        # Send Email Notification with PDF ticket
        user_email_to_send = data.get("user_email", data.get("contact_email", ""))
        if user_email_to_send:
            # Format passengers for ticket
            passengers_for_ticket = []
            for p in passengers:
                passengers_for_ticket.append({
                    "name": p.get("name", ""),
                    "age": p.get("age", ""),
                    "gender": p.get("gender", ""),
                    "seat_number": p.get("seatNumber", "")
                })
            send_booking_email(user_email_to_send, booking_ref, data, passengers_for_ticket)

        return jsonify({
            "message":    "Booking saved successfully",
            "booking_id": booking_ref,
            "db_id":      booking_db_id,
        }), 201

    except Exception as e:
        print("❌ BOOKING ERROR:", e)
        return jsonify({"error": "Could not save booking", "detail": str(e)}), 500


# ════════════════════════════════════════════
#   GET MY BOOKINGS (by email)
# ════════════════════════════════════════════
@app.route("/my-bookings/<email>", methods=["GET"])
def my_bookings(email):
    try:
        conn   = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT b.*, GROUP_CONCAT(p.name ORDER BY p.id SEPARATOR ', ') AS passenger_names
            FROM bookings b
            LEFT JOIN passengers p ON b.id = p.booking_id
            WHERE b.user_email = %s
            GROUP BY b.id
            ORDER BY b.created_at DESC
        """, (email.lower(),))

        bookings = cursor.fetchall()

        # Convert date objects to string for JSON
        for bk in bookings:
            if bk.get("travel_date"):
                bk["travel_date"] = str(bk["travel_date"])
            if bk.get("created_at"):
                bk["created_at"] = str(bk["created_at"])
            for key in ["base_fare", "service_fee", "taxes", "discount", "total_amount"]:
                if bk.get(key) is not None:
                    bk[key] = float(bk[key])

        cursor.close()
        conn.close()

        return jsonify({"bookings": bookings}), 200

    except Exception as e:
        print("❌ MY-BOOKINGS ERROR:", e)
        return jsonify({"error": "Could not fetch bookings"}), 500


# ════════════════════════════════════════════
#   GET SINGLE BOOKING DETAILS
# ════════════════════════════════════════════
@app.route("/booking/<booking_ref>", methods=["GET"])
def get_booking(booking_ref):
    try:
        conn   = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM bookings WHERE booking_ref = %s", (booking_ref,)
        )
        booking = cursor.fetchone()

        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        cursor.execute(
            "SELECT * FROM passengers WHERE booking_ref = %s", (booking_ref,)
        )
        passengers = cursor.fetchall()

        cursor.close()
        conn.close()

        if booking.get("travel_date"):
            booking["travel_date"] = str(booking["travel_date"])
        if booking.get("created_at"):
            booking["created_at"] = str(booking["created_at"])
        for key in ["base_fare", "service_fee", "taxes", "discount", "total_amount"]:
            if booking.get(key) is not None:
                booking[key] = float(booking[key])

        return jsonify({"booking": booking, "passengers": passengers}), 200

    except Exception as e:
        print("❌ GET_BOOKING ERROR:", e)
        return jsonify({"error": "Could not fetch booking"}), 500


# ════════════════════════════════════════════
#   CANCEL BOOKING
# ════════════════════════════════════════════
@app.route("/cancel/<booking_ref>", methods=["POST"])
def cancel_booking(booking_ref):
    try:
        conn   = get_conn()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE bookings SET payment_status='failed' WHERE booking_ref=%s",
            (booking_ref,)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Booking cancelled successfully"}), 200

    except Exception as e:
        print("❌ CANCEL ERROR:", e)
        return jsonify({"error": "Could not cancel booking"}), 500


# ════════════════════════════════════════════
#   VALIDATE COUPON
# ════════════════════════════════════════════
@app.route("/validate-coupon", methods=["POST"])
def validate_coupon():
    data   = request.json
    code   = (data.get("code") or "").strip().upper()
    amount = float(data.get("amount") or 0)

    coupons = {
        "FIRST10":   {"type": "percent", "value": 10,  "label": "10% off"},
        "GOJOURNEY": {"type": "flat",    "value": 100, "label": "₹100 flat off"},
        "SAVE50":    {"type": "flat",    "value": 50,  "label": "₹50 flat off"},
    }

    if code in coupons:
        c = coupons[code]
        discount = round(amount * c["value"] / 100) if c["type"] == "percent" else c["value"]
        return jsonify({"valid": True, "discount": discount, "label": c["label"]}), 200

    return jsonify({"valid": False, "message": "Invalid or expired coupon code"}), 400


# ════════════════════════════════════════════
#   PROFILE (GET & UPDATE)
# ════════════════════════════════════════════
@app.route("/profile/<email>", methods=["GET", "PUT"])
def user_profile(email):
    email = email.lower()
    try:
        conn   = get_conn()
        cursor = conn.cursor(dictionary=True)

        if request.method == "GET":
            cursor.execute("SELECT name, email, phone, created_at FROM users WHERE email=%s", (email,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            if user.get("created_at"):
                user["created_at"] = str(user["created_at"])
                
            return jsonify({"user": user}), 200
            
        elif request.method == "PUT":
            data = request.json
            name = data.get("name", "").strip()
            phone = data.get("phone", "").strip()
            
            if not name:
                return jsonify({"error": "Name is required"}), 400
                
            cursor.execute("UPDATE users SET name=%s, phone=%s WHERE email=%s", (name, phone, email))
            conn.commit()
            
            return jsonify({
                "message": "Profile updated successfully",
                "user": {"name": name, "email": email, "phone": phone}
            }), 200

    except Exception as e:
        print("❌ PROFILE ERROR:", e)
        return jsonify({"error": "Could not access profile"}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()


# ════════════════════════════════════════════
#   ADMIN ANALYTICS
# ════════════════════════════════════════════
@app.route("/admin/analytics", methods=["GET"])
def admin_analytics():
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        
        # Total bookings
        cursor.execute("SELECT COUNT(*) as count FROM bookings")
        total_bookings = cursor.fetchone()['count']
        
        # Total revenue
        cursor.execute("SELECT SUM(total_amount) as total FROM bookings WHERE payment_status='success'")
        result = cursor.fetchone()
        total_revenue = result['total'] if result['total'] else 0
        
        # Total users
        cursor.execute("SELECT COUNT(*) as count FROM users")
        total_users = cursor.fetchone()['count']
        
        # Successful bookings
        cursor.execute("SELECT COUNT(*) as count FROM bookings WHERE payment_status='success'")
        successful_bookings = cursor.fetchone()['count']
        
        # Recent bookings (last 10)
        cursor.execute("""
            SELECT booking_ref, from_city, to_city, travel_date, total_amount, payment_status
            FROM bookings
            ORDER BY created_at DESC
            LIMIT 10
        """)
        recent_bookings = cursor.fetchall()
        
        # Top routes (most booked)
        cursor.execute("""
            SELECT from_city, to_city, COUNT(*) as count, SUM(total_amount) as total_revenue
            FROM bookings
            WHERE payment_status='success'
            GROUP BY from_city, to_city
            ORDER BY count DESC
            LIMIT 5
        """)
        top_routes = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "analytics": {
                "totalBookings": total_bookings,
                "totalRevenue": float(total_revenue),
                "totalUsers": total_users,
                "successfulBookings": successful_bookings
            },
            "recentBookings": recent_bookings,
            "topRoutes": top_routes
        }), 200
        
    except Exception as e:
        print("❌ ADMIN ANALYTICS ERROR:", e)
        return jsonify({"error": "Failed to fetch analytics"}), 500


# ════════════════════════════════════════════
#   HEALTH CHECK
# ════════════════════════════════════════════
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "app":    "GoJourney API",
        "time":   datetime.now().isoformat()
    }), 200


# ════════════════════════════════════════════
#   RUN
# ════════════════════════════════════════════
if __name__ == "__main__":
    init_db()
    print("🚀 GoJourney backend running on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)