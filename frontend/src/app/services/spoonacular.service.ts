// frontend/src/app/services/spoonacular.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpoonacularService {
  constructor(private http: HttpClient) {}

  getRecipesByMood(mood: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/spoonacular/recipes/complexSearch`, {
      params: { query: mood },
      withCredentials: true
    });
  }

  getRecipeDetails(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/spoonacular/recipes/${id}/information`, { withCredentials: true });
  }

  getRandomRecipe(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/spoonacular/recipes/random`, { withCredentials: true });
  }

  generateMealPlan(timeFrame: string, cuisine: string, diet: string, mealsPerDay: number, caloriesPerMeal: number = 600): Observable<any> {
    let params = new HttpParams().set('timeFrame', timeFrame);
    if (cuisine) params = params.set('cuisine', cuisine);
    if (diet) params = params.set('diet', diet);
    const targetCalories = mealsPerDay * caloriesPerMeal; // Use configurable caloriesPerMeal
    params = params.set('targetCalories', targetCalories.toString());
    const url = `${environment.apiUrl}/spoonacular/mealplanner/generate`;
    console.log('Generating meal plan with URL:', url, 'and params:', params.toString());
    return this.http.get(url, { params, withCredentials: true }).pipe(
      catchError((err) => {
        console.error('HTTP error in generateMealPlan:', err);
        return throwError(() => err);
      })
    );
  }
}
