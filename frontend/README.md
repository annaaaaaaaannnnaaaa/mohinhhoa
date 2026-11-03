# ENCORE – Frontend bán vé concert (HTML/CSS/JS thuần)

## Mở bằng VS Code
1. Giải nén `encore-vscode.zip`, trong VS Code chọn **File → Open Folder…** → thư mục `encore-vscode`.
2. Cài extension **Live Server** (VS Code sẽ tự gợi ý), chuột phải `index.html` → **Open with Live Server**. (Hoặc nhấp đúp `index.html` để mở bằng trình duyệt.)

## Cấu trúc thư mục
```
encore-vscode/
├─ index.html                 # khung trang, nạp CSS/JS theo thứ tự (có chú thích)
├─ css/
│  ├─ variables.css           # biến màu
│  ├─ base.css                # reset, chữ, nút
│  ├─ layout.css              # header, khung trang, lưới
│  ├─ components.css          # nút, thẻ concert, panel, form, toast
│  ├─ auth.css                # đăng nhập / đăng ký
│  ├─ seatmap.css             # chọn ghế
│  ├─ checkout.css            # hàng chờ, thanh toán, thành công
│  ├─ admin.css               # giao diện admin
│  ├─ tickets.css             # vé của tôi
│  └─ responsive.css          # mobile
├─ js/
│  ├─ data/
│  │  ├─ accounts.js          # tài khoản (từ Excel)
│  │  └─ concerts.js          # 3 concert: giá, phí, ngày, khu, ghế sold
│  ├─ core/
│  │  ├─ utils.js             # tiện ích: storage, định dạng tiền/ngày, toast
│  │  ├─ state.js             # user, đơn hàng, ghế đang chọn
│  │  └─ i18n.js              # chuỗi EN/VI
│  ├─ core/guard.js           # dọn dữ liệu cũ, xử lý hết giờ giữ ghế, trang lỗi, reset demo
│  ├─ admin/                  # TRANG ADMIN (data, shell, overview, concerts, orders, customers, checkin, reports, settings)
│  ├─ components/header.js    # thanh menu
│  ├─ pages/
│  │  ├─ home.js              # trang chủ
│  │  ├─ auth.js              # đăng nhập / đăng ký
│  │  ├─ queue.js             # xác minh + phòng chờ
│  │  ├─ seatmap.js           # vẽ seat map (ring / fan / hall) + sơ đồ ghế
│  │  ├─ booking.js           # chọn ghế + panel Your booking
│  │  ├─ checkout.js          # thanh toán mô phỏng + thành công
│  │  └─ tickets.js           # My tickets + Help
│  ├─ router.js               # điều hướng theo #/...
│  └─ main.js                 # khởi động
├─ assets/                    # poster từng concert, ảnh nền đăng nhập
└─ .vscode/                   # cấu hình + gợi ý extension
```
**Muốn sửa gì thì mở file đó:** đổi giá/ngày/phí → `js/data/concerts.js`; đổi màu → `css/variables.css`; đổi hình seat map → `js/pages/seatmap.js`.

## Tài khoản demo (mật khẩu chung: `Demo@123`)
- Khách hàng: `nguoimua@gmail.com`, hoặc bất kỳ email nào trong sheet USER_ACCOUNT (vd `thuytrang@gmail.com`)
- Admin / Soát vé: `admin@concert.vn`, `admin@concert.demo`, `ticketchecker@concert.demo`
- Có thể tự đăng ký tại `#/signup` (lưu localStorage). Nút EN/VI đổi ngôn ngữ màn đăng nhập/đăng ký.

## Kịch bản kiểm thử
| # | Bước | Kết quả mong đợi |
|---|------|------------------|
| 1 | Mở trang chủ, gõ "skynote" / "Bangkok" / "Hồ Chí Minh" → Search events | Lọc đúng thẻ concert |
| 2 | Đăng nhập tab Customer với mật khẩu sai | "Invalid username or password" |
| 3 | Tab Administrator với `nguoimua@gmail.com` | "Your account does not have permission to access the admin dashboard" |
| 4 | Đăng ký: mật khẩu xác nhận lệch / email trùng / SĐT sai | Báo lỗi tương ứng; hợp lệ → về trang đăng nhập |
| 5 | Đăng nhập khách → View seats | Câu hỏi phép tính ngẫu nhiên (cộng, trừ, nhân, chia, biểu thức) → phòng chờ "YOU ARE NUMBER 7" đếm lùi → seat map |
| 6 | Seat map 3 concert | Arirang: vòng elip 101–112 / 201–216; Skynote: quạt VIP–CAT1–CAT2–CAT3; Sketch a Rose: khối Tầng 1/Tầng 2 L-C-R |
| 7 | Bấm khu "Sold" | Thông báo hết vé; khu khác → sơ đồ ghế A–J × 10 |
| 8 | Chọn 7 ghế | Chặn ở 6 ghế ("Maximum 6 tickets per order"); bỏ ghế bằng ✕ |
| 9 | Continue to payment | Đồng hồ giữ ghế 10:00; hết giờ → ghế được nhả, quay lại seat map |
| 10 | Confirm demo payment | Trang Payment Successful (mã đơn, phí dịch vụ, email) |
| 11 | My ticket / mục My Tickets | Vé + QR minh hoạ, ticket ID, "Not checked in"; nhiều vé → nút ➜ chuyển vé |
| 12 | Quay lại seat map đúng concert | Ghế vừa mua hiển thị Sold |

## Dữ liệu: PDF và Excel không khớp nhau – cách đã chọn (sửa trong `js/data/concerts.js`)
| Concert | Ngày/giờ | Giá vé | Phí/vé |
|---------|----------|--------|--------|
| Arirang (Rajamangala, Bangkok) | 05 Dec 2026 19:00 (mở cửa 17:30) | VIP 5.300.000 · GA 4.500.000 · CAT 3.000.000 | 50.000 |
| Skynote (VEC Hà Nội) | 22 Nov 2026 19:30 (mở cửa 18:30) | VIP 3.000.000 · CAT1 2.300.000 · CAT2 1.700.000 · CAT3 1.200.000 | 30.000 |
| Sketch a Rose (The Global City, HCM) | 05 Jan 2027 20:00 (mở cửa 17:30) | VIP 3.500.000 · CAT1 2.500.000 · CAT2 1.800.000 · CAT3 1.200.000 | 25.000 |

- PDF tự mâu thuẫn (cùng concert có nhiều ngày/giá khác nhau): lấy ngày ở trang chủ + Excel, giá ở seat map PDF. Dòng "From …" trên trang chủ giữ đúng chữ trong PDF.
- Tổng tiền tính lại chính xác = vé + phí × số vé (PDF có vài dòng cộng sai, vd 4.600.000 + 60.000 ≠ 4.750.000).
- Số ghế/khu, ghế Sold/Held lấy từ sheet SEAT (10 ghế/hàng). Các khu hiển thị "Sold" trên map theo PDF: Arirang 107, 109, 110, 204, 212, 213; Skynote CAT 2E, 3G, 3A; Sketch CAT 3R.

## Trang Admin (`#/admin/...`)
Đăng nhập tab **Administrator / Ticket Checker** (`admin@concert.vn` / `Demo@123`) → vào `#/admin`.
| Trang | Đường dẫn | Có gì |
|-------|-----------|-------|
| Overview | `#/admin` | thống kê, biểu đồ doanh thu (7D/30D/All), sales by tier, đơn gần đây, quick actions |
| Concerts | `#/admin/concerts` | lọc trạng thái, tìm kiếm, phân trang, sửa giá/ghế từng hạng vé, Save / Discard |
| Create concert | `#/admin/concerts/new` | form tạo concert, chọn seat map, thêm hạng vé, upload poster, Save draft / Publish |
| Orders | `#/admin/orders` | 1.248 đơn mô phỏng + **đơn khách vừa mua thật**, lọc, tìm, phân trang, Export CSV, đổi trạng thái (refund) |
| Customers | `#/admin/customers` | danh sách + panel chi tiết, lọc VIP/New/Blocked, Export list |
| Check-in | `#/admin/checkin` | quét/nhập mã vé, Valid / Duplicate / Invalid, soát được **vé khách vừa mua** (My Tickets đổi sang "Checked in") |
| Reports | `#/admin/reports` | KPI, biểu đồ, kênh bán, theo concert/hạng vé, giờ cao điểm; đổi concert & 7D/30D/All |
| Settings | `#/admin/settings` | Organization, Ticketing rules, các tab còn lại |
- Tài khoản **Ticket Checker** (`ticketchecker@concert.demo`) chỉ vào được trang Check-in; tài khoản Customer bị chặn khỏi `#/admin`.
- Mã vé mẫu để thử soát: `TKT-8F2A-1045`, `TKT-8F2A-1044`, `TKT-9C1B-0227`, `TKT-7D3E-0561`; vé thật lấy ở My Tickets.
- Dữ liệu admin lưu trong localStorage (`enc_ad`). Trang Help có nút **Reset demo data**.

## Đã sửa lỗi chuyển trang / thanh toán
- Phí dịch vụ trong `concerts.js` viết `25.000` (JS hiểu là 25) → sửa thành 50000 / 30000 / 25000 đúng PDF.
- Giữ ghế hết 10 phút (hoặc dữ liệu cũ trong trình duyệt) khiến checkout bật ngược về seat map im lặng → nay có thông báo rõ và tự dọn ghế hết hạn (`guard.js`).
- Dữ liệu đơn hàng lưu từ bản code cũ làm nút Confirm payment không chạy → nay tự dọn một lần theo `DATA_VER` và bỏ qua đơn hỏng.
- Trang bị lỗi khi vẽ sẽ hiện thông báo + nút Reset thay vì đứng yên.

## Chưa làm
Thanh toán thật và QR thật (cần backend). Concert tạo ở Admin chưa xuất hiện bên trang khách (cần seat map riêng).
