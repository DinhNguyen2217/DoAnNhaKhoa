# Hệ Thống Quản Lý Phòng Khám Nha Khoa (Dental Clinic Management System)

Dự án website quản lý phòng khám nha khoa hiện đại, hỗ trợ đặt lịch khám trực tuyến, quản lý ca làm việc bác sĩ, hồ sơ bệnh án điện tử, thanh toán viện phí và đối soát tài chính minh bạch.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Framework:** Python 3.13, Django 5.x, Django REST Framework (DRF)
- **Database:** MySQL 8.0 (qua `mysqlclient`)
- **Authentication:** JWT (JSON Web Tokens)
- **Bộ lọc & API:** `django-filter`, `django-cors-headers`

### Frontend
- **Framework:** React 19, Vite
- **UI Kit:** Ant Design (v5), `@ant-design/icons`
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management & Notifications:** Ant Design Message/Modal, Context API

---

## 🚀 Các Phân Hệ & Chức Năng Chính

1. **Phân hệ Bệnh nhân (Patient Portal):**
   - Đặt lịch khám trực tuyến 24/7 (hỗ trợ chọn bác sĩ cụ thể hoặc **phân bổ ngẫu nhiên**).
   - Cơ chế giới hạn bệnh nhân theo ca (tối đa 10 bệnh nhân / ca sáng, 10 bệnh nhân / ca chiều).
   - Đặt cọc trực tuyến 100.000 VNĐ giữ lịch hẹn, chống No-show.
   - **Sổ bệnh án điện tử cá nhân (`/patient/records`):** Theo dõi lịch sử khám, chẩn đoán, răng can thiệp, thủ thuật điều trị, đơn thuốc điện tử và quyết toán số tiền viện phí minh bạch (tổng chi phí - tiền cọc = thực thu).

2. **Phân hệ Bác sĩ (Doctor Portal):**
   - Đăng ký và theo dõi lịch trực theo ca sáng/chiều.
   - Thống kê số lượng bệnh nhân đã đăng ký theo từng ca (`X/10 BN`).
   - Phòng khám lâm sàng: tiếp nhận bệnh nhân, chẩn đoán bệnh lý, nhập tình trạng răng, thủ thuật điều trị, kê đơn thuốc và dặn dò tái khám.
   - Tự động đồng bộ hồ sơ bệnh án sang phía bệnh nhân và quầy lễ tân ngay khi hoàn tất.

3. **Phân hệ Lễ tân (Receptionist Portal):**
   - Tiếp nhận bệnh nhân tại quầy, kiểm tra và xác nhận tiền đặt cọc trực tuyến.
   - Quản lý hóa đơn & Quyết toán viện phí: Tính năng thu tiền chỉ kích hoạt sau khi bác sĩ đã hoàn tất bệnh án, tự động trừ 100.000đ tiền cọc và xuất hóa đơn điện tử.

4. **Phân hệ Quản trị viên (Admin Portal):**
   - Quản lý danh mục bác sĩ, dịch vụ nha khoa, tài khoản người dùng và phân quyền.
   - Thống kê doanh thu, tỷ lệ hoàn tất lịch hẹn và hiệu suất phòng khám.

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn bị Cơ sở dữ liệu (MySQL)
Tạo cơ sở dữ liệu `dental_clinic_db` trên MySQL và import dữ liệu mẫu (nếu có):
```sql
CREATE DATABASE dental_clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Import tệp `dental_clinic_db.sql` vào database.

### 2. Cài đặt & Khởi chạy Backend (Django)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
Backend API sẽ hoạt động tại: `http://localhost:8000`

### 3. Cài đặt & Khởi chạy Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Giao diện người dùng sẽ hoạt động tại: `http://localhost:3000`

---

## 👥 Tài Khoản Mẫu Trải Nghiệm Hệ Thống

| Vai trò | Tên đăng nhập (Username) | Mật khẩu (Password) |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin123` |
| **Bác sĩ (Doctor)** | `bsminh` | `doctor123` |
| **Lễ tân (Receptionist)** | `letan1` | `letan123` |
| **Bệnh nhân (Patient)** | `benhnhan1` | `patient123` |
