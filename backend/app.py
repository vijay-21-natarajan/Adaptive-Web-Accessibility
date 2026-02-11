from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from database import db
from models import User, AccessibilityProfile, CognitiveLog
import joblib
import pandas as pd
import numpy as np
import traceback
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///accessibility.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
from datetime import timedelta
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize Extensions
db.init_app(app)
jwt = JWTManager(app)

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"DEBUG: Invalid token: {error}")
    return jsonify({"error": "invalid_token", "message": error}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"DEBUG: Missing token: {error}")
    return jsonify({"error": "unauthorized", "message": error}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "token_expired", "message": "The token has expired"}), 401

# Create tables
with app.app_context():
    db.create_all()

# Load models and encoders
font_model = joblib.load("font_model.pkl")
contrast_model = joblib.load("contrast_model.pkl")
label_encoders = joblib.load("label_encoders.pkl")

EXPECTED_FEATURES = ["age_group", "vision_score", "device_type", "lighting_condition", "preferred_mode"]

# Auth Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    # Create default profile
    new_profile = AccessibilityProfile(user=new_user)
    
    db.session.add(new_user)
    db.session.add(new_profile)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user_id=user.id), 200

    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    profile = user.profile
    return jsonify({
        "username": user.username,
        "email": user.email,
        "accessibility_profile": profile.to_dict() if profile else {}
    }), 200

@app.route('/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        print(f"DEBUG: update_profile for user {current_user_id}")
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        print(f"DEBUG: update data: {data}")
        profile = user.profile
        
        if not profile:
            profile = AccessibilityProfile(user_id=user.id)
            db.session.add(profile)
        
        if 'font_size' in data: profile.font_size = data['font_size']
        if 'contrast' in data: profile.contrast = data['contrast']
        if 'color_blind_mode' in data: profile.color_blind_mode = data['color_blind_mode']
        if 'voice_narration' in data: profile.voice_narration = data['voice_narration']
        if 'smart_highlighting' in data: profile.smart_highlighting = data['smart_highlighting']
        if 'focus_mode' in data: profile.focus_mode = data['focus_mode']
        if 'layout_preference' in data: profile.layout_preference = data['layout_preference']
        if 'voice_assistant_enabled' in data: profile.voice_assistant_enabled = data['voice_assistant_enabled']
        
        db.session.commit()
        print("DEBUG: profile updated successfully")
        
        return jsonify({"message": "Profile updated", "profile": profile.to_dict()}), 200
    except Exception as e:
        error_msg = f"\n[ERROR] in profile/update:\n{str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        with open("backend_error.log", "a", encoding="utf-8") as f:
            f.write(error_msg + "\n" + "="*50 + "\n")
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        user_data = request.get_json()
        # predict logic omitted for brevity in thought, but I must include the FULL logic here.
        # I'll restore it from my previous view_file.
        
        input_data = {
            "age_group": user_data.get("age_group", "adult"),
            "disability_type": user_data.get("disability_type", "visual"),
            "preferred_language": user_data.get("preferred_language", "English"),
            "cognitive_load_threshold": 0.5,
            "time_spent": 0.0,
            "scroll_depth": 0.0,
            "click_count": 0,
            "navigation_pattern": "['home']",
            "font_size": 18,
            "color_contrast": "normal",
            "narration_enabled": False, 
            "navigation_mode": "mouse",
            "highlight_links": False,
            "error_rate": 0.0,
            "reaction_time": 500.0,
            "cognitive_load_score": 0.5,
            "accessibility_score": 0.5
        }
        df = pd.DataFrame([input_data])
        for col, le in label_encoders.items():
            if col in df.columns:
                df[col] = df[col].astype(str)
                df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
                df[col] = le.transform(df[col])

        font_pred = font_model.predict(df)[0]
        contrast_pred = contrast_model.predict(df)[0]

        font_val = font_pred
        contrast_val = contrast_pred
        
        if isinstance(font_val, (int, float, np.number)):
            if font_val < 16: font_label = "small"
            elif font_val < 20: font_label = "medium"
            else: font_label = "large"
        else:
            font_label = "medium"
            
        contrast_map_lookup = {
            'normal': 'medium', 'high': 'high', 'custom': 'medium', 'low': 'low'
        }
        contrast_label = contrast_map_lookup.get(contrast_val, "medium")

        return jsonify({
            "predicted_font_size": font_label,
            "predicted_contrast": contrast_label
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Cognitive Routes
@app.route('/cognitive/report', methods=['POST'])
@jwt_required()
def report_cognitive_metrics():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        click_count = data.get('click_count', 0)
        time_spent = data.get('time_spent', 0.0)
        scroll_depth = data.get('scroll_depth', 0.0)
        error_count = data.get('error_count', 0)
        mouse_jitter = data.get('mouse_jitter', 0.0)
        dwell_time = data.get('dwell_time', 0.0)
        
        # Enhanced load score logic including jitter
        load_score = min(
            (click_count * 0.05) + 
            (time_spent * 0.001) + 
            (error_count * 0.2) + 
            (mouse_jitter * 0.4), 
            1.0
        )
        
        new_log = CognitiveLog(
            user_id=current_user_id, 
            click_count=click_count, 
            time_spent=time_spent, 
            scroll_depth=scroll_depth, 
            error_count=error_count, 
            mouse_jitter=mouse_jitter,
            dwell_time=dwell_time,
            cognitive_load_score=load_score
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify({
            "message": "Metrics reported", 
            "cognitive_load_score": load_score, 
            "status": "warning" if load_score > 0.7 else "ok"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/cognitive/history', methods=['GET'])
@jwt_required()
def get_cognitive_history():
    current_user_id = get_jwt_identity()
    logs = CognitiveLog.query.filter_by(user_id=current_user_id).order_by(CognitiveLog.timestamp.desc()).limit(20).all()
    return jsonify([log.to_dict() for log in logs]), 200

if __name__ == '__main__':
    with open("backend_error.log", "w") as f:
        f.write("=== Backend Started ===\n")
    app.run(debug=True, port=5000)
