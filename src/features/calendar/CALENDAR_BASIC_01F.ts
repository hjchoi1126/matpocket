"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CreateCalendarEventLogic1,
  DeleteCalendarEventLogic1,
  LoadCalendarEventsLogic1,
  SetEventRsvpLogic1,
} from "@/features/calendar/CalendarLogic1";
import { SubscribeCalendarRealtimeLogic1 } from "@/features/calendar/CalendarRealtimeLogic1";
import {
  FormatDateKeyLogic1,
  IsSameDayLogic1,
} from "@/features/calendar/CalendarGridLogic1";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import type {
  CalendarEvent,
  CalendarFolderFilter,
  RsvpStatus,
} from "@/types/calendar";
import type { Folder } from "@/types/folder";
import type { Place } from "@/types/place";

export function useCalendarBasic01F() {
  const pathname = usePathname();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [folderFilter, setFolderFilter] = useState<CalendarFolderFilter>("all");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [rsvpingEventId, setRsvpingEventId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sharedFolders = useMemo(
    () => folders.filter((folder) => folder.is_shared),
    [folders],
  );

  const sharedFolderIds = useMemo(
    () => new Set(sharedFolders.map((folder) => folder.id)),
    [sharedFolders],
  );

  const selectablePlaces = useMemo(() => {
    if (folderFilter === "personal") {
      return places.filter(
        (place) =>
          place.folder_id == null || !sharedFolderIds.has(place.folder_id),
      );
    }

    if (typeof folderFilter === "number") {
      return places.filter((place) => place.folder_id === folderFilter);
    }

    return places;
  }, [places, folderFilter, sharedFolderIds]);

  const monthRange = useMemo(() => {
    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }, [viewYear, viewMonth]);

  const LoadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }

    setErrorMessage(null);

    const [eventsResult, placesResult, foldersResult] = await Promise.all([
      LoadCalendarEventsLogic1(folderFilter, monthRange.start, monthRange.end),
      LoadPlacesLogic1(),
      LoadFoldersLogic1(),
    ]);

    setEvents(eventsResult.events);
    setPlaces(placesResult.places);
    setFolders(foldersResult.folders);
    setErrorMessage(eventsResult.error ?? placesResult.error ?? null);
    setIsLoading(false);
  }, [folderFilter, monthRange.end, monthRange.start]);

  useEffect(() => {
    void LoadData();
  }, [LoadData, pathname]);

  useEffect(() => {
    let folderIds: number[] = [];

    if (typeof folderFilter === "number") {
      folderIds = [folderFilter];
    } else if (folderFilter === "all") {
      folderIds = sharedFolders.map((folder) => folder.id);
    }

    if (folderIds.length === 0) {
      return;
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const HandleRealtimeChange = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        void LoadData({ silent: true });
      }, 300);
    };

    const unsubscribe = SubscribeCalendarRealtimeLogic1(
      folderIds,
      HandleRealtimeChange,
    );

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      unsubscribe();
    };
  }, [folderFilter, sharedFolders, LoadData]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const key = FormatDateKeyLogic1(new Date(event.starts_at));
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    });

    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(FormatDateKeyLogic1(selectedDate)) ?? [];
  }, [eventsByDate, selectedDate]);

  const HandlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((year) => year - 1);
      setViewMonth(11);
      return;
    }

    setViewMonth((month) => month - 1);
  };

  const HandleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((year) => year + 1);
      setViewMonth(0);
      return;
    }

    setViewMonth((month) => month + 1);
  };

  const HandleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setStatusMessage(null);
  };

  const HandleCreateEvent = async (input: {
    place_id: number;
    title: string;
    memo: string;
    starts_at: string;
  }) => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const folderId = typeof folderFilter === "number" ? folderFilter : null;

    const result = await CreateCalendarEventLogic1({
      folder_id: folderId,
      place_id: input.place_id,
      title: input.title,
      memo: input.memo,
      starts_at: input.starts_at,
    });

    setIsSaving(false);

    if (result.error || !result.event) {
      setErrorMessage(result.error ?? "일정 등록에 실패했습니다.");
      return;
    }

    setIsSheetOpen(false);
    setStatusMessage(`"${result.event.title}" 일정을 등록했습니다.`);
    await LoadData();
  };

  const HandleDeleteEvent = async (event: CalendarEvent) => {
    const confirmed = window.confirm(`"${event.title}" 일정을 삭제할까요?`);

    if (!confirmed) {
      return;
    }

    setDeletingEventId(event.id);
    setErrorMessage(null);

    const result = await DeleteCalendarEventLogic1(event.id);
    setDeletingEventId(null);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setEvents((prev) => prev.filter((item) => item.id !== event.id));
    setStatusMessage("일정을 삭제했습니다.");
  };

  const HandleSetRsvp = async (eventId: number, status: RsvpStatus) => {
    setRsvpingEventId(eventId);
    setErrorMessage(null);

    const result = await SetEventRsvpLogic1(eventId, status);
    setRsvpingEventId(null);

    if (result.error || !result.rsvp) {
      setErrorMessage(result.error ?? "참석 여부 저장에 실패했습니다.");
      return;
    }

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const otherRsvps = (event.rsvps ?? []).filter(
          (rsvp) => rsvp.user_id !== result.rsvp!.user_id,
        );

        return {
          ...event,
          my_rsvp: status,
          rsvps: [...otherRsvps, result.rsvp!],
        };
      }),
    );
  };

  const OpenCreateSheet = () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSheetOpen(true);
  };

  return {
    viewYear,
    viewMonth,
    selectedDate,
    folderFilter,
    setFolderFilter,
    sharedFolders,
    selectablePlaces,
    eventsByDate,
    selectedDateEvents,
    isLoading,
    isSaving,
    isSheetOpen,
    setIsSheetOpen,
    deletingEventId,
    rsvpingEventId,
    errorMessage,
    statusMessage,
    HandlePrevMonth,
    HandleNextMonth,
    HandleSelectDate,
    HandleCreateEvent,
    HandleDeleteEvent,
    HandleSetRsvp,
    OpenCreateSheet,
    IsSameDayLogic1,
  };
}
