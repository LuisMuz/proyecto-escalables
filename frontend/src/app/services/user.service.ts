import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  getUserId(): string | null {
    const userId = localStorage.getItem('userId');
    return userId ? userId : null;
  }

  getName(): string | null {
    const userData = this.getUserData();
    return userData ? userData.name : null;
  }

  getUserName(): string | null {
    const userData = this.getUserData();
    return userData ? userData.user_name : null;
  }

  getEmail(): string | null {
    const userData = this.getUserData();
    return userData ? userData.email : null;
  }

  getUserBirth(): string | null {
    const userData = this.getUserData();
    return userData ? userData.user_birth : null;
  }

  getUserToken(): string | null {
    const userData = this.getUserData();
    return userData ? userData.idToken : null;
  }
}
