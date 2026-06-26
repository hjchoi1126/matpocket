export type Place = {
  id: number;
  user_id: string | null;
  place_name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  memo: string | null;
  tags: string[];
  link_url: string | null;
  is_public: boolean;
  visited: boolean;
  receipt_verified: boolean;
  receipt_verified_at: string | null;
  folder_id: number | null;
  created_at: string;
};

export type NearbyPlace = Place & {
  distance_km: number;
};

export type PlaceFormData = {
  place_name: string;
  address: string;
  latitude: string;
  longitude: string;
  category: string;
  memo: string;
  tags: string[];
  link_url: string;
  folder_id: number | null;
};

export type ScrapeResult = {
  place_name: string;
  address: string;
  category: string;
  link_url: string;
};
