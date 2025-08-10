// shared/components/data-table/data-table.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { ThemePalette } from '@angular/material/core';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'status' | 'priority' | 'actions' | 'chip' | 'role' | 'currency'; // Ajout de 'currency'
  sortable?: boolean;
  width?: string;
  statusType?: 'status' | 'priority' | 'role';
}

export interface TableAction {
  icon: string;
  tooltip: string;
  color?: ThemePalette;
  action: string;
  condition?: (element: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  template: `
    <div class="data-table-container">
      <!-- Toolbar -->
      <div class="table-toolbar" *ngIf="showToolbar">
        <div class="toolbar-left">
          <h3 class="table-title" *ngIf="title">{{ title }}</h3>
          <div class="selection-info" *ngIf="selection.hasValue()">
            {{ selection.selected.length }} élément(s) sélectionné(s)
          </div>
        </div>

        <div class="toolbar-right" fxLayout="row" fxLayoutGap="10px">
          <!-- Search -->
          <mat-form-field appearance="outline" class="search-field" *ngIf="searchable">
            <mat-label>Rechercher</mat-label>
            <mat-icon matPrefix><i class="fas fa-search"></i></mat-icon>
            <input matInput
                   (keyup)="applyFilter($event)"
                   placeholder="Tapez pour rechercher..."
                   #input>
          </mat-form-field>

          <!-- Actions -->
          <ng-content select="[slot=toolbar-actions]"></ng-content>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table mat-table
               [dataSource]="dataSource"
               matSort
               class="data-table"
               [class.loading]="loading">

          <!-- Checkbox Column -->
          <ng-container matColumnDef="select" *ngIf="selectable">
            <th mat-header-cell *matHeaderCellDef class="checkbox-column">
              <mat-checkbox
                (change)="$event ? masterToggle() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="checkbox-column">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Dynamic Columns -->
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
            <th mat-header-cell
                *matHeaderCellDef
                [mat-sort-header]="column.sortable !== false ? column.key : ''"
                [style.width]="column.width">
              {{ column.label }}
            </th>

            <td mat-cell
                *matCellDef="let element"
                [style.width]="column.width"
                [ngClass]="'cell-' + column.type">

              <!-- Text -->
              <span *ngIf="!column.type || column.type === 'text'">
                {{ getNestedProperty(element, column.key) }}
              </span>

              <!-- Date -->
              <span *ngIf="column.type === 'date'" class="date-cell">
                {{ getNestedProperty(element, column.key) | date:'dd/MM/yyyy' }}
              </span>

              <!-- Currency -->
              <span *ngIf="column.type === 'currency'" class="currency-cell">
                {{ getNestedProperty(element, column.key) | currency:'EUR':'symbol':'1.2-2' }}
              </span>

              <!-- Status/Priority/Role Chip -->
              <app-status-chip
                *ngIf="column.type === 'status' || column.type === 'priority' || column.type === 'role'"
                [status]="getNestedProperty(element, column.key)"
                [type]="column.statusType || column.type">
              </app-status-chip>

              <!-- Custom Chip -->
              <mat-chip
                *ngIf="column.type === 'chip'"
                class="custom-chip">
                {{ getNestedProperty(element, column.key) }}
              </mat-chip>

              <!-- Actions -->
              <div *ngIf="column.type === 'actions'" class="actions-cell">
                <ng-container *ngFor="let action of actions">
                  <button
                    *ngIf="!action.condition || action.condition(element)"
                    mat-icon-button
                    [color]="action.color || 'primary'"
                    [matTooltip]="action.tooltip"
                    (click)="onAction(action.action, element, $event)"
                    class="action-btn">
                    <mat-icon>
                      <i [class]="action.icon"></i>
                    </mat-icon>
                  </button>
                </ng-container>
              </div>
            </td>
          </ng-container>

          <!-- Header Row -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: stickyHeader"></tr>

          <!-- Data Rows -->
          <tr mat-row
              *matRowDef="let row; columns: displayedColumns;"
              [class.selected-row]="selection.isSelected(row)"
              (click)="onRowClick(row)">
          </tr>

          <!-- No Data Row -->
          <tr class="mat-row no-data-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" [attr.colspan]="displayedColumns.length">
              <div class="no-data-content">
                <mat-icon class="no-data-icon">
                  <i class="fas fa-inbox"></i>
                </mat-icon>
                <p>{{ noDataMessage || 'Aucune donnée disponible' }}</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Loading Overlay -->
        <div class="loading-overlay" *ngIf="loading">
          <app-loader [message]="loadingMessage"></app-loader>
        </div>
      </div>

      <!-- Paginator -->
      <mat-paginator
        *ngIf="pageable"
        [pageSizeOptions]="pageSizeOptions"
        [pageSize]="pageSize"
        showFirstLastButtons
        class="table-paginator">
      </mat-paginator>
    </div>
  `,
  styles: [`
    /* Ajoutez ces styles dans data-table.component.ts dans la section styles */

    .data-table-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgb(215, 109, 234);
      margin-bottom: 20px;
      border: 1px solid rgba(191, 101, 246, 0.1);
    }

    .table-toolbar {
      padding: 20px 24px;
      background: linear-gradient(135deg, #480c53 0%, #ed5959 100%);
      border-bottom: 2px solid #d5ced1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .table-title {
      margin: 0;
      color: #8638b5;
      font-weight: 700;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .table-title::before {
      content: "";
      font-size: 1.5rem;
    }

    .selection-info {
      background: linear-gradient(45deg, #8e24aa, #ab47bc);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-left: 16px;
      box-shadow: 0 4px 12px rgba(142, 36, 170, 0.3);
    }

    .search-field {
      min-width: 320px;
    }

    .search-field ::ng-deep .mat-form-field-outline {
      border-color: #333333 !important;
      border-width: 2px !important;
    }

    .search-field ::ng-deep .mat-form-field-outline-thick {
      border-color: #6a1b9a !important;
      border-width: 3px !important;
    }

    .search-field ::ng-deep .mat-form-field-label {
      color: #333333 !important;
      font-weight: 500 !important;
    }

    .table-wrapper {
      position: relative;
      overflow: auto;
      max-height: 700px;
      background: #cc8fd9;
    }

    .data-table {
      width: 100%;
      background: #d189dd;
      font-family: 'Inter', sans-serif;
    }

    .data-table.loading {
      opacity: 0.6;
      pointer-events: none;
    }

    /* CORRECTION MAJEURE: Headers visibles avec dégradé moderne */
    ::ng-deep .mat-header-cell {
      background: linear-gradient(135deg, #a144d9 0%, #8e24aa 50%, #ab47bc 100%) !important;
      color: white !important;
      font-weight: 700 !important;
      font-size: 0.95rem !important;
      letter-spacing: 0.5px !important;
      text-transform: uppercase !important;
      border: none !important;
      padding: 16px 12px !important;
      position: relative;
      overflow: hidden;
    }

    ::ng-deep .mat-header-cell::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
      pointer-events: none;
    }

    ::ng-deep .mat-header-row {
      background: linear-gradient(135deg, #6a1b9a, #8e24aa, #ab47bc) !important;
      box-shadow: 0 4px 12px rgba(106, 27, 154, 0.2);
    }

    /* Cellules du corps améliorées */
    ::ng-deep .mat-cell {
      color: #2c2c2c !important;
      padding: 16px 12px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      border-bottom: 1px solid rgba(106, 27, 154, 0.08) !important;
      transition: all 0.2s ease !important;
    }

    ::ng-deep .mat-row {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border-bottom: 1px solid rgba(106, 27, 154, 0.05);
    }

    ::ng-deep .mat-row:hover {
      background: linear-gradient(90deg, #f8f9ff 0%, #fff 100%) !important;
      transform: translateX(4px);
      box-shadow: 4px 0 12px rgba(106, 27, 154, 0.1);
      border-left: 4px solid #8e24aa;
    }

    ::ng-deep .mat-row:nth-child(even) {
      background: rgba(248, 249, 255, 0.3);
    }

    ::ng-deep .mat-row.selected-row {
      background: linear-gradient(90deg, #e1bee7, #f3e5f5) !important;
      border-left: 4px solid #6a1b9a;
      box-shadow: 0 4px 16px rgb(209, 137, 221);
    }

    /* Colonnes spécifiques */
    .checkbox-column {
      width: 60px;
      text-align: center;
      padding: 8px !important;
    }

    ::ng-deep .mat-checkbox-checked .mat-checkbox-background {
      background-color: #b46edf !important;
    }

    /* Styles des cellules par type */
    .cell-text {
      color: #2c2c2c !important;
      font-weight: 500;
    }

    .cell-date {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px !important;
      color: #5a5a5a !important;
      background: rgba(106, 27, 154, 0.05);
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
    }

    .cell-currency {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px !important;
      color: #2e7d32 !important;
      font-weight: 700 !important;
      background: rgba(76, 175, 80, 0.1);
      padding: 6px 12px;
      border-radius: 8px;
      display: inline-block;
    }

    .cell-actions {
      text-align: center;
      padding: 8px !important;
    }

    .actions-cell {
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
    }

    /* Boutons d'action améliorés */
    .action-btn {
      width: 38px !important;
      height: 38px !important;
      border-radius: 50% !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .action-btn:hover {
      transform: scale(1.15) !important;
      box-shadow: 0 6px 20px rgba(106, 27, 154, 0.3) !important;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    /* Chips pour les statuts */
    ::ng-deep app-status-chip {
      display: inline-block;
    }

    .custom-chip {
      background: linear-gradient(45deg, #6a1b9a, #8e24aa) !important;
      color: white !important;
      font-size: 0.8rem !important;
      font-weight: 600 !important;
      border-radius: 16px !important;
      padding: 6px 16px !important;
      box-shadow: 0 2px 8px rgba(106, 27, 154, 0.3);
    }

    /* État sans données */
    .no-data-row {
      height: 250px !important;
    }

    .no-data-cell {
      text-align: center !important;
      padding: 60px 20px !important;
    }

    .no-data-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #bbb;
      animation: fadeIn 0.5s ease-in;
    }

    .no-data-icon {
      font-size: 4rem !important;
      margin-bottom: 20px !important;
      color: #e1bee7 !important;
      opacity: 0.7;
    }

    .no-data-content p {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    /* Overlay de chargement */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    /* Pagination stylisée */
    .table-paginator {
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%) !important;
      border-top: 2px solid #e1bee7 !important;
      padding: 16px !important;
    }

    ::ng-deep .mat-paginator-page-size-label,
    ::ng-deep .mat-paginator-range-label {
      color: #e7bece !important;
      font-weight: 600 !important;
    }

    ::ng-deep .mat-paginator-navigation-previous,
    ::ng-deep .mat-paginator-navigation-next,
    ::ng-deep .mat-paginator-navigation-first,
    ::ng-deep .mat-paginator-navigation-last {
      color: #b975e3 !important;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .data-table-container {
      animation: fadeIn 0.6s ease-out;
    }

    ::ng-deep .mat-row {
      animation: slideIn 0.4s ease-out;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .table-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-field {
        min-width: 100%;
      }

      .table-title {
        text-align: center;
        font-size: 1.1rem;
      }

      ::ng-deep .mat-header-cell,
      ::ng-deep .mat-cell {
        padding: 12px 8px !important;
        font-size: 13px !important;
      }

      .action-btn {
        width: 34px !important;
        height: 34px !important;
      }
    }

    @media (max-width: 480px) {
      .data-table-container {
        margin: 0 -10px;
        border-radius: 0;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .data-table {
        min-width: 600px;
      }
    }

  `]
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = 'Chargement...';
  @Input() searchable: boolean = true;
  @Input() selectable: boolean = false;
  @Input() pageable: boolean = true;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() stickyHeader: boolean = true;
  @Input() showToolbar: boolean = true;
  @Input() noDataMessage: string = '';

  @Output() actionClicked = new EventEmitter<{action: string, element: any}>();
  @Output() rowClicked = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<any[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [];

  ngOnInit(): void {
    this.setupTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
    }
    if (changes['columns']) {
      this.setupDisplayedColumns();
    }
  }

  private setupTable(): void {
    this.dataSource.data = this.data || [];
    this.setupDisplayedColumns();

    // Setup paginator and sort after view init
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });

    // Listen to selection changes
    this.selection.changed.subscribe(() => {
      this.selectionChanged.emit(this.selection.selected);
    });

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchTerms = filter.toLowerCase().split(' ');
      const dataString = Object.keys(data).reduce((currentTerm: string, key: string) => {
        return currentTerm + (data as {[key: string]: any})[key] + '◬';
      }, '').toLowerCase();

      return searchTerms.every((term: string) => dataString.indexOf(term) !== -1);
    };
  }

  private setupDisplayedColumns(): void {
    this.displayedColumns = [];

    if (this.selectable) {
      this.displayedColumns.push('select');
    }

    this.displayedColumns.push(...this.columns.map(col => col.key));
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAction(action: string, element: any, event: Event): void {
    event.stopPropagation();
    this.actionClicked.emit({ action, element });
  }

  onRowClick(row: any): void {
    if (this.selectable) {
      this.selection.toggle(row);
    }
    this.rowClicked.emit(row);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
