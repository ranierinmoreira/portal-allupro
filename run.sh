#!/bin/bash

echo "========================================"
echo "   Portal ALLUPRO - Iniciando Sistema"
echo "========================================"
echo

echo "Verificando dependencias..."
pip3 install -r requirements.txt

echo
echo "Iniciando servidor..."
echo "Acesse: http://localhost:5000"
echo
echo "Pressione Ctrl+C para parar o servidor"
echo

python3 app.py
