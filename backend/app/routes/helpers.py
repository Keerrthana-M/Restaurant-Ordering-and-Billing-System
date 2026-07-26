from flask_jwt_extended import get_jwt
from functools import wraps
from flask import jsonify

def admin_or_waiter_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') not in ['admin', 'waiter']:
            return jsonify({"error": "Access denied"}), 403
        return fn(*args, **kwargs)
    return wrapper