// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Role } from './core/models/user.model';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'chef',
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.CHEF_DE_PROJECT] },
    loadChildren: () => import('./features/chef/chef.module').then(m => m.ChefModule)
  },
  {
    path: 'membre',
    component: LayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.MEMBRE_EQUIPE] },
    loadChildren: () => import('./features/membre/membre.module').then(m => m.MembreModule)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
