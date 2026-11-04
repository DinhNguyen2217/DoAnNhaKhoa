@echo off
chcp 65001 > nul
title Khoi Dong He Thong Nha Khoa
echo ============================================================
echo   HE THONG QUAN LY VA DAT LICH PHONG KHAM NHA KHOA
echo   Khoa Cong nghe Thong tin - Truong Dai hoc Kien truc Da Nang
echo   Sinh vien: Le Dinh Nguyen - MSSV: 2251220246
echo ============================================================
echo.
echo Dang khoi dong Backend (Django REST Framework - Port 8000)...
start "Dental Clinic Backend" cmd /k "cd /d C:\Users\Administrator\dental-clinic\backend && python manage.py runserver 0.0.0.0:8000"

echo Dang khoi dong Frontend (React + Vite - Port 3000)...
start "Dental Clinic Frontend" cmd /k "cd /d C:\Users\Administrator\dental-clinic\frontend && npm run dev"

echo.
echo ============================================================
echo   He thong dang khoi chay tai:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000/api/
echo   - Admin Django: http://localhost:8000/admin/
echo.
echo   Tai khoan thu nghiem:
echo   1. Admin:       admin / admin123
echo   2. Le tan:      letan1 / letan123
echo   3. Bac si:      bsminh / doctor123
echo   4. Benh nhan:   benhnhan1 / patient123
echo ============================================================
pause
