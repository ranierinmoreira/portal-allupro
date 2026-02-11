import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'projetos', loadComponent: () => import('./pages/projetos/projetos.component').then(m => m.ProjetosComponent), canActivate: [authGuard] },
  { path: 'materiais', loadComponent: () => import('./pages/materiais/materiais.component').then(m => m.MateriaisComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
