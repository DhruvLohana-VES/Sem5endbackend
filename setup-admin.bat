@echo off
echo ============================================
echo   Admin Role Setup for MediCare Backend
echo ============================================
echo.

echo Step 1: Checking database schema...
node scripts/migrate-admin-role.js
if %errorlevel% neq 0 (
    echo.
    echo ============================================
    echo   MANUAL ACTION REQUIRED
    echo ============================================
    echo.
    echo Please complete the following steps:
    echo.
    echo 1. Open: https://eprhxuegfxkkkjlrjwsz.supabase.co
    echo 2. Go to: SQL Editor
    echo 3. Click: New Query
    echo 4. Copy and paste this SQL:
    echo.
    echo    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    echo    ALTER TABLE users ADD CONSTRAINT users_role_check 
    echo      CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));
    echo.
    echo 5. Click: Run (or press Ctrl+Enter)
    echo 6. Wait for success message
    echo 7. Run this script again: setup-admin.bat
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating admin user...
node scripts/seed-admin.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Admin Setup Complete!
echo ============================================
echo.
echo Admin Credentials:
echo   Email:    admin@gmail.com
echo   Password: Test@123
echo.
echo You can now start the servers and test!
echo.
pause
