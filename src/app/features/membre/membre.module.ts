// features/membre/membre.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgChartsModule } from 'ng2-charts';

import { MembreDashboardComponent } from './components/membre-dashboard/membre-dashboard.component';
import { MembreProjectsComponent } from './components/membre-projects/membre-projects.component';
import { MembreTasksComponent } from './components/membre-tasks/membre-tasks.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MembreDashboardComponent },
  { path: 'projets', component: MembreProjectsComponent },
  { path: 'taches', component: MembreTasksComponent }
];

@NgModule({
  declarations: [
    MembreDashboardComponent,
    MembreProjectsComponent,
    MembreTasksComponent
  ],
  imports: [
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class MembreModule { }
