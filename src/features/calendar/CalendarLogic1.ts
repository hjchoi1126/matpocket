import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalNickname } from "@/lib/nickname";
import { GetLocalUserId } from "@/lib/userId";
import { GetMemberFolderIdsLogic1 } from "@/features/folders/SharedFolderLogic1";
import type {
  CalendarEvent,
  CalendarEventRsvp,
  CalendarFolderFilter,
  CreateCalendarEventInput,
  RsvpStatus,
} from "@/types/calendar";
import type { Place } from "@/types/place";

type CalendarEventRow = CalendarEvent & {
  places?: Place | Place[] | null;
  folders?: { name: string } | { name: string }[] | null;
};

function NormalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function NormalizeCalendarEvent(row: CalendarEventRow): CalendarEvent {
  const place = NormalizeRelation(row.places);
  const folder = NormalizeRelation(row.folders);

  return {
    id: row.id,
    folder_id: row.folder_id,
    place_id: row.place_id,
    created_by: row.created_by,
    title: row.title,
    memo: row.memo,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    created_at: row.created_at,
    place: place ?? undefined,
    folder_name: folder?.name,
  };
}

function FormatCalendarError(
  prefix: string,
  error: { message: string; code?: string },
): string {
  const message = error.message.toLowerCase();

  if (
    message.includes("calendar_events") ||
    message.includes("calendar_event_rsvps") ||
    message.includes("relation") ||
    error.code === "PGRST204"
  ) {
    return "DB 설정이 필요합니다. Supabase SQL Editor에서 014_calendar_events.sql을 실행해 주세요.";
  }

  return `${prefix}: ${error.message}`;
}

async function AttachRsvpsLogic1(
  events: CalendarEvent[],
  userId: string,
): Promise<CalendarEvent[]> {
  if (events.length === 0) {
    return events;
  }

  const supabase = CreateSupabaseClient();
  const eventIds = events.map((event) => event.id);

  const { data, error } = await supabase
    .from("calendar_event_rsvps")
    .select("*")
    .in("event_id", eventIds);

  if (error || !data) {
    return events;
  }

  const rsvpMap = new Map<number, CalendarEventRsvp[]>();

  for (const row of data as CalendarEventRsvp[]) {
    const current = rsvpMap.get(row.event_id) ?? [];
    current.push(row);
    rsvpMap.set(row.event_id, current);
  }

  return events.map((event) => {
    const rsvps = rsvpMap.get(event.id) ?? [];
    const myRsvp = rsvps.find((rsvp) => rsvp.user_id === userId)?.status ?? null;

    return {
      ...event,
      rsvps,
      my_rsvp: myRsvp,
    };
  });
}

export async function LoadCalendarEventsLogic1(
  folderFilter: CalendarFolderFilter,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<{ events: CalendarEvent[]; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    if (!userId) {
      return { events: [] };
    }

    const memberFolderIds = await GetMemberFolderIdsLogic1(userId);
    const rangeStartIso = rangeStart.toISOString();
    const rangeEndIso = rangeEnd.toISOString();

    let query = supabase
      .from("calendar_events")
      .select("*, places(*), folders(name)")
      .gte("starts_at", rangeStartIso)
      .lte("starts_at", rangeEndIso)
      .order("starts_at", { ascending: true });

    if (folderFilter === "personal") {
      query = query.is("folder_id", null).eq("created_by", userId);
    } else if (typeof folderFilter === "number") {
      query = query.eq("folder_id", folderFilter);
    }

    const { data, error } = await query;

    if (error) {
      return {
        events: [],
        error: FormatCalendarError("일정을 불러오지 못했습니다", error),
      };
    }

    let rows = (data ?? []) as CalendarEventRow[];

    if (folderFilter === "all") {
      const memberFolderIdSet = new Set(memberFolderIds);
      rows = rows.filter(
        (row) =>
          (row.folder_id == null && row.created_by === userId) ||
          (row.folder_id != null && memberFolderIdSet.has(row.folder_id)),
      );
    }

    const events = rows.map((row) => NormalizeCalendarEvent(row));

    const eventsWithRsvps = await AttachRsvpsLogic1(events, userId);
    return { events: eventsWithRsvps };
  } catch {
    return { events: [], error: "Supabase 연결에 실패했습니다." };
  }
}

export async function CreateCalendarEventLogic1(
  input: CreateCalendarEventInput,
): Promise<{ event?: CalendarEvent; error?: string }> {
  const title = input.title.trim();

  if (!title) {
    return { error: "일정 제목을 입력해 주세요." };
  }

  if (!input.starts_at) {
    return { error: "약속 날짜와 시간을 선택해 주세요." };
  }

  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    if (!userId) {
      return { error: "사용자 정보를 확인할 수 없습니다." };
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        folder_id: input.folder_id,
        place_id: input.place_id,
        created_by: userId,
        title,
        memo: input.memo?.trim() || null,
        starts_at: input.starts_at,
      })
      .select("*, places(*), folders(name)")
      .single();

    if (error || !data) {
      return {
        error: FormatCalendarError("일정 등록에 실패했습니다", error ?? {
          message: "unknown",
        }),
      };
    }

    const event = NormalizeCalendarEvent(data as CalendarEventRow);

    await supabase.from("calendar_event_rsvps").insert({
      event_id: event.id,
      user_id: userId,
      display_name: GetLocalNickname(),
      status: "going",
    });

    return { event };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function DeleteCalendarEventLogic1(
  eventId: number,
): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      return { error: "일정 삭제에 실패했습니다." };
    }

    return {};
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function SetEventRsvpLogic1(
  eventId: number,
  status: RsvpStatus,
): Promise<{ rsvp?: CalendarEventRsvp; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    if (!userId) {
      return { error: "사용자 정보를 확인할 수 없습니다." };
    }

    const { data, error } = await supabase
      .from("calendar_event_rsvps")
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
          display_name: GetLocalNickname(),
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id,user_id" },
      )
      .select()
      .single();

    if (error || !data) {
      return { error: "참석 여부 저장에 실패했습니다." };
    }

    return { rsvp: data as CalendarEventRsvp };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export function CountRsvpsLogic1(
  rsvps: CalendarEventRsvp[] = [],
): { going: number; notGoing: number; maybe: number } {
  return rsvps.reduce(
    (counts, rsvp) => {
      if (rsvp.status === "going") counts.going += 1;
      if (rsvp.status === "not_going") counts.notGoing += 1;
      if (rsvp.status === "maybe") counts.maybe += 1;
      return counts;
    },
    { going: 0, notGoing: 0, maybe: 0 },
  );
}
