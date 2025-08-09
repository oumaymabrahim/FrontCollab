// layout/layout.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false">
        <app-sidebar></app-sidebar>
      </mat-sidenav>

      <mat-sidenav-content>
        <app-header [drawer]="drawer"></app-header>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .sidenav {
      width: 250px;
      background: linear-gradient(180deg, #6a1b9a 0%, #8e24aa 50%, #ab47bc 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.12);
    }

    .main-content {
      padding: 20px;
      background: #f8f9ff;
      min-height: calc(100vh - 64px);
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 10px;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {}
}
