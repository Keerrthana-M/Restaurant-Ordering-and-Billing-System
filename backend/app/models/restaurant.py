from app import db
from datetime import datetime

class Restaurant(db.Model):
    __tablename__ = 'restaurants'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(15), nullable=False)
    gst_number = db.Column(db.String(50), nullable=True)
    gst_percentage = db.Column(db.Float, default=5.0)
    opening_hours = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # The admin who owns this restaurant
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships — lets you do restaurant.tables, restaurant.menu_items etc.
    tables = db.relationship('RestaurantTable', backref='restaurant', lazy=True)
    categories = db.relationship('Category', backref='restaurant', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'contact': self.contact,
            'gst_percentage': self.gst_percentage,
            'opening_hours': self.opening_hours,
            'is_active': self.is_active
        }