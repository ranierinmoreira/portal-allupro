import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface DashboardData {
  total_projetos: number;
  projetos_ativos: number;
  total_materiais: number;
  projetos_recentes: Array<{
    id: number;
    nome: string;
    descricao: string | null;
    status: string;
    cliente_nome: string | null;
    valor_estimado: number | null;
  }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <div class="container py-4">
      <h1 class="mb-4">Dashboard</h1>
      @if (loading) {
        <p>Carregando...</p>
      } @else {
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Total de Projetos</h5>
                <p class="card-text display-6">{{ data?.total_projetos ?? 0 }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Projetos Ativos</h5>
                <p class="card-text display-6">{{ data?.projetos_ativos ?? 0 }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Materiais Cadastrados</h5>
                <p class="card-text display-6">{{ data?.total_materiais ?? 0 }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Projetos Recentes</span>
            <a routerLink="/projetos" class="btn btn-sm btn-primary">Ver todos</a>
          </div>
          <div class="card-body">
            @if (data?.projetos_recentes?.length) {
              <table class="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of (data?.projetos_recentes ?? []); track p.id) {
                    <tr>
                      <td>{{ p.nome }}</td>
                      <td>{{ p.cliente_nome || '-' }}</td>
                      <td><span class="badge bg-secondary">{{ p.status }}</span></td>
                      <td>{{ p.valor_estimado ? (p.valor_estimado | number:'1.2-2') : '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="mb-0 text-muted">Nenhum projeto cadastrado.</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<DashboardData>('/dashboard').subscribe({
      next: d => {
        this.data = d;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
