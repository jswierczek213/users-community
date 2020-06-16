import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private http: HttpClient
  ) {}

  basicUrl = 'https://users-community.herokuapp.com/api';

  // Get all posts
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.basicUrl}/posts`);
  }

  // Get all comments
  getComments(postId: string) {
    return this.http.get(`${this.basicUrl}/posts/${postId}/comments`);
  }

  // Get all likes
  getLikes(postId: string) {
    return this.http.get(`${this.basicUrl}/posts/${postId}/likes`);
  }

  // Create post
  createPost(userId: string, nickname: string, title: string, content: string) {

    // Ignore empty lines
    content = content.replace(/\n(?=\n)/g, '').trim();

    return this.http.post(`${this.basicUrl}/posts`, { _id: userId, nickname, title, content });
  }

  // Like the post
  like(postId: string, userId: string, nickname: string) {
    const value = { userId, nickname };
    return this.http.patch(`${this.basicUrl}/posts/${postId}`, value);
  }

  // Unlike the post
  unlike(postId: string, nickname: string) {
    return this.http.delete(`${this.basicUrl}/posts/${postId}/${nickname}`);
  }

  // Add comment to post
  addComment(postId: string, userId: string, content: string, nickname: string) {
    return this.http.patch(
      `${this.basicUrl}/posts/${postId}`,
      { userId, content, nickname }
    );
  }

  // Delete comment
  deleteComment(postId: string, commentId: string) {
    return this.http.delete(
      `${this.basicUrl}/comments/${postId}/${commentId}`
    );
  }

  // Delete post
  deletePost(postId: string) {
    return this.http.delete(`${this.basicUrl}/posts/${postId}`);
  }

}
