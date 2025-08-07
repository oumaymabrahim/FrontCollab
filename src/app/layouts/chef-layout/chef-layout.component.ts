// layouts/chef-layout/chef-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-chef-layout',
  templateUrl: './chef-layout.component.html',
  styleUrls: ['../layout.component.scss']
})
export class ChefLayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}
