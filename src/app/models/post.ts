interface Comment {
  _id: string;
  userId: string;
  content: string;
  nickname: string;
  date: string;
}

export interface Post {
  _id: string;
  userId: string;
  nickname: string;
  title: string;
  content: string;
  comments: Array<Comment>;
  date: string;
}
