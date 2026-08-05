import os
import random
import uuid
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from twilio.rest import Client
from models import db, User, Restaurant

auth_bp = Blueprint('auth', __name__)

# Temporary OTP storage
otp_store = {}

# -------------------------
# SEND OTP (Updated with Twilio)
# -------------------------
@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    mobile_number = data.get('mobile_number')
    
    if not mobile_number or len(mobile_number) != 10:
        return jsonify({'error': 'Valid 10 digit mobile number required'}), 400

    otp = str(random.randint(1000, 9999))
    otp_store[mobile_number] = otp
    
    # Grab Twilio credentials from .env
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

    if account_sid and auth_token and twilio_number:
        try:
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=f"Your FoodieXpress login OTP is {otp}",
                from_=twilio_number,
                to=f"+91{mobile_number}"  # India country code added automatically
            )
            print(f"Twilio SMS sent! SID: {message.sid}", flush=True)
        except Exception as e:
            # HACKATHON SAFETY NET: If Twilio fails, don't break the app! 
            # Print the error, then fallback to terminal mock.
            print(f"Twilio SMS sending error: {e}", flush=True)
            print("\n" + "="*50, flush=True)
            print("TWILIO FAILED - FALLING BACK TO MOCK SMS", flush=True)
            print(f"To Mobile: {mobile_number}", flush=True)
            print(f"Your OTP : {otp}", flush=True)
            print("="*50 + "\n", flush=True)
            
            # Return 200 OK so the frontend keeps working smoothly
            return jsonify({'message': f'OTP sent to {mobile_number}'}), 200
    else:
        # Fallback to Terminal Mock if Twilio keys aren't fully set up yet
        print("\n" + "="*50, flush=True)
        print("MOCK SMS DELIVERED (Twilio Keys Missing)!", flush=True)
        print(f"To Mobile: {mobile_number}", flush=True)
        print(f"Your OTP : {otp}", flush=True)
        print("="*50 + "\n", flush=True)

    # Return 200 OK to the frontend so it moves to the "Enter OTP" screen
    return jsonify({'message': f'OTP sent to {mobile_number}'}), 200

# -------------------------
# VERIFY OTP
# -------------------------
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    
    mobile_number = data.get("mobile_number")
    otp = data.get("otp")
    
    if otp_store.get(mobile_number) != otp:
        return jsonify({
            "error": "Invalid OTP"
        }), 401
        
    user = User.query.filter_by(
        mobile_number=mobile_number
    ).first()
    
    # Existing customer
    if user:
        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role
            }
        )
        
        return jsonify({
            "new_user": False,
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "mobile_number": user.mobile_number,
                "role": user.role
            }
        }), 200
        
    # First login
    return jsonify({
        "new_user": True,
        "mobile_number": mobile_number
    }), 200

# -------------------------
# REGISTER NEW CUSTOMER
# -------------------------
@auth_bp.route('/register-name', methods=['POST'])
def register_name():
    data = request.get_json()
    
    name = data.get("name")
    mobile_number = data.get("mobile_number")
    
    if not name:
        return jsonify({
            "error": "Name is required"
        }), 400
        
    user = User(
        name=name,
        mobile_number=mobile_number,
        role="customer"
    )
    
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": "customer"
        }
    )
    
    return jsonify({
        "message": "Registration Successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "mobile_number": user.mobile_number,
            "role": user.role
        }
    }), 201

# -------------------------
# WAITER LOGIN
# -------------------------
@auth_bp.route('/waiter-login', methods=['POST'])
def waiter_login():
    data = request.get_json()
    
    waiter_code = data.get("waiter_code")
    
    user = User.query.filter_by(
        waiter_code=waiter_code,
        role="waiter"
    ).first()
    
    if not user:
        return jsonify({
            "error": "Invalid waiter code"
        }), 401
        
    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": "waiter"
        }
    )
    
    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "waiter_code": user.waiter_code,
            "restaurant_id": user.restaurant_id,
            "role": user.role
        }
    }), 200

# -------------------------
# ADMIN LOGIN
# Fixed: now uses werkzeug check_password_hash instead of literal string comparison.
# Works for the seeded fallback admin AND any self-registered restaurant owner.
# -------------------------
@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(
        email=email,
        role="admin"
    ).first()
    
    if not user or not user.password_hash:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Embed restaurant_id in the JWT so the admin dashboard can use it directly
    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": "admin",
            "restaurant_id": user.restaurant_id
        }
    )
    
    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "restaurant_id": user.restaurant_id
        }
    }), 200


# -------------------------
# REGISTER RESTAURANT (New endpoint)
# Allows any restaurant owner to self-register and get their own admin account.
# Does NOT auto-login — returns a success message and lets them login manually.
# -------------------------
@auth_bp.route('/register-restaurant', methods=['POST'])
def register_restaurant():
    data = request.get_json()

    # --- Required field extraction ---
    restaurant_name = data.get("restaurant_name", "").strip()
    owner_name      = data.get("owner_name", "").strip()
    email           = data.get("email", "").strip().lower()
    password        = data.get("password", "")
    phone           = data.get("phone", "").strip()
    address         = data.get("address", "").strip()
    cuisine_type    = data.get("cuisine_type", "").strip()
    opening_hours   = data.get("opening_hours", "").strip()
    gst_number      = data.get("gst_number", "").strip()  # optional

    # --- Server-side validation ---
    errors = {}
    if not restaurant_name:
        errors["restaurant_name"] = "Restaurant name is required"
    if not owner_name:
        errors["owner_name"] = "Owner name is required"
    if not email or "@" not in email:
        errors["email"] = "Valid email address is required"
    if not password or len(password) < 8:
        errors["password"] = "Password must be at least 8 characters"
    if not phone or not phone.isdigit() or len(phone) != 10:
        errors["phone"] = "Valid 10-digit phone number is required"
    if not address:
        errors["address"] = "Address is required"
    if not cuisine_type:
        errors["cuisine_type"] = "Cuisine type is required"
    if not opening_hours:
        errors["opening_hours"] = "Opening hours are required"

    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 400

    # --- Check for duplicate email ---
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 400

    # --- Create the Restaurant record first ---
    qr_token = "qr-" + str(uuid.uuid4())[:12]  # Unique QR token for the new restaurant

    new_restaurant = Restaurant(
        name=restaurant_name,
        address=address,
        cuisine_type=cuisine_type,
        opening_hours=opening_hours,
        contact_number=phone,
        gst_number=gst_number or None,
        qr_code_token=qr_token,
        is_active=True
    )
    db.session.add(new_restaurant)
    db.session.flush()  # Flush so new_restaurant.id is available before commit

    # --- Create the admin User linked to this restaurant ---
    hashed_pw = generate_password_hash(password)
    new_user = User(
        name=owner_name,
        email=email,
        password_hash=hashed_pw,
        role="admin",
        restaurant_id=new_restaurant.id
    )
    db.session.add(new_user)
    db.session.commit()

    print(f"✅ New restaurant registered: {restaurant_name} (owner: {owner_name}, email: {email})", flush=True)

    return jsonify({
        "message": "Restaurant registered successfully! You can now login with your email and password.",
        "restaurant_name": restaurant_name,
        "owner_name": owner_name
    }), 201