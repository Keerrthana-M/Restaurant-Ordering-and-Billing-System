import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'foodiexpress-secret-key-2024-secure'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///foodiexpress.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 86400
    MAIL_EMAIL = 'madhucharu.vennila@gmail.com'
    MAIL_PASSWORD = 'xceauwdkjmdelixq'