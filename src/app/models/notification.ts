export interface Notification {
  _id: string;
  userId: string;
  nickname: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  unreaded: boolean;
  informative: boolean;
  date: string;
}
