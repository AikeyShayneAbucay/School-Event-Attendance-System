import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  EventService,
  SchoolEvent
} from '../../../services/event';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-staff-events',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  events: SchoolEvent[] = [];
  searchTerm = '';

  showForm = false;
  editingId: number | null = null;

  staffName = 'Staff / Event In-Charge';

  form: SchoolEvent = {
    id: 0,
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    status: 'Open'
  };

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaffInfo();
    this.loadEvents();
  }

  loadStaffInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.fullName) {
      this.staffName = user.fullName;
    }
  }

  loadEvents(): void {
    this.events = this.eventService.getEvents();
  }

  get filteredEvents(): SchoolEvent[] {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) {
      return this.events;
    }
    return this.events.filter(e =>
      e.title.toLowerCase().includes(search) ||
      e.venue.toLowerCase().includes(search) ||
      e.description.toLowerCase().includes(search) ||
      e.status.toLowerCase().includes(search)
    );
  }

  openAddForm(): void {
    this.editingId = null;
    this.form = {
      id: 0,
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '8:00 AM - 5:00 PM',
      venue: 'USTP Villanueva Campus',
      status: 'Open'
    };
    this.showForm = true;
  }

  editEvent(event: SchoolEvent): void {
    this.editingId = event.id;
    this.form = { ...event };
    this.showForm = true;
  }

  toggleStatus(event: SchoolEvent): void {
    const newStatus = event.status === 'Open' ? 'Closed' : 'Open';
    this.eventService.updateEvent({
      ...event,
      status: newStatus
    });
    this.loadEvents();
  }

  saveEvent(): void {
    if (
      !this.form.title.trim() ||
      !this.form.description.trim() ||
      !this.form.date ||
      !this.form.time ||
      !this.form.venue
    ) {
      alert('Please complete all event fields.');
      return;
    }

    if (this.editingId === null) {
      this.eventService.addEvent(this.form);
    } else {
      this.eventService.updateEvent(this.form);
    }

    this.closeForm();
    this.loadEvents();
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
