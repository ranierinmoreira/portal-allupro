import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Portal ALLUPRO</h1>
        <p class="subtitle">Entre na sua conta</p>
        @if (error) {
          <div class="alert alert-danger">{{ error }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Senha</label>
            <input type="password" class="form-control" [(ngModel)]="senha" name="senha" required>
          </div>
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <p class="mt-3 text-center">
          Não tem conta? <a routerLink="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { max-width: 400px; width: 100%; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: #fff; }
    .auth-card h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .subtitle { color: #6c757d; margin-bottom: 1.5rem; }
  `]
})
export class LoginComponent {
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
    this.auth.login(this.email, this.senha).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = res.error || 'Erro ao fazer login';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro de conexão. Verifique se o backend está rodando.';
      }
    });
  }
}
