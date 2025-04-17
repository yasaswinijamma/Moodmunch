// frontend/src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    console.log('AuthService constructor called');
    const storedUser = localStorage.getItem('currentUser');
    console.log('Stored user from localStorage:', storedUser);
    if (storedUser) {
      this.validateSession(storedUser).subscribe({
        next: () => {
          console.log('Session validation successful');
          this.loggedIn.next(true);
          this.userSubject.next(storedUser);
          console.log('Restored user from localStorage:', storedUser);
        },
        error: (err) => {
          console.error('Session validation failed:', err);
          this.loggedIn.next(false);
          this.userSubject.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        }
      });
    } else {
      console.log('No stored user found in localStorage');
    }
  }

  private validateSession(username: string): Observable<any> {
    console.log('Validating session for user:', username);
    return this.http.get(`${environment.apiUrl}/check-session`, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getCurrentUser(): Observable<string | null> {
    return this.userSubject.asObservable();
  }

  isLoggedIn(): boolean {
    const loggedIn = this.loggedIn.value;
    console.log('isLoggedIn:', loggedIn);
    return loggedIn;
  }

  get currentUser(): string | null {
    const user = this.userSubject.value;
    console.log('Getting current user:', user);
    return user;
  }

  login(username: string, password: string): Observable<any> {
    console.log('Attempting login for:', username);
    const url = `${environment.apiUrl}/login`;
    console.log('Login URL:', url);
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    return this.http.post(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
      withCredentials: true,
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('Login response:', response.body);
        console.log('Set-Cookie header:', response.headers.get('Set-Cookie'));
        if (response.body === 'Login successful') {
          this.loggedIn.next(true);
          this.userSubject.next(username);
          localStorage.setItem('currentUser', username);
          console.log('Logged in status:', this.loggedIn.value, 'Current user:', this.currentUser);
          this.router.navigate(['/home']);
        } else {
          throw new Error(response.body);
        }
      }),
      catchError(err => {
        console.error('Login error:', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    console.log('Logging out');
    this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loggedIn.next(false);
          this.userSubject.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
          console.log('Logout successful');
        },
        error: (err) => {
          console.error('Logout failed:', err);
          this.loggedIn.next(false);
          this.userSubject.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
          console.log('Logout completed despite error');
        }
      });
  }

  isAdmin(): boolean {
    const isAdmin = this.currentUser === 'admin';
    console.log('isAdmin:', isAdmin);
    return isAdmin;
  }

  checkSession(): Observable<any> {
    console.log('Checking session');
    return this.http.get(`${environment.apiUrl}/check-session`, { withCredentials: true });
  }
}
