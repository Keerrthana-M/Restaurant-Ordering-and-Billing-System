from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    # New field
    name = db.Column(db.String(100), nullable=True)

    mobile_number = db.Column(db.String(15), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), nullable=False)  # customer, waiter, admin
    waiter_code = db.Column(db.String(20), unique=True, nullable=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Restaurant(db.Model):
    __tablename__ = 'restaurants'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    area = db.Column(db.String(120), nullable=True)
    cuisine_type = db.Column(db.String(80), nullable=True)
    qr_code_token = db.Column(db.String(64), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    # Added Profile Fields
    contact_number = db.Column(db.String(20), nullable=True)
    description = db.Column(db.String(500), nullable=True)
    opening_hours = db.Column(db.String(100), nullable=True)
    logo = db.Column(db.String(500), nullable=True)
    gst_number = db.Column(db.String(20), nullable=True)  # Optional GST number for registered owners

    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True)

class RestaurantTable(db.Model):
    __tablename__ = 'restaurant_tables'

    id = db.Column(db.Integer, primary_key=True)

    restaurant_id = db.Column(
        db.Integer,
        db.ForeignKey('restaurants.id'),
        nullable=False
    )

    table_number = db.Column(db.Integer, nullable=False)

    qr_code_token = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    restaurant = db.relationship(
        'Restaurant',
        backref='tables'
    )


class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)

    restaurant_id = db.Column(
        db.Integer,
        db.ForeignKey('restaurants.id'),
        nullable=False
    )

    name = db.Column(
        db.String(120),
        nullable=False
    )

    category = db.Column(
        db.String(80),
        nullable=True
    )

    price = db.Column(
        db.Float,
        nullable=False
    )

    description = db.Column(
        db.String(255),
        nullable=True
    )

    # ⭐ New column
    image_url = db.Column(
        db.String(500),
        nullable=True
    )

    is_available = db.Column(
        db.Boolean,
        default=True
    )


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    waiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    table_number = db.Column(db.Integer, nullable=True)
    order_type = db.Column(db.String(20), nullable=False)  # dine_in, takeaway
    status = db.Column(db.String(20), default='pending')  # pending, preparing, ready, delivered
    total_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True)


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)