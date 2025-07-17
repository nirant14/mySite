import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  resetPassword(username: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { username, newPassword });
  }
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<{ token: string; isAdmin: boolean }> {
    return this.http.post<{ token: string; isAdmin: boolean }>(`${this.apiUrl}/login`, { username, password });
  }

  validateToken(token: string) {
    return this.http.post<{ valid: boolean; userId: string }>(`${this.apiUrl}/validate`, { token });
  }

  getAllUsers(): Observable<Array<{ username: string }>> {
    return this.http.get<Array<{ username: string }>>(`${this.apiUrl}/users`);
  }

  deleteUser(username: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${username}`);
  }

  changePassword(username: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { username, oldPassword, newPassword });
  }
}
