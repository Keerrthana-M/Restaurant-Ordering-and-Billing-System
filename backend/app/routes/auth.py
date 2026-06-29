from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.user import User
import random

# Blueprint is like a mini Flask app for a specific feature
# All routes here will start with /api/auth
auth_bp = Blueprint('auth', __name__)


# ─── CUSTOMER REGISTER ───────────────────────────────────────────────
@auth_bp.route('/register/customer', methods=['POST'])
def register_customer():
    data = request.get_json()

    # Check if mobile already exists
    existing = User.query.filter_by(mobile=data['mobile']).first()
    if existing:
        return jsonify({'error': 'Mobile number already registered'}), 400

    user = User(
        name=data['name'],
        mobile=data['mobile'],
        role='customer'
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Customer registered successfully'}), 201


# ─── CUSTOMER LOGIN (OTP SIMULATION) ────────────────────────────────
# In real apps OTP is sent via SMS. Here we simulate it.
# Step 1: Send OTP
@auth_bp.route('/login/customer/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    user = User.query.filter_by(mobile=data['mobile'], role='customer').first()

    if not user:
        return jsonify({'error': 'Mobile number not registered'}), 404

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403

    # Generate a random 6 digit OTP
    otp = str(random.randint(100000, 999999))

    # In real app: send OTP via SMS API
    # For now: just return it in response (for testing)
    print(f"OTP for {user.mobile}: {otp}")

    # Store OTP temporarily in user's password_hash field (simple approach)
    user.password_hash = otp
    db.session.commit()

    return jsonify({
        'message': 'OTP sent successfully',
        'otp': otp  # Remove this in production!
    }), 200


# Step 2: Verify OTP and login
@auth_bp.route('/login/customer/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user = User.query.filter_by(mobile=data['mobile'], role='customer').first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.password_hash != data['otp']:
        return jsonify({'error': 'Invalid OTP'}), 401

    # OTP matched — create JWT token
    token = create_access_token(identity={
        'id': user.id,
        'role': user.role,
        'name': user.name
    })

    # Clear OTP after use
    user.password_hash = None
    db.session.commit()

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200


# ─── WAITER LOGIN ────────────────────────────────────────────────────
@auth_bp.route('/login/waiter', methods=['POST'])
def waiter_login():
    data = request.get_json()

    user = User.query.filter_by(
        employee_code=data['employee_code'],
        role='waiter'
    ).first()

    if not user:
        return jsonify({'error': 'Invalid employee code'}), 404

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403

    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid password'}), 401

    token = create_access_token(identity={
        'id': user.id,
        'role': user.role,
        'name': user.name,
        'restaurant_id': user.restaurant_id
    })

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200


# ─── ADMIN LOGIN ─────────────────────────────────────────────────────
@auth_bp.route('/login/admin', methods=['POST'])
def admin_login():
    data = request.get_json()

    user = User.query.filter_by(
        email=data['email'],
        role='admin'
    ).first()

    if not user:
        return jsonify({'error': 'Admin not found'}), 404

    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid password'}), 401

    token = create_access_token(identity={
        'id': user.id,
        'role': user.role,
        'name': user.name
    })

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200