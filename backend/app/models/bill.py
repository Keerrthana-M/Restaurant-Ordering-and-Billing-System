from app import db
from datetime import datetime

class Bill(db.Model):
    __tablename__ = 'bills'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), nullable=False)
    discount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    grand_total = db.Column(db.Numeric(10, 2), nullable=False)
    payment_mode = db.Column(db.String(20), nullable=True)
    billed_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default='unpaid')

    order = db.relationship('Order', backref=db.backref('bill', uselist=False), lazy=True)