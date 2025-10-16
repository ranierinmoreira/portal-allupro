@echo off
echo ========================================
echo    Portal ALLUPRO - Iniciando Sistema
echo ========================================
echo.

echo Verificando dependencias...
pip install -r requirements.txt

echo.
echo Iniciando servidor...
echo Acesse: http://localhost:5000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

python app.py

pause
