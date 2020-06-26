import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { User } from 'src/app/models/user';
import { filter, map } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/models/notification';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    public userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  displayLinks = false;
  user: User;

  unreadedNotifications: number;

  ngOnInit() {
    this.router.events
    .pipe(
      filter(e => e instanceof NavigationEnd)
    )
    .subscribe(
      (data) => {
        this.user = this.userService.currentUserValue();
        this.notificationService.getNotifications(this.user._id)
        .pipe(
          map((notif: Notification[]) => notif.map(x => x.unreaded))
        )
        .subscribe(
          ((result: Array<any>) => {
            const onlyUnreadedArray = result.filter((x: boolean) => x === true);
            this.unreadedNotifications = onlyUnreadedArray.length;
          })
        );
      },
      (error) => console.error(error)
    );
  }

  toggleLinks() {
    this.displayLinks = !this.displayLinks;
  }

}
