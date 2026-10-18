import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div *ngIf="loading" class="loading">Loading statistics...</div>
      <div *ngIf="!loading">
        <div *ngIf="stats; else noData">
          <!-- Statistics Overview Cards -->
          <div class="stats-overview">
            <div class="stat-card">
              <h4>Total Users</h4>
              <p class="stat-value">{{ stats.totalUsers || 0 }}</p>
            </div>
            <div class="stat-card">
              <h4>Total Orders</h4>
              <p class="stat-value">{{ stats.totalOrders || 0 }}</p>
            </div>
            <div class="stat-card">
              <h4>Total Meal Plans</h4>
              <p class="stat-value">{{ stats.totalMealPlans || 0 }}</p>
            </div>
            <div class="stat-card">
              <h4>Total Favorites</h4>
              <p class="stat-value">{{ stats.totalFavorites || 0 }}</p>
            </div>
          </div>

          <!-- Detailed Statistics Table -->
          <div class="stats-table-section">
            <h3>Detailed Statistics</h3>
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Statistic</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Users</td>
                  <td>{{ stats.totalUsers || 0 }}</td>
                </tr>
                <tr>
                  <td>Total Orders</td>
                  <td>{{ stats.totalOrders || 0 }}</td>
                </tr>
                <tr>
                  <td>Average Orders Per User</td>
                  <td>{{ stats.averageOrdersPerUser || 0 }}</td>
                </tr>
                <tr>
                  <td>Total Meal Plans</td>
                  <td>{{ stats.totalMealPlans || 0 }}</td>
                </tr>
                <tr>
                  <td>Total Favorites</td>
                  <td>{{ stats.totalFavorites || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top Users by Orders Section -->
          <div class="top-users-section">
            <h3>Top Users by Orders</h3>
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Order Count</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of stats.topUsersByOrders">
                  <td>{{ user.username }}</td>
                  <td>{{ user.orderCount }}</td>
                </tr>
                <tr *ngIf="!stats.topUsersByOrders || stats.topUsersByOrders.length === 0">
                  <td colspan="2">No users with orders available.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Recent Orders Section -->
          <div class="recent-orders-section">
            <h3>Recent Orders</h3>
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Number</th>
                  <th>Username</th>
                  <th>Order Date</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of stats.recentOrders">
                  <td>{{ order.id }}</td>
                  <td>{{ order.orderNumber }}</td>
                  <td>{{ order.username }}</td>
                  <td>{{ order.orderDate | date:'medium' }}</td>
                  <td>
                    <ul>
                      <li *ngFor="let item of order.items">{{ item }}</li>
                    </ul>
                  </td>
                </tr>
                <tr *ngIf="!stats.recentOrders || stats.recentOrders.length === 0">
                  <td colspan="5">No recent orders available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ng-template #noData>
          <p class="no-data">No statistics available at this time. Check console for details.</p>
        </ng-template>
      </div>
      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .admin-dashboard {
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      color: #FF3008;
      margin-bottom: 30px;
      font-size: 2.2em;
      font-weight: 600;
    }

    h3 {
      color: #333;
      margin: 30px 0 15px;
      font-size: 1.5em;
      text-align: center;
    }

    h4 {
      color: #FF3008;
      margin-bottom: 10px;
      font-size: 1.2em;
    }

    /* Loading State */
    .loading {
      text-align: center;
      color: #666;
      font-size: 1.1em;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }

    /* Stats Overview Cards */
    .stats-overview {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      flex: 1 1 calc(33.333% - 20px);
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      min-width: 200px;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2em;
      color: #FF3008;
      font-weight: bold;
      margin: 0;
    }

    /* Detailed Statistics Table */
    .stats-table-section,
    .top-users-section,
    .recent-orders-section {
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }

    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
    }

    .stats-table th,
    .stats-table td {
      padding: 12px;
      border: 1px solid #ddd;
      text-align: left;
      font-size: 1em;
    }

    .stats-table th {
      background-color: #FF3008;
      color: white;
      font-weight: 600;
    }

    .stats-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .stats-table tr {
      transition: background-color 0.3s ease;
    }

    .stats-table tr:hover {
      background-color: #f1f1f1;
    }

    /* Items List Styling */
    .stats-table ul {
      margin: 0;
      padding-left: 20px;
    }

    .stats-table li {
      margin-bottom: 5px;
      font-size: 0.95em;
    }

    /* No Data and Error Styles */
    .no-data, .error {
      text-align: center;
      color: #FF3008;
      margin: 20px 0;
      font-size: 1.1em;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .stat-card {
        flex: 1 1 calc(50% - 20px);
      }

      .stats-table th,
      .stats-table td {
        font-size: 0.9em;
        padding: 8px;
      }
    }

    @media (max-width: 480px) {
      .stat-card {
        flex: 1 1 100%;
      }

      .stats-table {
        font-size: 0.85em;
      }

      .stats-table th,
      .stats-table td {
        padding: 6px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('AdminDashboardComponent initialized');
    console.log('Fetching admin stats from:', `${environment.apiUrl}/admin/stats`);
    this.http.get(`${environment.apiUrl}/admin/stats`, { withCredentials: true })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error fetching admin stats:', err);
          this.error = 'Failed to load admin stats: ' + (err.error?.message || err.statusText || 'Unknown error');
          this.loading = false;
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (data: any) => {
          console.log('Admin stats fetched successfully:', data);
          this.stats = data;
          this.loading = false;
          console.log('Stats set, loading set to false. Current stats:', this.stats);
        },
        error: (err) => {
          console.error('Error in subscription:', err);
        },
        complete: () => {
          console.log('Request to /api/admin/stats completed.');
        }
      });
  }
}
