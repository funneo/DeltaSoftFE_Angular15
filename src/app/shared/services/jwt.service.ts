import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() { }
  getToken(): string {
    const token = localStorage.getItem('TOKEN');
    if (token == null) {
      return '';
    }
    return token;
  }
  saveToken(token: string): void {
    localStorage.setItem('TOKEN', token);
  }

  destroyToken(): void {
    localStorage.removeItem('TOKEN');
  }
}
