// src/app/recipe-list/recipe-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="recipe-list-container">
      <h2>Recipes {{ mood ? 'for ' + (mood | titlecase) : '' }}</h2>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="mood" (change)="applyFilter()" class="filter-select">
          <option value="">Any Mood</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="hungry">Hungry</option>
          <option value="cozy">Cozy</option>
          <option value="excited">Excited</option>
          <option value="relaxed">Relaxed</option>
        </select>
        <select [(ngModel)]="cuisine" (change)="applyFilter()" class="filter-select">
          <option value="">Any Cuisine</option>
          <option value="italian">Italian</option>
          <option value="american">American</option>
          <option value="mexican">Mexican</option>
          <option value="indian">Indian</option>
          <option value="chinese">Chinese</option>
        </select>
        <select [(ngModel)]="diet" (change)="applyFilter()" class="filter-select">
          <option value="">Any Diet</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten free">Gluten Free</option>
          <option value="ketogenic">Ketogenic</option>
        </select>
        <select [(ngModel)]="intolerances" (change)="applyFilter()" class="filter-select">
          <option value="">No Intolerances</option>
          <option value="dairy">Dairy</option>
          <option value="gluten">Gluten</option>
          <option value="peanut">Peanut</option>
          <option value="soy">Soy</option>
        </select>
        <select [(ngModel)]="type" (change)="applyFilter()" class="filter-select">
          <option value="">Any Type</option>
          <option value="main course">Main Course</option>
          <option value="dessert">Dessert</option>
          <option value="appetizer">Appetizer</option>
          <option value="breakfast">Breakfast</option>
        </select>
        <input
          type="text"
          [(ngModel)]="query"
          placeholder="Search Recipe"
          class="filter-input"
          (keyup.enter)="applyFilter()"
        >
        <input
          type="text"
          [(ngModel)]="ingredient"
          placeholder="Ingredient"
          class="filter-input"
          (keyup.enter)="applyFilter()"
        >
        <input
          type="number"
          [(ngModel)]="maxCalories"
          placeholder="Max Calories"
          class="filter-input"
          (keyup.enter)="applyFilter()"
        >
        <input
          type="number"
          [(ngModel)]="maxReadyTime"
          placeholder="Max Time (min)"
          class="filter-input"
          (keyup.enter)="applyFilter()"
        >
        <button (click)="applyFilter()" class="filter-btn" [disabled]="loading">Search</button>
      </div>

      <!-- Loading and Error States -->
      <div *ngIf="loading" class="loading">
        <span class="spinner"></span>
        Loading recipes...
      </div>
      <p *ngIf="error && !loading" class="error">{{ error }}</p>

      <!-- Recipe Grid -->
      <div class="recipe-grid" [@listAnimation]="recipes.length">
        <div *ngFor="let recipe of recipes" class="recipe-card">
          <img [src]="recipe.image" [alt]="recipe.title" class="recipe-image" />
          <div class="recipe-info">
            <a [routerLink]="['/recipe', recipe.id]">{{ recipe.title }}</a>
            <p>Time: {{ recipe.readyInMinutes }} mins | Likes: {{ recipe.aggregateLikes || 0 }}</p>
            <p *ngIf="recipe.summary" class="summary" [innerHTML]="recipe.summary | slice:0:100">...</p>
          </div>
          <div class="button-group">
            <button *ngIf="authService.isLoggedIn()" (click)="addToShoppingList(recipe)" class="add-btn">
              Add to Shopping List
            </button>
            <button *ngIf="authService.isLoggedIn()" (click)="addToFavorites(recipe)" class="add-btn">
              Add to Favorites
            </button>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <button *ngIf="!loading && hasMore" (click)="loadMore()" class="load-more">Load More</button>
    </div>
  `,
  styles: [`
    .recipe-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h2 {
      color: #FF3008;
      text-align: center;
      font-size: 2em;
      margin-bottom: 20px;
    }
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      justify-content: center;
      flex-wrap: wrap;
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
    }
    .filter-select, .filter-input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
      width: 150px;
    }
    .filter-btn {
      padding: 8px 15px;
      background-color: #FF3008;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
    }
    .filter-btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .filter-btn:hover:not(:disabled) {
      background-color: #e02b00;
    }
    .loading {
      text-align: center;
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
      vertical-align: middle;
      margin-right: 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      text-align: center;
      font-size: 1.2em;
      color: #FF3008;
      margin: 20px 0;
    }
    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .recipe-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease;
    }
    .recipe-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    }
    .recipe-image {
      max-width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 4px;
    }
    .recipe-info {
      padding: 10px 0;
    }
    .recipe-card a {
      color: #FF3008;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.2em;
      display: block;
      margin: 10px 0;
    }
    .recipe-card a:hover {
      text-decoration: underline;
    }
    .recipe-info p {
      margin: 5px 0;
      color: #666;
      font-size: 0.9em;
    }
    .summary {
      font-style: italic;
      color: #888;
    }
    .button-group {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 10px;
    }
    .add-btn {
      padding: 8px 12px;
      background-color: #FF3008;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .add-btn:hover {
      background-color: #e02b00;
    }
    .load-more {
      display: block;
      margin: 20px auto;
      padding: 10px 20px;
      background-color: #FF3008;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .load-more:hover {
      background-color: #e02b00;
    }
  `],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class RecipeListComponent implements OnInit {
  recipes: any[] = [];
  mood: string = '';
  cuisine: string = '';
  diet: string = '';
  intolerances: string = '';
  type: string = '';
  query: string = '';
  ingredient: string = '';
  maxCalories: number | null = null;
  maxReadyTime: number | null = null;
  error: string = '';
  loading: boolean = false;
  page: number = 1;
  number: number = 25;
  totalResults: number = 0;
  hasMore: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.mood = this.route.snapshot.paramMap.get('mood') || '';
    this.fetchRecipes();
  }

  fetchRecipes(append = false) {
    this.loading = true;
    this.error = '';
    const offset = (this.page - 1) * this.number;
    let url = `${environment.apiUrl}/recipes/search?number=${this.number}&offset=${offset}`;

    if (this.mood) url += `&mood=${encodeURIComponent(this.mood)}`;
    if (this.cuisine) url += `&cuisine=${encodeURIComponent(this.cuisine)}`;
    if (this.diet) url += `&diet=${encodeURIComponent(this.diet)}`;
    if (this.intolerances) url += `&intolerances=${encodeURIComponent(this.intolerances)}`;
    if (this.type) url += `&type=${encodeURIComponent(this.type)}`;
    if (this.query) url += `&query=${encodeURIComponent(this.query)}`;
    if (this.ingredient) url += `&ingredient=${encodeURIComponent(this.ingredient)}`;
    if (this.maxCalories) url += `&maxCalories=${this.maxCalories}`;
    if (this.maxReadyTime) url += `&maxReadyTime=${this.maxReadyTime}`;

    this.http.get(url, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.totalResults = data.totalResults || 0;
        const newRecipes = data.results || [];
        this.recipes = append ? [...this.recipes, ...newRecipes] : newRecipes;
        this.hasMore = (this.page * this.number) < this.totalResults;
        this.error = this.recipes.length === 0 ? 'No recipes found' : '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.error = 'Failed to load recipes';
        this.recipes = [];
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.page = 1;
    this.fetchRecipes();
    this.router.navigate(['/recipe-list', this.mood || 'search']);
  }

  loadMore() {
    this.page++;
    this.fetchRecipes(true);
  }

  addToShoppingList(recipe: any) {
    const username = this.authService.currentUser;
    if (!username) {
      this.error = 'Please log in to add items';
      return;
    }
    this.http.get(`${environment.apiUrl}/recipes/${recipe.id}`, { withCredentials: true }).subscribe({
      next: (recipeDetails: any) => {
        const ingredients = recipeDetails.extendedIngredients || [];
        if (ingredients.length === 0) {
          this.error = 'No ingredients found for this recipe';
          return;
        }
        ingredients.forEach((ing: any) => {
          const body = new URLSearchParams();
          body.set('username', username);
          body.set('ingredient', ing.original || ing.name || 'Unknown ingredient');
          this.http.post(`${environment.apiUrl}/shopping-list`, body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            responseType: 'text',
            withCredentials: true
          }).subscribe({
            next: (response) => console.log('Added:', ing.original || ing.name, 'Response:', response),
            error: (err) => console.error('Failed to add:', err)
          });
        });
        alert(`${recipe.title} ingredients added to shopping list!`);
      },
      error: (err) => {
        console.error('Failed to fetch recipe details:', err);
        this.error = 'Failed to fetch recipe details';
      }
    });
  }

  addToFavorites(recipe: any) {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to add to favorites';
      return;
    }

    const body = new URLSearchParams();
    body.set('recipeId', recipe.id.toString());
    body.set('title', recipe.title || 'Untitled');
    body.set('image', recipe.image || '');
    body.set('readyInMinutes', recipe.readyInMinutes?.toString() || '0');

    console.log('Making request to add favorite - URL:', `${environment.apiUrl}/favorites`, 'Body:', body.toString());

    this.http.post(`${environment.apiUrl}/favorites`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        console.log('Added to favorites:', response);
        alert(`${recipe.title} added to favorites!`);
      },
      error: (err) => {
        console.error('Failed to add to favorites:', err);
        this.error = 'Failed to add to favorites';
      }
    });
  }
}
