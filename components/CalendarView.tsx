type CalendarViewProps = {
  selectedDay?: number;
};

const calendarDays = [
  { day: 27, tone: "muted" },
  { day: 28, tone: "muted" },
  { day: 29, tone: "muted" },
  { day: 30, tone: "muted" },
  { day: 1, tone: "good" },
  { day: 2, tone: "warn" },
  { day: 3, tone: "good" },
  { day: 4 },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23 },
  { day: 24 },
];

export function CalendarView({ selectedDay = 3 }: CalendarViewProps) {
  return (
    <div className="calendar-grid" aria-label="Practice calendar">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <span key={day}>{day}</span>
      ))}
      {calendarDays.map((day) => (
        <button className={`${day.tone ?? ""}${day.day === selectedDay ? " selected" : ""}`} key={day.day} type="button">
          {day.day}
        </button>
      ))}
    </div>
  );
}
