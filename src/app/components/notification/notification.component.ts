import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/models/notification';
import { finalize, timeout } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(private notificationService: NotificationService, private userService: UserService) { }

  notifications: Notification[] = [];
  user: User;

  informative: number;
  unreaded: number;

  displayLoader = false;

  ngOnInit() {
    this.user = this.userService.currentUserValue();
    this.getNotifications();
  }

  getNotifications() {
    this.displayLoader = true;

    this.notificationService.getNotifications(this.user._id)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (notifications) => this.notifications = notifications,
      (error) => console.error(error),
      () => this.setDetails()
    );
  }

  setDetails() {
    const informativeNotifications = this.notifications.filter(notif => notif.informative === true);
    this.informative = informativeNotifications.length;

    const unreadedNotifications = this.notifications.filter(notif => notif.unreaded === true);
    this.unreaded = unreadedNotifications.length;
  }

  readOne(notifId: string, unreaded: boolean) {
    if (!unreaded) {
      return;
    }

    this.notificationService.readOneNotification(notifId)
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => {
        this.getNotifications();
      }
    );
  }

  readAll() {
    this.notificationService.readAllNotifications(this.user._id)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => this.getNotifications()
    );
  }

  delete(notifId: string) {
    this.displayLoader = true;

    this.notificationService.deleteNotification(notifId)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => this.getNotifications()
    );
  }

}
