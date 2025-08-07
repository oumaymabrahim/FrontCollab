// features/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './ dashboard.component';

// Import des composants partagés
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LoadingComponent
  ]
})
export class DashboardModule { }
