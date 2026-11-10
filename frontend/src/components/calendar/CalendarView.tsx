import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, DateClickArg } from "@fullcalendar/core";

interface CalendarViewProps {
  events: EventInput[];
  onDateClick: (info: DateClickArg) => void;
}

export default function CalendarView({
  events,
  onDateClick,
}: CalendarViewProps) {
  return (
    <div className="content-card calendar-card">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={onDateClick}
        editable={true}
        selectable={true}
        height="auto"
      />
    </div>
  );
}