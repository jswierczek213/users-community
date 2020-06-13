import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { finalize, timeout, map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private postService: PostService,
    private userService: UserService,
    private fb: FormBuilder
  ) { }

  user: User;

  posts: Post[] = [];
  commentContainers = [];

  postForm: FormGroup;

  displayLoader = false;
  displayErrors = false;

  ngOnInit() {
    this.loadPosts();

    this.user = this.userService.currentUserValue();

    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(600)]]
    });
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
      () => this.generateIndexBooleans()
    );
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
      }
    );
  }

  addComment(postId, userId, content, nickname, index) {

    if ((content.length <= 2) || (content.length > 255)) {
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
      () => this.loadComments(postId, index)
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
      () => this.loadComments(postId, index)
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
      () => this.loadPosts()
    );
  }

}
