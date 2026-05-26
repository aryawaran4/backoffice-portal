import { Injectable, signal } from '@angular/core';

const CREDENTIALS = { username: 'admin', password: 'admin123' };
const SESSION_KEY = 'bp_logged_in';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(sessionStorage.getItem(SESSION_KEY) === 'true');

  get isLoggedIn() {
    return this._isLoggedIn();
  }

  login(username: string, password: string): boolean {
    const valid =
      username === CREDENTIALS.username && password === CREDENTIALS.password;
    if (valid) {
      this._isLoggedIn.set(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
    return valid;
  }

  logout(): void {
    this._isLoggedIn.set(false);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
