"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import MainHeaderActions from "@/components/layout/MainHeaderActions";
import CALENDAR_EVENT_SHEET_01 from "@/features/calendar/CALENDAR_EVENT_SHEET_01";
import { useCalendarBasic01F } from "@/features/calendar/CALENDAR_BASIC_01F";
import {
  BuildMonthGridLogic1,
  FormatEventTimeLogic1,
  FormatMonthLabelLogic1,
  FormatSelectedDateLabelLogic1,
  GetDayLabelsLogic1,
} from "@/features/calendar/CalendarGridLogic1";
import { CountRsvpsLogic1 } from "@/features/calendar/CalendarLogic1";
import type { CalendarFolderFilter, RsvpStatus } from "@/types/calendar";

const RSVP_OPTIONS: Array<{ status: RsvpStatus; label: string }> = [
  { status: "going", label: "참석" },
  { status: "maybe", label: "보류" },
  { status: "not_going", label: "불참" },
];

export default function CALENDAR_BASIC_01() {
  const {
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
  } = useCalendarBasic01F();

  const monthCells = BuildMonthGridLogic1(viewYear, viewMonth);
  const dayLabels = GetDayLabelsLogic1();

  const folderOptions: Array<{ key: CalendarFolderFilter; label: string }> = [
    { key: "all", label: "전체" },
    { key: "personal", label: "개인" },
    ...sharedFolders.map((folder) => ({
      key: folder.id as CalendarFolderFilter,
      label: folder.name,
    })),
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <h1 className="truncate text-lg font-bold text-gray-900">달력</h1>
          </div>
          <MainHeaderActions />
        </div>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {folderOptions.map((item) => {
            const isActive = folderFilter === item.key;

            return (
              <button
                key={String(item.key)}
                type="button"
                onClick={() => setFolderFilter(item.key)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {typeof item.key === "number" && (
                  <Users className="h-3 w-3" aria-hidden />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={HandlePrevMonth}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-sm font-bold text-gray-900">
              {FormatMonthLabelLogic1(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              onClick={HandleNextMonth}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="다음 달"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {dayLabels.map((label, index) => (
              <div
                key={label}
                className={`py-1 text-center text-[11px] font-medium ${
                  index === 0
                    ? "text-red-500"
                    : index === 6
                      ? "text-blue-500"
                      : "text-gray-400"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((cell) => {
              const dayEvents = eventsByDate.get(cell.dateKey) ?? [];
              const isSelected = IsSameDayLogic1(cell.date, selectedDate);

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => HandleSelectDate(cell.date)}
                  className={`flex min-h-11 flex-col items-center justify-center rounded-xl py-1 text-sm transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : cell.isToday
                        ? "bg-primary/10 text-primary"
                        : cell.isCurrentMonth
                          ? "text-gray-800 hover:bg-gray-50"
                          : "text-gray-300"
                  }`}
                >
                  <span className="font-medium">{cell.date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-primary"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-900">
              {FormatSelectedDateLabelLogic1(selectedDate)}
            </h2>
            <button
              type="button"
              onClick={OpenCreateSheet}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              약속 추가
            </button>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">불러오는 중...</p>
          ) : selectedDateEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-gray-200" aria-hidden />
              <p className="mt-3 text-sm text-gray-500">이 날 등록된 약속이 없어요.</p>
              <button
                type="button"
                onClick={OpenCreateSheet}
                className="mt-3 text-xs font-semibold text-primary underline"
              >
                맛집 약속 등록하기
              </button>
            </div>
          ) : (
            <ul className="space-y-3 pb-4">
              {selectedDateEvents.map((event) => {
                const counts = CountRsvpsLogic1(event.rsvps);
                const place = event.place;

                return (
                  <li key={event.id}>
                    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-primary">
                            {FormatEventTimeLogic1(event.starts_at)}
                            {event.folder_name && (
                              <span className="ml-2 text-violet-600">
                                공동 · {event.folder_name}
                              </span>
                            )}
                          </p>
                          <h3 className="mt-1 font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          {place && (
                            <p className="mt-1 text-sm font-medium text-gray-700">
                              {place.place_name}
                            </p>
                          )}
                          {place?.address && (
                            <p className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span>{place.address}</span>
                            </p>
                          )}
                          {event.memo && (
                            <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                              {event.memo}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={deletingEventId === event.id}
                          onClick={() => void HandleDeleteEvent(event)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label="일정 삭제"
                        >
                          {deletingEventId === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </div>

                      {event.folder_id && (
                        <div className="mt-3">
                          <p className="mb-2 text-[11px] font-medium text-gray-500">
                            참석 {counts.going} · 보류 {counts.maybe} · 불참{" "}
                            {counts.notGoing}
                          </p>
                          <div className="flex gap-2">
                            {RSVP_OPTIONS.map((option) => {
                              const isActive = event.my_rsvp === option.status;

                              return (
                                <button
                                  key={option.status}
                                  type="button"
                                  disabled={rsvpingEventId === event.id}
                                  onClick={() =>
                                    void HandleSetRsvp(event.id, option.status)
                                  }
                                  className={`flex-1 rounded-full px-2 py-1.5 text-xs font-semibold ${
                                    isActive
                                      ? "bg-primary text-white"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {place && (
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/places/${place.id}`}
                            className="inline-flex flex-1 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary"
                          >
                            상세 보기
                          </Link>
                          {place.latitude != null && place.longitude != null && (
                            <a
                              href={`https://map.kakao.com/link/map/${encodeURIComponent(place.place_name)},${place.latitude},${place.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
                            >
                              길찾기
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {statusMessage && (
          <p className="mb-3 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </main>

      <CALENDAR_EVENT_SHEET_01
        isOpen={isSheetOpen}
        selectedDate={selectedDate}
        places={selectablePlaces}
        isSaving={isSaving}
        errorMessage={errorMessage}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={(input) => void HandleCreateEvent(input)}
      />
    </div>
  );
}
