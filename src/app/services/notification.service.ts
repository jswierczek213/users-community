import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private http: HttpClient
  ) {}

  readonly VAPID_PUBLIC_KEY = 'BNbQMdQycLAmbv7JKeP171m-7AFoVeW2cyJLgKz1wEgftslM62thZy62vbP_jQJ7sW8fr5G8oMjot2XMMYgrdMQ';

  basicUrl = 'https://users-community.herokuapp.com/api';

  addPushSubscriber(sub, nickname) {
    const subscription = {
      nickname,
      sub
    };

    return this.http.post(`${this.basicUrl}/notification/subscribe`, subscription);
  }

  notifToAllUsers(description: string) {
    return this.http.post(`${this.basicUrl}/notification/all`, description);
  }

  tagged(nickname: string, targetNickname: string) {
    const notificationData = {
      whoTagged: nickname,
      targetNickname
    };
    return this.http.post(`${this.basicUrl}/notification/tagged`, notificationData);
  }
}
