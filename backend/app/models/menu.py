from app import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)

    # One category has many menu items
    items = db.relationship('MenuItem', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'restaurant_id': self.restaurant_id
        }


class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    is_vegetarian = db.Column(db.Boolean, default=False)
    is_available = db.Column(db.Boolean, default=True)
    
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'is_vegetarian': self.is_vegetarian,
            'is_available': self.is_available,
            'category_id': self.category_id
        }