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

    return app