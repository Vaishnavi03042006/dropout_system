from flask import Flask
from config import Config
from extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)

    # Import Blueprints
    from routes.auth import auth_bp
    from routes.protected import protected_bp
    from routes.students import student_bp
    from routes.attendance import attendance_bp
    from routes.result import result_bp
    from routes.fees import fees_bp
    from routes.upload_excel import upload_bp
    from routes.feature_test import feature_test_bp

    from routes.risk_analysis import risk_bp

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(protected_bp, url_prefix="/api")
    app.register_blueprint(student_bp, url_prefix="/api/students")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    app.register_blueprint(result_bp, url_prefix="/api/results")
    app.register_blueprint(fees_bp, url_prefix="/api/fees")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(feature_test_bp, url_prefix="/api/features")
    app.register_blueprint(risk_bp, url_prefix="/api/risk")

    # Create database tables
    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
