// shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// MODULES MANQUANTS AJOUTÉS
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

// Shared components
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoaderComponent } from './components/loader/loader.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { StatusChipComponent } from './components/status-chip/status-chip.component';

// Shared pipes
import { RolePipe } from './pipes/role.pipe';
import { StatusPipe } from './pipes/status.pipe';
import { PriorityPipe } from './pipes/priority.pipe';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatChipsModule,
  MatDatepickerModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatBadgeModule,
  MatDividerModule,
  MatToolbarModule,
  MatSidenavModule
];

const SHARED_COMPONENTS = [
  ConfirmDialogComponent,
  LoaderComponent,
  DataTableComponent,
  StatusChipComponent
];

const SHARED_PIPES = [
  RolePipe,
  StatusPipe,
  PriorityPipe
];

// PIPES BUILT-IN ANGULAR AJOUTÉS
const ANGULAR_PIPES = [
  DatePipe,
  CurrencyPipe
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    ...MATERIAL_MODULES
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES
  ],
  providers: [
    ...ANGULAR_PIPES
  ]
})
export class SharedModule { }
