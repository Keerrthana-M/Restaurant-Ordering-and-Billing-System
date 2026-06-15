from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    
    # role can be: 'customer', 'waiter', 'admin'
    role = db.Column(db.String(20), nullable=False)
    
    name = db.Column(db.String(100), nullable=False)
    
    # Customers login with mobile + OTP
    mobile = db.Column(db.String(15), unique=True, nullable=True)
    
    # Admins and waiters login with email/employee_code + password
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=True)
    
    # Waiter specific — which restaurant they belong to
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=True)
    employee_code = db.Column(db.String(50), nullable=True)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'mobile': self.mobile,
            'email': self.email,
            'is_active': self.is_active
        }