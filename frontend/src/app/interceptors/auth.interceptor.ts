// src/app/interceptors/auth.interceptor.ts
import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Interceptor - URL:', req.url, 'withCredentials:', req.withCredentials);
    const authReq = req.clone({ withCredentials: true });
    return next.handle(authReq);
  }
}

// Functional interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Interceptor - URL:', req.url, 'withCredentials:', req.withCredentials);
  const authReq = req.clone({ withCredentials: true });
  return next(authReq);
};
