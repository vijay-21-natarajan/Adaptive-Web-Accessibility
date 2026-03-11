# Adaptive Web Accessibility

A comprehensive web accessibility solution that adapts to individual user needs using machine learning. This project includes a Flask backend API, React frontend, and browser extension for seamless accessibility features.

## Project Overview

Adaptive Web Accessibility provides:
- **Smart Accessibility Features**: Automatically detects and adapts to user accessibility needs
- **Machine Learning Integration**: Uses ML models to predict optimal accessibility settings
- **User Authentication**: Secure JWT-based authentication system
- **Accessibility Profiles**: Personalized accessibility preferences (font size, contrast, color-blind modes, voice narration)
- **Cognitive Tracking**: Monitors and tracks user cognitive patterns
- **Browser Extension**: Quick access to accessibility features from any website
- **REST API**: Comprehensive backend API for all operations

## Tech Stack

- **Backend**: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, scikit-learn
- **Frontend**: React, React Router, Axios
- **Browser Extension**: Vanilla JavaScript
- **Database**: SQLite
- **ML Models**: scikit-learn, pandas, numpy

## Project Structure

```
Adaptive-Web-Accessibility/
├── backend/                    # Flask backend API
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── database.py            # Database configuration
│   ├── requirements.txt        # Python dependencies
│   ├── instance/              # SQLite database
│   └── accessibility.db       # User data and profiles
├── frontend/                   # React web application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context (Auth, Accessibility)
│   │   ├── services/          # Service layer (API calls)
│   │   └── App.js             # Main App component
│   ├── public/                # Static files
│   └── package.json           # Node dependencies
├── extension/                  # Browser extension
│   ├── manifest.json          # Extension manifest
│   ├── background.js          # Background service worker
│   ├── content.js             # Content script
│   └── popup.html/js          # Popup UI
└── README.md                  # This file
```

## Prerequisites

- **Python** 3.8 or higher
- **Node.js** 14 or higher and **npm** 6 or higher
- **Git** (for cloning the repository)
- A modern web browser (Chrome, Firefox, Edge, Safari)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/vijay-21-natarajan/Adaptive-Web-Accessibility.git
cd Adaptive-Web-Accessibility
```

### 2. Backend Setup

#### Create and Activate Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Backend Dependencies
#### Terminal 1
```bash
cd backend
pip install -r requirements.txt
```

#### Initialize Database

```bash
# From the backend directory
python database.py
```

### 3. Frontend Setup

#### Install Frontend Dependencies
#### Terminal 2
```bash
cd frontend
npm install
```

## Running the Project

### Option 1: Run Both Backend and Frontend (Recommended)

Open two terminal windows in the project root directory:

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Application opens at http://localhost:3000
```



## Backend API Endpoints

### Authentication
- `POST /register` - Create a new user account
- `POST /login` - User login
- `POST /logout` - User logout

### User Profile
- `GET /profile` - Get user accessibility profile
- `PUT /profile` - Update accessibility profile
- `GET /user` - Get current user info

### Accessibility Features
- `GET /accessibility-status` - Get current accessibility status
- `POST /voice-command` - Process voice commands
- `GET /stress-level` - Get user stress level

### Predictions
- `POST /predict` - Get ML-based accessibility recommendations

## Frontend Components

### Key Components
- **Login.js** - User authentication
- **Dashboard.js** - Main dashboard with accessibility overview
- **AccessibilityForm.js** - Accessibility settings form
- **CognitiveTracker.js** - Cognitive load tracking
- **StressHeatmap.js** - Stress level visualization
- **SmartAlert.js** - Smart notifications

### Context Providers
- **AuthContext** - Authentication state management
- **AccessibilityContext** - Accessibility settings management

## Browser Extension Setup

### Install Extension in Chrome/Edge

1. Open the browser and navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
2. Enable **Developer Mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to the `extension` folder in this project
5. Select and open the folder

### Install Extension in Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `extension/manifest.json`

## Environment Variables

### Backend (.env file in backend directory)

```
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=app.py
DATABASE_URL=sqlite:///accessibility.db
JWT_SECRET_KEY=your-secret-key-here
```

**⚠️ Important**: Change `JWT_SECRET_KEY` in production!

## Database Models

### User
- `id` - Primary key
- `username` - Unique username
- `email` - User email
- `password_hash` - Hashed password

### AccessibilityProfile
- `id` - Primary key
- `user_id` - Foreign key to User
- `font_size` - small, medium, large
- `contrast` - low, medium, high
- `color_blind_mode` - none, protanopia, deuteranopia, tritanopia
- `voice_narration` - Boolean

### CognitiveLog
- `id` - Primary key
- `user_id` - Foreign key to User
- `timestamp` - Log timestamp
- `cognitive_load` - Measured cognitive load value

## Testing

### Backend Tests

```bash
cd backend
python test_api.py        # Test API endpoints
python test_predict.py    # Test ML predictions
```

### Frontend Tests

```bash
cd frontend
npm test                  # Run React tests
```

## Configuration

### Accessibility Settings

Users can customize:
- **Font Size**: Small (12px), Medium (16px), Large (20px)
- **Contrast**: Low, Medium, High
- **Color Blind Mode**: None, Protanopia, Deuteranopia, Tritanopia
- **Voice Narration**: Enable/Disable
- **Animation Reduction**: Enable/Disable
- **Focus Indicators**: Enable/Disable

## Production Deployment

### Backend (Gunicorn)

```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Build & Deploy)

```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Database errors:**
```bash
cd backend
rm instance/accessibility.db
python database.py
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Specify a different port
PORT=3001 npm start
```

**Dependencies issues:**
```bash
rm -r node_modules package-lock.json
npm install
```

### CORS Errors

Ensure backend is running on `http://localhost:5000` and has CORS enabled in `app.py`.

## Security Considerations

⚠️ **Important Security Notes:**

1. **Change JWT Secret Key**
   - Update `JWT_SECRET_KEY` in backend configuration before production deployment
   - Use a strong, random string

2. **HTTPS in Production**
   - Always use HTTPS for production environments
   - Update API endpoints from `http://` to `https://`

3. **Environment Variables**
   - Never commit `.env` files to version control
   - Use environment-specific configurations

4. **Password Security**
   - Passwords are hashed using werkzeug.security
   - Implement password strength validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the License - see the [LICENSE](LICENSE) file for details.

## Authors

**Vijay Natarajan R**
- Email: vijaynatarajan2310632@ssn.edu.in
- GitHub: [vijay-21-natarajan](https://github.com/vijay-21-natarajan)

## Support

For issues, questions, or suggestions, please open an issue on [GitHub Issues](https://github.com/vijay-21-natarajan/Adaptive-Web-Accessibility/issues).

## Acknowledgments

- Built with Flask, React, and scikit-learn
- Machine learning models for accessibility prediction
- Community accessibility best practices and WCAG guidelines

---

**Last Updated:** March 2026
**Version:** 1.0.0
