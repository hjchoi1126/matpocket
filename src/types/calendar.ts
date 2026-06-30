import type { Place } from "@/types/place";

export type RsvpStatus = "going" | "not_going" | "maybe";

export type CalendarEventRsvp = {
  id: number;
  event_id: number;
  user_id: string;
  display_name: string;
  status: RsvpStatus;
  updated_at: string;
};

export type CalendarEvent = {
  id: number;
  folder_id: number | null;
  place_id: number;
  created_by: string;
  title: string;
  memo: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  place?: Place;
  folder_name?: string;
  rsvps?: CalendarEventRsvp[];
  my_rsvp?: RsvpStatus | null;
};

export type CalendarFolderFilter = "personal" | "all" | number;

export type CreateCalendarEventInput = {
  folder_id: number | null;
  place_id: number;
  title: string;
  memo?: string;
  starts_at: string;
};
