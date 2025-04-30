import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-left">
          <a routerLink="/home" class="brand">MoodMunch</a>
          <input [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="Search recipes..." class="search-input">
          <button (click)="search()" class="search-btn">Search</button>
          <a routerLink="/mood-picker">Browse by Mood</a>
          <a routerLink="/recipe-list">Recipes</a>
          <a routerLink="/random-spin">Random Spin</a>
          <a routerLink="/local-flavor">Local Flavors</a>
        </div>
        <div class="nav-right">
          <ng-container *ngIf="authService.isLoggedIn() | async; else notLoggedIn">
            <a routerLink="/profile">Profile</a>
            <a routerLink="/favorites">Favorites</a>
            <a routerLink="/meal-planner">Meal Planner</a>
            <a routerLink="/shopping-list">Shopping List</a>
            <a *ngIf="authService.isAdmin() | async" routerLink="/admin-dashboard">Admin Dashboard</a>
            <span class="user-greeting">Hello, {{ (authService.getCurrentUser() | async) || 'User' }}</span>
            <button (click)="logout()" class="logout-btn">Sign Out</button>
          </ng-container>
          <ng-template #notLoggedIn>
            <a routerLink="/login">Sign In</a>
            <a routerLink="/register">Register</a>
          </ng-template>
        </div>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      <footer class="footer">
        <p>© 2025 MoodMunch. All rights reserved.</p>
        <div class="footer-links">
          <a routerLink="/contact">Contact Us</a>
          <a routerLink="/privacy">Privacy Policy</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .navbar {
      position: fixed;
      top: 0;
      width: 100%;
      background-color: #FF3008;
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    .nav-left, .nav-right {
      display: flex;
      align-items: center;
    }
    .brand {
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-decoration: none;
      margin-right: 20px;
    }
    .search-input {
      padding: 5px;
      border: none;
      border-radius: 4px;
      margin-right: 10px;
    }
    .search-btn {
      padding: 5px 10px;
      background-color: white;
      color: #FF3008;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .search-btn:hover {
      background-color: #f0f0f0;
    }
    a {
      color: white;
      text-decoration: none;
      margin: 0 15px;
    }
    a:hover {
      text-decoration: underline;
    }
    .user-greeting {
      color: white;
      margin: 0 15px;
    }
    .logout-btn {
      background-color: white;
      color: #FF3008;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 15px;
    }
    .logout-btn:hover {
      background-color: #f0f0f0;
    }
    .nav-right {
      gap: 10px;
      padding-right: 40px;
    }
    .content {
      flex: 1;
      margin-top: 60px;
      padding: 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: #f8f8f8;
      border-top: 1px solid #ddd;
    }
    .footer p {
      color: #666;
      margin-bottom: 10px;
    }
    .footer-links {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .footer-links a {
      color: #FF3008;
      text-decoration: none;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class AppComponent {
  searchQuery = '';
  constructor(private router: Router, public authService: AuthService) {}

  search() {
    if (this.searchQuery) {
      this.router.navigate(['/recipe-list', this.searchQuery]);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
