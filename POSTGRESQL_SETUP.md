# Hướng dẫn cài đặt PostgreSQL cho AI Agents Monitoring System

## Tổng quan

Hệ thống đã được cập nhật để sử dụng PostgreSQL thay vì SQLite để có hiệu suất và tính năng tốt hơn.

## Cài đặt PostgreSQL

### Trên Ubuntu/Debian

```bash
# Cập nhật package list
sudo apt update

# Cài đặt PostgreSQL và các công cụ bổ trợ
sudo apt install -y postgresql postgresql-contrib

# Khởi động và enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Trên macOS (với Homebrew)

```bash
# Cài đặt PostgreSQL
brew install postgresql

# Khởi động PostgreSQL service
brew services start postgresql
```

### Trên Windows

1. Tải PostgreSQL installer từ https://www.postgresql.org/download/windows/
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ mật khẩu cho user `postgres`

## Cấu hình Database

### 1. Tạo Database và User

```bash
# Đăng nhập vào PostgreSQL với user postgres
sudo -u postgres psql

# Tạo database
CREATE DATABASE ai_agents_monitoring;

# Tạo user (nếu chưa có)
CREATE USER your_username WITH PASSWORD 'your_password';

# Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE ai_agents_monitoring TO your_username;

# Thoát khỏi PostgreSQL
\q
```

### 2. Cập nhật file .env

Cập nhật file `backend/.env` với thông tin database của bạn:

```env
DATABASE_URL=postgresql+psycopg2://your_username:your_password@localhost:5432/ai_agents_monitoring
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ALGORITHM=HS256
```

**Lưu ý:** Thay thế `your_username` và `your_password` bằng thông tin thực tế của bạn.

## Chạy Migrations

Sau khi cấu hình database, chạy migrations để tạo các bảng:

```bash
# Di chuyển đến thư mục backend
cd backend

# Chạy migrations
alembic upgrade head
```

## Khởi động ứng dụng

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Khởi động server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Kiểm tra kết nối

Truy cập http://localhost:8000 để kiểm tra API hoạt động.

Truy cập http://localhost:8000/docs để xem API documentation.

## Troubleshooting

### Lỗi kết nối PostgreSQL

1. **Kiểm tra PostgreSQL service đang chạy:**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Kiểm tra port PostgreSQL (mặc định 5432):**
   ```bash
   sudo netstat -plunt | grep postgres
   ```

3. **Kiểm tra cấu hình pg_hba.conf** (nếu cần):
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```

### Lỗi authentication

1. Đảm bảo username và password trong DATABASE_URL đúng
2. Kiểm tra user có quyền truy cập database không
3. Thử kết nối trực tiếp bằng psql:
   ```bash
   psql -h localhost -U your_username -d ai_agents_monitoring
   ```

## Tính năng mới với PostgreSQL

- **UUID native support**: Sử dụng UUID type thay vì String
- **JSONB support**: Lưu trữ metadata hiệu quả hơn
- **Better indexing**: Hiệu suất truy vấn tốt hơn
- **Advanced queries**: Hỗ trợ các truy vấn phức tạp
- **Concurrent access**: Hỗ trợ nhiều user đồng thời tốt hơn

## Migration từ SQLite

Nếu bạn đã có dữ liệu trong SQLite và muốn chuyển sang PostgreSQL:

1. Export dữ liệu từ SQLite
2. Cấu hình PostgreSQL như hướng dẫn trên
3. Import dữ liệu vào PostgreSQL
4. Cập nhật DATABASE_URL trong .env

**Lưu ý:** Quá trình migration có thể phức tạp tùy thuộc vào lượng dữ liệu và cấu trúc.

