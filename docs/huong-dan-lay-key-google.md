# Hướng dẫn lấy Key Đăng nhập Google & Facebook

Để chức năng đăng nhập hoạt động, bạn cần thay thế các dòng `your_..._here` trong file `backend/.env` bằng Key thật.

## 1. Google Login (Lấy Google Client ID)

1. Truy cập: [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo Project mới (VD: "Phone Shop").
3. Vào menu **APIs & Services** > **Credentials**.
4. Nhấn **Create Credentials** > **OAuth client ID**.
   - Nếu nó bắt cấu hình "Consent Screen" trước: Chọn **External**, điền tên app, email, nhấn Save.
5. Chọn Application type: **Web application**.
6. Điền các mục:
   - **Authorized redirect URIs**: Thêm đường dẫn: `http://localhost:5001/api/auth/google/callback`
     _(Lưu ý: Port là 5001 do mình đã đổi)_
7. Nhấn **Create**.
8. Copy **Client ID** và **Client Secret** dán vào file `.env`.

## 2. Facebook Login

1. Truy cập: [Meta for Developers](https://developers.facebook.com/)
2. Tạo App mới (Chọn loại **Consumer** hoặc **Authenticate**).
3. Thêm sản phẩm **Facebook Login**.
4. Vào Settings của Facebook Login > Điền **Valid OAuth Redirect URIs**:
   `http://localhost:5001/api/auth/facebook/callback`
5. Vào Settings > Basic để lấy **App ID** và **App Secret**.
6. Dán vào file `.env`.

---

**Ví dụ file .env chuẩn:**

```ini
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz...
FACEBOOK_APP_ID=987654...
FACEBOOK_APP_SECRET=abcdef...
```

Sau khi sửa file `.env`, hãy **tắt và chạy lại Backend** (`npm run dev`) để cập nhật.
