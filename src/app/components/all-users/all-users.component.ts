import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Subscription, TimeoutError } from 'rxjs';
import { finalize, timeout, filter, map } from 'rxjs/operators';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent implements OnInit, OnDestroy {

  constructor(private userService: UserService) { }

  subscriptions$: Subscription[] = [];

  currentUser: User;

  users: User[] = [];
  displayLoader = false;
  somethingWrong = false;

  currentSortOption: string;

  ngOnInit() {
    this.subscriptions$.push(this.getAllUsers());
    this.currentUser = this.userService.currentUserValue();
  }

  getAllUsers() {
    this.displayLoader = true;

    return this.userService.getList()
    .pipe(
      map((users: User[]) => users.filter((user: User) => !user.nickname.includes(this.currentUser.nickname))),
      timeout(10000),
      finalize(() => {
        this.displayLoader = false;

        if (this.users.length === 0) {
          this.somethingWrong = true;
        }
      })
    )
    .subscribe(
      (users) => this.users = users,
      (error) => {
        if (error instanceof TimeoutError) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      },
      () => {
        this.sortByRegistrationDate('DESC');
        this.currentSortOption = 'Registration date (DESC)';
      }
    );
  }

  sortByRegistrationDate(method: string) {
    if ((method !== 'ASC') && (method !== 'DESC')) {
      return;
    }

    if (method === 'ASC') {
      this.users.sort((a: User, b: User) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime());
      this.currentSortOption = 'Registration date (ASC)';
    }

    if (method === 'DESC') {
      this.users.sort((a: User, b: User) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
      this.currentSortOption = 'Registration date (DESC)';
    }
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
