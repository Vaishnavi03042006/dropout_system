# import os
# import pickle
# import numpy as np

# from sklearn.linear_model import LogisticRegression
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler
# from sklearn.metrics import classification_report

# from services.feature_builder import build_all_student_features

# # ---------- MODEL PATH ----------
# MODEL_PATH = os.path.join(
#     os.path.dirname(__file__),
#     "..",
#     "models",
#     "dropout_model.pkl"
# )

# # ---------- TRAIN ML MODEL ----------
# def train_ml_model():
#     """
#     Train ML model using derived dropout_status
#     Labels:
#         0 = LOW
#         1 = MEDIUM
#         2 = HIGH
#     """

#     features_list = build_all_student_features()

#     if not features_list or len(features_list) < 5:
#         print("❌ Not enough data to train ML model")
#         return False

#     X = []
#     y = []

#     for features in features_list:
#         # Feature vector
#         X.append([
#             features["attendance_percentage"],
#             features["avg_score"],
#             features["attempts_used"],
#             features["fee_pending"]
#         ])

#         # Label (derived in feature_builder)
#         y.append(features["dropout_status"])

#     X = np.array(X)
#     y = np.array(y)

#     # ---------- CHECK LABEL DISTRIBUTION ----------
#     unique_labels = set(y)
#     print(f"📊 Total samples: {len(y)}")
#     print(f"📌 Label distribution: {unique_labels}")

#     if len(unique_labels) < 2:
#         print("❌ Need at least 2 classes to train ML")
#         return False

#     # ---------- TRAIN / TEST SPLIT ----------
#     X_train, X_test, y_train, y_test = train_test_split(
#         X,
#         y,
#         test_size=0.2,
#         random_state=42,
#         stratify=y
#     )

#     # ---------- SCALING ----------
#     scaler = StandardScaler()
#     X_train = scaler.fit_transform(X_train)
#     X_test = scaler.transform(X_test)

#     # ---------- MODEL ----------
#     model = LogisticRegression(
#         multi_class="multinomial",
#         solver="lbfgs",
#         max_iter=1000,
#         class_weight="balanced",
#         random_state=42
#     )

#     model.fit(X_train, y_train)

#     # ---------- EVALUATION ----------
#     y_pred = model.predict(X_test)

#     print("✅ ML Model Evaluation")
#     print(classification_report(y_test, y_pred))

#     # ---------- SAVE MODEL ----------
#     os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

#     with open(MODEL_PATH, "wb") as f:
#         pickle.dump((model, scaler), f)

#     print(f"💾 Model saved at: {MODEL_PATH}")
#     return True


# # ---------- ML PREDICTION ----------
# def predict_risk_level(features):
#     with open(MODEL_PATH, "rb") as f:
#         model, scaler = pickle.load(f)

#     feature_vector = np.array([
#         features["attendance_percentage"],
#         features["avg_score"],
#         features["attempts_used"],
#         features["fee_pending"]
#     ]).reshape(1, -1)

#     feature_vector = scaler.transform(feature_vector)
#     dropout_prob = model.predict_proba(feature_vector)[0][1]

#     ml_score = round(dropout_prob * 10, 2)
#     print(f"⚡ ML prediction for student {features['student_id']}: {ml_score}")

#     if dropout_prob >= 0.7:
#         ml_risk_level = "HIGH"
#     elif dropout_prob >= 0.4:
#         ml_risk_level = "MEDIUM"
#     else:
#         ml_risk_level = "LOW"

#     return ml_score, ml_risk_level


# # ---------- SCRIPT ENTRY ----------
# # Only run ML training when this file is executed directly
# if __name__ == "__main__":
#     from app import app  # ⚡ your Flask app file
#     with app.app_context():  # ⚡ activate Flask context
#         success = train_ml_model()
#         if success:
#             print("✅ ML model trained and saved successfully!")
#         else:
#             print("❌ ML model training failed")
import os
import pickle
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# ------------------ CONFIG ------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "student_dropout.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "student_dropout_model.pkl")

# ------------------ TRAIN ML MODEL ------------------
def train_ml_model():
    """
    Train ML model using historical dataset
    """

    # Load dataset
    df = pd.read_csv(DATA_PATH)

    # Drop irrelevant columns
    if "Student_ID" in df.columns:
        df = df.drop("Student_ID", axis=1)

    # Encode categorical columns
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

    # Fill missing numeric values
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    # Features and target
    y = df["Target"]
    X = df.drop("Target", axis=1)

    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scaling
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # Model
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        class_weight="balanced",
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    print("✅ ML Model Evaluation")
    print(classification_report(y_test, y_pred))

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump((model, scaler, X.columns.tolist()), f)

    print(f"💾 Model saved at {MODEL_PATH}")
    return True

# ------------------ ML PREDICTION ------------------
def predict_risk_level(features):
    """
    Predict dropout probability and risk level for a single student
    """
    if not os.path.exists(MODEL_PATH):
        return 0, "LOW"

    with open(MODEL_PATH, "rb") as f:
        model, scaler, feature_cols = pickle.load(f)

    # Build input vector for Kaggle model from DB features
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
            x.append(0)  # default for missing Kaggle features

    x = np.array(x).reshape(1, -1)
    x_scaled = scaler.transform(x)

    proba = model.predict_proba(x_scaled)[0]
    ml_score = round(max(proba) * 10, 2)

    risk_index = np.argmax(proba)
    risk_level = ["LOW", "MEDIUM", "HIGH"][risk_index]

    return ml_score, risk_level

# ------------------ SCRIPT ENTRY ------------------
if __name__ == "__main__":
    success = train_ml_model()
    if success:
        print("✅ ML model trained and saved successfully!")
    else:
        print("❌ ML model training failed")