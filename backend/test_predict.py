import requests
import json

API_URL = 'http://127.0.0.1:5000'

def test_predict():
    payload = {
        "age_group": "adult",
        "vision_score": 0.8,
        "device_type": "desktop",
        "lighting_condition": "medium",
        "preferred_mode": "light"
    }
    
    print("Testing /predict with payload:", json.dumps(payload, indent=2))
    
    try:
        res = requests.post(f'{API_URL}/predict', json=payload)
        print(f"Status Code: {res.status_code}")
        try:
             print("Response:", res.json())
        except:
             print("Response text (safe):", res.text.encode('utf-8', errors='ignore'))
    except Exception as e:
        print("Request failed:", e)

if __name__ == '__main__':
    test_predict()
