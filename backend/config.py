class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///dropout.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "super-secret-key"
    JWT_SECRET_KEY = "jwt-super-secret-key"
