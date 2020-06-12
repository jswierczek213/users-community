import { Component, OnInit } from '@angular/core';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { finalize, map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private postService: PostService,
    private userService: UserService
  ) { }

  posts: Post[] = [];
  commentContainers = [];

  displayLoader = false;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.displayLoader = true;

    this.postService.getPosts()
    .pipe(
      finalize(() => this.displayLoader = false)
    )
    .subscribe(
      (posts) => this.posts = posts,
      (error) => console.error(error),
      () => this.generateIndexBooleans()
    );
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

}
