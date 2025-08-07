
// features/projets/projets-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjetListComponent } from './projet-list/projet-list.component';

const routes: Routes = [
  { path: '', component: ProjetListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjetsRoutingModule { }
