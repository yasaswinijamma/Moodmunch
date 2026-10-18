import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-random-meal-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1 class="title">Discover Your Next Meal!</h1>

      <div class="recipe-section">
        <!-- Loading Spinner -->
        <div class="loading-spinner" *ngIf="loading">
          <div class="spinner"></div>
          <p>Loading your recipe...</p>
        </div>

        <!-- Recipe Card -->
        <div class="recipe-card" *ngIf="recipe && !loading">
          <img
            *ngIf="recipe.image"
            [src]="recipe.image"
            [alt]="recipe.title || 'Recipe Image'"
            class="recipe-image"
            (error)="handleImageError($event)"
          />
          <div class="recipe-info">
            <h2>{{ recipe.title || 'No Title Available' }}</h2>
            <p class="details">
              Ready in {{ recipe.readyInMinutes || 'N/A' }} mins | Serves {{ recipe.servings || 'N/A' }}
            </p>
            <p class="summary" *ngIf="recipe.summary" [innerHTML]="showFullSummary ? recipe.summary : (recipe.summary | slice:0:150) + '...'"></p>
            <a
              *ngIf="!showFullSummary && recipe.summary.length > 150"
              (click)="showFullSummary = true"
              class="read-more"
            >
              Read More
            </a>
            <p class="summary" *ngIf="!recipe.summary">No summary available.</p>
            <button (click)="fetchRecipe()" class="action-btn">Get Another Recipe</button>
          </div>
        </div>

        <!-- Initial State -->
        <div class="initial-state" *ngIf="!recipe && !loading">
          <p>Click the button below to discover a random recipe!</p>
          <button (click)="fetchRecipe()" class="action-btn">Get a Random Recipe</button>
        </div>
      </div>

      <!-- Recipe Instructions -->
      <div class="instructions-section" *ngIf="recipe && !loading">
        <h3>Recipe Instructions</h3>
        <div class="instructions-content" *ngIf="recipe.instructions; else noInstructions">
          <div *ngIf="isStructuredInstructions; else unstructuredInstructions">
            <ol>
              <li *ngFor="let step of structuredInstructions">{{ step }}</li>
            </ol>
          </div>
          <ng-template #unstructuredInstructions>
            <p [innerHTML]="recipe.instructions"></p>
          </ng-template>
        </div>
        <ng-template #noInstructions>
          <p>No instructions available for this recipe.</p>
        </ng-template>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .container {
      max-width: 800px;
      margin: 40px auto;
      text-align: center;
      font-family: 'Poppins', sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
    .title {
      color: #FF3008;
      font-size: 2.5em;
      font-weight: 600;
      margin-bottom: 30px;
    }
    .recipe-section {
      margin-bottom: 30px;
    }
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #FF3008;
      border-top: 5px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .loading-spinner p {
      margin-top: 15px;
      font-size: 1.2em;
      color: #333;
    }
    .recipe-card {
      max-width: 500px;
      margin: 0 auto;
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    }
    .recipe-card:hover {
      transform: translateY(-5px);
    }
    .recipe-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-bottom: 2px solid #FF3008;
    }
    .recipe-info {
      padding: 20px;
      text-align: left;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .recipe-info h2 {
      font-size: 1.6em;
      color: #333;
      margin: 0 0 10px;
      font-weight: 600;
    }
    .details {
      font-size: 1.1em;
      color: #666;
      margin: 0 0 15px;
    }
    .summary {
      font-size: 0.95em;
      color: #555;
      line-height: 1.6;
      margin: 0 0 10px;
    }
    .summary b {
      color: #FF3008;
      font-weight: 600;
    }
    .summary a {
      color: #FF3008;
      text-decoration: underline;
      transition: color 0.3s ease;
    }
    .summary a:hover {
      color: #e02b00;
    }
    .read-more {
      color: #FF3008;
      cursor: pointer;
      text-decoration: underline;
      font-size: 0.9em;
      margin-top: 5px;
      display: inline-block;
    }
    .read-more:hover {
      color: #e02b00;
    }
    .initial-state {
      height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
      color: #666;
    }
    .initial-state p {
      margin-bottom: 20px;
    }
    .action-btn {
      padding: 12px 30px;
      background: #FF3008;
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 1.2em;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .action-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .action-btn:hover:not(:disabled) {
      background: #e02b00;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(255, 48, 8, 0.3);
    }
    .error {
      color: #FF3008;
      font-size: 1.2em;
      margin-top: 20px;
    }
    .instructions-section {
      max-width: 600px;
      margin: 40px auto;
      text-align: left;
    }
    .instructions-section h3 {
      font-size: 1.8em;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }
    .instructions-content {
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .instructions-content ol {
      padding-left: 20px;
      margin: 0;
    }
    .instructions-content li {
      font-size: 1em;
      color: #555;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .instructions-content p {
      font-size: 1em;
      color: #555;
      line-height: 1.6;
      margin: 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RandomMealSpinComponent implements OnInit {
  recipe: any = null;
  loading = false;
  error: string = '';
  showFullSummary = false;
  placeholderImage = 'https://via.placeholder.com/556x370?text=No+Image+Available'; // Fallback image

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('Component initialized');
    this.fetchRecipe(); // Fetch a recipe on initial load
  }

  // Getter to determine if instructions are structured (e.g., a list of steps)
  get isStructuredInstructions(): boolean {
    return this.recipe && this.recipe.analyzedInstructions && this.recipe.analyzedInstructions.length > 0;
  }

  // Getter to extract structured instructions as a list of steps
  get structuredInstructions(): string[] {
    if (this.isStructuredInstructions) {
      return this.recipe.analyzedInstructions[0].steps.map((step: any) => step.step);
    }
    return [];
  }

  fetchRecipe() {
    this.loading = true;
    this.recipe = null;
    this.showFullSummary = false; // Reset summary state
    this.error = '';
    console.log('Fetching recipe: loading =', this.loading, 'recipe =', this.recipe);
    this.cdr.detectChanges();

    // Fallback to stop loading after 5 seconds if API call hangs
    const timeout = setTimeout(() => {
      this.loading = false;
      this.error = 'Request took too long. Please try again.';
      console.log('Fallback triggered: loading =', this.loading, 'error =', this.error);
      this.cdr.detectChanges();
    }, 5000);

    this.http.get(`${environment.apiUrl}/random-spin`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        clearTimeout(timeout); // Clear the fallback timeout
        console.log('Raw API response:', data);
        const parsedRecipe = data.recipes && data.recipes.length > 0 ? data.recipes[0] : null;
        console.log('Parsed recipe:', parsedRecipe);
        this.recipe = parsedRecipe;
        if (!parsedRecipe) {
          this.error = 'No recipe found in response';
        }
        this.loading = false;
        console.log('Fetch complete: loading =', this.loading, 'recipe =', this.recipe);
        this.cdr.detectChanges();
      },
      error: (err) => {
        clearTimeout(timeout); // Clear the fallback timeout
        console.error('Error fetching random recipe:', err);
        this.error = 'Failed to fetch a random recipe: ' + (err.message || 'Unknown error');
        this.loading = false;
        console.log('Fetch failed: loading =', this.loading, 'error =', this.error);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('HTTP request completed');
      }
    });
  }

  handleImageError(event: any) {
    console.log('Image failed to load:', this.recipe.image);
    this.recipe.image = this.placeholderImage;
    this.cdr.detectChanges();
  }
}
