# Billard - Full Stack Project

A professional full-stack web application built with Django (backend) and React (frontend).

## 🏗️ Architecture

```
billard/
├── backend/                 # Django REST API
│   ├── backend/            # Django project settings
│   ├── accounts/           # Authentication app
│   ├── manager/            # Main application app
│   ├── requirements.txt    # Python dependencies
│   └── manage.py           # Django management script
├── frontend/               # React application (Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
├── docker-compose.yml     # Docker services configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, for production)

### Backend Setup

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   # Edit .env with your settings
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start backend server**
   ```bash
   python manage.py runserver
   ```

Backend will be available at: http://localhost:8000

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will be available at: http://localhost:5173

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login user |
| POST | /api/auth/logout/ | Logout user |
| GET | /api/auth/profile/ | Get user profile |
| GET | /api/users/ | List all users |
| GET | /api/users/<id>/ | Get user by ID |

### JWT Authentication

- **Access Token**: Valid for 60 minutes
- **Refresh Token**: Valid for 7 days

Include tokens in requests:
```
Authorization: Bearer <access_token>
```

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

## 🔧 Configuration

### Environment Variables (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| SECRET_KEY | Django secret key | - |
| DEBUG | Debug mode | True |
| ALLOWED_HOSTS | Allowed hosts | * |
| CORS_ALLOWED_ORIGINS | React frontend URL | http://localhost:5173 |
| DB_ENGINE | Database engine | django.db.backends.sqlite3 |
| DB_NAME | Database name | db.sqlite3 |
| DB_USER | Database user | - |
| DB_PASSWORD | Database password | - |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |

### Environment Variables (Frontend)

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000 |

## 🧪 Development

### Code Formatting

**Backend (Black)**
```bash
cd backend
black .
```

**Frontend (Prettier)**
```bash
cd frontend
npx prettier --write .
```

### Linting

**Backend (Flake8)**
```bash
cd backend
flake8
```

**Frontend (ESLint)**
```bash
cd frontend
npm run lint
```

## 📦 Tech Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **Simple JWT** - JWT authentication
- **Django CORS Headers** - CORS configuration
- **Python Dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router 6** - Routing
- **Axios** - HTTP client
- **JWT Decode** - Token decoding

### DevOps
- **Docker** - Containerization
- **PostgreSQL** - Production database
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Black** - Python formatting

## 📄 License

This project is licensed under the MIT License.
