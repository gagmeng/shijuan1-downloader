@echo off
cd /d "%~dp0"
title 第一试卷网下载器

echo ============================================
echo   第一试卷网下载器 - Web Edition
echo   https://www.shijuan1.com/
echo ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js！
    echo 请从 https://nodejs.org/ 安装 Node.js v14+
    pause
    exit /b 1
)

echo 正在启动服务器 http://localhost:3211
echo.

echo 正在打开浏览器...
start http://localhost:3211
node server.js

pause
