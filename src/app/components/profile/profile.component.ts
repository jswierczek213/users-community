import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { timeout, finalize, map } from 'rxjs/operators';
import { ProfileCommentsService } from 'src/app/services/profile-comments.service';
import { ProfileComment } from 'src/app/models/profile-comment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    public userService: UserService,
    private profileCommentsService: ProfileCommentsService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  @Input() myProfile: boolean;
  @Input() user: User;

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

    this.displayLoader = true;

    this.getComments();

    this.currentUser = this.userService.currentUserValue();
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
    this.profileCommentsService.getComments(this.user.nickname)
    .pipe(
      map((x: any) => x.comments),
      timeout(10000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => this.comments = result,
      (error) => console.error(error)
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
}
