import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface Projeto {
  id: number;
  nome: string;
  descricao: string | null;
  tipo_projeto: string;
  status: string;
  data_inicio: string | null;
  data_prevista: string | null;
  valor_estimado: number | null;
  cliente_nome: string | null;
}

@Component({
  selector: 'app-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Projetos</h1>
        <button class="btn btn-primary" (click)="abrirForm()">Novo Projeto</button>
      </div>
      @if (loading) {
        <p>Carregando...</p>
      } @else {
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (p of projetos; track p.id) {
              <tr>
                <td>{{ p.nome }}</td>
                <td>{{ p.tipo_projeto }}</td>
                <td><span class="badge" [class.bg-success]="p.status==='ativo'" [class.bg-secondary]="p.status!=='ativo'">{{ p.status }}</span></td>
                <td>{{ p.cliente_nome || '-' }}</td>
                <td>{{ p.valor_estimado ? (p.valor_estimado | number:'1.2-2') : '-' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="editar(p)">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" (click)="excluir(p)">Excluir</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    @if (showModal) {
      <div class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editando ? 'Editar' : 'Novo' }} Projeto</h5>
              <button type="button" class="btn-close" (click)="fecharForm()"></button>
            </div>
            <form (ngSubmit)="salvar()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control" [(ngModel)]="form.nome" name="nome" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-control" [(ngModel)]="form.descricao" name="descricao" rows="2"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Tipo</label>
                  <input type="text" class="form-control" [(ngModel)]="form.tipo_projeto" name="tipo_projeto" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" [(ngModel)]="form.status" name="status">
                    <option value="ativo">Ativo</option>
                    <option value="concluido">Concluído</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Valor estimado</label>
                  <input type="number" step="0.01" class="form-control" [(ngModel)]="form.valor_estimado" name="valor_estimado">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="fecharForm()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="salvando">{{ salvando ? 'Salvando...' : 'Salvar' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class ProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  loading = true;
  showModal = false;
  editando = false;
  salvando = false;
  form = {
    id: 0,
    nome: '',
    descricao: '',
    tipo_projeto: 'obra',
    status: 'ativo',
    valor_estimado: null as number | null
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.api.get<Projeto[]>('/projetos').subscribe({
      next: p => {
        this.projetos = p;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  abrirForm() {
    this.editando = false;
    this.form = { id: 0, nome: '', descricao: '', tipo_projeto: 'obra', status: 'ativo', valor_estimado: null };
    this.showModal = true;
  }

  editar(p: Projeto) {
    this.editando = true;
    this.form = {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao || '',
      tipo_projeto: p.tipo_projeto,
      status: p.status,
      valor_estimado: p.valor_estimado
    };
    this.showModal = true;
  }

  fecharForm() {
    this.showModal = false;
  }

  salvar() {
    this.salvando = true;
    const payload = {
      nome: this.form.nome,
      descricao: this.form.descricao || null,
      tipo_projeto: this.form.tipo_projeto,
      status: this.form.status,
      valor_estimado: this.form.valor_estimado
    };
    const req = this.editando
      ? this.api.put<{ success: boolean }>(`/projetos/${this.form.id}`, payload)
      : this.api.post<{ success: boolean }>('/projetos', payload);
    req.subscribe({
      next: () => {
        this.salvando = false;
        this.fecharForm();
        this.carregar();
      },
      error: () => { this.salvando = false; }
    });
  }

  excluir(p: Projeto) {
    if (confirm(`Excluir o projeto "${p.nome}"?`)) {
      this.api.delete(`/projetos/${p.id}`).subscribe(() => this.carregar());
    }
  }
}
