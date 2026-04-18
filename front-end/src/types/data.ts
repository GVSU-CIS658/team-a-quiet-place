export type ApprovalStatus = "approved" | "pending" | "rejected";

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
  location: LocationType;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  tags: string[];
  approvalStatus: ApprovalStatus;
  createdByUid?: string;
  createdByName?: string;
  createdAt?: number;
};

export type Saves = {
  id: string;
  placeId: string;
  savedAt: number;
  user: string;
};
export type LocationType = "Valley" | "Pew" | "Health";
