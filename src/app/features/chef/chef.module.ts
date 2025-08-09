// features/chef/chef.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgChartsModule } from 'ng2-charts';

import { ChefDashboardComponent } from './components/chef-dashboard/chef-dashboard.component';
import { ChefProjectsComponent, ProjectDetailsDialogComponent } from './components/chef-projects/chef-projects.component';
import { ChefTasksComponent, TaskDetailsDialogComponent } from './components/chef-tasks/chef-tasks.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { ChefReportsComponent } from './components/chef-reports/chef-reports.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ChefDashboardComponent },
  { path: 'projets', component: ChefProjectsComponent },
  { path: 'taches', component: ChefTasksComponent },
  { path: 'taches/create', component: TaskFormComponent },
  { path: 'taches/edit/:id', component: TaskFormComponent },
  { path: 'rapports', component: ChefReportsComponent }
];

@NgModule({
  declarations: [
    ChefDashboardComponent,
    ChefProjectsComponent,
    ChefTasksComponent,
    TaskFormComponent,
    ChefReportsComponent,
    // Dialog Components
    TaskDetailsDialogComponent,
    ProjectDetailsDialogComponent
  ],
  imports: [
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class ChefModule { }
