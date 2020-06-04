import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  basicUrl = 'http://localhost:3500/api';

  // Get list of all registered users
  getList(): Observable<User[]> {
    return this.http.get<User[]>(`${this.basicUrl}/users`);
  }

  // Get data of specified user
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.basicUrl}/users/${id}`);
  }

  // Remove specified user
  deleteUser(id: string) {
    return this.http.delete(`${this.basicUrl}/users/${id}`);
  }

  // Register a new user
  register(nickname: string, password: string, introduction: string) {
    const data = { nickname, password, introduction };
    return this.http.post(`${this.basicUrl}/register`, data);
  }

  // Login an old user
  login(nickname: string, password: string) {
    const data = { nickname, password };
    return this.http.post(`${this.basicUrl}/login`, data);
  }

  loggedIn() {
    if (localStorage.getItem('loggedIn') === 'true') {
      return true;
    } else {
      return false;
    }
  }
}
