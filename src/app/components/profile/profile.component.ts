import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { timeout, finalize, map } from 'rxjs/operators';
import { ProfileCommentsService } from 'src/app/services/profile-comments.service';
import { ProfileComment } from 'src/app/models/profile-comment';
import { NotificationService } from 'src/app/services/notification.service';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnChanges {

  constructor(
    public userService: UserService,
    private profileCommentsService: ProfileCommentsService,
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private swPush: SwPush
  ) { }

  @Input() user: User;
  @Input() myProfile: boolean;

  comments: ProfileComment[] = [];
  currentUser: User;

  editForm: FormGroup;
  displayEditForm = false;
  displayLoader = false;
  displayConfirm = false;
  displayErrors = false;
  serverError = false;

  ngOnInit() {
    this.buildEditForm();

    if (this.myProfile) {
      this.getComments();
    }
  }

  buildEditForm() {
    this.editForm = this.fb.group({
      introduction: [this.user.introduction, Validators.maxLength(100)],
      description: [this.user.description, Validators.maxLength(600)]
    });
  }

  toggleEditForm() {
    this.displayEditForm = !this.displayEditForm;
  }

  toggleConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  getComments() {
    this.displayLoader = true;

    this.profileCommentsService.getComments(this.user.nickname)
    .pipe(
      map((x: any) => x.comments),
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => this.comments = result,
      (error) => console.error(error),
      () => (x: ProfileComment, y: ProfileComment) => new Date(y.date).getTime() - new Date(x.date).getTime()
    );
  }

  submit() {
    this.displayErrors = false;
    this.serverError = false;

    if (this.editForm.invalid) {
      this.displayErrors = true;
      return;
    }

    this.displayLoader = true;

    const values = {
      introduction: this.editForm.value.introduction.trim(),
      description: this.editForm.value.description.replace(/\n(?=\n)/g, '').trim()
    };

    this.userService.editUserData(this.user._id, values)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (data) => {
        // Update local user data
        this.user.description = values.description;
        this.user.introduction = values.introduction;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.userService.updateUserValue();
      },
      (error) => this.serverError = true,
      () => this.toggleEditForm()
    );
  }

  addComment(content: string) {
    if ((content.length <= 1) || (content.length > 255)) {
      return;
    }

    this.displayLoader = true;

    const regexArray = content.match(/@(\S+)/g);
    if (regexArray) {
      const nickname = regexArray[0].slice(1);

      // Correct nickname length
      if ((nickname.length >= 3) && (nickname.length <= 15)) {
        // Check if user with the given nickname exists
        let userExists: boolean;

        this.userService.getList()
        .pipe(
          map((users: User[]) => users.filter((x) => x.nickname === nickname))
        )
        .subscribe(
          (result: User[]) => result.length === 1 ? userExists = true : userExists = false,
          (error) => console.error(error),
          () => {
            if (!userExists) {
              return;
            }

            // If exists, then send him/her notification (with information about current URL)
            const url = `/user/${this.user._id}`;
            this.notificationService.tagged(this.currentUser.nickname, nickname).subscribe();
          }
        );
      }
    }

    this.profileCommentsService.addComment(this.user.nickname, this.currentUser._id, content, this.currentUser.nickname)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => {
        this.getComments();

        const givenCommentsCount = this.currentUser.givenComments + 1;
        this.userService.editUserData(this.currentUser._id, { givenComments: givenCommentsCount })
        .pipe(
          timeout(10000)
        )
        .subscribe(
          (result) => null,
          (error) => console.error(error),
          () => {
            // Update local user data
            this.currentUser.givenComments = givenCommentsCount;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            this.userService.updateUserValue();

            // Send notification about new comment
            const url = `/user/${this.user._id}`;
          }
        );
      }
    );
  }


  deleteComment(commentId: string) {
    this.displayLoader = true;

    this.profileCommentsService.deleteComment(this.user.nickname, commentId)
    .pipe(
      timeout(10000),
      finalize(() => this.displayLoader = false)
      )
      .subscribe(
        (result) => null,
        (error) => console.error(error),
        () => {
          this.getComments();

          const givenCommentsCount = this.currentUser.givenComments - 1;
          this.userService.editUserData(this.currentUser._id, { givenComments: givenCommentsCount })
          .pipe(
            timeout(10000)
            )
            .subscribe(
              (result) => null,
              (error) => console.error(error),
              () => {
                // Update local user data
                this.currentUser.givenComments = givenCommentsCount;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                this.userService.updateUserValue();
              }
            );
          }
        );
    }

  deleteAccount() {
    this.displayLoader = true;
    this.serverError = false;

    this.userService.deleteUser(this.user._id)
    .pipe(
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => null,
      (error) => this.serverError = true,
      () => {
        localStorage.removeItem('user');
        this.userService.updateUserValue();
        this.router.navigate(['/all-users']);
      }
    );
  }

  enableNotif() {
    this.swPush.requestSubscription({
      serverPublicKey: this.notificationService.VAPID_PUBLIC_KEY
    })
    .then(sub => this.notificationService.addPushSubscriber(sub, this.currentUser.nickname)
    .subscribe(
      (result: any) => result.message ? console.log(result.message) : null,
      (error) => console.error(error)
    ))
    .catch(err => console.error('Could not subscribe to push notifications', err));
  }

  notifyToAllUsers(description: string) {
    this.notificationService.notifyToAllUsers(description)
    .subscribe(
      (result) => null,
      (error) => console.error(error)
    );
  }

  ngOnChanges(): void {
    this.currentUser = this.userService.currentUserValue();

    if (this.user._id === this.currentUser._id) {
      this.router.navigate(['/my-profile']);
    } else {
      this.getComments();
    }
  }
}
