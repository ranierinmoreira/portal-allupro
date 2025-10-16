// JavaScript para o Portal ALLUPRO

// Funções utilitárias
const Utils = {
    // Formatar moeda
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Formatar data
    formatDate: (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    // Mostrar loading
    showLoading: (element) => {
        element.innerHTML = '<span class="loading"></span> Carregando...';
        element.disabled = true;
    },

    // Esconder loading
    hideLoading: (element, originalText) => {
        element.innerHTML = originalText;
        element.disabled = false;
    },

    // Mostrar toast de sucesso
    showSuccess: (message) => {
        showToast(message, 'success');
    },

    // Mostrar toast de erro
    showError: (message) => {
        showToast(message, 'error');
    },

    // Confirmar ação
    confirm: (message, callback) => {
        if (confirm(message)) {
            callback();
        }
    }
};

// Função para mostrar toast
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove o toast após ser escondido
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Criar container de toast se não existir
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// API Helper
const API = {
    // Fazer requisição GET
    get: async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro na requisição');
            return await response.json();
        } catch (error) {
            Utils.showError('Erro ao carregar dados: ' + error.message);
            throw error;
        }
    },

    // Fazer requisição POST
    post: async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Erro na requisição');
            return await response.json();
        } catch (error) {
            Utils.showError('Erro ao salvar dados: ' + error.message);
            throw error;
        }
    },

    // Fazer requisição PUT
    put: async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Erro na requisição');
            return await response.json();
        } catch (error) {
            Utils.showError('Erro ao atualizar dados: ' + error.message);
            throw error;
        }
    },

    // Fazer requisição DELETE
    delete: async (url) => {
        try {
            const response = await fetch(url, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erro na requisição');
            return await response.json();
        } catch (error) {
            Utils.showError('Erro ao deletar dados: ' + error.message);
            throw error;
        }
    }
};

// Gerenciador de projetos
const ProjetoManager = {
    // Carregar projetos
    loadProjetos: async () => {
        try {
            const projetos = await API.get('/api/projetos');
            this.renderProjetos(projetos);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    },

    // Renderizar projetos na tabela
    renderProjetos: (projetos) => {
        const tbody = document.getElementById('projetos-tbody');
        if (!tbody) return;

        tbody.innerHTML = projetos.map(projeto => `
            <tr>
                <td>${projeto.nome}</td>
                <td>${projeto.descricao || '-'}</td>
                <td>${projeto.cliente_nome || '-'}</td>
                <td>${projeto.tipo_projeto}</td>
                <td>
                    <span class="status-badge status-${projeto.status}">
                        ${projeto.status}
                    </span>
                </td>
                <td>${Utils.formatDate(projeto.data_inicio)}</td>
                <td>${Utils.formatDate(projeto.data_prevista)}</td>
                <td>${projeto.valor_estimado ? Utils.formatCurrency(projeto.valor_estimado) : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="ProjetoManager.editProjeto(${projeto.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="ProjetoManager.deleteProjeto(${projeto.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Criar novo projeto
    createProjeto: async (data) => {
        try {
            const result = await API.post('/api/projetos', data);
            if (result.success) {
                Utils.showSuccess('Projeto criado com sucesso!');
                this.loadProjetos();
                return true;
            }
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
        }
        return false;
    },

    // Editar projeto
    editProjeto: async (id) => {
        try {
            const projetos = await API.get('/api/projetos');
            const projeto = projetos.find(p => p.id === id);
            
            if (projeto) {
                this.showProjetoModal(projeto);
            }
        } catch (error) {
            console.error('Erro ao carregar projeto:', error);
        }
    },

    // Deletar projeto
    deleteProjeto: async (id) => {
        Utils.confirm('Tem certeza que deseja deletar este projeto?', async () => {
            try {
                const result = await API.delete(`/api/projetos/${id}`);
                if (result.success) {
                    Utils.showSuccess('Projeto deletado com sucesso!');
                    this.loadProjetos();
                }
            } catch (error) {
                console.error('Erro ao deletar projeto:', error);
            }
        });
    },

    // Mostrar modal de projeto
    showProjetoModal: (projeto = null) => {
        const modal = new bootstrap.Modal(document.getElementById('projetoModal'));
        const form = document.getElementById('projetoForm');
        
        if (projeto) {
            // Preencher formulário para edição
            form.querySelector('[name="nome"]').value = projeto.nome;
            form.querySelector('[name="descricao"]').value = projeto.descricao || '';
            form.querySelector('[name="tipo_projeto"]').value = projeto.tipo_projeto;
            form.querySelector('[name="status"]').value = projeto.status;
            form.querySelector('[name="data_inicio"]').value = projeto.data_inicio || '';
            form.querySelector('[name="data_prevista"]').value = projeto.data_prevista || '';
            form.querySelector('[name="valor_estimado"]').value = projeto.valor_estimado || '';
            form.querySelector('[name="observacoes"]').value = projeto.observacoes || '';
            form.dataset.projetoId = projeto.id;
        } else {
            // Limpar formulário para novo projeto
            form.reset();
            delete form.dataset.projetoId;
        }
        
        modal.show();
    }
};

// Gerenciador de materiais
const MaterialManager = {
    // Carregar materiais
    loadMateriais: async () => {
        try {
            const materiais = await API.get('/api/materiais');
            this.renderMateriais(materiais);
        } catch (error) {
            console.error('Erro ao carregar materiais:', error);
        }
    },

    // Renderizar materiais
    renderMateriais: (materiais) => {
        const container = document.getElementById('materiais-container');
        if (!container) return;

        container.innerHTML = materiais.map(material => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card material-card h-100">
                    <div class="card-body text-center">
                        <div class="material-icon bg-primary">
                            <i class="bi bi-box"></i>
                        </div>
                        <h5 class="card-title">${material.nome}</h5>
                        <p class="card-text text-muted">${material.tipo_material}</p>
                        <div class="mb-2">
                            <small class="text-muted">Preço: </small>
                            <strong>${material.preco_unitario ? Utils.formatCurrency(material.preco_unitario) : 'N/A'}</strong>
                        </div>
                        <div class="mb-3">
                            <small class="text-muted">Estoque: </small>
                            <span class="badge bg-${material.estoque_atual > 10 ? 'success' : material.estoque_atual > 0 ? 'warning' : 'danger'}">
                                ${material.estoque_atual} ${material.unidade_medida}
                            </span>
                        </div>
                        <div class="btn-group w-100">
                            <button class="btn btn-sm btn-outline-primary" onclick="MaterialManager.editMaterial(${material.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="MaterialManager.deleteMaterial(${material.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Criar novo material
    createMaterial: async (data) => {
        try {
            const result = await API.post('/api/materiais', data);
            if (result.success) {
                Utils.showSuccess('Material criado com sucesso!');
                this.loadMateriais();
                return true;
            }
        } catch (error) {
            console.error('Erro ao criar material:', error);
        }
        return false;
    },

    // Editar material
    editMaterial: async (id) => {
        try {
            const materiais = await API.get('/api/materiais');
            const material = materiais.find(m => m.id === id);
            
            if (material) {
                this.showMaterialModal(material);
            }
        } catch (error) {
            console.error('Erro ao carregar material:', error);
        }
    },

    // Deletar material
    deleteMaterial: async (id) => {
        Utils.confirm('Tem certeza que deseja deletar este material?', async () => {
            try {
                const result = await API.delete(`/api/materiais/${id}`);
                if (result.success) {
                    Utils.showSuccess('Material deletado com sucesso!');
                    this.loadMateriais();
                }
            } catch (error) {
                console.error('Erro ao deletar material:', error);
            }
        });
    },

    // Mostrar modal de material
    showMaterialModal: (material = null) => {
        const modal = new bootstrap.Modal(document.getElementById('materialModal'));
        const form = document.getElementById('materialForm');
        
        if (material) {
            // Preencher formulário para edição
            form.querySelector('[name="nome"]').value = material.nome;
            form.querySelector('[name="tipo_material"]').value = material.tipo_material;
            form.querySelector('[name="especificacoes"]').value = material.especificacoes || '';
            form.querySelector('[name="preco_unitario"]').value = material.preco_unitario || '';
            form.querySelector('[name="estoque_atual"]').value = material.estoque_atual || '';
            form.querySelector('[name="unidade_medida"]').value = material.unidade_medida || '';
            form.querySelector('[name="fornecedor"]').value = material.fornecedor || '';
            form.dataset.materialId = material.id;
        } else {
            // Limpar formulário para novo material
            form.reset();
            delete form.dataset.materialId;
        }
        
        modal.show();
    }
};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar animações aos elementos
    document.querySelectorAll('.dashboard-card, .material-card').forEach(card => {
        card.classList.add('fade-in');
    });

    // Carregar dados específicos da página
    if (window.location.pathname === '/projetos') {
        ProjetoManager.loadProjetos();
    } else if (window.location.pathname === '/materiais') {
        MaterialManager.loadMateriais();
    }
});
