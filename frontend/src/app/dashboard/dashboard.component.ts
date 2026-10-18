import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Admin Dashboard</h2>
      @if (stats) {
        <div>
          <p>Total Users: {{ stats.userCount }}</p>
          <p>Top Mood: {{ stats.topMood }}</p>
          <p>Top Location: {{ stats.topLocation }}</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .dashboard-container { padding: 20px; text-align: center; }
    h2 { color: #FF3008; }
  `]
})
export class DashboardComponent {
  stats: any = null;
  constructor(private http: HttpClient, private authService: AuthService) {
    if (this.authService.isAdmin()) {
      this.http.get(`${environment.apiUrl}/admin/dashboard`, { withCredentials: true }).subscribe({
        next: (data: any) => this.stats = data,
        error: (err) => console.error('Error fetching stats:', err)
      });
    }
  }
}
