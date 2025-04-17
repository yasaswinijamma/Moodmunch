// frontend/src/app/local-flavor-finder/local-flavor-finder.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

interface Venue {
  name: string;
  rating: number;
  address: string;
  photo?: string;
}

interface LocalFood {
  name: string;
}

@Component({
  selector: 'app-local-flavor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="local-flavor-container">
      <h2>Discover Local Flavors</h2>
      <p class="subtitle">Find famous restaurants and local foods by zip code!</p>

      <div class="selector">
        <input type="text" [(ngModel)]="zipCode" placeholder="Enter Zip Code (e.g., 90210)" class="zip-input" />
        <select [(ngModel)]="selectedMood" (change)="fetchLocalFlavors()" class="mood-select">
          <option *ngFor="let mood of moods" [value]="mood.value">{{ mood.label }}</option>
        </select>
        <button (click)="fetchLocalFlavors()" [disabled]="!zipCode || loading">Explore</button>
      </div>

      <div *ngIf="loading" class="loading">
        <span class="spinner"></span>
        Exploring local flavors for {{ zipCode }}...
      </div>

      <p *ngIf="error && !loading" class="error">{{ error }}</p>

      <div *ngIf="venues.length > 0" class="restaurants-section" [@fadeIn]>
        <h3>Famous Local Spots</h3>
        <div class="recipe-grid">
          <div *ngFor="let venue of venues" class="recipe-card">
            <img *ngIf="venue.photo" [src]="venue.photo" [alt]="venue.name" class="recipe-image" />
            <div *ngIf="!venue.photo" class="no-image">No Image</div>
            <span>{{ venue.name }}</span>
            <p>Rating: {{ venue.rating }}/10</p>
            <p>{{ venue.address }}</p>
          </div>
        </div>
      </div>

      <button *ngIf="venues.length > 0 && !loading" (click)="loadMore()">Load More</button>
    </div>
  `,
  styles: [`
    .local-flavor-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      text-align: center;
    }
    h2 {
      color: #FF3008;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 1.2em;
      color: #666;
      margin-bottom: 20px;
    }
    .selector {
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
    }
    .zip-input {
      padding: 10px 15px;
      font-size: 1.2em;
      border: 2px solid #FF3008;
      border-radius: 25px 0 0 25px;
      width: 250px;
    }
    .mood-select {
      padding: 10px 15px;
      font-size: 1.2em;
      border: 2px solid #FF3008;
      border-left: none;
      border-right: none;
      background: white;
      color: #333;
      cursor: pointer;
    }
    .mood-select:hover {
      background: #fff5f2;
    }
    button {
      padding: 10px 20px;
      font-size: 1.2em;
      border: 2px solid #FF3008;
      border-left: none;
      border-radius: 0 25px 25px 0;
      background: #FF3008;
      color: white;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .loading, .error, .restaurants-section {
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
    h3 {
      color: #FF3008;
      font-size: 1.8em;
    }
    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    .recipe-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      text-align: center;
    }
    .recipe-image {
      max-width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
    }
    .no-image {
      width: 100%;
      height: 150px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      border-radius: 4px;
    }
    .recipe-card span {
      color: #FF3008;
      font-weight: bold;
      font-size: 1.2em;
      margin: 10px 0;
      display: block;
    }
    .recipe-card p {
      color: #666;
      font-size: 0.9em;
      margin: 5px 0;
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LocalFlavorFinderComponent implements OnInit {
  zipCode: string = '';
  venues: Venue[] = [];
  localFoods: LocalFood[] = []; // Not displayed yet, but processed
  loading = false;
  error = '';
  page: number = 0;
  selectedMood: string = '';
  moods = [
    { value: '', label: 'All Moods' },
    { value: 'happy', label: 'Happy (Italian)' },
    { value: 'comfort', label: 'Comfort (American)' },
    { value: 'spicy', label: 'Spicy (Mexican)' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Removed the authentication check to allow access without login
  }

  fetchLocalFlavors(loadMore: boolean = false) {
    if (!this.zipCode || !/^\d{5}$/.test(this.zipCode)) {
      this.error = 'Please enter a valid 5-digit zip code';
      return;
    }

    this.loading = true;
    this.error = '';
    if (!loadMore) {
      this.venues = []; // Reset only on new search
      this.page = 0;
    }

    const url = `${environment.apiUrl}/local-flavor?zipCode=${this.zipCode}&page=${this.page}` +
                (this.selectedMood ? `&mood=${this.selectedMood}` : '');
    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log('Raw API response:', data);
        this.venues = loadMore ? [...this.venues, ...(data.venues || [])] : (data.venues || []);
        this.localFoods = data.localFoods || [];
        console.log('Venues assigned:', this.venues);
        console.log('Local Foods assigned:', this.localFoods);
        this.error = (!this.venues.length) ? 'No restaurants found for this zip code' : '';
        this.loading = false;
        this.cdr.detectChanges();
        if (loadMore && data.venues.length > 0) this.page++;
      },
      error: (error) => {
        console.error('Fetch error:', error);
        this.error = 'Failed to fetch local flavors';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMore() {
    this.fetchLocalFlavors(true);
  }
}
