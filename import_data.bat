@echo off
echo ===================================================
echo   KHOI PHUC DU LIEU DATABASE TU FILE BACKUP
echo ===================================================

echo [1/2] Dang kiem tra file backup...
if not exist "backend\backup_data\products.json" (
    echo [!] Khong tim thay file backup. Vui long chay export_data.bat o may cu truoc.
    pause
    exit
)

echo.
echo [2/2] Dang nap du lieu vao MongoDB (Qua duong ong dan)...

echo   - Dang nhap Products...
type backend\backup_data\products.json | docker-compose exec -T mongo mongoimport --db phone-store --collection products --jsonArray --drop

echo   - Dang nhap Users...
type backend\backup_data\users.json | docker-compose exec -T mongo mongoimport --db phone-store --collection users --jsonArray --drop

echo   - Dang nhap Orders...
type backend\backup_data\orders.json | docker-compose exec -T mongo mongoimport --db phone-store --collection orders --jsonArray --drop

echo   - Dang nhap Carts...
type backend\backup_data\carts.json | docker-compose exec -T mongo mongoimport --db phone-store --collection carts --jsonArray --drop

echo.
echo ===================================================
echo   DA KHOI PHUC THANH CONG!
echo   Website cua ban gio da giong het may cu.
echo ===================================================
pause
