// app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'FrontCollab';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Initialisation de l'application
    console.log('Application initialisée');
  }
}
