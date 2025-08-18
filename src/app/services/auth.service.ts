import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  access_token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:7001/api/login';
  private _token = signal<string | null>(null);
  private _user = signal<any | null>(null);

  token = this._token.asReadonly();
  user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (savedToken) this._token.set(savedToken);
    if (savedUser) this._user.set(JSON.parse(savedUser))
  }

  login(data: { email: string, password: string}): Observable<any> {
    return this.http.post<LoginResponse>(this.baseUrl, data).pipe(
        tap((res) => {
            this._token.set(res.access_token);
            this._user.set(res.user);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.user));
        })
    )
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this._token();
  }
}
