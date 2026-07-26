

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

# Create these here so every other file can import them
# They are not connected to any app yet — that happens inside create_app()
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    # Create the Flask application
    app = Flask(__name__)
    
    # Load settings from config.py
    app.config.from_object(Config)
    
    # Connect database to this app
    db.init_app(app)
    
    # Connect JWT login system to this app
    jwt.init_app(app)
    
    # Allow React (running on port 3000) to call Flask (running on port 5000)
    # Without this, browser blocks the request — it's a security feature called CORS
    CORS(app)
    from app.models.category import Category
    from app.models.menu_item import MenuItem
    from app.models.table import Table
    from app.models.customer import Customer
    from app.models.order import Order
    from app.models.order_item import OrderItem
    from app.models.bill import Bill

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    from app.routes.menu import menu_bp
    app.register_blueprint(menu_bp, url_prefix='/api')
    from app.routes.tables import tables_bp
    app.register_blueprint(tables_bp, url_prefix='/api')
    from app.routes.orders import orders_bp
    app.register_blueprint(orders_bp, url_prefix='/api')
    from app.routes.billing import billing_bp
    app.register_blueprint(billing_bp, url_prefix='/api') 
    from app.routes.analytics import analytics_bp
    app.register_blueprint(analytics_bp, url_prefix='/api')
    from app.routes.waiter import waiter_bp
    app.register_blueprint(waiter_bp, url_prefix='/api')
    return app