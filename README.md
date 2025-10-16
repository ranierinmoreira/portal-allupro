# Portal ALLUPRO - Sistema de Gestão de Projetos de Alumínio

Sistema completo para gerenciamento de projetos de alumínio, incluindo controle de materiais, clientes e projetos.

## Funcionalidades

### 🔐 Autenticação
- Sistema de login e cadastro de usuários
- Controle de sessões
- Proteção de rotas

### 📊 Dashboard
- Visão geral do sistema
- Estatísticas de projetos e materiais
- Projetos recentes
- Ações rápidas

### 📁 Gerenciamento de Projetos
- CRUD completo de projetos
- Controle de status (ativo, pausado, concluído, cancelado)
- Tipos de projeto (esquadrias, fachadas, estruturas, outros)
- Controle de datas e valores estimados
- Associação com clientes

### 📦 Gerenciamento de Materiais
- CRUD completo de materiais
- Controle de estoque
- Tipos de materiais (perfil, vidro, ferragem, acessório)
- Preços e fornecedores
- Unidades de medida

### 🎨 Interface Moderna
- Design responsivo com Bootstrap 5
- Interface intuitiva e moderna
- Animações e transições suaves
- Sistema de notificações (toast)

## Tecnologias Utilizadas

### Backend
- **Python 3.x**
- **Flask** - Framework web
- **SQLite** - Banco de dados
- **Hashlib** - Criptografia de senhas

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilos customizados
- **Bootstrap 5** - Framework CSS
- **JavaScript (ES6+)** - Interatividade
- **Bootstrap Icons** - Ícones

### Arquitetura
- **MVC** - Model-View-Controller
- **API REST** - Endpoints para CRUD
- **Responsive Design** - Mobile-first

## Instalação e Execução

### Pré-requisitos
- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd portal-allupro
   ```

2. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute a aplicação**
   ```bash
   python app.py
   ```

4. **Acesse o sistema**
   - Abra o navegador em: `http://localhost:5000`
   - O sistema redirecionará automaticamente para o login

### Primeiro acesso

1. Na página de login, clique em "Criar Conta"
2. Preencha os dados para criar sua conta
3. Faça login com suas credenciais
4. Comece criando seus primeiros projetos e materiais!

## Estrutura do Projeto

```
portal-allupro/
├── app.py                 # Aplicação Flask principal
├── main.html             # Página de redirecionamento
├── requirements.txt      # Dependências Python
├── README.md            # Documentação
├── portal_allupro.db    # Banco de dados SQLite (criado automaticamente)
├── templates/           # Templates HTML
│   ├── base.html        # Template base
│   ├── login.html       # Página de login
│   ├── register.html    # Página de cadastro
│   ├── dashboard.html   # Dashboard principal
│   ├── projetos.html    # Gerenciamento de projetos
│   └── materiais.html   # Gerenciamento de materiais
└── static/              # Arquivos estáticos
    ├── css/
    │   └── style.css    # Estilos customizados
    └── js/
        └── app.js       # JavaScript da aplicação
```

## API Endpoints

### Autenticação
- `GET /` - Página inicial (redireciona para login)
- `GET/POST /login` - Login de usuário
- `GET/POST /register` - Cadastro de usuário
- `GET /logout` - Logout de usuário

### Dashboard
- `GET /dashboard` - Dashboard principal

### Projetos
- `GET /projetos` - Página de gerenciamento
- `GET /api/projetos` - Listar todos os projetos
- `POST /api/projetos` - Criar novo projeto
- `PUT /api/projetos/<id>` - Atualizar projeto
- `DELETE /api/projetos/<id>` - Deletar projeto

### Materiais
- `GET /materiais` - Página de gerenciamento
- `GET /api/materiais` - Listar todos os materiais
- `POST /api/materiais` - Criar novo material
- `PUT /api/materiais/<id>` - Atualizar material
- `DELETE /api/materiais/<id>` - Deletar material

## Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

- **usuarios** - Dados dos usuários do sistema
- **projetos** - Informações dos projetos
- **materiais** - Catálogo de materiais
- **projeto_materiais** - Relacionamento entre projetos e materiais

## Segurança

- Senhas criptografadas com SHA-256
- Controle de sessões
- Proteção de rotas com decorators
- Validação de dados nos formulários

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais do projeto.

---

**Portal ALLUPRO** - Soluções em Alumínio com Tecnologia
