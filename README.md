# Prompti Vault

> A comprehensive prompt library platform for curating, managing, and sharing AI prompts with role-based access control and anonymous rating system.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Module Documentation](#module-documentation)
- [User Workflows](#user-workflows)
- [Installation](#installation)
- [Configuration](#configuration)
- [DevOps & Deployment](#devops--deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

**Prompti Vault** is a full-stack web application designed to manage and share AI prompts effectively. It provides a structured platform where administrators can manage categories and tags, authors can create and publish prompt articles (prompti), and the general public can browse, search, and rate prompts without authentication.

The platform features dynamic branding capabilities, allowing easy white-labeling through an admin settings panel.

### Key Capabilities

- **Multi-role System**: Admin, Author, and Public access levels
- **Dynamic Branding**: Configurable logo, company name, and footer links
- **Search & Filter**: Category-based filtering and full-text search
- **Anonymous Ratings**: Public users can rate and review prompts without login
- **Case-Insensitive Auth**: Email authentication works regardless of case
- **Optimized Performance**: Batch database queries for sub-100ms response times

---

## ✨ Features

### For Administrators
- ✅ Manage category master (CRUD operations)
- ✅ Manage tag master (CRUD operations)
- ✅ Create and manage user accounts (Authors & Admins)
- ✅ Configure application branding (logo, company name, links)
- ✅ Create and publish prompti
- ✅ Full access to all platform features

### For Authors
- ✅ Create, edit, and delete own prompti
- ✅ Publish/unpublish prompti
- ✅ Assign categories and tags to prompti
- ✅ View ratings and feedback on own prompti
- ✅ Access author dashboard

### For Public Users
- ✅ Browse all published prompti
- ✅ Filter by categories
- ✅ Search by title and content
- ✅ Rate prompti (1-5 stars)
- ✅ Leave feedback and reviews
- ✅ No authentication required

---

## 🛠 Tech Stack

### Frontend
- **React 19.0** - UI framework
- **React Router 7.5** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first styling
- **Shadcn/UI** - Component library
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **FastAPI 0.110** - Modern Python web framework
- **Motor 3.3** - Async MongoDB driver
- **Pydantic 2.6** - Data validation
- **PyJWT** - JWT token handling
- **Bcrypt** - Password hashing
- **Python-Jose** - JWT encryption

### Database
- **MongoDB** - NoSQL document database

### DevOps
- **Supervisor** - Process management
- **Nginx** - Reverse proxy (Kubernetes ingress)
- **Docker** - Containerization
- **Kubernetes** - Orchestration

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX INGRESS                        │
│                    (Kubernetes Service)                     │
└───────────┬─────────────────────────────────────┬───────────┘
            │                                     │
            │ /api/*                             │ /*
            ▼                                     ▼
┌───────────────────────┐           ┌───────────────────────┐
│   Backend (Port 8001) │           │  Frontend (Port 3000) │
│                       │           │                       │
│  FastAPI + Motor      │           │  React + TailwindCSS  │
│  JWT Authentication   │◄──────────│  Axios HTTP Client    │
│  Pydantic Validation  │   REST    │  React Router         │
│  Async Operations     │    API    │  Shadcn Components    │
└───────────┬───────────┘           └───────────────────────┘
            │
            │ Motor Driver
            ▼
┌───────────────────────┐
│   MongoDB (27017)     │
│                       │
│  Collections:         │
│  - users              │
│  - categories         │
│  - tags               │
│  - prompti            │
│  - ratings            │
│  - settings           │
└───────────────────────┘
```

### Request Flow

1. **Public Request**: User → Nginx → Frontend (React SPA)
2. **API Request**: Frontend → Nginx → Backend API
3. **Auth Request**: Backend → MongoDB (verify credentials) → Generate JWT
4. **Protected Request**: Frontend (JWT) → Backend (verify) → MongoDB → Response

---

## 📚 Module Documentation

### 1. Authentication Module (`/api/auth`)

**Purpose**: Handles user authentication and session management using JWT tokens.

**Components**:
- `POST /api/auth/register` - Create new author account
- `POST /api/auth/login` - Authenticate user and return JWT token
- `GET /api/auth/me` - Get current user profile

**Flow**:
```
Register/Login → Hash Password (bcrypt) → Store in DB → Generate JWT
                                                           ↓
Client Stores Token → Include in Authorization Header → Backend Verifies
```

**Key Features**:
- Case-insensitive email (stored in lowercase)
- BCrypt password hashing with salt
- JWT tokens valid for 7 days
- Role-based access (admin/author)

---

### 2. Category Master Module (`/api/categories`)

**Purpose**: Manage prompt categories for organizational structure.

**Components**:
- `GET /api/categories` - List all categories (public)
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/{id}` - Update category (admin only)
- `DELETE /api/categories/{id}` - Delete category (admin only)

**Data Model**:
```javascript
{
  id: "uuid",
  name: "AI Image Generation",
  description: "Prompts for generating images with AI",
  created_by: "admin_user_id",
  created_at: "2024-01-01T00:00:00Z"
}
```

**Usage**:
- Categories act as folders in the public library
- Each prompti must belong to exactly one category
- Deleting a category doesn't cascade delete prompti

---

### 3. Tag Master Module (`/api/tags`)

**Purpose**: Provide flexible tagging system for prompt classification.

**Components**:
- `GET /api/tags` - List all tags (public)
- `POST /api/tags` - Create tag (admin only)
- `PUT /api/tags/{id}` - Update tag (admin only)
- `DELETE /api/tags/{id}` - Delete tag (admin only)

**Data Model**:
```javascript
{
  id: "uuid",
  name: "Stable Diffusion",
  created_by: "admin_user_id",
  created_at: "2024-01-01T00:00:00Z"
}
```

**Usage**:
- Tags enable cross-category filtering
- Each prompti can have multiple tags
- Used for search refinement

---

### 4. User Management Module (`/api/users`)

**Purpose**: Admin interface for managing platform users.

**Components**:
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user with role (admin only)
- `DELETE /api/users/{id}` - Delete user (admin only)

**Roles**:
- **Admin**: Full access to all modules
- **Author**: Can create and manage own prompti

**Key Features**:
- Admins cannot delete themselves
- Password hashing on creation
- Email uniqueness enforced

---

### 5. Prompti Module (`/api/prompti`)

**Purpose**: Core content management for prompt articles.

**Components**:
- `POST /api/prompti` - Create new prompti (author)
- `GET /api/prompti` - List own prompti (author)
- `GET /api/prompti/{id}` - Get specific prompti (author, own only)
- `PUT /api/prompti/{id}` - Update prompti (author, own only)
- `DELETE /api/prompti/{id}` - Delete prompti (author, own only)

**Data Model**:
```javascript
{
  id: "uuid",
  title: "Photorealistic Portrait Generator",
  body: "Create a hyper-realistic portrait...",
  category_id: "category_uuid",
  tag_ids: ["tag_uuid1", "tag_uuid2"],
  author_id: "user_uuid",
  published: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

**States**:
- **Draft** (published: false) - Only visible to author
- **Published** (published: true) - Visible in public library

**Performance Optimization**:
- Batch fetches categories, tags, and ratings (single query each)
- Pagination limit: 100 items
- Response includes denormalized data for display

---

### 6. Public Library Module (`/api/public/prompti`)

**Purpose**: Public-facing interface for browsing and searching prompts.

**Components**:
- `GET /api/public/prompti` - List published prompts with filters
- `GET /api/public/prompti/{id}` - Get single prompt detail
- `POST /api/public/prompti/{id}/rate` - Submit anonymous rating
- `GET /api/public/prompti/{id}/ratings` - Get prompt ratings

**Query Parameters**:
- `category_id` - Filter by category
- `search` - Search in title and body (case-insensitive regex)

**Rating System**:
```javascript
{
  id: "uuid",
  prompti_id: "prompt_uuid",
  rating: 5,              // 1-5 stars
  feedback: "Excellent prompt!",
  user_name: "John Doe",  // Optional
  user_email: "john@example.com",  // Optional
  created_at: "2024-01-01T00:00:00Z"
}
```

**Performance Features**:
- Batch queries for categories, tags, authors, ratings
- Pagination limit: 50 items
- Cached average rating calculation
- Sub-100ms response time

---

### 7. Settings Module (`/api/settings`)

**Purpose**: Dynamic branding and configuration management.

**Components**:
- `GET /api/settings` - Get current settings (public)
- `PUT /api/settings` - Update settings (admin only)

**Configuration Options**:
```javascript
{
  id: "app_settings",
  logo_url: "https://example.com/logo.png",
  company_name: "Dhwani RIS",
  company_website: "https://dhwaniris.com",
  contact_email: "partnerships@dhwaniris.com",
  updated_at: "2024-01-01T00:00:00Z"
}
```

**Usage**:
- Logo appears in navbar, login, register, footer
- Company name used in branding text
- Website and email used in footer links
- Changes require page refresh to apply

---

## 👥 User Workflows

### Admin Workflow

```
Login (Admin Credentials)
    ↓
Dashboard (5 Options)
    ├─ Categories → Create/Edit/Delete Categories
    ├─ Tags → Create/Edit/Delete Tags
    ├─ Users → Create Authors/Admins, Delete Users
    ├─ Settings → Update Logo, Company Name, Links
    └─ My Prompti → Create/Edit/Publish Prompts
```

**Typical Admin Tasks**:
1. **Initial Setup**:
   - Configure branding (logo, company name)
   - Create categories (e.g., "AI Image Generation", "SEO Writing")
   - Create tags (e.g., "GPT-4", "Stable Diffusion", "Marketing")

2. **User Management**:
   - Add author accounts for content creators
   - Set temporary passwords
   - Monitor user activity

3. **Content Creation**:
   - Create high-quality prompti
   - Publish to public library
   - Monitor ratings

---

### Author Workflow

```
Login (Author Credentials)
    ↓
Dashboard (2 Options)
    ├─ My Prompti → View All Own Prompts
    │       ↓
    │   Create New Prompti
    │       ↓
    │   Fill Form (Title, Body, Category, Tags)
    │       ↓
    │   Save as Draft / Publish
    │       ↓
    │   Edit/Update Anytime
    └─ Prompti Vault → Browse Public Library
```

**Typical Author Tasks**:
1. **Create Prompti**:
   - Write compelling title
   - Add detailed prompt body
   - Select appropriate category
   - Add relevant tags
   - Save as draft or publish

2. **Manage Prompts**:
   - Edit existing prompti
   - Toggle publish/unpublish
   - View ratings and feedback
   - Delete unwanted prompts

3. **Best Practices**:
   - Use clear, descriptive titles
   - Include usage instructions in body
   - Test prompts before publishing
   - Monitor user feedback

---

### Public User Workflow

```
Visit Homepage
    ↓
Browse Library
    ├─ Filter by Category (Sidebar)
    ├─ Search by Keyword (Search Bar)
    └─ View Prompt Cards (Grid)
        ↓
Click Prompt Card
    ↓
View Detailed Page
    ├─ Read Full Prompt
    ├─ View Category & Tags
    ├─ See Current Rating
    └─ Submit Rating
        ↓
    Rate (1-5 Stars)
    Add Feedback (Optional)
    Provide Name/Email (Optional)
        ↓
    Submit → Rating Saved
```

**Features for Public Users**:
- No registration required
- Full search and filter capabilities
- Copy prompts for immediate use
- Contribute through ratings
- Provide feedback to authors

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB 5.0+
- Supervisor (for process management)

### Local Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/prompti-vault.git
cd prompti-vault
```

2. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**:
```bash
cd frontend
yarn install
```

4. **Configure Environment Variables**:

Create `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=prompti_vault
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key-min-32-characters-long
```

Create `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

5. **Start MongoDB**:
```bash
mongod --dbpath /path/to/data/db
```

6. **Run the Application**:

Backend:
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Frontend:
```bash
cd frontend
yarn start
```

7. **Access the Application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api
- API Docs: http://localhost:8001/docs

### Default Admin Credentials

```
Email: nihaan.mohammed@dhwaniris.com
Password: Nihaan@123!
```

**⚠️ Important**: Change these credentials immediately after first login!

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` | Yes |
| `DB_NAME` | Database name | `test_database` | Yes |
| `SECRET_KEY` | JWT signing key (min 32 chars) | - | Yes |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `*` | Yes |

#### Frontend (`frontend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_BACKEND_URL` | Backend API URL | - | Yes |
| `WDS_SOCKET_PORT` | WebSocket port for HMR | `443` | No |
| `ENABLE_HEALTH_CHECK` | Enable health checks | `false` | No |

### Application Settings

Configure via Admin Settings page (`/admin/settings`):

- **Logo URL**: Direct link to your logo image
- **Company Name**: Organization name for branding
- **Company Website**: URL for "Visit [Company]" link
- **Contact Email**: Email for "Contact Us" link

---

## 🚢 DevOps & Deployment

### Deployment Architecture

The application is designed for Kubernetes deployment with the following setup:

```
Kubernetes Cluster
├─ Ingress (Nginx)
│   ├─ /api/* → Backend Service (Port 8001)
│   └─ /* → Frontend Service (Port 3000)
├─ Backend Deployment
│   ├─ FastAPI Application
│   └─ Supervisor Process Manager
├─ Frontend Deployment
│   ├─ React Application
│   └─ Supervisor Process Manager
└─ MongoDB StatefulSet
    └─ Persistent Volume
```

### Supervisor Configuration

The application uses Supervisor for process management. Configuration is typically located at `/etc/supervisor/conf.d/supervisord.conf`:

```ini
[program:backend]
command=/root/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend.err.log
environment=PYTHONUNBUFFERED="1"

[program:frontend]
command=yarn start
directory=/app/frontend
autostart=true
autorestart=true
stdout_logfile=/var/log/frontend.log
stderr_logfile=/var/log/frontend.err.log
environment=BROWSER="none"
```

### Deployment Checklist

- [ ] **Environment Variables**: Set production values
  - [ ] Generate strong SECRET_KEY (min 32 chars)
  - [ ] Configure production MONGO_URL
  - [ ] Set correct REACT_APP_BACKEND_URL
  - [ ] Update CORS_ORIGINS

- [ ] **Database**:
  - [ ] MongoDB running and accessible
  - [ ] Database indexed (see below)
  - [ ] Backup strategy in place

- [ ] **Security**:
  - [ ] Change default admin password
  - [ ] Enable HTTPS/TLS
  - [ ] Configure rate limiting
  - [ ] Set up monitoring

- [ ] **Performance**:
  - [ ] Enable MongoDB indexes
  - [ ] Configure CDN for static assets
  - [ ] Enable gzip compression
  - [ ] Set cache headers

### MongoDB Indexes

Create these indexes for optimal performance:

```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

// Categories collection
db.categories.createIndex({ "name": 1 })

// Tags collection
db.tags.createIndex({ "name": 1 })

// Prompti collection
db.prompti.createIndex({ "author_id": 1 })
db.prompti.createIndex({ "category_id": 1 })
db.prompti.createIndex({ "published": 1 })
db.prompti.createIndex({ "title": "text", "body": "text" })

// Ratings collection
db.ratings.createIndex({ "prompti_id": 1 })
```

### Health Checks

**Backend Health Check**:
```bash
curl -f http://localhost:8001/api/settings || exit 1
```

**Frontend Health Check**:
```bash
curl -f http://localhost:3000/ || exit 1
```

### Monitoring

Key metrics to monitor:

- **Application Metrics**:
  - API response times (target: <100ms)
  - Error rates (target: <1%)
  - Request throughput

- **Database Metrics**:
  - Query execution time
  - Connection pool usage
  - Index hit ratio

- **System Metrics**:
  - CPU usage
  - Memory usage
  - Disk I/O

### Logging

Logs are written to:
- Backend: `/var/log/backend.log` and `/var/log/backend.err.log`
- Frontend: `/var/log/frontend.log` and `/var/log/frontend.err.log`

Log rotation is handled by Supervisor.

### Backup Strategy

**Database Backup**:
```bash
# Daily backup
mongodump --uri="$MONGO_URL" --db="$DB_NAME" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="$MONGO_URL" --db="$DB_NAME" /backup/20240101/
```

**Application Backup**:
- Environment files (.env)
- Application settings from MongoDB
- User-uploaded content (if any)

### Scaling Considerations

**Horizontal Scaling**:
- Backend can scale horizontally (stateless)
- Use MongoDB replica set for high availability
- Implement Redis for session management (if needed)

**Vertical Scaling**:
- Increase MongoDB memory for larger datasets
- Adjust worker count based on CPU cores
- Monitor query performance as data grows

### Troubleshooting

**Backend won't start**:
```bash
# Check logs
tail -f /var/log/backend.err.log

# Verify environment
cd /app/backend && source venv/bin/activate && python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.environ.get('MONGO_URL'))"

# Test MongoDB connection
mongo $MONGO_URL --eval "db.stats()"
```

**Frontend build fails**:
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
cd /app/frontend
rm -rf node_modules package-lock.json
yarn cache clean
yarn install
```

**Database connection issues**:
```bash
# Check MongoDB status
systemctl status mongod

# Verify connection
mongo mongodb://localhost:27017/test_database --eval "db.stats()"
```

---

## 📖 API Documentation

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Base URL

```
Development: http://localhost:8001/api
Production: https://your-domain.com/api
```

### Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register new author |
| POST | `/auth/login` | None | Login and get JWT |
| GET | `/auth/me` | User | Get current user |
| GET | `/categories` | None | List categories |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/{id}` | Admin | Update category |
| DELETE | `/categories/{id}` | Admin | Delete category |
| GET | `/tags` | None | List tags |
| POST | `/tags` | Admin | Create tag |
| PUT | `/tags/{id}` | Admin | Update tag |
| DELETE | `/tags/{id}` | Admin | Delete tag |
| GET | `/users` | Admin | List users |
| POST | `/users` | Admin | Create user |
| DELETE | `/users/{id}` | Admin | Delete user |
| GET | `/prompti` | Author | List own prompti |
| POST | `/prompti` | Author | Create prompti |
| PUT | `/prompti/{id}` | Author | Update prompti |
| DELETE | `/prompti/{id}` | Author | Delete prompti |
| GET | `/public/prompti` | None | List public prompti |
| GET | `/public/prompti/{id}` | None | Get prompti detail |
| POST | `/public/prompti/{id}/rate` | None | Rate prompti |
| GET | `/public/prompti/{id}/ratings` | None | Get ratings |
| GET | `/settings` | None | Get app settings |
| PUT | `/settings` | Admin | Update settings |

Full API documentation available at: `/docs` (Swagger UI)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

**Python (Backend)**:
- Follow PEP 8
- Use type hints
- Add docstrings to functions
- Run `black` formatter

**JavaScript (Frontend)**:
- Follow Airbnb style guide
- Use functional components
- Add JSDoc comments
- Run `prettier` formatter

### Testing

Before submitting PR:
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Code is linted
- [ ] Documentation is updated

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developed By

**Dhwani RIS**  
*Empowering Social Impact Through Technology*

- Website: [https://dhwaniris.com](https://dhwaniris.com)
- Email: partnerships@dhwaniris.com
- Phone: +91 9574655961

---

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- React team for the powerful UI library
- Shadcn for beautiful component primitives
- MongoDB for reliable data storage
- The open-source community

---

## 📞 Support

For support and queries:
- Email: partnerships@dhwaniris.com
- Documentation: See sections above
- Issues: GitHub Issues page

---

**Made with ❤️ by Dhwani RIS**
