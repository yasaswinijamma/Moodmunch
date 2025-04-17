// frontend/src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface Meal {
  recipeId: string;
  title: string;
  image: string;
  readyInMinutes: number;
}

interface SavedMealPlan {
  id: number;
  username: string;
  meals: { [day: string]: string }; // Map of day to JSON string of meals
}

interface Order {
  id: number;
  username: string;
  orderNumber: string;
  orderDate: string;
  items: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <!-- User Profile Section -->
      <h2>User Profile</h2>
      <div class="profile-card" *ngIf="user; else loading">
        <h3>{{ user.firstName }} {{ user.lastName }}</h3>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Date of Birth:</strong> {{ user.dateOfBirth }}</p>
        <p><strong>Phone Number:</strong> {{ user.phoneNumber || 'Not set' }}</p>
        <p><strong>Address:</strong> {{ user.address || 'Not set' }}</p>
        <p><strong>Bio:</strong> {{ user.bio }}</p>
        <p><strong>Favorite Cuisine:</strong> {{ user.favoriteCuisine }}</p>
        <p><strong>Favorite Count:</strong> {{ user.favoriteCount }}</p>
        <p><strong>Meal Plan Count:</strong> {{ user.mealPlanCount }}</p>
        <p><strong>Shopping List Count:</strong> {{ user.shoppingListCount }}</p>
        <p><strong>Favorite Flavors:</strong> {{ user.flavors?.join(', ') || 'None selected' }}</p>
      </div>
      <ng-template #loading>
        <p>Loading profile...</p>
      </ng-template>
      <p *ngIf="error" class="error">{{ error }}</p>

      <!-- Order History Section -->
      <h2>Order History</h2>
      <div *ngIf="orders.length > 0; else noOrders">
        <div *ngFor="let order of orders" class="order-section">
          <h4>Order #{{ order.orderNumber }}</h4>
          <p><strong>Date:</strong> {{ order.orderDate }}</p>
          <table class="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of order.items">
                <td>{{ getItemName(item) }}</td>
                <td>{{ getItemQuantity(item) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ng-template #noOrders>
        <p>No orders placed yet. Check out your <a routerLink="/shopping-list">Shopping List</a> to place an order!</p>
      </ng-template>

      <!-- Meal Plans Section -->
      <h2>Saved Meal Plans</h2>
      <div *ngIf="mealPlans.length > 0; else noMealPlans">
        <div *ngFor="let mealPlan of mealPlans; let i = index" class="meal-plan-section">
          <h4>Meal Plan {{ i + 1 }}</h4>
          <table class="meal-plan-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Meals</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let day of daysOrder">
                <td>{{ day | titlecase }}</td>
                <td>
                  <ul>
                    <li *ngFor="let meal of getMealsForDay(mealPlan, day)">
                      {{ meal.title }} ({{ meal.readyInMinutes }} mins)
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ng-template #noMealPlans>
        <p>No meal plans saved yet. Create one in the <a routerLink="/meal-planner">Meal Planner</a>!</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      color: #333;
      margin: 30px 0 20px;
    }

    h4 {
      text-align: center;
      color: #FF3008;
      margin: 20px 0 15px;
    }

    /* Profile Card Styles */
    .profile-card {
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 40px;
    }

    .profile-card h3 {
      color: #FF3008;
      margin-bottom: 15px;
      text-align: center;
    }

    .profile-card p {
      margin: 5px 0;
      color: #555;
      font-size: 1em;
    }

    .profile-card p strong {
      color: #333;
    }

    /* Order History Styles */
    .order-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fff;
    }

    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
    }

    .order-table th,
    .order-table td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }

    .order-table th {
      background-color: #FF3008;
      color: white;
    }

    .order-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    /* Meal Plans Styles */
    .meal-plan-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fff;
    }

    .meal-plan-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
    }

    .meal-plan-table th,
    .meal-plan-table td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }

    .meal-plan-table th {
      background-color: #FF3008;
      color: white;
    }

    .meal-plan-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .meal-plan-table ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .meal-plan-table li {
      margin: 5px 0;
      color: #555;
    }

    /* Error and Link Styles */
    .error {
      color: #FF3008;
      margin-top: 10px;
      text-align: center;
    }

    a {
      color: #FF3008;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = null;
  error: string = '';
  mealPlans: SavedMealPlan[] = [];
  orders: Order[] = [];
  daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('ProfileComponent initialized');
    this.fetchProfile();
    this.fetchMealPlans();
  }

  fetchProfile() {
    console.log('Fetching profile...');
    this.http.get(`${environment.apiUrl}/profile`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        console.log('Profile fetched successfully:', data);
        this.user = data;
        this.orders = data.orders || [];
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error = 'Failed to load profile: ' + (err.error || err.statusText || 'Unknown error');
      },
      complete: () => {
        console.log('Profile fetch request completed');
      }
    });
  }

  fetchMealPlans() {
    this.http.get<SavedMealPlan[]>(`${environment.apiUrl}/meal-planner`, { withCredentials: true }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching meal plans:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (mealPlans) => {
        console.log('Fetched meal plans (raw response):', JSON.stringify(mealPlans, null, 2));
        this.mealPlans = mealPlans;
      },
      error: (err) => {
        console.error('Error fetching meal plans:', err);
        this.error = 'Failed to load meal plans: ' + (err.error?.message || 'Please try again later.');
      }
    });
  }

  getMealsForDay(mealPlan: SavedMealPlan, day: string): Meal[] {
    if (!mealPlan.meals || !mealPlan.meals[day]) {
      return [];
    }
    try {
      return JSON.parse(mealPlan.meals[day]);
    } catch (e) {
      console.error(`Error parsing meals for day ${day} in meal plan ${mealPlan.id}:`, e);
      return [];
    }
  }

  getItemName(item: string): string {
    return item.split(':')[0];
  }

  getItemQuantity(item: string): number {
    return parseInt(item.split(':')[1], 10);
  }
}
