import os
import random
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from twilio.rest import Client
from models import db, User

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
# -------------------------
@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    
    email = data.get("email")
    password = data.get("password")
    
    user = User.query.filter_by(
        email=email,
        role="admin"
    ).first()
    
    if not user or password != "admin123":
        return jsonify({
            "error": "Invalid email or password"
        }), 401
        
    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": "admin"
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