import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Shared components
import { NavbarComponent } from './shared/components/navbar/navbar.component';


// Layout components
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ChefLayoutComponent } from './layouts/chef-layout/chef-layout.component';
import { MembreLayoutComponent } from './layouts/membre-layout/membre-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AdminLayoutComponent,
    ChefLayoutComponent,
    MembreLayoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
