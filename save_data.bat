@echo off
echo ===================================================
echo   SAO LUU DU LIEU (ANH MOI + CODE) LEN GITHUB
echo ===================================================

echo [1/3] Dang quet cac hinh anh moi...
git add backend/uploads/products/*
git add .

echo.
echo [2/3] Dang luu thay doi...
set /p msg="Nhap ghi chu cho lan luu nay (Enter de bo qua): "
if "%msg%"=="" set msg="Auto backup images and data"
git commit -m "%msg%"

echo.
echo [3/3] Dang day len GitHub...
git push origin main

echo.
echo ===================================================
echo   DA LUU THANH CONG! 
echo   Bay gio ban co the yen tam sang may khac tai ve.
echo ===================================================
pause
