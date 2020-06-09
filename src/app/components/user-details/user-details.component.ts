import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Subscription, TimeoutError } from 'rxjs';
import { timeout, finalize } from 'rxjs/operators';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  subscriptions$: Subscription[] = [];

  user: User;
  displayLoader = false;
  somethingWrong = false;

  ngOnInit() {
    const userId = this.route.snapshot.params.id;
    this.subscriptions$.push(this.getUserData(userId));
  }

  getUserData(id: string) {
    this.displayLoader = true;
    return this.userService.getUserById(id)
    .pipe(
      timeout(10000),
      finalize(() => {
        this.displayLoader = false;

        if (!this.user) {
          this.somethingWrong = true;
        }
      })
    )
    .subscribe(
      (data) => this.user = data,
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
