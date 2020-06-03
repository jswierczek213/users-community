import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
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

  ngOnInit() {
    // this.subscriptions$.push(this.getAllUsers());
  }

  getAllUsers() {
    return this.userService.getList()
    .subscribe(
      (data) => {
        console.log(data);
        this.users = data;
      },
      (error: HttpErrorResponse) => console.error(error)
    );
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
