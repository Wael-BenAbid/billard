# Billard - Full Stack Web Application

A professional full-stack web application built with Django (backend) and React + Vite (frontend).

## 🏗️ Architecture

```
billard/
├── backend/                 # Django + DRF Backend
│   ├── config/             # Main Django project settings
│   │   ├── settings.py    # Django settings
│   │   ├── urls.py        # URL configuration
│   │   └── exceptions.py  # Custom exception handler
│   ├── accounts/           # User authentication app
│   │   ├── models.py      # Custom User model
│   │   ├── serializers.py # DRF serializers
│   │   ├── views.py       # API views
│   │   └── urls.py        # Account URLs
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Docker configuration
│   └── .env               # Environment variables (create from template)
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   ├── Dockerfile         # Docker configuration
│   └── vite.config.js     # Vite configuration
├── docker-compose.yml      # Docker Compose configuration
└── README.md              # This file
```

## 🚀 Features

- **Backend (Django + DRF)**:
  - RESTful API with Django Rest Framework
  - JWT Authentication (Login, Register, Refresh, Logout)
  - Custom User model with email as primary identifier
  - CORS configuration for frontend integration
  - PostgreSQL database support
  - Custom exception handling

- **Frontend (React + Vite)**:
  - Modern React with hooks
  - JWT token management with automatic refresh
  - Protected routes
  - Responsive design
  - Axios for API calls
  - ESLint + Prettier configuration

- **DevOps**:
  - Docker Compose for local development
  - PostgreSQL container
  - Separate containers for backend and frontend

## 📋 Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Option 1: Local Development (without Docker)

#### 1. Clone the repository
```bash
cd billard
```

#### 2. Backend Setup

```bash
# Create virtual environment
python -m venv backend/venv

# Activate virtual environment (Windows)
backend\venv\Scripts\activate

# (Linux/Mac)
source backend/venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Health: http://localhost:8000/api/accounts/health/

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Security
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database
DB_NAME=billard_db
DB_USER=billard_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET_KEY=your-jwt-refresh-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/register/` | Register new user |
| POST | `/api/accounts/login/` | Login and get tokens |
| POST | `/api/accounts/token/refresh/` | Refresh access token |
| POST | `/api/accounts/logout/` | Logout (blacklist token) |
| GET | `/api/accounts/profile/` | Get user profile |
| PUT | `/api/accounts/profile/` | Update user profile |
| PUT | `/api/accounts/change-password/` | Change password |

### Example: Register

```bash
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    ...
  }
}
```

## 🎨 Frontend Pages

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard (requires authentication)

## 🧪 Development Commands

### Backend

```bash
# Activate virtual environment
source backend/venv/bin/activate  # Linux/Mac
backend\venv\Scripts\activate     # Windows

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Check for issues
python manage.py check
```

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh

# Access database
docker-compose exec postgres psql -U billard_user -d billard_db
```

## 📦 Tech Stack

### Backend
- Django 4.2+
- Django Rest Framework 3.14+
- Simple JWT 5.3+
- Django CORS Headers 4.3+
- PostgreSQL 15+

### Frontend
- React 18+
- Vite 5+
- React Router 6+
- Axios 1.6+
- JWT Decode 4.2+

### DevOps
- Docker
- Docker Compose
- PostgreSQL

## 🔒 Security Considerations

- All passwords are hashed using Django's built-in password hasher
- JWT tokens have expiration times (configurable)
- CORS is configured to only allow specific origins
- Environment variables are used for sensitive data
- API endpoints require authentication by default

## 📄 License

This project is licensed under the MIT License.
