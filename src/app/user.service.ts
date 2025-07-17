import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface UserState {
  username: string | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private userState = new BehaviorSubject<UserState>({ username: null, isAdmin: false, isLoggedIn: false });

  userState$ = this.userState.asObservable();

  setUser(state: UserState) {
    this.userState.next(state);
  }

  clearUser() {
    this.userState.next({ username: null, isAdmin: false, isLoggedIn: false });
  }

  restoreFromLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (token && username) {
        this.setUser({ username, isAdmin, isLoggedIn: true });
      } else {
        this.clearUser();
      }
    } else {
      this.clearUser();
    }
  }
}
