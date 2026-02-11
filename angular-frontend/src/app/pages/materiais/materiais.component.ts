import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface Material {
  id: number;
  nome: string;
  tipo_material: string;
  especificacoes: string | null;
  preco_unitario: number | null;
  estoque_atual: number;
  unidade_medida: string;
  fornecedor: string | null;
}

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Materiais</h1>
        <button class="btn btn-primary" (click)="abrirForm()">Novo Material</button>
      </div>
      @if (loading) {
        <p>Carregando...</p>
      } @else {
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Preço Unit.</th>
              <th>Estoque</th>
              <th>Unidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (m of materiais; track m.id) {
              <tr>
                <td>{{ m.nome }}</td>
                <td>{{ m.tipo_material }}</td>
                <td>{{ m.preco_unitario ? (m.preco_unitario | number:'1.2-2') : '-' }}</td>
                <td>{{ m.estoque_atual }}</td>
                <td>{{ m.unidade_medida }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="editar(m)">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" (click)="excluir(m)">Excluir</button>
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
              <h5 class="modal-title">{{ editando ? 'Editar' : 'Novo' }} Material</h5>
              <button type="button" class="btn-close" (click)="fecharForm()"></button>
            </div>
            <form (ngSubmit)="salvar()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control" [(ngModel)]="form.nome" name="nome" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Tipo</label>
                  <input type="text" class="form-control" [(ngModel)]="form.tipo_material" name="tipo_material" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Especificações</label>
                  <textarea class="form-control" [(ngModel)]="form.especificacoes" name="especificacoes" rows="2"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Preço unitário</label>
                  <input type="number" step="0.01" class="form-control" [(ngModel)]="form.preco_unitario" name="preco_unitario">
                </div>
                <div class="mb-3">
                  <label class="form-label">Estoque</label>
                  <input type="number" class="form-control" [(ngModel)]="form.estoque_atual" name="estoque_atual">
                </div>
                <div class="mb-3">
                  <label class="form-label">Unidade de medida</label>
                  <input type="text" class="form-control" [(ngModel)]="form.unidade_medida" name="unidade_medida" placeholder="un">
                </div>
                <div class="mb-3">
                  <label class="form-label">Fornecedor</label>
                  <input type="text" class="form-control" [(ngModel)]="form.fornecedor" name="fornecedor">
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
export class MateriaisComponent implements OnInit {
  materiais: Material[] = [];
  loading = true;
  showModal = false;
  editando = false;
  salvando = false;
  form = {
    id: 0,
    nome: '',
    tipo_material: '',
    especificacoes: '',
    preco_unitario: null as number | null,
    estoque_atual: 0,
    unidade_medida: 'un',
    fornecedor: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.api.get<Material[]>('/materiais').subscribe({
      next: m => {
        this.materiais = m;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  abrirForm() {
    this.editando = false;
    this.form = { id: 0, nome: '', tipo_material: '', especificacoes: '', preco_unitario: null, estoque_atual: 0, unidade_medida: 'un', fornecedor: '' };
    this.showModal = true;
  }

  editar(m: Material) {
    this.editando = true;
    this.form = {
      id: m.id,
      nome: m.nome,
      tipo_material: m.tipo_material,
      especificacoes: m.especificacoes || '',
      preco_unitario: m.preco_unitario,
      estoque_atual: m.estoque_atual,
      unidade_medida: m.unidade_medida,
      fornecedor: m.fornecedor || ''
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
      tipo_material: this.form.tipo_material,
      especificacoes: this.form.especificacoes || null,
      preco_unitario: this.form.preco_unitario,
      estoque_atual: this.form.estoque_atual,
      unidade_medida: this.form.unidade_medida || 'un',
      fornecedor: this.form.fornecedor || null
    };
    const req = this.editando
      ? this.api.put<{ success: boolean }>(`/materiais/${this.form.id}`, payload)
      : this.api.post<{ success: boolean }>('/materiais', payload);
    req.subscribe({
      next: () => {
        this.salvando = false;
        this.fecharForm();
        this.carregar();
      },
      error: () => { this.salvando = false; }
    });
  }

  excluir(m: Material) {
    if (confirm(`Excluir o material "${m.nome}"?`)) {
      this.api.delete(`/materiais/${m.id}`).subscribe(() => this.carregar());
    }
  }
}
