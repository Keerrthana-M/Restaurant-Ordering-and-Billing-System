import os

class Config:
    # Secret key used to sign JWT login tokens
    # If someone knows this key they can fake logins — keep it secret
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'foodiexpress-secret-key'
    
    # Path to the SQLite database file
    # The /// means relative path from the backend folder
    SQLALCHEMY_DATABASE_URI = 'sqlite:///foodiexpress.db'
    
    # We don't need Flask to track every model change — turn it off
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Login token expires after 1 day (in seconds)
    JWT_ACCESS_TOKEN_EXPIRES = 86400