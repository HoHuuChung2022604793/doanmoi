# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN (CHI TIẾT)

Tài liệu này hướng dẫn cách tải code từ GitHub và chạy dự án trên một máy tính mới (Windows).

## 1. Yêu cầu cần có (Prerequisites)

Trước khi bắt đầu, đảm bảo máy tính đã cài đặt:

1.  **Git**: Để tải code. [Tải tại đây](https://git-scm.com/downloads)
2.  **Docker Desktop**: Để chạy ứng dụng + Database mà không cần cài lẻ tẻ. [Tải tại đây](https://www.docker.com/products/docker-desktop/)
    - _Lưu ý: Sau khi cài Docker, hãy mở ứng dụng Docker Desktop lên và đợi nó báo "Engine running" màu xanh._

## 2. Tải mã nguồn (Clone Code)

Mở **PowerShell** hoặc **Command Prompt (CMD)** tại thư mục bạn muốn lưu dự án.

```powershell
# Thay URL bên dưới bằng link repo GitHub của bạn
git clone https://github.com/USERNAME/REPO_NAME.git

# Đi vào thư mục dự án
cd doan
```

## 3. Cấu hình môi trường (Quan trọng)

Dự án cần các biến môi trường (như mật khẩu, cấu hình DB) để chạy. Các file này không có trên GitHub nên bạn cần tạo thủ công từ file mẫu.

Vẫn trong cửa sổ CMD/PowerShell đó:

```powershell
# Vào thư mục backend
cd backend

# Tạo file .env từ file mẫu
copy .env.example .env
```

> **Lưu ý:** Nếu bạn cần chỉnh sửa cấu hình (ví dụ muốn chạy local thay vì Docker, hoặc đổi cổng), hãy mở file `.env` bằng Notepad hoặc VS Code để sửa.

## 4. Chạy dự án (Bằng Docker)

Đây là cách đơn giản nhất, chạy cả Frontend, Backend và Database bằng 1 lệnh.

```powershell
# Quay lại thư mục gốc của dự án (nếu đang ở backend)
cd ..

# Chạy Docker Compose
docker-compose up -d --build
```

- `up`: Khởi động các container.
- `-d`: Chạy ngầm (Detached mode) để không bị treo cửa sổ CMD.
- `--build`: Buộc build lại code mới nhất (nên dùng khi mới tải code về).

## 5. Truy cập ứng dụng

Sau khi lệnh trên chạy xong (có thể mất vài phút ở lần đầu để tải image), bạn truy cập:

- **Trang web (Frontend):** [http://localhost](http://localhost) (Cổng 80)
- **API (Backend):** [http://localhost:5001](http://localhost:5001)

---

## 6. Lựa chọn: Chạy KHÔNG cần Docker (Manual)

Nếu máy tính không cài được Docker, bạn có thể chạy thủ công theo các bước sau:

### Bước 1: Chạy Backend
1. Mở terminal tại thư mục `backend`.
2. Chạy `npm install`.
3. Lưu ý file `.env` phải có: `MONGODB_URI=mongodb://localhost:27017/phone-store`.
4. **Khởi tạo dữ liệu (Bắt buộc để hiện sản phẩm):** Chạy lệnh `npm run seed`.
5. Chạy server: `npm start`.

### Bước 2: Chạy Frontend
1. Mở terminal mới tại thư mục `frontend`.
2. Chạy `npm install`.
3. Chạy ứng dụng: `npm start`.
4. Truy cập web tại: `http://localhost:4200`.

---

## 7. Khởi tạo lại dữ liệu (Khi không thấy sản phẩm)

Nếu bạn vào trang web mà thấy trắng trơn, hãy thực hiện nạp lại dữ liệu:

- **Nếu dùng Docker:**
  ```powershell
  docker-compose exec backend npm run seed
  ```
- **Nếu chạy thường (không Docker):**
  Mở terminal tại thư mục `backend` và chạy:
  ```powershell
  npm run seed
  ```

---

## 8. Lưu và Đồng bộ dữ liệu lên GitHub

Khi bạn thêm sản phẩm mới hoặc upload ảnh trên trang web, các ảnh đó đang nằm ở máy tính hiện tại.
Để mang các ảnh mới này sang máy khác, bạn cần "Lưu" chúng lên GitHub.

Mình đã tạo file **`save_data.bat`**.
Mỗi khi làm việc xong, hãy click đúp vào file này. Nó sẽ:

1.  Tự tìm các ảnh mới bạn vừa up.
2.  Lưu code và ảnh lên GitHub.

--> Sang máy mới, chỉ cần tải lại (git pull) là có đủ tất cả.

## 7. Các lệnh thường dùng khác

**Xem log (để kiểm tra xem server có lỗi gì không):**

```powershell
docker-compose logs -f backend
```

_(Nhấn Ctrl + C để thoát xem log)_

**Tắt server:**

```powershell
docker-compose down
```

**Cập nhật code mới nhất từ GitHub (Khi qua máy khác):**

```powershell
# 1. Tắt server đang chạy
docker-compose down

# 2. Tải code mới (bao gồm cả ảnh mới user khác vừa up)
git pull origin main

# 3. Chạy lại
docker-compose up -d --build
```
