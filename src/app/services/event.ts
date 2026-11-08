import { Injectable } from '@angular/core';

export interface SchoolEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  status: 'Open' | 'Closed';
}

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly storageKey = 'school_attendance_events';

  private defaultEvents: SchoolEvent[] = [
    {
      id: 1,
      title: 'IT Week 2026',
      description: 'Information Technology Week activities and programs.',
      date: '2026-11-05',
      time: '8:00 AM - 5:00 PM',
      venue: 'USTP Villanueva Campus',
      status: 'Open'
    },
    {
      id: 2,
      title: 'Student Orientation',
      description: 'Student orientation and academic information session.',
      date: '2026-11-10',
      time: '9:00 AM - 12:00 PM',
      venue: 'University Gymnasium',
      status: 'Open'
    },
    {
      id: 3,
      title: 'Technology Seminar',
      description: 'Seminar about emerging technologies and IT careers.',
      date: '2026-11-15',
      time: '1:00 PM - 4:00 PM',
      venue: 'Audio Visual Room',
      status: 'Open'
    }
  ];

  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      this.saveEvents(this.defaultEvents);
    }
  }

  getEvents(): SchoolEvent[] {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return [...this.defaultEvents];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [...this.defaultEvents];
    }
  }

  getEventById(id: number): SchoolEvent | undefined {
    return this.getEvents().find(event => event.id === id);
  }

  addEvent(event: SchoolEvent): void {
    const events = this.getEvents();

    const newId =
      events.length > 0
        ? Math.max(...events.map(item => item.id)) + 1
        : 1;

    events.push({
      ...event,
      id: newId
    });

    this.saveEvents(events);
  }

  updateEvent(updatedEvent: SchoolEvent): void {
    const events = this.getEvents().map(event =>
      event.id === updatedEvent.id
        ? updatedEvent
        : event
    );

    this.saveEvents(events);
  }

  deleteEvent(id: number): void {
    const events = this.getEvents().filter(
      event => event.id !== id
    );

    this.saveEvents(events);
  }

  private saveEvents(events: SchoolEvent[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(events)
    );
  }
}


export { EventService as Event };
