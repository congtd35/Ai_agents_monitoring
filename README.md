# AI Agents Monitoring System

Hệ thống theo dõi quá trình làm việc của hệ thống AI Agents với Frontend React (Ant Design, TailwindCSS) và Backend FastAPI.

## 🚀 Tính năng chính

### 🔐 Authentication & Authorization
- Đăng ký và đăng nhập người dùng
- JWT token authentication
- Refresh token mechanism
- Role-based access control

### 📊 Dashboard & Analytics
- Tổng quan hệ thống với các metrics quan trọng
- Charts và visualizations
- Real-time statistics
- Performance monitoring

### 📁 **Project Management (NÂNG CẤP MỚI)**
- **Danh sách dự án với phân trang** - Pagination với page size options
- **Tìm kiếm và lọc nâng cao** - Search theo tên/mã/mô tả, filter theo status/priority
- **CRUD Operations hoàn chỉnh:**
  - ✅ **Tạo dự án mới** - Form validation đầy đủ với các trường bắt buộc
  - ✅ **Xem chi tiết dự án** - Modal hiển thị thông tin chi tiết
  - ✅ **Sửa dự án** - Cập nhật thông tin với validation
  - ✅ **Xóa dự án** - Confirmation dialog an toàn
- **Quản lý thông tin dự án:**
  - Tên và mã dự án (unique validation)
  - Mô tả, status (active/inactive/completed), priority (low/medium/high/critical)
  - Jira link và repository URL
  - Budget tracking và estimated hours
  - Start/end dates với date picker
  - Team members management (comma-separated)
  - Tags và metadata
- **Sắp xếp và phân trang** - Sort theo created_at, name, status; pagination với navigation

### 📋 Task Monitoring
- Theo dõi chi tiết các nhiệm vụ AI Agent
- Session ID và agent information
- Token usage tracking (input/output tokens)
- Cost calculation và budget monitoring
- Execution time và performance metrics
- File operations tracking (created/modified/deleted)
- Step-by-step execution logs

### 📈 Advanced Analytics
- Task performance analysis
- Cost analysis và trends
- Usage patterns và optimization insights
- Success rate monitoring
- Resource utilization reports

### 🌐 Multi-language & Theming
- Hỗ trợ đa ngôn ngữ (Tiếng Việt/English)
- Dark/Light theme switching
- Responsive design cho mobile và desktop

## 🏗️ Kiến trúc hệ thống

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Core configurations
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas
│   └── main.py          # FastAPI application
├── requirements.txt     # Python dependencies
└── .env                # Environment variables
```

### Frontend (React + Ant Design)
```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities và configurations
│   └── assets/         # Static assets
├── package.json        # Node.js dependencies
└── .env               # Environment variables
```

## 🛠️ Cài đặt và Chạy

### Prerequisites
- Python 3.11+
- Node.js 20+
- pnpm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```
Backend sẽ chạy tại: http://localhost:8000

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```
Frontend sẽ chạy tại: http://localhost:5173

## 📊 Database Schema

### Core Models

#### Users
- `id`: UUID (Primary Key)
- `username`: String (Unique)
- `email`: String (Unique)
- `full_name`: String
- `password_hash`: String
- `role`: Enum (admin, user)
- `is_active`: Boolean
- `created_at`, `updated_at`, `last_login`: DateTime

#### Projects
- `id`: UUID (Primary Key)
- `name`: String
- `code`: String (Unique)
- `description`: Text
- `jira_project_link`: String
- `repository_url`: String
- `status`: Enum (active, inactive, completed)
- `priority`: Enum (low, medium, high, critical)
- `owner_id`: UUID (Foreign Key)
- `team_members`: JSON Array
- `start_date`, `end_date`: Date
- `budget_usd`: Decimal
- `estimated_hours`, `actual_hours`: Integer
- `tags`: JSON Array
- `project_metadata`: JSON

#### Tasks
- `id`: UUID (Primary Key)
- `name`: String
- `description`: Text
- `project_id`: UUID (Foreign Key)
- `jira_task_link`: String
- `session_id`: String
- `agent_type`, `agent_version`: String
- `status`: Enum (pending, running, completed, failed)
- `priority`: Enum
- `start_time`, `end_time`: DateTime
- `duration_seconds`: Integer
- `input_tokens`, `output_tokens`: BigInteger
- `cost_usd`: Decimal
- `total_steps`, `completed_steps`, `failed_steps`: Integer
- `files_created`, `files_modified`, `files_deleted`: Integer
- `error_message`: Text
- `task_metadata`: JSON

#### File Operations
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key)
- `operation_type`: Enum (create, modify, delete)
- `file_path`: String
- `file_size_bytes`: BigInteger
- `content_preview`: Text
- `line_changes`: JSON
- `timestamp`: DateTime

#### Task Steps
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key)
- `step_number`: Integer
- `step_name`: String
- `description`: Text
- `status`: Enum
- `start_time`, `end_time`: DateTime
- `input_data`, `output_data`: JSON
- `error_message`: Text

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký user mới
- `POST /api/v1/auth/login-json` - Đăng nhập
- `GET /api/v1/auth/me` - Lấy thông tin user hiện tại
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Đăng xuất

### Projects
- `GET /api/v1/projects` - Lấy danh sách dự án
- `POST /api/v1/projects` - Tạo dự án mới
- `GET /api/v1/projects/{id}` - Lấy chi tiết dự án
- `PUT /api/v1/projects/{id}` - Cập nhật dự án
- `DELETE /api/v1/projects/{id}` - Xóa dự án
- `GET /api/v1/projects/{id}/stats` - Thống kê dự án

### Tasks
- `GET /api/v1/tasks` - Lấy danh sách tasks
- `POST /api/v1/tasks` - Tạo task mới
- `GET /api/v1/tasks/{id}` - Lấy chi tiết task
- `PUT /api/v1/tasks/{id}` - Cập nhật task
- `DELETE /api/v1/tasks/{id}` - Xóa task
- `GET /api/v1/tasks/{id}/steps` - Lấy các bước thực hiện
- `GET /api/v1/tasks/{id}/files` - Lấy file operations
- `GET /api/v1/tasks/{id}/logs` - Lấy execution logs

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/tasks/performance` - Task performance
- `GET /api/v1/analytics/costs` - Cost analysis
- `GET /api/v1/analytics/usage-trends` - Usage trends

## 🎨 UI/UX Features

### Design System
- **Ant Design Components**: Professional UI components
- **TailwindCSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: User preference support

### Navigation
- **Sidebar Navigation**: Collapsible sidebar với menu items
- **Breadcrumbs**: Navigation path indication
- **Search & Filters**: Advanced filtering capabilities

### Data Visualization
- **Charts**: Line, Bar, Pie charts với @ant-design/plots
- **Statistics Cards**: Key metrics display
- **Progress Indicators**: Visual progress tracking
- **Real-time Updates**: Live data updates

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt password hashing
- **Token Refresh**: Automatic token renewal
- **Session Management**: Secure session handling

### Authorization
- **Role-based Access**: Admin và user roles
- **Resource Protection**: API endpoint protection
- **CORS Configuration**: Secure cross-origin requests

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptive Features
- **Collapsible Sidebar**: Auto-collapse trên mobile
- **Responsive Tables**: Horizontal scroll trên mobile
- **Touch-friendly**: Optimized cho touch interactions

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
pnpm run build

# Backend
cd backend
# Configure production environment variables
python -m app.main
```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=sqlite:///./ai_agents.db
SECRET_KEY=your-super-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## 📊 Monitoring & Metrics

### Key Performance Indicators
- **Task Success Rate**: Percentage of successful tasks
- **Average Execution Time**: Mean task duration
- **Cost per Task**: Average cost calculation
- **Token Usage**: Input/Output token consumption
- **File Operations**: Create/Modify/Delete statistics

### System Health
- **API Response Times**: Endpoint performance monitoring
- **Database Performance**: Query execution times
- **Error Rates**: System error tracking
- **User Activity**: Login và usage patterns

## 🔄 Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Advanced Reporting**: PDF/Excel export
- **API Rate Limiting**: Request throttling
- **Audit Logging**: Comprehensive activity logs
- **Integration APIs**: Third-party service integration
- **Advanced Analytics**: ML-powered insights
- **Multi-tenant Support**: Organization-based access

### Technical Improvements
- **Caching Layer**: Redis integration
- **Database Optimization**: Query performance
- **Microservices**: Service decomposition
- **Container Deployment**: Docker support
- **CI/CD Pipeline**: Automated deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Development**: FastAPI, SQLAlchemy, JWT Authentication
- **Frontend Development**: React, Ant Design, TailwindCSS
- **Database Design**: SQLite với comprehensive schema
- **UI/UX Design**: Responsive design với modern aesthetics

---

**Phát triển bởi**: AI Agents Monitoring Team  
**Phiên bản**: 1.0.0  
**Ngày cập nhật**: July 29, 2025

