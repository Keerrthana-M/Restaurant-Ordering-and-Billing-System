from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from app import db
from app.models.customer import Customer
from app.utils import generate_otp, send_otp_email

auth_bp = Blueprint('auth', __name__)


# ─── ADMIN LOGIN ─────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Customer.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account deactivated"}), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )

    return jsonify({
        "token": token,
        "role": user.role,
        "name": user.name
    }), 200


# ─── WAITER LOGIN ─────────────────────────────────────────────────
@auth_bp.route('/waiter-login', methods=['POST'])
def waiter_login():
    data = request.get_json()
    waiter_code = data.get('waiter_code')

    waiter = Customer.query.filter_by(
        waiter_code=waiter_code,
        role='waiter'
    ).first()

    if not waiter:
        return jsonify({"error": "Invalid waiter code"}), 401

    if not waiter.is_active:
        return jsonify({"error": "Account deactivated"}), 403

    token = create_access_token(
        identity=str(waiter.id),
        additional_claims={"role": waiter.role}
    )

    return jsonify({
        "token": token,
        "role": waiter.role,
        "name": waiter.name
    }), 200


# ─── CUSTOMER OTP LOGIN ───────────────────────────────────────────
@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    mobile = data.get('mobile')
    email = data.get('email')

    if not mobile or not email:
        return jsonify({"error": "Mobile and email are required"}), 400

    # Find or create customer
    customer = Customer.query.filter_by(mobile=mobile).first()

    if not customer:
        # New customer — create account
        customer = Customer(
            mobile=mobile,
            email=email,
            role='customer',
            is_active=True
        )
        db.session.add(customer)

    # Generate OTP
    otp = generate_otp()
    customer.otp = otp
    customer.otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    db.session.commit()

    # Send OTP email
    success = send_otp_email(email, otp)

    if success:
        return jsonify({
            "message": f"OTP sent to {email}"
        }), 200
    else:
        return jsonify({"error": "Failed to send OTP email"}), 500


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    mobile = data.get('mobile')
    otp = data.get('otp')

    customer = Customer.query.filter_by(mobile=mobile).first()

    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # Check OTP
    if customer.otp != otp:
        return jsonify({"error": "Invalid OTP"}), 401

    # Check expiry
    if datetime.utcnow() > customer.otp_expiry:
        return jsonify({"error": "OTP expired"}), 401

    # Clear OTP after successful verification
    customer.otp = None
    customer.otp_expiry = None
    db.session.commit()

    token = create_access_token(
        identity=str(customer.id),
        additional_claims={"role": customer.role}
    )

    return jsonify({
        "token": token,
        "role": customer.role,
        "name": customer.name or "Customer"
    }), 200


# ─── GET CURRENT USER ─────────────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')

    user = Customer.query.get(int(user_id))

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "mobile": user.mobile,
        "role": role
    }), 200

# ─── WAITER CREATION ─────────────────────────────────────────────────
@auth_bp.route('/admin/add-waiter', methods=['POST'])
@jwt_required()
def add_waiter():
    from app.routes.helpers import admin_required
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin only"}), 403
    data = request.get_json()
    import random, string
    waiter_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    waiter = Customer(
        name=data.get('name'),
        email=data.get('email'),
        password_hash='',
        role='waiter',
        waiter_code=waiter_code,
        is_active=True
    )
    db.session.add(waiter)
    db.session.commit()
    return jsonify({
        "message": "Waiter created",
        "waiter_code": waiter_code,
        "name": waiter.name
    }), 201