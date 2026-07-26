from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey('tables.id'), nullable=True)
    order_type = db.Column(db.String(20), nullable=False)  # 'dine-in' or 'takeaway'
    status = db.Column(db.String(20), nullable=False, default='placed')
    placed_at = db.Column(db.DateTime, default=datetime.utcnow)
    served_at = db.Column(db.DateTime, nullable=True)

    items = db.relationship('OrderItem', backref='order', lazy=True)
    table = db.relationship('Table', backref='orders', lazy=True)