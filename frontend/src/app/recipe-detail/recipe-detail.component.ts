// src/app/recipe-detail/recipe-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recipe-detail-container">
      <h2>{{ recipe?.title }}</h2>
      <div class="recipe-layout">
        <div class="recipe-content">
          <div class="ingredients">
            <h3>Ingredients</h3>
            <ul>
              <li *ngFor="let ing of recipe?.extendedIngredients">
                {{ ing.original }}
                <button (click)="addToShoppingList(ing.original)" class="action-btn">Add</button>
              </li>
            </ul>
          </div>
          <div class="instructions">
            <h3>Instructions</h3>
            <p [innerHTML]="recipe?.instructions || 'No instructions available'"></p>
          </div>
          <div class="actions" *ngIf="authService.isLoggedIn()">
            <button (click)="addToFavorites()" class="action-btn">Add to Favorites</button>
          </div>
        </div>
        <div class="recipe-sidebar">
          <img [src]="recipe?.image" [alt]="recipe?.title" class="recipe-image" *ngIf="recipe?.image">
          <div class="recipe-info">
            <p><strong>Calories:</strong> {{ getCalories() | number:'1.0-0' }} kcal</p>
            <p><strong>Preparation Time:</strong> {{ recipe?.readyInMinutes }} minutes</p>
          </div>
          <div class="source" *ngIf="recipe?.sourceUrl">
            <h3>Source</h3>
            <ng-container *ngIf="isVideoLink(recipe.sourceUrl); else sourceLink">
              <iframe [src]="getSafeVideoUrl(recipe.sourceUrl)" frameborder="0" allowfullscreen></iframe>
            </ng-container>
            <ng-template #sourceLink>
              <a [href]="recipe.sourceUrl" target="_blank">Visit Recipe Source</a>
              <p class="disclaimer">Note: External links may occasionally be unavailable due to third-party issues.</p>
            </ng-template>
          </div>
        </div>
      </div>
      <p *ngIf="error" class="error">{{ error }}</p>
      <p *ngIf="successMessage" class="success">{{ successMessage }}</p>
    </div>
  `,
  styles: [`
    .recipe-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      color: #FF3008;
      text-align: center;
      margin-bottom: 20px;
    }
    .recipe-layout {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }
    .recipe-content {
      flex: 1;
      min-width: 0;
    }
    .recipe-sidebar {
      flex: 0 0 300px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .recipe-image {
      width: 100%;
      max-width: 300px;
      height: auto;
      border-radius: 8px;
      object-fit: cover;
    }
    .recipe-info {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 8px;
    }
    .recipe-info p {
      margin: 10px 0;
      color: #666;
    }
    .recipe-info strong {
      color: #FF3008;
    }
    .source {
      margin-top: 20px;
    }
    .source h3 {
      color: #FF3008;
      font-size: 1.2em;
      margin-bottom: 10px;
    }
    .source iframe {
      width: 100%;
      height: 200px;
      border-radius: 8px;
    }
    .source a {
      color: #FF3008;
      text-decoration: none;
    }
    .source a:hover {
      text-decoration: underline;
    }
    .ingredients, .instructions {
      padding: 10px;
    }
    h3 {
      color: #FF3008;
      margin-bottom: 10px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin-bottom: 5px;
      padding-left: 10px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    li:before {
      content: "•";
      color: #FF3008;
      position: absolute;
      left: 0;
    }
    p {
      line-height: 1.6;
    }
    .actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      justify-content: center;
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
    .error {
      color: #FF3008;
      text-align: center;
      margin-top: 20px;
    }
    .success {
      color: #28a745;
      text-align: center;
      margin-top: 20px;
    }
    .disclaimer {
      font-size: 0.9em;
      color: #666;
      margin-top: 5px;
      font-style: italic;
    }
    @media (max-width: 768px) {
      .recipe-layout {
        flex-direction: column;
      }
      .recipe-sidebar {
        flex: 1;
      }
    }
  `]
})
export class RecipeDetailComponent implements OnInit {
  recipe: any;
  error = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('Fetching recipe details for ID:', id);
      this.http.get(`${environment.apiUrl}/recipes/${id}`, { withCredentials: true }).subscribe({
        next: (data: any) => {
          console.log('Recipe details fetched:', data);
          this.recipe = data;
          this.error = '';
        },
        error: (err) => {
          console.error('Error fetching recipe details:', err);
          this.error = 'Failed to load recipe details';
          this.recipe = null;
        }
      });
    } else {
      this.error = 'No recipe ID provided';
    }
  }

  addToFavorites() {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to add favorites';
      this.successMessage = '';
      return;
    }

    if (!this.recipe || !this.recipe.id) {
      this.error = 'No recipe ID available to add to favorites';
      this.successMessage = '';
      return;
    }

    const body = new URLSearchParams();
    body.set('recipeId', this.recipe.id.toString());
    body.set('title', this.recipe.title || 'Untitled');
    body.set('image', this.recipe.image || '');
    body.set('readyInMinutes', this.recipe.readyInMinutes?.toString() || '0');

    console.log('Making request to add favorite - URL:', `${environment.apiUrl}/favorites`, 'Body:', body.toString());

    this.http.post(`${environment.apiUrl}/favorites`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error adding to favorites - Status:', err.status, 'Message:', err.message);
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => {
        console.log('Add to favorites response:', response);
        this.successMessage = response || 'Added to favorites!';
        this.error = '';
      },
      error: (err) => {
        console.error('Failed to add to favorites - Error details:', err);
        this.error = err.error?.error || 'Failed to add to favorites. Please try again.';
        this.successMessage = '';
      }
    });
  }

  addToShoppingList(ingredient: string) {
    console.log('Attempting to add:', ingredient);
    const username = this.authService.currentUser;
    if (!username) {
      this.error = 'Please log in to add items';
      this.successMessage = '';
      return;
    }
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('ingredient', ingredient);
    this.http.post(`${environment.apiUrl}/shopping-list`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('Add response:', response);
        this.successMessage = `Added "${ingredient}" to your shopping list!`;
        this.error = '';
      },
      error: (err) => {
        console.error('Add error:', err);
        this.error = err.status === 401 ? 'Please log in to add items' : 'Failed to add item to shopping list';
        this.successMessage = '';
      }
    });
  }

  getCalories(): number {
    const nutritionCalories = this.recipe?.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount;
    if (nutritionCalories) return nutritionCalories;
    const summary = this.recipe?.summary || '';
    const match = summary.match(/(\d+)\s*calories/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  isVideoLink(url: string): boolean {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    if (this.isVideoLink(url)) {
      const videoId = url.includes('youtu.be') ? url.split('/').pop() : url.split('v=')[1]?.split('&')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return '';
  }
}
