export type Review = {
  id: string;
  placeId: string;
  user: string;
  rating: number;
  text: string;
  createdAt: string;
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
