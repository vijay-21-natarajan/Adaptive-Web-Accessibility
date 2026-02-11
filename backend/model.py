from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pandas as pd
import ast
import joblib  # For saving models

# Load the dataset
file_path = "adaptive_accessibility_dataset.csv"
df = pd.read_csv(file_path)

# Copy dataframe to avoid modifying the original
data = df.copy()

# Parse 'system_adaptation' column into separate target features
def parse_system_adaptation(val):
    try:
        parsed = ast.literal_eval(val)
        return parsed.get("font_size"), parsed.get("contrast")
    except Exception:
        return None, None

data["target_font_size"], data["target_contrast"] = zip(*data["system_adaptation"].map(parse_system_adaptation))
data = data.dropna(subset=["target_font_size", "target_contrast"])

# Select features (excluding system_adaptation and targets, plus IDs/outcomes)
drop_cols = [
    "system_adaptation", "target_font_size", "target_contrast",
    "user_id", "session_id", "page_id", 
    "user_feedback", "task_completion_rate", "satisfaction_score", "improvement_over_time"
]
features = data.drop(columns=drop_cols, errors='ignore')

# Encode categorical variables
label_encoders = {}
for col in features.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    features[col] = le.fit_transform(features[col].astype(str))
    label_encoders[col] = le

# Split data for each target
X_train, X_test, y_font_train, y_font_test = train_test_split(features, data["target_font_size"], test_size=0.2, random_state=42)
_, _, y_contrast_train, y_contrast_test = train_test_split(features, data["target_contrast"], test_size=0.2, random_state=42)

# Train two RandomForest models
font_model = RandomForestClassifier(random_state=42)
contrast_model = RandomForestClassifier(random_state=42)

font_model.fit(X_train, y_font_train)
contrast_model.fit(X_train, y_contrast_train)

# Predict and Evaluate
font_pred = font_model.predict(X_test)
contrast_pred = contrast_model.predict(X_test)

font_acc = accuracy_score(y_font_test, font_pred)
contrast_acc = accuracy_score(y_contrast_test, contrast_pred)

print("\n=== MODEL PERFORMANCE ===")
print(f"Font Size Model Accuracy: {font_acc:.2f}")
print(f"Contrast Model Accuracy: {contrast_acc:.2f}")

print("\n=== Font Size Classification Report ===")
print(classification_report(y_font_test, font_pred, zero_division=0))

print("\n=== Contrast Classification Report ===")
print(classification_report(y_contrast_test, contrast_pred, zero_division=0))

# Example prediction
sample = X_test.iloc[0:1]
font_pred_sample = font_model.predict(sample)[0]
contrast_pred_sample = contrast_model.predict(sample)[0]

print("\n=== Sample Prediction ===")
print("User Features:", sample.to_dict(orient='records')[0])
print(f"Predicted Font Size: {font_pred_sample}")
print(f"Predicted Contrast: {contrast_pred_sample}")

# ✅ Save trained models and encoders
joblib.dump(font_model, "font_model.pkl")
joblib.dump(contrast_model, "contrast_model.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")

print("\nModels saved successfully as:")
print(" - font_model.pkl")
print(" - contrast_model.pkl")
print(" - label_encoders.pkl")
