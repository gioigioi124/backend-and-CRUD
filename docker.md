# Hướng Dẫn Cài Đặt MongoDB với Docker (Windows)

Hướng dẫn cài đặt MongoDB với Docker trên Windows Server, hỗ trợ transactions (replica set).

## Yêu Cầu

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) đã cài đặt
- PowerShell hoặc Command Prompt

---

## Bước 1: Tạo MongoDB Container

Mở PowerShell/CMD và chạy:

```powershell
docker run -d --name mongo-local -p 27017:27017 -v mongodb_data:/data/db mongo:latest --replSet rs0 --bind_ip_all
```

Đợi 5-10 giây để container khởi động.

## Bước 2: Khởi Tạo Replica Set

```powershell
docker exec -it mongo-local mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
```

## Bước 3: Tạo User Database

```powershell
docker exec -it mongo-local mongosh admin --eval "db.createUser({user: 'shop_user', pwd: 'local_password', roles: [{role: 'root', db: 'admin'}]})"
```

> ⚠️ **Production:** Đổi `local_password` thành mật khẩu mạnh hơn.

## Bước 4: Cấu Hình Backend

Cập nhật file `backend\.env`:

```env
MONGO_URI=mongodb://shop_user:local_password@localhost:27017/shop_db?authSource=admin
```

## Bước 5: Tạo Admin User

```powershell
cd backend
node seedAdmin.js
```

Tài khoản mặc định: **admin / 123**

---

## Lệnh Docker Thường Dùng

| Lệnh                                  | Mô tả                  |
| ------------------------------------- | ---------------------- |
| `docker start mongo-local`            | Khởi động container    |
| `docker stop mongo-local`             | Dừng container         |
| `docker logs mongo-local`             | Xem logs               |
| `docker exec -it mongo-local mongosh` | Truy cập MongoDB shell |

---

## Backup & Restore

### Backup

```powershell
docker exec mongo-local mongodump --db shop_db --archive=/data/db/backup.archive
docker cp mongo-local:/data/db/backup.archive .\backup.archive
```

### Restore

```powershell
docker cp .\backup.archive mongo-local:/data/db/backup.archive
docker exec mongo-local mongorestore --archive=/data/db/backup.archive
```

---

## Xử Lý Sự Cố

### Lỗi "Authentication failed"

Kiểm tra `authSource=admin` trong connection string.

### Lỗi hostname lạ (ReplicaSetNoPrimary)

```powershell
docker exec -it mongo-local mongosh --eval "rs.reconfig({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]}, {force: true})"
```

### Xóa và tạo lại container

```powershell
docker stop mongo-local
docker rm mongo-local
# Sau đó chạy lại từ Bước 1
```
