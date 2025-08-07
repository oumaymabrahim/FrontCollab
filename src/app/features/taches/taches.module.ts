//features/taches/taches.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TachesRoutingModule } from './taches-routing.module';

@NgModule({
  declarations: [
    // Ajouter les composants de tâches ici
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TachesRoutingModule
  ]
})
export class TachesModule { }
