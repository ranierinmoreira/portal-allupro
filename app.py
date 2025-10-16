from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import sqlite3
import re
import hashlib
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = '1234567890'

# Configuração do banco de dados
DATABASE = 'portal_allupro.db'

def init_db():
    """Inicializa o banco de dados com as tabelas necessárias"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo_usuario TEXT DEFAULT 'cliente',
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de projetos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projetos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            cliente_id INTEGER,
            tipo_projeto TEXT NOT NULL,
            status TEXT DEFAULT 'ativo',
            data_inicio DATE,
            data_prevista DATE,
            valor_estimado REAL,
            observacoes TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES usuarios (id)
        )
    ''')
    
    # Tabela de materiais
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS materiais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            tipo_material TEXT NOT NULL,
            especificacoes TEXT,
            preco_unitario REAL,
            estoque_atual INTEGER DEFAULT 0,
            unidade_medida TEXT DEFAULT 'un',
            fornecedor TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de itens do projeto
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projeto_materiais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projeto_id INTEGER,
            material_id INTEGER,
            quantidade INTEGER NOT NULL,
            preco_unitario REAL,
            subtotal REAL,
            FOREIGN KEY (projeto_id) REFERENCES projetos (id),
            FOREIGN KEY (material_id) REFERENCES materiais (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def login_required(f):
    """Decorator para rotas que requerem login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_db_connection():
    """Cria conexão com o banco de dados"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# ==================== ROTAS PRINCIPAIS ====================

@app.route('/')
def index():
    """Página inicial"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Página de login"""
    if request.method == 'POST':
        email = request.form['email']
        senha = hashlib.sha256(request.form['senha'].encode()).hexdigest()
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
            (email, senha)
        ).fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['nome']
            session['user_type'] = user['tipo_usuario']
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Email ou senha incorretos!', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Página de cadastro"""
    if request.method == 'POST':
        nome = request.form['nome']
        email = request.form['email']
        senha = hashlib.sha256(request.form['senha'].encode()).hexdigest()
        
        conn = get_db_connection()
        try:
            conn.execute(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                (nome, email, senha)
            )
            conn.commit()
            flash('Usuário cadastrado com sucesso!', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Email já cadastrado!', 'error')
        finally:
            conn.close()
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    """Logout do usuário"""
    session.clear()
    flash('Logout realizado com sucesso!', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard principal"""
    conn = get_db_connection()
    
    # Estatísticas gerais
    total_projetos = conn.execute('SELECT COUNT(*) as total FROM projetos').fetchone()['total']
    projetos_ativos = conn.execute("SELECT COUNT(*) as total FROM projetos WHERE status = 'ativo'").fetchone()['total']
    total_materiais = conn.execute('SELECT COUNT(*) as total FROM materiais').fetchone()['total']
    
    # Projetos recentes
    projetos_recentes = conn.execute('''
        SELECT p.*, u.nome as cliente_nome 
        FROM projetos p 
        LEFT JOIN usuarios u ON p.cliente_id = u.id 
        ORDER BY p.data_criacao DESC 
        LIMIT 5
    ''').fetchall()
    
    conn.close()
    
    return render_template('dashboard.html', 
                         total_projetos=total_projetos,
                         projetos_ativos=projetos_ativos,
                         total_materiais=total_materiais,
                         projetos_recentes=projetos_recentes)

# ==================== API DE PROJETOS ====================

@app.route('/api/projetos', methods=['GET'])
@login_required
def get_projetos():
    """API para listar projetos"""
    conn = get_db_connection()
    projetos = conn.execute('''
        SELECT p.*, u.nome as cliente_nome 
        FROM projetos p 
        LEFT JOIN usuarios u ON p.cliente_id = u.id 
        ORDER BY p.data_criacao DESC
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(projeto) for projeto in projetos])

@app.route('/api/projetos', methods=['POST'])
@login_required
def criar_projeto():
    """API para criar novo projeto"""
    data = request.get_json()
    
    conn = get_db_connection()
    try:
        cursor = conn.execute('''
            INSERT INTO projetos (nome, descricao, cliente_id, tipo_projeto, data_inicio, data_prevista, valor_estimado, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['nome'], data['descricao'], data.get('cliente_id'), 
            data['tipo_projeto'], data.get('data_inicio'), data.get('data_prevista'),
            data.get('valor_estimado'), data.get('observacoes')
        ))
        conn.commit()
        projeto_id = cursor.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'id': projeto_id}), 201
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/projetos/<int:projeto_id>', methods=['PUT'])
@login_required
def atualizar_projeto(projeto_id):
    """API para atualizar projeto"""
    data = request.get_json()
    
    conn = get_db_connection()
    try:
        conn.execute('''
            UPDATE projetos 
            SET nome = ?, descricao = ?, tipo_projeto = ?, status = ?, 
                data_inicio = ?, data_prevista = ?, valor_estimado = ?, observacoes = ?
            WHERE id = ?
        ''', (
            data['nome'], data['descricao'], data['tipo_projeto'], data['status'],
            data.get('data_inicio'), data.get('data_prevista'), data.get('valor_estimado'),
            data.get('observacoes'), projeto_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/projetos/<int:projeto_id>', methods=['DELETE'])
@login_required
def deletar_projeto(projeto_id):
    """API para deletar projeto"""
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM projetos WHERE id = ?', (projeto_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

# ==================== API DE MATERIAIS ====================

@app.route('/api/materiais', methods=['GET'])
@login_required
def get_materiais():
    """API para listar materiais"""
    conn = get_db_connection()
    materiais = conn.execute('SELECT * FROM materiais ORDER BY nome').fetchall()
    conn.close()
    
    return jsonify([dict(material) for material in materiais])

@app.route('/api/materiais', methods=['POST'])
@login_required
def criar_material():
    """API para criar novo material"""
    data = request.get_json()
    
    conn = get_db_connection()
    try:
        cursor = conn.execute('''
            INSERT INTO materiais (nome, tipo_material, especificacoes, preco_unitario, estoque_atual, unidade_medida, fornecedor)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['nome'], data['tipo_material'], data.get('especificacoes'),
            data.get('preco_unitario'), data.get('estoque_atual', 0),
            data.get('unidade_medida', 'un'), data.get('fornecedor')
        ))
        conn.commit()
        material_id = cursor.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'id': material_id}), 201
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/materiais/<int:material_id>', methods=['PUT'])
@login_required
def atualizar_material(material_id):
    """API para atualizar material"""
    data = request.get_json()
    
    conn = get_db_connection()
    try:
        conn.execute('''
            UPDATE materiais 
            SET nome = ?, tipo_material = ?, especificacoes = ?, preco_unitario = ?,
                estoque_atual = ?, unidade_medida = ?, fornecedor = ?
            WHERE id = ?
        ''', (
            data['nome'], data['tipo_material'], data.get('especificacoes'),
            data.get('preco_unitario'), data.get('estoque_atual'),
            data.get('unidade_medida'), data.get('fornecedor'), material_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/materiais/<int:material_id>', methods=['DELETE'])
@login_required
def deletar_material(material_id):
    """API para deletar material"""
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM materiais WHERE id = ?', (material_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

# ==================== PÁGINAS ====================

@app.route('/projetos')
@login_required
def projetos_page():
    """Página de gerenciamento de projetos"""
    return render_template('projetos.html')

@app.route('/materiais')
@login_required
def materiais_page():
    """Página de gerenciamento de materiais"""
    return render_template('materiais.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)