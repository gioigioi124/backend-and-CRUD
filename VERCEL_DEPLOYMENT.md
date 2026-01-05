# Hướng dẫn Deploy Frontend lên Vercel

## Bước 1: Chuẩn bị

Code đã được cấu hình sẵn:

- ✅ `api.js` - Sử dụng environment variable `VITE_API_URL`
- ✅ `vercel.json` - Cấu hình SPA routing
- ✅ `.env.example` - Template cho environment variables

## Bước 2: Deploy lên Vercel

### 2.1. Push code lên GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push
```

### 2.2. Tạo Project trên Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click **Add New** → **Project**
4. Import repository: `gioigioi124/backend-and-CRUD`
5. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ← **QUAN TRỌNG!**
   - **Build Command**: `npm run build` (tự động)
   - **Output Directory**: `dist` (tự động)

### 2.3. Cấu hình Environment Variables

Trong phần **Environment Variables**, thêm:

**Key**: `VITE_API_URL`  
**Value**: `https://backend-and-crud-production.up.railway.app`

**Lưu ý**:

- Không có dấu `/` ở cuối URL
- Áp dụng cho: Production, Preview, Development (chọn cả 3)

### 2.4. Deploy

1. Click **Deploy**
2. Đợi build hoàn thành (~1-2 phút)
3. Vercel sẽ cung cấp URL dạng: `https://your-app.vercel.app`

## Bước 3: Cập nhật Backend CORS

Sau khi có URL frontend từ Vercel, cập nhật Railway:

1. Vào Railway dashboard
2. Chọn backend service
3. Vào tab **Variables**
4. Cập nhật `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Railway sẽ tự động redeploy

## Bước 4: Kiểm tra

1. Truy cập URL Vercel của bạn
2. Test login/logout
3. Test các chức năng CRUD
4. Kiểm tra console không có lỗi CORS

## Troubleshooting

### Lỗi CORS

- Kiểm tra `FRONTEND_URL` trong Railway có đúng URL Vercel không
- Đảm bảo không có dấu `/` ở cuối URL

### Lỗi API Connection

- Kiểm tra `VITE_API_URL` trong Vercel environment variables
- Đảm bảo backend Railway đang chạy

### Lỗi 404 khi refresh page

- Kiểm tra file `vercel.json` đã được commit
- Vercel sẽ tự động detect và sử dụng config này

## Cập nhật Code

Mỗi khi push code mới lên GitHub:

- Vercel sẽ tự động rebuild và redeploy
- Không cần làm gì thêm!

## Custom Domain (Optional)

Nếu muốn dùng domain riêng:

1. Vào Vercel project settings
2. Tab **Domains**
3. Add domain và follow hướng dẫn
