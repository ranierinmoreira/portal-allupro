import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home">
      <header class="hero">
        <nav class="navbar navbar-expand-lg navbar-dark">
          <div class="container">
            <span class="navbar-brand">Portal ALLUPRO</span>
            <div class="ms-auto">
              <a routerLink="/login" class="btn btn-outline-light me-2">Entrar</a>
              <a routerLink="/register" class="btn btn-light">Cadastrar</a>
            </div>
          </div>
        </nav>
        <div class="hero-content">
          <h1>Gestão de Projetos e Materiais</h1>
          <p class="lead">Organize seus projetos, controle materiais e acompanhe tudo em um só lugar.</p>
          <div class="cta-buttons">
            <a routerLink="/register" class="btn btn-light btn-lg me-2">Começar agora</a>
            <a routerLink="/login" class="btn btn-outline-light btn-lg">Já tenho conta</a>
          </div>
        </div>
      </header>
      <section class="features py-5">
        <div class="container">
          <h2 class="text-center mb-4">O que você pode fazer</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 text-center">
                <div class="card-body">
                  <div class="feature-icon mb-3">📋</div>
                  <h5>Projetos</h5>
                  <p class="text-muted">Crie e gerencie seus projetos com status, prazos e valores.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 text-center">
                <div class="card-body">
                  <div class="feature-icon mb-3">📦</div>
                  <h5>Materiais</h5>
                  <p class="text-muted">Cadastre materiais, controle estoque e acompanhe fornecedores.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 text-center">
                <div class="card-body">
                  <div class="feature-icon mb-3">📊</div>
                  <h5>Dashboard</h5>
                  <p class="text-muted">Visualize estatísticas e projetos recentes em tempo real.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer class="py-4 text-white text-center" style="background: #2b2b2b;">
        <p class="mb-0">© Portal ALLUPRO</p>
      </footer>
    </div>
  `,
  styles: [`
    .home { min-height: 100vh; }
    .hero {
      min-height: 70vh;
      background: linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 50%, #2b2b2b 100%);
      color: white;
      display: flex;
      flex-direction: column;
      padding-bottom: 3rem;
    }
    .hero .navbar { padding: 1rem 0; }
    .hero-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem 1rem;
    }
    .hero-content h1 { font-size: 2.5rem; font-weight: 600; margin-bottom: 1rem; }
    .hero-content .lead { font-size: 1.2rem; opacity: 0.95; max-width: 600px; margin-bottom: 2rem; }
    .feature-icon { font-size: 2.5rem; }
    .card { border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px; }
  `]
})
export class HomeComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
