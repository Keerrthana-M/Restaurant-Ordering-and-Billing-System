import os
from datetime import timedelta

class Config:
    SECRET_KEY = 'dev-secret-key-change-later'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///foodiexpress.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = 'dev-jwt-secret-change-later'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'