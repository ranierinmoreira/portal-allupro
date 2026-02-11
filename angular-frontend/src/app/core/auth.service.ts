import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<Usuario | null>(null);
  currentUser = computed(() => this.user());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuth();
  }

  login(email: string, senha: string): Observable<{ success: boolean; user?: Usuario; error?: string }> {
    return this.http.post<{ success: boolean; user?: Usuario; error?: string }>(
      `${environment.apiUrl}/login`,
      { email, senha }
    ).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.user.set(res.user);
        }
      })
    );
  }

  register(nome: string, email: string, senha: string): Observable<{ success: boolean; user?: Usuario; error?: string }> {
    return this.http.post<{ success: boolean; user?: Usuario; error?: string }>(
      `${environment.apiUrl}/register`,
      { nome, email, senha }
    ).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.user.set(res.user);
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/logout`, {}).subscribe();
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  checkAuth(): void {
    this.http.get<{ authenticated: boolean; user?: Usuario }>(`${environment.apiUrl}/auth/check`)
      .subscribe({
        next: res => {
          if (res.authenticated && res.user) {
            this.user.set(res.user);
          } else {
            this.user.set(null);
          }
        },
        error: () => this.user.set(null)
      });
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }
}
