// features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NgChartsModule } from 'ng2-charts';

import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent, UserDetailsDialogComponent } from './components/users-management/users-management.component';
import { ProjectsManagementComponent, ProjectDetailsDialogComponent } from './components/projects-management/projects-management.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'utilisateurs', component: UsersManagementComponent },
  { path: 'utilisateurs/create', component: UserFormComponent },
  { path: 'utilisateurs/edit/:id', component: UserFormComponent },
  { path: 'projets', component: ProjectsManagementComponent },
  { path: 'projets/create', component: ProjectFormComponent },
  { path: 'projets/edit/:id', component: ProjectFormComponent },
  { path: 'statistiques', component: StatisticsComponent }
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    UsersManagementComponent,
    UserDetailsDialogComponent,
    ProjectsManagementComponent,
    ProjectDetailsDialogComponent,
    UserFormComponent,
    ProjectFormComponent,
    StatisticsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
