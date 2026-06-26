export type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance?: string;
};

export type SavedRestaurant = {
  id: string;
  kakao_place_id: string;
  name: string;
  address: string | null;
  road_address: string | null;
  phone: string | null;
  category: string | null;
  lat: number;
  lng: number;
  place_url: string | null;
  memo: string | null;
  created_at: string;
};

export type GeoPosition = {
  lat: number;
  lng: number;
};
