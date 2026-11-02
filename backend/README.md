# ENCORE – Backend

## 1. Cấu trúc thư mục

```text
mohinhhoa/
├── backend/
│   ├── app.py          # Flask API
│   ├── db.py           # Kết nối MySQL
│   └── .env            # Cấu hình database
├── frontend/           # Giao diện người dùng
├── docs/               # Tài liệu dự án
├── tests/              # Kiểm thử
└── venv/               # Môi trường Python ảo
```

## 2. Cài đặt và chạy Backend

**Yêu cầu:** Python, VS Code, XAMPP và database `mohinhhoa`.

1. Mở project bằng VS Code.
2. Khởi động MySQL trong XAMPP.
3. Kích hoạt môi trường ảo:

```powershell
.\venv\Scripts\Activate.ps1
```

4. Cấu hình thông tin database trong `backend/.env`.
5. Chạy Flask:

```powershell
python backend/app.py
```

Backend chạy tại `http://127.0.0.1:5000`.

## 3. Các chức năng Backend 2

- **Dashboard Statistics:** Thống kê concert, đơn hàng, doanh thu và vé đã bán.
- **Concert Management:** Thêm, xem, sửa, xóa thông tin concert.
- **Ticket Class Management:** Quản lý hạng vé và giá vé.
- **Order Management:** Xem danh sách và chi tiết đơn hàng, thông tin thanh toán và vé.

## 4. API Endpoints

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Thống kê Dashboard |
| GET, POST | `/api/admin/concerts` | Xem, tạo concert |
| PUT, DELETE | `/api/admin/concerts/<concert_id>` | Sửa, xóa concert |
| GET, POST | `/api/admin/ticket-classes` | Xem, tạo hạng vé |
| PUT, DELETE | `/api/admin/ticket-classes/<class_id>` | Sửa, xóa hạng vé |
| GET | `/api/admin/orders` | Danh sách đơn hàng |
| GET | `/api/admin/orders/<bill_id>` | Chi tiết đơn hàng |

## 5. Kiểm thử

Các API đã được kiểm thử bằng Postman trên môi trường local với MySQL. Các chức năng CRUD, truy xuất đơn hàng và thống kê Dashboard đã hoạt động thành công.

## 6. Chức năng đang phát triển

- Phát hành vé sau khi thanh toán thành công.
- Tạo mã QR cho vé.
- Tích hợp Backend với Frontend và luồng thanh toán.
- Triển khai hệ thống lên môi trường trực tuyến.