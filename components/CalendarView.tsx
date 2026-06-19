export type CalendarDayStatus = "good" | "warn" | "danger";

export type CalendarDayData = {
  date: string;
  status?: CalendarDayStatus;
};

type CalendarViewProps = {
  monthDate: Date;
  selectedDate: string;
  dayData: Record<string, CalendarDayData>;
  onSelectDate?: (date: string) => void;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarDays(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstGridDate = new Date(firstOfMonth);
  const mondayBasedOffset = (firstOfMonth.getDay() + 6) % 7;
  firstGridDate.setDate(firstOfMonth.getDate() - mondayBasedOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);

    return {
      day: date.getDate(),
      dateKey: toDateKey(date),
      isOutsideMonth: date.getMonth() !== monthDate.getMonth(),
    };
  });
}

export function CalendarView({ monthDate, selectedDate, dayData, onSelectDate }: CalendarViewProps) {
  const calendarDays = buildCalendarDays(monthDate);

  return (
    <div className="calendar-grid" aria-label="Practice calendar">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <span key={day}>{day}</span>
      ))}
      {calendarDays.map((day) => {
        const status = dayData[day.dateKey]?.status;
        const className = [day.isOutsideMonth ? "muted" : "", status ?? "", day.dateKey === selectedDate ? "selected" : ""]
          .filter(Boolean)
          .join(" ");

        return (
          <button className={className} key={day.dateKey} onClick={() => onSelectDate?.(day.dateKey)} type="button">
            {day.day}
          </button>
        );
      })}
    </div>
  );
}
