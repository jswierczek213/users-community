interface Like {
  _id: string;
  userId: string;
  nickname: string;
}

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
  likes: Array<Like>;
  comments: Array<Comment>;
  date: string;
}
