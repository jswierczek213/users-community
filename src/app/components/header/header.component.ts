import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { User } from 'src/app/models/user';
import { filter } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';

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
      }
    );

    this.notificationService.unreadedCount.subscribe(count => this.unreadedNotifications = count);
  }

  toggleLinks() {
    this.displayLinks = !this.displayLinks;
  }

}
