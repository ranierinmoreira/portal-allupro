#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para visualizar dados do banco Portal ALLUPRO
"""

import sqlite3
import os

def view_database():
    """Visualiza todos os dados do banco de dados"""
    
    db_path = 'portal_allupro.db'
    
    if not os.path.exists(db_path):
        print("❌ Banco de dados não encontrado!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("=" * 60)
        print("📊 PORTAL ALLUPRO - DADOS DO BANCO")
        print("=" * 60)
        
        # Verificar tabelas existentes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"\n📋 Tabelas encontradas: {len(tables)}")
        for table in tables:
            print(f"   - {table[0]}")
        
        print("\n" + "=" * 60)
        
        # Visualizar usuários
        print("\n👥 USUÁRIOS CADASTRADOS:")
        print("-" * 40)
        cursor.execute("SELECT id, nome, email, tipo_usuario, data_criacao FROM usuarios")
        usuarios = cursor.fetchall()
        
        if usuarios:
            for usuario in usuarios:
                print(f"ID: {usuario[0]}")
                print(f"Nome: {usuario[1]}")
                print(f"Email: {usuario[2]}")
                print(f"Tipo: {usuario[3]}")
                print(f"Criado em: {usuario[4]}")
                print("-" * 40)
        else:
            print("   Nenhum usuário encontrado")
        
        # Visualizar projetos
        print("\n📁 PROJETOS:")
        print("-" * 40)
        cursor.execute("SELECT id, nome, descricao, tipo_projeto, status, data_criacao FROM projetos")
        projetos = cursor.fetchall()
        
        if projetos:
            for projeto in projetos:
                print(f"ID: {projeto[0]}")
                print(f"Nome: {projeto[1]}")
                print(f"Descrição: {projeto[2] or 'N/A'}")
                print(f"Tipo: {projeto[3]}")
                print(f"Status: {projeto[4]}")
                print(f"Criado em: {projeto[5]}")
                print("-" * 40)
        else:
            print("   Nenhum projeto encontrado")
        
        # Visualizar materiais
        print("\n📦 MATERIAIS:")
        print("-" * 40)
        cursor.execute("SELECT id, nome, tipo_material, preco_unitario, estoque_atual, unidade_medida FROM materiais")
        materiais = cursor.fetchall()
        
        if materiais:
            for material in materiais:
                print(f"ID: {material[0]}")
                print(f"Nome: {material[1]}")
                print(f"Tipo: {material[2]}")
                print(f"Preço: R$ {material[3] or '0.00'}")
                print(f"Estoque: {material[4]} {material[5]}")
                print("-" * 40)
        else:
            print("   Nenhum material encontrado")
        
        # Estatísticas gerais
        print("\n📊 ESTATÍSTICAS:")
        print("-" * 40)
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        total_usuarios = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM projetos")
        total_projetos = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM materiais")
        total_materiais = cursor.fetchone()[0]
        
        print(f"Total de usuários: {total_usuarios}")
        print(f"Total de projetos: {total_projetos}")
        print(f"Total de materiais: {total_materiais}")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Visualização concluída!")
        
    except Exception as e:
        print(f"❌ Erro ao acessar banco de dados: {e}")

if __name__ == "__main__":
    view_database()
