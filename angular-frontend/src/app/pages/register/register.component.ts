import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Portal ALLUPRO</h1>
        <p class="subtitle">Crie sua conta</p>
        @if (error) {
          <div class="alert alert-danger">{{ error }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Nome</label>
            <input type="text" class="form-control" [(ngModel)]="nome" name="nome" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Senha</label>
            <input type="password" class="form-control" [(ngModel)]="senha" name="senha" required>
          </div>
          <button type="submit" class="btn w-100" [disabled]="loading" style="background: #2b2b2b; color: white; border: none;">
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </form>
        <p class="mt-3 text-center">
          Já tem conta? <a routerLink="/login">Entrar</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 50%, #2b2b2b 100%);
    }
    .auth-card {
      max-width: 400px;
      width: 100%;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      background: #f8f9fa;
    }
    .auth-card h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #2b2b2b; }
    .subtitle { color: #6b6b6b; margin-bottom: 1.5rem; }
    .auth-card a { color: #2b2b2b; font-weight: 500; }
  `]
})
export class RegisterComponent {
  nome = '';
  email = '';
  senha = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.register(this.nome, this.email, this.senha).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = res.error || 'Erro ao cadastrar';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro de conexão. Verifique se o backend está rodando.';
      }
    });
  }
}
