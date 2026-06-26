import SHARED_FOLDER_JOIN_01 from "@/features/shared-folder/SHARED_FOLDER_JOIN_01";

type SharedFolderJoinPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedFolderJoinPage({
  params,
}: SharedFolderJoinPageProps) {
  const { token } = await params;

  return <SHARED_FOLDER_JOIN_01 inviteToken={token} />;
}
