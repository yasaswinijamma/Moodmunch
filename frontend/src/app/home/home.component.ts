import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container" [@fadeIn]="true">
      <!-- Hero Section -->
      <section class="hero">
        <h1>Welcome to MoodMunch{{ authService.currentUser ? ', ' + authService.currentUser : '' }}!</h1>
        <p>Discover recipes that match your mood and make cooking a delight.</p>
        <div class="hero-buttons">
          <button routerLink="/mood-picker" class="btn primary">Pick Your Mood</button>
          <button routerLink="/recipe-list/happy" class="btn secondary">Browse Recipes</button>
        </div>
      </section>

      <!-- Random Recipe Preview -->
      <section class="random-recipe" *ngIf="randomRecipe">
        <h2>Try Something New</h2>
        <div class="recipe-preview">
          <img [src]="randomRecipe.image" [alt]="randomRecipe.title" class="preview-image">
          <div class="preview-details">
            <h3>{{ randomRecipe.title }}</h3>
            <button routerLink="/recipe/{{ randomRecipe.id }}" class="btn secondary">View Recipe</button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2>Why MoodMunch?</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <img src="https://images.unsplash.com/photo-1512054502232-10a0a035d672?q=80&w=800&auto=format&fit=crop" alt="Mood Recipes" class="feature-image">
            <h3>Mood-Based Recipes</h3>
            <p>Find dishes that suit how you’re feeling today.</p>
          </div>
          <div class="feature-card">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" alt="Shopping List" class="feature-image">
            <h3>Smart Shopping List</h3>
            <p>Add ingredients with a click and shop with ease.</p>
          </div>
          <div class="feature-card">
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop" alt="Filters" class="feature-image">
            <h3>Custom Filters</h3>
            <p>Tailor recipes by diet, time, and more.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .hero {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1543353071-873f17a7a088') no-repeat center/cover;
      color: white;
      border-radius: 10px;
      margin-bottom: 40px;
    }
    .hero h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .hero p {
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    .hero-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    .btn {
      padding: 12px 25px;
      border: none;
      border-radius: 5px;
      font-size: 1.1em;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;
    }
    .btn.primary {
      background-color: #FF3008;
      color: white;
    }
    .btn.primary:hover {
      background-color: #e02b00;
      transform: scale(1.05);
    }
    .btn.secondary {
      background-color: #fff;
      color: #FF3008;
      border: 2px solid #FF3008;
    }
    .btn.secondary:hover {
      background-color: #f8f8f8;
      transform: scale(1.05);
    }
    .random-recipe {
      text-align: center;
      margin-bottom: 40px;
    }
    .random-recipe h2 {
      color: #FF3008;
      font-size: 2em;
      margin-bottom: 20px;
    }
    .recipe-preview {
      display: flex;
      align-items: center;
      gap: 20px;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 0 auto;
    }
    .preview-image {
      width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }
    .preview-details {
      text-align: left;
    }
    .preview-details h3 {
      color: #FF3008;
      margin-bottom: 10px;
    }
    .features {
      text-align: center;
    }
    .features h2 {
      color: #FF3008;
      font-size: 2em;
      margin-bottom: 30px;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .feature-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-5px);
    }
    .feature-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 15px;
      display: block;
    }
    .feature-card h3 {
      color: #FF3008;
      font-size: 1.5em;
      margin-bottom: 10px;
    }
    .feature-card p {
      color: #666;
      font-size: 1em;
    }

  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  randomRecipe: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchRandomRecipe();
  }

  fetchRandomRecipe() {
    this.http.get(`${environment.apiUrl}/recipes/random`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.randomRecipe = data.recipes[0];
      },
      error: (err) => console.error('Failed to fetch random recipe:', err)
    });
  }
}
