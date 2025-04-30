import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<string | null>(null);
  private userRole = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    console.log('Constructor - Stored user from localStorage:', storedUser); // Debug log
    if (storedUser) {
      this.validateSession(storedUser).subscribe({
        next: () => {
          console.log('Session validated successfully for user:', storedUser); // Debug log
          this.loggedIn.next(true);
          this.userSubject.next(storedUser);
          this.fetchUserRole(storedUser);
        },
        error: (err) => {
          console.error('Session validation failed:', err);
          this.loggedIn.next(false);
          this.userSubject.next(null);
          this.userRole.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        }
      });
    }
  }

  private validateSession(username: string): Observable<any> {
    console.log('Validating session for username:', username); // Debug log
    return this.http.get(`${environment.apiUrl}/check-session`, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  private fetchUserRole(username: string): void {
    console.log('Fetching user role for username:', username); // Debug log
    this.http.get(`${environment.apiUrl}/users/profile`, { withCredentials: true })
      .subscribe({
        next: (profile: any) => {
          console.log('Full profile response:', profile); // Debug log
          const role = profile.role || 'USER';
          console.log('Fetched user role:', role); // Debug log
          this.userRole.next(role);
          console.log('userRole BehaviorSubject updated to:', role); // Debug log
        },
        error: (err) => {
          console.error('Error fetching user role:', err); // Debug log
          this.userRole.next('USER');
          console.log('userRole BehaviorSubject defaulted to: USER due to error'); // Debug log
        }
      });
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getCurrentUser(): Observable<string | null> {
    return this.userSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get currentUser(): string | null {
    return this.userSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    const url = `${environment.apiUrl}/login`;
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
        if (response.body === 'Login successful') {
          console.log('Login successful for user:', username); // Debug log
          this.loggedIn.next(true);
          this.userSubject.next(username);
          localStorage.setItem('currentUser', username);
          this.fetchUserRole(username);
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
    this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          console.log('Logout successful'); // Debug log
          this.loggedIn.next(false);
          this.userSubject.next(null);
          this.userRole.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout failed:', err);
          this.loggedIn.next(false);
          this.userSubject.next(null);
          this.userRole.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        }
      });
  }

  isAdmin(): Observable<boolean> {
    return this.userRole.asObservable().pipe(
      map(role => {
        const normalizedRole = role ? role.toUpperCase() : 'USER';
        const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
        console.log('isAdmin check:', isAdmin, 'with role:', role); // Debug log
        return isAdmin;
      })
    );
  }

  checkSession(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/check-session`, { withCredentials: true });
  }
}
