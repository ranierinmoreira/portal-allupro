import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
from functools import wraps

app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"], supports_credentials=True)
app.secret_key = 'portal-allupro-secret-key-2025'

DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/portal_allupro'
)


def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            tipo_usuario VARCHAR(50) DEFAULT 'cliente',
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS projetos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            cliente_id INTEGER,
            tipo_projeto VARCHAR(100) NOT NULL,
            status VARCHAR(50) DEFAULT 'ativo',
            data_inicio DATE,
            data_prevista DATE,
            valor_estimado DECIMAL(12, 2),
            observacoes TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES usuarios (id)
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS materiais (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            tipo_material VARCHAR(100) NOT NULL,
            especificacoes TEXT,
            preco_unitario DECIMAL(12, 2),
            estoque_atual INTEGER DEFAULT 0,
            unidade_medida VARCHAR(20) DEFAULT 'un',
            fornecedor VARCHAR(255),
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS projeto_materiais (
            id SERIAL PRIMARY KEY,
            projeto_id INTEGER,
            material_id INTEGER,
            quantidade INTEGER NOT NULL,
            preco_unitario DECIMAL(12, 2),
            subtotal DECIMAL(12, 2),
            FOREIGN KEY (projeto_id) REFERENCES projetos (id),
            FOREIGN KEY (material_id) REFERENCES materiais (id)
        )
    ''')

    conn.commit()
    cur.close()
    conn.close()


def get_db():
    return get_conn()


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        return f(*args, **kwargs)
    return decorated


# ==================== AUTH API ====================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'senha' not in data:
        return jsonify({'success': False, 'error': 'Email e senha são obrigatórios'}), 400

    senha_hash = hashlib.sha256(data['senha'].encode()).hexdigest()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        'SELECT * FROM usuarios WHERE email = %s AND senha = %s',
        (data['email'], senha_hash)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:
        session['user_id'] = user['id']
        session['user_name'] = user['nome']
        session['user_type'] = user['tipo_usuario']
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'nome': user['nome'],
                'email': user['email'],
                'tipo_usuario': user['tipo_usuario']
            }
        })
    return jsonify({'success': False, 'error': 'Email ou senha incorretos'}), 401


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'nome' not in data or 'email' not in data or 'senha' not in data:
        return jsonify({'success': False, 'error': 'Nome, email e senha são obrigatórios'}), 400

    senha_hash = hashlib.sha256(data['senha'].encode()).hexdigest()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s) RETURNING id',
            (data['nome'], data['email'], senha_hash)
        )
        user_id = cur.fetchone()['id']
        conn.commit()
        session['user_id'] = user_id
        session['user_name'] = data['nome']
        session['user_type'] = 'cliente'
        cur.close()
        conn.close()
        return jsonify({
            'success': True,
            'user': {
                'id': user_id,
                'nome': data['nome'],
                'email': data['email'],
                'tipo_usuario': 'cliente'
            }
        }), 201
    except psycopg2.IntegrityError:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': 'Email já cadastrado'}), 400


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'nome': session['user_name'],
                'tipo_usuario': session.get('user_type', 'cliente')
            }
        })
    return jsonify({'authenticated': False}), 401


# ==================== DASHBOARD API ====================

@app.route('/api/dashboard', methods=['GET'])
@login_required
def dashboard():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) as c FROM projetos')
    total_projetos = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) as c FROM projetos WHERE status = 'ativo'")
    projetos_ativos = cur.fetchone()['c']
    cur.execute('SELECT COUNT(*) as c FROM materiais')
    total_materiais = cur.fetchone()['c']
    cur.execute('''
        SELECT p.*, u.nome as cliente_nome FROM projetos p
        LEFT JOIN usuarios u ON p.cliente_id = u.id
        ORDER BY p.data_criacao DESC LIMIT 5
    ''')
    projetos_recentes = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({
        'total_projetos': total_projetos,
        'projetos_ativos': projetos_ativos,
        'total_materiais': total_materiais,
        'projetos_recentes': [dict(r) for r in projetos_recentes]
    })


# ==================== PROJETOS API ====================

@app.route('/api/projetos', methods=['GET'])
@login_required
def get_projetos():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        SELECT p.*, u.nome as cliente_nome FROM projetos p
        LEFT JOIN usuarios u ON p.cliente_id = u.id
        ORDER BY p.data_criacao DESC
    ''')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/projetos', methods=['POST'])
@login_required
def criar_projeto():
    data = request.get_json()
    if not data or 'nome' not in data or 'tipo_projeto' not in data:
        return jsonify({'success': False, 'error': 'Nome e tipo são obrigatórios'}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO projetos (nome, descricao, cliente_id, tipo_projeto, data_inicio, data_prevista, valor_estimado, observacoes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        ''', (
            data['nome'], data.get('descricao'), data.get('cliente_id'),
            data['tipo_projeto'], data.get('data_inicio'), data.get('data_prevista'),
            data.get('valor_estimado'), data.get('observacoes')
        ))
        pid = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'id': pid}), 201
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/projetos/<int:id>', methods=['PUT'])
@login_required
def atualizar_projeto(id):
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('''
            UPDATE projetos SET nome=%s, descricao=%s, tipo_projeto=%s, status=%s, data_inicio=%s, data_prevista=%s, valor_estimado=%s, observacoes=%s
            WHERE id=%s
        ''', (
            data.get('nome'), data.get('descricao'), data.get('tipo_projeto'),
            data.get('status'), data.get('data_inicio'), data.get('data_prevista'),
            data.get('valor_estimado'), data.get('observacoes'), id
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/projetos/<int:id>', methods=['DELETE'])
@login_required
def deletar_projeto(id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM projetos WHERE id=%s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400


# ==================== MATERIAIS API ====================

@app.route('/api/materiais', methods=['GET'])
@login_required
def get_materiais():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM materiais ORDER BY nome')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/materiais', methods=['POST'])
@login_required
def criar_material():
    data = request.get_json()
    if not data or 'nome' not in data or 'tipo_material' not in data:
        return jsonify({'success': False, 'error': 'Nome e tipo são obrigatórios'}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO materiais (nome, tipo_material, especificacoes, preco_unitario, estoque_atual, unidade_medida, fornecedor)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        ''', (
            data['nome'], data['tipo_material'], data.get('especificacoes'),
            data.get('preco_unitario'), data.get('estoque_atual', 0),
            data.get('unidade_medida', 'un'), data.get('fornecedor')
        ))
        mid = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'id': mid}), 201
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/materiais/<int:id>', methods=['PUT'])
@login_required
def atualizar_material(id):
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('''
            UPDATE materiais SET nome=%s, tipo_material=%s, especificacoes=%s, preco_unitario=%s, estoque_atual=%s, unidade_medida=%s, fornecedor=%s
            WHERE id=%s
        ''', (
            data.get('nome'), data.get('tipo_material'), data.get('especificacoes'),
            data.get('preco_unitario'), data.get('estoque_atual'),
            data.get('unidade_medida', 'un'), data.get('fornecedor'), id
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/materiais/<int:id>', methods=['DELETE'])
@login_required
def deletar_material(id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM materiais WHERE id=%s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
