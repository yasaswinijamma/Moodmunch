import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { MoodPickerComponent } from './mood-picker/mood-picker.component';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { MealPlannerComponent } from './meal-planner/meal-planner.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { LocalFlavorFinderComponent } from './local-flavor-finder/local-flavor-finder.component';
import { ProfileComponent } from './profile/profile.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { RandomMealSpinComponent } from './random-meal-spin/random-meal-spin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {ContactComponent} from './contact/contact.component';
import {PrivacyComponent} from './privacy/privacy.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'mood-picker', component: MoodPickerComponent },
  { path: 'recipe-list', component: RecipeListComponent },
  { path: 'recipe-list/:mood', component: RecipeListComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'meal-planner', component: MealPlannerComponent },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: 'local-flavor', component: LocalFlavorFinderComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'random-spin', component: RandomMealSpinComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }

];
