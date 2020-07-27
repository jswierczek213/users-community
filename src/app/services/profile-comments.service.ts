import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileCommentsService {

  constructor(private http: HttpClient) { }

  // REST API server
  basicUrl = 'https://users-community.herokuapp.com/api';

  // Get comment from user's profile
  getComments(nickname: string) {
    return this.http.get(`${this.basicUrl}/user/${nickname}/comments`);
  }

  // Add comment to user's profile
  addComment(targetNickname: string, userId: string, content: string, nickname: string) {
    return this.http.patch(
      `${this.basicUrl}/user/${targetNickname}/comments`,
      { userId, nickname, content }
    );
  }

  // Delete comment from user's profile
  deleteComment(targetNickname: string, commentId: string) {
    return this.http.delete(`${this.basicUrl}/user/${targetNickname}/comments/${commentId}`);
  }
}
