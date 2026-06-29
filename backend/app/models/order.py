from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    
    # dine-in or takeaway
    order_type = db.Column(db.String(20), nullable=False)
    
    # placed / preparing / served / billed
    status = db.Column(db.String(20), default='placed')
    
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    
    # Only for dine-in orders
    table_id = db.Column(db.Integer, db.ForeignKey('tables.id'), nullable=True)
    
    placed_at = db.Column(db.DateTime, default=datetime.utcnow)
    served_at = db.Column(db.DateTime, nullable=True)

    # One order has many items
    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_type': self.order_type,
            'status': self.status,
            'customer_id': self.customer_id,
            'restaurant_id': self.restaurant_id,
            'table_id': self.table_id,
            'placed_at': self.placed_at.isoformat(),
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'menu_item_id': self.menu_item_id,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'subtotal': self.subtotal
        }