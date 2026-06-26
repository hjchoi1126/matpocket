export type VoteOption = {
  id: number;
  vote_room_id: string;
  place_id: number | null;
  place_name: string;
  place_address: string | null;
  category: string | null;
  vote_count: number;
};

export type VoteRoom = {
  id: string;
  title: string;
  creator_user_id: string | null;
  created_at: string;
  options: VoteOption[];
  total_votes: number;
  my_vote_option_id: number | null;
};
