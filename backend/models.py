from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    
    # One-to-one relationship with AccessibilityProfile
    profile = db.relationship('AccessibilityProfile', backref='user', uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class AccessibilityProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    
    # Preferences
    font_size = db.Column(db.String(20), default="medium") # small, medium, large
    contrast = db.Column(db.String(20), default="medium") # low, medium, high
    color_blind_mode = db.Column(db.String(20), default="none") # none, protanopia, deuteranopia, tritanopia
    voice_narration = db.Column(db.Boolean, default=False)
    
    # Cognitive Modeling
    cognitive_load_threshold = db.Column(db.Float, default=0.7)
    smart_highlighting = db.Column(db.Boolean, default=False)
    focus_mode = db.Column(db.Boolean, default=False)
    layout_preference = db.Column(db.String(20), default='standard') # 'standard', 'spacious', 'minimal'
    voice_assistant_enabled = db.Column(db.Boolean, default=False)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "font_size": self.font_size,
            "contrast": self.contrast,
            "color_blind_mode": self.color_blind_mode,
            "voice_narration": self.voice_narration,
            "cognitive_load_threshold": self.cognitive_load_threshold,
            "smart_highlighting": self.smart_highlighting,
            "focus_mode": self.focus_mode,
            "layout_preference": self.layout_preference,
            "voice_assistant_enabled": self.voice_assistant_enabled,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class CognitiveLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Interaction metrics
    click_count = db.Column(db.Integer, default=0)
    time_spent = db.Column(db.Float, default=0.0)
    scroll_depth = db.Column(db.Float, default=0.0)
    error_count = db.Column(db.Integer, default=0)
    
    # Analysis
    cognitive_load_score = db.Column(db.Float, default=0.0)
    mouse_jitter = db.Column(db.Float, default=0.0)
    dwell_time = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "click_count": self.click_count,
            "time_spent": self.time_spent,
            "scroll_depth": self.scroll_depth,
            "error_count": self.error_count,
            "cognitive_load_score": self.cognitive_load_score,
            "mouse_jitter": self.mouse_jitter,
            "dwell_time": self.dwell_time,
            "timestamp": self.timestamp.isoformat()
        }
