export type Review = {
  id: number;
  placeId: number;
  user: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type Place = {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  tags: string[];
};
