export type Review = {
  id: string;
  placeId: string;
  user: string;
  rating: number;
  text: string;
  createdAt: number;
};

export type Place = {
  id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  tags: string[];
};
