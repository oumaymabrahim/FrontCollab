
// features/projets/projets.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProjetsRoutingModule } from './projets-routing.module';
import { ProjetListComponent } from './projet-list/projet-list.component';

// Import des composants partagés
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [
    ProjetListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProjetsRoutingModule,
    LoadingComponent,
    MatIconModule
  ]
})
export class ProjetsModule { }
