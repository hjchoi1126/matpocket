export type CalendarDayCell = {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function FormatDateKeyLogic1(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function IsSameDayLogic1(a: Date, b: Date): boolean {
  return FormatDateKeyLogic1(a) === FormatDateKeyLogic1(b);
}

export function BuildMonthGridLogic1(
  year: number,
  month: number,
): CalendarDayCell[] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );

    cells.push({
      date,
      dateKey: FormatDateKeyLogic1(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: IsSameDayLogic1(date, today),
    });
  }

  return cells;
}

export function FormatMonthLabelLogic1(year: number, month: number): string {
  return `${year}년 ${month + 1}월`;
}

export function GetDayLabelsLogic1(): string[] {
  return DAY_LABELS;
}

export function FormatEventTimeLogic1(isoDate: string): string {
  const date = new Date(isoDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function FormatSelectedDateLabelLogic1(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = DAY_LABELS[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}
