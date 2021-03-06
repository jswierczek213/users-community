import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { finalize, timeout, map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private postService: PostService,
    private userService: UserService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) { }

  subscriptions$: Subscription[] = [];

  user: User;

  posts: Post[] = [];
  commentContainers = [];

  postForm: FormGroup;

  displayLoader = false;
  displayErrors = false;

  isClicked = false;

  ngOnInit() {
    this.loadPosts();

    this.user = this.userService.currentUserValue();

    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(600)]]
    });

    if (this.user) {
      this.subscriptions$.push(this.userService.getUserById(this.user._id)
      .pipe(
        timeout(10000)
      )
      .subscribe(
        (result: any) => this.user = result,
        (error) => console.error(error),
        () => {
          localStorage.setItem('user', JSON.stringify(this.user));
          this.userService.updateUserValue();
        }
      ));
    }
  }

  loadPosts() {
    this.displayLoader = true;

    this.subscriptions$.push(this.postService.getPosts()
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (posts) => this.posts = posts,
      (error) => console.error(error),
      () => {
        this.posts
        .sort((x: Post, y: Post) => new Date(y.date).getTime() - new Date(x.date).getTime());
        this.generateIndexBooleans();
      }
    ));
  }

  loadLikes(postId: string, postIndex: number) {
    this.subscriptions$.push(this.postService.getLikes(postId)
    .pipe(
      map((data: any) => data[0].likes),
      timeout(10000)
    )
    .subscribe(likes => this.posts[postIndex].likes = likes));
  }

  loadComments(postId: string, postIndex: number) {
    this.subscriptions$.push(this.postService.getComments(postId)
    .pipe(
      map((data: any) => data[0].comments),
      timeout(10000)
    )
    .subscribe(comments => this.posts[postIndex].comments = comments));
  }

  generateIndexBooleans() {
    this.posts.forEach(x => {
        const data = { display: false };
        this.commentContainers.push(data);
    });
  }

  toggleComments(i: number) {
    this.commentContainers[i].display = !this.commentContainers[i].display;
  }

  addPost() {
    this.displayErrors = false;

    if (this.postForm.invalid) {
      this.displayErrors = true;
      return;
    }

    const title = this.postForm.value.title;
    const content = this.postForm.value.content;

    this.displayLoader = true;

    this.subscriptions$.push(this.postService.createPost(this.user._id, this.user.nickname, title, content)
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => {
        this.loadPosts();
        this.postForm.reset();
        this.displayNotify('Post has been created');
      }
    ));
  }

  toggleLike(postId, postIndex, postUserId, postNickname) {
    if (!this.user) {
      return this.displayNotify('You need to log in!');
    }

    if (this.posts[postIndex].likes
      .find((like: any) => like.nickname === this.user.nickname)) {

      if (this.isClicked) {
        return;
      }

      this.isClicked = true;

      this.subscriptions$.push(this.postService.unlike(postId, this.user.nickname)
      .pipe(
        timeout(10000)
      )
      .subscribe(
        (result) => null,
        (error) => console.error(error),
        () => {
          this.loadLikes(postId, postIndex);

          this.isClicked = false;

          const givenLikesCount = this.user.givenLikes - 1;
          this.userService.editUserData(this.user._id, { givenLikes: givenLikesCount })
          .pipe(
            timeout(10000)
          )
          .subscribe(
            (result) => null,
            (error) => console.error(error),
            () => {
              // Update local user data
              this.user.givenLikes = givenLikesCount;
              localStorage.setItem('user', JSON.stringify(this.user));
              this.userService.updateUserValue();
            }
          );
        }
      ));
    } else {

      if (this.isClicked) {
        return;
      }

      this.isClicked = true;

      this.subscriptions$.push(this.postService.like(postId, this.user._id, this.user.nickname)
      .pipe(
        timeout(10000)
      )
      .subscribe(
        (result) => null,
        (error) => console.error(error),
        () => {
          this.loadLikes(postId, postIndex);

          this.notificationService.addNotification(
            postUserId,
            postNickname,
            `${this.user.nickname} liked your post`,
            'Click to see details',
            '/posts',
            'account_box',
            false
          ).subscribe();

          const givenLikesCount = this.user.givenLikes + 1;
          this.subscriptions$.push(this.userService.editUserData(this.user._id, { givenLikes: givenLikesCount })
          .pipe(
            timeout(10000)
          )
          .subscribe(
            (result) => null,
            (error) => console.error(error),
            () => {
              this.isClicked = false;
              // Update local user data
              this.user.givenLikes = givenLikesCount;
              localStorage.setItem('user', JSON.stringify(this.user));
              this.userService.updateUserValue();
            }
          ));
        }
      ));
    }
  }

  isLiked(index: number) {
    if (!this.user) {
      return;
    }

    if (this.posts[index].likes.find((x: any) => x.nickname === this.user.nickname)) {
      return true;
    } else {
      return false;
    }
  }

  addComment(postId, userId, content, nickname, index, postUserId, postUserNickname) {

    if ((content.length <= 1) || (content.length > 255)) {
      return;
    }

    const regexArray = content.match(/@(\S+)/g);
    if (regexArray) {
      const taggedNickname = regexArray[0].slice(1);

      // Correct nickname length
      if ((taggedNickname.length >= 3) && (taggedNickname.length <= 15)) {
        // Check if user with the given nickname exists
        let userExists: boolean;
        let taggedUser: User;

        this.userService.getList()
        .pipe(
          map((users: User[]) => users.filter((x) => x.nickname === taggedNickname))
        )
        .subscribe(
          (result: User[]) => {
            if (result.length === 1 && (result[0]._id !== postUserId)) {
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
            const url = `/posts`;

            this.notificationService.addNotification(
              taggedUser._id,
              taggedUser.nickname,
              `${this.user.nickname} tagged you in the comment`,
              'Click here to see details',
              url,
              'account_box',
              false
            ).subscribe(
              (result) => null,
              (error) => console.error(error),
              () => this.notificationService.tagged(this.user.nickname, taggedNickname).subscribe()
            );
          }
        );
      }
    }

    this.displayLoader = true;

    this.subscriptions$.push(this.postService.addComment(postId, userId, content, nickname)
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (data) => null,
      (error) => console.error(error),
      () => {
        this.loadComments(postId, index);
        this.displayNotify('Comment has been added');

        if (postUserId !== this.user._id) {
          this.notificationService.addNotification(
            postUserId,
            postUserNickname,
            `${nickname} commented your post`,
            'Click to see details',
            '/posts',
            'account_box',
            false
          ).subscribe(
            (result) => null,
            (error) => console.error(error),
            () => this.notificationService.newPostComment(nickname, postUserNickname).subscribe()
          );
        }


        const givenCommentsCount = this.user.givenComments + 1;
        this.subscriptions$.push(this.userService.editUserData(this.user._id, { givenComments: givenCommentsCount })
        .pipe(
          timeout(10000)
        )
        .subscribe(
          (result) => null,
          (error) => console.error(error),
          () => {
            // Update local user data
            this.user.givenComments = givenCommentsCount;
            localStorage.setItem('user', JSON.stringify(this.user));
            this.userService.updateUserValue();
          }
        ));
      }
    ));
  }

  deleteComment(postId, commentId, index) {
    this.displayLoader = true;

    this.subscriptions$.push(this.postService.deleteComment(postId, commentId)
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (result) => null,
      (error) => console.error(error),
      () => {
        this.loadComments(postId, index);
        this.displayNotify('Comment has been deleted');

        const givenCommentsCount = this.user.givenComments - 1;
        this.subscriptions$.push(this.userService.editUserData(this.user._id, { givenComments: givenCommentsCount })
        .pipe(
          timeout(10000)
        )
        .subscribe(
          (result) => null,
          (error) => console.error(error),
          () => {
            // Update local user data
            this.user.givenComments = givenCommentsCount;
            localStorage.setItem('user', JSON.stringify(this.user));
            this.userService.updateUserValue();
          }
        ));
      }
    ));
  }

  deletePost(postId: string) {
    this.displayLoader = true;

    this.subscriptions$.push(this.postService.deletePost(postId)
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (data) => null,
      (error) => console.error(error),
      () => {
        this.loadPosts();
        this.displayNotify('Post has been deleted');
      }
    ));
  }

  displayNotify(message: string) {
    this.snackbar.open(message, null, { duration: 1000 });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((x: Subscription) => x.unsubscribe());
  }

}
