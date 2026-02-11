import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a routerLink="/dashboard" class="navbar-brand">Portal ALLUPRO</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
            </li>
            <li class="nav-item">
              <a routerLink="/projetos" routerLinkActive="active" class="nav-link">Projetos</a>
            </li>
            <li class="nav-item">
              <a routerLink="/materiais" routerLinkActive="active" class="nav-link">Materiais</a>
            </li>
          </ul>
          <span class="navbar-text me-3">{{ auth.currentUser()?.nome }}</span>
          <button class="btn btn-outline-light btn-sm" (click)="auth.logout()">Sair</button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
