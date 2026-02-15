# import secrets

# class Config:
#     SQLALCHEMY_DATABASE_URI = "sqlite:///dropout.db"
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
    
#     SECRET_KEY = secrets.token_hex(32)
#     JWT_SECRET_KEY = secrets.token_hex(32)

from datetime import timedelta
import secrets

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///dropout.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "super_secure_jwt_secret_key_123456789"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)