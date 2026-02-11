import requests

API_URL = 'http://127.0.0.1:5000'

def test_auth():
    # Register
    print('Registering...')
    try:
        res = requests.post(f'{API_URL}/register', json={
            'username': 'testuser_api',
            'email': 'test_api@example.com',
            'password': 'password123'
        })
        print('Register:', res.status_code, res.json())
    except Exception as e:
        print("Registration Request Failed:", e)
        return

    # Login
    print('Logging in...')
    try:
        res = requests.post(f'{API_URL}/login', json={
            'username': 'testuser_api',
            'password': 'password123'
        })
        print('Login:', res.status_code)
        if res.status_code != 200:
            print("Login failed:", res.text)
            return

        token = res.json().get('access_token')
        print('Token received')
    except Exception as e:
        print("Login Request Failed:", e)
        return

    # Get Profile
    print('Fetching profile...')
    headers = {'Authorization': f'Bearer {token}'}
    try:
        res = requests.get(f'{API_URL}/profile', headers=headers)
        print('Profile:', res.json())
    except Exception as e:
         print("Get Profile Failed:", e)

    # Update Profile
    print('Updating profile...')
    try:
        res = requests.put(f'{API_URL}/profile/update', json={
            'font_size': 'large',
            'contrast': 'high'
        }, headers=headers)
        print('Update:', res.json())
    except Exception as e:
        print("Update Profile Failed:", e)

    # Verify Update
    print('Verifying update...')
    try:
        res = requests.get(f'{API_URL}/profile', headers=headers)
        print('Updated Profile:', res.json())
    except Exception as e:
        print("Verify Update Failed:", e)

if __name__ == '__main__':
    test_auth()
