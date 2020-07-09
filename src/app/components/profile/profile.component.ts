import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { timeout, finalize, map, delay } from 'rxjs/operators';
import { ProfileCommentsService } from 'src/app/services/profile-comments.service';
import { ProfileComment } from 'src/app/models/profile-comment';
import { NotificationService } from 'src/app/services/notification.service';
import { SwPush } from '@angular/service-worker';
import { forkJoin } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';

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

  croppedImage: any = '';
  imageFile: File;

  editForm: FormGroup;
  displayEditForm = false;
  displayLoader = false;
  displayConfirm = false;
  displayErrors = false;
  serverError = false;

  imageSelected = false;
  displayFileInput = false;
  deleteImage = false;

  ngOnInit() {
    this.buildEditForm();

    if (this.myProfile) {
      this.getComments();
    }
  }

  buildEditForm() {
    this.editForm = this.fb.group({
      image: [],
      introduction: [this.user.introduction, [ Validators.maxLength(100) ]],
      description: [this.user.description, [ Validators.maxLength(1000) ]]
    });
  }

  toggleEditForm() {
    if (this.displayEditForm) {
      this.resetEditForm();
    }
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
      timeout(15000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (result) => this.comments = result,
      (error) => console.error(error),
      () => (x: ProfileComment, y: ProfileComment) => new Date(y.date).getTime() - new Date(x.date).getTime()
    );
  }

  setOption(num: number) {
    if (num === 1) {
      this.displayFileInput = false;
      this.deleteImage = false;
      this.resetEditForm();
    }

    if (num === 2) {
      this.displayFileInput = true;
      this.deleteImage = false;
    }

    if (num === 3) {
      this.deleteImage = true;
      this.displayFileInput = false;
      this.resetEditForm();
    }
  }

  changeImageFile(event: any) {
    this.imageFile = event.target.files[0];
    this.imageSelected = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  resetEditForm() {
    this.croppedImage = '';
    this.imageFile = undefined;
    this.imageSelected = false;
    this.editForm.value.image = null;
    this.editForm.controls.image.reset();
  }

  resizeImage(base64: string) {
    const img = document.createElement('img');
    img.src = base64;

    const canvas = document.createElement('canvas');

    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const maxWidth = 100;
    const maxHeight = 100;

    let width = img.width;
    let height = img.height;

    if ((width > maxWidth) || (height > maxHeight)) {
      width = maxWidth;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL();
  }

  base64ToBlob(base64: string) {
    const parts = base64.split(';base64,');
    const imageType = parts[0].split(':')[1];
    const decodedData = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(decodedData.length);

    for (let i = 0; i < decodedData.length; i++) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: imageType });
  }

  submit() {
    this.displayErrors = false;
    this.serverError = false;

    let imageBlob: Blob;

    if (this.imageSelected) {
      const resizedImage = this.resizeImage(this.croppedImage);
      imageBlob = this.base64ToBlob(resizedImage);
    }

    if (!this.imageSelected && this.user.image !== 'null') {
      imageBlob = this.base64ToBlob(this.user.image);
    }

    if (this.editForm.invalid) {
      this.displayErrors = true;
      return;
    }

    this.displayLoader = true;

    const formData = new FormData();
    if (!this.imageSelected && this.user.image === 'null') {
      formData.append('image', this.user.image);
    } else if (this.deleteImage) {
      formData.append('image', 'null');
    } else {
      formData.append('image', imageBlob, `${this.user.nickname}.png`);
    }
    formData.append('introduction', this.editForm.value.introduction.trim());
    formData.append('description', this.editForm.value.description.replace(/\n(?=\n)/g, '').trim());

    const values = {
      introduction: formData.get('introduction').toString(),
      description: formData.get('description').toString()
    };

    this.userService.editUserData(this.user._id, formData)
    .pipe(
      timeout(20000),
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (data) => {
        // Update local user data
        if (this.deleteImage) {
          this.user.image = 'null';
          this.user.description = values.description;
          this.user.introduction = values.introduction;
          localStorage.setItem('user', JSON.stringify(this.user));
          this.userService.updateUserValue();
        } else if ((this.imageSelected) || (!this.imageSelected && this.user.image !== 'null')) {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(imageBlob);
          fileReader.onloadend = () => {
            this.user.image = fileReader.result.toString();
            this.user.description = values.description;
            this.user.introduction = values.introduction;
            localStorage.setItem('user', JSON.stringify(this.user));
            this.userService.updateUserValue();
          };
        } else {
          this.user.image = 'null';
          this.user.description = values.description;
          this.user.introduction = values.introduction;
          localStorage.setItem('user', JSON.stringify(this.user));
          this.userService.updateUserValue();
        }
      },
      (error) => this.serverError = true,
      () => {
        this.toggleEditForm();
        this.resetEditForm();
        this.deleteImage = false;
        this.displayFileInput = false;
      }
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
        let taggedUser: User;

        this.userService.getList()
        .pipe(
          map((users: User[]) => users.filter((x) => x.nickname === nickname))
        )
        .subscribe(
          (result: User[]) => {
            if (result.length === 1 && (result[0]._id !== this.currentUser._id)) {
              userExists = true;
              taggedUser = result[0];
            } else {
              userExists = false;
            }
          },
          (error) => console.error(error),
          () => {
            if (!userExists) {
              return;
            }

            // If exists, then send him/her notification (with information about current URL)
            const url = `/user/${this.user._id}`;

            this.notificationService.addNotification(
              taggedUser._id,
              taggedUser.nickname,
              `${this.currentUser.nickname} tagged you in the comment`,
              'Click here to see details',
              url,
              'account_box',
              false
            ).subscribe(
              (result) => null,
              (error) => console.error(error),
              () => this.notificationService.tagged(this.currentUser.nickname, nickname).subscribe()
            );
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
          timeout(20000)
        )
        .subscribe(
          (result) => null,
          (error) => console.error(error),
          () => {
            // Update local user data
            this.currentUser.givenComments = givenCommentsCount;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            this.userService.updateUserValue();

            if (this.user._id !== this.currentUser._id) {
              // Send notification about new comment
              const url = `/user/${this.user._id}`;

              this.notificationService.addNotification(
                this.user._id,
                this.currentUser.nickname,
                'New comment on your profile',
                `${this.currentUser.nickname} posted a comment!`,
                url,
                'account_box',
                false
              ).subscribe(
                (result) => null,
                (error) => console.error(error),
                () => this.notificationService.newProfileComment(this.currentUser.nickname, this.user.nickname).subscribe()
              );
            }
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

    const observables = forkJoin(
      this.notificationService.deleteNotificationSubscriptions(this.user._id),
      this.notificationService.deleteWebpushSubscriptions(this.user.nickname),
      this.userService.deleteUser(this.user._id, this.user.nickname)
    );

    observables.pipe(
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
      (result: any) => {
        if (!result.message) {
          const url = '/notifications';
          this.notificationService.addNotification(
            this.user._id,
            this.user.nickname,
            'Notifications enabled',
            'You successfully unabled web-push notifications on this device!',
            url,
            'info',
            true
          ).subscribe(
            (x) => null,
            (error) => console.error(error),
            () => {
              const title = 'Notifications enabled';
              const description = 'You successfully unabled web-push notifications on this device!';
              this.notificationService.sendInformativeNotification(this.user.nickname, title, description).subscribe();
            }
          );
        } else {
          return;
        }
      },
      (error) => console.error(error)
    ))
    .catch(err => console.error('Could not subscribe to push notifications', err));
  }

  notifyToAllUsers(description: string) {
    let allUsers: User[];
    let allUsersId: Array<string>;

    let errorOccured = false;

    this.userService.getList().subscribe(
      (result) => allUsers = result,
      (error) => console.error(error),
      () => {
        allUsersId = allUsers.map((x: User) => x._id);
        allUsersId.forEach(id => {
          this.notificationService.addNotification(
            id,
            'Admin',
            'Users-community website contains new features!',
            description,
            '/notifications',
            'info',
            true
          )
          .pipe(
            timeout(10000)
          )
          .subscribe(
            (result) => null,
            (error) => { console.error(error); errorOccured = true; }
          );
        });

        setTimeout(() => {
          !errorOccured ? this.notificationService.notifyToAllUsers(description).subscribe() : console.log('Error');
        }, 15000);

      }
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
