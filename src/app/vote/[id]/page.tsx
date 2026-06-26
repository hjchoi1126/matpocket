import VOTE_BASIC_01 from "@/features/vote/VOTE_BASIC_01";

type VotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function VotePage({ params }: VotePageProps) {
  const { id } = await params;
  return <VOTE_BASIC_01 voteRoomId={id} />;
}
