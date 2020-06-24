import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../models/notification';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient
  ) {}

  readonly VAPID_PUBLIC_KEY = 'BNbQMdQycLAmbv7JKeP171m-7AFoVeW2cyJLgKz1wEgftslM62thZy62vbP_jQJ7sW8fr5G8oMjot2XMMYgrdMQ';

  basicUrl = 'https://users-community.herokuapp.com/api';

  private unreadedCountSource = new BehaviorSubject(0);
  unreadedCount = this.unreadedCountSource.asObservable();

  updateUnreadedCount(count: number) {
    this.unreadedCountSource.next(count);
  }

  // Web push notifications below

  addPushSubscriber(sub, nickname) {
    const subscription = {
      nickname,
      data: sub
    };

    return this.http.post(`${this.basicUrl}/notification/subscribe`, subscription);
  }

  notifyToAllUsers(description: string) {
    const notificationData = {
      description
    };
    return this.http.post(`${this.basicUrl}/notification/all`, notificationData);
  }

  tagged(nickname: string, targetNickname: string) {
    const notificationData = {
      whoTagged: nickname,
      targetNickname
    };
    return this.http.post(`${this.basicUrl}/notification/tagged`, notificationData);
  }

  newComment(whoPostedComment: string, targetNickname: string) {
    const notificationData = {
      whoPostedComment,
      targetNickname
    };
    return this.http.post(`${this.basicUrl}/notification/new-comment`, notificationData);
  }

  // In-app notifications below

  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.basicUrl}/notifications/user/${userId}`);
  }

  addNotification(
    userId: string,
    nickname: string,
    title: string,
    description: string,
    url: string,
    icon: string,
    informative: boolean
  ) {
    const notification = {
      userId,
      nickname,
      title,
      description,
      url,
      icon,
      unreaded: true,
      informative
    };
    return this.http.post(`${this.basicUrl}/notifications`, notification);
  }

  deleteNotification(notifId: string) {
    return this.http.delete(`${this.basicUrl}/notifications/${notifId}`);
  }

  readOneNotification(notifId: string) {
    return this.http.patch(`${this.basicUrl}/notifications/${notifId}`, { unreaded: false });
  }

  readAllNotifications(userId: string) {
    return this.http.patch(`${this.basicUrl}/notifications/user/${userId}`, { unreaded: false });
  }
}
