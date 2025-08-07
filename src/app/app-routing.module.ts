import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ChefLayoutComponent } from './layouts/chef-layout/chef-layout.component';
import { MembreLayoutComponent } from './layouts/membre-layout/membre-layout.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'projets',
        loadChildren: () => import('./features/projets/projets.module').then(m => m.ProjetsModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'chef',
    component: ChefLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CHEF_DE_PROJECT'] },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'projets',
        loadChildren: () => import('./features/projets/projets.module').then(m => m.ProjetsModule)
      },
      {
        path: 'taches',
        loadChildren: () => import('./features/taches/taches.module').then(m => m.TachesModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'membre',
    component: MembreLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MEMBRE_EQUIPE'] },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'mes-taches',
        loadChildren: () => import('./features/taches/taches.module').then(m => m.TachesModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
