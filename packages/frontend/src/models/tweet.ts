export type Tweet = {
  tokenId: number;
  content: string;
  author: string;
  timestamp: number;
  attachment: string;
  likes: string[]; // array of user addresses
  retweets: string[]; // array of user addresses
  iconUrl: string;
  retweetedBy: string;
};
