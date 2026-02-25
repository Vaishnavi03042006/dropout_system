from services.ml_model import train_ml_model

if __name__ == "__main__":
    success = train_ml_model()
    if success:
        print("✅ ML model trained and saved successfully")