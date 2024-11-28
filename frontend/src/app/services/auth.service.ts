import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  signup(email: string,
    password: string,
    name: string,
    user_name: string,
    user_birth: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { email, password, name, user_name, user_birth });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if(!response.idToken) {
          throw new Error('Invalid credentials');
        }
        localStorage.setItem('idToken', response.idToken);
        localStorage.setItem('userData', JSON.stringify(response.userData));
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('userRole', response.userData.role);
        console.log("Login successful");
      })
    );
  }

  checkUsername(user_name: string): Promise<any> {
    return this.http.post(`${this.apiUrl}/check-username`, { user_name }).toPromise();
  }

  logout() {
    localStorage.removeItem('idToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('idToken');
  }

  getUserRole(): string | null {
    console.log(localStorage.getItem('userRole'));
    return localStorage.getItem('userRole');
  }
}
