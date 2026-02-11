# Portal ALLUPRO

Sistema de gestão de projetos e materiais, com backend Flask e frontend Angular.

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- npm
- PostgreSQL 12+

## Configuração do PostgreSQL

### 1. Instalar PostgreSQL

No Windows, baixe em [postgresql.org](https://www.postgresql.org/download/windows/).

### 2. Criar o banco de dados

```sql
CREATE DATABASE portal_allupro;
```

### 3. Variável de ambiente (opcional)

O backend usa por padrão: `postgresql://postgres:postgres@localhost:5432/portal_allupro`

Para alterar, defina a variável `DATABASE_URL`:

```bash
# Windows (PowerShell)
$env:DATABASE_URL = "postgresql://usuario:senha@localhost:5432/portal_allupro"

# Linux/Mac
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/portal_allupro"
```

## Executando o projeto

### 1. Backend (Flask)

```bash
pip install -r requirements.txt
python app.py
```

O backend estará em `http://localhost:5000`

### 2. Frontend (Angular)

```bash
cd angular-frontend
npm install
npm start
```

O frontend estará em `http://localhost:4200` com proxy para a API.

### 3. Primeiro acesso

1. Abra `http://localhost:4200`
2. Clique em "Cadastre-se" para criar uma conta
3. Faça login e use o sistema

## Estrutura

- `app.py` - API REST Flask (auth, dashboard, projetos, materiais)
- `angular-frontend/` - Aplicação Angular 21
- Banco PostgreSQL (tabelas criadas automaticamente na primeira execução)

## Funcionalidades

- **Login/Registro** - Autenticação com sessão
- **Dashboard** - Estatísticas e projetos recentes
- **Projetos** - CRUD completo
- **Materiais** - CRUD completo
