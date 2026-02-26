import os
import pickle
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# ------------------ CONFIG ------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "student_dropout.csv")
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "student_dropout_model.pkl")

# ------------------ GLOBAL MODEL LOAD ------------------

model = None
scaler = None
feature_cols = None
label_encoder = None

if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model, scaler, feature_cols, label_encoder = pickle.load(f)

# ------------------ TRAIN ML MODEL ------------------

def train_ml_model():
    """
    Train ML model using historical dataset
    """

    df = pd.read_csv(DATA_PATH)

    if "Student_ID" in df.columns:
        df = df.drop("Student_ID", axis=1)

    categorical_cols = [
        "Marital status", "Application mode", "Course",
        "Daytime/evening attendance", "Previous qualification",
        "Nacionality", "Mother's qualification", "Father's qualification",
        "Mother's occupation", "Father's occupation", "Displaced",
        "Educational special needs", "Debtor", "Tuition fees up to date",
        "Gender", "Scholarship holder", "International"
    ]

    for col in categorical_cols:
        if col in df.columns:
            df[col] = LabelEncoder().fit_transform(df[col].astype(str))

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    # Encode Target
    label_encoder_local = LabelEncoder()
    y = label_encoder_local.fit_transform(df["Target"])
    X = df.drop("Target", axis=1)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler_local = StandardScaler()
    X_train_scaled = scaler_local.fit_transform(X_train)
    X_test_scaled = scaler_local.transform(X_test)

    model_local = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        class_weight="balanced",
        random_state=42
    )

    model_local.fit(X_train_scaled, y_train)

    y_pred = model_local.predict(X_test_scaled)

    print("\n✅ ML Model Evaluation")
    print(classification_report(y_test, y_pred))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(
            (model_local, scaler_local, X.columns.tolist(), label_encoder_local),
            f
        )

    print(f"\n💾 Model saved at {MODEL_PATH}")

    return True


# ------------------ PREDICTION FUNCTION ------------------

def predict_risk_level(features, stage="early"):
    """
    Predict dropout probability + mapped risk level + explainability
    """

    global model, scaler, feature_cols, label_encoder

    if model is None:
        print("⚠ Model not loaded")
        return 0.0, "LOW", []

    x = []

    for col in feature_cols:

        if col == "Curricular units 1st sem (credited)":
            x.append(features.get("attendance_percentage", 0))

        elif col == "Curricular units 1st sem (grade)":
            x.append(features.get("avg_score", 0))

        elif col == "Curricular units 1st sem (enrolled)":
            x.append(features.get("attempts_used", 0))

        elif col in ["Debtor", "Tuition fees up to date"]:
            x.append(features.get("fee_pending", 0))

        else:
            x.append(0)

    input_df = pd.DataFrame([x], columns=feature_cols)

    x_scaled = scaler.transform(input_df)

    # 🔥 Correct Dropout Probability Logic
    proba = model.predict_proba(x_scaled)[0]
    class_labels = label_encoder.classes_

    if "Dropout" not in class_labels:
        print("⚠ 'Dropout' class not found in label encoder")
        return 0.0, "LOW", []

    dropout_index = list(class_labels).index("Dropout")
    dropout_probability = proba[dropout_index]

    ml_score = round(float(dropout_probability) * 10, 2)

    # Risk mapping based ONLY on dropout probability
    if dropout_probability >= 0.7:
        mapped_level = "HIGH"
    elif dropout_probability >= 0.4:
        mapped_level = "MEDIUM"
    else:
        mapped_level = "LOW"

    # -------- Explainability --------
    importances = model.feature_importances_
    feature_importance = dict(zip(feature_cols, importances))

    top_features = sorted(
        feature_importance.items(),
        key=lambda x: x[1],
        reverse=True
    )[:5]
    

    return ml_score, mapped_level, top_features


# ------------------ SCRIPT ENTRY ------------------

if __name__ == "__main__":
    success = train_ml_model()
    if success:
        print("✅ ML model trained successfully!")
    else:
        print("❌ ML model training failed")
