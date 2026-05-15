# HƯỚNG DẪN CHẠY DỰ ÁN BẰNG VS CODE (KHÔNG DÙNG DOCKER)

Nếu bạn muốn chạy code theo cách truyền thống (để sửa code, debug) thì làm theo các bước sau.

## 1. Cài đặt phần mềm cần thiết

Bạn cần cài sẵn 3 món này trên máy:

1.  **Node.js**: [Tải tại đây](https://nodejs.org/) (Chọn bản LTS).
2.  **MongoDB Community Server**: [Tải tại đây](https://www.mongodb.com/try/download/community).
    - _Lưu ý: Khi cài nhớ tích chọn "Install MongoDB Compass" để có giao diện quản lý DB._
3.  **Git**: (Chắc bạn có rồi).

---

## 2. Chuẩn bị Cơ sở dữ liệu (MongoDB)

- Sau khi cài xong MongoDB, hãy mở phần mềm **MongoDB Compass**.
- Bấm **Connect** (để mặc định là `mongodb://localhost:27017`).
- Thế là xong phần Database.

---

## 3. Cài đặt thư viện (Chỉ làm 1 lần đầu)

Mở VS Code tại thư mục dự án `doan`.

**Bước 3.1: Cài đặt cho Backend (Server)**
Mở Terminal mới (`Ctrl + Shift + `), chạy lệnh:

```bash
cd backend
npm install
```

**Bước 3.2: Cài đặt cho Frontend (Giao diện)**
Mở thêm 1 Terminal nữa (dấu `+` ở góc terminal), chạy lệnh:

```bash
cd frontend
npm install
```

---

## 4. Chạy dự án (Mỗi lần bật máy)

Bạn cần mở 2 Terminal để chạy song song Server và Web.

**Terminal 1: Chạy Backend**

```bash
cd backend
npm run dev
```

> Khi thấy báo: `Server đang chạy...` và `Connected to MongoDB` là thành công.

**Terminal 2: Chạy Frontend**

```bash
cd frontend
npm start
```

> Chờ một lúc, khi thấy báo: `Open your browser on http://localhost:4200/` là xong.

---

## 5. Truy cập

- **Web bán hàng:** [http://localhost:4200](http://localhost:4200)
- **Server API:** [http://localhost:5001](http://localhost:5001)

---

**LƯU Ý QUAN TRỌNG VỀ DỮ LIỆU:**

- Dữ liệu chạy bằng VS Code (Localhost) và chạy bằng Docker là **KHÁC NHAU**.
- Nếu bạn chạy cách này, database sẽ trắng trơn (lần đầu).
- Để có dữ liệu mẫu, bạn hãy mở Terminal Backend và chạy:
  ```bash
  npm run seed
  ```
