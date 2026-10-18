// frontend/src/app/auth/login/login.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <h2>Sign In</h2>
      <form (ngSubmit)="login()">
        <div class="form-group">
          <input [(ngModel)]="username" name="username" placeholder="Username" required class="input-field">
        </div>
        <div class="form-group">
          <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required class="input-field">
        </div>
        <button type="submit" name="submit" class="login-btn">Sign In</button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
      <a routerLink="/register" class="register-link">Need an account? Register</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      color: #FF3008;
      text-align: center;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .input-field {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .login-btn {
      width: 100%;
      padding: 10px;
      background-color: #FF3008;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .login-btn:hover {
      background-color: #e02b00;
    }
    .error {
      color: #FF3008;
      text-align: center;
    }
    .register-link {
      display: block;
      text-align: center;
      color: #FF3008;
      text-decoration: none;
      margin-top: 15px;
    }
    .register-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    console.log('Form submitted');
    console.log('Login attempt with username:', this.username);
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login succeeded:', response);
        this.error = '';
        this.router.navigate(['/shopping-list']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.error = 'Invalid username or password';
      }
    });
  }
}
