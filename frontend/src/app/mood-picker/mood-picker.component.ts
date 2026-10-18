import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { animate, style, transition, trigger, stagger, query } from '@angular/animations';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-mood-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mood-picker-container">
      <h2>What's Your Mood Today?</h2>
      <p class="subtitle">Pick a vibe or take our quick quiz to find out!</p>

      <!-- Quiz Section -->
      <div class="quiz-container" *ngIf="!quizComplete">
        <h3>How Are You Feeling?</h3>
        <div class="quiz-options">
          <button *ngFor="let option of quizOptions"
                  (click)="answerQuiz(option.value)"
                  class="quiz-btn">{{ option.label }}</button>
        </div>
        <p *ngIf="quizStep === 2">One more: What's your energy level?</p>
      </div>

      <!-- Mood Picker Section -->
      <div *ngIf="quizComplete">
        <div class="filter-toggle">
          <label><input type="checkbox" [(ngModel)]="quickMealsOnly"> Quick Meals Only</label>
        </div>
        <div class="mood-grid" [@gridAnimation]="moods.length">
          <div *ngFor="let mood of moods"
               class="mood-card"
               [ngClass]="[mood.class, selectedMood === mood.name ? 'selected' : '']"
               (click)="selectMood(mood.name)"
               (mouseenter)="hoverMood(mood.name)"
               (mouseleave)="unhoverMood()">
               <img [src]="mood.previewImage" class="mood-preview" alt="{{ mood.name }} preview">
               <div class="mood-icon">{{ mood.icon }}</div>
               <span class="mood-name">{{ mood.name | titlecase }}</span>
               <p class="mood-desc">{{ quickMealsOnly ? mood.quickDesc : mood.desc }}</p>
               <p class="recipe-teaser" *ngIf="mood.recipeTitle">"Try: {{ mood.recipeTitle }}"</p>
          </div>
        </div>
        <button class="quiz-reset" (click)="resetQuiz()">Take Quiz Again</button>
      </div>
    </div>
  `,
  styles: [`
    .mood-picker-container {
      max-width: 1200px;
      margin: 60px auto 20px;
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #fff7f5 0%, #fff 100%);
      border-radius: 12px;
    }
    h2 {
      color: #FF3008;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    .quiz-container {
      margin: 30px 0;
    }
    .quiz-container h3 {
      color: #FF3008;
      font-size: 1.8em;
      margin-bottom: 20px;
    }
    .quiz-options {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      justify-content: center;
    }
    .quiz-btn {
      padding: 10px 20px;
      background: #fff;
      border: 2px solid #FF3008;
      border-radius: 8px;
      color: #FF3008;
      font-size: 1em;
      cursor: pointer;
      transition: background 0.3s ease, color 0.3s ease;
    }
    .quiz-btn:hover {
      background: #FF3008;
      color: white;
    }
    .filter-toggle {
      margin-bottom: 20px;
      font-size: 1em;
      color: #333;
    }
    .filter-toggle input {
      margin-right: 5px;
    }
    .mood-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 25px;
      padding: 0 10px;
    }
    .mood-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow: hidden;
      min-height: 260px;
    }
    .mood-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    .mood-card.selected {
      border: 3px solid #FF3008;
      box-shadow: 0 0 15px rgba(255, 48, 8, 0.5);
    }
    .mood-preview {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.2;
      transition: opacity 0.3s ease;
    }
    .mood-card:hover .mood-preview {
      opacity: 0.4;
    }
    .mood-icon {
      font-size: 2.5em;
      margin-bottom: 15px;
      z-index: 1;
      transition: transform 0.3s ease;
    }
    .mood-card:hover .mood-icon {
      transform: scale(1.2);
    }
    .mood-name {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      z-index: 1;
    }
    .mood-desc {
      font-size: 0.95em;
      color: #888;
      line-height: 1.4;
      z-index: 1;
    }
    .recipe-teaser {
      font-size: 0.9em;
      color: #FF3008;
      margin-top: 10px;
      z-index: 1;
    }
    .quiz-reset {
      margin-top: 30px;
      padding: 10px 20px;
      background: #FF3008;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .quiz-reset:hover {
      background: #e02b00;
    }
    /* Mood-specific styles */
    .happy { background: linear-gradient(135deg, #fff9e6, #ffe066); }
    .happy:hover { background: #ffd700; color: #333; }
    .sad { background: linear-gradient(135deg, #e6f0fa, #99c2ff); }
    .sad:hover { background: #6699ff; color: white; }
    .hungry { background: linear-gradient(135deg, #ffe6e6, #ff9999); }
    .hungry:hover { background: #ff6666; color: white; }
    .cozy { background: linear-gradient(135deg, #f5e6ff, #cc99ff); }
    .cozy:hover { background: #b366ff; color: white; }
    .excited { background: linear-gradient(135deg, #e6ffe6, #99ff99); }
    .excited:hover { background: #66ff66; color: #333; }
    .relaxed { background: linear-gradient(135deg, #e6faff, #80d4ff); }
    .relaxed:hover { background: #4db8ff; color: white; }
    @media (max-width: 768px) {
      .mood-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .mood-card {
        min-height: 220px;
      }
      h2 { font-size: 2em; }
      .subtitle { font-size: 1em; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger('gridAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class MoodPickerComponent implements OnInit {
  moods = [
    { name: 'happy', icon: '😊', desc: 'Bright and cheerful dishes', quickDesc: 'Quick sunny bites', class: 'happy', previewImage: '', recipeTitle: '' },
    { name: 'sad', icon: '😢', desc: 'Comfort food to lift you up', quickDesc: 'Fast comfort snacks', class: 'sad', previewImage: '', recipeTitle: '' },
    { name: 'hungry', icon: '🍽️', desc: 'Hearty and filling meals', quickDesc: 'Speedy hearty eats', class: 'hungry', previewImage: '', recipeTitle: '' },
    { name: 'cozy', icon: '🛋️', desc: 'Warm and snug recipes', quickDesc: 'Quick cozy treats', class: 'cozy', previewImage: '', recipeTitle: '' },
    { name: 'excited', icon: '🎉', desc: 'Bold and fun flavors', quickDesc: 'Fast bold bites', class: 'excited', previewImage: '', recipeTitle: '' },
    { name: 'relaxed', icon: '🌿', desc: 'Calm and easy cooking', quickDesc: 'Easy calm dishes', class: 'relaxed', previewImage: '', recipeTitle: '' }
  ];

  selectedMood: string | null = null;
  quickMealsOnly = false;
  quizComplete = false;
  quizStep = 1;
  quizAnswers: string[] = [];
  quizOptions = [
    { label: 'Cheerful', value: 'happy' },
    { label: 'Down', value: 'sad' },
    { label: 'Starving', value: 'hungry' },
    { label: 'Snuggly', value: 'cozy' },
    { label: 'Pumped', value: 'excited' },
    { label: 'Chill', value: 'relaxed' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.fetchRecipePreviews();
  }

  fetchRecipePreviews() {
    this.moods.forEach(mood => {
      const params = this.quickMealsOnly ? '?mood=' + mood.name + '&maxReadyTime=30' : '?mood=' + mood.name;
            this.http.get(`${environment.apiUrl}/recipes/random${params}`, { withCredentials: true }).subscribe({
              next: (data: any) => {
                mood.previewImage = data.image || 'https://via.placeholder.com/556x370';
                mood.recipeTitle = data.title || 'Sample Recipe';
        },
        error: () => {
          mood.previewImage = 'https://via.placeholder.com/556x370';
          mood.recipeTitle = 'Sample Recipe';
        }
      });
    });
  }

  selectMood(mood: string) {
    this.selectedMood = mood;
    setTimeout(() => {
      this.router.navigate(['/recipe-list', mood], {
        queryParams: { quick: this.quickMealsOnly, maxReadyTime: this.quickMealsOnly ? 30 : null }
      });
    }, 300);
  }
  hoverMood(mood: string) {
    // Optional hover logic
  }

  unhoverMood() {
    // Reset hover logic
  }

  answerQuiz(value: string) {
    this.quizAnswers.push(value);
    if (this.quizStep === 1) {
      this.quizStep = 2;
      this.quizOptions = [
        { label: 'High Energy', value: 'excited' },
        { label: 'Low Energy', value: 'relaxed' },
        { label: 'Normal', value: 'happy' }
      ];
    } else {
      this.quizComplete = true;
      const suggestedMood = this.determineMood();
      this.selectedMood = suggestedMood;
      this.moods = this.moods.filter(m => m.name === suggestedMood); // Show only suggested mood
    }
  }

  determineMood(): string {
    const [q1, q2] = this.quizAnswers;
    if (q1 === 'happy' && q2 === 'happy') return 'happy';
    if (q1 === 'sad') return 'sad';
    if (q1 === 'hungry') return 'hungry';
    if (q1 === 'cozy') return 'cozy';
    if (q1 === 'excited' || q2 === 'excited') return 'excited';
    if (q1 === 'relaxed' || q2 === 'relaxed') return 'relaxed';
    return 'happy'; // Default
  }

  resetQuiz() {
    this.quizComplete = false;
    this.quizStep = 1;
    this.quizAnswers = [];
    this.selectedMood = null;
    this.moods = [
      { name: 'happy', icon: '😊', desc: 'Bright and cheerful dishes', quickDesc: 'Quick sunny bites', class: 'happy', previewImage: '', recipeTitle: '' },
      { name: 'sad', icon: '😢', desc: 'Comfort food to lift you up', quickDesc: 'Fast comfort snacks', class: 'sad', previewImage: '', recipeTitle: '' },
      { name: 'hungry', icon: '🍽️', desc: 'Hearty and filling meals', quickDesc: 'Speedy hearty eats', class: 'hungry', previewImage: '', recipeTitle: '' },
      { name: 'cozy', icon: '🛋️', desc: 'Warm and snug recipes', quickDesc: 'Quick cozy treats', class: 'cozy', previewImage: '', recipeTitle: '' },
      { name: 'excited', icon: '🎉', desc: 'Bold and fun flavors', quickDesc: 'Fast bold bites', class: 'excited', previewImage: '', recipeTitle: '' },
      { name: 'relaxed', icon: '🌿', desc: 'Calm and easy cooking', quickDesc: 'Easy calm dishes', class: 'relaxed', previewImage: '', recipeTitle: '' }
    ];
    this.fetchRecipePreviews();
  }
}
