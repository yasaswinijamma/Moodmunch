// frontend/src/app/favorites/favorites.component.ts
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading" class="loading">Loading favorites...</div>
    <div *ngIf="!loading && favorites.length > 0" class="favorites-grid" [@listAnimation]="favorites.length">
      <div *ngFor="let favorite of favorites" class="favorite-card">
        <h3>{{ favorite.title }}</h3>
        <img [src]="favorite.image" alt="{{ favorite.title }}" *ngIf="favorite.image" />
        <p>Ready in {{ favorite.readyInMinutes }} minutes</p>
        <button (click)="removeFavorite(favorite.recipeId)" class="remove-btn">Remove</button>
      </div>
    </div>
    <div *ngIf="!loading && favorites.length === 0" class="no-favorites">No favorites found.</div>
    <div *ngIf="!loading && message" [ngClass]="messageType === 'success' ? 'success-message' : 'error-message'" [@fadeInOut]>{{ message }}</div>
  `,
  styles: [`
    .loading {
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
    }
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .favorite-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .favorite-card img {
      max-width: 100%;
      border-radius: 8px;
    }
    .remove-btn {
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #ff4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .remove-btn:hover {
      background-color: #cc0000;
    }
    .no-favorites {
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
    }
    .success-message {
      text-align: center;
      margin: 20px 0;
      color: green;
      font-size: 18px;
    }
    .error-message {
      text-align: center;
      margin: 20px 0;
      color: red;
      font-size: 18px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('FavoritesComponent constructor called');
  }

  ngOnInit() {
    console.log('FavoritesComponent ngOnInit called');
    this.fetchFavorites();
  }

  fetchFavorites() {
    console.log('fetchFavorites called');
    const username = this.authService.currentUser;
    console.log('Current user:', username);
    if (username) {
      this.loading = true;
      console.log('Loading set to true');
      console.log('Making HTTP request to:', `${environment.apiUrl}/favorites`);
      this.http.get<any[]>(`${environment.apiUrl}/favorites`, {
        withCredentials: true
      }).pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('HTTP request error caught in pipe:', err);
          return throwError(() => err);
        })
      ).subscribe({
        next: (data) => {
          console.log('HTTP request successful');
          console.log('Raw response data:', data);
          this.favorites = data || [];
          console.log('Favorites after assignment:', this.favorites);
          console.log('Favorites length:', this.favorites.length);
          this.message = null;
          this.messageType = null;
          this.loading = false;
          console.log('Loading set to false');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('HTTP request failed:', err);
          this.favorites = [];
          this.message = 'Failed to load favorites. Please try again later.';
          this.messageType = 'error';
          this.loading = false;
          console.log('Loading set to false after error');
          this.cdr.detectChanges();
          if (err.status === 403 || err.status === 401) {
            console.log('Unauthorized access, redirecting to login...');
            this.authService.logout();
          }
        },
        complete: () => {
          console.log('HTTP request completed');
        }
      });
    } else {
      console.log('No user logged in, redirecting to login...');
      this.message = 'Please log in to view your favorites.';
      this.messageType = 'error';
      this.authService.logout();
      this.cdr.detectChanges();
    }
  }

  removeFavorite(recipeId: string) {
    console.log('removeFavorite called with recipeId:', recipeId);
    const username = this.authService.currentUser;
    if (username) {
      // Find the recipe title before removing it
      const recipe = this.favorites.find(fav => fav.recipeId === recipeId);
      const recipeTitle = recipe ? recipe.title : 'Unknown Recipe';

      this.http.delete(`${environment.apiUrl}/favorites`, {
        params: { recipeId },
        withCredentials: true
      }).subscribe({
        next: (response: any) => {
          console.log('Remove favorite response:', response);
          if (response.success) {
            this.favorites = this.favorites.filter(fav => fav.recipeId !== recipeId);
            console.log('Favorites after removal:', this.favorites);
            this.message = `Removed "${recipeTitle}" from favorites!`;
            this.messageType = 'success';
            // Clear the success message after 3 seconds
            setTimeout(() => {
              this.message = null;
              this.messageType = null;
              this.cdr.detectChanges();
            }, 3000);
          } else {
            this.message = response.message || 'Failed to remove favorite. Please try again later.';
            this.messageType = 'error';
          }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error removing favorite:', err);
          this.message = err.error?.message || 'Failed to remove favorite. Please try again later.';
          this.messageType = 'error';
          this.cdr.detectChanges();
          if (err.status === 403 || err.status === 401) {
            console.log('Unauthorized access, redirecting to login...');
            this.authService.logout();
          }
        }
      });
    } else {
      this.message = 'Please log in to remove favorites.';
      this.messageType = 'error';
      this.authService.logout();
      this.cdr.detectChanges();
    }
  }
}
