// Moderation state for places. Public browsing only shows approved places,
// while admin screens can also work with pending and rejected places.
export type ApprovalStatus = "approved" | "pending" | "rejected";

// Campus area values used by places and location filters.
export type LocationType = "Valley" | "Pew" | "Health";

// Shared filters for place lists. A null value means "do not filter by this".
export type PlaceFilters = {
  location: LocationType | null;
  rating: number | null;
};

// Review document shown under a place and created through the review form.
export type Review = {
  id: string;
  placeId: string;
  user: string;
  rating: number;
  text: string;
  createdAt: number;
};

// Place document used by cards, saved places, filters, and admin moderation.
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

// Saved-place document that connects one user to one saved place.
export type Saves = {
  id: string;
  placeId: string;
  savedAt: number;
  user: string;
};
