import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // REST API server
  basicUrl = 'https://users-community.herokuapp.com/api';

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  // Get list of all registered users
  getList(): Observable<User[]> {
    return this.http.get<User[]>(`${this.basicUrl}/users`)
    .pipe(
      map((users: User[]) => {
        return users.map((user: any) => {
          const image = (user.image !== 'null') ? 'data:image/png;base64,' + user.image.buffer.toString('base64') : 'null';
          return ({ ...user, image });
        });
      })
    );
  }

  // Get data of specified user
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.basicUrl}/users/${id}`)
    .pipe(
      map((user: any) => {
        const image = (user.image !== 'null') ? 'data:image/png;base64,' + user.image.buffer.toString('base64') : 'null';
        return ({ ...user, image });
      })
    );
  }

  // Patch user data
  editUserData(id: string, value: any) {
    return this.http.patch(`${this.basicUrl}/users/${id}`, value);
  }

  // Remove specified user
  deleteUser(id: string, nickname: string) {
    return this.http.delete(`${this.basicUrl}/users/${id}/${nickname}`);
  }

  // Register a new user
  register(nickname: string, password: string, introduction: string) {
    const data = { nickname, password, introduction };
    return this.http.post(`${this.basicUrl}/register`, data);
  }

  // Login an old user
  login(nickname: string, password: string) {
    const data = { nickname, password };
    return this.http.post(`${this.basicUrl}/login`, data)
    .pipe(
      map((user: any) => {
        const image = (user.image !== 'null') ? 'data:image/png;base64,' + user.image.buffer.toString('base64') : 'null';
        return ({ ...user, image });
      })
    );
  }

  // Logout current user
  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/posts']);
  }

  public currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public updateUserValue() {
    this.currentUserSubject.next(JSON.parse(localStorage.getItem('user')));
  }
}
