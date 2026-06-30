import { CreateSupabaseClient } from "@/lib/supabaseClient";

/**
 * 공동 폴더 달력 실시간 구독.
 * Vercel 서버리스 환경에서는 Socket.io 대신 Supabase Realtime(Postgres 변경 구독)을 사용합니다.
 */
export function SubscribeCalendarRealtimeLogic1(
  folderIds: number[],
  onChange: () => void,
): () => void {
  const uniqueFolderIds = [...new Set(folderIds)].filter((id) => id > 0);

  if (uniqueFolderIds.length === 0) {
    return () => {};
  }

  const supabase = CreateSupabaseClient();
  const channelName = `calendar-folders-${uniqueFolderIds.sort((a, b) => a - b).join("-")}`;

  let channel = supabase.channel(channelName);

  for (const folderId of uniqueFolderIds) {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calendar_events",
        filter: `folder_id=eq.${folderId}`,
      },
      () => onChange(),
    );
  }

  channel = channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "calendar_event_rsvps",
    },
    () => onChange(),
  );

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
