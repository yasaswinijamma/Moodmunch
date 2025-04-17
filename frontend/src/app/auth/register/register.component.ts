// frontend/src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Register</h2>
      <form (ngSubmit)="register()" #registerForm="ngForm">
        <div class="form-group">
          <input
            [(ngModel)]="username"
            name="username"
            placeholder="Username"
            required
            class="input-field"
          >
        </div>
        <div class="form-group">
          <input
            [(ngModel)]="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            email
            class="input-field"
          >
        </div>
        <div class="form-group">
          <input
            [(ngModel)]="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            class="input-field"
          >
        </div>
        <div class="form-group">
          <input
            [(ngModel)]="firstName"
            name="firstName"
            placeholder="First Name"
            required
            class="input-field"
          >
        </div>
        <div class="form-group">
          <input
            [(ngModel)]="lastName"
            name="lastName"
            placeholder="Last Name"
            required
            class="input-field"
          >
        </div>
        <div class="form-group">
          <input
            [(ngModel)]="dateOfBirth"
            name="dateOfBirth"
            type="date"
            placeholder="Date of Birth"
            required
            class="input-field"
          >
        </div>
        <div class="form-group">
          <input
            [(ngModel)]="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            class="input-field"
          >
        </div>
        <div class="form-group">
          <textarea
            [(ngModel)]="address"
            name="address"
            placeholder="Address"
            class="input-field"
          ></textarea>
        </div>
        <div class="form-group">
          <select
            [(ngModel)]="bio"
            name="bio"
            required
            class="input-field"
          >
            <option value="" disabled selected>Select a Bio</option>
            <option *ngFor="let bioOption of bioOptions" [value]="bioOption">{{ bioOption }}</option>
          </select>
        </div>
        <div class="form-group">
          <select
            [(ngModel)]="favoriteCuisine"
            name="favoriteCuisine"
            required
            class="input-field"
          >
            <option value="" disabled selected>Select a Cuisine</option>
            <option *ngFor="let cuisine of cuisineOptions" [value]="cuisine">{{ cuisine }}</option>
          </select>
        </div>
        <div class="form-group">
          <select
            [(ngModel)]="flavors"
            name="flavors"
            multiple
            required
            class="input-field"
          >
            <option *ngFor="let flavor of flavorOptions" [value]="flavor">{{ flavor }}</option>
          </select>
        </div>
        <button type="submit" class="login-btn" [disabled]="!registerForm.valid">Register</button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
    </div>
  `,
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
      font-size: 1em;
    }
    textarea.input-field {
      height: 80px;
      resize: vertical;
    }
    select.input-field[multiple] {
      height: 100px;
    }
    .login-btn {
      width: 100%;
      padding: 10px;
      background-color: #FF3008;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1em;
    }
    .login-btn:hover {
      background-color: #e02b00;
    }
    .login-btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .error {
      color: #FF3008;
      text-align: center;
      margin-top: 10px;
    }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  dateOfBirth = '';
  phoneNumber = '';
  address = '';
  bio = '';
  favoriteCuisine = '';
  flavors: string[] = [];
  error = '';

  // Options for dropdowns
  bioOptions = [
    'Foodie at heart!',
    'Love spicy food and quick meals!',
    'Passionate about healthy eating.',
    'Always trying new recipes!',
    'Comfort food enthusiast.'
  ];

  cuisineOptions = [
    'Italian',
    'Mexican',
    'Indian',
    'Chinese',
    'American',
    'Japanese',
    'Mediterranean'
  ];

  flavorOptions = [
    'Spicy',
    'Savory',
    'Sweet',
    'Tangy',
    'Salty',
    'Umami',
    'Bitter'
  ];

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    console.log('Registering:', this.username);
    const body = new URLSearchParams();
    body.set('username', this.username);
    body.set('email', this.email);
    body.set('password', this.password);
    body.set('firstName', this.firstName);
    body.set('lastName', this.lastName);
    body.set('dateOfBirth', this.dateOfBirth);
    body.set('phoneNumber', this.phoneNumber);
    body.set('address', this.address);
    body.set('bio', this.bio);
    body.set('favoriteCuisine', this.favoriteCuisine);
    body.set('flavors', this.flavors.join(',')); // Convert array to comma-separated string

    this.http.post(`${environment.apiUrl}/register`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Registration response:', response);
        if (response === 'Registered successfully') {
          this.router.navigate(['/login']);
        } else {
          this.error = response; // e.g., "Username already exists"
        }
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.error = 'Registration failed: ' + (err.error?.message || 'Unknown error');
      }
    });
  }
}
