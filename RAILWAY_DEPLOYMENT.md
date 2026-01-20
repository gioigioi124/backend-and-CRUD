# Hướng dẫn Deploy Backend lên Railway

## Bước 1: Chuẩn bị MongoDB

1. Tạo database trên MongoDB Atlas (hoặc sử dụng MongoDB service khác)
2. Lấy connection string (dạng: `mongodb+srv://username:password@cluster.mongodb.net/database`)
3. Whitelist tất cả IP addresses (0.0.0.0/0) trong MongoDB Atlas Network Access

## Bước 2: Deploy lên Railway

### 2.1. Tạo Project mới trên Railway

1. Truy cập [railway.app](https://railway.app)
2. Đăng nhập bằng GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Chọn repository của bạn
5. Chọn thư mục `backend` (nếu Railway hỏi)

### 2.2. Cấu hình Environment Variables

Trong Railway dashboard, vào tab **Variables** và thêm các biến sau:

```
PORT=3000
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/your-database
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Lưu ý quan trọng:**

- `MONGO_URI`: Thay bằng connection string thực tế từ MongoDB Atlas
- `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên dài và phức tạp (khác với development)
- `FRONTEND_URL`: Sẽ cập nhật sau khi deploy frontend lên Vercel

### 2.3. Cấu hình Build Settings

Railway sẽ tự động detect Node.js project. Kiểm tra:

- **Build Command**: `npm install` (tự động)
- **Start Command**: `npm start` (đã config trong railway.json)
- **Root Directory**: `/backend` (nếu repo có cả frontend và backend)

### 2.4. Deploy

1. Railway sẽ tự động deploy sau khi bạn thêm environment variables
2. Đợi build hoàn thành (xem logs trong tab **Deployments**)
3. Sau khi deploy thành công, Railway sẽ cung cấp một URL dạng: `https://your-app.railway.app`

## Bước 3: Kiểm tra Deployment

### 3.1. Lấy URL của Backend

1. Trong Railway dashboard, vào tab **Settings**
2. Scroll xuống phần **Domains**
3. Click **Generate Domain** nếu chưa có
4. Copy URL (ví dụ: `https://backend-production-xxxx.up.railway.app`)

### 3.2. Test API

Mở trình duyệt hoặc dùng Postman để test:

```
GET https://your-backend-url.railway.app/api/auth/test
```

Hoặc test với curl:

```bash
curl https://your-backend-url.railway.app/api/auth/test
```

## Bước 4: Seed Admin User (Optional)

Nếu cần tạo admin user đầu tiên:

1. Trong Railway dashboard, vào tab **Settings**
2. Scroll xuống **One-off Commands**
3. Chạy command: `node seedAdmin.js`

## Troubleshooting

### Lỗi kết nối MongoDB

- Kiểm tra connection string có đúng không
- Kiểm tra MongoDB Atlas Network Access đã whitelist 0.0.0.0/0
- Kiểm tra username/password có đúng không

### Lỗi CORS

- Kiểm tra `FRONTEND_URL` trong environment variables
- Sau khi deploy frontend, nhớ cập nhật lại `FRONTEND_URL`

### Xem Logs

- Vào tab **Deployments** trong Railway dashboard
- Click vào deployment mới nhất
- Xem **Build Logs** và **Deploy Logs**

## Bước tiếp theo

Sau khi backend đã chạy thành công:

1. Lưu lại URL của backend
2. Tiếp tục deploy frontend lên Vercel
3. Cập nhật `FRONTEND_URL` trong Railway environment variables
4. Cập nhật `VITE_API_URL` trong Vercel environment variables

## Cập nhật Code

Mỗi khi push code mới lên GitHub:

- Railway sẽ tự động rebuild và redeploy
- Không cần làm gì thêm!
