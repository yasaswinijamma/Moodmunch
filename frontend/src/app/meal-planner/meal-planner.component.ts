// frontend/src/app/meal-planner/meal-planner.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { SpoonacularService } from '../services/spoonacular.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const SPOONACULAR_IMAGE_URL = 'https://spoonacular.com/recipeImages/';
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/120x90.png?text=No+Image';

interface Meal {
  recipeId: string;
  title: string;
  image: string;
  readyInMinutes: number;
}

interface MealPlan {
  [day: string]: Meal[];
}

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meal-planner.component.html',
  styleUrls: ['./meal-planner.component.css']
})
export class MealPlannerComponent {
  days: string[] = [];
  mealPlan: MealPlan | null = null;
  preferences = {
    cuisine: '',
    dietary: '',
    mealsPerDay: 1,
    caloriesPerMeal: 600
  };

  constructor(
    private http: HttpClient,
    private spoonacularService: SpoonacularService,
    private router: Router
  ) {}

  generateMealPlan() {
    this.mealPlan = null;
    console.log('Generating meal plan with preferences:', this.preferences);
    this.spoonacularService.generateMealPlan(
      'week',
      this.preferences.cuisine,
      this.preferences.dietary,
      this.preferences.mealsPerDay,
      this.preferences.caloriesPerMeal
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error generating meal plan (pipe):', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (data) => {
        console.log('Meal plan response:', data);
        this.mealPlan = this.transformSpoonacularResponse(data);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error generating meal plan (subscribe):', err);
        const errorMessage = err.error?.error || err.message || 'Unknown error. Please try again later.';
        alert('Failed to generate meal plan: ' + errorMessage);
      }
    });
  }

  transformSpoonacularResponse(data: any): MealPlan {
    const mealPlan: MealPlan = {};
    const daysMapping: { [key: string]: string } = {
      'Monday': 'monday',
      'Tuesday': 'tuesday',
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday',
      'Sunday': 'sunday'
    };

    if (data.week) {
      Object.keys(data.week).forEach(day => {
        const normalizedDay = daysMapping[day.charAt(0).toUpperCase() + day.slice(1)] || day.toLowerCase();
        let meals = data.week[day].meals || [];

        if (meals.length > this.preferences.mealsPerDay) {
          meals = meals.slice(0, this.preferences.mealsPerDay);
          console.log(`Filtered meals for ${normalizedDay} to ${this.preferences.mealsPerDay}:`, meals);
        }

        mealPlan[normalizedDay] = meals.map((meal: any) => {
          let imageUrl = meal.image;
          if (!imageUrl && meal.id) {
            imageUrl = `${SPOONACULAR_IMAGE_URL}${meal.id}-240x150.jpg`;
          } else if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://spoonacular.com/recipeImages/${imageUrl}`;
          }
          if (!imageUrl) {
            console.warn(`No image URL for meal: ${meal.title} (ID: ${meal.id})`);
            imageUrl = PLACEHOLDER_IMAGE_URL;
          }
          return {
            recipeId: meal.id.toString(),
            title: meal.title,
            image: imageUrl,
            readyInMinutes: meal.readyInMinutes || 0
          };
        });
      });
    }

    this.days = Object.keys(mealPlan).sort((a, b) => {
      const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return order.indexOf(a) - order.indexOf(b);
    });

    return mealPlan;
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = PLACEHOLDER_IMAGE_URL;
    console.warn(`Failed to load image: ${imgElement.src}, using placeholder instead`);
  }

  debugRedirect(recipeId: string) {
    console.log('Redirecting to recipe details with ID:', recipeId);
  }

  saveMealPlan() {
    if (!this.mealPlan) {
      alert('No meal plan to save.');
      return;
    }

    // Transform mealPlan into the format expected by the backend
    const mealPlanEntity = {
      username: '', // Will be set by the backend
      meals: Object.keys(this.mealPlan).reduce((acc, day) => {
        acc[day] = JSON.stringify(this.mealPlan![day]);
        return acc;
      }, {} as { [key: string]: string })
    };

    console.log('Sending meal plan to backend:', JSON.stringify(mealPlanEntity, null, 2));

    this.http.post(`${environment.apiUrl}/meal-planner`, mealPlanEntity, { withCredentials: true }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error saving meal plan:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => {
        console.log('Meal plan saved successfully:', response);
        alert('Meal plan saved successfully!');
        this.router.navigate(['/profile']); // Redirect to profile page
      },
      error: (err) => {
        console.error('Error saving meal plan:', err);
        alert('Failed to save meal plan: ' + (err.error?.message || 'Please try again later.'));
      }
    });
  }
}
