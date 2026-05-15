@echo off
echo ===================================================
echo   CAI DAT VA KHOI DONG PHONE STORE (TU DONG)
echo ===================================================

echo [1/3] Dang khoi tao moi truong...
if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo     - Da tao file backend/.env
) else (
    echo     - File backend/.env da ton tai
)

echo.
echo [2/3] Dang khoi dong Docker (Web + Server + DB)...
docker-compose up -d --build

echo.
echo [3/3] Dang nap du lieu san pham (Tu dong quet anh)...
echo     - Vui long cho khoang 10-20 giay de server khoi dong...
timeout /t 15 /nobreak >nul

docker-compose exec -T backend npm run seed

echo.
echo ===================================================
echo   XONG! HE THONG DA SAN SANG.
echo ===================================================
echo.
echo   - Trang web: http://localhost
echo   - Admin API: http://localhost:5001/api/products
echo.
pause
