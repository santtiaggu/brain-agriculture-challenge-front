import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrlLogin = 'http://localhost:7001/api/login';
  private baseUrlRefresh = 'http://localhost:7001/api/refresh';
  private _access_token = signal<string | null>(null);
  private _refresh_token: string | null = null;
  private _expiresAt: number | null = null;
  private _user = signal<any | null>(null);
  private refreshSub?: Subscription;

  access_token = this._access_token.asReadonly();
  user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    const savedAccessToken = localStorage.getItem('access_token');
    const savedRefreshToken = localStorage.getItem('refresh_token');
    const savedExpiresAt = localStorage.getItem('expires_at');
    const savedUser = localStorage.getItem('user');

    if (savedAccessToken) this._access_token.set(savedAccessToken);
    if (savedRefreshToken) this._refresh_token = savedRefreshToken;
    if (savedExpiresAt) this._expiresAt = Number(savedExpiresAt);
    if (savedUser) this._user.set(JSON.parse(savedUser))

    if (this._access_token()) {
        this.startRefreshTimer();
    }
  }

  login(data: { email: string, password: string}): Observable<any> {
    return this.http.post<LoginResponse>(this.baseUrlLogin, data).pipe(
        tap((res) => {
            this._access_token.set(res.access_token);
            this._refresh_token = res.refresh_token;
            this._user.set(res.user);

            // define expiração fixa = 30 min
            // const FIXED_EXPIRATION = 30 * 60 * 1000;
            const FIXED_EXPIRATION = 2 * 60 * 1000;
            this._expiresAt = Date.now() + FIXED_EXPIRATION;

            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('refresh_token', res.refresh_token);
            localStorage.setItem('expires_at', String(this._expiresAt));
            localStorage.setItem('user', JSON.stringify(res.user));

            this.startRefreshTimer();
        })
    )
  }

  private startRefreshTimer() {
    // Cancelar o anterior
    if (this.refreshSub) this.refreshSub.unsubscribe(); 

    if (this._expiresAt) {
        const now = Date.now();
        // 5 min antes do token expirar
        // const refreshIn = this._expiresAt - now - (5 * 60 * 1000)
        const refreshIn = this._expiresAt - now - (30 * 1000);

        if (refreshIn > 0) {
            this.refreshSub = timer(refreshIn).subscribe(() => {
                this.refreshToken();
            });
        } else {
            // se já está quase vencendo, tenta renovar agora
            this.refreshToken();
        }
    }
  }

  refreshToken() {
    if (!this._refresh_token) return;

    this.http.post<any>(this.baseUrlRefresh, { refresh_token: this._refresh_token}).subscribe({
      next: (res) => {
        this._access_token.set(res.access_token);
        this._refresh_token = res.refresh_token;

        // reinicia expiração fixa de 30 min
        // const FIXED_EXPIRATION = 30 * 60 * 1000;
        const FIXED_EXPIRATION = 2 * 60 * 1000;
        this._expiresAt = Date.now() + FIXED_EXPIRATION;

        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        localStorage.setItem('expires_at', String(this._expiresAt));
      },
      error: () => {
        this.logout(); // se o refresh falhar, desloga
      }
    });
  }

  logout() {
    this._access_token.set(null);
    this._refresh_token = null;
    this._user.set(null);
    localStorage.clear();
    if (this.refreshSub) this.refreshSub.unsubscribe();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this._access_token();
  }
}
