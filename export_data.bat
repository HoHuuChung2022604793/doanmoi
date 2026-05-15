@echo off
echo ===================================================
echo   SAO LUU DU LIEU (DB + ANH + CODE) LEN GITHUB
echo ===================================================

echo [1/4] Dang xuat du lieu Database (Products, Users, Orders)...
docker-compose exec -T mongo mongoexport --db phone-store --collection products --jsonArray --pretty > backend/backup_data/products.json
docker-compose exec -T mongo mongoexport --db phone-store --collection users --jsonArray --pretty > backend/backup_data/users.json
docker-compose exec -T mongo mongoexport --db phone-store --collection orders --jsonArray --pretty > backend/backup_data/orders.json
docker-compose exec -T mongo mongoexport --db phone-store --collection carts --jsonArray --pretty > backend/backup_data/carts.json

echo.
echo [2/4] Dang quet cac hinh anh moi...
git add backend/uploads/products/*
git add backend/backup_data/*
git add .

echo.
echo [3/4] Dang luu thay doi...
set /p msg="Nhap ghi chu cho lan luu nay (Enter de bo qua): "
if "%msg%"=="" set msg="Backup full data (DB + Images)"
git commit -m "%msg%"

echo.
echo [4/4] Dang day len GitHub...
git push origin main

echo.
echo ===================================================
echo   DA LUU THANH CONG! 
echo   Database va Anh da duoc dua len mang.
echo ===================================================
pause
