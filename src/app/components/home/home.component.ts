import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { finalize, timeout, map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private postService: PostService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) { }

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
      this.userService.getUserById(this.user._id)
      .pipe(
        timeout(10000)
      )
      .subscribe(
        (result) => this.user = result,
        (error) => console.error(error),
        () => {
          localStorage.setItem('user', JSON.stringify(this.user));
          this.userService.updateUserValue();
        }
      );
    }
  }

  loadPosts() {
    this.displayLoader = true;

    this.postService.getPosts()
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (posts) => this.posts = posts,
      (error) => console.error(error),
      () => {
        this.generateIndexBooleans();
        this.posts
        .sort((x: Post, y: Post) => new Date(y.date).getTime() - new Date(x.date).getTime());
      }
    );
  }

  loadLikes(postId: string, postIndex: number) {
    this.postService.getLikes(postId)
    .pipe(
      map((data: any) => data[0].likes),
      timeout(10000)
    )
    .subscribe(likes => this.posts[postIndex].likes = likes);
  }

  loadComments(postId: string, postIndex: number) {
    this.postService.getComments(postId)
    .pipe(
      map((data: any) => data[0].comments),
      timeout(10000)
    )
    .subscribe(comments => this.posts[postIndex].comments = comments);
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

    this.postService.createPost(this.user._id, this.user.nickname, title, content)
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
    );
  }

  toggleLike(postId, postIndex) {
    if (!this.user) {
      return this.displayNotify('You need to log in!');
    }

    if (this.posts[postIndex].likes.find((like: any) => like.nickname === this.user.nickname)) {

      if (this.isClicked) {
        return;
      }

      this.isClicked = true;

      this.postService.unlike(postId, this.user.nickname)
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
      );
    } else {

      if (this.isClicked) {
        return;
      }

      this.isClicked = true;

      this.postService.like(postId, this.user._id, this.user.nickname)
      .pipe(
        timeout(10000)
      )
      .subscribe(
        (result) => null,
        (error) => console.error(error),
        () => {
          this.loadLikes(postId, postIndex);

          const givenLikesCount = this.user.givenLikes + 1;
          this.userService.editUserData(this.user._id, { givenLikes: givenLikesCount })
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
          );
        }
      );
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

  addComment(postId, userId, content, nickname, index) {

    if ((content.length <= 1) || (content.length > 255)) {
      return;
    }

    this.displayLoader = true;

    this.postService.addComment(postId, userId, content, nickname)
    .pipe(
      finalize(() => this.displayLoader = false),
      timeout(10000)
    )
    .subscribe(
      (data) => console.log(data),
      (error) => console.error(error),
      () => {
        this.loadComments(postId, index);
        this.displayNotify('Comment has been added');

        const givenCommentsCount = this.user.givenComments + 1;
        this.userService.editUserData(this.user._id, { givenComments: givenCommentsCount })
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
        );
      }
    );
  }

  deleteComment(postId, commentId, index) {
    this.displayLoader = true;

    this.postService.deleteComment(postId, commentId)
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
        this.userService.editUserData(this.user._id, { givenComments: givenCommentsCount })
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
        );
      }
    );
  }

  deletePost(postId: string) {
    this.displayLoader = true;

    this.postService.deletePost(postId)
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
    );
  }

  displayNotify(message: string) {
    this.snackbar.open(message, null, { duration: 1000 });
  }

}
