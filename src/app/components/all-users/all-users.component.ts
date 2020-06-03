import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Subscription, TimeoutError } from 'rxjs';
import { finalize, timeout } from 'rxjs/operators';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent implements OnInit, OnDestroy {

  constructor(private userService: UserService) { }

  subscriptions$: Subscription[] = [];

  users: User[] = [];
  displayLoader = false;
  somethingWrong = false;

  ngOnInit() {
    this.subscriptions$.push(this.getAllUsers());
  }

  getAllUsers() {
    this.displayLoader = true;

    return this.userService.getList()
    .pipe(
      timeout(4000),
      finalize(() => {
        this.displayLoader = false;

        if (this.users.length === 0) {
          this.somethingWrong = true;
        }
      })
    )
    .subscribe(
      (data) => this.users = data,
      (error) => {
        if (error instanceof TimeoutError) {
          console.error(error.message);
        } else {
          console.error(error);
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
