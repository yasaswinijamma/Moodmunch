// frontend/src/app/shopping-list/shopping-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

interface ShoppingListItem {
  username: string;
  ingredient: string;
  quantity: number;
  purchased: boolean;
}

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shopping-list-container">
      <h2>Your Shopping List</h2>

      <div *ngIf="loading" class="loading">
        <span class="spinner"></span>
        Loading your shopping list...
      </div>

      <p *ngIf="error && !loading" class="error">{{ error }}</p>

      <ul *ngIf="items.length > 0 && !loading && !error" class="item-list">
        <li *ngFor="let item of items" class="item">
          <span>{{ item.ingredient }} (Quantity: {{ item.quantity }})</span>
          <div class="item-actions">
            <button (click)="increaseQuantity(item)" class="action-btn">+</button>
            <button (click)="removeItem(item)" class="action-btn remove-btn">Remove</button>
          </div>
        </li>
      </ul>

      <p *ngIf="items.length === 0 && !loading && !error" class="empty">
        Your shopping list is empty. Add items from recipes!
      </p>

      <div *ngIf="items.length > 0 && !loading && !error" class="order-section">
        <button (click)="placeOrder()" class="order-btn">Place Order</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .shopping-list-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      text-align: center;
    }
    h2 {
      color: #FF3008;
      font-size: 2em;
      margin-bottom: 20px;
    }
    .loading {
      font-size: 1.2em;
      color: #666;
      margin: 20px 0;
    }
    .spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #FF3008;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error, .empty {
      color: #FF3008;
      font-size: 1.2em;
      margin: 20px 0;
    }
    .item-list {
      list-style: none;
      padding: 0;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 10px 15px;
      margin: 10px 0;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      text-align: left;
    }
    .item-actions {
      display: flex;
      gap: 10px;
    }
    .action-btn {
      padding: 5px 10px;
      background-color: #FF3008;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .action-btn:hover {
      background-color: #e02b00;
    }
    .remove-btn {
      background-color: #dc3545;
    }
    .remove-btn:hover {
      background-color: #c82333;
    }
    .order-section {
      margin-top: 20px;
    }
    .order-btn {
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1em;
    }
    .order-btn:hover {
      background-color: #218838;
    }
  `]
})
export class ShoppingListComponent implements OnInit {
  items: ShoppingListItem[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.fetchShoppingList();
  }

  fetchShoppingList() {
    const username = this.authService.currentUser;
    if (!username) {
      this.error = 'Please log in to view your shopping list';
      return;
    }

    this.loading = true;
    this.error = '';
    this.http.get<ShoppingListItem[]>(`${environment.apiUrl}/shopping-list?username=${username}`, { withCredentials: true }).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        if (data.length === 0 && !this.error) {
            // If the list is empty, it might be due to an unauthorized access (403)
            // We can set an error message here if needed
            this.error = ''; // Optionally set a message, but the template handles empty lists
        }
      },
      error: (err) => {
        console.error('Failed to load shopping list:', err);
        this.error = 'Failed to load shopping list: ' + (err.status === 403 ? 'Unauthorized access' : 'Unknown error');
        this.loading = false;
        this.items = []; // Ensure items is empty on error
      }
    });
  }

  increaseQuantity(item: ShoppingListItem) {
    const username = this.authService.currentUser;
    if (!username) {
      this.error = 'Please log in to modify your shopping list';
      return;
    }

    this.http.post(`${environment.apiUrl}/shopping-list/increase-quantity`, null, {
      params: { username, ingredient: item.ingredient },
      withCredentials: true,
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.fetchShoppingList(); // Refresh the list
      },
      error: (err) => {
        console.error('Failed to increase quantity:', err);
        this.error = 'Failed to increase quantity';
      }
    });
  }

  removeItem(item: ShoppingListItem) {
    const username = this.authService.currentUser;
    if (!username) {
      this.error = 'Please log in to modify your shopping list';
      return;
    }

    this.http.delete(`${environment.apiUrl}/shopping-list/remove`, {
      params: { username, ingredient: item.ingredient },
      withCredentials: true,
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.fetchShoppingList(); // Refresh the list
      },
      error: (err) => {
        console.error('Failed to remove item:', err);
        this.error = 'Failed to remove item';
      }
    });
  }

  placeOrder() {
    const username = this.authService.currentUser;
    if (!username) {
      this.error = 'Please log in to place an order';
      return;
    }

    this.http.post(`${environment.apiUrl}/shopping-list/place-order`, null, {
      params: { username },
      withCredentials: true,
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        alert(response); // e.g., "Order placed successfully. Order number: ORD-12345678"
        this.fetchShoppingList(); // Refresh the list (should be empty)
      },
      error: (err) => {
        console.error('Failed to place order:', err);
        this.error = 'Failed to place order: ' + (err.error || 'Unknown error');
      }
    });
  }
}
