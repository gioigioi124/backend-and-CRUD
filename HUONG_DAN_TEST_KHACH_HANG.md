# Hướng Dẫn Test Chức Năng Upload Khách Hàng

## Chuẩn Bị

### 1. Đăng nhập với tài khoản Admin

- Chỉ có Admin mới có quyền upload file Excel khách hàng
- Truy cập: http://localhost:5173/login
- Đăng nhập với tài khoản admin

### 2. Truy cập trang Quản Lý Khách Hàng

- Sau khi đăng nhập, mở sidebar (menu bên trái)
- Click vào "Quản lý khách hàng"
- URL: http://localhost:5173/customers

## Các Bước Test

### Bước 1: Tải File Mẫu

1. Click nút "Tải File Mẫu"
2. File Excel sẽ được tải xuống với tên `Mau_Khach_Hang.xlsx`
3. Mở file để xem cấu trúc:
   - Cột A: Mã KH
   - Cột B: Tên KH
   - Cột C: Địa chỉ
   - Cột D: Số điện thoại

### Bước 2: Chuẩn Bị Dữ Liệu Test

#### Test Case 1: Upload File Nhỏ (5-10 dòng)

1. Sử dụng file mẫu đã tải
2. Thêm vài dòng dữ liệu nữa (tổng 5-10 dòng)
3. Lưu file

#### Test Case 2: Upload File Lớn (100+ dòng)

1. Copy dữ liệu mẫu nhiều lần
2. Thay đổi Mã KH để không trùng (KH001, KH002, ..., KH100)
3. Lưu file

#### Test Case 3: Upload File Có Dữ Liệu Trùng

1. Upload file lần đầu
2. Upload lại file đó lần nữa
3. Kiểm tra kết quả có hiển thị số lượng "Cập nhật" và "Trùng lặp"

#### Test Case 4: Upload File Thiếu Dữ Liệu

1. Tạo file Excel với một số dòng thiếu Mã KH hoặc Tên KH
2. Upload và kiểm tra thông báo lỗi

#### Test Case 5: Upload File Sai Format

1. Thử upload file .txt hoặc .pdf
2. Kiểm tra thông báo lỗi "Chỉ chấp nhận file Excel"

### Bước 3: Upload File

1. Click "Chọn File Excel"
2. Chọn file đã chuẩn bị
3. Click nút "Upload"
4. Chờ loading (với file lớn có thể mất vài giây)

### Bước 4: Kiểm Tra Kết Quả

#### Kiểm tra Upload Summary

Sau khi upload thành công, sẽ hiển thị bảng tóm tắt:

- ✅ Tổng số dòng: Số dòng trong file Excel
- ✅ Thêm mới: Số khách hàng được thêm mới
- ✅ Cập nhật: Số khách hàng được cập nhật (nếu Mã KH đã tồn tại)
- ✅ Trùng lặp: Số khách hàng trùng lặp
- ⚠️ Lỗi: Số dòng có lỗi (nếu có)

#### Kiểm tra Danh Sách Khách Hàng

1. Scroll xuống phần "Danh Sách Khách Hàng"
2. Kiểm tra:
   - ✅ Dữ liệu hiển thị đúng
   - ✅ Tổng số khách hàng đúng
   - ✅ Pagination hoạt động (nếu có > 50 khách hàng)

### Bước 5: Test Chức Năng Khác

#### Test Pagination

1. Upload file có > 50 khách hàng
2. Kiểm tra nút "Trước" và "Sau"
3. Kiểm tra số trang hiển thị đúng

#### Test Xóa Khách Hàng (Admin only)

1. Click icon thùng rác ở cột "Thao Tác"
2. Xác nhận xóa trong dialog
3. Kiểm tra khách hàng đã bị xóa khỏi danh sách

## Test Performance với File Lớn (5000 dòng)

### Cách Tạo File 5000 Dòng

Bạn có thể dùng Excel với công thức:

1. Tạo header row: Mã KH | Tên KH | Địa chỉ | Số điện thoại
2. Dòng 2:
   - A2: `="KH"&TEXT(ROW()-1,"0000")`
   - B2: `="Khách hàng "&ROW()-1`
   - C2: `="Địa chỉ "&ROW()-1&", TP.HCM"`
   - D2: `="09"&TEXT(ROW()-1,"00000000")`
3. Copy công thức từ dòng 2 xuống đến dòng 5001
4. Lưu file

### Kiểm Tra Performance

- ⏱️ Thời gian upload: Nên < 15 giây
- ✅ Không bị crash hoặc timeout
- ✅ Kết quả hiển thị đúng
- ✅ Database lưu đủ 5000 records

## Kiểm Tra Backend API (Optional)

### Test API với Postman/Thunder Client

#### 1. Upload API

```
POST http://localhost:3000/api/customers/upload
Headers:
  Authorization: Bearer <admin_token>
Body: form-data
  file: <select Excel file>
```

#### 2. Search API

```
GET http://localhost:3000/api/customers/search?q=ABC
Headers:
  Authorization: Bearer <token>
```

#### 3. Get All Customers

```
GET http://localhost:3000/api/customers?page=1&limit=50
Headers:
  Authorization: Bearer <token>
```

#### 4. Delete Customer

```
DELETE http://localhost:3000/api/customers/<customer_id>
Headers:
  Authorization: Bearer <admin_token>
```

## Checklist Hoàn Thành

- [ ] Tải file mẫu thành công
- [ ] Upload file nhỏ (5-10 dòng) thành công
- [ ] Upload file lớn (100+ dòng) thành công
- [ ] Upload file 5000 dòng thành công (< 15s)
- [ ] Upload summary hiển thị đúng
- [ ] Danh sách khách hàng hiển thị đúng
- [ ] Pagination hoạt động
- [ ] Xóa khách hàng thành công (admin)
- [ ] Upload file trùng lặp xử lý đúng
- [ ] Upload file thiếu dữ liệu báo lỗi đúng
- [ ] Upload file sai format báo lỗi đúng
- [ ] Chỉ admin mới thấy trang Quản lý khách hàng

## Lỗi Thường Gặp

### 1. "Vui lòng chọn file Excel"

- Nguyên nhân: Chưa chọn file
- Giải pháp: Click "Chọn File Excel" và chọn file .xlsx hoặc .xls

### 2. "File Excel thiếu các cột: Mã KH, Tên KH"

- Nguyên nhân: File Excel không có đúng header
- Giải pháp: Đảm bảo dòng đầu tiên có: Mã KH | Tên KH | Địa chỉ | Số điện thoại

### 3. "Chỉ chấp nhận file Excel (.xls, .xlsx)"

- Nguyên nhân: File không đúng định dạng
- Giải pháp: Chỉ upload file .xls hoặc .xlsx

### 4. Không thấy menu "Quản lý khách hàng"

- Nguyên nhân: Không phải tài khoản admin
- Giải pháp: Đăng nhập lại với tài khoản admin

### 5. Upload bị timeout với file lớn

- Nguyên nhân: File quá lớn hoặc server chậm
- Giải pháp: Chia nhỏ file hoặc tăng timeout limit

## Kết Luận

Sau khi test xong tất cả các bước trên, chức năng upload khách hàng đã hoàn thành và sẵn sàng sử dụng! 🎉
