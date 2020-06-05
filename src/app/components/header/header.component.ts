import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { User } from 'src/app/models/user';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    public userService: UserService,
    private router: Router
  ) { }

  displayLinks = false;
  user: User;

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
  }

  toggleLinks() {
    this.displayLinks = !this.displayLinks;
  }

}
