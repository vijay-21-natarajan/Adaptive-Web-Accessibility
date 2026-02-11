import joblib
import os

# Load the model to get the expected features
model_path = "font_model.pkl"

if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
        
        # Check if the model has feature names stored
        if hasattr(model, "feature_names_in_"):
            features = model.feature_names_in_
        else:
            features = ["Could not retrieve feature names from model"]
            print("Warning: Model does not have 'feature_names_in_' attribute.")

        with open("columns.txt", "w") as f:
            f.write("FEATURE COLUMNS:\n")
            for feat in features:
                f.write(str(feat) + "\n")
                
        print(f"Done writing {len(features)} columns to columns.txt")
        
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model file {model_path} not found.")
